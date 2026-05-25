# Archivo: app/api/corridas.py
from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
# Importamos Corrida y la clase correcta: InsertoValor
from app.models.models import Corrida, InsertoValor 
from app.schemas.corridas import CorridaCreate, CorridaResponse
from app.qc_logic import validar_regla_1_3s

router = APIRouter(prefix="/api/corridas", tags=["Ingreso de Resultados (Corridas)"])

@router.post("/", response_model=CorridaResponse, status_code=status.HTTP_201_CREATED)
def registrar_corrida(corrida: CorridaCreate, db: Session = Depends(get_db)):
    """
    Registra un resultado y lo valida automáticamente usando el motor estadístico 
    contra los valores de la tabla 'inserto_valores'.
    """
    
    # 1. Buscar los valores de referencia en 'inserto_valores' usando la clase correcta
    meta = db.query(InsertoValor).filter(InsertoValor.id_inserto == corrida.inserto_id).first()
    
    if not meta:
        raise HTTPException(
            status_code=404, 
            detail=f"No se encontró el registro en 'inserto_valores' con ID {corrida.inserto_id}"
        )
    
    # 2. El cerebro analiza el dato usando los nombres correctos de tus columnas
    analisis = validar_regla_1_3s(
        valor_control=corrida.valor_obtenido, 
        media_objetivo=meta.media_objetivo, # Corregido para usar tu columna
        sd_objetivo=meta.ds_objetivo       # Corregido para usar tu columna
    )
    
    # 3. Guardamos el resultado con el veredicto del sistema
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

@router.get("/inserto/{inserto_id}", response_model=List[CorridaResponse])
def obtener_corridas_por_inserto(inserto_id: int, db: Session = Depends(get_db)):
    """Trae el historial de resultados para un control específico."""
    return db.query(Corrida).filter(Corrida.inserto_id == inserto_id).all()

@router.get("/", response_model=List[CorridaResponse])
def obtener_todas_las_corridas(db: Session = Depends(get_db)):
    """Obtiene el listado completo de todas las corridas registradas."""
    return db.query(Corrida).all()