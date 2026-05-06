export type ModuleType = "quiz" | "conjugation";
export type ScriptType = "hiragana" | "katakana" | "both" | "none";

export interface Module {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  type: ModuleType;
  created_at: string;
}

export interface ModuleLevel {
  id: string;
  module_id: string;
  name: string;
  order_index: number;
  script: ScriptType;
  supports_mcq: boolean;
  created_at: string;
}

export interface QuizFields {
  english: string;
  japanese: string;
  note?: string;
}

export interface ConjugationFields {
  verb: string;
  form: string;
  answer: string;
  note?: string;
}

export type CardFields = QuizFields | ConjugationFields | Record<string, string>;

export interface Card {
  id: string;
  level_id: string;
  fields: CardFields;
  created_at: string;
}

export interface QuizSession {
  id: string;
  level_id: string;
  total_cards: number;
  correct_first_try: number;
  completed_at: string;
}
