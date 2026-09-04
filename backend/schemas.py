from pydantic import BaseModel
from datetime import time, date
from typing import Optional



class PersonCreate(BaseModel):
    name: str
    farbe: str

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

class SchichtVorlageOut(BaseModel):
    id: int
    name: str
    start: time
    ende: time 

    class Config:
        from_attributes = True

class SchichtCreate(BaseModel):
    person_id: int
    datum: date
    start: time
    ende: time
    vorlage_id: Optional[int] = None

class SchichtOut(BaseModel):
    id: int
    person_id: int
    datum: date
    start: time
    ende: time
    vorlage_id: Optional[int] = None

    class Config:
        from_attributes = True