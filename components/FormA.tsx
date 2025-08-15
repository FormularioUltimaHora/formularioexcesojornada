
import React, { useState, useEffect } from 'react';
import { initialFormData } from '../constants';
import { FormData, YesNoNull } from '../types';
import { Input } from './common/Input';
import { Textarea } from './common/Textarea';
import { RadioGroup } from './common/RadioGroup';
import { SectionCard } from './common/SectionCard';
import { supabase, supabaseAnonKey } from '../constants';
import { useRef } from 'react';

// Función profesional para mapear datos del formulario a la base de datos
// Entiende que es un formulario de registro de incidencias con diferentes tipos de campos
function mapFormToDatabase(formData: any): any {
  // Crear objeto con todos los campos de la base de datos
  const databaseRecord: any = {};
  
  // 1. CAMPOS OBLIGATORIOS (siempre presentes)
  databaseRecord.id = formData.id;
  databaseRecord.submissiontimestamp = formData.submissionTimestamp;
  
  // 2. CAMPOS DE TEXTO (strings)
  databaseRecord.workername = formData.workerName || '';
  databaseRecord.employeeid = formData.employeeId || '';
  databaseRecord.incidentdate = formData.incidentDate || '';
  databaseRecord.shiftstarttime = formData.shiftStartTime || '';
  databaseRecord.shiftendtime = formData.shiftEndTime || '';
  databaseRecord.locationonreceipt = formData.locationOnReceipt || '';
  databaseRecord.assignmenttime = formData.assignmentTime || '';
  databaseRecord.remainingshifttime = formData.remainingShiftTime || '';
  databaseRecord.pickupaddress = formData.pickupAddress || '';
  databaseRecord.destinationaddress = formData.destinationAddress || '';
  databaseRecord.traveltimetoorigin = formData.travelTimeToOrigin || '';
  databaseRecord.traveltimeorigintodestination = formData.travelTimeOriginToDestination || '';
  databaseRecord.traveltimedestinationtobase = formData.travelTimeDestinationToBase || '';
  databaseRecord.estimatedworktimeorigin = formData.estimatedWorkTimeOrigin || '';
  databaseRecord.estimatedworktimedestination = formData.estimatedWorkTimeDestination || '';
  databaseRecord.totalestimatedservicetime = formData.totalEstimatedServiceTime || '';
  databaseRecord.complications = formData.complications || '';
  databaseRecord.excessminutes = formData.excessMinutes || '';
  databaseRecord.impactexplanation = formData.impactExplanation || '';
  databaseRecord.additionalhoursworked = formData.additionalHoursWorked || '';
  databaseRecord.riskdetails = formData.riskDetails || '';
  databaseRecord.coordinatorname = formData.coordinatorName || '';
  databaseRecord.timeslast30days = formData.timesLast30Days || '';
  databaseRecord.patterndescription = formData.patternDescription || '';
  
  // 3. CAMPOS DE TIPO YES/NO (radio buttons)
  databaseRecord.exceedsremainingtime = formData.exceedsRemainingTime || null;
  databaseRecord.unforeseencomplications = formData.unforeseenComplications || null;
  databaseRecord.affectedpersonallife = formData.affectedPersonalLife || null;
  databaseRecord.exceededoveronehour = formData.exceededOverOneHour || null;
  databaseRecord.generatedroadrisk = formData.generatedRoadRisk || null;
  databaseRecord.assignmentpattern = formData.assignmentPattern || null;
  databaseRecord.personalintent = formData.personalIntent || null;
  databaseRecord.registerforlegalaction = formData.registerForLegalAction || null;
  databaseRecord.notifylaborinspectorate = formData.notifyLaborInspectorate || null;
  
  // 4. CAMPOS BOOLEANOS (checkboxes de tipo de servicio)
  databaseRecord.servicetype_hospitaldischarge = formData.serviceType?.hospitalDischarge || false;
  databaseRecord.servicetype_nonurgenttransfer = formData.serviceType?.nonUrgentTransfer || false;
  databaseRecord.servicetype_other = formData.serviceType?.other || false;
  databaseRecord.servicetype_othertext = formData.serviceType?.otherText || '';
  
  // 5. CAMPOS DE CAPTURAS DE PANTALLA (URLs)
  databaseRecord.screenshot1_url = formData.screenshot1_url || '';
  databaseRecord.screenshot2_url = formData.screenshot2_url || '';
  databaseRecord.screenshot3_url = formData.screenshot3_url || '';
  
  return databaseRecord;
}

