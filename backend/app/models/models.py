# Archivo: app/models/models.py
"""
MÓDULO DE MODELOS DE BASE DE DATOS (SQLAlchemy)
===============================================
Este archivo contiene las definiciones de todas las tablas de la base de datos para LabChart QC.
Cada clase de Python aquí definida hereda de 'Base' y se traduce directamente en una tabla
dentro de PostgreSQL.

Notas para el Frontend (React):
- Las relaciones (ForeignKey) indican cómo se conectan los datos. Por ejemplo, un 'Lote' 
  siempre pertenece a un 'Material de Control'.
- Los campos Booleanos (como 'activo' o 'eliminado') se usan para hacer "Soft Deletes".
"""

from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Float, Text, Date
from sqlalchemy.orm import relationship # <--- ¡AQUÍ ESTÁ LA MAGIA QUE FALTABA!
from sqlalchemy.sql import func
from app.core.database import Base

# --- 1. LABORATORIOS ---
class Laboratorio(Base):
    """Almacena la información de las instituciones o sedes que usan el software."""
    __tablename__ = "laboratorios"
    
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), unique=True, nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    hash_contrasena = Column(String(255), nullable=False)
    rol = Column(String(20), default="laboratorio", nullable=False)
    fecha_creacion = Column(DateTime(timezone=True), server_default=func.now())

# --- 2. ÁREAS ---
class AreaLaboratorio(Base):
    """Secciones dentro del laboratorio (ej. Hematología, Química Clínica, Inmunología)."""
    __tablename__ = "areas_laboratorio"
    
    id = Column(Integer, primary_key=True, index=True)
    laboratorio_id = Column(Integer, ForeignKey("laboratorios.id"), nullable=False)
    nombre = Column(String(100), nullable=False)
    fecha_creacion = Column(DateTime(timezone=True), server_default=func.now())

# --- 3. OPERARIOS ---
class Operario(Base):
    """Personal del laboratorio (bacteriólogos, técnicos) que ingresan los resultados."""
    __tablename__ = "operarios"
    
    id_operario = Column(Integer, primary_key=True, index=True)
    laboratorio_id = Column(Integer, ForeignKey("laboratorios.id"), nullable=False)
    nombre_completo = Column(String(120), nullable=False)
    identificacion = Column(String(50), unique=True, nullable=False)
    activo = Column(Boolean, default=True)
    fecha_registro = Column(DateTime(timezone=True), server_default=func.now())

# --- 4. ANALITOS ---
class Analito(Base):
    """Las pruebas específicas que se miden (ej. Glucosa, Colesterol, Hemoglobina)."""
    __tablename__ = "analitos"
    
    id_analito = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(120), unique=True, nullable=False)
    categoria = Column(String(100))
    subcategoria = Column(String(100))
    unidad_medida = Column(String(30))
    activo = Column(Boolean, default=True)

# --- 5. NIVELES DE CONTROL ---
class NivelControl(Base):
    """Define si el control es Normal, Patológico (Alto) o Bajo."""
    __tablename__ = "niveles_control"
    
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(40), unique=True, nullable=False)
    descripcion = Column(Text)

# --- 6. MATERIALES DE CONTROL ---
class MaterialControl(Base):
    """El producto comercial comprado para hacer QC."""
    __tablename__ = "materiales_control"
    
    id_material = Column(Integer, primary_key=True, index=True)
    laboratorio_id = Column(Integer, ForeignKey("laboratorios.id"), nullable=False)
    area_id = Column(Integer, ForeignKey("areas_laboratorio.id"))
    nombre_material = Column(String(150), nullable=False)
    fabricante = Column(String(120))
    fecha_vencimiento = Column(Date)
    activo = Column(Boolean, default=True)
    eliminado = Column(Boolean, default=False)

# --- 7. LOTES FÍSICOS ---
class LoteMaterial(Base):
    """El vial específico del material comercial. Un material puede tener muchos lotes."""
    __tablename__ = "lotes_material"
    
    id_lote = Column(Integer, primary_key=True, index=True)
    material_id = Column(Integer, ForeignKey("materiales_control.id_material"), nullable=False)
    numero_lote = Column(String(80), nullable=False)
    nivel_control_id = Column(Integer, ForeignKey("niveles_control.id"))
    fecha_registro = Column(DateTime(timezone=True), server_default=func.now())
    activo = Column(Boolean, default=True)
    eliminado = Column(Boolean, default=False)
    
    # Esta es la relación que causaba el error porque no estaba importada arriba
    material = relationship("MaterialControl")

