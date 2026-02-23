// Type Definitions
export type QuestionType = 'single_choice' | 'multi_choice' | 'text';

export type DependsOn = {
  questionId: string;
  value: string[];
};

export type Question = {
  id: string;
  title: string;
  subtitle?: string;
  type: QuestionType;
  options: string[];
  category: string;
  section?: string;
  dependsOn?: DependsOn | null;
};

export type AlternativeTest = {
  testName: string;
  reason: string;
};

export type Recommendation = {
  testName: string;
  testVariant: string | null;
  confidence: string;
  reasoning: string;
  alternativeTests?: AlternativeTest[];
};

export type RecommendationResponse = {
  sessionId?: string;
  recommendation: Recommendation;
  testName?: string;
  testVariant?: string | null;
  confidence?: string;
  reasoning?: string;
  alternativeTests?: AlternativeTest[];
};

// Component Exports
export { default as OrderWizard } from './OrderWizard';
export { ResultScreen } from './ResultScreen';

export const STATIC_QUESTIONS: Question[] = [
  // DEMOGRAPHICS
  {
    id: 'patientGender',
    title: 'Patient Gender',
    subtitle: 'select one',
    type: 'single_choice',
    options: ['Male', 'Female', 'Other'],
    category: 'demographics',
    section: 'DEMOGRAPHICS',
    dependsOn: null,
  },
  {
    id: 'patientAge',
    title: 'Patient Age',
    subtitle: 'select one',
    type: 'single_choice',
    options: ['< 50 years', '> 50 years'],
    category: 'demographics',
    section: 'DEMOGRAPHICS',
    dependsOn: null,
  },
  {
    id: 'familyHistory',
    title: 'Family History of Cancer',
    subtitle: 'parents / grandparents / siblings',
    type: 'single_choice',
    options: ['Yes', 'No', 'Unknown'],
    category: 'demographics',
    section: 'DEMOGRAPHICS',
    dependsOn: null,
  },

  // DISEASE INFORMATION
  {
    id: 'initialDiagnosis',
    title: 'Initial Diagnosis',
    subtitle: 'type your answer',
    type: 'text',
    options: [],
    category: 'disease_info',
    section: 'DISEASE INFORMATION',
    dependsOn: null,
  },
  {
    id: 'diseaseStage',
    title: 'Disease Stage',
    subtitle: 'select one',
    type: 'single_choice',
    options: ['Stage I', 'Stage II', 'Stage III', 'Stage IV'],
    category: 'disease_info',
    section: 'DISEASE INFORMATION',
    dependsOn: null,
  },
  {
    id: 'priorLinesOfTreatment',
    title: 'Prior Lines of Treatment',
    subtitle: 'select one',
    type: 'single_choice',
    options: ['1st Line (1L)', '2nd Line or beyond (2L+)'],
    category: 'disease_info',
    section: 'DISEASE INFORMATION',
    dependsOn: null,
  },
  {
    id: 'caseOf',
    title: 'Case of',
    subtitle: 'select all that apply',
    type: 'multi_choice',
    options: ['Dual Primary', 'Recurrence', 'Relapse', 'None'],
    category: 'disease_info',
    section: 'DISEASE INFORMATION',
    dependsOn: null,
  },
  {
    id: 'conflictInTumorOrigin',
    title: 'Conflict in Tumor Origin?',
    subtitle: 'select one',
    type: 'single_choice',
    options: ['Yes', 'No', 'N/A'],
    category: 'disease_info',
    section: 'DISEASE INFORMATION',
    dependsOn: null,
  },
  {
    id: 'firstLineTreatmentResistance',
    title: '1st Line Treatment Resistance?',
    subtitle: 'select one',
    type: 'single_choice',
    options: ['Yes', 'No'],
    category: 'disease_info',
    section: 'DISEASE INFORMATION',
    dependsOn: null,
  },

  // SPECIMEN AVAILABILITY
  {
    id: 'specimenAvailable',
    title: 'Specimen Available for Testing',
    subtitle: 'select all that apply',
    type: 'multi_choice',
    options: ['🧬 Tissue', '🩸 Blood', '💧 Urine', '🫁 Pleural Fluid', '🧠 CSF', '🧪 Ascitic Fluid'],
    category: 'specimen',
    section: 'SPECIMEN AVAILABILITY',
    dependsOn: null,
  },

  // ADDITIONAL DISEASE INFORMATION
  {
    id: 'surgicalTreatmentDone',
    title: 'Was surgical treatment done?',
    subtitle: 'select one',
    type: 'single_choice',
    options: ['Yes', 'No'],
    category: 'disease_info',
    section: 'DISEASE INFORMATION',
    dependsOn: null,
  },
  {
    id: 'naCtRtTt',
    title: 'Is NA CT/RT/TT being administered?',
    subtitle: 'select one',
    type: 'single_choice',
    options: ['Yes', 'No'],
    category: 'disease_info',
    section: 'DISEASE INFORMATION',
    dependsOn: null,
  },
  {
    id: 'multipleLinesTreatmentFailure',
    title: 'Was multiple lines treatment failure encountered?',
    subtitle: 'select one',
    type: 'single_choice',
    options: ['Yes', 'No'],
    category: 'disease_info',
    section: 'DISEASE INFORMATION',
    dependsOn: null,
  },

  // CLINICAL OBJECTIVES
  {
    id: 'lookingForNeoadjuvant',
    title: 'Looking for neoadjuvant options for treatment initiation?',
    subtitle: 'select one',
    type: 'single_choice',
    options: ['Yes', 'No'],
    category: 'clinical_objectives',
    section: 'CLINICAL OBJECTIVES',
    dependsOn: null,
  },
  {
    id: 'lookingForPostSurgicalSurveillance',
    title: 'Looking for post-surgical surveillance?',
    subtitle: 'select one',
    type: 'single_choice',
    options: ['Yes', 'No'],
    category: 'clinical_objectives',
    section: 'CLINICAL OBJECTIVES',
    dependsOn: null,
  },
  {
    id: 'lookingForTherapeuticSurveillance',
    title: 'Looking for therapeutic surveillance?',
    subtitle: 'select one',
    type: 'single_choice',
    options: ['Yes', 'No'],
    category: 'clinical_objectives',
    section: 'CLINICAL OBJECTIVES',
    dependsOn: null,
  },
  {
    id: 'lookingForHistopathologicalClarity',
    title: 'Looking for conflicting histopathological clarity?',
    subtitle: 'select one',
    type: 'single_choice',
    options: ['Yes', 'No'],
    category: 'clinical_objectives',
    section: 'CLINICAL OBJECTIVES',
    dependsOn: null,
  },
  {
    id: 'lookingForImmunotherapy',
    title: 'Looking for therapeutic feasibility to use Immunotherapy?',
    subtitle: 'select one',
    type: 'single_choice',
    options: ['Yes', 'No'],
    category: 'clinical_objectives',
    section: 'CLINICAL OBJECTIVES',
    dependsOn: null,
  },
  {
    id: 'lookingForPARPi',
    title: 'Looking for therapeutic feasibility to use PARPi?',
    subtitle: 'select one',
    type: 'single_choice',
    options: ['Yes', 'No'],
    category: 'clinical_objectives',
    section: 'CLINICAL OBJECTIVES',
    dependsOn: null,
  },
  {
    id: 'lookingForHRDScore',
    title: 'Looking for HRD score?',
    subtitle: 'select one',
    type: 'single_choice',
    options: ['Yes', 'No'],
    category: 'clinical_objectives',
    section: 'CLINICAL OBJECTIVES',
    dependsOn: null,
  },
  {
    id: 'lookingForGermline',
    title: 'Looking for germline testing?',
    subtitle: 'select one',
    type: 'single_choice',
    options: ['Yes', 'No'],
    category: 'clinical_objectives',
    section: 'CLINICAL OBJECTIVES',
    dependsOn: null,
  },
  {
    id: 'lookingForMolecularSolution',
    title: 'Looking for molecular solution for recurrent/aggressive disease?',
    subtitle: 'select one',
    type: 'single_choice',
    options: ['Yes', 'No'],
    category: 'clinical_objectives',
    section: 'CLINICAL OBJECTIVES',
    dependsOn: { questionId: 'multipleLinesTreatmentFailure', value: ['Yes'] },
  },
];
