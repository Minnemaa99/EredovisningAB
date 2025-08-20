from sqlalchemy import Column, Integer, String, ForeignKey, JSON, Date
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)

    companies = relationship("Company", back_populates="owner")

class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)
    orgnummer = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)

    owner_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="companies")

    annual_reports = relationship("AnnualReport", back_populates="company")

class AnnualReport(Base):
    __tablename__ = "annual_reports"

    id = Column(Integer, primary_key=True, index=True)
    year = Column(Integer, nullable=False)
    status = Column(String, default="new") # e.g., new, processing, completed, paid

    # Using JSON to store the report data flexibly.
    # This can hold imported SIE data, manual entries, etc.
    report_data = Column(JSON)

    company_id = Column(Integer, ForeignKey("companies.id"))
    company = relationship("Company", back_populates="annual_reports")
