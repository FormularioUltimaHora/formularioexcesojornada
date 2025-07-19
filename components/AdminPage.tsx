
import React, { useState, useEffect } from 'react';
import { FormData } from '../types';
import { TrashIcon } from './icons/TrashIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { ArrowRightOnRectangleIcon } from './icons/ArrowRightOnRectangleIcon';
import { Spinner } from './common/Spinner';
import { supabase } from '../constants';

interface AdminPageProps {
  onBack: () => void;
  onLogout: () => void;
}

const DetailItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => {
    if (value === null || value === undefined || value === false || (typeof value === 'string' && value.trim() === '')) return null;
    const displayValue = value === 'yes' ? 'Sí' : value === 'no' ? 'No' : String(value);
    return (
        <div>
            <dt className="text-sm font-medium text-slate-500">{label}</dt>
            <dd className="mt-1 text-sm text-slate-900">{displayValue}</dd>
        </div>
    );
};

// Función para convertir snake_case a camelCase
function toCamelCase(obj: any): any {
  if (Array.isArray(obj)) return obj.map(toCamelCase);
  if (obj !== null && typeof obj === 'object') {
    const newObj: any = {};
    for (const key in obj) {
      if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      newObj[camelKey] = toCamelCase(obj[key]);
    }
    return newObj;
  }
  return obj;
}

