# Archivo: app/schemas/materiales.py
"""
MÓDULO DE ESQUEMAS PARA MATERIALES DE CONTROL (Pydantic)
========================================================
Estos esquemas definen la estructura exacta de los datos (JSON) que el 
Frontend de React enviará a nuestra API, y los datos que la API le devolverá.

Pydantic se encarga automáticamente de validar que los datos sean correctos 
(ej: que una fecha sea realmente una fecha y no texto al azar).
"""

from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import date

# -------------------------------------------------------------------
# 1. ESQUEMA BASE
# -------------------------------------------------------------------
class MaterialControlBase(BaseModel):
    """
    Campos comunes compartidos tanto al CREAR como al LEER un material.
    """
    nombre_material: str     # Ej. "Bio-Rad Multiqual"
    fabricante: Optional[str] = None # Ej. "Bio-Rad". Es opcional (puede ser null)
    fecha_vencimiento: Optional[date] = None # Ej. "2026-12-31"
    laboratorio_id: int      # Obligatorio saber a qué lab pertenece
    area_id: Optional[int] = None # Opcional saber el área específica

# -------------------------------------------------------------------
# 2. ESQUEMA DE CREACIÓN (Lo que envía React en un POST)
# -------------------------------------------------------------------
class MaterialControlCreate(MaterialControlBase):
    """
    Datos requeridos cuando el usuario (Frontend) quiere registrar 
    un NUEVO material. Hereda todo del Base. No necesitamos añadir
    el ID porque la base de datos lo genera automáticamente.
    """
    pass # 'pass' significa que no añadimos campos extra, usamos los de la Base.

# -------------------------------------------------------------------
# 3. ESQUEMA DE LECTURA (Lo que la API devuelve en un GET)
# -------------------------------------------------------------------
class MaterialControlResponse(MaterialControlBase):
    """
    Datos que la API le responde al Frontend cuando pide ver un material.
    Aquí SÍ incluimos el ID generado por la base de datos y el estado.
    """
    id_material: int
    activo: bool
    
    # Esta configuración es clave: Le dice a Pydantic que estos datos 
    # vienen de una clase de SQLAlchemy (Base de Datos) y debe convertirlos a JSON.
    model_config = ConfigDict(from_attributes=True)