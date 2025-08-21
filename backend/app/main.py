from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine
from . import models

# This will create the database tables if they don't exist
# when the application starts up.
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Eredovisning API")

# Basic CORS setup for development
origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from . import crud, schemas
from .database import SessionLocal
from sqlalchemy.orm import Session

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/api/annual-reports/{company_id}", response_model=schemas.AnnualReport)
def create_report_for_company(
    company_id: int,
    report_data: schemas.AnnualReportDataIn,
    db: Session = Depends(get_db)
):
    # In a real app, you'd verify the company exists first
    return crud.create_annual_report(db=db, report_data=report_data, company_id=company_id)


from fastapi.responses import StreamingResponse
import io
from . import pdf_generator

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

    # In a real app, you would check for payment status here

    pdf_bytes = pdf_generator.generate_pdf(report, is_preview=False)
    return StreamingResponse(io.BytesIO(pdf_bytes), media_type="application/pdf")


@app.get("/")
def read_root():
    return {"message": "Welcome to the Eredovisning API"}
