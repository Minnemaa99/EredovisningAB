from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import configparser

# Read the database URL from alembic.ini
config = configparser.ConfigParser()
# When running alembic, the working directory is the `backend` directory.
config.read('alembic.ini')

SQLALCHEMY_DATABASE_URL = config['alembic']['sqlalchemy.url']

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()