export const FormA: React.FC = () => {
  const [formData, setFormData] = useState<Omit<FormData, 'id' | 'submissionTimestamp'>>(initialFormData);
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [screenshots, setScreenshots] = useState<(File | null)[]>([null, null, null]);

  // Calcular automáticamente el tiempo completo estimado del servicio
  useEffect(() => {
    const toNumber = (val: string) => parseInt(val) || 0;
    const total =
      toNumber(formData.travelTimeToOrigin) +
      toNumber(formData.travelTimeOriginToDestination) +
      toNumber(formData.travelTimeDestinationToBase) +
      toNumber(formData.estimatedWorkTimeOrigin) +
      toNumber(formData.estimatedWorkTimeDestination);
    setFormData(prev => ({ ...prev, totalEstimatedServiceTime: total ? total.toString() : '' }));
  }, [
    formData.travelTimeToOrigin,
    formData.travelTimeOriginToDestination,
    formData.travelTimeDestinationToBase,
    formData.estimatedWorkTimeOrigin,
    formData.estimatedWorkTimeDestination
  ]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
        const { checked } = e.target as HTMLInputElement;
        setFormData(prev => ({
            ...prev,
            serviceType: {
                ...prev.serviceType,
                [name]: checked
            }
        }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({...prev, [name]: value as YesNoNull}));
  };

  const handleServiceTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {value} = e.target;
    setFormData(prev => ({ ...prev, serviceType: {...prev.serviceType, otherText: value}}))
  }

  const handleScreenshotChange = (index: number, file: File | null) => {
    setScreenshots(prev => {
      const updated = [...prev];
      updated[index] = file;
      return updated;
    });
  };

  const uploadScreenshot = async (file: File, submissionId: string, index: number) => {
    const { data, error } = await supabase.storage.from('screenshots').upload(`${submissionId}/screenshot${index + 1}_${Date.now()}`, file, { upsert: true });
    if (error) throw error;
    const { data: publicUrlData } = supabase.storage.from('screenshots').getPublicUrl(data.path);
    return publicUrlData.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Validación estricta de todos los campos obligatorios
    if (
      !formData.workerName ||
      !formData.employeeId ||
      !formData.incidentDate ||
      !formData.travelTimeToOrigin ||
      !formData.travelTimeOriginToDestination ||
      !formData.travelTimeDestinationToBase ||
      !formData.estimatedWorkTimeOrigin ||
      !formData.estimatedWorkTimeDestination ||
      !formData.totalEstimatedServiceTime ||
      !screenshots[0] || !screenshots[1] || !screenshots[2]
    ) {
      setError('Por favor, rellena todos los campos obligatorios y adjunta las 3 capturas.');
      setIsLoading(false);
      return;
    }
    
    const safeWorkerName = formData.workerName.replace(/\s/g, '_') || 'sin_nombre';
    const safeEmployeeId = formData.employeeId || 'sin_id';
    const submissionId = `${safeEmployeeId}-${safeWorkerName}-${Date.now()}`;

    let screenshotUrls: (string | undefined)[] = [undefined, undefined, undefined];
    try {
      for (let i = 0; i < screenshots.length; i++) {
        screenshotUrls[i] = await uploadScreenshot(screenshots[i] as File, submissionId, i);
      }
      const newSubmission: any = {
        ...formData,
        id: submissionId,
        submissionTimestamp: new Date().toISOString(),
        screenshot1_url: screenshotUrls[0],
        screenshot2_url: screenshotUrls[1],
        screenshot3_url: screenshotUrls[2],
      };
      
      // Mapeo profesional a formato de base de datos
      const dbSubmission = mapFormToDatabase(newSubmission);
      console.log('Payload enviado a Supabase:', dbSubmission);
      const { error: supabaseError } = await supabase.from('submissions').insert([dbSubmission]);
      if (supabaseError) {
        console.error('Error Supabase:', supabaseError);
        throw supabaseError;
      }
      // Llamada a la función Edge de email
      try {
        console.log('Enviando email...');
        const emailResponse = await fetch('https://eugowbqnmztgtacoxdcg.functions.supabase.co/send-email-brevo', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseAnonKey}`
          },
          body: JSON.stringify({
            formData: newSubmission,
            userEmail: formData.email
          })
        });
        
        if (!emailResponse.ok) {
          const errorText = await emailResponse.text();
          console.error('Error en respuesta del email:', emailResponse.status, errorText);
        } else {
          console.log('Email enviado exitosamente');
        }
      } catch (e) {
        console.error('Error enviando email:', e);
      }
        setSubmitted(true);
      setError(null);
    } catch (err: any) {
      setError('No se pudo conectar a la base de datos o algún campo es incorrecto. Revisa los datos e inténtalo de nuevo.');
      if (err && err.message) {
        console.error('Error detallado:', err.message);
      } else {
        console.error('Error desconocido:', err);
      }
    } finally {
        setIsLoading(false);
        window.scrollTo(0, 0);
    }
  };

  if (submitted) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-xl text-center">
        <h2 className="text-2xl font-bold text-green-600">¡Registro Guardado!</h2>
        <p className="mt-4 text-slate-600">Gracias por documentar el incidente. Su información ha sido procesada y guardada correctamente.</p>
        <button
          onClick={() => {
            setFormData(initialFormData);
            setSubmitted(false);
            setError(null);
            setScreenshots([null, null, null]);
          }}
          className="mt-6 px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-colors"
        >
          Crear Nuevo Registro
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <SectionCard title="Datos del Trabajador">
        <Input label="Nombre" name="workerName" value={formData.workerName} onChange={handleChange} containerClassName="sm:col-span-3" required />
        <Input label="Nº Empleado" name="employeeId" value={formData.employeeId} onChange={handleChange} containerClassName="sm:col-span-3" required />
        <Input label="Correo electrónico" name="email" type="email" value={formData.email || ''} onChange={handleChange} containerClassName="sm:col-span-3" required placeholder="ejemplo@dominio.com" helperText="Introduce el email donde quieres recibir una copia del formulario." />
        <Input label="Fecha del incidente" name="incidentDate" type="date" value={formData.incidentDate} onChange={handleChange} containerClassName="sm:col-span-2" />
        <Input label="Hora inicio jornada" name="shiftStartTime" type="time" value={formData.shiftStartTime} onChange={handleChange} containerClassName="sm:col-span-2" />
        <Input label="Hora prevista finalización" name="shiftEndTime" type="time" value={formData.shiftEndTime} onChange={handleChange} containerClassName="sm:col-span-2" />
      </SectionCard>

      <SectionCard title="Detalles del Servicio">
        <Input label="Ubicación al recibir servicio (Dirección)" name="locationOnReceipt" value={formData.locationOnReceipt} onChange={handleChange} containerClassName="sm:col-span-6" />
        <div className="sm:col-span-6">
            <label className="block text-sm font-medium leading-6 text-slate-700">Tipo de servicio</label>
            <div className="mt-2 flex flex-wrap gap-x-6 gap-y-2">
                <div className="flex items-center gap-x-2">
                    <input id="hospitalDischarge" name="hospitalDischarge" type="checkbox" checked={formData.serviceType.hospitalDischarge} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"/>
                    <label htmlFor="hospitalDischarge" className="text-sm text-slate-900">Alta hospitalaria</label>
                </div>
                <div className="flex items-center gap-x-2">
                    <input id="nonUrgentTransfer" name="nonUrgentTransfer" type="checkbox" checked={formData.serviceType.nonUrgentTransfer} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"/>
                    <label htmlFor="nonUrgentTransfer" className="text-sm text-slate-900">Traslado no urgente</label>
                </div>
                <div className="flex items-center gap-x-2">
                    <input id="other" name="other" type="checkbox" checked={formData.serviceType.other} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"/>
                    <label htmlFor="other" className="text-sm text-slate-900">Otro:</label>
                    <input type="text" value={formData.serviceType.otherText} onChange={handleServiceTextChange} disabled={!formData.serviceType.other} className="block w-40 rounded-md border-0 py-1.5 px-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 disabled:bg-slate-50 disabled:cursor-not-allowed"/>
                </div>
            </div>
        </div>
        <Input label="Hora asignación" name="assignmentTime" type="time" value={formData.assignmentTime} onChange={handleChange} containerClassName="sm:col-span-3" />
        <Input label="Tiempo restante jornada (minutos)" name="remainingShiftTime" type="number" value={formData.remainingShiftTime} onChange={handleChange} containerClassName="sm:col-span-3" />
        <Input label="Dirección recogida" name="pickupAddress" value={formData.pickupAddress} onChange={handleChange} containerClassName="sm:col-span-3" />
        <Input label="Dirección destino" name="destinationAddress" value={formData.destinationAddress} onChange={handleChange} containerClassName="sm:col-span-3" />
        <Input label="Tiempo desplazamiento a origen (min)" name="travelTimeToOrigin" type="number" value={formData.travelTimeToOrigin} onChange={handleChange} containerClassName="sm:col-span-3" />
        {/* Captura 1 obligatoria */}
        <div className="sm:col-span-3">
          <label className="block text-sm font-medium text-slate-700 mb-1">Captura de pantalla: Tiempo desplazamiento a origen <span className="text-red-600">*</span></label>
          <input type="file" accept="image/*" required onChange={e => handleScreenshotChange(0, e.target.files?.[0] || null)} />
        </div>
        <Input label="Tiempo origen-destino (min)" name="travelTimeOriginToDestination" type="number" value={formData.travelTimeOriginToDestination} onChange={handleChange} containerClassName="sm:col-span-3" />
        {/* Captura 2 obligatoria */}
        <div className="sm:col-span-3">
          <label className="block text-sm font-medium text-slate-700 mb-1">Captura de pantalla: Tiempo origen-destino <span className="text-red-600">*</span></label>
          <input type="file" accept="image/*" required onChange={e => handleScreenshotChange(1, e.target.files?.[0] || null)} />
        </div>
        <Input label="Tiempo destino a base (min)" name="travelTimeDestinationToBase" type="number" value={formData.travelTimeDestinationToBase} onChange={handleChange} containerClassName="sm:col-span-3" />
        {/* Captura 3 obligatoria */}
        <div className="sm:col-span-3">
          <label className="block text-sm font-medium text-slate-700 mb-1">Captura de pantalla: Tiempo destino a base <span className="text-red-600">*</span></label>
          <input type="file" accept="image/*" required onChange={e => handleScreenshotChange(2, e.target.files?.[0] || null)} />
        </div>
        <Input label="Tiempo trabajo en origen (min)" name="estimatedWorkTimeOrigin" type="number" value={formData.estimatedWorkTimeOrigin} onChange={handleChange} containerClassName="sm:col-span-3" />
        <Input label="Tiempo trabajo en destino (min)" name="estimatedWorkTimeDestination" type="number" value={formData.estimatedWorkTimeDestination} onChange={handleChange} containerClassName="sm:col-span-3" />
        <Input label="Tiempo completo estimado del servicio (min)" name="totalEstimatedServiceTime" type="number" value={formData.totalEstimatedServiceTime} onChange={() => {}} containerClassName="sm:col-span-6" readOnly />
        <Textarea label="Complicaciones en la ejecución" name="complications" placeholder="Detallar complicaciones (ascensor, tercer piso sin ascensor, etc.)" value={formData.complications} onChange={handleChange} containerClassName="sm:col-span-6" />
      </SectionCard>

      <SectionCard title="Impacto en la Jornada Laboral">
        <RadioGroup label="¿Excede tiempo restante de jornada?" name="exceedsRemainingTime" value={formData.exceedsRemainingTime} onChange={handleRadioChange} containerClassName="sm:col-span-3"/>
        <RadioGroup label="¿Complicaciones imprevistas?" name="unforeseenComplications" value={formData.unforeseenComplications} onChange={handleRadioChange} containerClassName="sm:col-span-3"/>
        <RadioGroup label="¿Afectó vida personal?" name="affectedPersonalLife" value={formData.affectedPersonalLife} onChange={handleRadioChange} containerClassName="sm:col-span-3"/>
        <RadioGroup label="¿Exceso > 1 hora?" name="exceededOverOneHour" value={formData.exceededOverOneHour} onChange={handleRadioChange} containerClassName="sm:col-span-3"/>
        <Input label="Exceso total en minutos" name="excessMinutes" type="number" value={formData.excessMinutes} onChange={handleChange} containerClassName="sm:col-span-6" />
        <Textarea label="Explicación del impacto" name="impactExplanation" placeholder="Describa cómo le afectó este servicio (retrasos, estrés, etc.)" value={formData.impactExplanation} onChange={handleChange} containerClassName="sm:col-span-6" />
      </SectionCard>

      <SectionCard title="Seguridad y Riesgos">
        <RadioGroup label="¿Se generó un peligro o riesgo vial por conducir bajo estrés?" name="generatedRoadRisk" value={formData.generatedRoadRisk} onChange={handleRadioChange} containerClassName="sm:col-span-3"/>
        <Input label="Horas adicionales trabajadas" name="additionalHoursWorked" type="number" value={formData.additionalHoursWorked} onChange={handleChange} containerClassName="sm:col-span-3" />
        <Textarea label="Detallar riesgo" name="riskDetails" placeholder="Describa la situación de riesgo generada" value={formData.riskDetails} onChange={handleChange} containerClassName="sm:col-span-6" />
      </SectionCard>
      
      <SectionCard title="Información del Coordinador y Patrones">
        <Input label="Coordinador que asignó el servicio" name="coordinatorName" value={formData.coordinatorName} onChange={handleChange} containerClassName="sm:col-span-3" />
        <Input label="Veces que ha ocurrido en los últimos 30 días" name="timesLast30Days" type="number" value={formData.timesLast30Days} onChange={handleChange} containerClassName="sm:col-span-3" />
        <RadioGroup label="¿Cree que existe un patrón de asignación?" name="assignmentPattern" value={formData.assignmentPattern} onChange={handleRadioChange} containerClassName="sm:col-span-3"/>
        <RadioGroup label="¿Cree que hubo intencionalidad personal?" name="personalIntent" value={formData.personalIntent} onChange={handleRadioChange} containerClassName="sm:col-span-3"/>
        <Textarea label="Descripción del patrón o comportamiento" name="patternDescription" placeholder="Si observa un patrón, descríbalo." value={formData.patternDescription} onChange={handleChange} containerClassName="sm:col-span-6" />
      </SectionCard>

      <SectionCard title="Acción Legal">
        <RadioGroup label="¿Desea registrar este evento para futuras acciones legales?" name="registerForLegalAction" value={formData.registerForLegalAction} onChange={handleRadioChange} containerClassName="sm:col-span-3"/>
        <RadioGroup label="¿Desea que se notifique a Inspección de Trabajo?" name="notifyLaborInspectorate" value={formData.notifyLaborInspectorate} onChange={handleRadioChange} containerClassName="sm:col-span-3"/>
      </SectionCard>

      <div className="flex justify-end pt-4">
        {error && <div className="mb-4 w-full text-center text-red-600 bg-red-100 rounded p-2">{error}</div>}
        <button
          type="submit"
          disabled={isLoading}
          className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-lg shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 disabled:opacity-75 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Guardando...' : 'Guardar Registro'}
        </button>
      </div>
    </form>
  );
};
