# Archivo: app/api/corridas.py

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
    
    # 2. Verificar que el operario_id pertenezca realmente a este laboratorio
    operario_valido = db.query(Operario).filter(
        Operario.id_operario == corrida.operario_id,
        Operario.laboratorio_id == lab_actual.id
    ).first()
    
    if not operario_valido:
        raise HTTPException(status_code=403, detail="Acceso denegado: Operario no pertenece a este laboratorio")

    # 3. Buscar la meta (Inserto)
    meta = db.query(InsertoValor).filter(InsertoValor.id_inserto == corrida.inserto_id).first()
    if not meta:
        raise HTTPException(status_code=404, detail="No se encontró la configuración del inserto")
    
    # 4. Historial (Corridas previas)
    corridas_previas = db.query(Corrida).filter(
        Corrida.inserto_id == corrida.inserto_id
    ).order_by(Corrida.id_corrida.asc()).limit(10).all()
    
    lista_valores = [c.valor_obtenido for c in corridas_previas]
    lista_valores.append(corrida.valor_obtenido)
    
    # 5. Análisis Westgard
    analisis = evaluar_westgard(
        valores_recientes=lista_valores, 
        media_objetivo=meta.media_objetivo, 
        sd_objetivo=meta.ds_objetivo
    )
    
    # 6. Guardar corrida
    nueva_corrida = Corrida(
        operario_id=corrida.operario_id,
        inserto_id=corrida.inserto_id,
        valor_obtenido=corrida.valor_obtenido,
        notas_usuario=f"{corrida.notas_usuario or ''} | Validación: {analisis['mensaje']}",
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
    # Ordenamos de forma descendente para mostrar las más recientes primero
    return db.query(Corrida).order_by(Corrida.id_corrida.desc()).limit(100).all()


@router.get("/api/corridas/inserto/{inserto_id}", response_model=List[CorridaResponse])
def obtener_corridas_por_inserto(
    inserto_id: int, 
    db: Session = Depends(get_db),
    email_usuario: str = Depends(obtener_usuario_actual)
):
    # Aquí podrías agregar un filtro extra para asegurar que el inserto pertenezca al laboratorio
    return db.query(Corrida).filter(Corrida.inserto_id == inserto_id).all()