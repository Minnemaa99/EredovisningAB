from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import io

from . import crud, models, schemas, pdf_generator, k2_calculator
from .database import engine, SessionLocal

# This will create the database tables if they don't exist
# when the application starts up.
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Eredovisning API")

# CORS setup
origins = ["http://localhost:3000"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- API Endpoints ---

@app.get("/")
def read_root():
    return {"message": "Welcome to the Eredovisning API"}

@app.post("/api/companies", response_model=schemas.Company)
def create_company(company: schemas.CompanyCreate, db: Session = Depends(get_db)):
    # A simplified endpoint to create a company
    return crud.create_company(db=db, company=company)

@app.post("/api/annual-reports/{company_id}", response_model=schemas.AnnualReport)
def create_report_for_company(
    company_id: int,
    report_data: schemas.AnnualReportDataIn,
    db: Session = Depends(get_db)
):
    return crud.create_annual_report(db=db, report_data=report_data, company_id=company_id)

@app.get("/api/annual-reports/{report_id}/preview", response_class=StreamingResponse)
def get_report_preview(report_id: int, db: Session = Depends(get_db)):
    report = db.query(models.AnnualReport).filter(models.AnnualReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    pdf_bytes = pdf_generator.generate_pdf(report, is_preview=True)
    return StreamingResponse(io.BytesIO(pdf_bytes), media_type="application/pdf")

@app.get("/api/annual-reports/{report_id}/download", response_class=StreamingResponse)
def download_final_report(report_id: int, db: Session = Depends(get_db)):
    report = db.query(models.AnnualReport).filter(models.AnnualReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    pdf_bytes = pdf_generator.generate_pdf(report, is_preview=False)
    return StreamingResponse(io.BytesIO(pdf_bytes), media_type="application/pdf")
