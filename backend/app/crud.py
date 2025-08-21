from sqlalchemy.orm import Session, joinedload
from . import models, schemas

def create_company(db: Session, company: schemas.CompanyCreate):
    db_company = models.Company(**company.dict())
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
