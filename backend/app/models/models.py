# Archivo: app/models.py
"""
MÓDULO DE MODELOS DE BASE DE DATOS (SQLAlchemy)
===============================================
Este archivo contiene las definiciones de todas las tablas de la base de datos para LabChart QC.
Cada clase de Python aquí definida hereda de 'Base' y se traduce directamente en una tabla
dentro de PostgreSQL.

Notas para el Frontend (React):
- Las relaciones (ForeignKey) indican cómo se conectan los datos. Por ejemplo, un 'Lote' 
  siempre pertenece a un 'Material de Control'.
- Los campos Booleanos (como 'activo' o 'eliminado') se usan para hacer "Soft Deletes", es decir,
  no borramos los datos reales por trazabilidad, solo los ocultamos de la interfaz.
"""

from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Float, Text, Date
from sqlalchemy.sql import func
from app.core.database import Base

# --- 1. LABORATORIOS ---
class Laboratorio(Base):
    """Almacena la información de las instituciones o sedes que usan el software."""
    __tablename__ = "laboratorios"
    
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), unique=True, nullable=False) # Nombre de la sede, ej: "Sede Central"
    email = Column(String(100), unique=True, nullable=False)  # Correo principal de contacto
    hash_contrasena = Column(String(255), nullable=False)     # Contraseña encriptada, NUNCA en texto plano
    rol = Column(String(20), default="laboratorio", nullable=False) # Define permisos (ej: admin, user)
    fecha_creacion = Column(DateTime(timezone=True), server_default=func.now()) # Se llena sola al registrarse

# --- 2. ÁREAS ---
class AreaLaboratorio(Base):
    """Secciones dentro del laboratorio (ej. Hematología, Química Clínica, Inmunología)."""
    __tablename__ = "areas_laboratorio"
    
    id = Column(Integer, primary_key=True, index=True)
    laboratorio_id = Column(Integer, ForeignKey("laboratorios.id"), nullable=False) # Vinculado al Laboratorio
    nombre = Column(String(100), nullable=False)
    fecha_creacion = Column(DateTime(timezone=True), server_default=func.now())

# --- 3. OPERARIOS ---
class Operario(Base):
    """Personal del laboratorio (bacteriólogos, técnicos) que ingresan los resultados."""
    __tablename__ = "operarios"
    
    id_operario = Column(Integer, primary_key=True, index=True)
    laboratorio_id = Column(Integer, ForeignKey("laboratorios.id"), nullable=False)
    nombre_completo = Column(String(120), nullable=False)
    identificacion = Column(String(50), unique=True, nullable=False) # CC, Pasaporte, etc.
    activo = Column(Boolean, default=True) # Si es False, el operario ya no trabaja allí
    fecha_registro = Column(DateTime(timezone=True), server_default=func.now())

# --- 4. ANALITOS ---
class Analito(Base):
    """Las pruebas específicas que se miden (ej. Glucosa, Colesterol, Hemoglobina)."""
    __tablename__ = "analitos"
    
    id_analito = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(120), unique=True, nullable=False)
    categoria = Column(String(100)) # Ej. Enzimas, Hormonas
    subcategoria = Column(String(100))
    unidad_medida = Column(String(30)) # Ej. mg/dL, mmol/L
    activo = Column(Boolean, default=True)

# --- 5. NIVELES DE CONTROL ---
class NivelControl(Base):
    """Define si el control es Normal, Patológico (Alto) o Bajo."""
    __tablename__ = "niveles_control"
    
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(40), unique=True, nullable=False) # Ej. "Nivel 1", "Nivel 2"
    descripcion = Column(Text)

# --- 6. MATERIALES DE CONTROL ---
class MaterialControl(Base):
    """El producto comercial comprado para hacer QC (ej. 'Randox Acusera', 'Bio-Rad Multiqual')."""
    __tablename__ = "materiales_control"
    
    id_material = Column(Integer, primary_key=True, index=True)
    laboratorio_id = Column(Integer, ForeignKey("laboratorios.id"), nullable=False)
    area_id = Column(Integer, ForeignKey("areas_laboratorio.id")) # A qué área pertenece este material
    nombre_material = Column(String(150), nullable=False)
    fabricante = Column(String(120))
    fecha_vencimiento = Column(Date) # Crucial para las alertas de "Material Vencido" en el Dashboard
    activo = Column(Boolean, default=True)
    eliminado = Column(Boolean, default=False) # Soft delete

# --- 7. LOTES FÍSICOS ---
class LoteMaterial(Base):
    """El vial específico del material comercial. Un material puede tener muchos lotes a lo largo del tiempo."""
    __tablename__ = "lotes_material"
    
    id_lote = Column(Integer, primary_key=True, index=True)
    material_id = Column(Integer, ForeignKey("materiales_control.id_material"), nullable=False)
    numero_lote = Column(String(80), nullable=False) # Ej. "BQ-2025-01"
    nivel_control_id = Column(Integer, ForeignKey("niveles_control.id")) # Nivel asignado a este lote
    fecha_registro = Column(DateTime(timezone=True), server_default=func.now())
    activo = Column(Boolean, default=True)
    eliminado = Column(Boolean, default=False)

