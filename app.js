/**
 * SignosSemáforo - Validador Rápido de Signos Vitales (Solo Adultos)
 * Universidad de Boyacá - Facultad de Ciencias de la Salud
 * Estudiante: William Esteban Forero Ojeda (Cód. 66625059)
 * Docente: Santiago Correal
 *
 * Optimizaciones Clínicas:
 * 1. Notificación flotante emergente garantizada al copiar con retroalimentación inmediata.
 * 2. Limpieza total de pantalla, reportes y estado DOM al pulsar «Limpiar campos».
 * 3. Bloqueo de seguridad y alerta roja ante inconsistencias clínicas (PAS <= PAD, SpO2 > 100%).
 * 4. Cálculo automático de Presión Arterial Media (PAM) con alerta de hipoperfusión (< 65 mmHg).
 * 5. Generación de Nota de Enfermería bajo formato SOAPIE estandarizado.
 * 6. Modo Turno Nocturno (Dark Mode) con persistencia local.
 */

// ============================================================
// 1. CÁLCULO DE PAM Y REGLAS DE EVALUACIÓN CLÍNICA (ADULTOS)
// ============================================================

/**
 * Calcula y evalúa la Presión Arterial Media (PAM)
 * Fórmula médica: PAM = (PAS + 2 * PAD) / 3
 * Normal: 70 - 105 mmHg | Alerta Hipoperfusión: < 65 mmHg
 */
function calcularYEvaluarPAM(pas, pad) {
  if (isNaN(pas) || isNaN(pad) || pas <= pad || pas <= 0 || pad <= 0) {
    return null;
  }

  const pam = (pas + (2 * pad)) / 3;
  const pamRedondeada = Math.round(pam * 10) / 10;

  let status = 'green';
  let badge = 'Normal (70–105 mmHg)';
  let alertaHipoperfusion = false;
  let mensajeAlerta = '';

  if (pamRedondeada < 65) {
    status = 'red';
    badge = 'Alerta: Hipoperfusión (<65)';
    alertaHipoperfusion = true;
    mensajeAlerta = '⚠️ Alerta de Hipoperfusión Tisular (PAM < 65 mmHg): Riesgo de isquemia miocárdica y daño renal. Avisar de inmediato.';
  } else if (pamRedondeada < 70) {
    status = 'yellow';
    badge = 'Límite Bajo (65–69 mmHg)';
  } else if (pamRedondeada >= 70 && pamRedondeada <= 105) {
    status = 'green';
    badge = 'Normal (Perfusión adecuada)';
  } else {
    status = 'yellow';
    badge = 'Elevada (>105 mmHg)';
  }

  return {
    valor: pamRedondeada,
    status: status,
    badge: badge,
    alertaHipoperfusion: alertaHipoperfusion,
    mensajeAlerta: mensajeAlerta
  };
}

/**
 * Evalúa la Presión Arterial en Adultos
 */
function evaluarPA(pas, pad) {
  if (isNaN(pas) && isNaN(pad)) return null;

  if (isNaN(pas) || isNaN(pad)) {
    return {
      status: 'neutral',
      badge: 'Incompleto',
      detail: 'Ingrese tanto la Presión Sistólica (PAS) como la Diastólica (PAD).',
      cardClass: ''
    };
  }

  // Validación clínica estricta: PAS debe ser mayor que PAD
  if (pas <= pad) {
    return {
      status: 'red',
      badge: '⛔ Error: PAS ≤ PAD',
      detail: `Inconsistencia clínica crítica: La PAS (${pas} mmHg) no puede ser menor o igual a la PAD (${pad} mmHg).`,
      cardClass: 'card-border-red',
      isError: true
    };
  }

  // Alerta Crítica (Rojo)
  if (pas < 80 || pad < 50) {
    return {
      status: 'red',
      badge: 'Alerta: Hipotensión Severa',
      detail: 'Hipotensión marcada. Riesgo de hipoperfusión o shock. Avisar de inmediato a supervisión.',
      cardClass: 'card-border-red'
    };
  }
  if (pas >= 180 || pad >= 120) {
    return {
      status: 'red',
      badge: 'Alerta: Crisis Hipertensiva',
      detail: 'Cifras en rango de crisis hipertensiva. Notificar de urgencia para valoración médica.',
      cardClass: 'card-border-red'
    };
  }
  if (pas >= 140 || pad >= 90) {
    return {
      status: 'red',
      badge: 'Alerta: Hipertensión Grado 2',
      detail: 'Hipertensión arterial significativa. Notificar a supervisión clínica.',
      cardClass: 'card-border-red'
    };
  }

  // Alteración Leve (Amarillo)
  if ((pas >= 80 && pas < 90) || (pad >= 50 && pad < 60)) {
    return {
      status: 'yellow',
      badge: 'Alteración: Hipotensión Leve',
      detail: 'Presión limítrofe baja. Vigilar sintomatología (mareo, palidez, frialdad distal).',
      cardClass: 'card-border-yellow'
    };
  }
  if ((pas >= 121 && pas <= 139) || (pad >= 81 && pad <= 89)) {
    return {
      status: 'yellow',
      badge: 'Alteración: Presión Elevada',
      detail: 'Prehipertensión / PA elevada. Reposar al paciente 5 min y corroborar en brazo contralateral.',
      cardClass: 'card-border-yellow'
    };
  }

  // Normal (Verde)
  if (pas >= 90 && pas <= 120 && pad >= 60 && pad <= 80) {
    return {
      status: 'green',
      badge: 'Normal (Normotensión)',
      detail: 'Presión arterial óptima dentro de parámetros fisiológicos esperados para adulto.',
      cardClass: 'card-border-green'
    };
  }

  return {
    status: 'yellow',
    badge: 'Discrepancia tensional',
    detail: 'Revisar calibración del tensiómetro y manguito acorde al brazo del paciente.',
    cardClass: 'card-border-yellow'
  };
}

