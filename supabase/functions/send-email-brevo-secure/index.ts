import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS"
  };
}

// Diccionario de traducción de campos a nombres legibles
const FIELD_LABELS: Record<string, string> = {
  workername: 'Nombre',
  workerName: 'Nombre',
  employeeid: 'Nº Empleado',
  employeeId: 'Nº Empleado',
  email: 'Correo electrónico',
  incidentdate: 'Fecha del incidente',
  incidentDate: 'Fecha del incidente',
  shiftstarttime: 'Hora inicio jornada',
  shiftStartTime: 'Hora inicio jornada',
  shiftendtime: 'Hora prevista finalización',
  shiftEndTime: 'Hora prevista finalización',
  locationonreceipt: 'Ubicación al recibir servicio',
  locationOnReceipt: 'Ubicación al recibir servicio',
  assignmenttime: 'Hora asignación',
  assignmentTime: 'Hora asignación',
  remainingshifttime: 'Tiempo restante jornada (minutos)',
  remainingShiftTime: 'Tiempo restante jornada (minutos)',
  pickupaddress: 'Dirección recogida',
  pickupAddress: 'Dirección recogida',
  destinationaddress: 'Dirección destino',
  destinationAddress: 'Dirección destino',
  traveltimetoorigin: 'Tiempo desplazamiento a origen (min)',
  travelTimeToOrigin: 'Tiempo desplazamiento a origen (min)',
  traveltimeorigintodestination: 'Tiempo origen-destino (min)',
  travelTimeOriginToDestination: 'Tiempo origen-destino (min)',
  traveltimedestinationtobase: 'Tiempo destino a base (min)',
  travelTimeDestinationToBase: 'Tiempo destino a base (min)',
  estimatedworktimeorigin: 'Tiempo trabajo en origen (min)',
  estimatedWorkTimeOrigin: 'Tiempo trabajo en origen (min)',
  estimatedworktimedestination: 'Tiempo trabajo en destino (min)',
  estimatedWorkTimeDestination: 'Tiempo trabajo en destino (min)',
  totalestimatedservicetime: 'Tiempo completo estimado del servicio (min)',
  totalEstimatedServiceTime: 'Tiempo completo estimado del servicio (min)',
  complications: 'Complicaciones en la ejecución',
  exceedsremainingtime: '¿Excede tiempo restante de jornada?',
  exceedsRemainingTime: '¿Excede tiempo restante de jornada?',
  unforeseencomplications: '¿Complicaciones imprevistas?',
  unforeseenComplications: '¿Complicaciones imprevistas?',
  affectedpersonallife: '¿Afectó vida personal?',
  affectedPersonalLife: '¿Afectó vida personal?',
  exceededoveronehour: '¿Exceso > 1 hora?',
  exceededOverOneHour: '¿Exceso > 1 hora?',
  excessminutes: 'Exceso total en minutos',
  excessMinutes: 'Exceso total en minutos',
  impactexplanation: 'Explicación del impacto',
  impactExplanation: 'Explicación del impacto',
  generatedroadrisk: '¿Se generó un peligro o riesgo vial?',
  generatedRoadRisk: '¿Se generó un peligro o riesgo vial?',
  additionalhoursworked: 'Horas adicionales trabajadas',
  additionalHoursWorked: 'Horas adicionales trabajadas',
  riskdetails: 'Detallar riesgo',
  riskDetails: 'Detallar riesgo',
  coordinatorname: 'Coordinador que asignó el servicio',
  coordinatorName: 'Coordinador que asignó el servicio',
  timeslast30days: 'Veces que ha ocurrido en los últimos 30 días',
  timesLast30Days: 'Veces que ha ocurrido en los últimos 30 días',
  assignmentpattern: '¿Cree que existe un patrón de asignación?',
  assignmentPattern: '¿Cree que existe un patrón de asignación?',
  personalintent: '¿Cree que hubo intencionalidad personal?',
  personalIntent: '¿Cree que hubo intencionalidad personal?',
  patterndescription: 'Descripción del patrón o comportamiento',
  patternDescription: 'Descripción del patrón o comportamiento',
  registerforlegalaction: '¿Registrar para acciones legales?',
  registerForLegalAction: '¿Registrar para acciones legales?',
  notifylaborinspectorate: '¿Notificar a Inspección de Trabajo?',
  notifyLaborInspectorate: '¿Notificar a Inspección de Trabajo?',
  servicetype_hospitaldischarge: 'Alta hospitalaria',
  servicetype_nonurgenttransfer: 'Traslado no urgente',
  servicetype_other: 'Otro tipo de servicio',
  servicetype_othertext: 'Descripción otro servicio',
};

function normalizeKey(key: string): string {
  // Convierte snake_case y camelCase a minúsculas sin guiones bajos
  return key.replace(/_/g, '').toLowerCase();
}

