
import React, { useState, useEffect } from 'react';
import { FormData } from '../types';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { ArrowRightOnRectangleIcon } from './icons/ArrowRightOnRectangleIcon';
import { Spinner } from './common/Spinner';
import { supabase } from '../constants';

interface AdminPageProps {
  onBack: () => void;
  onLogout: () => void;
}

// Función para convertir snake_case a camelCase
function toCamelCase(obj: any): any {
  if (Array.isArray(obj)) return obj.map(toCamelCase);
  if (obj !== null && typeof obj === 'object') {
    const newObj: any = {};
    for (const key in obj) {
      if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;
      
      // Mapeo específico para los nombres de columnas de Supabase
      let camelKey = key;
      if (key === 'submissiontimestamp') camelKey = 'submissionTimestamp';
      else if (key === 'workername') camelKey = 'workerName';
      else if (key === 'employeeid') camelKey = 'employeeId';
      else if (key === 'incidentdate') camelKey = 'incidentDate';
      else if (key === 'shiftstarttime') camelKey = 'shiftStartTime';
      else if (key === 'shiftendtime') camelKey = 'shiftEndTime';
      else if (key === 'locationonreceipt') camelKey = 'locationOnReceipt';
      else if (key === 'servicetype_hospitaldischarge') camelKey = 'serviceType_hospitalDischarge';
      else if (key === 'servicetype_nonurgenttransfer') camelKey = 'serviceType_nonUrgentTransfer';
      else if (key === 'servicetype_other') camelKey = 'serviceType_other';
      else if (key === 'servicetype_othertext') camelKey = 'serviceType_otherText';
      else if (key === 'assignmenttime') camelKey = 'assignmentTime';
      else if (key === 'remainingshifttime') camelKey = 'remainingShiftTime';
      else if (key === 'pickupaddress') camelKey = 'pickupAddress';
      else if (key === 'destinationaddress') camelKey = 'destinationAddress';
      else if (key === 'traveltimetoorigin') camelKey = 'travelTimeToOrigin';
      else if (key === 'traveltimeorigintodestination') camelKey = 'travelTimeOriginToDestination';
      else if (key === 'traveltimedestinationtobase') camelKey = 'travelTimeDestinationToBase';
      else if (key === 'estimatedworktimeorigin') camelKey = 'estimatedWorkTimeOrigin';
      else if (key === 'estimatedworktimedestination') camelKey = 'estimatedWorkTimeDestination';
      else if (key === 'totalestimatedservicetime') camelKey = 'totalEstimatedServiceTime';
      else if (key === 'exceedsremainingtime') camelKey = 'exceedsRemainingTime';
      else if (key === 'unforeseencomplications') camelKey = 'unforeseenComplications';
      else if (key === 'affectedpersonallife') camelKey = 'affectedPersonalLife';
      else if (key === 'exceededoveronehour') camelKey = 'exceededOverOneHour';
      else if (key === 'excessminutes') camelKey = 'excessMinutes';
      else if (key === 'impactexplanation') camelKey = 'impactExplanation';
      else if (key === 'generatedroadrisk') camelKey = 'generatedRoadRisk';
      else if (key === 'additionalhoursworked') camelKey = 'additionalHoursWorked';
      else if (key === 'riskdetails') camelKey = 'riskDetails';
      else if (key === 'coordinatorname') camelKey = 'coordinatorName';
      else if (key === 'timeslast30days') camelKey = 'timesLast30Days';
      else if (key === 'assignmentpattern') camelKey = 'assignmentPattern';
      else if (key === 'personalintent') camelKey = 'personalIntent';
      else if (key === 'patterndescription') camelKey = 'patternDescription';
      else if (key === 'registerforlegalaction') camelKey = 'registerForLegalAction';
      else if (key === 'notifylaborinspectorate') camelKey = 'notifyLaborInspectorate';
      else if (key === 'screenshot1_url') camelKey = 'screenshot1_url';
      else if (key === 'screenshot2_url') camelKey = 'screenshot2_url';
      else if (key === 'screenshot3_url') camelKey = 'screenshot3_url';
      
      newObj[camelKey] = toCamelCase(obj[key]);
    }
    return newObj;
  }
  return obj;
}

