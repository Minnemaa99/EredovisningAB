from fastapi import FastAPI, Depends, HTTPException, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import io
import json
from datetime import date
from contextlib import asynccontextmanager

from . import crud, models, schemas, pdf_generator, k2_calculator
from .sie_parser.sie_parse import SieParser
from .sie_parser.accounting_data import SieData
from .database import engine, SessionLocal, Base

# This will hold the loaded chart of accounts
chart_of_accounts = {}

def _seed_database():
    """Ensures a default company exists in the database."""
    db = SessionLocal()
    try:
        company = db.query(models.Company).filter(models.Company.id == 1).first()
        if not company:
            default_company = schemas.CompanyCreate(
                name="Testbolaget AB",
                orgnummer="555555-5555"
            )
            crud.create_company(db=db, company=default_company)
    finally:
        db.close()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Runs on startup
    global chart_of_accounts
    # Load the chart of accounts from the JSON file.
    # Assuming the script is run from the project root where `public/` exists.
    try:
        with open("public/kontoplan.json", "r", encoding="utf-8") as f:
            chart_of_accounts = json.load(f)
    except FileNotFoundError:
        # Handle case where file might not exist, though we just created it.
        chart_of_accounts = {}

    Base.metadata.create_all(bind=engine)
    _seed_database()
    yield
    # Runs on shutdown
    pass

app = FastAPI(title="Eredovisning API", lifespan=lifespan)

