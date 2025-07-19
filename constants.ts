
import { FormData } from './types';
import { createClient } from '@supabase/supabase-js';

// This constant represents the state of a form *before* it's submitted,
// so it doesn't have an 'id' or 'submissionTimestamp' yet.
// The type Omit<...> correctly reflects this, fixing a TypeScript error.
export const initialFormData: Omit<FormData, 'id' | 'submissionTimestamp'> = {
  workerName: '',
  employeeId: '',
  incidentDate: '',
  shiftStartTime: '',
  shiftEndTime: '',
  locationOnReceipt: '',
  serviceType: {
    hospitalDischarge: false,
    nonUrgentTransfer: false,
    other: false,
    otherText: '',
  },
  assignmentTime: '',
  remainingShiftTime: '',
  pickupAddress: '',
  destinationAddress: '',
  travelTimeToOrigin: '',
  travelTimeOriginToDestination: '',
  travelTimeDestinationToBase: '', // Campo faltante que causaba el error
  estimatedWorkTimeOrigin: '',
  estimatedWorkTimeDestination: '',
  totalEstimatedServiceTime: '',
  complications: '',
  exceedsRemainingTime: null,
  unforeseenComplications: null,
  affectedPersonalLife: null,
  exceededOverOneHour: null,
  excessMinutes: '',
  impactExplanation: '',
  generatedRoadRisk: null,
  additionalHoursWorked: '',
  riskDetails: '',
  coordinatorName: '',
  timesLast30Days: '',
  assignmentPattern: null,
  personalIntent: null,
  patternDescription: '',
  registerForLegalAction: null,
  notifyLaborInspectorate: null,
  screenshot1_url: '', // Campos de capturas obligatorias
  screenshot2_url: '',
  screenshot3_url: '',
};

// Configuración de Supabase con credenciales verificadas
const supabaseUrl = 'https://eugowbqnmztgtacoxdcg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1Z293YnFubXp0Z3RhY294ZGNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4NTQ2MDEsImV4cCI6MjA2ODQzMDYwMX0.UGu9Iz4_bp8xoahSkkRMCQprCW9T8CVAl8CueqvbS5A';

console.log('🔧 Configurando cliente Supabase...');
console.log('📡 URL:', supabaseUrl);
console.log('🔑 Clave configurada:', !!supabaseAnonKey);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('✅ Cliente Supabase configurado correctamente');