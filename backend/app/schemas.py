from pydantic import BaseModel
from typing import Optional, List
from datetime import date

class AnnualReportBase(BaseModel):
    # Balance Sheet
    bs_materiella_anlaggningstillgangar: Optional[float] = 0.0
    bs_finansiella_anlaggningstillgangar: Optional[float] = 0.0
    bs_varulager: Optional[float] = 0.0
    bs_kundfordringar: Optional[float] = 0.0
    bs_ovriga_fordringar: Optional[float] = 0.0
    bs_forutbetalda_kostnader: Optional[float] = 0.0
    bs_kassa_bank: Optional[float] = 0.0
    bs_bundet_eget_kapital: Optional[float] = 0.0
    bs_fritt_eget_kapital: Optional[float] = 0.0
    bs_obeskattade_reserver: Optional[float] = 0.0
    bs_langfristiga_skulder: Optional[float] = 0.0
    bs_kortfristiga_skulder: Optional[float] = 0.0

    # Income Statement
    is_nettoomsattning: Optional[float] = 0.0
    is_forandring_lager: Optional[float] = 0.0
    is_ovriga_rorelseintakter: Optional[float] = 0.0
    is_kostnad_ravaror: Optional[float] = 0.0
    is_kostnad_externa: Optional[float] = 0.0
    is_kostnad_personal: Optional[float] = 0.0
    is_avskrivningar: Optional[float] = 0.0
    is_finansiella_intakter: Optional[float] = 0.0
    is_finansiella_kostnader: Optional[float] = 0.0
    is_bokslutsdispositioner: Optional[float] = 0.0
    is_skatt: Optional[float] = 0.0

class AnnualReportCreate(AnnualReportBase):
    start_date: date
    end_date: date

class AnnualReport(AnnualReportBase):
    id: int
    company_id: int
    bs_arets_resultat_ek: Optional[float] = 0.0 # Calculated field

    class Config:
        from_attributes = True

class CompanyBase(BaseModel):
    name: str
    org_nr: str  # <-- ÄNDRAD FRÅN 'orgnummer'

class CompanyCreate(CompanyBase):
    pass

class Company(CompanyBase):
    id: int
    
    class Config:
        from_attributes = True

class AccountBalance(BaseModel):
    account_number: str
    account_name: str
    balance: float

class SieParseResult(BaseModel):
    company_name: str
    org_nr: str
    start_date: date
    end_date: date
    accounts: List[AccountBalance]
    prev_accounts: List[AccountBalance]


# --- LÄGG TILL DENNA NYA KLASS ---
class Representative(BaseModel):
    name: str
    role: str

class AccountsData(BaseModel):
    current_year: List[AccountBalance]
    previous_year: List[AccountBalance]

class DetailedReportPayload(BaseModel):
    company_id: Optional[int] = None
    company_name: str
    org_nr: str
    start_date: date
    end_date: date
    accounts_data: AccountsData  # <-- ÄNDRAD RAD
    forvaltningsberattelse: str
    signature_city: str
    signature_date: date
    representatives: List[Representative]


class AnnualReportBase(BaseModel):
    # Balance Sheet
    bs_materiella_anlaggningstillgangar: Optional[float] = 0.0
    bs_finansiella_anlaggningstillgangar: Optional[float] = 0.0
    bs_varulager: Optional[float] = 0.0
    bs_kundfordringar: Optional[float] = 0.0
    bs_ovriga_fordringar: Optional[float] = 0.0
    bs_forutbetalda_kostnader: Optional[float] = 0.0
    bs_kassa_bank: Optional[float] = 0.0
    bs_bundet_eget_kapital: Optional[float] = 0.0
    bs_fritt_eget_kapital: Optional[float] = 0.0
    bs_obeskattade_reserver: Optional[float] = 0.0
    bs_langfristiga_skulder: Optional[float] = 0.0
    bs_kortfristiga_skulder: Optional[float] = 0.0

    # Income Statement
    is_nettoomsattning: Optional[float] = 0.0
    is_forandring_lager: Optional[float] = 0.0
    is_ovriga_rorelseintakter: Optional[float] = 0.0
    is_kostnad_ravaror: Optional[float] = 0.0
    is_kostnad_externa: Optional[float] = 0.0
    is_kostnad_personal: Optional[float] = 0.0
    is_avskrivningar: Optional[float] = 0.0
    is_finansiella_intakter: Optional[float] = 0.0
    is_finansiella_kostnader: Optional[float] = 0.0
    is_bokslutsdispositioner: Optional[float] = 0.0
    is_skatt: Optional[float] = 0.0

class AnnualReportCreate(AnnualReportBase):
    start_date: date
    end_date: date

class AnnualReport(AnnualReportBase):
    id: int
    company_id: int
    bs_arets_resultat_ek: Optional[float] = 0.0 # Calculated field

    class Config:
        from_attributes = True

class CompanyBase(BaseModel):
    name: str
    org_nr: str  # <-- ÄNDRAD FRÅN 'orgnummer'

class CompanyCreate(CompanyBase):
    pass

class Company(CompanyBase):
    id: int
    
    class Config:
        from_attributes = True

class AccountBalance(BaseModel):
    account_number: str
    account_name: str
    balance: float

class SieParseResult(BaseModel):
    company_name: str
    org_nr: str
    start_date: date
    end_date: date
    accounts: List[AccountBalance]
    prev_accounts: List[AccountBalance]


# --- LÄGG TILL DENNA NYA KLASS ---
class Representative(BaseModel):
    name: str
    role: str

class AccountsData(BaseModel):
    current_year: List[AccountBalance]
    previous_year: List[AccountBalance]

class DetailedReportPayload(BaseModel):
    company_id: Optional[int] = None
    company_name: str
    org_nr: str
    start_date: date
    end_date: date
    accounts_data: AccountsData  # <-- ÄNDRAD RAD
    forvaltningsberattelse: str
    signature_city: str
    signature_date: date
    representatives: List[Representative]
