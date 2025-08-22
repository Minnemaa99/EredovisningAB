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
from . import chart_of_accounts_data

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
    # Load the chart of accounts directly from the Python module.
    chart_of_accounts = chart_of_accounts_data.CHART_OF_ACCOUNTS

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

def _parse_sie_to_details(sie_data: SieData, chart_of_accounts: dict) -> schemas.SieParseResult:
    """
    Parses SIE data to extract detailed account balances.
    """
    # 1. Extract dates
    rar_data = sie_data.get_data("#RAR")
    if not rar_data:
        raise HTTPException(status_code=400, detail="Could not find fiscal year (#RAR tag) in the SIE file.")
    rar_line = rar_data[0]
    start_date_str = rar_line.data[1]
    end_date_str = rar_line.data[2]
    try:
        start_date = date.fromisoformat(f"{start_date_str[:4]}-{start_date_str[4:6]}-{start_date_str[6:]}")
        end_date = date.fromisoformat(f"{end_date_str[:4]}-{end_date_str[4:6]}-{end_date_str[6:]}")
    except (ValueError, IndexError):
        raise HTTPException(status_code=400, detail="Could not parse dates from the #RAR tag. Ensure they are in YYYYMMDD format.")

    # 2. Extract balances
    accounts = []
    ub_entries = sie_data.get_data("#UB")
    for entry in ub_entries:
        account_num_str = entry.data[1].strip()
        balance = float(entry.data[2])

        # Look up account name from the chart of accounts, provide a default if not found.
        account_name = chart_of_accounts.get(account_num_str, {}).get("name", f"Okänt konto ({account_num_str})")

        accounts.append(
            schemas.AccountBalance(
                account_number=account_num_str,
                account_name=account_name,
                balance=balance
            )
        )

    return schemas.SieParseResult(start_date=start_date, end_date=end_date, accounts=accounts)


@app.post("/api/annual-reports/upload-sie", response_model=schemas.SieParseResult)
async def parse_sie_file(file: UploadFile = File(...)):
    """
    Parses an uploaded SIE file and returns the detailed account balances without saving.
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

        # The global chart_of_accounts dictionary is loaded at startup.
        detailed_result = _parse_sie_to_details(parser.result, chart_of_accounts)

        return detailed_result

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

@app.post("/api/annual-reports/from-details", response_model=schemas.AnnualReport)
def create_report_from_details(payload: schemas.DetailedReportPayload, db: Session = Depends(get_db)):
    """
    Creates and saves an annual report from a detailed list of account balances.
    This is used after the frontend has allowed the user to review/edit the parsed SIE data.
    """
    report_data = {
        "start_date": payload.start_date,
        "end_date": payload.end_date,
    }
    # Initialize all fields to 0.0
    for field in schemas.AnnualReportBase.__annotations__:
        report_data[field] = 0.0

    # Aggregate balances from the detailed list
    for account in payload.accounts:
        try:
            account_num = int(account.account_number)
            balance = float(account.balance)
        except (ValueError, TypeError):
            continue # Skip if account number or balance is not a valid number

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
            if schema_field.startswith("is_"):
                if (3000 <= account_num < 4000) or (8000 <= account_num < 8300):
                    report_data[schema_field] -= balance
                else: # Costs
                    report_data[schema_field] += balance
            elif schema_field.startswith("bs_"):
                if 2000 <= account_num < 3000: # Equity and liabilities
                    report_data[schema_field] -= balance
                else: # Assets
                    report_data[schema_field] += balance

    report_create_schema = schemas.AnnualReportCreate(**report_data)

    return crud.create_report(db=db, company_id=payload.company_id, report_data=report_create_schema)

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
