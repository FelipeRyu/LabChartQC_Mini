from pydantic import BaseModel

class AreaCreate(BaseModel):
    nombre: str
    descripcion: str | None = None

class AreaResponse(AreaCreate):
    id_area: int
    class Config:
        from_attributes = True