from sqlalchemy.orm import Session
from . import models, schemas

# User CRUD
def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, user: schemas.UserCreate):
    # In a real app, never store plain text passwords!
    fake_hashed_password = user.password + "notreallyhashed"
    db_user = models.User(email=user.email, hashed_password=fake_hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# Company CRUD
def create_company(db: Session, company: schemas.CompanyCreate):
    db_company = models.Company(
        orgnummer=company.orgnummer,
        name=company.name,
        owner_id=company.owner_id
    )
    db.add(db_company)
    db.commit()
    db.refresh(db_company)
    return db_company

# AnnualReport CRUD
def create_annual_report(db: Session, report: schemas.AnnualReportCreate):
    db_report = models.AnnualReport(
        year=report.year,
        status=report.status,
        report_data=report.report_data,
        company_id=report.company_id
    )
    db.add(db_report)
    db.commit()
    db.refresh(db_report)
    return db_report
