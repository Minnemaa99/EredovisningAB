from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import configparser

# This is a simple way to read the config. In a larger app, you might use
# environment variables or a more robust config library.
config = configparser.ConfigParser()
config.read('alembic.ini')

SQLALCHEMY_DATABASE_URL = config['alembic']['sqlalchemy.url']

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    # connect_args is needed for SQLite to allow multi-threaded access
    connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()
