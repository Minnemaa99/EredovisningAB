from sqlalchemy.orm import Session
from . import models, schemas
from typing import List
from datetime import date

# Company CRUD operations
def get_company(db: Session, company_id: int):
    return db.query(models.Company).filter(models.Company.id == company_id).first()

def get_company_by_orgnummer(db: Session, orgnummer: str):
    return db.query(models.Company).filter(models.Company.orgnummer == orgnummer).first()

def get_companies(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Company).offset(skip).limit(limit).all()

def create_company(db: Session, company: schemas.CompanyCreate):
    db_company = models.Company(
        orgnummer=company.orgnummer,
        name=company.name,
        address_info=company.address_info
    )
    db.add(db_company)
    db.commit()
    db.refresh(db_company)
    return db_company

# DeclarationYear CRUD operations (can be expanded later)
def create_declaration_year(db: Session, declaration_year: schemas.DeclarationYearCreate, company_id: int):
    db_declaration_year = models.DeclarationYear(**declaration_year.dict(), company_id=company_id)
    db.add(db_declaration_year)
    db.commit()
    db.refresh(db_declaration_year)
    return db_declaration_year

# AccountingFile CRUD operations
def create_accounting_file(db: Session, file: schemas.AccountingFileCreate, company_id: int) -> models.AccountingFile:
    db_file = models.AccountingFile(
        filename=file.filename,
        status=file.status,
        upload_date=file.upload_date,
        company_id=company_id
    )
    db.add(db_file)
    db.commit()
    db.refresh(db_file)
    return db_file

# Transaction CRUD operations
def create_transactions_bulk(db: Session, transactions: List[schemas.TransactionCreate], file_id: int):
    db_transactions = [
        models.Transaction(
            account=t.account,
            description=t.description,
            debit=t.debit,
            credit=t.credit,
            transaction_date=t.transaction_date,
            file_id=file_id
        ) for t in transactions
    ]
    db.bulk_save_objects(db_transactions)
    db.commit()
    return db_transactions