/**
 * Evalúa la Frecuencia Cardíaca (lpm)
 */
function evaluarFC(fc) {
  if (isNaN(fc)) return null;
  if (fc <= 0) {
    return {
      status: 'red',
      badge: '⛔ Error: FC ≤ 0',
      detail: 'La frecuencia cardíaca debe ser un número positivo mayor a 0 lpm.',
      cardClass: 'card-border-red',
      isError: true
    };
  }

  if (fc < 50) {
    return {
      status: 'red',
      badge: 'Alerta: Bradicardia Severa',
      detail: 'Menor a 50 lpm. Evaluar pulso apical, estado de alerta y notificar de inmediato.',
      cardClass: 'card-border-red'
    };
  }
  if (fc >= 120) {
    return {
      status: 'red',
      badge: 'Alerta: Taquicardia Severa',
      detail: 'Mayor o igual a 120 lpm. Descartar dolor, fiebre, hipovolemia o arritmia.',
      cardClass: 'card-border-red'
    };
  }
  if (fc >= 50 && fc < 60) {
    return {
      status: 'yellow',
      badge: 'Alteración: Bradicardia Leve',
      detail: '50–59 lpm. Frecuente en deportistas entrenados o pacientes con betabloqueadores.',
      cardClass: 'card-border-yellow'
    };
  }
  if (fc > 100 && fc < 120) {
    return {
      status: 'yellow',
      badge: 'Alteración: Taquicardia Leve',
      detail: '101–119 lpm. Valorar estado emocional, dolor agudo o esfuerzo previo.',
      cardClass: 'card-border-yellow'
    };
  }
  if (fc >= 60 && fc <= 100) {
    return {
      status: 'green',
      badge: 'Normal (Normocardia)',
      detail: '60–100 lpm. Frecuencia y ritmo en rango fisiológico normal para adulto.',
      cardClass: 'card-border-green'
    };
  }

  return null;
}

/**
 * Evalúa la Frecuencia Respiratoria (rpm)
 */
function evaluarFR(fr) {
  if (isNaN(fr)) return null;
  if (fr <= 0) {
    return {
      status: 'red',
      badge: '⛔ Error: FR ≤ 0',
      detail: 'La frecuencia respiratoria debe ser un valor positivo mayor a 0 rpm.',
      cardClass: 'card-border-red',
      isError: true
    };
  }

  if (fr < 10) {
    return {
      status: 'red',
      badge: 'Alerta: Bradipnea Severa',
      detail: 'Menor a 10 rpm. Depresión ventilatoria crítica. Requiere asistencia inmediata.',
      cardClass: 'card-border-red'
    };
  }
  if (fr >= 25) {
    return {
      status: 'red',
      badge: 'Alerta: Taquipnea Severa',
      detail: 'Mayor o igual a 25 rpm. Signo temprano de dificultad ventilatoria o sepsis.',
      cardClass: 'card-border-red'
    };
  }
  if (fr >= 10 && fr <= 11) {
    return {
      status: 'yellow',
      badge: 'Alteración: Bradipnea Leve',
      detail: '10–11 rpm. Monitorizar profundidad y patrón ventilatorio.',
      cardClass: 'card-border-yellow'
    };
  }
  if (fr >= 21 && fr <= 24) {
    return {
      status: 'yellow',
      badge: 'Alteración: Taquipnea Leve',
      detail: '21–24 rpm. Observar uso de músculos accesorios o aleteo nasal.',
      cardClass: 'card-border-yellow'
    };
  }
  if (fr >= 12 && fr <= 20) {
    return {
      status: 'green',
      badge: 'Normal (Eupnea)',
      detail: '12–20 rpm. Patrón ventilatorio rítmico, simétrico y sin esfuerzo.',
      cardClass: 'card-border-green'
    };
  }

  return null;
}

/**
 * Evalúa la Temperatura Corporal (°C)
 */
function evaluarTemp(temp) {
  if (isNaN(temp)) return null;
  if (temp < 25.0 || temp > 45.0) {
    return {
      status: 'red',
      badge: '⛔ Error: T° fuera de rango',
      detail: 'Temperatura incompatible con la vida clínica (ingrese un rango entre 25.0 °C y 45.0 °C).',
      cardClass: 'card-border-red',
      isError: true
    };
  }

  if (temp < 35.5) {
    return {
      status: 'red',
      badge: 'Alerta: Hipotermia',
      detail: 'Menor a 35.5 °C. Proteger con mantas térmicas e informar inmediatamente.',
      cardClass: 'card-border-red'
    };
  }
  if (temp >= 38.0) {
    return {
      status: 'red',
      badge: 'Alerta: Fiebre (Pirexia)',
      detail: 'Mayor o igual a 38.0 °C. Reportar para indicación médica de antipiréticos o medios físicos.',
      cardClass: 'card-border-red'
    };
  }
  if (temp >= 37.6 && temp <= 37.9) {
    return {
      status: 'yellow',
      badge: 'Alteración: Febrícula',
      detail: '37.6–37.9 °C. Estado pre-febril. Reevaluar en 30 minutos y verificar hidratación.',
      cardClass: 'card-border-yellow'
    };
  }
  if (temp >= 35.5 && temp < 36.0) {
    return {
      status: 'yellow',
      badge: 'Alteración: Hipotermia Leve',
      detail: '35.5–35.9 °C. Abrigamiento adecuado y corroborar termómetro.',
      cardClass: 'card-border-yellow'
    };
  }
  if (temp >= 36.0 && temp <= 37.5) {
    return {
      status: 'green',
      badge: 'Normal (Afebril / Normotermia)',
      detail: '36.0–37.5 °C. Temperatura corporal en homeostasis fisiológica.',
      cardClass: 'card-border-green'
    };
  }

  return null;
}

