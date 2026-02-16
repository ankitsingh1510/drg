// Type Definitions
export type QuestionType = 'single_choice' | 'multi_choice' | 'text';

export type DependsOn = {
  questionId: string;
  value: string[];
};

export type Question = {
  id: string;
  text: string;
  type: QuestionType;
  options: string[];
  category: string;
  dependsOn?: DependsOn | null;
};

export type Recommendation = {
  testName: string;
  testVariant: string | null;
  confidence: string;
  reasoning: string;
};

export type Score = {
  testName: string;
  score: number;
  variant: string | null;
};

export type RecommendationResponse = {
  sessionId: string;
  recommendation: Recommendation;
  scores: Score[];
};

// Component Exports
export { default as OrderWizard } from './OrderWizard';
export { QuestionCard } from './QuestionCard';
export { ResultScreen } from './ResultScreen';
