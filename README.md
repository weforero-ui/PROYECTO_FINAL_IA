# SignosSemáforo 🚦 (Validador Rápido de Signos Vitales)

**Universidad de Boyacá**  
**Facultad de Ciencias de la Salud • Programa de Enfermería (4.° Semestre)**  
**Materia:** IA Generativa: del Prompt al Producto (Entregable Tercer Corte)  
**Estudiante / Responsable:** William Esteban Forero Ojeda (Cód. 66625059)  
**Docente:** Santiago Correal  

---

## 1. Correcciones de Fallas Detectadas (Versión 2.0)

| Falla Reportada | Estado | Solución Técnica Implementada |
| :--- | :---: | :--- |
| **1. Notificación al copiar** | ✅ **Corregido** | Sistema de triple confirmación inmediata: <br>1. **Toast flotante superior** con animación y mensaje: `«¡Nota copiada al portapapeles con éxito!»`.<br>2. **Banner verde en la tarjeta de reporte** que confirma la acción.<br>3. **Feedback en el botón** que cambia de color y texto a `✓ ¡Copiado!` por 2.5 segundos. Compatible con navegadores móviles, escritorio y modo local. |
| **2. Limpieza completa de pantalla** | ✅ **Corregido** | El botón **«Limpiar campos»** ahora resetea el 100% del DOM:<br>• Vacía los inputs numéricos.<br>• Limpia completamente la nota generada y oculta banners.<br>• Resetea el cálculo de PAM a `-- mmHg` (Sin cálculo).<br>• Devuelve los badges a neutral ("Sin datos") y retira los bordes de color.<br>• Desplaza suavemente la pantalla al inicio (`window.scrollTo(0,0)`) y pone el foco en el primer campo para el nuevo paciente. |
| **3. Validación de datos inconsistentes** | ✅ **Corregido** | **Bloqueo clínico de seguridad:**<br>• Si la Presión Sistólica es menor o igual a la Diastólica ($\text{PAS} \le \text{PAD}$), la tarjeta se marca con **borde rojo**, el badge muestra `⛔ Error: PAS ≤ PAD`, aparece un recuadro de error en rojo claro y **se bloquea la nota** impidiendo emitir reportes incoherentes.<br>• Validación estricta para $\text{SpO}_2 > 100\%$ o valores negativos, y frecuencias $\le 0$. |

---

## 2. Novedades y Optimizaciones Clínicas Incorporadas

1. **Cálculo Automático de Presión Arterial Media (PAM):**
   * Fórmula: $\text{PAM} = \frac{\text{PAS} + 2 \times \text{PAD}}{3}$.
   * Normal: $70 - 105\text{ mmHg}$.
   * **Alerta Crítica de Hipoperfusión:** Cuando $\text{PAM} < 65\text{ mmHg}$, se activa una alarma roja informando riesgo de daño isquémico para reporte urgente al docente supervisor o jefa de servicio.
2. **Formato SOAPIE Estandarizado:**
   * **[S] Subjetivo:** Expresión y confort del paciente adulto en reposo.
   * **[O] Objetivo:** Cifras completas con semáforo, altitud Tunja ($2.810\text{ msnm}$) y valor de PAM.
   * **[A] Análisis:** Juicio de enfermería según el semáforo consolidado (Verde / Amarillo / Rojo).
   * **[P / I] Plan e Intervenciones:** Medidas clínicas y tiempos de reevaluación.
   * **[E] Evaluación:** Registro del seguimiento evolutivo.
3. **Modo Turno Nocturno (Dark Mode):**
   * Botón flotante accesible (`🌙 Turno Nocturno` / `☀️ Modo Diurno`) con paleta de alto contraste que reduce la fatiga visual en rondas hospitalarias nocturnas y guarda la preferencia automáticamente.
4. **Bordes Dinámicos de Semáforo:**
   * Cada tarjeta se ilumina en tiempo real con borde verde, amarillo o rojo según la cifra ingresada.
