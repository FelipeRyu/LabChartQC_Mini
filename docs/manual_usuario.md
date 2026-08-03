# 📘 Manual de Usuario - LabChart QC
## Sistema de Control de Calidad Clínico Automatizado

¡Bienvenido a **LabChart QC**! Este manual está diseñado para guiar a bacteriólogos, microbiólogos, analistas de laboratorio y coordinadores de calidad en el uso diario de la plataforma. 

---

## 📌 1. Introducción al Sistema
**LabChart QC** es una plataforma digital que automatiza el análisis estadístico del control de calidad interno de tu laboratorio clínico. En lugar de realizar cálculos manuales en papel o Excel, el sistema recibe los resultados de tus corridas diarias y aplica automáticamente las **Reglas de Westgard** utilizando la desviación estándar y la media histórica del analito. Esto te permite identificar desviaciones o errores sistemáticos/aleatorios de inmediato para decidir si puedes liberar o no los resultados de tus pacientes.

---

## 🔐 2. Acceso al Sistema (Iniciar Sesión)
Para ingresar a la plataforma:
1. Abre el navegador web e ingresa la dirección proviva por el administrador del laboratorio.
2. En la pantalla de **Iniciar Sesión**:
   * Escribe tu **Nombre de Usuario** o **Correo Electrónico**.
   * Escribe tu **Contraseña**.
3. Haz clic en **Ingresar**.
> [!IMPORTANT]
> Recuerda que todas tus acciones dentro del sistema (ingresar corridas, ingresar justificaciones y observaciones) quedarán registradas con tu usuario para cumplir con la pista de auditoría de la norma **ISO 15189**.

---

## 📊 3. Panel Principal (Dashboard)
Una vez iniciada la sesión, verás la pantalla de inicio o **Panel Principal**. Esta vista te da un resumen rápido del estado de los equipos y analitos:
* **Alertas Activas:** Lista de los últimos analitos rechazados por el sistema que requieren atención inmediata.
* **Resumen del día:** Estado general de los controles procesados hoy.
* **Menú de Navegación:** Desde aquí podrás acceder a:
  * Registro de Controles (Configuración de analitos y lotes).
  * Registro de Corridas (Ingreso de resultados diarios).
  * Gráficos Levey-Jennings.
  * Bitácora de Calidad (Historial de corridas, alertas y acciones).

---

## ⚙️ 4. Registro y Configuración de Controles
Antes de ingresar resultados de pacientes o controles cotidianos, debes configurar los parámetros del lote y reactivo provistos por el fabricante.

1. Ve a **Registro de Control** en el menú.
2. Haz clic en **Nuevo Control / Lote**.
3. Rellena los datos solicitados:
   * **Analito:** Selecciona la prueba (ej. *Glucosa*, *Colesterol*, *T3*, etc.).
   * **Código de Lote:** Código numérico o alfanumérico impreso en el vial del control.
   * **Fecha de Vencimiento:** Fecha caducidad del vial.
   * **Valor Asignado (Media del fabricante):** El valor promedio esperado para ese nivel de control.
   * **Desviación Estándar (DE o SD):** La desviación aceptable provista en la hoja de inserto del fabricante.
4. Presiona **Guardar**.
> [!TIP]
> Recuerda configurar correctamente los diferentes niveles de control (ej. Nivel 1 - Normal, Nivel 2 - Patológico) para asegurar un control estadístico óptimo.

---

## 📥 5. Registro de Corridas Diarias (Flujo de Ingreso)
El ingreso de resultados se realiza de forma ordenada en tres pasos y permite añadir notas preventivas o acciones correctivas en tiempo real:

1. **Paso 1 (Seleccionar Material):** Escoge el material de control correspondiente en la lista desplegable (ej. *Multichem S Plus*). El sistema te indicará automáticamente los lotes vigentes vinculados.
2. **Paso 2 (Seleccionar Analito):** Haz clic en el botón del analito que desees procesar (ej. *Glucosa*).
3. **Paso 3 (Ingresar Valores por Nivel):** El sistema cargará tarjetas dinámicas para cada nivel configurado de ese analito (ej. Nivel 1, Nivel 2). 
   * Introduce el **Resultado numérico** obtenido de la máquina.
   * **Z-Score en Tiempo Real:** Debajo de cada entrada de texto, el sistema calcula de inmediato el Z-Score y tiñe el recuadro para alertar visualmente:
     * **Verde:** Corrida normal (Z-Score menor a 2 SD).
     * **Amarillo (Zona de Advertencia):** Z-Score entre 2 y 3 SD (Posible regla $1_{2s}$).
     * **Rojo (Zona de Rechazo):** Z-Score superior a 3 SD (Viola regla $1_{3s}$).
