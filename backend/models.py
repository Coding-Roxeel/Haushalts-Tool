from sqlalchemy import Column, Integer, String, Time
from database import Base



class Person(Base):
    __tablename__ = "personen"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    farbe = Column(String, nullable=False)

class SchichtVorlage(Base):
    __tablename__ = "schicht_vorlagen"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    start = Column(Time, nullable=False)
    ende = Column(Time, nullable=False)