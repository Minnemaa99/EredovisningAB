from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from . import crud, models, schemas
from .database import SessionLocal, engine

# Create DB tables if they don't exist
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Eredovisning API")

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/api/users/", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return crud.create_user(db=db, user=user)

@app.post("/api/companies/", response_model=schemas.Company)
def create_company(company: schemas.CompanyCreate, db: Session = Depends(get_db)):
    return crud.create_company(db=db, company=company)

from fastapi import File, UploadFile
from .sie_parser.sie_parse import SieParser

@app.post("/api/annual-reports/", response_model=schemas.AnnualReport)
def create_annual_report(report: schemas.AnnualReportCreate, db: Session = Depends(get_db)):
    return crud.create_annual_report(db=db, report=report)

@app.post("/api/annual-reports/{report_id}/import-sie", response_model=schemas.AnnualReport)
async def import_sie_file(report_id: int, file: UploadFile = File(...), db: Session = Depends(get_db)):
    report = crud.get_annual_report(db, report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Annual Report not found")

    try:
        content_bytes = await file.read()
        content = content_bytes.decode('cp437') # Standard SIE encoding
        lines = content.splitlines()

        parser = SieParser(file_contents=lines)
        parser.parse()

        sie_data = parser.result

        # Convert transactions to a serializable format (list of dicts)
        verifications = sie_data.get_data('#VER')
        parsed_data = {
            "verifications": [
                {
                    "serie": ver.serie,
                    "vernr": ver.vernr,
                    "verdatum": str(ver.verdatum.date) if ver.verdatum.has_date else None,
                    "transactions": [
                        {
                            "kontonr": trans.kontonr,
                            "belopp": trans.belopp,
                            "transtext": trans.transtext
                        } for trans in ver.trans_list
                    ]
                } for ver in verifications
            ]
        }

        updated_report = crud.update_annual_report_data(
            db, report_id=report_id, data=parsed_data, status="imported"
        )
        return updated_report

    except Exception as e:
        crud.update_annual_report_data(
            db, report_id=report_id, data={"error": str(e)}, status="failed"
        )
        raise HTTPException(status_code=500, detail=f"Failed to parse SIE file: {e}")

@app.post("/api/annual-reports/{report_id}/validate")
def validate_report_data(report_id: int, db: Session = Depends(get_db)):
    report = crud.get_annual_report(db, report_id)
    if not report or not report.report_data:
        raise HTTPException(status_code=404, detail="Report data not found")

    errors = []
    verifications = report.report_data.get("verifications", [])

    for i, ver in enumerate(verifications):
        total = sum(trans.get("belopp", 0) for trans in ver.get("transactions", []))
        # Use a small tolerance for float comparison
        if not -0.01 < total < 0.01:
            errors.append(f"Verifikation {ver.get('vernr', i+1)} balanserar inte. Summa: {total:.2f}")

    if errors:
        return {"status": "error", "errors": errors}
    else:
        return {"status": "ok", "errors": []}


from fastapi.responses import StreamingResponse
import io
from . import pdf_generator

@app.get("/api/annual-reports/{report_id}/preview", response_class=StreamingResponse)
async def get_report_preview(report_id: int, db: Session = Depends(get_db)):
    report = crud.get_annual_report(db, report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Annual Report not found")

    try:
        pdf_bytes = pdf_generator.generate_annual_report_pdf(report)
        return StreamingResponse(io.BytesIO(pdf_bytes), media_type="application/pdf")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate PDF preview: {e}")


import zipfile
from . import sru_generator

@app.post("/api/annual-reports/{report_id}/pay")
def pay_for_report(report_id: int, db: Session = Depends(get_db)):
    report = crud.get_annual_report(db, report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Annual Report not found")

    # In a real app, this would be triggered by a Stripe webhook after a successful payment.
    # For now, we just update the status directly.
    updated_report = crud.update_report_status(db, report_id, "paid")
    return {"status": "success", "report": updated_report}


@app.get("/api/annual-reports/{report_id}/download-pdf", response_class=StreamingResponse)
async def download_pdf_report(report_id: int, db: Session = Depends(get_db)):
    report = crud.get_annual_report(db, report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Annual Report not found")
    if report.status != "paid":
        raise HTTPException(status_code=403, detail="Report has not been paid for")

    pdf_bytes = pdf_generator.generate_annual_report_pdf(report)
    return StreamingResponse(io.BytesIO(pdf_bytes), media_type="application/pdf")


@app.get("/api/annual-reports/{report_id}/download-sru")
async def download_sru_files(report_id: int, db: Session = Depends(get_db)):
    report = crud.get_annual_report(db, report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Annual Report not found")
    if report.status != "paid":
        raise HTTPException(status_code=403, detail="Report has not been paid for")

    sru_files = sru_generator.generate_sru_files(report)

    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, "a", zipfile.ZIP_DEFLATED, False) as zip_file:
        for filename, content in sru_files.items():
            zip_file.writestr(filename, content)

    zip_buffer.seek(0)

    return StreamingResponse(zip_buffer, media_type="application/zip")


@app.get("/")
def read_root():
    return {"message": "Välkommen till Eredovisning API. Gå till /docs för att se dokumentationen."}
