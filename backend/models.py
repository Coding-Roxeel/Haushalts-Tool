from sqlalchemy import Column, Integer, String, Time, Date, ForeignKey, DateTime
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

class Schicht(Base):
    __tablename__ = "schichten"

    id = Column(Integer, primary_key=True, index=True)
    person_id = Column(Integer, ForeignKey("personen.id"), nullable=False)
    datum = Column(Date, nullable=False)
    start = Column(Time, nullable=False)
    ende = Column(Time, nullable=False)
    vorlage_id = Column(Integer, ForeignKey("schicht_vorlagen.id"), nullable=True)

class Termin(Base):
    __tablename__ = "termine"

    id = Column(Integer,primary_key=True, index=True)
    person_id = Column(Integer, ForeignKey("personen.id"), nullable=False)
    titel = Column(String, nullable=False)
    datum_zeit = Column(DateTime, nullable=False)