/**
 * Evalúa la Saturación de Oxígeno (%) según Altitud
 */
function evaluarSpO2(spo2, modoAltitud) {
  if (isNaN(spo2)) return null;

  if (spo2 > 100 || spo2 < 0) {
    return {
      status: 'red',
      badge: '⛔ Error: SpO₂ inválida',
      detail: `Cifra físicamente imposible: La saturación de oxígeno (${spo2}%) no puede ser mayor a 100% ni negativa.`,
      cardClass: 'card-border-red',
      isError: true
    };
  }

  const esTunja = (modoAltitud === 'tunja');

  if (esTunja) {
    if (spo2 < 85) {
      return {
        status: 'red',
        badge: 'Alerta: Hipoxemia Severa',
        detail: 'Menor al 85% en Tunja (2.810 m). Compromiso de oxigenación. Avisar urgente.',
        cardClass: 'card-border-red'
      };
    }
    if (spo2 >= 85 && spo2 < 90) {
      return {
        status: 'yellow',
        badge: 'Alteración: Hipoxemia Leve (Altura)',
        detail: '85–89% en Tunja. Valorar patrón respiratorio y permeabilidad de vía aérea.',
        cardClass: 'card-border-yellow'
      };
    }
    if (spo2 >= 90 && spo2 <= 100) {
      return {
        status: 'green',
        badge: 'Normal (Aceptable en Tunja)',
        detail: '≥ 90%. Saturación adecuada para altitud de Tunja (2.810 msnm).',
        cardClass: 'card-border-green'
      };
    }
  } else {
    if (spo2 < 90) {
      return {
        status: 'red',
        badge: 'Alerta: Hipoxemia Severa',
        detail: 'Menor a 90%. Alerta para el servicio. Requiere oxigenoterapia inmediata.',
        cardClass: 'card-border-red'
      };
    }
    if (spo2 >= 90 && spo2 <= 94) {
      return {
        status: 'yellow',
        badge: 'Alteración: Hipoxemia Leve',
        detail: '90–94%. Valorar perfusión periférica, frío distal o esmalte de uñas.',
        cardClass: 'card-border-yellow'
      };
    }
    if (spo2 >= 95 && spo2 <= 100) {
      return {
        status: 'green',
        badge: 'Normal (Normosaturación)',
        detail: '95–100%. Saturación arterial de oxígeno óptima a nivel del mar.',
        cardClass: 'card-border-green'
      };
    }
  }

  return null;
}


// ============================================================
// 2. REFERENCIAS AL DOM
// ============================================================

const inputPAS = document.getElementById('input-pas');
const inputPAD = document.getElementById('input-pad');
const inputFC = document.getElementById('input-fc');
const inputFR = document.getElementById('input-fr');
const inputTemp = document.getElementById('input-temp');
const inputSpO2 = document.getElementById('input-spo2');
const selectAltitude = document.getElementById('altitude-mode');

// Badges y Feedbacks
const badgePA = document.getElementById('badge-pa');
const feedbackPA = document.getElementById('feedback-pa');
const cardPA = document.getElementById('card-pa');

const badgeFC = document.getElementById('badge-fc');
const feedbackFC = document.getElementById('feedback-fc');
const cardFC = document.getElementById('card-fc');

const badgeFR = document.getElementById('badge-fr');
const feedbackFR = document.getElementById('feedback-fr');
const cardFR = document.getElementById('card-fr');

const badgeTemp = document.getElementById('badge-temp');
const feedbackTemp = document.getElementById('feedback-temp');
const cardTemp = document.getElementById('card-temp');

const badgeSpO2 = document.getElementById('badge-spo2');
const feedbackSpO2 = document.getElementById('feedback-spo2');
const cardSpO2 = document.getElementById('card-spo2');

// Cajas de Error
const errorPA = document.getElementById('error-pa');
const errorFC = document.getElementById('error-fc');
const errorFR = document.getElementById('error-fr');
const errorTemp = document.getElementById('error-temp');
const errorSpO2 = document.getElementById('error-spo2');

// Elementos de PAM
const pamValueEl = document.getElementById('pam-value');
const pamBadgeEl = document.getElementById('pam-badge');
const pamAlertEl = document.getElementById('pam-alert');

// Banner Global y Reporte
const bannerGlobal = document.getElementById('global-status-banner');
const bannerTitle = document.getElementById('banner-title');
const bannerDesc = document.getElementById('banner-desc');
const bannerIcon = document.getElementById('banner-icon');
const reportTextarea = document.getElementById('report-textarea');
const copySuccessBanner = document.getElementById('copy-success-banner');

const refAltitudeLabel = document.getElementById('ref-altitude-label');
const refSpO2Ranges = document.getElementById('ref-spo2-ranges');

// SVGs para el banner global
const ICON_WAITING = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;
const ICON_GREEN = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg>`;
const ICON_YELLOW = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;
const ICON_RED = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`;


// ============================================================
// 3. ACTUALIZACIÓN REACTIVA Y CONTROL DE ERRORES
// ============================================================

