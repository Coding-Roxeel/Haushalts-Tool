from pydantic import BaseModel, Field
from datetime import time, date, datetime
from typing import Annotated, Optional


Farbe = Annotated[str, Field(pattern=r"^#[0-9a-fA-F]{6}$")]

class PersonCreate(BaseModel):
    name: str
    farbe: Farbe

class PersonOut(BaseModel):
    id: int
    name: str
    farbe: str

    class Config:
        from_attributes = True

class SchichtVorlageCreate(BaseModel):
    name: str
    start: time
    ende: time
    kuerzel: Optional[str] = None
    farbe: Farbe

class SchichtVorlageOut(BaseModel):
    id: int
    name: str
    start: time
    ende: time 
    kuerzel: Optional[str] = None
    farbe: str

    class Config:
        from_attributes = True

class SchichtCreate(BaseModel):
    person_id: int
    datum: date
    start: time
    ende: time
    titel: str
    kuerzel: Optional[str] = None
    farbe:Farbe
    vorlage_id: Optional[int] = None

class SchichtOut(BaseModel):
    id: int
    person_id: int
    datum: date
    start: time
    ende: time
    titel: str
    kuerzel: Optional[str] = None
    farbe: str
    vorlage_id: Optional[int] = None

    class Config:
        from_attributes = True

class TerminCreate(BaseModel):
    person_id: int
    titel: str
    datum_zeit: datetime
    ende_zeit: datetime
    farbe: Farbe

class TerminOut(BaseModel):
    id: int
    person_id: int
    titel: str
    datum_zeit: datetime
    ende_zeit: datetime
    farbe: str

    class Config:
        from_attributes = True