from pydantic import BaseModel
from typing import Optional, List, Any

# --- AnnualReport Schemas ---
class AnnualReportBase(BaseModel):
    year: int
    status: str = "new"
    report_data: Optional[dict] = None

class AnnualReportCreate(AnnualReportBase):
    company_id: int

class AnnualReport(AnnualReportBase):
    id: int
    company_id: int

    class Config:
        orm_mode = True

# --- Company Schemas ---
class CompanyBase(BaseModel):
    orgnummer: str
    name: str

class CompanyCreate(CompanyBase):
    owner_id: int

class Company(CompanyBase):
    id: int
    owner_id: int
    annual_reports: List[AnnualReport] = []

    class Config:
        orm_mode = True

# --- User Schemas ---
class UserBase(BaseModel):
    email: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    companies: List[Company] = []

    class Config:
        orm_mode = True