# --- 8. INSERTO VALORES ---
class InsertoValor(Base):
    """Los valores teóricos (Media y DS)."""
    __tablename__ = "inserto_valores"
    
    id_inserto = Column(Integer, primary_key=True, index=True)
    lote_id = Column(Integer, ForeignKey("lotes_material.id_lote"), nullable=False)
    analito_id = Column(Integer, ForeignKey("analitos.id_analito"), nullable=False)
    media_objetivo = Column(Float, nullable=False)
    ds_objetivo = Column(Float, nullable=False)
    activo = Column(Boolean, default=True)

# --- 9. CONFIGURACIÓN DE UI ---
class AnalitoConfiguracion(Base):
    """Relaciona un analito con sus diferentes niveles de control."""
    __tablename__ = "analito_configuracion"
    
    id_config = Column(Integer, primary_key=True, index=True)
    area_id = Column(Integer, ForeignKey("areas_laboratorio.id"), nullable=False)
    analito_id = Column(Integer, ForeignKey("analitos.id_analito"), nullable=False)
    inserto_nivel_bajo_id = Column(Integer, ForeignKey("inserto_valores.id_inserto"))
    inserto_nivel_normal_id = Column(Integer, ForeignKey("inserto_valores.id_inserto"))
    inserto_nivel_alto_id = Column(Integer, ForeignKey("inserto_valores.id_inserto"))
    activo = Column(Boolean, default=True)

# --- 10. METAS DE CALIDAD ---
class MetaCalidad(Base):
    """Los límites máximos de error permitidos."""
    __tablename__ = "metas_calidad"
    
    id_meta = Column(Integer, primary_key=True, index=True)
    analito_id = Column(Integer, ForeignKey("analitos.id_analito"), nullable=False)
    fuente = Column(String(80), nullable=False)
    limite_error_total = Column(Float, nullable=False)
    fecha_vigencia = Column(Date, nullable=False)
    comentario = Column(Text)

# --- 11. CORRIDAS ---
class Corrida(Base):
    """El núcleo del sistema. Un resultado individual."""
    __tablename__ = "corridas"
    
    id_corrida = Column(Integer, primary_key=True, index=True)
    operario_id = Column(Integer, ForeignKey("operarios.id_operario"))
    inserto_id = Column(Integer, ForeignKey("inserto_valores.id_inserto"), nullable=False)
    fecha_corrida = Column(DateTime(timezone=True), server_default=func.now())
    valor_obtenido = Column(Float, nullable=False)
    aceptada = Column(Boolean, default=True)
    observaciones = Column(Text)
    notas_usuario = Column(Text)

# --- 12. REGLAS WESTGARD ---
class ReglaWestgard(Base):
    """Catálogo estático de las reglas matemáticas."""
    __tablename__ = "reglas_westgard"
    
    id_regla = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(30), unique=True, nullable=False)
    descripcion = Column(Text, nullable=False)
    tipo_accion = Column(String(20), nullable=False)
    causa_probable = Column(Text)
    recomendacion = Column(Text)
    activa = Column(Boolean, default=True)

# --- 13. EVENTOS DE CORRIDA ---
class EventoCorrida(Base):
    """Registro de las alarmas generadas."""
    __tablename__ = "eventos_corrida"
    
    id_evento = Column(Integer, primary_key=True, index=True)
    corrida_id = Column(Integer, ForeignKey("corridas.id_corrida"), nullable=False)
    regla_id = Column(Integer, ForeignKey("reglas_westgard.id_regla"))
    tipo_evento = Column(String(60), nullable=False)
    descripcion = Column(Text)
    fecha_evento = Column(DateTime(timezone=True), server_default=func.now())
    resuelto = Column(Boolean, default=False)

# --- 14. ESTADÍSTICOS MENSUALES ---
class EstadisticoMensual(Base):
    """Tabla resumen para guardar los cálculos pesados."""
    __tablename__ = "estadisticos_mensuales"
    
    id = Column(Integer, primary_key=True, index=True)
    inserto_id = Column(Integer, ForeignKey("inserto_valores.id_inserto"), nullable=False)
    periodo_year = Column(Integer, nullable=False)
    periodo_month = Column(Integer, nullable=False)
    n_corridas = Column(Integer, nullable=False)
    media_calculada = Column(Float)
    ds_calculada = Column(Float)
    sesgo = Column(Float)
    cv_calculado = Column(Float)
    error_total = Column(Float)
    limite_error_total_permitido = Column(Float, nullable=False)
    cumple_meta = Column(Boolean, nullable=False)
    fecha_calculo = Column(DateTime(timezone=True), server_default=func.now())

