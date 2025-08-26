from sqlalchemy.orm import Session
from . import models, schemas

def create_company(db: Session, company: schemas.CompanyCreate):
    db_company = models.Company(name=company.name, org_nr=company.org_nr)
    db.add(db_company)
    db.commit()
    db.refresh(db_company)
    return db_company

def get_report(db: Session, report_id: int):
    return db.query(models.AnnualReport).filter(models.AnnualReport.id == report_id).first()

def update_report(db: Session, report_id: int, report_data: schemas.AnnualReportCreate):
    db_report = get_report(db, report_id)
    if not db_report:
        return None

    report_data_dict = report_data.dict(exclude_unset=True)
    for key, value in report_data_dict.items():
        setattr(db_report, key, value)

    db.commit()
    db.refresh(db_report)
    return db_report

def create_report(db: Session, company_id: int, report_data: schemas.AnnualReportCreate):
    db_report = models.AnnualReport(company_id=company_id, **report_data.dict())
    db.add(db_report)
    db.commit()
    db.refresh(db_report)
    return db_report

def get_company(db: Session, company_id: int):
    return db.query(models.Company).filter(models.Company.id == company_id).first()

def get_company_by_org_nr(db: Session, org_nr: str):
    return db.query(models.Company).filter(models.Company.org_nr == org_nr).first()

def get_annual_report(db: Session, report_id: int):
    return db.query(models.AnnualReport).filter(models.AnnualReport.id == report_id).first()

def create_annual_report(db: Session, report: schemas.DetailedReportPayload, company_id: int):
    """
    Skapar en ny årsredovisning i databasen och kopplar den till ett företag.
    Denna version är mer robust genom att explicit välja vilka fält som ska sparas.
    """
    # Skapa ett dictionary från Pydantic-modellen
    incoming_data = report.model_dump()
    
    # Skapa ett nytt, rent dictionary med BARA de fält som finns i AnnualReport-modellen.
    # Detta förhindrar att oönskade fält (som company_name, org_nr, eller en felaktig company_id)
    # följer med.
    report_to_save = {
        "start_date": incoming_data.get("start_date"),
        "end_date": incoming_data.get("end_date"),
        "accounts": incoming_data.get("accounts"),
        "prev_accounts": incoming_data.get("prev_accounts"),
        "forvaltningsberattelse": incoming_data.get("forvaltningsberattelse"),
        "signature_city": incoming_data.get("signature_city"),
        "signature_date": incoming_data.get("signature_date"),
        "representatives": incoming_data.get("representatives"),
    }

    # Skapa databasobjektet med den rena datan och det korrekta company_id
    db_report = models.AnnualReport(
        **report_to_save,
        company_id=company_id
    )
    
    db.add(db_report)
    db.commit()
    db.refresh(db_report)
    return db_report
