# Archivo: app/schemas/corridas.py
from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class CorridaCreate(BaseModel):
    inserto_id: int
    valor_obtenido: float
    operario_id: Optional[int] = None   # Opcional: no todos los laboratorios tienen operarios registrados
    notas_usuario: Optional[str] = None


class CorridaResponse(BaseModel):
    id_corrida: int
    inserto_id: int
    valor_obtenido: float
    operario_id: Optional[int] = None
    fecha_corrida: datetime
    aceptada: bool
    observaciones: Optional[str] = None
    notas_usuario: Optional[str] = None

    class Config:
        from_attributes = True