function mostrarErrorCampo(elementoError, mensaje) {
  if (mensaje) {
    elementoError.innerHTML = `<span>${mensaje}</span>`;
    elementoError.classList.add('show');
  } else {
    elementoError.innerHTML = '';
    elementoError.classList.remove('show');
  }
}

function actualizarUIElemento(evaluacion, badgeEl, feedbackEl, cardEl) {
  badgeEl.className = 'traffic-badge';
  feedbackEl.className = 'clinical-feedback';
  cardEl.classList.remove('card-border-green', 'card-border-yellow', 'card-border-red');

  if (!evaluacion) {
    badgeEl.classList.add('badge-neutral');
    badgeEl.querySelector('.badge-text').textContent = 'Sin datos';
    feedbackEl.textContent = '';
    feedbackEl.classList.remove('show');
    return;
  }

  if (evaluacion.status === 'green') {
    badgeEl.classList.add('badge-green');
    feedbackEl.classList.add('fb-green', 'show');
    cardEl.classList.add('card-border-green');
  } else if (evaluacion.status === 'yellow') {
    badgeEl.classList.add('badge-yellow');
    feedbackEl.classList.add('fb-yellow', 'show');
    cardEl.classList.add('card-border-yellow');
  } else if (evaluacion.status === 'red') {
    badgeEl.classList.add('badge-red');
    feedbackEl.classList.add('fb-red', 'show');
    cardEl.classList.add('card-border-red');
  } else {
    badgeEl.classList.add('badge-neutral');
  }

  badgeEl.querySelector('.badge-text').textContent = evaluacion.badge;
  feedbackEl.textContent = evaluacion.detail;
}

/**
 * Función central de evaluación
 */
