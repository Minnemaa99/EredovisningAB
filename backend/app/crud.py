from sqlalchemy.orm import Session
from . import models, schemas, k2_calculator # <-- Importera k2_calculator

def create_company(db: Session, company: schemas.CompanyCreate):
    db_company = models.Company(name=company.name, org_nr=company.org_nr)
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

def get_company(db: Session, company_id: int):
    return db.query(models.Company).filter(models.Company.id == company_id).first()

def get_company_by_org_nr(db: Session, org_nr: str):
    return db.query(models.Company).filter(models.Company.org_nr == org_nr).first()

def get_annual_report(db: Session, report_id: int):
    return db.query(models.AnnualReport).filter(models.AnnualReport.id == report_id).first()

def create_annual_report(db: Session, report: schemas.DetailedReportPayload, company_id: int):
    """
    Skapar en ny årsredovisning genom att först beräkna K2-värden
    och sedan spara dem i de specifika fälten i databasmodellen.
    """
    # 1. Konvertera Pydantic-objekten till vanliga listor med dictionaries
    accounts_data = [acc.model_dump() for acc in report.accounts_data.current_year]
    prev_accounts_data = [acc.model_dump() for acc in report.accounts_data.previous_year]

    # 2. Använd din befintliga kalkylator för att beräkna alla summor
    k2_results = k2_calculator.calculate_k2_values(accounts_data, prev_accounts_data)

    # 3. Skapa databasobjektet med de beräknade värdena
    db_report = models.AnnualReport(
        company_id=company_id,
        start_date=report.start_date,
        end_date=report.end_date,
        
        # Spara den råa kontodatan
        accounts_data=report.accounts_data.model_dump(),
        
        # Spara övrig textdata
        forvaltningsberattelse=report.forvaltningsberattelse,
        signature_city=report.signature_city,
        signature_date=report.signature_date,
        representatives=[rep.model_dump() for rep in report.representatives],

        # Fyll på med värden från K2-resultaten
        # Balansräkning
        bs_materiella_anlaggningstillgangar=k2_results.get('fixed_assets_material', 0),
        bs_finansiella_anlaggningstillgangar=k2_results.get('fixed_assets_financial', 0),
        bs_varulager=k2_results.get('current_assets_inventory', 0),
        bs_kundfordringar=k2_results.get('current_assets_receivables', 0),
        bs_ovriga_fordringar=k2_results.get('current_assets_other_receivables', 0),
        bs_forutbetalda_kostnader=k2_results.get('current_assets_prepaid', 0),
        bs_kassa_bank=k2_results.get('current_assets_cash_bank', 0),
        bs_bundet_eget_kapital=k2_results.get('restricted_equity', 0),
        bs_fritt_eget_kapital=k2_results.get('free_equity', 0),
        bs_arets_resultat_ek=k2_results.get('profit_loss', 0),
        bs_obeskattade_reserver=k2_results.get('untaxed_reserves', 0),
        bs_langfristiga_skulder=k2_results.get('long_term_liabilities', 0),
        bs_kortfristiga_skulder=k2_results.get('short_term_liabilities', 0),

        # Resultaträkning
        is_nettoomsattning=k2_results.get('revenue_sales', 0),
        is_forandring_lager=k2_results.get('revenue_inventory_change', 0),
        is_ovriga_rorelseintakter=k2_results.get('revenue_other', 0),
        is_kostnad_ravaror=k2_results.get('costs_raw_materials', 0),
        is_kostnad_externa=k2_results.get('costs_external', 0),
        is_kostnad_personal=k2_results.get('costs_personnel', 0),
        is_avskrivningar=k2_results.get('costs_depreciation', 0),
        is_finansiella_intakter=k2_results.get('financial_income', 0),
        is_finansiella_kostnader=k2_results.get('financial_costs', 0),
        is_bokslutsdispositioner=k2_results.get('appropriations', 0),
        is_skatt=k2_results.get('tax', 0)
    )
    
    db.add(db_report)
    db.commit()
    db.refresh(db_report)
    return db_report
