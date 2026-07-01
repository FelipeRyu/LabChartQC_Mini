# 🧪 LabChart QC - Motor de Control de Calidad Clínico

¡Bienvenido a **LabChart QC**! Este proyecto es el "cerebro matemático" detrás de un sistema moderno para la gestión del control de calidad en laboratorios clínicos. 

Diseñado con una arquitectura sólida, este backend recibe los resultados de los equipos del laboratorio, los analiza estadísticamente y decide automáticamente si los datos son confiables o si hubo un error en la máquina.

---

## 📖 ¿Qué hace exactamente este software? (Para no programadores)

Imagina que un laboratorio clínico es como una fábrica de resultados médicos. Antes de procesar la sangre de un paciente real, los bacteriólogos meten una muestra "de prueba" (el control) en la máquina. Ellos ya saben qué resultado debería dar esa muestra de prueba.

* Si la máquina da el resultado esperado, ¡perfecto! Todo está calibrado.
* Si la máquina da un resultado muy loco, hay un problema.

**LabChart QC** es el sistema que recibe esos resultados diarios. En lugar de que el bacteriólogo haga cálculos a mano, nuestro software usa reglas matemáticas (llamadas Reglas de Westgard) para comparar el resultado de hoy con el historial de la máquina y lanza una alerta si detecta un comportamiento extraño.

---

## 🏗️ Arquitectura y Tecnologías

Este es un proyecto **Backend** moderno, lo que significa que es el "motor invisible" que procesa los datos y se comunica con las bases de datos. No tiene botones ni colores (eso lo hace el frontend).

### Las Herramientas Principales:
* 🐍 **Python 3:** El lenguaje de programación base. Elegido por su poder en cálculos matemáticos.
* ⚡ **FastAPI:** El framework web. Es la estructura que nos permite recibir los datos de internet (rutas API) a una velocidad increíble.
* 🐘 **PostgreSQL:** Nuestro "archivador metálico". Una base de datos relacional robusta donde guardamos todas las tablas (operarios, reactivos, resultados históricos).
* 🗺️ **SQLAlchemy:** Un "traductor". Nos permite escribir código en Python y él se encarga de traducirlo a comandos de base de datos de PostgreSQL.

### La Magia del Control de Versiones:
* 🔄 **Alembic:** Es nuestro gestor de bases de datos. Si en el futuro necesitamos agregar una nueva columna (ej. *firma_supervisor*), Alembic actualiza la base de datos de PostgreSQL automáticamente sin borrar los datos históricos que ya teníamos guardados.

---

## 🧩 Estructura de la Base de Datos

El sistema está soportado por un modelo relacional de **14 tablas principales**. Aquí tienes un diagrama simplificado de cómo se conectan:


* **Operarios:** Las personas que usan el sistema.
* **Analitos:** Las pruebas específicas (ej. Glucosa, Colesterol).
* **Insertos y Lotes:** Las "metas" o valores ideales que el fabricante de la máquina dice que deberíamos obtener.
* **Corridas:** El núcleo del sistema. Aquí se guarda cada resultado individual ingresado día a día.

---

## ⚙️ El "Cerebro" Matemático (Reglas de Westgard)

El archivo `qc_logic.py` es el corazón de la aplicación. Cuando llega un nuevo resultado, el sistema no solo lo mira aislado, sino que evalúa el contexto histórico usando estadística pura (Z-Scores):

1. **Regla 1_3s:** Rechaza el resultado si se desvía drásticamente del promedio.
2. **Regla 2_2s:** Rechaza si los dos últimos resultados se equivocaron hacia el mismo lado.
3. **Regla R_4s:** Rechaza si hay un "salto" gigante entre el resultado de ayer y el de hoy.

---

## 🚀 Cómo ejecutar el proyecto (Para Desarrolladores)

Si acabas de clonar este repositorio y quieres encender el motor en tu computador local, sigue estos pasos:

**1. Activa el entorno virtual:**
Asegúrate de estar trabajando dentro del entorno aislado de Python.
```bash
# En Windows
.venv\Scripts\activate