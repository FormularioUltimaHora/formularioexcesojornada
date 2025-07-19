
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

// Función para exportar a CSV
function exportToCSV(data: any[], filename: string) {
  if (data.length === 0) {
    alert('No hay datos para exportar');
    return;
  }

  // Definir las columnas que queremos exportar
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

  // Crear headers
  const headers = columns.map(col => col.label).join(',');
  
  // Crear filas de datos
  const rows = data.map(item => {
    return columns.map(col => {
      let value = item[col.key];
      if (value === null || value === undefined) return '';
      if (typeof value === 'boolean') return value ? 'Sí' : 'No';
      if (value === 'yes') return 'Sí';
      if (value === 'no') return 'No';
      // Escapar comillas en CSV
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

export const AdminPage: React.FC<AdminPageProps> = ({ onBack, onLogout }) => {
  const [submissions, setSubmissions] = useState<FormData[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<FormData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<string>('submissionTimestamp');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    const fetchSubmissions = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { data, error: supabaseError } = await supabase.from('submissions').select('*');
        if (supabaseError) throw supabaseError;
        
        const mapped = toCamelCase(data || []);
        const sorted = mapped.sort((a: any, b: any) => 
          new Date(b.submissionTimestamp).getTime() - new Date(a.submissionTimestamp).getTime()
        );
        setSubmissions(sorted);
        setFilteredSubmissions(sorted);
      } catch (err) {
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
    let filtered = submissions.filter(sub => {
      const searchLower = searchTerm.toLowerCase();
      return (
        sub.workerName?.toLowerCase().includes(searchLower) ||
        sub.employeeId?.toLowerCase().includes(searchLower) ||
        sub.incidentDate?.toLowerCase().includes(searchLower) ||
        sub.coordinatorName?.toLowerCase().includes(searchLower)
      );
    });

    // Ordenar
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

  const handleClearAll = async () => {
    if (window.confirm('¿Está seguro de que desea eliminar TODOS los registros? Esta acción no se puede deshacer.')) {
      try {
        const { error: supabaseError } = await supabase.from('submissions').delete().neq('id', '');
        if (supabaseError) throw supabaseError;
        setSubmissions([]);
        setFilteredSubmissions([]);
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
              <h1 className="text-3xl font-bold text-slate-900">Panel de Administración</h1>
              <p className="mt-2 text-slate-600">
                Gestión de registros de incidencias de exceso de jornada
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

        {/* Controles */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6">
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
                onClick={handleExport}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Exportar CSV
              </button>
              <button
                onClick={handleClearAll}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Eliminar Todos
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleDeleteOne(sub.id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                          title="Eliminar registro"
                        >
                          <TrashIcon className="w-4 h-4" />
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
    </div>
  );
};
