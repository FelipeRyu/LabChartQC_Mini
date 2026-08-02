# Archivo: app/schemas/operarios.py
from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class OperarioCreate(BaseModel):
    laboratorio_id: int
    nombre_completo: str
    identificacion: str

class OperarioResponse(OperarioCreate):
    id_operario: int
    activo: bool
    fecha_registro: datetime

    class Config:
        from_attributes = True