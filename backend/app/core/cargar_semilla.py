# Archivo: app/core/cargar_semilla.py
import os
import glob
from sqlalchemy import text
from sqlalchemy.orm import Session

# Tablas del sistema en orden estricto de dependencias (se omite alembic_version)
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
    "corridas"
]

# Mapa exacto de tabla a su columna Primary Key
TABLAS_PK = {
    "laboratorios": "id",
    "operarios": "id_operario",
    "areas_laboratorio": "id",
    "analitos": "id_analito",
    "materiales_control": "id_material",
    "lotes_material": "id_lote",
    "niveles_control": "id",
    "inserto_valores": "id_inserto",
    "reglas_westgard": "id_regla",
    "corridas": "id_corrida"
}

def dividir_sentencias_sql(sql_content: str) -> list[str]:
    """
    Divide un script SQL en declaraciones individuales respetando comillas simples (strings).
    Evita dividir por ';' si se encuentra dentro de un texto encomillado.
    """
    sentencias = []
    actual = []
    en_string = False
    
    i = 0
    length = len(sql_content)
    while i < length:
        char = sql_content[i]
        
        # Manejo de comillas simples en SQL
        if char == "'":
            if en_string and i + 1 < length and sql_content[i + 1] == "'":
                actual.append("''")
                i += 2
                continue
            en_string = not en_string
            actual.append(char)
            i += 1
            continue
            
        if not en_string:
            # Comentarios de línea SQL (--)
            if char == '-' and i + 1 < length and sql_content[i + 1] == '-':
                j = sql_content.find('\n', i)
                if j == -1:
                    break
                i = j + 1
                continue
            # Punto y coma fuera de strings es el delimitador de sentencia
            if char == ';':
                stmt = "".join(actual).strip()
                if stmt:
                    sentencias.append(stmt)
                actual = []
                i += 1
                continue
                
        actual.append(char)
        i += 1

    ultimo = "".join(actual).strip()
    if ultimo:
        sentencias.append(ultimo)

    return sentencias

def encontrar_directorio_semilla() -> str | None:
    """Busca el directorio de datos_semilla en múltiples ubicaciones posibles."""
    candidatos = [
        os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "datos_semilla")),
        os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "datos_semilla")),
        os.path.abspath(os.path.join(os.getcwd(), "datos_semilla")),
        os.path.abspath(os.path.join(os.getcwd(), "backend", "datos_semilla"))
    ]
    for ruta in candidatos:
        if os.path.exists(ruta) and os.path.isdir(ruta):
            return ruta
    return None

def cargar_datos_semilla_si_esta_vacio(db: Session, force: bool = False) -> dict:
    """
    Carga los datos semilla desde archivos SQL en la base de datos.
    Si force=False, verifica si la base de datos ya contiene datos en las tablas principales.
    """
    detalles = []
    
    if not force:
        try:
            from app.models.models import Analito, Laboratorio, Corrida
            num_analitos = db.query(Analito).count()
            num_labs = db.query(Laboratorio).count()
            num_corridas = db.query(Corrida).count()
            
            if num_analitos > 0 and num_labs > 0 and num_corridas > 0:
                msg = f"[SEMILLA] Base de datos poblada ({num_labs} labs, {num_analitos} analitos, {num_corridas} corridas). Carga omitida."
                print(msg)
                return {"exito": True, "mensaje": msg, "detalles": detalles}
        except Exception as e:
            print(f"[SEMILLA] Error al verificar datos existentes: {e}")

    dir_semilla = encontrar_directorio_semilla()
    if not dir_semilla:
        msg = "[SEMILLA] Directorio de datos semilla no encontrado en ninguna ruta candidata."
        print(msg)
        return {"exito": False, "mensaje": msg, "detalles": detalles}

    print(f"[SEMILLA] Iniciando carga de datos semilla desde: {dir_semilla}")
    detalles.append(f"Directorio encontrado: {dir_semilla}")

    archivos_procesados = 0
    sentencias_ejecutadas = 0

    for prefijo in ARCHIVOS_ORDENADOS:
        archivos = glob.glob(os.path.join(dir_semilla, f"{prefijo}_*.sql"))
        if not archivos:
            msg_warn = f"[SEMILLA] No se encontro archivo SQL para: {prefijo}"
            print(msg_warn)
            detalles.append(msg_warn)
            continue
        
        archivo_sql = archivos[0]
        nombre_archivo = os.path.basename(archivo_sql)
        
        try:
            with open(archivo_sql, "r", encoding="utf-8") as f:
                sql_content = f.read().strip()
            
            if not sql_content:
                continue

            raw_stmts = dividir_sentencias_sql(sql_content)
            stmts_exitosas = 0
            
            for clean_stmt in raw_stmts:
                if not clean_stmt:
                    continue

                clean_stmt_proc = clean_stmt
                try:
                    bind_engine = db.get_bind()
                    if bind_engine and bind_engine.dialect.name == "sqlite":
                        clean_stmt_proc = clean_stmt_proc.replace("public.", "")
                except Exception:
                    pass

                try:
                    db.execute(text(clean_stmt_proc))
                    stmts_exitosas += 1
                    sentencias_ejecutadas += 1
                except Exception as stmt_err:
                    db.rollback()
                    detalles.append(f"Nota en sentencia de {nombre_archivo}: {stmt_err}")

            db.commit()
            archivos_procesados += 1
            msg_ok = f"[SEMILLA] Carga exitosa: {nombre_archivo} ({stmts_exitosas} sentencias)"
            print(msg_ok)
            detalles.append(msg_ok)
            
        except Exception as err:
            db.rollback()
            msg_err = f"[SEMILLA] Error en {nombre_archivo}: {err}"
            print(msg_err)
            detalles.append(msg_err)

    # Ajustar las secuencias autoincrementales en PostgreSQL
    is_postgres = False
    try:
        bind_engine = db.get_bind()
        if bind_engine and bind_engine.dialect.name == "postgresql":
            is_postgres = True
    except Exception:
        pass

    if is_postgres:
        for tabla, pk_col in TABLAS_PK.items():
            try:
                sql_seq = f"SELECT setval(pg_get_serial_sequence('{tabla}', '{pk_col}'), COALESCE((SELECT MAX({pk_col}) FROM {tabla}), 1));"
                db.execute(text(sql_seq))
                db.commit()
            except Exception as seq_err:
                db.rollback()
                detalles.append(f"Nota ajustando secuencia en {tabla}: {seq_err}")

    msg_fin = f"[SEMILLA] Carga finalizada con exito! (Archivos: {archivos_procesados}, Sentencias: {sentencias_ejecutadas})"
    print(msg_fin)
    return {"exito": True, "mensaje": msg_fin, "detalles": detalles}
