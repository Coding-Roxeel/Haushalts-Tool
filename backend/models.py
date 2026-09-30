from sqlalchemy import Column, Integer, String, Time, Date, ForeignKey, DateTime, Table
from sqlalchemy.orm import relationship
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
    kuerzel = Column(String, nullable=True)
    farbe = Column(String, nullable=False)
    person_id = Column(Integer, ForeignKey("personen.id", ondelete="SET NULL"), nullable=True)
    
class Schicht(Base):
    __tablename__ = "schichten"

    id = Column(Integer, primary_key=True, index=True)
    person_id = Column(Integer, ForeignKey("personen.id"), nullable=False)
    datum = Column(Date, nullable=False)
    start = Column(Time, nullable=False)
    ende = Column(Time, nullable=False)
    vorlage_id = Column(Integer, ForeignKey("schicht_vorlagen.id"), nullable=True)
    titel = Column(String, nullable=False)
    kuerzel = Column(String, nullable=True)
    farbe = Column(String, nullable=False)

termin_personen = Table(
    "termin_personen",
    Base.metadata,
    Column("termin_id", Integer, ForeignKey("termine.id", ondelete="CASCADE"), primary_key=True),
    Column("person_id", Integer, ForeignKey("personen.id"), primary_key=True),
)

class Termin(Base):
    __tablename__ = "termine"

    id = Column(Integer, primary_key=True, index=True)
    titel = Column(String, nullable=False)
    datum_zeit = Column(DateTime, nullable=False)
    ende_zeit = Column(DateTime, nullable=False)
    farbe = Column(String, nullable=False)
    personen = relationship("Person", secondary=termin_personen)

    @property
    def person_ids(self):
        return [p.id for p in self.personen]
