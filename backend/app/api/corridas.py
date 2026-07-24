# Archivo: app/api/corridas.py
"""
Gestión de Corridas (resultados de control de calidad).
Incluye evaluación automática de Reglas de Westgard al registrar una corrida nueva.
"""

from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.models.models import Corrida, InsertoValor, Laboratorio, Operario
from app.schemas.corridas import CorridaCreate, CorridaResponse
from app.core.security import obtener_usuario_actual
from app.qc_logic import evaluar_westgard

router = APIRouter(tags=["Ingreso de Resultados (Corridas)"])


@router.post("/api/corridas", response_model=CorridaResponse, status_code=status.HTTP_201_CREATED)
def registrar_corrida(
    corrida: CorridaCreate,
    db: Session = Depends(get_db),
    email_usuario: str = Depends(obtener_usuario_actual)
):
    # 1. Seguridad: Verificar que el usuario tenga acceso al laboratorio
    lab_actual = db.query(Laboratorio).filter(Laboratorio.email == email_usuario).first()
    if not lab_actual:
        raise HTTPException(status_code=404, detail="Laboratorio no encontrado")

    # 2. Si se proporcionó operario_id, verificar que pertenezca al laboratorio
    if corrida.operario_id:
        operario_valido = db.query(Operario).filter(
            Operario.id_operario == corrida.operario_id,
            Operario.laboratorio_id == lab_actual.id
        ).first()
        if not operario_valido:
            raise HTTPException(
                status_code=403,
                detail="Acceso denegado: Operario no pertenece a este laboratorio"
            )

    # 3. Buscar la meta (Inserto) — contiene media_objetivo y ds_objetivo
    meta = db.query(InsertoValor).filter(InsertoValor.id_inserto == corrida.inserto_id).first()
    if not meta:
        raise HTTPException(status_code=404, detail="No se encontró la configuración del inserto")

    # 4. Historial: Obtener las últimas 10 corridas para evaluación Westgard
    corridas_previas = db.query(Corrida).filter(
        Corrida.inserto_id == corrida.inserto_id
    ).order_by(Corrida.id_corrida.asc()).limit(10).all()

    lista_valores = [c.valor_obtenido for c in corridas_previas]
    lista_valores.append(corrida.valor_obtenido)

    # 5. Análisis Westgard automático
    analisis = evaluar_westgard(
        valores_recientes=lista_valores,
        media_objetivo=meta.media_objetivo,
        sd_objetivo=meta.ds_objetivo
    )

    # 6. Guardar corrida con resultado de la evaluación
    nueva_corrida = Corrida(
        operario_id=corrida.operario_id,
        inserto_id=corrida.inserto_id,
        valor_obtenido=corrida.valor_obtenido,
        notas_usuario=f"{corrida.notas_usuario or ''} | Validación: {analisis['mensaje']}",
        observaciones=f"Regla: {analisis.get('regla_rota', 'ninguna')}" if analisis.get('regla_rota') else None,
        aceptada=not analisis["viola_regla"]
    )

    db.add(nueva_corrida)
    db.commit()
    db.refresh(nueva_corrida)

    return nueva_corrida


# ==========================================
# RUTAS GET (CONSULTAS)
# ==========================================

@router.get("/api/corridas", response_model=List[CorridaResponse])
def obtener_todas_las_corridas(
    db: Session = Depends(get_db),
    email_usuario: str = Depends(obtener_usuario_actual)
):
    """
    Entrega el historial de resultados recientes al frontend para
    alimentar las tablas y cálculos visuales del panel principal.
    """
    return db.query(Corrida).order_by(Corrida.id_corrida.desc()).limit(100).all()


@router.get("/api/corridas/inserto/{inserto_id}", response_model=List[CorridaResponse])
def obtener_corridas_por_inserto(
    inserto_id: int,
    db: Session = Depends(get_db),
    email_usuario: str = Depends(obtener_usuario_actual)
):
    return db.query(Corrida).filter(Corrida.inserto_id == inserto_id).all()


# ==========================================
# ENDPOINT ENRIQUECIDO (para Bitácora y Gráfico)
# ==========================================

@router.get("/api/corridas/enriquecidas")
def obtener_corridas_enriquecidas(
    db: Session = Depends(get_db),
    email_usuario: str = Depends(obtener_usuario_actual)
):
    """
    Devuelve corridas con JOINs completos para que el frontend
    pueda filtrar por área, analito, nivel y mostrar nombres.
    Cadena: Corrida → InsertoValor → LoteMaterial → MaterialControl + Analito
    """
    from app.models.models import LoteMaterial, MaterialControl, Analito

    resultados = (
        db.query(
            Corrida,
            InsertoValor,
            LoteMaterial,
            MaterialControl,
            Analito
        )
        .join(InsertoValor, Corrida.inserto_id == InsertoValor.id_inserto)
        .join(LoteMaterial, InsertoValor.lote_id == LoteMaterial.id_lote)
        .join(MaterialControl, LoteMaterial.material_id == MaterialControl.id_material)
        .join(Analito, InsertoValor.analito_id == Analito.id_analito)
        .order_by(Corrida.id_corrida.desc())
        .limit(200)
        .all()
    )

    corridas_enriquecidas = []
    for corrida, inserto, lote, material, analito in resultados:
        # Calcular Z-Score
        z_score = 0.0
        if inserto.ds_objetivo and inserto.ds_objetivo != 0:
            z_score = round(
                (corrida.valor_obtenido - inserto.media_objetivo) / inserto.ds_objetivo,
                2
            )

        corridas_enriquecidas.append({
            "id_corrida": corrida.id_corrida,
            "fecha_corrida": corrida.fecha_corrida.isoformat() if corrida.fecha_corrida else None,
            "valor_obtenido": corrida.valor_obtenido,
            "aceptada": corrida.aceptada,
            "observaciones": corrida.observaciones,
            "notas_usuario": corrida.notas_usuario,
            # Datos del inserto
            "inserto_id": inserto.id_inserto,
            "media": inserto.media_objetivo,
            "ds": inserto.ds_objetivo,
            "z_score": z_score,
            # Datos del analito
            "analito_id": analito.id_analito,
            "analito_nombre": analito.nombre,
            "unidad": analito.unidad_medida,
            # Datos del lote
            "lote": lote.numero_lote,
            "nivel": lote.nivel_control_id or 1,
            # Datos del material
            "material_id": material.id_material,
            "material_nombre": material.nombre_material,
            "area_id": material.area_id or 0,
        })

    return corridas_enriquecidas