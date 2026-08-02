from pydantic import BaseModel

class ReglaWestgardCreate(BaseModel):
    nombre_regla: str # Ej: 12s, 13s, 22s
    descripcion: str
    es_error_aleatorio: bool
    es_error_sistematico: bool

class ReglaWestgardResponse(ReglaWestgardCreate):
    id_regla: int
    class Config:
        from_attributes = True