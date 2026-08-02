# Archivo: app/api/reportes.py

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import Corrida, InsertoValor
from app.core.security import obtener_usuario_actual

# ¡Esta línea es la que crea la etiqueta en Swagger!
router = APIRouter(tags=["Reportes y Gráficas"])

@router.get("/api/reportes/levey-jennings/{inserto_id}")
def obtener_datos_grafica(
    inserto_id: int, 
    db: Session = Depends(get_db),
    email_usuario: str = Depends(obtener_usuario_actual)
):
    """
    Entrega los datos listos para graficar: 
    La Media, la DS y los últimos resultados obtenidos.
    """
    meta = db.query(InsertoValor).filter(InsertoValor.id_inserto == inserto_id).first()
    
    resultados = db.query(Corrida).filter(
        Corrida.inserto_id == inserto_id
    ).order_by(Corrida.fecha_corrida.desc()).limit(30).all()
    
    return {
        "media": meta.media_objetivo,
        "ds": meta.ds_objetivo,
        "datos": resultados
    }