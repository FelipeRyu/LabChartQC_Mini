from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# Esquema para recibir datos del Frontend (Lo que el usuario digita)
class LoteCreate(BaseModel):
    numero_lote: str
    material_id: int
    nivel_control_id: Optional[int] = None

# Esquema para responderle al Frontend (Lo que devolvemos de la Base de Datos)
class LoteResponse(LoteCreate):
    id_lote: int
    activo: bool
    eliminado: bool
    fecha_registro: datetime

    class Config:
        from_attributes = True