function evaluarTodosLosSignos() {
  const pasVal = inputPAS.value.trim();
  const padVal = inputPAD.value.trim();
  const fcVal = inputFC.value.trim();
  const frVal = inputFR.value.trim();
  const tempVal = inputTemp.value.trim();
  const spo2Val = inputSpO2.value.trim();

  const pas = pasVal !== '' ? parseFloat(pasVal) : NaN;
  const pad = padVal !== '' ? parseFloat(padVal) : NaN;
  const fc = fcVal !== '' ? parseFloat(fcVal) : NaN;
  const fr = frVal !== '' ? parseFloat(frVal) : NaN;
  const temp = tempVal !== '' ? parseFloat(tempVal) : NaN;
  const spo2 = spo2Val !== '' ? parseFloat(spo2Val) : NaN;
  const modoAltitud = selectAltitude.value;

  const resPA = evaluarPA(pas, pad);
  const resFC = evaluarFC(fc);
  const resFR = evaluarFR(fr);
  const resTemp = evaluarTemp(temp);
  const resSpO2 = evaluarSpO2(spo2, modoAltitud);

  // Validaciones y mensajes de error específicos
  let errorPAMsg = '';
  if (!isNaN(pas) && !isNaN(pad)) {
    if (pas <= pad) {
      errorPAMsg = `⛔ Error clínico: La Presión Sistólica (${pas} mmHg) no puede ser menor o igual a la Diastólica (${pad} mmHg).`;
    } else if (pas <= 0 || pad <= 0) {
      errorPAMsg = '⛔ Las cifras de presión arterial deben ser mayores a 0 mmHg.';
    }
  }
  mostrarErrorCampo(errorPA, errorPAMsg);

  let errorSpO2Msg = '';
  if (!isNaN(spo2)) {
    if (spo2 > 100) {
      errorSpO2Msg = `⛔ Cifra imposible: La saturación de oxígeno (${spo2}%) no puede ser mayor al 100%.`;
    } else if (spo2 < 0) {
      errorSpO2Msg = '⛔ La saturación de oxígeno no puede ser un valor negativo.';
    }
  }
  mostrarErrorCampo(errorSpO2, errorSpO2Msg);

  let errorFCMsg = '';
  if (!isNaN(fc) && fc <= 0) {
    errorFCMsg = '⛔ La frecuencia cardíaca debe ser un valor positivo mayor a 0 lpm.';
  }
  mostrarErrorCampo(errorFC, errorFCMsg);

  let errorFRMsg = '';
  if (!isNaN(fr) && fr <= 0) {
    errorFRMsg = '⛔ La frecuencia respiratoria debe ser un valor positivo mayor a 0 rpm.';
  }
  mostrarErrorCampo(errorFR, errorFRMsg);

  let errorTempMsg = '';
  if (!isNaN(temp) && (temp < 25.0 || temp > 45.0)) {
    errorTempMsg = '⛔ Temperatura biológicamente incompatible: Ingrese un valor entre 25.0 °C y 45.0 °C.';
  }
  mostrarErrorCampo(errorTemp, errorTempMsg);

  // Actualizar tarjetas de signos
  actualizarUIElemento(resPA, badgePA, feedbackPA, cardPA);
  actualizarUIElemento(resFC, badgeFC, feedbackFC, cardFC);
  actualizarUIElemento(resFR, badgeFR, feedbackFR, cardFR);
  actualizarUIElemento(resTemp, badgeTemp, feedbackTemp, cardTemp);
  actualizarUIElemento(resSpO2, badgeSpO2, feedbackSpO2, cardSpO2);

  // Actualizar PAM (bloqueada si PAS <= PAD)
  const resPAM = calcularYEvaluarPAM(pas, pad);
  actualizarUIPAM(resPAM, errorPAMsg !== '');

  // Ocultar banner de copiado previo al editar
  if (copySuccessBanner) {
    copySuccessBanner.style.display = 'none';
  }

  // Lista de inconsistencias bloqueantes
  const erroresActivos = [];
  if (errorPAMsg) erroresActivos.push('Presión Arterial: PAS debe ser mayor que PAD.');
  if (errorSpO2Msg) erroresActivos.push('SpO₂ no puede ser mayor al 100%.');
  if (errorFCMsg) erroresActivos.push('Frecuencia cardíaca debe ser mayor a 0.');
  if (errorFRMsg) erroresActivos.push('Frecuencia respiratoria debe ser mayor a 0.');
  if (errorTempMsg) erroresActivos.push('Temperatura fuera de rango biológico.');

  bannerGlobal.className = 'status-banner';

  // Si hay inconsistencias bloqueantes: ALERTA ROJA Y BLOQUEO DE NOTA
  if (erroresActivos.length > 0) {
    bannerGlobal.classList.add('banner-red');
    bannerIcon.innerHTML = ICON_RED;
    bannerTitle.textContent = '⛔ DATOS INCONSISTENTES DETECTADOS — CORRIJA LOS ERRORES';
    bannerDesc.textContent = erroresActivos.join(' | ') + ' Corrija las cifras en rojo para poder emitir el reporte clínico.';

    reportTextarea.value = `⛔ REPORTE BLOQUEADO POR SEGURIDAD CLÍNICA:\n\nExisten inconsistencias en los datos ingresados que impiden generar una nota de enfermería válida:\n${erroresActivos.map(err => ' • ' + err).join('\n')}\n\nPor favor corrija los campos resaltados en rojo para reanudar la valoración.`;
    return;
  }

  // Si no hay datos ingresados
  const listaResultados = [resPA, resFC, resFR, resTemp, resSpO2].filter(r => r !== null && r.status !== 'neutral');

  if (resPAM && resPAM.status === 'red') {
    listaResultados.push({ status: 'red', badge: resPAM.badge });
  }

  if (listaResultados.length === 0) {
    bannerGlobal.classList.add('status-empty');
    bannerIcon.innerHTML = ICON_WAITING;
    bannerTitle.textContent = 'Esperando ingreso de signos vitales';
    bannerDesc.textContent = 'Ingrese los valores tomados al paciente adulto para obtener la clasificación inmediata en semáforo.';
    reportTextarea.value = '';
    return;
  }

  const tieneRojo = listaResultados.some(r => r.status === 'red');
  const tieneAmarillo = listaResultados.some(r => r.status === 'yellow');

  if (tieneRojo) {
    bannerGlobal.classList.add('banner-red');
    bannerIcon.innerHTML = ICON_RED;
    bannerTitle.textContent = 'ALERTA DE SERVICIO (ROJO) — PRIORIDAD CLÍNICA';
    bannerDesc.textContent = 'Se detectó al menos un signo vital en rango crítico o hipoperfusión (PAM < 65). Corroborar inmediatamente e informar a docente supervisor o jefa de servicio.';
  } else if (tieneAmarillo) {
    bannerGlobal.classList.add('banner-yellow');
    bannerIcon.innerHTML = ICON_YELLOW;
    bannerTitle.textContent = 'ALTERACIÓN LEVE DETECTADA (AMARILLO) — OBSERVACIÓN';
    bannerDesc.textContent = 'Uno o más signos vitales están fuera del rango normal óptimo. Reevaluar en 15–30 min y registrar evolución.';
  } else {
    bannerGlobal.classList.add('banner-green');
    bannerIcon.innerHTML = ICON_GREEN;
    bannerTitle.textContent = 'SIGNOS EN RANGO FISIOLÓGICO NORMAL (VERDE)';
    bannerDesc.textContent = 'Todos los signos registrados se encuentran estables dentro de parámetros normales esperados en adulto.';
  }

  // Generar nota SOAPIE
  actualizarReporteSOAPIE({
    pas, pad, fc, fr, temp, spo2,
    resPA, resFC, resFR, resTemp, resSpO2,
    resPAM,
    tieneRojo, tieneAmarillo
  });
}

/**
 * Actualiza la caja visual de PAM
 */
function actualizarUIPAM(resPAM, hayErrorInconsistencia) {
  pamBadgeEl.className = 'pam-badge';

  if (!resPAM || hayErrorInconsistencia) {
    pamValueEl.textContent = '-- mmHg';
    pamBadgeEl.classList.add('badge-neutral');
    pamBadgeEl.textContent = 'Sin cálculo';
    pamAlertEl.style.display = 'none';
    pamAlertEl.textContent = '';
    return;
  }

  pamValueEl.textContent = `${resPAM.valor} mmHg`;

  if (resPAM.status === 'green') {
    pamBadgeEl.classList.add('badge-green');
    pamBadgeEl.textContent = resPAM.badge;
    pamAlertEl.style.display = 'none';
  } else if (resPAM.status === 'yellow') {
    pamBadgeEl.classList.add('badge-yellow');
    pamBadgeEl.textContent = resPAM.badge;
    pamAlertEl.style.display = 'none';
  } else if (resPAM.status === 'red') {
    pamBadgeEl.classList.add('badge-red');
    pamBadgeEl.textContent = resPAM.badge;
    if (resPAM.alertaHipoperfusion) {
      pamAlertEl.style.display = 'flex';
      pamAlertEl.textContent = resPAM.mensajeAlerta;
    }
  }
}


// ============================================================
// 4. GENERADOR DE NOTA DE ENFERMERÍA EN FORMATO SOAPIE
// ============================================================

