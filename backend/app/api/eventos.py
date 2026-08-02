# Archivo: app/api/eventos.py
"""
Gestión de Eventos y Alertas de Calidad (Reglas de Westgard violadas).
Permite consultar corridas rechazadas y marcarlas como resueltas con una acción correctiva.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from app.core.database import get_db
from app.models.models import Corrida, Laboratorio
from app.core.security import obtener_usuario_actual

router = APIRouter(tags=["Eventos de Calidad (Alarmas)"])


class AccionResolucion(BaseModel):
    accion_correctiva: Optional[str] = ""


@router.get("/api/eventos/alertas")
def obtener_alertas_westgard(
    db: Session = Depends(get_db),
    email_usuario: str = Depends(obtener_usuario_actual)
):
    """
    Escanea el sistema y devuelve únicamente las corridas que fueron rechazadas
    debido a la violación de una Regla de Westgard. Incluye nombre del analito,
    material, lote y nivel para mostrar en el panel de alertas críticas.
    """
    from app.models.models import InsertoValor, LoteMaterial, MaterialControl, Analito, NivelControl, Laboratorio

    # Obtener el laboratorio del usuario autenticado
    lab = db.query(Laboratorio).filter(Laboratorio.email == email_usuario).first()
    lab_id = lab.id if lab else None

    # JOIN completo: Corrida → Inserto → Analito, Lote → Material → Laboratorio, Nivel
    query = (
        db.query(
            Corrida,
            Analito.nombre.label("analito_nombre"),
            Analito.unidad_medida.label("unidad"),
            LoteMaterial.numero_lote.label("numero_lote"),
            LoteMaterial.nivel_control_id.label("nivel_control_id"),
            MaterialControl.nombre_material.label("material_nombre"),
            MaterialControl.area_id.label("area_id"),
            InsertoValor.analito_id.label("analito_id"),
            InsertoValor.media_objetivo.label("media"),
            InsertoValor.ds_objetivo.label("ds"),
        )
        .join(InsertoValor, Corrida.inserto_id == InsertoValor.id_inserto)
        .join(Analito, InsertoValor.analito_id == Analito.id_analito)
        .join(LoteMaterial, InsertoValor.lote_id == LoteMaterial.id_lote)
        .join(MaterialControl, LoteMaterial.material_id == MaterialControl.id_material)
        .filter(Corrida.aceptada == False)
        .order_by(Corrida.fecha_corrida.desc())
    )

    # Filtrar por laboratorio si está disponible
    if lab_id:
        query = query.filter(MaterialControl.laboratorio_id == lab_id)

    resultados = query.all()

    eventos = []
    for row in resultados:
        corrida = row[0]
        nivel_num = row.nivel_control_id or 1  # 1=Bajo, 2=Normal, 3=Alto
        nivel_nombre = {1: "Bajo", 2: "Normal", 3: "Alto"}.get(nivel_num, f"Nivel {nivel_num}")

        eventos.append({
            "id_corrida": corrida.id_corrida,
            "inserto_id": corrida.inserto_id,
            "analito_id": row.analito_id,
            "analito_nombre": row.analito_nombre or f"Analito #{row.analito_id}",
            "unidad": row.unidad or "",
            "material_nombre": row.material_nombre or "Control",
            "numero_lote": row.numero_lote or "-",
            "nivel": nivel_nombre,
            "area_id": row.area_id,
            "media": row.media or 0,
            "ds": row.ds or 0,
            "fecha_corrida": corrida.fecha_corrida.isoformat() if corrida.fecha_corrida else "",
            "valor_obtenido": corrida.valor_obtenido,
            "aceptada": corrida.aceptada,
            "notas_usuario": corrida.notas_usuario,
        })

    return {
        "total_alertas": len(eventos),
        "eventos": eventos
    }



@router.patch("/api/eventos/{corrida_id}/resolver", status_code=status.HTTP_200_OK)
def resolver_alerta(
    corrida_id: int,
    datos: AccionResolucion,
    db: Session = Depends(get_db),
    email_usuario: str = Depends(obtener_usuario_actual)
):
    """
    Marca una corrida rechazada como resuelta, registrando la acción correctiva tomada.
    En el modelo actual, esto significa actualizar las notas de la corrida.
    """
    corrida = db.query(Corrida).filter(Corrida.id_corrida == corrida_id).first()

    if not corrida:
        raise HTTPException(status_code=404, detail="Corrida no encontrada")

    if corrida.aceptada:
        raise HTTPException(status_code=400, detail="Esta corrida ya fue aceptada y no tiene alerta activa")

    # Registrar la acción correctiva en notas y marcar como aceptada (resuelta manualmente)
    corrida.notas_usuario = (corrida.notas_usuario or "") + f" | RESUELTO: {datos.accion_correctiva}"
    corrida.aceptada = True  # Marcamos como resuelta
    db.commit()
    db.refresh(corrida)

    return {"mensaje": "Alerta resuelta y acción correctiva registrada", "id_corrida": corrida_id}