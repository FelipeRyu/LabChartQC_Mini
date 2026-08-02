# Archivo: app/schemas/analitos.py
from pydantic import BaseModel
from typing import Optional

class AnalitoCreate(BaseModel):
    nombre: str
    categoria: Optional[str] = None
    subcategoria: Optional[str] = None
    unidad_medida: Optional[str] = None

class AnalitoResponse(AnalitoCreate):
    id_analito: int
    activo: bool

    class Config:
        from_attributes = True