# CORS
origins = ["http://localhost:3000"]
app.add_middleware(CORSMiddleware, allow_origins=origins, allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

@app.get("/api/kontoplan")
def get_kontoplan():
    """Returns the entire chart of accounts."""
    return chart_of_accounts

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def _map_sie_data_to_schema(sie_data: SieData) -> schemas.AnnualReportCreate:
    """
    Maps parsed SIE data to the AnnualReportCreate schema by classifying
    accounts based on standard BAS account classes.
    """
    # 1. Extract dates from #RAR, with robust checking
    rar_data = sie_data.get_data("#RAR")
    if not rar_data:
        raise HTTPException(status_code=400, detail="Could not find fiscal year (#RAR tag) in the SIE file.")

    rar_line = rar_data[0]
    if not hasattr(rar_line, 'data') or len(rar_line.data) < 3:
        raise HTTPException(status_code=400, detail="The #RAR tag in the SIE file is malformed.")

    start_date_str = rar_line.data[1]
    end_date_str = rar_line.data[2]

    # 2. Initialize schema with dates and zeroed data
    try:
        report_data = {
            "start_date": date.fromisoformat(f"{start_date_str[:4]}-{start_date_str[4:6]}-{start_date_str[6:]}"),
            "end_date": date.fromisoformat(f"{end_date_str[:4]}-{end_date_str[4:6]}-{end_date_str[6:]}")
        }
    except (ValueError, IndexError):
        raise HTTPException(status_code=400, detail="Could not parse dates from the #RAR tag. Ensure they are in YYYYMMDD format.")

    for field in schemas.AnnualReportBase.__annotations__:
        report_data[field] = 0.0

    # 3. Sum balances from #UB (closing balance) based on account class
    ub_entries = sie_data.get_data("#UB")
    for entry in ub_entries:
        account_num = int(entry.data[1])
        balance = float(entry.data[2])

        # Determine the schema field based on the account number's class
        schema_field = None
        # Balance Sheet Accounts (1xxx, 2xxx)
        if 1200 <= account_num < 1300: schema_field = "bs_materiella_anlaggningstillgangar"
        elif 1300 <= account_num < 1400: schema_field = "bs_finansiella_anlaggningstillgangar"
        elif 1400 <= account_num < 1500: schema_field = "bs_varulager"
        elif 1500 <= account_num < 1600: schema_field = "bs_kundfordringar"
        elif 1600 <= account_num < 1700: schema_field = "bs_ovriga_fordringar"
        elif 1700 <= account_num < 1800: schema_field = "bs_forutbetalda_kostnader"
        elif 1900 <= account_num < 2000: schema_field = "bs_kassa_bank"
        elif 2000 <= account_num < 2080: schema_field = "bs_bundet_eget_kapital"
        elif 2080 <= account_num < 2100: schema_field = "bs_fritt_eget_kapital"
        elif 2100 <= account_num < 2200: schema_field = "bs_obeskattade_reserver"
        elif 2300 <= account_num < 2500: schema_field = "bs_langfristiga_skulder"
        elif 2500 <= account_num < 3000: schema_field = "bs_kortfristiga_skulder"
        # Income Statement Accounts (3xxx-8xxx)
        elif 3000 <= account_num < 4000: schema_field = "is_nettoomsattning"
        elif 4000 <= account_num < 5000: schema_field = "is_kostnad_ravaror"
        elif 5000 <= account_num < 7000: schema_field = "is_kostnad_externa"
        elif 7000 <= account_num < 7700: schema_field = "is_kostnad_personal"
        elif 7800 <= account_num < 7900: schema_field = "is_avskrivningar"
        elif 8000 <= account_num < 8300: schema_field = "is_finansiella_intakter"
        elif 8300 <= account_num < 8500: schema_field = "is_finansiella_kostnader"

        if schema_field:
            # In accounting, liability/equity are credits (negative), assets are debits (positive).
            # The SIE format often provides them in a way that requires sign adjustments.
            # For a K2 report, costs are positive, revenues are positive.
            if schema_field.startswith("is_"):
                # Revenues (3xxx) and financial income (8000-8299) are often negative in SIE, costs are positive. We want positive values.
                if (3000 <= account_num < 4000) or (8000 <= account_num < 8300):
                    report_data[schema_field] -= balance
                else: # Costs
                    report_data[schema_field] += balance
            elif schema_field.startswith("bs_"):
                # Assets are positive, Equity/Liabilities are positive
                if 2000 <= account_num < 3000: # Equity and liabilities
                    report_data[schema_field] -= balance
                else: # Assets
                    report_data[schema_field] += balance

    return schemas.AnnualReportCreate(**report_data)

@app.post("/api/annual-reports/upload-sie", response_model=schemas.AnnualReport)
async def create_annual_report_from_sie(company_id: int, db: Session = Depends(get_db), file: UploadFile = File(...)):
    """
    Creates an annual report by parsing an uploaded SIE file.
    """
    if not file.filename.lower().endswith(('.se', '.si')):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload a .si or .se file.")

    try:
        file_contents = await file.read()
        # Use cp437 encoding as it's common for SIE files, with fallback to utf-8
        try:
            sie_lines = file_contents.decode('cp437').splitlines()
        except UnicodeDecodeError:
            sie_lines = file_contents.decode('utf-8').splitlines()

        parser = SieParser(file_contents=sie_lines)
        parser.parse()

        report_create_schema = _map_sie_data_to_schema(parser.result)

        return crud.create_report(db=db, company_id=company_id, report_data=report_create_schema)

    except Exception as e:
        # Broad exception to catch parsing errors, file read errors, etc.
        raise HTTPException(status_code=500, detail=f"Failed to process SIE file: {e}")


@app.get("/")
def read_root():
    return {"message": "Welcome to the Eredovisning API"}

@app.post("/api/annual-reports", response_model=schemas.AnnualReport)
def create_annual_report(report_in: schemas.AnnualReportCreate, company_id: int, db: Session = Depends(get_db)):
    # This endpoint now creates the report with all its data at once.
    return crud.create_report(db=db, company_id=company_id, report_data=report_in)

@app.put("/api/annual-reports/{report_id}", response_model=schemas.AnnualReport)
def update_annual_report(report_id: int, report_in: schemas.AnnualReportCreate, db: Session = Depends(get_db)):
    # This endpoint updates an existing report with new data.
    return crud.update_report(db=db, report_id=report_id, report_data=report_in)

@app.post("/api/annual-reports/{report_id}/calculate", response_model=schemas.AnnualReport)
def calculate_and_save_report(report_id: int, db: Session = Depends(get_db)):
    """
    Takes the saved report data, runs the K2 calculations, and saves the result.
    """
    db_report = crud.get_report(db, report_id)
    if not db_report:
        raise HTTPException(status_code=404, detail="Report not found")

    # Run calculations
    calculated_report = k2_calculator.perform_calculations(db_report)

    # Save the calculated results back to the DB
    db.commit()
    db.refresh(calculated_report)
    return calculated_report

@app.get("/api/annual-reports/{report_id}/preview", response_class=StreamingResponse)
def get_report_preview(report_id: int, db: Session = Depends(get_db)):
    report = crud.get_report(db, report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    pdf_bytes = pdf_generator.generate_pdf(report, is_preview=True)
    return StreamingResponse(io.BytesIO(pdf_bytes), media_type="application/pdf")
