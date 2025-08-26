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

# Importerar från din befintliga mapp 'sie_parser'
from .sie_parser.sie_parse import SieParser
from .sie_parser.accounting_data import SieData
from . import crud, models, schemas, pdf_generator, k2_calculator, chart_of_accounts_data
from .database import SessionLocal, engine

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

# Ta bort den gamla _parse_sie_to_details-funktionen helt.

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
        
        # --- NY LOGIK HÄR ---
        # 1. Extrahera rådata (liknande gamla _parse_sie_to_details)
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
            year_id, acc_num, balance_str = field.data[1], field.data[2], field.data[3]
            account_name = chart_of_accounts.get(acc_num, {}).get("name", f"Okänt konto {acc_num}")
            balance = float(balance_str)
            
            if year_id == current_year_id:
                current_accounts.append({"account_number": acc_num, "account_name": account_name, "balance": balance})
            elif year_id == prev_year_id:
                prev_accounts.append({"account_number": acc_num, "account_name": account_name, "balance": balance})

        # 2. Anropa den nya centraliserade kalkylatorn
        k2_results = k2_calculator.get_structured_k2_results(current_accounts, prev_accounts)

        # 3. Bygg och returnera det kompletta paketet
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
        print("--- EN EXCEPTION INTRÄFFADE ---")
        traceback.print_exc()
        print("-------------------------------")
        raise HTTPException(status_code=500, detail=f"Internt serverfel i parse_sie_file: {str(e)}")


# --- NY ENDPOINT FÖR BERÄKNINGAR ---
@app.post("/api/annual-reports/calculate", response_model=schemas.K2CalculatedResult)
async def calculate_report_from_accounts(accounts_data: schemas.AccountsData):
    """
    Tar emot råa konton och returnerar ett fullständigt beräknat och
    strukturerat K2-resultat.
    """
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
    """
    Genererar en PDF-förhandsgranskning direkt från detaljerad data
    utan att spara den i databasen.
    """
    try:
        # Skapa ett "falskt" rapportobjekt som liknar databasmodellen
        # så att pdf_generator kan använda det.
        class FakeCompany:
            def __init__(self, name, org_nr):
                self.name = name
                self.org_nr = org_nr

        class FakeReport:
            def __init__(self, data):
                self.company = FakeCompany(data.company_name, data.org_nr)
                self.start_date = data.start_date
                self.end_date = data.end_date
                # VIKTIGT: Se till att accounts_data är en dict, inte en Pydantic-modell
                self.accounts_data = data.accounts_data.model_dump() 
                self.forvaltningsberattelse = data.forvaltningsberattelse
                self.signature_city = data.signature_city
                self.signature_date = data.signature_date
                # VIKTIGT: Konvertera representanter till en lista av dicts
                self.representatives = [rep.model_dump() for rep in data.representatives]

        fake_report_obj = FakeReport(report_data)

        pdf_bytes = pdf_generator.create_annual_report_pdf(fake_report_obj, is_preview=True)
        return Response(content=pdf_bytes, media_type="application/pdf")
    except Exception as e:
        # Logga felet för felsökning
        print(f"Error generating PDF preview from details: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Kunde inte generera förhandsgranskning: {e}"
        )

# --- SLUT PÅ UPPDATERING ---


@app.post("/api/annual-reports/generate-pdf")
async def generate_annual_report(report_data: schemas.DetailedReportPayload, db: Session = Depends(get_db)):
    db_company = crud.get_company(db, company_id=report_data.company_id)
    if db_company is None:
        db_company = crud.create_company(db=db, company=schemas.CompanyCreate(
            name=report_data.company_name,
            org_nr=report_data.org_nr
        ))

    db_annual_report = crud.create_annual_report(db=db, annual_report=report_data, company_id=db_company.id)

    accounts_data = [acc.model_dump() for acc in report_data.accounts]
    representatives_data = [rep.model_dump() for rep in report_data.representatives]

    k2_results = k2_calculator.calculate_k2_values(accounts_data)

    pdf_buffer = pdf_generator.create_annual_report_pdf(
        company_name=report_data.company_name, org_nr=report_data.org_nr,
        start_date=report_data.start_date, end_date=report_data.end_date,
        accounts_data=accounts_data, prev_accounts_data=[acc.model_dump() for acc in report_data.prev_accounts],
        forvaltningsberattelse=report_data.forvaltningsberattelse,
        signature_city=report_data.signature_city, signature_date=report_data.signature_date,
        representatives_data=representatives_data, k2_results=k2_results
    )
    
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        tmp.write(pdf_buffer.getvalue())
        return FileResponse(tmp.name, media_type='application/pdf', filename="arsredovisning.pdf")

# --- ERSÄTT DENNA ENDPOINT ---
@app.post("/api/annual-reports/from-details", response_model=schemas.AnnualReport)
async def save_report_from_details(report_data: schemas.DetailedReportPayload, db: Session = Depends(get_db)):
    """
    Tar emot detaljerad data från wizarden, sparar den i databasen,
    och returnerar den kompletta rapportposten inklusive dess nya ID.
    """
    try:
        # Hitta eller skapa företaget
        db_company = crud.get_company_by_org_nr(db, org_nr=report_data.org_nr)
        if db_company is None:
            db_company = crud.create_company(db=db, company=schemas.CompanyCreate(
                name=report_data.company_name,
                org_nr=report_data.org_nr
            ))

        # Skapa årsredovisningen i databasen - HÄR ÄR ÄNDRINGEN
        db_annual_report = crud.create_annual_report(db=db, report=report_data, company_id=db_company.id)
        
        # Returnera den nyskapade rapporten (FastAPI konverterar den till JSON)
        return db_annual_report
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Kunde inte spara rapporten: {str(e)}")


# --- ERSÄTT DENNA HELA ENDPOINT ---
@app.get("/api/annual-reports/{report_id}/preview")
async def preview_saved_report(report_id: int, db: Session = Depends(get_db)):
    """
    Hämtar en sparad rapport via ID, genererar en PDF för förhandsgranskning
    och returnerar den.
    """
    db_report = crud.get_annual_report(db, report_id=report_id)
    if db_report is None:
        raise HTTPException(status_code=404, detail="Rapporten kunde inte hittas.")

    try:
        # Anropa pdf_generator med hela databasobjektet.
        # pdf_generator kommer själv att hantera kalkylering och datahantering.
        pdf_bytes = pdf_generator.create_annual_report_pdf(db_report, is_preview=True)
        
        # FastAPI 2024: Använd Response direkt istället för FileResponse med BytesIO
        return Response(content=pdf_bytes, media_type="application/pdf")

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Kunde inte generera förhandsgranskning: {str(e)}")
# --- SLUT PÅ ERSÄTTNING ---


