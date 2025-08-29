from sqlalchemy.orm import Session
from . import models, schemas

# Vi importerar inte längre k2_calculator här. CRUD ska inte göra beräkningar.

def create_company(db: Session, company: schemas.CompanyCreate):
    db_company = models.Company(name=company.name, org_nr=company.org_nr)
    db.add(db_company)
    db.commit()
    db.refresh(db_company)
    return db_company

def get_company(db: Session, company_id: int):
    return db.query(models.Company).filter(models.Company.id == company_id).first()

def get_company_by_org_nr(db: Session, org_nr: str):
    return db.query(models.Company).filter(models.Company.org_nr == org_nr).first()

def get_annual_report(db: Session, report_id: int):
    return db.query(models.AnnualReport).filter(models.AnnualReport.id == report_id).first()

def create_annual_report(db: Session, report: schemas.DetailedReportPayload, company_id: int):
    """
    Skapar en ny årsredovisning och sparar ENDAST rådata.
    Beräknade värden sparas inte längre i databasen.
    """
    # KORRIGERING: Se till att vi sparar rätt data i rätt fält enligt databasmodellen.
    # 'notes' tas bort och 'representatives' tilldelas korrekt.
    db_report = models.AnnualReport(
        company_id=company_id,
        start_date=report.start_date,
        end_date=report.end_date,
        
        # Spara den råa kontodatan och annan textdata
        accounts_data=report.accounts_data.model_dump(),
        # KORRIGERING: Återinför logiken för att spara not-datan.
        # Nu när modellen är fixad kommer detta att fungera.
        notes=report.notes_data, 
        forvaltningsberattelse=report.forvaltningsberattelse,
        signature_city=report.signature_city,
        signature_date=report.signature_date,
        # Säkerställ att listan med företrädare sparas korrekt.
        representatives=[rep.model_dump() for rep in report.representatives],
        dividend=report.dividend,  # <-- Lägg till denna rad!
        # NYTT: Spara flerarsOversikt (säkerställ att det är en lista av dicts)
        flerarsOversikt=[year.model_dump() for year in report.flerarsOversikt] if report.flerarsOversikt else [],
    )
    
    db.add(db_report)
    db.commit()
    db.refresh(db_report)
    return db_report

# De gamla funktionerna 'update_report' och 'create_report' har tagits bort
# eftersom de använde raderade scheman och inte längre anropades från main.py.
