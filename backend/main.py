from fastapi import FastAPI, Depends, HTTPException
from database import Base, engine, get_db
import models
from sqlalchemy.orm import Session
import schemas
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.exc import IntegrityError



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
    neue_vorlage = models.SchichtVorlage(
        name=vorlage.name,
        start=vorlage.start,
        ende=vorlage.ende,
        kuerzel=vorlage.kuerzel,
        farbe=vorlage.farbe,
    )
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
        titel=schicht.titel,
        kuerzel=schicht.kuerzel,
        farbe=schicht.farbe,
    )
    db.add(neue_schicht)
    db.commit()
    db.refresh(neue_schicht)
    return neue_schicht

@app.get("/schichten", response_model=list[schemas.SchichtOut])
def list_schichten(db:Session = Depends(get_db)):
    return db.query(models.Schicht).all()

@app.post("/termine", response_model=schemas.TerminOut)
def create_termin(termin: schemas.TerminCreate, db: Session = Depends(get_db)):
    neuer_termin = models.Termin(
        person_id=termin.person_id,
        titel=termin.titel,
        ende_zeit=termin.ende_zeit,
        datum_zeit=termin.datum_zeit,
        farbe=termin.farbe,
    )
    db.add(neuer_termin)
    db.commit()
    db.refresh(neuer_termin)
    return neuer_termin

@app.get("/termine", response_model=list[schemas.TerminOut])
def list_termine(db: Session = Depends(get_db)):
    return db.query(models.Termin).all()

@app.put ("/personen/{person_id}",response_model=schemas.PersonOut)
def update_person(person_id: int, person: schemas.PersonCreate, db: Session = Depends(get_db)):
    db_person = db.query(models.Person).filter(models.Person.id ==person_id).first()
    if db_person is None:
        raise HTTPException(status_code=404, detail="Person nicht gefunden")
    db_person.name = person.name
    db_person.farbe = person.farbe
    db.commit()
    db.refresh(db_person)
    return db_person

@app.delete("/personen/{person_id}")
def delete_person(person_id: int, cascade: bool = False, db: Session = Depends(get_db)):
    db_person = db.query(models.Person).filter(models.Person.id == person_id).first()
    if db_person is None:
        raise HTTPException(status_code=404, detail="Person nicht gefunden")
    if cascade:
        db.query(models.Schicht).filter(models.Schicht.person_id == person_id).delete()
        db.query(models.Termin).filter(models.Termin.person_id == person_id).delete()
        db.delete(db_person)
        db.commit()
        return {"message": "Person inkl. zugehöriger Schichten/Termine gelöscht"}
    try:
        db.delete(db_person)
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Person kann nicht gelöscht werden, da noch Schichten oder Termine darauf verweisen")
    return {"message": "Person gelöscht"}


@app.put("/schicht-vorlagen/{vorlage_id}", response_model=schemas.SchichtVorlageOut)
def update_schicht_vorlage(vorlage_id: int, vorlage: schemas.SchichtVorlageCreate, db: Session = Depends(get_db)):
    db_vorlage = db.query(models.SchichtVorlage).filter(models.SchichtVorlage.id == vorlage_id).first()
    if db_vorlage is None:
        raise HTTPException(status_code=404, detail="Schicht-Vorlage nicht gefunden")
    db_vorlage.name = vorlage.name
    db_vorlage.start = vorlage.start
    db_vorlage.ende = vorlage.ende
    db_vorlage.kuerzel = vorlage.kuerzel
    db_vorlage.farbe = vorlage.farbe
    db.commit()
    db.refresh(db_vorlage)
    return db_vorlage


@app.delete("/schicht-vorlagen/{vorlage_id}")
def delete_schicht_vorlage(vorlage_id: int, db: Session = Depends(get_db)):
    db_vorlage = db.query(models.SchichtVorlage).filter(models.SchichtVorlage.id == vorlage_id).first()
    if db_vorlage is None:
        raise HTTPException(status_code=404, detail="Schicht-Vorlage nicht gefunden")
    db.query(models.Schicht).filter(models.Schicht.vorlage_id == vorlage_id).update({"vorlage_id": None})
    db.delete(db_vorlage)
    db.commit()
    return {"message": "Schicht-Vorlage gelöscht, zugehörige Schichten entkoppelt"}


@app.put("/schichten/{schicht_id}", response_model=schemas.SchichtOut)
def update_schicht(schicht_id: int, schicht: schemas.SchichtCreate, db: Session = Depends(get_db)):
    db_schicht = db.query(models.Schicht).filter(models.Schicht.id == schicht_id).first()
    if db_schicht is None:
        raise HTTPException(status_code=404, detail="Schicht nicht gefunden")
    db_schicht.person_id = schicht.person_id
    db_schicht.datum = schicht.datum
    db_schicht.start = schicht.start
    db_schicht.ende = schicht.ende
    db_schicht.vorlage_id = schicht.vorlage_id
    db_schicht.titel = schicht.titel
    db_schicht.kuerzel = schicht.kuerzel
    db_schicht.farbe = schicht.farbe
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Ungültige person_id oder vorlage_id")
    db.refresh(db_schicht)
    return db_schicht


@app.delete("/schichten/{schicht_id}")
def delete_schicht(schicht_id: int, db: Session = Depends(get_db)):
    db_schicht = db.query(models.Schicht).filter(models.Schicht.id == schicht_id).first()
    if db_schicht is None:
        raise HTTPException(status_code=404, detail="Schicht nicht gefunden")
    db.delete(db_schicht)
    db.commit()
    return {"message": "Schicht gelöscht"}


@app.put("/termine/{termin_id}", response_model=schemas.TerminOut)
def update_termin(termin_id: int, termin: schemas.TerminCreate, db: Session = Depends(get_db)):
    db_termin = db.query(models.Termin).filter(models.Termin.id == termin_id).first()
    if db_termin is None:
        raise HTTPException(status_code=404, detail="Termin nicht gefunden")
    db_termin.person_id = termin.person_id
    db_termin.titel = termin.titel
    db_termin.datum_zeit = termin.datum_zeit
    db_termin.ende_zeit = termin.ende_zeit
    db_termin.farbe = termin.farbe
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Ungültige person_id")
    db.refresh(db_termin)
    return db_termin


@app.delete("/termine/{termin_id}")
def delete_termin(termin_id: int, db: Session = Depends(get_db)):
    db_termin = db.query(models.Termin).filter(models.Termin.id == termin_id).first()
    if db_termin is None:
        raise HTTPException(status_code=404, detail="Termin nicht gefunden")
    db.delete(db_termin)
    db.commit()
    return {"message": "Termin gelöscht"}
