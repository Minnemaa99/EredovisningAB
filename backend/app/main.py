from fastapi import FastAPI, Depends, HTTPException, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import io
from datetime import date

from . import crud, models, schemas, pdf_generator, k2_calculator
from .sie_parser.sie_parse import SieParser
from .sie_parser.accounting_data import SieData
from .database import engine, SessionLocal

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Eredovisning API")

# CORS
origins = ["http://localhost:3000"]
app.add_middleware(CORSMiddleware, allow_origins=origins, allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- SIE File Parsing Logic ---

# Simplified mapping from BAS account numbers to schema fields.
# In a real app, this would be more detailed and likely external.
SIE_ACCOUNT_MAPPING = {
    "is_nettoomsattning": range(3000, 4000),
    "is_kostnad_ravaror": range(4000, 5000),
    "is_kostnad_externa": range(5000, 7000),
    "is_kostnad_personal": range(7000, 7700),
    "is_avskrivningar": range(7800, 7900),
    "is_finansiella_intakter": range(8000, 8300),
    "is_finansiella_kostnader": range(8300, 8500),
    "bs_materiella_anlaggningstillgangar": range(1200, 1300),
    "bs_finansiella_anlaggningstillgangar": range(1300, 1400),
    "bs_varulager": range(1400, 1500),
    "bs_kundfordringar": range(1500, 1600),
    "bs_ovriga_fordringar": range(1600, 1700),
    "bs_forutbetalda_kostnader": range(1700, 1800),
    "bs_kassa_bank": range(1900, 2000),
    "bs_bundet_eget_kapital": range(2000, 2080),
    "bs_fritt_eget_kapital": range(2080, 2100),
    "bs_obeskattade_reserver": range(2100, 2200),
    "bs_langfristiga_skulder": range(2300, 2500),
    "bs_kortfristiga_skulder": range(2500, 3000),
}

def _map_sie_data_to_schema(sie_data: SieData) -> schemas.AnnualReportCreate:
    """Maps parsed SIE data to the AnnualReportCreate schema."""

    # 1. Extract dates from #RAR
    rar_data = sie_data.get_data("#RAR")
    if not rar_data or len(rar_data[0].data) < 3:
        raise HTTPException(status_code=400, detail="SIE file is missing fiscal year (#RAR) information.")

    start_date_str = rar_data[0].data[1]
    end_date_str = rar_data[0].data[2]

    # 2. Initialize schema with dates and zeroed data
    report_data = {
        "start_date": date.fromisoformat(f"{start_date_str[:4]}-{start_date_str[4:6]}-{start_date_str[6:]}"),
        "end_date": date.fromisoformat(f"{end_date_str[:4]}-{end_date_str[4:6]}-{end_date_str[6:]}")
    }
    for field in schemas.AnnualReportBase.__annotations__:
        report_data[field] = 0.0

    # 3. Sum balances from #UB (closing balance)
    ub_entries = sie_data.get_data("#UB")
    for entry in ub_entries:
        account_num = int(entry.data[1])
        balance = float(entry.data[2])

        for schema_field, account_range in SIE_ACCOUNT_MAPPING.items():
            if account_num in account_range:
                # In accounting, liability/equity are credits (negative), assets are debits (positive).
                # The SIE format often provides them in a way that requires sign adjustments.
                # For a K2 report, costs are positive, revenues are positive.
                if schema_field.startswith("is_"):
                     # Revenues (3xxx) are often negative in SIE, costs are positive. We want positive values.
                    if 3000 <= account_num < 4000:
                        report_data[schema_field] -= balance
                    else: # Costs
                        report_data[schema_field] += balance
                elif schema_field.startswith("bs_"):
                    # Assets are positive, Equity/Liabilities are positive
                    if 2000 <= account_num < 3000: # Equity and liabilities
                        report_data[schema_field] -= balance
                    else: # Assets
                        report_data[schema_field] += balance
                break

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
