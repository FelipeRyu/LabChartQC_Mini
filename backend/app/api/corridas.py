# Archivo: app/api/corridas.py
from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.models import Corrida, InsertoValor 
from app.schemas.corridas import CorridaCreate, CorridaResponse
from app.qc_logic import evaluar_westgard # <-- Importamos el nuevo super motor

router = APIRouter(prefix="/api/corridas", tags=["Ingreso de Resultados (Corridas)"])

@router.post("/", response_model=CorridaResponse, status_code=status.HTTP_201_CREATED)
def registrar_corrida(corrida: CorridaCreate, db: Session = Depends(get_db)):
    """
    Registra un resultado y lo valida automáticamente evaluando el 
    historial reciente contra las reglas múltiples de Westgard.
    """
    
    # 1. Buscar los valores de referencia (la meta)
    meta = db.query(InsertoValor).filter(InsertoValor.id_inserto == corrida.inserto_id).first()
    
    if not meta:
        raise HTTPException(
            status_code=404, 
            detail=f"No se encontró el registro en 'inserto_valores' con ID {corrida.inserto_id}"
        )
    
    # 2. Extraer el historial de las últimas 10 corridas de este inserto
    corridas_previas = db.query(Corrida).filter(
        Corrida.inserto_id == corrida.inserto_id
    ).order_by(Corrida.id_corrida.asc()).limit(10).all()
    
    # Creamos una lista solo con los números (valores_obtenidos)
    lista_valores = [c.valor_obtenido for c in corridas_previas]
    
    # Agregamos el valor que el operario está ingresando HOY
    lista_valores.append(corrida.valor_obtenido)
    
    # 3. El cerebro analiza TODA la lista
    analisis = evaluar_westgard(
        valores_recientes=lista_valores, 
        media_objetivo=meta.media_objetivo, 
        sd_objetivo=meta.ds_objetivo
    )
    
    # 4. Guardamos el resultado con el veredicto
    nueva_corrida = Corrida(
        operario_id=corrida.operario_id,
        inserto_id=corrida.inserto_id,
        valor_obtenido=corrida.valor_obtenido,
        notas_usuario=f"{corrida.notas_usuario or ''} | Auto-Validación: {analisis['mensaje']}",
        aceptada=not analisis["viola_regla"] 
    )
    
    db.add(nueva_corrida)
    db.commit()
    db.refresh(nueva_corrida)
    
    return nueva_corrida

@router.get("/inserto/{inserto_id}", response_model=List[CorridaResponse])
def obtener_corridas_por_inserto(inserto_id: int, db: Session = Depends(get_db)):
    """Trae el historial de resultados para un control específico."""
    return db.query(Corrida).filter(Corrida.inserto_id == inserto_id).all()

@router.get("/", response_model=List[CorridaResponse])
def obtener_todas_las_corridas(db: Session = Depends(get_db)):
    """Obtiene el listado completo de todas las corridas registradas."""
    return db.query(Corrida).all()