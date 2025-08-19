from pydantic import BaseModel
from typing import List, Optional

from datetime import date

# --- Transaction Schemas ---
class TransactionBase(BaseModel):
    account: str
    description: Optional[str] = None
    debit: float = 0.0
    credit: float = 0.0
    transaction_date: Optional[date] = None

class TransactionCreate(TransactionBase):
    pass

class Transaction(TransactionBase):
    id: int
    file_id: int

    class Config:
        orm_mode = True

# --- AccountingFile Schemas ---
class AccountingFileBase(BaseModel):
    filename: str
    status: str = "uploaded"
    upload_date: date

class AccountingFileCreate(AccountingFileBase):
    pass

class AccountingFile(AccountingFileBase):
    id: int
    company_id: int
    transactions: List[Transaction] = []

    class Config:
        orm_mode = True

# --- DeclarationYear Schemas ---
class DeclarationYearBase(BaseModel):
    year: int
    status: str

class DeclarationYearCreate(DeclarationYearBase):
    pass

class DeclarationYear(DeclarationYearBase):
    id: int
    company_id: int

    class Config:
        orm_mode = True

# --- Company Schemas ---
class CompanyBase(BaseModel):
    orgnummer: str
    name: str
    address_info: Optional[str] = None

class CompanyCreate(CompanyBase):
    pass

# Schema for reading a company, includes relations
class Company(CompanyBase):
    id: int
    declaration_years: List[DeclarationYear] = []
    accounting_files: List[AccountingFile] = []

    class Config:
        orm_mode = True
