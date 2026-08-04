# Archivo: app/core/cargar_semilla.py
import os
import glob
from sqlalchemy import text
from sqlalchemy.orm import Session

ARCHIVOS_ORDENADOS = [
    "laboratorios",
    "operarios",
    "areas_laboratorio",
    "analitos",
    "materiales_control",
    "lotes_material",
    "niveles_control",
    "inserto_valores",
    "reglas_westgard",
    "corridas",
    "alembic_version"
]

def cargar_datos_semilla_si_esta_vacio(db: Session):
    try:
        from app.models.models import Analito
        if db.query(Analito).count() > 0:
            print("🌱 La base de datos ya contiene analitos. Omitiendo carga de semilla.")
            return
    except Exception as e:
        print(f"⚠️ Error al verificar datos existentes: {e}")

    dir_semilla = os.path.join(os.path.dirname(__file__), "..", "..", "datos_semilla")
    if not os.path.exists(dir_semilla):
        print(f"⚠️ Directorio de datos semilla no encontrado en: {dir_semilla}")
        return

    print("🚀 Iniciando la carga de datos semilla desde los archivos SQL...")

    for prefijo in ARCHIVOS_ORDENADOS:
        archivos = glob.glob(os.path.join(dir_semilla, f"{prefijo}_*.sql"))
        if not archivos:
            continue
        
        archivo_sql = archivos[0]
        try:
            with open(archivo_sql, "r", encoding="utf-8") as f:
                sql_content = f.read().strip()
                if sql_content:
                    db.execute(text(sql_content))
                    db.commit()
                    print(f"✅ Carga exitosa: {os.path.basename(archivo_sql)}")
        except Exception as err:
            db.rollback()
            print(f"❌ Error al cargar {os.path.basename(archivo_sql)}: {err}")

    # Ajustar secuencias de los autoincrementables
    tablas_con_id = [
        "laboratorios", "operarios", "areas_laboratorio", "analitos",
        "materiales_control", "lotes_material", "niveles_control",
        "inserto_valores", "reglas_westgard", "corridas"
    ]
    for tabla in tablas_con_id:
        try:
            sql_seq = f"SELECT setval(pg_get_serial_sequence('{tabla}', 'id'), COALESCE((SELECT MAX(id) FROM {tabla}), 1));"
            db.execute(text(sql_seq))
            db.commit()
        except Exception as seq_err:
            db.rollback()

    print("🎉 ¡Carga de datos semilla finalizada con éxito!")
