# Archivo: app/schemas/corridas.py
from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class CorridaCreate(BaseModel):
    operario_id: int
    inserto_id: int
    valor_obtenido: float
    notas_usuario: Optional[str] = None

class CorridaResponse(CorridaCreate):
    id_corrida: int
    fecha_corrida: datetime
    aceptada: bool

    class Config:
        from_attributes = True