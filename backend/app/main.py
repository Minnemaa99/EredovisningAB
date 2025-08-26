from fastapi import FastAPI, Depends, HTTPException, File, UploadFile
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

# --- ERSÄTT DENNA FUNKTION ---
def _parse_sie_to_details(sie_data: SieData, chart_of_accounts: dict) -> schemas.SieParseResult:
    """
    UPPDATERAD funktion som läser både #UB (balanskonton) och #RES (resultatkonton)
    för att få en komplett uppsättning konton.
    """
    # Hämta företagsnamn
    fnamn_fields = sie_data.get_data('#FNAMN')
    company_name = fnamn_fields[0].data[1] if fnamn_fields and len(fnamn_fields[0].data) > 1 else "Företagsnamn saknas"

    # Hämta organisationsnummer
    orgnr_fields = sie_data.get_data('#ORGNR')
    org_nr = orgnr_fields[0].data[1] if orgnr_fields and len(orgnr_fields[0].data) > 1 else "Org.nr saknas"

    # 1. Läs in ALLA räkenskapsår från filen
    rar_fields = sie_data.get_data('#RAR')
    if not rar_fields:
        raise HTTPException(status_code=400, detail="SIE-filen saknar räkenskapsår (#RAR-taggar).")

    parsed_years = []
    for field in rar_fields:
        try:
            parsed_years.append({
                "id": field.data[1],
                "start": datetime.strptime(field.data[2], '%Y%m%d').date(),
                "end": datetime.strptime(field.data[3], '%Y%m%d').date()
            })
        except (ValueError, IndexError):
            continue

    # 2. Sortera åren efter slutdatum för att hitta det senaste
    if not parsed_years:
        raise HTTPException(status_code=400, detail="Kunde inte tolka några giltiga #RAR-taggar.")
        
    sorted_years = sorted(parsed_years, key=lambda y: y['end'], reverse=True)

    # 3. Definiera aktuellt och föregående år
    current_year = sorted_years[0]
    previous_year = sorted_years[1] if len(sorted_years) > 1 else None

    current_year_id = current_year['id']
    previous_year_id = previous_year['id'] if previous_year else None

    # Hämta både Utgående Balans (#UB) och Resultat (#RES)
    ub_fields = sie_data.get_data('#UB')
    res_fields = sie_data.get_data('#RES')
    all_balance_fields = ub_fields + res_fields

    # 4. Fyll på konton baserat på de dynamiskt funna ID:na
    accounts = []
    prev_accounts = []

    for field in all_balance_fields:
        try:
            year_id = field.data[1]
            acc_num = field.data[2]
            balance = float(field.data[3])
            account_name = chart_of_accounts.get(acc_num, {}).get("name", f"Okänt konto ({acc_num})")

            if year_id == current_year_id:
                accounts.append(schemas.AccountBalance(account_number=acc_num, account_name=account_name, balance=balance))
            elif year_id == previous_year_id:
                prev_accounts.append(schemas.AccountBalance(account_number=acc_num, account_name=account_name, balance=balance))
        except (ValueError, IndexError):
            continue

    return schemas.SieParseResult(
        company_name=company_name,
        org_nr=org_nr,
        start_date=current_year['start'],
        end_date=current_year['end'],
        accounts=accounts,
        prev_accounts=prev_accounts
    )
# --- SLUT PÅ ERSÄTTNING ---

@app.post("/api/annual-reports/upload-sie", response_model=schemas.SieParseResult)
async def parse_sie_file(file: UploadFile = File(...)):
    try:
        contents_bytes = await file.read()
        try:
            contents_lines = contents_bytes.decode('cp437').splitlines()
        except UnicodeDecodeError:
            contents_lines = contents_bytes.decode('utf-8', errors='ignore').splitlines()

        parser = SieParser(file_contents=contents_lines)
        parser.parse()
        sie_data = parser.result
        
        chart_of_accounts = load_chart_of_accounts()
        parsed_data = _parse_sie_to_details(sie_data, chart_of_accounts)
        return parsed_data
    except Exception as e:
        print("--- EN EXCEPTION INTRÄFFADE ---")
        traceback.print_exc()
        print("-------------------------------")
        raise HTTPException(status_code=500, detail=f"Internt serverfel i parse_sie_file: {str(e)}")


# --- LÄGG TILL DENNA NYA ENDPOINT ---
@app.post("/api/annual-reports/preview-pdf")
async def preview_annual_report(report_data: schemas.DetailedReportPayload):
    """
    Genererar en förhandsgranskning av årsredovisningen med vattenstämpel.
    """
    try:
        accounts_data = [acc.model_dump() for acc in report_data.accounts]
        representatives_data = [rep.model_dump() for rep in report_data.representatives]
        k2_results = k2_calculator.calculate_k2_values(accounts_data)

        pdf_buffer = pdf_generator.create_annual_report_pdf(
            company_name=report_data.company_name, org_nr=report_data.org_nr,
            start_date=report_data.start_date, end_date=report_data.end_date,
            forvaltningsberattelse=report_data.forvaltningsberattelse,
            signature_city=report_data.signature_city, signature_date=report_data.signature_date,
            representatives_data=representatives_data, k2_results=k2_results,
            is_preview=True  # Sätter flaggan för vattenstämpel
        )
        
        return FileResponse(
            BytesIO(pdf_buffer.getvalue()),
            media_type='application/pdf',
            filename="utkast_arsredovisning.pdf"
        )
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Kunde inte generera förhandsgranskning: {str(e)}")
# --- SLUT PÅ NY ENDPOINT ---


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


# --- LÄGG TILL DENNA HELT NYA ENDPOINT ---
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
        # Konvertera JSON-data från databasen tillbaka till listor av dicts
        accounts_data = json.loads(db_report.accounts_data)
        prev_accounts_data = json.loads(db_report.prev_accounts_data)
        representatives_data = json.loads(db_report.representatives_data)

        # Beräkna K2-värden
        k2_results = k2_calculator.calculate_k2_values(accounts_data)

        # Skapa PDF med preview-flaggan satt till True
        pdf_buffer = pdf_generator.create_annual_report_pdf(
            company_name=db_report.company.name,
            org_nr=db_report.company.org_nr,
            start_date=db_report.start_date,
            end_date=db_report.end_date,
            forvaltningsberattelse=db_report.forvaltningsberattelse,
            signature_city=db_report.signature_city,
            signature_date=db_report.signature_date,
            representatives_data=representatives_data,
            k2_results=k2_results,
            is_preview=True
        )
        
        return FileResponse(
            BytesIO(pdf_buffer.getvalue()),
            media_type='application/pdf',
            filename=f"utkast_{db_report.company.org_nr}.pdf"
        )
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Kunde inte generera förhandsgranskning: {str(e)}")
# --- SLUT PÅ NY ENDPOINT ---


