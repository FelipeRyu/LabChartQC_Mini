# Archivo: app/schemas/insertos.py
from pydantic import BaseModel

class InsertoCreate(BaseModel):
    lote_id: int
    analito_id: int
    media_objetivo: float
    ds_objetivo: float

class InsertoResponse(InsertoCreate):
    id_inserto: int
    activo: bool

    class Config:
        from_attributes = True