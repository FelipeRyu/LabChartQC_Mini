from pydantic import BaseModel

class MetaCalidadCreate(BaseModel):
    analito_id: int
    tea: float  # Error Total Permitido
    fuente: str | None = None # Ej: CLIA, Ricos, etc.

class MetaCalidadResponse(MetaCalidadCreate):
    id_meta: int
    class Config:
        from_attributes = True
        