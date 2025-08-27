from fastapi import FastAPI, Depends, HTTPException, File, UploadFile, Response
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import os
import tempfile
import json
import traceback
from datetime import datetime
from io import BytesIO

from .sie_parser.sie_parse import SieParser
from . import crud, models, schemas, pdf_generator, k2_calculator, chart_of_accounts_data
from .database import SessionLocal, engine
import sys

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

origins = [
    "http://localhost:3000",
    "http://localhost:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def load_chart_of_accounts():
    return chart_of_accounts_data.CHART_OF_ACCOUNTS

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/api/annual-reports/upload-sie", response_model=schemas.FullCalculationPayload)
async def upload_sie_file(file: UploadFile = File(...), chart_of_accounts: dict = Depends(load_chart_of_accounts)):
    try:
        contents_bytes = await file.read()
        try:
            contents_lines = contents_bytes.decode('cp437').splitlines()
        except UnicodeDecodeError:
            contents_lines = contents_bytes.decode('utf-8', errors='ignore').splitlines()

        parser = SieParser(file_contents=contents_lines)
        parser.parse()
        sie_data = parser.result
        
        fnamn_fields = sie_data.get_data('#FNAMN')
        company_name = fnamn_fields[0].data[1] if fnamn_fields else "Okänt företag"
        orgnr_fields = sie_data.get_data('#ORGNR')
        org_nr = orgnr_fields[0].data[1] if orgnr_fields else "Okänt orgnr"
        
        rar_fields = sorted(sie_data.get_data('#RAR'), key=lambda x: x.data[3], reverse=True)
        current_year_data = rar_fields[0].data
        prev_year_data = rar_fields[1].data if len(rar_fields) > 1 else None

        current_year_id = current_year_data[1]
        prev_year_id = prev_year_data[1] if prev_year_data else None

        all_balance_fields = sie_data.get_data('#UB') + sie_data.get_data('#RES')
        
        current_accounts = []
        prev_accounts = []
        for field in all_balance_fields:
            year_id, acc_num_str, balance_str = field.data[1], field.data[2], field.data[3]
            acc_num = int(acc_num_str)
            account_name = chart_of_accounts.get(acc_num_str, {}).get("name", f"Okänt konto {acc_num_str}")
            balance = float(balance_str)

            if (2000 <= acc_num <= 2999) or \
               (3000 <= acc_num <= 3999) or \
               (8000 <= acc_num <= 8399):
                balance = -balance
            
            account_data = {"account_number": acc_num_str, "account_name": account_name, "balance": balance}

            if year_id == current_year_id:
                current_accounts.append(account_data)
            elif year_id == prev_year_id:
                prev_accounts.append(account_data)

        k2_results = k2_calculator.get_structured_k2_results(current_accounts, prev_accounts)

        return schemas.FullCalculationPayload(
            company_info=schemas.CompanyBase(name=company_name, org_nr=org_nr),
            report_dates={
                "start_date": datetime.strptime(current_year_data[2], '%Y%m%d').date(),
                "end_date": datetime.strptime(current_year_data[3], '%Y%m%d').date()
            },
            accounts_data=schemas.AccountsData(current_year=current_accounts, previous_year=prev_accounts),
            k2_results=k2_results
        )

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Internt serverfel i parse_sie_file: {str(e)}")


@app.post("/api/annual-reports/calculate", response_model=schemas.K2CalculatedResult)
async def calculate_report_from_accounts(accounts_data: schemas.AccountsData):
    try:
        current_year_dicts = [acc.model_dump() for acc in accounts_data.current_year]
        previous_year_dicts = [acc.model_dump() for acc in accounts_data.previous_year]
        
        structured_results = k2_calculator.get_structured_k2_results(current_year_dicts, previous_year_dicts)
        return structured_results
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Kunde inte beräkna rapport: {str(e)}")


@app.post("/api/annual-reports/preview-pdf")
async def preview_annual_report_from_details(report_data: schemas.DetailedReportPayload):
    try:
        current_year_dicts = [acc.model_dump() for acc in report_data.accounts_data.current_year]
        previous_year_dicts = [acc.model_dump() for acc in report_data.accounts_data.previous_year]
        k2_results = k2_calculator.get_structured_k2_results(current_year_dicts, previous_year_dicts)

        pdf_bytes = pdf_generator.create_annual_report_pdf(
            report_data=report_data, 
            k2_results=k2_results, 
            is_preview=True
        )
        return Response(content=pdf_bytes, media_type="application/pdf")
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Kunde inte generera förhandsgranskning: {e}")


@app.post("/api/annual-reports/from-details", response_model=schemas.AnnualReport)
async def save_report_from_details(report_data: schemas.DetailedReportPayload, db: Session = Depends(get_db)):
    try:
        db_company = crud.get_company_by_org_nr(db, org_nr=report_data.org_nr)
        if db_company is None:
            db_company = crud.create_company(db=db, company=schemas.CompanyCreate(
                name=report_data.company_name,
                org_nr=report_data.org_nr
            ))

        db_annual_report = crud.create_annual_report(db=db, report=report_data, company_id=db_company.id)
        
        return db_annual_report
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Kunde inte spara rapporten: {str(e)}")


@app.get("/api/annual-reports/{report_id}/preview")
async def preview_saved_report(report_id: int, db: Session = Depends(get_db)):
    db_report = crud.get_annual_report(db, report_id=report_id)
    if db_report is None:
        raise HTTPException(status_code=404, detail="Rapporten kunde inte hittas.")

    try:
        current_year_accounts = db_report.accounts_data.get('current_year', [])
        previous_year_accounts = db_report.accounts_data.get('previous_year', [])

        k2_results = k2_calculator.get_structured_k2_results(current_year_accounts, previous_year_accounts)

        pdf_bytes = pdf_generator.create_annual_report_pdf(
            report_data=db_report,
            k2_results=k2_results, 
            is_preview=True
        )
        
        return Response(content=pdf_bytes, media_type="application/pdf")

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Kunde inte generera förhandsgranskning: {str(e)}")


