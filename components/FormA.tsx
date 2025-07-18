
import React, { useState } from 'react';
import { initialFormData } from '../constants';
import { FormData, YesNoNull } from '../types';
import { Input } from './common/Input';
import { Textarea } from './common/Textarea';
import { RadioGroup } from './common/RadioGroup';
import { SectionCard } from './common/SectionCard';

export const FormA: React.FC = () => {
  const [formData, setFormData] = useState<Omit<FormData, 'id' | 'submissionTimestamp'>>(initialFormData);
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    const safeWorkerName = formData.workerName.replace(/\s/g, '_') || 'sin_nombre';
    const safeEmployeeId = formData.employeeId || 'sin_id';

    const newSubmission: FormData = {
        ...formData,
        id: `${safeEmployeeId}-${safeWorkerName}-${Date.now()}`,
        submissionTimestamp: new Date().toISOString(),
    };

    try {
        // En una aplicación real, esta llamada enviaría los datos a un servidor.
        // Esta llamada fallará en este entorno, pero demuestra el patrón correcto.
        const response = await fetch('/api/submissions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newSubmission),
        });

        if (!response.ok) {
            throw new Error('No se pudo guardar el registro. Por favor, inténtelo de nuevo.');
        }

        console.log('Formulario A enviado a la API:', newSubmission);
        setSubmitted(true);
        
    } catch (err) {
        console.warn("La llamada a la API falló. Usando localStorage como respaldo para la demostración.");
        setError('No se pudo conectar al servidor. El registro se guardó localmente como respaldo.');

        // --- Fallback a localStorage para demostración ---
        const existingSubmissions = JSON.parse(localStorage.getItem('formSubmissions') || '[]') as FormData[];
        const updatedSubmissions = [...existingSubmissions, newSubmission];
        localStorage.setItem('formSubmissions', JSON.stringify(updatedSubmissions));
        // --- Fin del Fallback ---
        
        setSubmitted(true); // Permitir al usuario continuar
    } finally {
        setIsLoading(false);
        window.scrollTo(0, 0);
    }
  };

  if (submitted) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-xl text-center">
        <h2 className="text-2xl font-bold text-green-600">¡Registro Guardado!</h2>
        <p className="mt-4 text-slate-600">Gracias por documentar el incidente. Su información ha sido procesada.</p>
        {error && <p className="mt-2 text-sm text-amber-600 bg-amber-50 p-2 rounded-md">{error}</p>}
        <button
          onClick={() => {
            setFormData(initialFormData);
            setSubmitted(false);
            setError(null);
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
        <Input label="Tiempo origen-destino (min)" name="travelTimeOriginToDestination" type="number" value={formData.travelTimeOriginToDestination} onChange={handleChange} containerClassName="sm:col-span-3" />
        <Input label="Tiempo trabajo en origen (min)" name="estimatedWorkTimeOrigin" type="number" value={formData.estimatedWorkTimeOrigin} onChange={handleChange} containerClassName="sm:col-span-3" />
        <Input label="Tiempo trabajo en destino (min)" name="estimatedWorkTimeDestination" type="number" value={formData.estimatedWorkTimeDestination} onChange={handleChange} containerClassName="sm:col-span-3" />
        <Input label="Tiempo completo estimado del servicio (min)" name="totalEstimatedServiceTime" type="number" value={formData.totalEstimatedServiceTime} onChange={handleChange} containerClassName="sm:col-span-6" />
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
