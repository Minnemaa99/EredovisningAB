from pydantic import BaseModel, Field
from typing import Optional, List, Any
from datetime import date

# --- Grundläggande datamodeller ---

class CompanyBase(BaseModel):
    name: str
    org_nr: str

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

class AccountsData(BaseModel):
    current_year: List[AccountBalance]
    previous_year: List[AccountBalance]

class Representative(BaseModel):
    name: str
    role: str

# --- Scheman för API-kommunikation ---

class DetailedReportPayload(BaseModel):
    """Data som skickas från frontend för att spara eller förhandsgranska en rapport."""
    company_id: Optional[int] = None
    company_name: str
    org_nr: str
    start_date: date
    end_date: date
    accounts_data: AccountsData
    forvaltningsberattelse: str
    notes_data: Optional[dict[str, Any]] = None
    signature_city: str
    signature_date: date
    representatives: List[Representative]
    # NYTT: Lägg till fält för utdelning i payloaden från frontend.
    dividend: float = 0.0

# --- NYA, KORREKTA SCHEMAN FÖR K2-RESULTAT ---
# Dessa matchar nu exakt outputen från k2_calculator.py

class ReportItem(BaseModel):
    """En generell post i en rapport, t.ex. Nettoomsättning."""
    current: float
    previous: float
    note_ref: Optional[int] = None

class IncomeStatementSchema(BaseModel):
    """Struktur för Resultaträkningen, speglar k2_calculator."""
    net_sales: ReportItem
    other_operating_income: ReportItem
    total_operating_income: ReportItem
    raw_materials: ReportItem
    other_external_costs: ReportItem
    personnel_costs: ReportItem
    depreciation: ReportItem
    other_operating_expenses: ReportItem
    total_operating_expenses: ReportItem
    operating_profit: ReportItem
    financial_income: ReportItem
    financial_costs: ReportItem
    profit_after_financial_items: ReportItem
    appropriations: ReportItem
    profit_before_tax: ReportItem
    tax: ReportItem

class BalanceSheetSchema(BaseModel):
    """Struktur för Balansräkningen, speglar k2_calculator."""
    fixed_assets_tangible: ReportItem
    fixed_assets_financial: ReportItem # Lade till denna tidigare, men den saknades här
    total_fixed_assets: ReportItem
    inventory: ReportItem
    current_receivables: ReportItem
    cash_and_bank: ReportItem
    total_current_assets: ReportItem
    restricted_equity: ReportItem
    free_equity_retained: ReportItem
    profit_loss_for_equity: ReportItem
    total_equity: ReportItem
    untaxed_reserves: ReportItem
    long_term_liabilities: ReportItem
    current_liabilities: ReportItem
    total_liabilities: ReportItem
    # SLUTGILTIG LÖSNING: Lägg till det saknade fältet.
    solvency_ratio: ReportItem

# NYTT: Definiera en modell för en enskild aktiv not.
class ActiveNoteItem(BaseModel):
    ref: int
    title: str

class K2CalculatedResult(BaseModel):
    """Det kompletta, nästlade resultatet från K2-kalkylatorn."""
    income_statement: IncomeStatementSchema
    balance_sheet: BalanceSheetSchema
    profit_loss: ReportItem
    total_assets: ReportItem
    total_equity_and_liabilities: ReportItem
    balance_check: ReportItem # Används för balanskontroll i frontend
    # KORRIGERING: Lägg till det saknade fältet för aktiva noter.
    active_notes: dict[str, ActiveNoteItem]

class FullCalculationPayload(BaseModel):
    """Det kompletta objekt som skickas från SIE-uppladdning till frontend."""
    company_info: CompanyBase
    report_dates: dict[str, date]
    accounts_data: AccountsData
    k2_results: K2CalculatedResult

# --- Scheman för databasmodeller (endast för läsning) ---

class AnnualReport(BaseModel):
    """Schema för att läsa en sparad årsredovisning från databasen."""
    id: int
    company_id: int
    start_date: date
    end_date: date
    accounts_data: dict # JSON-fält
    forvaltningsberattelse: str
    signature_city: str
    signature_date: date
    representatives: list # JSON-fält
    # NYTT: Lägg till fältet för att kunna läsa det från databasen.
    dividend: float

    class Config:
        from_attributes = True