5. **100% Listo para GitHub Pages:**
   * Enlaces y recursos con rutas relativas (`./`), sin dependencias de Node.js o librerías pesadas. Compatible con PWA offline para áreas asistenciales sin señal.

---

## 3. Matriz Clínica de Referencia (Adultos)

| Signo Vital | Unidad | Verde (Normal) | Amarillo (Alteración Leve) | Rojo (Alerta de Servicio / Bloqueo) |
| :--- | :---: | :---: | :---: | :---: |
| **Presión Arterial (PA)** | mmHg | PAS: 90–120<br>PAD: 60–80 | PAS: 121–139 ó PAD: 81–89<br>(PA elevada / Pre-HTA)<br>PAS: 80–89 / PAD: 50–59 (Hipotensión leve) | PAS: <80 ó PAD: <50 (Hipotensión severa)<br>PAS: ≥140 ó PAD: ≥90 (Hipertensión Grado 2)<br>PAS: ≥180 ó PAD: ≥120 (Crisis Hipertensiva)<br>**PAS $\le$ PAD (Error Bloqueante)** |
| **Presión Arterial Media (PAM)** | mmHg | 70 – 105 (Perfusión adecuada) | 65 – 69 (Límite bajo) ó > 105 (Elevada) | **< 65 (Alerta: Hipoperfusión tisular)** |
| **Frecuencia Cardíaca (FC)** | lpm | 60 – 100 (Normocardia) | 50 – 59 (Brad. leve)<br>101 – 119 (Taquic. leve) | < 50 (Bradicardia severa)<br>≥ 120 (Taquicardia severa)<br>$\le 0$ (Error lógico) |
| **Frecuencia Respiratoria (FR)** | rpm | 12 – 20 (Eupnea) | 10 – 11 (Bradipnea leve)<br>21 – 24 (Taquipnea leve) | < 10 (Depresión respiratoria)<br>≥ 25 (Taquipnea severa)<br>$\le 0$ (Error lógico) |
| **Temperatura Corporal (T°)** | °C | 36.0 – 37.5 (Afebril) | 37.6 – 37.9 (Febrícula)<br>35.5 – 35.9 (Hipotermia leve) | ≥ 38.0 (Fiebre / Pirexia)<br>< 35.5 (Hipotermia)<br>< 25 ó > 45 °C (Error fuera de rango) |
| **SpO₂ (Tunja 2.810m)** | % | ≥ 90% (Esperado en altura) | 85 – 89% (Hipoxemia leve) | < 85% (Hipoxemia severa)<br>> 100% (Error imposible) |
| **SpO₂ (Nivel del mar)** | % | 95 – 100% (Normosaturación) | 90 – 94% (Hipoxemia leve) | < 90% (Hipoxemia severa)<br>> 100% (Error imposible) |

---

## 4. Estructura de Archivos (Para subir a GitHub)

```text
SignosSemaforo/
├── index.html        # Estructura limpia, semántica y accesible
├── style.css         # Clean UI, Toast superior, Modo Nocturno y Bordes Dinámicos
├── app.js            # Motor reactivo, validaciones bloqueantes, PAM y SOAPIE
├── sw.js             # Service Worker optimizado (100% Offline)
├── manifest.json     # Manifiesto Web App
├── icon-192.png      # Icono médico 192x192
├── icon-512.png      # Icono médico 512x512
└── README.md         # Documentación académica y técnica
```

---

## 5. Cómo Publicar en GitHub Pages en 3 Pasos

1. Ingrese a [github.com](https://github.com) y cree un repositorio llamado `signos-semaforo` en modo **Public**.
2. Arrastre los archivos de esta carpeta (`index.html`, `style.css`, `app.js`, `sw.js`, `manifest.json`, `icon-192.png`, `icon-512.png`, `README.md`) y guarde con **Commit changes**.
3. En **Settings** ⚙️ $\rightarrow$ **Pages** $\rightarrow$ en **Branch** elija `main` y haga clic en **Save**. En 1 minuto su sitio web estará activo en:  
   `https://tu-usuario.github.io/signos-semaforo/`