// Función para crear URLs seguras sin exponer IDs de la base de datos
function createSecureScreenshotUrls(formData: Record<string, any>): Record<string, string> {
  const secureUrls: Record<string, string> = {};
  
  // Solo incluir las capturas si existen y no están vacías
  if (formData.screenshot1_url && formData.screenshot1_url.trim() !== '') {
    secureUrls.screenshot1_url = 'Captura de pantalla disponible';
  }
  
  if (formData.screenshot2_url && formData.screenshot2_url.trim() !== '') {
    secureUrls.screenshot2_url = 'Captura de pantalla disponible';
  }
  
  if (formData.screenshot3_url && formData.screenshot3_url.trim() !== '') {
    secureUrls.screenshot3_url = 'Captura de pantalla disponible';
  }
  
  return secureUrls;
}

function renderTable(formData: Record<string, any>): string {
  let rows = '';
  
  // Excluir campos sensibles y IDs
  const excludeKeys = [
    'screenshot1_url', 'screenshot2_url', 'screenshot3_url', 
    'id', 'submissionTimestamp', 'serviceType'
  ];
  
  const excludeLabels = ['Captura 1', 'Captura 2', 'Captura 3'];

  // Procesar Tipo de servicio de forma especial
  if (formData.serviceType && typeof formData.serviceType === 'object') {
    const tipos = [];
    if (formData.serviceType.hospitalDischarge) tipos.push('Alta hospitalaria');
    if (formData.serviceType.nonUrgentTransfer) tipos.push('Traslado no urgente');
    if (formData.serviceType.other) {
      if (formData.serviceType.otherText && formData.serviceType.otherText.trim() !== '') {
        tipos.push('Otro: ' + formData.serviceType.otherText);
      } else {
        tipos.push('Otro');
      }
    }
    rows += `<tr><th align=\"left\" style=\"background:#f3f4f6;\">Tipo de servicio</th><td>${tipos.length > 0 ? tipos.join(', ') : '-'}</td></tr>`;
  }

  // Procesar campos normales
  for (const key in formData) {
    if (!Object.prototype.hasOwnProperty.call(formData, key)) continue;
    if (excludeKeys.includes(key)) continue;
    
    let value = formData[key];
    
    // Manejar objetos anidados
    if (typeof value === 'object' && value !== null) {
      value = Object.entries(value).map(([k, v]) => `${k}: ${v}`).join(', ');
    }
    
    const normalizedKey = normalizeKey(key);
    const label = Object.entries(FIELD_LABELS).find(([k]) => normalizeKey(k) === normalizedKey)?.[1] || `<span style=\"color:#e11d48;\">${key}</span>`;
    
    if (excludeLabels.includes(label.replace(/<[^>]+>/g, ''))) continue;
    
    rows += `<tr><th align=\"left\" style=\"background:#f3f4f6;\">${label}</th><td>${value ?? '-'}</td></tr>`;
  }

  // Agregar sección de capturas de pantalla de forma segura
  const secureScreenshots = createSecureScreenshotUrls(formData);
  if (Object.keys(secureScreenshots).length > 0) {
    rows += `<tr><th align=\"left\" style=\"background:#f3f4f6;\">Capturas de pantalla</th><td>${Object.values(secureScreenshots).join(', ')}</td></tr>`;
  }

  return `<table border=\"1\" cellpadding=\"6\" cellspacing=\"0\" style=\"border-collapse:collapse;font-size:15px;\">${rows}</table>`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders() });
  }
  
  try {
    const apiKey = Deno.env.get("BREVO_API_KEY");
    if (!apiKey) {
      return new Response("No BREVO_API_KEY found in Edge Function", { status: 401, headers: corsHeaders() });
    }
    
    const { formData, userEmail } = await req.json();

    // Correos de destino
    const toEmails = [
      "rrhhcomitedomingo@hotmail.com",
      userEmail
    ];

    // Email legible para el trabajador
    const subject = "Copia de tu formulario de exceso de jornada";
    const htmlContent = `
      <h2 style="color:#1e293b;">Registro de Exceso de Jornada</h2>
      <p>Gracias por rellenar el formulario. Aquí tienes una copia completa de tu registro:</p>
      ${renderTable(formData)}
      <br>
      <p style="font-size:13px;color:#64748b;">
        <strong>Nota de seguridad:</strong> Este email contiene solo la información del formulario. 
        Las capturas de pantalla están disponibles en el sistema interno para el personal autorizado.
      </p>
      <p style="font-size:13px;color:#64748b;">
        Este email es una copia automática para tu registro personal y para la sección de RRHH del comité de empresa.
      </p>
    `;

    // Llama a la API de Brevo
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        sender: { name: "Formulario Exceso", email: "sand.ia.artificial@gmail.com" },
        to: toEmails.map(email => ({ email })),
        subject,
        htmlContent
      })
    });

    if (!res.ok) {
      const error = await res.text();
      return new Response(`Error enviando email: ${error}`, { status: 500, headers: corsHeaders() });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200, headers: corsHeaders() });
  } catch (err) {
    return new Response(`Error: ${err}`, { status: 500, headers: corsHeaders() });
  }
});
