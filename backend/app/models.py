from sqlalchemy import Column, Integer, String, Date, ForeignKey, Float, Text
from sqlalchemy.orm import relationship
from sqlalchemy.types import JSON

from .database import Base

class Company(Base):
    __tablename__ = "companies"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    org_nr = Column(String, unique=True, index=True, nullable=False) # <-- ÄNDRAD FRÅN 'orgnummer'
    # ... other company fields

    annual_reports = relationship("AnnualReport", back_populates="company")


class AnnualReport(Base):
    __tablename__ = "annual_reports"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"))
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)

    # Lägg till detta nya fält
    accounts_data = Column(JSON)
    notes = Column(JSON, nullable=True) # NYTT FÄLT
    forvaltningsberattelse = Column(String, nullable=True)
    signature_city = Column(String, nullable=True)
    signature_date = Column(Date, nullable=True)
    representatives = Column(JSON, nullable=True)
    # NYTT: Lägg till ett fält för föreslagen utdelning.
    dividend = Column(Float, default=0.0)  # <-- Lägg till denna rad!

    # --- Balance Sheet (Balansräkning) ---
    # Anläggningstillgångar
    bs_materiella_anlaggningstillgangar = Column(Float, default=0.0)
    bs_finansiella_anlaggningstillgangar = Column(Float, default=0.0)

    # Omsättningstillgångar
    bs_varulager = Column(Float, default=0.0)
    bs_kundfordringar = Column(Float, default=0.0)
    bs_ovriga_fordringar = Column(Float, default=0.0)
    bs_forutbetalda_kostnader = Column(Float, default=0.0)
    bs_kassa_bank = Column(Float, default=0.0)

    # Eget kapital och skulder
    bs_bundet_eget_kapital = Column(Float, default=0.0)
    bs_fritt_eget_kapital = Column(Float, default=0.0)
    bs_arets_resultat_ek = Column(Float, default=0.0) # From income statement

    bs_obeskattade_reserver = Column(Float, default=0.0)
    bs_langfristiga_skulder = Column(Float, default=0.0)
    bs_kortfristiga_skulder = Column(Float, default=0.0)

    # --- Income Statement (Resultaträkning) ---
    is_nettoomsattning = Column(Float, default=0.0)
    is_forandring_lager = Column(Float, default=0.0)
    is_ovriga_rorelseintakter = Column(Float, default=0.0)
    is_kostnad_ravaror = Column(Float, default=0.0)
    is_kostnad_externa = Column(Float, default=0.0)
    is_kostnad_personal = Column(Float, default=0.0)
    is_avskrivningar = Column(Float, default=0.0)
    is_finansiella_intakter = Column(Float, default=0.0)
    is_finansiella_kostnader = Column(Float, default=0.0)
    is_bokslutsdispositioner = Column(Float, default=0.0)
    is_skatt = Column(Float, default=0.0)

    # Relationships
    company = relationship("Company", back_populates="annual_reports")
