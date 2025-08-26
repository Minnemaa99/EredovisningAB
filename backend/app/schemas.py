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


# --- NYA MODELLER FÖR BERÄKNAT RESULTAT ---

class ReportSection(BaseModel):
    """En generell sektion för en rad i en rapport, t.ex. Nettoomsättning."""
    current: float = 0.0
    previous: float = 0.0

class IncomeStatementSchema(BaseModel):
    """Struktur för Resultaträkningen."""
    net_sales: ReportSection
    cost_of_goods: ReportSection
    other_external_costs: ReportSection
    personnel_costs: ReportSection
    depreciation: ReportSection
    total_operating_expenses: ReportSection
    operating_profit: ReportSection
    financial_items: ReportSection
    profit_after_financial_items: ReportSection
    tax: ReportSection

class BalanceSheetSchema(BaseModel):
    """Struktur för Balansräkningen."""
    fixed_assets_tangible: ReportSection
    total_fixed_assets: ReportSection
    inventory: ReportSection
    current_receivables: ReportSection
    cash_and_bank: ReportSection
    total_current_assets: ReportSection
    restricted_equity: ReportSection
    untaxed_reserves: ReportSection
    long_term_liabilities: ReportSection
    current_liabilities: ReportSection
    total_liabilities: ReportSection

class K2CalculatedResult(BaseModel):
    """Det kompletta, nästlade resultatet från K2-kalkylatorn."""
    profit_loss: ReportSection
    free_equity: ReportSection
    total_assets: ReportSection
    total_equity: ReportSection
    total_equity_and_liabilities: ReportSection
    income_statement: IncomeStatementSchema
    balance_sheet: BalanceSheetSchema
    # För balanskontroll i frontend
    balance_check: ReportSection

class FullCalculationPayload(BaseModel):
    """Det objekt som skickas från SIE-uppladdning till frontend."""
    company_info: CompanyBase
    report_dates: dict[str, date]
    accounts_data: AccountsData
    k2_results: K2CalculatedResult
