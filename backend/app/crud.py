from sqlalchemy.orm import Session
from . import models, schemas

def create_company(db: Session, company: schemas.CompanyCreate):
    db_company = models.Company(name=company.name, orgnummer=company.orgnummer)
    db.add(db_company)
    db.commit()
    db.refresh(db_company)
    return db_company

def create_annual_report(db: Session, report_data: schemas.AnnualReportDataIn, company_id: int):
    # Create the main report record
    db_report = models.AnnualReport(
        company_id=company_id,
        start_date=report_data.start_date,
        end_date=report_data.end_date
    )
    db.add(db_report)
    db.commit()
    db.refresh(db_report)

    # Create all the account lines associated with it
    for line in report_data.account_lines:
        db_line = models.AccountLine(
            report_id=db_report.id,
            **line.dict()
        )
        db.add(db_line)

    db.commit()
    db.refresh(db_report) # Refresh to load the new lines
    return db_report
