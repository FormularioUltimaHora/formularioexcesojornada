export type YesNoNull = 'yes' | 'no' | null;

export interface FormData {
  // Unique identifiers
  id: string;
  submissionTimestamp: string;

  // Worker Data
  workerName: string;
  employeeId: string;
  incidentDate: string;
  shiftStartTime: string;
  shiftEndTime: string;

  // Service Details
  locationOnReceipt: string;
  serviceType: {
    hospitalDischarge: boolean;
    nonUrgentTransfer: boolean;
    other: boolean;
    otherText: string;
  };
  assignmentTime: string;
  remainingShiftTime: string;
  pickupAddress: string;
  destinationAddress: string;
  travelTimeToOrigin: string;
  travelTimeOriginToDestination: string;
  estimatedWorkTimeOrigin: string;
  estimatedWorkTimeDestination: string;
  totalEstimatedServiceTime: string;
  complications: string;

  // Workday Impact
  exceedsRemainingTime: YesNoNull;
  unforeseenComplications: YesNoNull;
  affectedPersonalLife: YesNoNull;
  exceededOverOneHour: YesNoNull;
  excessMinutes: string;
  impactExplanation: string;
  
  // Safety and Risks
  generatedRoadRisk: YesNoNull;
  additionalHoursWorked: string;
  riskDetails: string;

  // Coordinator and Patterns
  coordinatorName: string;
  timesLast30Days: string;
  assignmentPattern: YesNoNull;
  personalIntent: YesNoNull;
  patternDescription: string;

  // Legal Action
  registerForLegalAction: YesNoNull;
  notifyLaborInspectorate: YesNoNull;
}