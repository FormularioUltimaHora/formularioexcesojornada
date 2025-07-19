
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

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);