# --- 8. INSERTO VALORES ---
class InsertoValor(Base):
    """Los valores teóricos (Media y DS) que el fabricante dice que debería tener el lote para un analito."""
    __tablename__ = "inserto_valores"
    
    id_inserto = Column(Integer, primary_key=True, index=True)
    lote_id = Column(Integer, ForeignKey("lotes_material.id_lote"), nullable=False)
    analito_id = Column(Integer, ForeignKey("analitos.id_analito"), nullable=False)
    media_objetivo = Column(Float, nullable=False) # La media declarada por el fabricante o establecida por el lab
    ds_objetivo = Column(Float, nullable=False)    # La Desviación Estándar objetivo
    activo = Column(Boolean, default=True)

# --- 9. CONFIGURACIÓN DE UI ---
class AnalitoConfiguracion(Base):
    """Relaciona un analito con sus diferentes niveles de control para facilitar la interfaz de ingreso de datos."""
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
    """Los límites máximos de error permitidos (CLIA, Rilibak, etc.) para calcular si el proceso cumple."""
    __tablename__ = "metas_calidad"
    
    id_meta = Column(Integer, primary_key=True, index=True)
    analito_id = Column(Integer, ForeignKey("analitos.id_analito"), nullable=False)
    fuente = Column(String(80), nullable=False) # Ej. "CLIA", "Variabilidad Biológica"
    limite_error_total = Column(Float, nullable=False) # El porcentaje (TEa)
    fecha_vigencia = Column(Date, nullable=False)
    comentario = Column(Text)

# --- 11. CORRIDAS ---
class Corrida(Base):
    """El núcleo del sistema. Un resultado individual ingresado por un operario en un momento específico."""
    __tablename__ = "corridas"
    
    id_corrida = Column(Integer, primary_key=True, index=True)
    operario_id = Column(Integer, ForeignKey("operarios.id_operario")) # Quién ingresó el dato
    inserto_id = Column(Integer, ForeignKey("inserto_valores.id_inserto"), nullable=False) # De qué lote y analito
    fecha_corrida = Column(DateTime(timezone=True), server_default=func.now()) # Cuándo se corrió
    valor_obtenido = Column(Float, nullable=False) # El valor numérico del control
    aceptada = Column(Boolean, default=True) # Si rompe regla de rechazo, pasa a False
    observaciones = Column(Text) # Notas automáticas del sistema
    notas_usuario = Column(Text) # Acciones correctivas manuales

# --- 12. REGLAS WESTGARD ---
class ReglaWestgard(Base):
    """Catálogo estático de las reglas matemáticas para evaluar los datos (ej. 1_3s, 2_2s)."""
    __tablename__ = "reglas_westgard"
    
    id_regla = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(30), unique=True, nullable=False) # Ej. "1:3s"
    descripcion = Column(Text, nullable=False)
    tipo_accion = Column(String(20), nullable=False) # "Advertencia" o "Rechazo"
    causa_probable = Column(Text) # Ej. "Error Aleatorio"
    recomendacion = Column(Text)
    activa = Column(Boolean, default=True)

# --- 13. EVENTOS DE CORRIDA ---
class EventoCorrida(Base):
    """Registro de las alarmas generadas. Si una corrida rompe una regla de Westgard, se crea un evento aquí."""
    __tablename__ = "eventos_corrida"
    
    id_evento = Column(Integer, primary_key=True, index=True)
    corrida_id = Column(Integer, ForeignKey("corridas.id_corrida"), nullable=False) # La corrida que falló
    regla_id = Column(Integer, ForeignKey("reglas_westgard.id_regla")) # La regla que se rompió
    tipo_evento = Column(String(60), nullable=False)
    descripcion = Column(Text)
    fecha_evento = Column(DateTime(timezone=True), server_default=func.now())
    resuelto = Column(Boolean, default=False) # Requiere acción del operario para pasar a True

# --- 14. ESTADÍSTICOS MENSUALES ---
class EstadisticoMensual(Base):
    """Tabla resumen para guardar los cálculos pesados por mes y no recalcular todo en tiempo real."""
    __tablename__ = "estadisticos_mensuales"
    
    id = Column(Integer, primary_key=True, index=True)
    inserto_id = Column(Integer, ForeignKey("inserto_valores.id_inserto"), nullable=False)
    periodo_year = Column(Integer, nullable=False)
    periodo_month = Column(Integer, nullable=False)
    n_corridas = Column(Integer, nullable=False) # Número (N) de datos en el mes
    media_calculada = Column(Float)
    ds_calculada = Column(Float)
    sesgo = Column(Float)
    cv_calculado = Column(Float) # Coeficiente de variación
    error_total = Column(Float)  # TE calculado
    limite_error_total_permitido = Column(Float, nullable=False) # La meta (TEa)
    cumple_meta = Column(Boolean, nullable=False) # True si TE < TEa
    fecha_calculo = Column(DateTime(timezone=True), server_default=func.now())