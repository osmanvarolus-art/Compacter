import { GoogleGenAI, Type } from "@google/genai";
import { FAST_WORKER_MODEL, SMART_SYNTHESIZER_MODEL, COMPACT_SYSTEM_INSTRUCTION, SYNTHESIS_SYSTEM_INSTRUCTION } from '../constants';
import { KnowledgeArtifact, ChunkResult } from '../types';

// Initialize the client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Stage 1: The "Fast Worker"
 * Processes a single text chunk to remove noise.
 */
export const compactChunk = async (text: string, index: number): Promise<ChunkResult> => {
  try {
    const response = await ai.models.generateContent({
      model: FAST_WORKER_MODEL,
      contents: text,
      config: {
        systemInstruction: COMPACT_SYSTEM_INSTRUCTION,
        temperature: 0.2, // Low temperature for factual extraction
      }
    });

    const compactedText = response.text || "NO_SIGNAL";
    return {
      originalText: text,
      compactedText,
      index
    };
  } catch (error) {
    console.error(`Error compacting chunk ${index}:`, error);
    return {
      originalText: text,
      compactedText: `[ERROR] Failed to compact chunk ${index}`,
      index
    };
  }
};

/**
 * Stage 2: The "Smart Synthesizer"
 * Takes all compacted chunks and produces the final structured artifact.
 */
export const synthesizeKnowledge = async (compactedChunks: ChunkResult[]): Promise<KnowledgeArtifact> => {
  // Aggregate all compacted text
  const aggregatedInput = compactedChunks
    .map(c => c.compactedText)
    .filter(t => t !== "NO_SIGNAL" && !t.includes("[ERROR]"))
    .join("\n\n---\n\n");

  if (!aggregatedInput.trim()) {
    throw new Error("No signal found in source documents.");
  }

  try {
    const response = await ai.models.generateContent({
      model: SMART_SYNTHESIZER_MODEL,
      contents: `Here are the compacted notes from the source documents:\n\n${aggregatedInput}`,
      config: {
        systemInstruction: SYNTHESIS_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overview: { type: Type.STRING },
            concepts: { type: Type.ARRAY, items: { type: Type.STRING } },
            facts: { type: Type.ARRAY, items: { type: Type.STRING } },
            decisions: { type: Type.ARRAY, items: { type: Type.STRING } },
            procedures: { type: Type.ARRAY, items: { type: Type.STRING } },
            risks: { type: Type.ARRAY, items: { type: Type.STRING } },
            openQuestions: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["overview", "concepts", "facts", "decisions", "procedures", "risks", "openQuestions"]
        }
      }
    });

    if (!response.text) {
      throw new Error("Empty response from synthesizer.");
    }

    // Parse the JSON output
    const artifact = JSON.parse(response.text) as KnowledgeArtifact;
    return artifact;

  } catch (error) {
    console.error("Error synthesizing knowledge:", error);
    throw error;
  }
};

/**
 * Helper: Split text into chunks (naive paragraph splitter for demo purposes)
 * In a real python backend, this would be a sophisticated token splitter.
 */
export const splitIntoChunks = (text: string, chunkSize: number = 4000): string[] => {
  const paragraphs = text.split(/\n\s*\n/);
  const chunks: string[] = [];
  let currentChunk = "";

  for (const para of paragraphs) {
    if ((currentChunk.length + para.length) > chunkSize) {
      chunks.push(currentChunk);
      currentChunk = para;
    } else {
      currentChunk += (currentChunk ? "\n\n" : "") + para;
    }
  }
  if (currentChunk) {
    chunks.push(currentChunk);
  }
  return chunks;
};