export const AdminPage: React.FC<AdminPageProps> = ({ onBack, onLogout }) => {
  const [submissions, setSubmissions] = useState<FormData[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubmissions = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const { data, error: supabaseError } = await supabase.from('submissions').select('*');
            if (supabaseError) throw supabaseError;
            // Mapeo a camelCase al leer
            const mapped = toCamelCase(data || []);
            (mapped || []).sort((a: any, b: any) => new Date(b.submissionTimestamp).getTime() - new Date(a.submissionTimestamp).getTime());
            setSubmissions(mapped || []);
        } catch (err) {
            setError('No se pudo conectar a la base de datos.');
            setSubmissions([]);
        } finally {
            setIsLoading(false);
        }
    };
    fetchSubmissions();
  }, []);
  
  const handleClearAll = async () => {
    if (window.confirm('¿Está seguro de que desea eliminar TODOS los registros? Esta acción no se puede deshacer.')) {
        try {
            const { error: supabaseError } = await supabase.from('submissions').delete().neq('id', '');
            if (supabaseError) throw supabaseError;
            setSubmissions([]);
        } catch (err) {
            alert('No se pudo conectar a la base de datos.');
        }
    }
  };

  const handleDeleteOne = async (id: string) => {
    if (window.confirm('¿Está seguro de que desea eliminar este registro?')) {
        try {
            const { error: supabaseError } = await supabase.from('submissions').delete().eq('id', id);
            if (supabaseError) throw supabaseError;
            setSubmissions(prev => prev.filter(s => s.id !== id));
        } catch(err) {
            alert('No se pudo conectar a la base de datos.');
        }
    }
  };

  const handleToggleExpand = (id: string) => {
    setExpandedId(prevId => (prevId === id ? null : id));
  };
  
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Fecha inválida';
        return date.toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch (e) {
        return 'Fecha inválida';
    }
  };
  
  const renderContent = () => {
    if (isLoading) {
        return <div className="py-10"><Spinner /></div>;
    }
    
    if (submissions.length === 0) {
        return <p className="text-center text-slate-500 py-10">No hay ningún registro guardado todavía.</p>;
    }
    
    return (
        <div className="space-y-4">
            {submissions.map((sub) => (
                <div key={sub.id} className="border border-slate-200 rounded-lg transition-shadow hover:shadow-md">
                    <div className="flex justify-between items-center p-4">
                        <div 
                            onClick={() => handleToggleExpand(sub.id)}
                            className="flex-grow cursor-pointer"
                            aria-label={`Detalles para ${sub.workerName}`}
                        >
                            <p className="font-semibold text-indigo-700">{sub.workerName || 'Sin Nombre'}</p>
                            <p className="text-sm text-slate-600">Fecha del Incidente: {sub.incidentDate || 'N/A'} | Guardado: {formatDate(sub.submissionTimestamp)}</p>
                        </div>
                        <div className="flex items-center gap-1 pl-2">
                             <button
                                onClick={() => handleDeleteOne(sub.id)}
                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                aria-label={`Eliminar registro de ${sub.workerName}`}
                             >
                                <TrashIcon className="w-5 h-5" />
                             </button>
                            <button 
                                onClick={() => handleToggleExpand(sub.id)} 
                                className="p-2 text-slate-500 rounded-full hover:bg-slate-100"
                                aria-expanded={expandedId === sub.id}
                            >
                                <ChevronDownIcon className={`w-6 h-6 text-slate-500 transition-transform ${expandedId === sub.id ? 'rotate-180' : ''}`} />
                            </button>
                        </div>
                    </div>
                    {expandedId === sub.id && (
                        <div className="p-4 border-t border-slate-200 bg-slate-50/50">
                            <div className="mb-4">
                                <span className="font-bold text-slate-700">ID del formulario:</span> <span className="text-xs text-slate-500">{sub.id}</span><br/>
                                <span className="font-bold text-slate-700">Trabajador:</span> <span className="text-slate-800">{sub.workerName}</span><br/>
                                <span className="font-bold text-slate-700">Fecha de envío:</span> <span className="text-slate-800">{formatDate(sub.submissionTimestamp)}</span>
                            </div>
                            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 md:grid-cols-3">
                                <DetailItem label="Nº Empleado" value={sub.employeeId} />
                                <DetailItem label="Inicio Jornada" value={sub.shiftStartTime} />
                                <DetailItem label="Fin Previsto Jornada" value={sub.shiftEndTime} />
                                <DetailItem label="Ubicación al Recibir" value={sub.locationOnReceipt} />
                                <DetailItem label="Hora Asignación" value={sub.assignmentTime} />
                                <DetailItem label="Minutos Restantes" value={sub.remainingShiftTime} />
                                <DetailItem label="Exceso en Minutos" value={sub.excessMinutes} />
                                <DetailItem label="Horas Extra" value={sub.additionalHoursWorked} />
                                <DetailItem label="Coordinador" value={sub.coordinatorName} />
                                <DetailItem label="Veces en 30 días" value={sub.timesLast30Days} />
                                <DetailItem label="¿Afectó vida personal?" value={sub.affectedPersonalLife} />
                                <DetailItem label="¿Riesgo vial generado?" value={sub.generatedRoadRisk} />
                                <DetailItem label="¿Patrón de asignación?" value={sub.assignmentPattern} />
                                <DetailItem label="¿Intencionalidad?" value={sub.personalIntent} />
                                <DetailItem label="¿Acciones legales?" value={sub.registerForLegalAction} />
                                <DetailItem label="¿Notificar Inspección?" value={sub.notifyLaborInspectorate} />
                                <div className="sm:col-span-2 md:col-span-3">
                                    <DetailItem label="Complicaciones" value={sub.complications} />
                                </div>
                                <div className="sm:col-span-2 md:col-span-3">
                                    <DetailItem label="Explicación Impacto" value={sub.impactExplanation} />
                                </div>
                                 <div className="sm:col-span-2 md:col-span-3">
                                    <DetailItem label="Descripción Patrón" value={sub.patternDescription} />
                                </div>
                            </dl>
                            {/* Mostrar capturas con etiquetas claras */}
                            <div className="mt-4">
                                <div className="font-semibold text-slate-700 mb-2">Capturas de pantalla asociadas:</div>
                                <div className="flex flex-col gap-4">
                                    <div>
                                        <div className="text-xs text-slate-600 mb-1">Captura: Tiempo desplazamiento a origen</div>
                                        {sub.screenshot1_url ? (
                                            <a href={sub.screenshot1_url} target="_blank" rel="noopener noreferrer">
                                                <img src={sub.screenshot1_url} alt="Captura 1 - Tiempo desplazamiento a origen" className="w-40 h-40 object-cover rounded shadow" />
                                            </a>
                                        ) : <span className="text-red-500 text-xs">No disponible</span>}
                                    </div>
                                    <div>
                                        <div className="text-xs text-slate-600 mb-1">Captura: Tiempo origen-destino</div>
                                        {sub.screenshot2_url ? (
                                            <a href={sub.screenshot2_url} target="_blank" rel="noopener noreferrer">
                                                <img src={sub.screenshot2_url} alt="Captura 2 - Tiempo origen-destino" className="w-40 h-40 object-cover rounded shadow" />
                                            </a>
                                        ) : <span className="text-red-500 text-xs">No disponible</span>}
                                    </div>
                                    <div>
                                        <div className="text-xs text-slate-600 mb-1">Captura: Tiempo destino a base</div>
                                        {sub.screenshot3_url ? (
                                            <a href={sub.screenshot3_url} target="_blank" rel="noopener noreferrer">
                                                <img src={sub.screenshot3_url} alt="Captura 3 - Tiempo destino a base" className="w-40 h-40 object-cover rounded shadow" />
                                            </a>
                                        ) : <span className="text-red-500 text-xs">No disponible</span>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-xl">
        <div className="flex flex-wrap justify-between items-center gap-4 border-b border-slate-200 pb-4 mb-6">
            <div>
                 <h2 className="text-xl font-bold text-slate-900">Registros Guardados</h2>
                 <p className="text-sm text-slate-500">{submissions.length} registro(s) encontrado(s).</p>
                 {error && <p className="mt-1 text-sm text-amber-600">{error}</p>}
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
                <button onClick={onBack} className="px-3 py-2 text-sm sm:px-4 sm:py-2 bg-white border border-slate-300 text-slate-700 font-semibold rounded-lg shadow-sm hover:bg-slate-50 transition-colors">
                    Volver
                </button>
                <button onClick={handleClearAll} disabled={submissions.length === 0} className="flex items-center gap-2 px-3 py-2 text-sm sm:px-4 sm:py-2 bg-red-600 text-white font-semibold rounded-lg shadow-sm hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed transition-colors">
                    <TrashIcon className="w-5 h-5" />
                    <span className="hidden sm:inline">Limpiar Todo</span>
                </button>
                <button onClick={onLogout} className="flex items-center gap-2 px-3 py-2 text-sm sm:px-4 sm:py-2 bg-slate-600 text-white font-semibold rounded-lg shadow-sm hover:bg-slate-700 transition-colors">
                    <ArrowRightOnRectangleIcon className="w-5 h-5" />
                    <span className="hidden sm:inline">Cerrar Sesión</span>
                </button>
            </div>
        </div>
        {renderContent()}
    </div>
  );
};