function actualizarReporteSOAPIE(datos) {
  const now = new Date();
  const fechaStr = now.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const horaStr = now.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: true });

  const altitudTexto = selectAltitude.value === 'tunja' ? 'Altitud Tunja 2.810 msnm' : 'Nivel del mar';

  let estadoSemaforo = 'VERDE • Normal';
  let analisisClinico = 'Paciente adulto hemodinámicamente estable, afebril y con adecuada mecánica ventilatoria. Cifras dentro de límites fisiológicos normales. Perfusión tisular preservada.';
  let intervenciones = '- Continuar con el plan de cuidados de enfermería y monitorización de rutina según indicación médica.\n- Mantener medidas de confort y bioseguridad.\n- Registrar en la historia clínica del servicio.';

  if (datos.tieneRojo) {
    estadoSemaforo = 'ROJO • ALERTA CRÍTICA PARA EL SERVICIO';
    analisisClinico = 'ALERTA CRÍTICA: Se evidencian signos vitales con alteración hemodinámica o ventilatoria significativa y riesgo de compromiso clínico o hipoperfusión tisular.';
    intervenciones = '- ACCIÓN PRIORITARIA: Reportar de forma inmediata y verbal al docente supervisor y a la jefa de servicio.\n- Corroborar cifras y signos de alarma en el paciente (estado de conciencia, perfusión periférica, dolor).\n- Mantener al paciente en su unidad asistido y alistar equipo de soporte vital según indicación médica prioritaria.';
  } else if (datos.tieneAmarillo) {
    estadoSemaforo = 'AMARILLO • ALTERACIÓN LEVE / OBSERVACIÓN';
    analisisClinico = 'Se detectan parámetros vitales limítrofes o alteración leve que requiere vigilancia activa de enfermería para descartar descompensación.';
    intervenciones = '- Verificar reposo previo de 5 a 10 minutos y técnica de toma de signos vitales.\n- Programar reevaluación seriada en 15 a 30 minutos.\n- Notificar al personal de enfermería de turno para seguimiento continuo.';
  }

  let lineas = [];
  lineas.push(`============================================================`);
  lineas.push(`NOTA DE EVOLUCIÓN DE ENFERMERÍA — FORMATO SOAPIE (ADULTOS)`);
  lineas.push(`Fecha: ${fechaStr} | Hora: ${horaStr}`);
  lineas.push(`Entorno: Práctica Clínica / Simulación (${altitudTexto})`);
  lineas.push(`============================================================\n`);

  lineas.push(`[S] SUBJETIVO:`);
  lineas.push(`Paciente adulto en reposo en su unidad al momento de la ronda de signos vitales. Refiere sentirse tranquilo, consciente, orientado y sin dolor agudo imprevisto manifestado al inicio de la valoración.\n`);

  lineas.push(`[O] OBJETIVO:`);
  lineas.push(`A la valoración de signos vitales en paciente adulto (${altitudTexto}):`);

  if (!isNaN(datos.pas) && !isNaN(datos.pad) && datos.pas > datos.pad) {
    const pamTxt = datos.resPAM ? ` | PAM: ${datos.resPAM.valor} mmHg [${datos.resPAM.badge}]` : '';
    lineas.push(`• Presión Arterial (PA): ${datos.pas}/${datos.pad} mmHg [${datos.resPA.badge}]${pamTxt}`);
  }

  if (!isNaN(datos.fc) && datos.fc > 0) {
    lineas.push(`• Frecuencia Cardíaca (FC): ${datos.fc} lpm [${datos.resFC.badge}]`);
  }

  if (!isNaN(datos.fr) && datos.fr > 0) {
    lineas.push(`• Frecuencia Respiratoria (FR): ${datos.fr} rpm [${datos.resFR.badge}]`);
  }

  if (!isNaN(datos.temp) && datos.temp >= 25 && datos.temp <= 45) {
    lineas.push(`• Temperatura Corporal (T°): ${datos.temp} °C [${datos.resTemp.badge}]`);
  }

  if (!isNaN(datos.spo2) && datos.spo2 >= 0 && datos.spo2 <= 100) {
    lineas.push(`• Saturación de Oxígeno (SpO2): ${datos.spo2}% [${datos.resSpO2.badge}]`);
  }

  lineas.push(`\n[A] ANÁLISIS:`);
  lineas.push(`- Semáforo Clínico: ${estadoSemaforo}`);
  lineas.push(`- Interpretación: ${analisisClinico}\n`);

  lineas.push(`[P / I] PLAN E INTERVENCIONES:`);
  lineas.push(intervenciones + `\n`);

  lineas.push(`[E] EVALUACIÓN:`);
  lineas.push(`Paciente permanece en observación activa de enfermería. Se continúa monitorización y registro evolutivo.`);
  lineas.push(`------------------------------------------------------------`);
  lineas.push(`Estudiante: William Esteban Forero Ojeda (Cód. 66625059)`);
  lineas.push(`4.° Semestre de Enfermería • Universidad de Boyacá`);
  lineas.push(`Docente: Santiago Correal`);
  lineas.push(`* Registro confidencial pedagógico sin datos nominales (Habeas Data)`);
  lineas.push(`============================================================`);

  reportTextarea.value = lineas.join('\n');
}

/**
 * Botón explícito "Generar Nota SOAPIE"
 */
