from fastapi import FastAPI, Depends
from database import Base, engine, get_db
import models
from sqlalchemy.orm import Session
import schemas
from fastapi.middleware.cors import CORSMiddleware



Base.metadata.create_all(bind=engine)
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Bärenhöhle Backend läuft"}



@app.post("/personen", response_model=schemas.PersonOut)
def create_person(person: schemas.PersonCreate, db: Session = Depends(get_db)):
    neue_person = models.Person(name=person.name, farbe=person.farbe)
    db.add(neue_person)
    db.commit()
    db.refresh(neue_person)
    return neue_person


@app.get("/personen", response_model=list[schemas.PersonOut])
def list_personen(db: Session = Depends(get_db)):
    return db.query(models.Person).all()