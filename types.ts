export enum ProcessingStage {
  IDLE = 'IDLE',
  CHUNKING = 'CHUNKING',
  COMPACTING = 'COMPACTING', // The "Fast Worker" phase
  SYNTHESIZING = 'SYNTHESIZING', // The "Smart Synthesizer" phase
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR'
}

export interface ProcessingLog {
  id: string;
  stage: ProcessingStage;
  message: string;
  timestamp: number;
}

export interface ChunkResult {
  originalText: string;
  compactedText: string;
  index: number;
}

export interface KnowledgeArtifact {
  overview: string;
  concepts: string[];
  facts: string[];
  decisions: string[];
  procedures: string[];
  risks: string[];
  openQuestions: string[];
}

// Maps to the structure demanded by the prompt
export type SectionKey = keyof KnowledgeArtifact;

export const SECTION_TITLES: Record<SectionKey, string> = {
  overview: 'Overview',
  concepts: 'Core Concepts',
  facts: 'Hard Facts',
  decisions: 'Key Decisions',
  procedures: 'Procedures & Protocols',
  risks: 'Risks & Warnings',
  openQuestions: 'Open Questions'
};