function generarReporte() {
  evaluarTodosLosSignos();
  const contenido = reportTextarea.value.trim();
  if (contenido.startsWith('⛔ REPORTE BLOQUEADO')) {
    mostrarToast('Corrija las inconsistencias en rojo antes de generar la nota', 'error');
    return;
  }
  if (!contenido) {
    mostrarToast('Ingrese al menos un signo vital para generar la nota', 'info');
    return;
  }
  const reportSection = document.getElementById('report-section');
  reportSection.scrollIntoView({ behavior: 'smooth' });
  mostrarToast('¡Nota SOAPIE estructurada con éxito!', 'success');
}


// ============================================================
// 5. COPIADO SEGURO Y NOTIFICACIÓN INMEDIATA (FALLA 1 CORREGIDA)
// ============================================================

/**
 * Copia el reporte al portapapeles y despliega notificación visible inmediata
 */
function copiarReporte() {
  const contenido = reportTextarea.value.trim();

  if (!contenido) {
    mostrarToast('Ingrese signos vitales antes de copiar', 'info');
    return;
  }

  if (contenido.startsWith('⛔ REPORTE BLOQUEADO')) {
    mostrarToast('No se puede copiar: Corrija las inconsistencias en rojo', 'error');
    return;
  }

  const copyText = document.getElementById('copy-text');
  const btnCopy = document.getElementById('btn-copy-report');

  // Algoritmo de copiado robusto y compatible
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(contenido)
      .then(() => {
        onCopiadoExitoso(copyText, btnCopy);
      })
      .catch(() => {
        copiarConElementoAuxiliar(contenido, copyText, btnCopy);
      });
  } else {
    copiarConElementoAuxiliar(contenido, copyText, btnCopy);
  }
}

/**
 * Método de copiado infalible mediante textarea auxiliar
 */
function copiarConElementoAuxiliar(texto, copyText, btnCopy) {
  const textareaAux = document.createElement('textarea');
  textareaAux.value = texto;
  textareaAux.setAttribute('readonly', '');
  textareaAux.style.position = 'fixed';
  textareaAux.style.top = '-9999px';
  textareaAux.style.left = '-9999px';
  textareaAux.style.opacity = '0';
  document.body.appendChild(textareaAux);

  textareaAux.focus();
  textareaAux.select();
  textareaAux.setSelectionRange(0, textareaAux.value.length);

  try {
    const copiado = document.execCommand('copy');
    if (copiado) {
      onCopiadoExitoso(copyText, btnCopy);
    } else {
      mostrarToast('Seleccione y copie el texto manualmente', 'info');
    }
  } catch (err) {
    mostrarToast('Seleccione y copie el texto manualmente', 'info');
  } finally {
    document.body.removeChild(textareaAux);
  }
}

/**
 * Acciones visuales ejecutadas al copiar exitosamente
 */
function onCopiadoExitoso(copyText, btnCopy) {
  // 1. Notificación flotante superior prominente
  mostrarToast('¡Nota copiada al portapapeles con éxito!', 'success');

  // 2. Banner de confirmación en la propia tarjeta del reporte
  if (copySuccessBanner) {
    copySuccessBanner.style.display = 'flex';
  }

  // 3. Feedback visual directo en el botón
  copyText.textContent = '✓ ¡Copiado!';
  btnCopy.style.background = '#dcfce7';
  btnCopy.style.borderColor = '#86efac';
  btnCopy.style.color = '#166534';

  setTimeout(() => {
    copyText.textContent = 'Copiar nota';
    btnCopy.style.background = '';
    btnCopy.style.borderColor = '';
    btnCopy.style.color = '';
  }, 2500);
}

/**
 * Despliega Toast flotante visible con tipo (success, error, info)
 */
let toastTimeout = null;
function mostrarToast(mensaje, tipo = 'success') {
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toast-message');
  const toastIcon = document.getElementById('toast-icon');

  if (!toast || !toastMessage) return;

  toastMessage.textContent = mensaje;
  toast.className = 'toast toast-show';

  if (tipo === 'success') {
    toast.classList.add('toast-success');
    toastIcon.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`;
  } else if (tipo === 'error') {
    toast.classList.add('toast-error');
    toastIcon.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`;
  } else {
    toastIcon.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;
  }

  if (toastTimeout) {
    clearTimeout(toastTimeout);
  }

  toastTimeout = setTimeout(() => {
    toast.classList.remove('toast-show');
  }, 2600);
}


// ============================================================
// 6. LIMPIEZA COMPLETA DE PANTALLA (FALLA 2 CORREGIDA)
// ============================================================

/**
 * Resetea completamente todos los campos, cálculos, notas y estado visual
 */
