from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import date

# Schemas for data entry and calculation
class AccountLineIn(BaseModel):
    account_number: str
    balance_current_year: float
    balance_prev_year_1: Optional[float] = None

class AnnualReportDataIn(BaseModel):
    start_date: date
    end_date: date
    account_lines: List[AccountLineIn]

# Schemas for DB models
class CompanyBase(BaseModel):
    name: str
    orgnummer: str

class CompanyCreate(CompanyBase):
    pass

class Company(CompanyBase):
    id: int
    class Config:
        orm_mode = True

class AnnualReport(BaseModel):
    id: int
    company_id: int
    start_date: date
    end_date: date
    class Config:
        orm_mode = True
