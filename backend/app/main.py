from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import io

from . import crud, models, schemas, pdf_generator, k2_calculator
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

@app.get("/")
def read_root():
    return {"message": "Welcome to the Eredovisning API"}

@app.post("/api/reports", response_model=schemas.AnnualReport)
def create_annual_report(report_in: schemas.AnnualReportCreate, company_id: int, db: Session = Depends(get_db)):
    # This endpoint now creates the report with all its data at once.
    return crud.create_report(db=db, company_id=company_id, report_data=report_in)

@app.put("/api/reports/{report_id}", response_model=schemas.AnnualReport)
def update_annual_report(report_id: int, report_in: schemas.AnnualReportCreate, db: Session = Depends(get_db)):
    # This endpoint updates an existing report with new data.
    return crud.update_report(db=db, report_id=report_id, report_data=report_in)

@app.post("/api/reports/{report_id}/calculate", response_model=schemas.AnnualReport)
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

@app.get("/api/reports/{report_id}/preview", response_class=StreamingResponse)
def get_report_preview(report_id: int, db: Session = Depends(get_db)):
    report = crud.get_report(db, report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    pdf_bytes = pdf_generator.generate_pdf(report, is_preview=True)
    return StreamingResponse(io.BytesIO(pdf_bytes), media_type="application/pdf")