function limpiarFormulario() {
  // 1. Limpiar campos de texto numéricos
  inputPAS.value = '';
  inputPAD.value = '';
  inputFC.value = '';
  inputFR.value = '';
  inputTemp.value = '';
  inputSpO2.value = '';

  // 2. Limpiar reporte generado y ocultar banner de copiado
  reportTextarea.value = '';
  if (copySuccessBanner) {
    copySuccessBanner.style.display = 'none';
  }

  // 3. Limpiar todos los mensajes de error
  mostrarErrorCampo(errorPA, '');
  mostrarErrorCampo(errorFC, '');
  mostrarErrorCampo(errorFR, '');
  mostrarErrorCampo(errorTemp, '');
  mostrarErrorCampo(errorSpO2, '');

  // 4. Resetear badges a "Sin datos" neutral
  const badges = [badgePA, badgeFC, badgeFR, badgeTemp, badgeSpO2];
  badges.forEach(b => {
    b.className = 'traffic-badge badge-neutral';
    b.querySelector('.badge-text').textContent = 'Sin datos';
  });

  // 5. Limpiar feedbacks de cada tarjeta
  const feedbacks = [feedbackPA, feedbackFC, feedbackFR, feedbackTemp, feedbackSpO2];
  feedbacks.forEach(f => {
    f.className = 'clinical-feedback';
    f.textContent = '';
  });

  // 6. Eliminar bordes dinámicos de semáforo de todas las tarjetas
  const cards = [cardPA, cardFC, cardFR, cardTemp, cardSpO2];
  cards.forEach(c => {
    c.classList.remove('card-border-green', 'card-border-yellow', 'card-border-red');
  });

  // 7. Resetear cálculo de PAM
  pamValueEl.textContent = '-- mmHg';
  pamBadgeEl.className = 'pam-badge badge-neutral';
  pamBadgeEl.textContent = 'Sin cálculo';
  pamAlertEl.style.display = 'none';
  pamAlertEl.textContent = '';

  // 8. Resetear banner global a estado inicial
  bannerGlobal.className = 'status-banner status-empty';
  bannerIcon.innerHTML = ICON_WAITING;
  bannerTitle.textContent = 'Esperando ingreso de signos vitales';
  bannerDesc.textContent = 'Ingrese los valores tomados al paciente adulto para obtener la clasificación inmediata en semáforo.';

  // 9. Desplazamiento suave al inicio de la pantalla y foco en el primer campo
  window.scrollTo({ top: 0, behavior: 'smooth' });
  setTimeout(() => {
    inputPAS.focus();
  }, 200);

  // 10. Notificación de confirmación
  mostrarToast('Pantalla y registros restablecidos para nuevo paciente', 'info');
}


// ============================================================
// 7. CASOS RÁPIDOS DE PRUEBA Y DEMOSTRACIÓN
// ============================================================

function cargarEjemplo(tipo) {
  if (tipo === 'normal') {
    inputPAS.value = '118';
    inputPAD.value = '76';
    inputFC.value = '72';
    inputFR.value = '16';
    inputTemp.value = '36.6';
    inputSpO2.value = '94';
  } else if (tipo === 'leve') {
    inputPAS.value = '134';
    inputPAD.value = '84';
    inputFC.value = '105';
    inputFR.value = '22';
    inputTemp.value = '37.8';
    inputSpO2.value = '88';
  } else if (tipo === 'critico') {
    // Caso de shock / hipotensión con hipoperfusión tisular crítica (PAM < 65)
    inputPAS.value = '82';
    inputPAD.value = '52'; // PAM = (82 + 104) / 3 = 62 mmHg (< 65)
    inputFC.value = '128';
    inputFR.value = '28';
    inputTemp.value = '38.9';
    inputSpO2.value = '82';
  }
  evaluarTodosLosSignos();
  mostrarToast(`Caso "${tipo.toUpperCase()}" cargado`, 'info');
}


// ============================================================
// 8. MODO TURNO NOCTURNO (DARK MODE)
// ============================================================

const nightIcon = document.getElementById('night-icon');
const nightText = document.getElementById('night-text');

const SVG_MOON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
const SVG_SUN = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`;

function toggleModoNocturno() {
  const esDark = document.body.classList.toggle('dark-mode');

  if (esDark) {
    nightIcon.innerHTML = SVG_SUN;
    nightText.textContent = 'Modo Diurno';
    localStorage.setItem('signos_dark_mode', 'true');
    mostrarToast('Turno Nocturno activado (Alto Contraste)', 'info');
  } else {
    nightIcon.innerHTML = SVG_MOON;
    nightText.textContent = 'Turno Nocturno';
    localStorage.setItem('signos_dark_mode', 'false');
    mostrarToast('Modo Diurno activado', 'info');
  }
}

// Inicializar Dark Mode guardado
(function initDarkMode() {
  const savedDark = localStorage.getItem('signos_dark_mode');
  if (savedDark === 'true') {
    document.body.classList.add('dark-mode');
    nightIcon.innerHTML = SVG_SUN;
    nightText.textContent = 'Modo Diurno';
  }
})();


// ============================================================
// 9. AJUSTE DE ALTITUD Y EVENTOS REACTIVOS
// ============================================================

function actualizarModoAltitud() {
  const esTunja = (selectAltitude.value === 'tunja');
  if (esTunja) {
    refAltitudeLabel.textContent = 'Tunja ~2.810 m';
    refSpO2Ranges.innerHTML = `
      <span class="ref-tag tag-green">Adecuado en altura: ≥ 90%</span>
      <span class="ref-tag tag-yellow">85 – 89% (Hipoxemia leve)</span>
      <span class="ref-tag tag-red">Alerta: &lt; 85% (Hipoxemia severa)</span>
    `;
  } else {
    refAltitudeLabel.textContent = 'Nivel del mar';
    refSpO2Ranges.innerHTML = `
      <span class="ref-tag tag-green">Normosaturación: 95 – 100%</span>
      <span class="ref-tag tag-yellow">90 – 94% (Hipoxemia leve)</span>
      <span class="ref-tag tag-red">Alerta: &lt; 90% (Hipoxemia severa)</span>
    `;
  }
  evaluarTodosLosSignos();
}

// Escuchar cambios en los inputs en tiempo real
const inputs = [inputPAS, inputPAD, inputFC, inputFR, inputTemp, inputSpO2];
inputs.forEach(input => {
  input.addEventListener('input', evaluarTodosLosSignos);
});

// Registrar Service Worker de forma segura para GitHub Pages y Offline
if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').then(
      () => { console.log('SignosSemáforo: Service Worker activo (Offline listo)'); },
      (err) => { console.warn('Service Worker no registrado:', err); }
    );
  });
}