4. **Notas del Microbiólogo:** En la sección inferior, escribe cualquier observación relevante o la **acción correctiva tomada** si notaste una alerta roja (ej. *"Se recalibró el analito y se reconstituyó un vial nuevo de control"*).
5. Haz clic en **Guardar Corridas**.

---

## 📈 6. Gráfico Levey-Jennings
Para visualizar la tendencia de tus controles históricos y detectar problemas antes de que se conviertan en un rechazo:

1. Ve a la sección **Gráfico Levey-Jennings**.
2. Filtra por el **Analito** y el **Lote** que desees inspeccionar.
3. Podrás ver un gráfico de dispersión temporal con las siguientes líneas de referencia:
   * **Línea Central (Verde):** Media ($\mu$).
   * **Líneas Amarillas ($\pm 1\text{SD}$ y $\pm 2\text{SD}$):** Zona de advertencia.
   * **Líneas Rojas ($\pm 3\text{SD}$):** Zona de rechazo inmediato.
4. Pasa el cursor sobre los puntos para ver el valor exacto, la fecha y el operador que ingresó esa corrida.

---

## 📕 7. Bitácora de Calidad (Historial y Consulta)
La **Bitácora de Calidad** es un registro histórico de todas las corridas procesadas en el laboratorio. Sirve como el principal diario de consulta para auditores y coordinadores de calidad para verificar la estabilidad analítica.

### ¿Cómo funciona la Bitácora?
1. **Filtros de Búsqueda:** En la parte superior puedes buscar registros específicos filtrando por:
   * **Rango de fecha:** Campos "Fecha Desde" y "Fecha Hasta".
   * **Área:** Filtrado por sección del laboratorio (ej. *Química Clínica*).
   * **Analito Específico:** Filtrado por prueba.
2. **Tabla de Resultados:** La bitácora mostrará un listado detallado con las siguientes columnas:
   * **Fecha / Hora:** Fecha y hora exacta del ingreso en formato local.
   * **Lote / Nivel:** Indica el número del nivel de control, el código de lote y el nombre del material comercial.
   * **Analito:** Nombre de la prueba analizada.
   * **Resultado:** El valor numérico obtenido del equipo.
   * **Z-Score:** El cálculo de la desviación con color distintivo (rojo si supera las 3 SD).
   * **Estado:** Etiqueta visual que indica **ACEPTADO** (verde) o **RECHAZADO** (rojo).
   * **Observaciones / Acción:** 
     * **Observaciones (en rojo):** Muestra de forma automática si hubo un fallo matemático detectado por el sistema (ej. *Violación Regla Westgard 1_3s...*).
     * **Acción (en cursiva):** Muestra las notas escritas por el bacteriólogo al momento de registrar el dato (ej. *"Acción: Se procedió a calibrar nuevamente..."*).

---

## 🧠 8. Guía de Reglas de Westgard (¿Qué significan las alertas?)
El sistema evalúa de forma inteligente tres reglas esenciales para cuidar la calidad de tu laboratorio:

| Regla | Tipo de Error | ¿Qué significa? | Acción sugerida |
| :--- | :--- | :--- | :--- |
| **Regla $1_{3s}$** | Aleatorio | Un solo resultado se desvió más de 3 Desviaciones Estándar de la media. | **Rechazo inmediato.** Detén el procesamiento de muestras de pacientes, revisa burbujas de aire en la pipeta o vuelve a pasar el control. |
| **Regla $2_{2s}$** | Sistemático | Dos resultados consecutivos (del mismo nivel o niveles diferentes) superan las $+2\text{SD}$ o las $-2\text{SD}$ en la misma dirección. | **Rechazo inmediato.** Indica pérdida de calibración del equipo, desgaste de la lámpara o reactivo deteriorado. Calibra nuevamente el analito. |
| **Regla $R_{4s}$** | Aleatorio | Hay una diferencia de $4\text{SD}$ o más entre el resultado anterior y el actual (por ejemplo, el de ayer dio $+2\text{SD}$ y el de hoy dio $-2\text{SD}$). | **Rechazo inmediato.** Indica inestabilidad del equipo o del control. Realiza una mantención rápida o cambia el vial del control. |
