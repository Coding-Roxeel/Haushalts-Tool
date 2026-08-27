from sqlalchemy import Column, Integer, String
from database import Base



class Person(Base):
    __tablename__ = "personen"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    farbe = Column(String, nullable=False)