from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey, Text
from sqlalchemy.orm import relationship
from .database import Base

class Company(Base):
    __tablename__ = "companies"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    orgnummer = Column(String, unique=True, index=True, nullable=False)
    postadress = Column(String)
    postnummer = Column(String)
    postort = Column(String)

    # Relationships
    annual_reports = relationship("AnnualReport", back_populates="company")
    settings = relationship("Setting", back_populates="company")

class AnnualReport(Base):
    __tablename__ = "annual_reports"
    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"))
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)

    # Relationships
    company = relationship("Company", back_populates="annual_reports")
    account_lines = relationship("AccountLine", back_populates="report")
    notes = relationship("Note", back_populates="report")

class AccountLine(Base):
    __tablename__ = "account_lines"
    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(Integer, ForeignKey("annual_reports.id"))
    account_number = Column(String, nullable=False)
    balance_current_year = Column(Float, nullable=False)
    balance_prev_year_1 = Column(Float)
    balance_prev_year_2 = Column(Float)
    balance_prev_year_3 = Column(Float)

    # Relationship
    report = relationship("AnnualReport", back_populates="account_lines")

class Note(Base):
    __tablename__ = "notes"
    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(Integer, ForeignKey("annual_reports.id"))
    note_type = Column(String) # e.g., "Redovisningsprinciper"
    content = Column(Text)

    # Relationship
    report = relationship("AnnualReport", back_populates="notes")

class Setting(Base):
    __tablename__ = "settings"
    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"))
    depreciation_period_assets = Column(Integer, default=5)
    average_employees = Column(Integer)
    signature_place = Column(String, default="Helsingborg")
    signature_date = Column(Date)

    # Store signatories as a JSON list of dicts for flexibility
    # e.g., [{"name": "Anna Andersson", "ssn": "YYYYMMDD-XXXX", "role": "Styrelseledamot"}]
    signatories = Column(Text)

    # Relationship
    company = relationship("Company", back_populates="settings")