// Función para exportar a CSV
function exportToCSV(data: any[], filename: string) {
  if (data.length === 0) {
    alert('No hay datos para exportar');
    return;
  }

  const columns = [
    { key: 'workerName', label: 'Nombre Trabajador' },
    { key: 'employeeId', label: 'Nº Empleado' },
    { key: 'incidentDate', label: 'Fecha Incidente' },
    { key: 'submissionTimestamp', label: 'Fecha Envío' },
    { key: 'shiftStartTime', label: 'Inicio Jornada' },
    { key: 'shiftEndTime', label: 'Fin Jornada' },
    { key: 'locationOnReceipt', label: 'Ubicación' },
    { key: 'assignmentTime', label: 'Hora Asignación' },
    { key: 'remainingShiftTime', label: 'Minutos Restantes' },
    { key: 'excessMinutes', label: 'Exceso Minutos' },
    { key: 'additionalHoursWorked', label: 'Horas Extra' },
    { key: 'coordinatorName', label: 'Coordinador' },
    { key: 'timesLast30Days', label: 'Veces 30 días' },
    { key: 'affectedPersonalLife', label: 'Afectó Vida Personal' },
    { key: 'generatedRoadRisk', label: 'Riesgo Vial' },
    { key: 'assignmentPattern', label: 'Patrón Asignación' },
    { key: 'personalIntent', label: 'Intencionalidad' },
    { key: 'registerForLegalAction', label: 'Acciones Legales' },
    { key: 'notifyLaborInspectorate', label: 'Notificar Inspección' },
    { key: 'complications', label: 'Complicaciones' },
    { key: 'impactExplanation', label: 'Explicación Impacto' },
    { key: 'patternDescription', label: 'Descripción Patrón' }
  ];

  const headers = columns.map(col => col.label).join(',');
  const rows = data.map(item => {
    return columns.map(col => {
      let value = item[col.key];
      if (value === null || value === undefined) return '';
      if (typeof value === 'boolean') return value ? 'Sí' : 'No';
      if (value === 'yes') return 'Sí';
      if (value === 'no') return 'No';
      if (typeof value === 'string' && value.includes(',')) {
        value = `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(',');
  });

  const csvContent = [headers, ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Componente para gráfico de barras simple
const BarChart: React.FC<{ data: { label: string; value: number }[]; title: string }> = ({ data, title }) => {
  const maxValue = Math.max(...data.map(d => d.value));
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">{title}</h3>
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className="w-24 text-sm text-slate-600 truncate">{item.label}</div>
            <div className="flex-1 bg-slate-200 rounded-full h-6 relative">
              <div 
                className="bg-indigo-600 h-6 rounded-full transition-all duration-300"
                style={{ width: `${(item.value / maxValue) * 100}%` }}
              />
              <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
                {item.value}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Componente para gráfico de dona
const DonutChart: React.FC<{ data: { label: string; value: number; color: string }[]; title: string }> = ({ data, title }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">{title}</h3>
      <div className="flex items-center justify-center mb-4">
        <div className="relative w-32 h-32">
          <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 32 32">
            {data.map((item, index) => {
              const percentage = (item.value / total) * 100;
              const circumference = 2 * Math.PI * 14;
              const strokeDasharray = (percentage / 100) * circumference;
              const strokeDashoffset = circumference - strokeDasharray;
              const previousPercentages = data.slice(0, index).reduce((sum, d) => sum + (d.value / total) * 100, 0);
              const rotation = (previousPercentages / 100) * 360;
              
              return (
                <circle
                  key={index}
                  cx="16"
                  cy="16"
                  r="14"
                  fill="none"
                  stroke={item.color}
                  strokeWidth="4"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  transform={`rotate(${rotation} 16 16)`}
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold text-slate-900">{total}</span>
          </div>
        </div>
      </div>
      <div className="space-y-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: item.color }}></div>
            <span className="text-sm text-slate-600">{item.label}</span>
            <span className="text-sm font-medium text-slate-900 ml-auto">
              {((item.value / total) * 100).toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const AdminPage: React.FC<AdminPageProps> = ({ onBack, onLogout }) => {
  const [submissions, setSubmissions] = useState<FormData[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<FormData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<string>('submissionTimestamp');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [activeTab, setActiveTab] = useState<'overview' | 'details' | 'analytics'>('overview');
  const [selectedSubmission, setSelectedSubmission] = useState<FormData | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    const fetchSubmissions = async () => {
      setIsLoading(true);
      setError(null);
      try {
        console.log('🔄 Iniciando conexión con Supabase...');
        
        const { data, error: supabaseError } = await supabase.from('submissions').select('*');
        
        console.log('📊 Respuesta de Supabase:', { data, error: supabaseError });
        
        if (supabaseError) {
          console.error('❌ Error de Supabase:', supabaseError);
          throw supabaseError;
        }
        
        console.log('✅ Datos obtenidos de Supabase:', data);
        console.log('📈 Número de registros:', data?.length || 0);
        
        const mapped = toCamelCase(data || []);
        console.log('🔄 Datos mapeados a camelCase:', mapped);
        
        const sorted = mapped.sort((a: any, b: any) => 
          new Date(b.submissionTimestamp).getTime() - new Date(a.submissionTimestamp).getTime()
        );
        
        console.log('📊 Datos ordenados:', sorted);
        console.log('📋 Primer registro:', sorted[0]);
        
        setSubmissions(sorted);
        setFilteredSubmissions(sorted);
        
        console.log('✅ Estado actualizado con datos reales de Supabase');
      } catch (err) {
        console.error('❌ Error completo:', err);
        setError('No se pudo conectar a la base de datos.');
        setSubmissions([]);
        setFilteredSubmissions([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSubmissions();
  }, []);

  // Filtrar y ordenar datos
  useEffect(() => {
    console.log('🔄 Iniciando filtrado de datos...');
    console.log('📊 Datos originales:', submissions);
    console.log('🔍 Término de búsqueda:', searchTerm);
    
    let filtered = submissions.filter(sub => {
      const searchLower = searchTerm.toLowerCase();
      const matches = (
        sub.workerName?.toLowerCase().includes(searchLower) ||
        sub.employeeId?.toLowerCase().includes(searchLower) ||
        sub.incidentDate?.toLowerCase().includes(searchLower) ||
        sub.coordinatorName?.toLowerCase().includes(searchLower)
      );
      
      console.log(`🔍 Evaluando registro ${sub.id}:`, {
        workerName: sub.workerName,
        employeeId: sub.employeeId,
        incidentDate: sub.incidentDate,
        coordinatorName: sub.coordinatorName,
        matches,
        searchLower
      });
      
      return matches;
    });

    console.log('📋 Datos filtrados:', filtered);

    filtered.sort((a: any, b: any) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      
      if (sortField === 'submissionTimestamp' || sortField === 'incidentDate') {
        aVal = new Date(aVal || 0).getTime();
        bVal = new Date(bVal || 0).getTime();
      }
      
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    console.log('📊 Datos finales para mostrar:', filtered);
    setFilteredSubmissions(filtered);
  }, [submissions, searchTerm, sortField, sortDirection]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleExport = () => {
    const timestamp = new Date().toISOString().split('T')[0];
    exportToCSV(filteredSubmissions, `registros_incidencias_${timestamp}`);
  };

  const handleViewDetails = (submission: FormData) => {
    setSelectedSubmission(submission);
    setShowDetailsModal(true);
  };

  const handleCloseDetails = () => {
    setShowDetailsModal(false);
    setSelectedSubmission(null);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Fecha inválida';
      return date.toLocaleString('es-ES', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch (e) {
      return 'Fecha inválida';
    }
  };

  const formatValue = (value: any) => {
    if (value === null || value === undefined || value === '') return '-';
    if (value === 'yes') return 'Sí';
    if (value === 'no') return 'No';
    if (typeof value === 'boolean') return value ? 'Sí' : 'No';
    return String(value);
  };

  // Calcular estadísticas
  const stats = {
    total: submissions.length,
    thisMonth: submissions.filter(s => {
      const date = new Date(s.submissionTimestamp);
      const now = new Date();
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }).length,
    thisWeek: submissions.filter(s => {
      const date = new Date(s.submissionTimestamp);
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return date >= weekAgo;
    }).length,
    averageExcess: submissions.length > 0 
      ? Math.round(submissions.reduce((sum, s) => sum + (parseInt(s.excessMinutes) || 0), 0) / submissions.length)
      : 0
  };

  // Datos para gráficos
  const coordinatorData = Object.entries(
    submissions.reduce((acc, s) => {
      const coord = s.coordinatorName || 'Sin Coordinador';
      acc[coord] = (acc[coord] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value).slice(0, 5);

  const riskData = [
    { label: 'Riesgo Vial', value: submissions.filter(s => s.generatedRoadRisk === 'yes').length, color: '#ef4444' },
    { label: 'Sin Riesgo', value: submissions.filter(s => s.generatedRoadRisk === 'no').length, color: '#10b981' },
    { label: 'No Especificado', value: submissions.filter(s => !s.generatedRoadRisk || s.generatedRoadRisk === null).length, color: '#6b7280' }
  ];

  const legalActionData = [
    { label: 'Acciones Legales', value: submissions.filter(s => s.registerForLegalAction === 'yes').length, color: '#dc2626' },
    { label: 'Sin Acciones', value: submissions.filter(s => s.registerForLegalAction === 'no').length, color: '#059669' },
    { label: 'No Especificado', value: submissions.filter(s => !s.registerForLegalAction || s.registerForLegalAction === null).length, color: '#6b7280' }
  ];

  const personalLifeData = [
    { label: 'Afectó Vida Personal', value: submissions.filter(s => s.affectedPersonalLife === 'yes').length, color: '#f59e0b' },
    { label: 'No Afectó', value: submissions.filter(s => s.affectedPersonalLife === 'no').length, color: '#10b981' },
    { label: 'No Especificado', value: submissions.filter(s => !s.affectedPersonalLife || s.affectedPersonalLife === null).length, color: '#6b7280' }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-10">
            <Spinner />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Centro de Análisis de Incidencias</h1>
              <p className="mt-2 text-slate-600">
                Estadísticas y visualización de registros de exceso de jornada
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={onBack}
                className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
              >
                Volver
              </button>
              <button
                onClick={onLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <ArrowRightOnRectangleIcon className="w-4 h-4" />
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-slate-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', name: 'Resumen General' },
                { id: 'analytics', name: 'Análisis Detallado' },
                { id: 'details', name: 'Registros Completos' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Contenido según tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Estadísticas principales */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-600">Total Registros</p>
                    <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
                  </div>
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <span className="text-indigo-600 text-xl font-bold">📊</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-600">Este Mes</p>
                    <p className="text-3xl font-bold text-slate-900">{stats.thisMonth}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-green-600 text-xl font-bold">📅</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-600">Esta Semana</p>
                    <p className="text-3xl font-bold text-slate-900">{stats.thisWeek}</p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <span className="text-yellow-600 text-xl font-bold">📈</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-600">Promedio Exceso</p>
                    <p className="text-3xl font-bold text-slate-900">{stats.averageExcess} min</p>
                  </div>
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <span className="text-red-600 text-xl font-bold">⏰</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DonutChart data={riskData} title="Distribución de Riesgo Vial" />
              <DonutChart data={legalActionData} title="Acciones Legales Registradas" />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DonutChart data={personalLifeData} title="Impacto en Vida Personal" />
              <BarChart data={coordinatorData} title="Top 5 Coordinadores" />
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Análisis de Tendencias</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-medium text-slate-700 mb-2">Patrones de Asignación</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Patrón detectado:</span>
                      <span className="text-sm font-medium">
                        {submissions.filter(s => s.assignmentPattern === 'yes').length} de {submissions.length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Porcentaje:</span>
                      <span className="text-sm font-medium">
                        {submissions.length > 0 ? ((submissions.filter(s => s.assignmentPattern === 'yes').length / submissions.length) * 100).toFixed(1) : 0}%
                      </span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-slate-700 mb-2">Intencionalidad</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Intencional:</span>
                      <span className="text-sm font-medium">
                        {submissions.filter(s => s.personalIntent === 'yes').length} de {submissions.length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Porcentaje:</span>
                      <span className="text-sm font-medium">
                        {submissions.length > 0 ? ((submissions.filter(s => s.personalIntent === 'yes').length / submissions.length) * 100).toFixed(1) : 0}%
                      </span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-slate-700 mb-2">Notificación Inspección</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Notificados:</span>
                      <span className="text-sm font-medium">
                        {submissions.filter(s => s.notifyLaborInspectorate === 'yes').length} de {submissions.length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Porcentaje:</span>
                      <span className="text-sm font-medium">
                        {submissions.length > 0 ? ((submissions.filter(s => s.notifyLaborInspectorate === 'yes').length / submissions.length) * 100).toFixed(1) : 0}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Análisis Temporal</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-slate-700 mb-2">Distribución por Mes</h4>
                  <div className="space-y-2">
                    {Object.entries(
                      submissions.reduce((acc, s) => {
                        const date = new Date(s.submissionTimestamp);
                        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                        acc[monthKey] = (acc[monthKey] || 0) + 1;
                        return acc;
                      }, {} as Record<string, number>)
                    ).sort((a, b) => b[0].localeCompare(a[0])).slice(0, 6).map(([month, count]) => (
                      <div key={month} className="flex justify-between">
                        <span className="text-sm text-slate-600">{month}</span>
                        <span className="text-sm font-medium">{count} registros</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-slate-700 mb-2">Exceso Promedio por Mes</h4>
                  <div className="space-y-2">
                    {Object.entries(
                      submissions.reduce((acc, s) => {
                        const date = new Date(s.submissionTimestamp);
                        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                        if (!acc[monthKey]) acc[monthKey] = { total: 0, count: 0 };
                        acc[monthKey].total += parseInt(s.excessMinutes) || 0;
                        acc[monthKey].count += 1;
                        return acc;
                      }, {} as Record<string, { total: number; count: number }>)
                    ).sort((a, b) => b[0].localeCompare(a[0])).slice(0, 6).map(([month, data]) => (
                      <div key={month} className="flex justify-between">
                        <span className="text-sm text-slate-600">{month}</span>
                        <span className="text-sm font-medium">{Math.round(data.total / data.count)} min</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'details' && (
          <div className="space-y-6">
            {/* Controles */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div className="flex-1">
                  <label htmlFor="search" className="block text-sm font-medium text-slate-700 mb-2">
                    Buscar registros
                  </label>
                  <input
                    type="text"
                    id="search"
                    placeholder="Buscar por nombre, empleado, fecha..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    🔄 Recargar
                  </button>
                  <button
                    onClick={handleExport}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Exportar CSV
                  </button>
                </div>
              </div>
              
              <div className="mt-4 text-sm text-slate-600">
                Mostrando {filteredSubmissions.length} de {submissions.length} registros
              </div>
            </div>

            {/* Tabla */}
            {error ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800">{error}</p>
              </div>
            ) : filteredSubmissions.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8 text-center">
                <p className="text-slate-500 text-lg">
                  {searchTerm ? 'No se encontraron registros que coincidan con la búsqueda.' : 'No hay registros guardados todavía.'}
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                      <tr>
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100"
                          onClick={() => handleSort('workerName')}
                        >
                          <div className="flex items-center gap-1">
                            Trabajador
                            {sortField === 'workerName' && (
                              <ChevronDownIcon className={`w-4 h-4 ${sortDirection === 'asc' ? 'rotate-180' : ''}`} />
                            )}
                          </div>
                        </th>
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100"
                          onClick={() => handleSort('employeeId')}
                        >
                          <div className="flex items-center gap-1">
                            Nº Empleado
                            {sortField === 'employeeId' && (
                              <ChevronDownIcon className={`w-4 h-4 ${sortDirection === 'asc' ? 'rotate-180' : ''}`} />
                            )}
                          </div>
                        </th>
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100"
                          onClick={() => handleSort('incidentDate')}
                        >
                          <div className="flex items-center gap-1">
                            Fecha Incidente
                            {sortField === 'incidentDate' && (
                              <ChevronDownIcon className={`w-4 h-4 ${sortDirection === 'asc' ? 'rotate-180' : ''}`} />
                            )}
                          </div>
                        </th>
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100"
                          onClick={() => handleSort('submissionTimestamp')}
                        >
                          <div className="flex items-center gap-1">
                            Fecha Envío
                            {sortField === 'submissionTimestamp' && (
                              <ChevronDownIcon className={`w-4 h-4 ${sortDirection === 'asc' ? 'rotate-180' : ''}`} />
                            )}
                          </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Exceso (min)
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Coordinador
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Acciones Legales
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                      {filteredSubmissions.map((sub) => (
                        <tr key={sub.id} className="hover:bg-slate-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-slate-900">
                              {formatValue(sub.workerName)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-slate-900">
                              {formatValue(sub.employeeId)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-slate-900">
                              {formatValue(sub.incidentDate)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-slate-900">
                              {formatDate(sub.submissionTimestamp)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-slate-900">
                              {formatValue(sub.excessMinutes)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-slate-900">
                              {formatValue(sub.coordinatorName)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-slate-900">
                              {formatValue(sub.registerForLegalAction)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => handleViewDetails(sub)}
                              className="px-3 py-1 bg-indigo-600 text-white text-xs rounded-md hover:bg-indigo-700 transition-colors"
                            >
                              Ver Detalles
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modal de Detalles */}
        {showDetailsModal && selectedSubmission && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-slate-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-slate-900">
                    Detalles del Formulario - {selectedSubmission.workerName}
                  </h2>
                  <button
                    onClick={handleCloseDetails}
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Información Básica */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-slate-50 rounded-lg p-4">
                    <h3 className="font-semibold text-slate-900 mb-3">Información del Trabajador</h3>
                    <div className="space-y-2">
                      <div><span className="font-medium">Nombre:</span> {formatValue(selectedSubmission.workerName)}</div>
                      <div><span className="font-medium">Nº Empleado:</span> {formatValue(selectedSubmission.employeeId)}</div>
                      <div><span className="font-medium">Coordinador:</span> {formatValue(selectedSubmission.coordinatorName)}</div>
                      <div><span className="font-medium">Fecha Incidente:</span> {formatValue(selectedSubmission.incidentDate)}</div>
                      <div><span className="font-medium">Fecha Envío:</span> {formatDate(selectedSubmission.submissionTimestamp)}</div>
                    </div>
                  </div>
                  
                  <div className="bg-slate-50 rounded-lg p-4">
                    <h3 className="font-semibold text-slate-900 mb-3">Jornada Laboral</h3>
                    <div className="space-y-2">
                      <div><span className="font-medium">Inicio Jornada:</span> {formatValue(selectedSubmission.shiftStartTime)}</div>
                      <div><span className="font-medium">Fin Jornada:</span> {formatValue(selectedSubmission.shiftEndTime)}</div>
                      <div><span className="font-medium">Hora Asignación:</span> {formatValue(selectedSubmission.assignmentTime)}</div>
                      <div><span className="font-medium">Tiempo Restante:</span> {formatValue(selectedSubmission.remainingShiftTime)} min</div>
                      <div><span className="font-medium">Exceso:</span> {formatValue(selectedSubmission.excessMinutes)} min</div>
                    </div>
                  </div>
                </div>

                {/* Ubicaciones y Tiempos */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-slate-50 rounded-lg p-4">
                    <h3 className="font-semibold text-slate-900 mb-3">Ubicaciones</h3>
                    <div className="space-y-2">
                      <div><span className="font-medium">Ubicación Recibo:</span> {formatValue(selectedSubmission.locationOnReceipt)}</div>
                      <div><span className="font-medium">Dirección Recogida:</span> {formatValue(selectedSubmission.pickupAddress)}</div>
                      <div><span className="font-medium">Dirección Destino:</span> {formatValue(selectedSubmission.destinationAddress)}</div>
                    </div>
                  </div>
                  
                  <div className="bg-slate-50 rounded-lg p-4">
                    <h3 className="font-semibold text-slate-900 mb-3">Tiempos de Viaje</h3>
                    <div className="space-y-2">
                      <div><span className="font-medium">Al Origen:</span> {formatValue(selectedSubmission.travelTimeToOrigin)} min</div>
                      <div><span className="font-medium">Origen a Destino:</span> {formatValue(selectedSubmission.travelTimeOriginToDestination)} min</div>
                      <div><span className="font-medium">Destino a Base:</span> {formatValue(selectedSubmission.travelTimeDestinationToBase)} min</div>
                      <div><span className="font-medium">Tiempo Total Estimado:</span> {formatValue(selectedSubmission.totalEstimatedServiceTime)} min</div>
                    </div>
                  </div>
                </div>

                {/* Tipo de Servicio */}
                <div className="bg-slate-50 rounded-lg p-4">
                  <h3 className="font-semibold text-slate-900 mb-3">Tipo de Servicio</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center">
                      <input type="checkbox" checked={selectedSubmission.serviceType?.hospitalDischarge || false} readOnly className="mr-2" />
                      <span>Alta Hospitalaria</span>
                    </div>
                    <div className="flex items-center">
                      <input type="checkbox" checked={selectedSubmission.serviceType?.nonUrgentTransfer || false} readOnly className="mr-2" />
                      <span>Traslado No Urgente</span>
                    </div>
                    <div className="flex items-center">
                      <input type="checkbox" checked={selectedSubmission.serviceType?.other || false} readOnly className="mr-2" />
                      <span>Otro: {formatValue(selectedSubmission.serviceType?.otherText)}</span>
                    </div>
                  </div>
                </div>

                {/* Impacto y Consecuencias */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-slate-50 rounded-lg p-4">
                    <h3 className="font-semibold text-slate-900 mb-3">Impacto Personal</h3>
                    <div className="space-y-2">
                      <div><span className="font-medium">Afectó Vida Personal:</span> {formatValue(selectedSubmission.affectedPersonalLife)}</div>
                      <div><span className="font-medium">Explicación Impacto:</span> {formatValue(selectedSubmission.impactExplanation)}</div>
                      <div><span className="font-medium">Excedió 1 Hora:</span> {formatValue(selectedSubmission.exceededOverOneHour)}</div>
                      <div><span className="font-medium">Horas Extra Trabajadas:</span> {formatValue(selectedSubmission.additionalHoursWorked)}</div>
                    </div>
                  </div>
                  
                  <div className="bg-slate-50 rounded-lg p-4">
                    <h3 className="font-semibold text-slate-900 mb-3">Riesgos y Acciones</h3>
                    <div className="space-y-2">
                      <div><span className="font-medium">Generó Riesgo Vial:</span> {formatValue(selectedSubmission.generatedRoadRisk)}</div>
                      <div><span className="font-medium">Detalles Riesgo:</span> {formatValue(selectedSubmission.riskDetails)}</div>
                      <div><span className="font-medium">Registrar Acción Legal:</span> {formatValue(selectedSubmission.registerForLegalAction)}</div>
                      <div><span className="font-medium">Notificar Inspección:</span> {formatValue(selectedSubmission.notifyLaborInspectorate)}</div>
                    </div>
                  </div>
                </div>

                {/* Patrones y Frecuencia */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-slate-50 rounded-lg p-4">
                    <h3 className="font-semibold text-slate-900 mb-3">Patrones de Asignación</h3>
                    <div className="space-y-2">
                      <div><span className="font-medium">Patrón Detectado:</span> {formatValue(selectedSubmission.assignmentPattern)}</div>
                      <div><span className="font-medium">Descripción Patrón:</span> {formatValue(selectedSubmission.patternDescription)}</div>
                      <div><span className="font-medium">Veces Últimos 30 días:</span> {formatValue(selectedSubmission.timesLast30Days)}</div>
                    </div>
                  </div>
                  
                  <div className="bg-slate-50 rounded-lg p-4">
                    <h3 className="font-semibold text-slate-900 mb-3">Complicaciones</h3>
                    <div className="space-y-2">
                      <div><span className="font-medium">Complicaciones:</span> {formatValue(selectedSubmission.complications)}</div>
                      <div><span className="font-medium">Excede Tiempo Restante:</span> {formatValue(selectedSubmission.exceedsRemainingTime)}</div>
                      <div><span className="font-medium">Complicaciones Imprevistas:</span> {formatValue(selectedSubmission.unforeseenComplications)}</div>
                      <div><span className="font-medium">Intencionalidad Personal:</span> {formatValue(selectedSubmission.personalIntent)}</div>
                    </div>
                  </div>
                </div>

                {/* Capturas de Pantalla */}
                {(selectedSubmission.screenshot1_url || selectedSubmission.screenshot2_url || selectedSubmission.screenshot3_url) && (
                  <div className="bg-slate-50 rounded-lg p-4">
                    <h3 className="font-semibold text-slate-900 mb-3">Capturas de Pantalla</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {selectedSubmission.screenshot1_url && (
                        <div>
                          <p className="text-sm font-medium mb-2">Captura 1:</p>
                          <img 
                            src={selectedSubmission.screenshot1_url} 
                            alt="Captura 1" 
                            className="w-full h-32 object-cover rounded border cursor-pointer hover:opacity-80"
                            onClick={() => window.open(selectedSubmission.screenshot1_url, '_blank')}
                          />
                        </div>
                      )}
                      {selectedSubmission.screenshot2_url && (
                        <div>
                          <p className="text-sm font-medium mb-2">Captura 2:</p>
                          <img 
                            src={selectedSubmission.screenshot2_url} 
                            alt="Captura 2" 
                            className="w-full h-32 object-cover rounded border cursor-pointer hover:opacity-80"
                            onClick={() => window.open(selectedSubmission.screenshot2_url, '_blank')}
                          />
                        </div>
                      )}
                      {selectedSubmission.screenshot3_url && (
                        <div>
                          <p className="text-sm font-medium mb-2">Captura 3:</p>
                          <img 
                            src={selectedSubmission.screenshot3_url} 
                            alt="Captura 3" 
                            className="w-full h-32 object-cover rounded border cursor-pointer hover:opacity-80"
                            onClick={() => window.open(selectedSubmission.screenshot3_url, '_blank')}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="p-6 border-t border-slate-200">
                <button
                  onClick={handleCloseDetails}
                  className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
