from pydantic import BaseModel



class PersonCreate(BaseModel):
    name: str
    farbe: str

class PersonOut(BaseModel):
    id: int
    name: str
    farbe: str

    class Config:
        from_attributes = True