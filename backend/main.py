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

@app.post("/schicht-vorlagen", response_model=schemas.SchichtVorlageOut)
def create_schicht_vorlage(vorlage: schemas.SchichtVorlageCreate, db: Session = Depends(get_db)):
    neue_vorlage = models.SchichtVorlage(name=vorlage.name, start=vorlage.start, ende=vorlage.ende)
    db.add(neue_vorlage)
    db.commit()
    db.refresh(neue_vorlage)
    return neue_vorlage

@app.get("/schicht-vorlagen", response_model=list[schemas.SchichtVorlageOut])
def list_schicht_vorlagen(db: Session = Depends(get_db)):
    return db.query(models.SchichtVorlage).all()

@app.post("/schichten", response_model=schemas.SchichtOut)
def create_schicht(schicht: schemas.SchichtCreate, db: Session = Depends(get_db)):
    neue_schicht = models.Schicht(
        person_id=schicht.person_id,
        datum=schicht.datum,
        start=schicht.start,
        ende=schicht.ende,
        vorlage_id=schicht.vorlage_id,
    )
    db.add(neue_schicht)
    db.commit()
    db.refresh(neue_schicht)
    return neue_schicht

@app.get("/schichten", response_model=list[schemas.SchichtOut])
def list_schichten(db:Session = Depends(get_db)):
    return db.query(models.Schicht).all()
