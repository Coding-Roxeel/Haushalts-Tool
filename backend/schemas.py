from pydantic import BaseModel
from datetime import time



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