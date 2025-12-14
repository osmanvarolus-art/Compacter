import React, { useState } from 'react';
import { 
  ProcessingStage, 
  ChunkResult, 
  KnowledgeArtifact 
} from './types';
import { splitIntoChunks, compactChunk, synthesizeKnowledge } from './services/geminiService';
import FileUpload from './components/FileUpload';
import ProcessingPipeline from './components/ProcessingPipeline';
import ArtifactView from './components/ArtifactView';
import { Layers, Command, AlertTriangle } from 'lucide-react';

const App: React.FC = () => {
  const [stage, setStage] = useState<ProcessingStage>(ProcessingStage.IDLE);
  const [chunks, setChunks] = useState<ChunkResult[]>([]);
  const [totalChunks, setTotalChunks] = useState(0);
  const [artifact, setArtifact] = useState<KnowledgeArtifact | null>(null);
  const [error, setError] = useState<string | null>(null);

  const processFile = async (text: string) => {
    try {
      setError(null);
      setArtifact(null);
      setChunks([]);
      
      // 1. Chunking
      setStage(ProcessingStage.CHUNKING);
      const textChunks = splitIntoChunks(text);
      setTotalChunks(textChunks.length);

      // 2. Compaction (The "Fast Worker")
      setStage(ProcessingStage.COMPACTING);
      
      // Process chunks in batches to avoid browser hanging, but parallel enough for speed
      const BATCH_SIZE = 3; 
      const results: ChunkResult[] = [];
      
      for (let i = 0; i < textChunks.length; i += BATCH_SIZE) {
        const batch = textChunks.slice(i, i + BATCH_SIZE);
        const batchPromises = batch.map((chunk, batchIdx) => 
          compactChunk(chunk, i + batchIdx)
        );
        
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
        setChunks(prev => [...prev, ...batchResults]);
      }

      // 3. Synthesis (The "Smart Synthesizer")
      setStage(ProcessingStage.SYNTHESIZING);
      const finalArtifact = await synthesizeKnowledge(results);
      
      setArtifact(finalArtifact);
      setStage(ProcessingStage.COMPLETE);

    } catch (err: any) {
      setStage(ProcessingStage.ERROR);
      setError(err.message || "An unexpected error occurred during processing.");
    }
  };

  const handleReset = () => {
    setStage(ProcessingStage.IDLE);
    setChunks([]);
    setArtifact(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-600 rounded-lg shadow-sm">
              <Layers className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Compacter Cloud</h1>
              <p className="text-xs text-slate-500 font-mono">ARCHITECT_V1 // CASCADE_MODE</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
             {stage === ProcessingStage.COMPLETE && (
                <button 
                  onClick={handleReset}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Process New File
                </button>
             )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 pt-10 space-y-8">
        
        {/* Intro / Empty State */}
        {stage === ProcessingStage.IDLE && (
          <div className="max-w-2xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-slate-900">Extract Durable Knowledge.</h2>
              <p className="text-lg text-slate-600 leading-relaxed">
                Aggressively strip noise from your documents. Compacter Cloud uses a 
                <span className="font-semibold text-brand-600"> Flash → Pro cascade </span> 
                architecture to deliver truth, not fluff.
              </p>
            </div>

            <FileUpload onFileLoaded={processFile} />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left mt-12">
              <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-sm">
                <Command className="w-5 h-5 text-brand-500 mb-2" />
                <h3 className="font-semibold text-slate-900">Signal vs Noise</h3>
                <p className="text-sm text-slate-500 mt-1">Discards timestamps, chitchat, and transient logs automatically.</p>
              </div>
              <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-sm">
                <Command className="w-5 h-5 text-brand-500 mb-2" />
                <h3 className="font-semibold text-slate-900">Truthfulness</h3>
                <p className="text-sm text-slate-500 mt-1">Strict constraints against hallucination. If it's not there, we say so.</p>
              </div>
              <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-sm">
                <Command className="w-5 h-5 text-brand-500 mb-2" />
                <h3 className="font-semibold text-slate-900">Structured</h3>
                <p className="text-sm text-slate-500 mt-1">Output categorized into Facts, Decisions, Risks, and Procedures.</p>
              </div>
            </div>
          </div>
        )}

        {/* Processing State */}
        {(stage !== ProcessingStage.IDLE && stage !== ProcessingStage.COMPLETE && stage !== ProcessingStage.ERROR) && (
           <ProcessingPipeline 
              stage={stage}
              chunks={chunks}
              totalChunks={totalChunks}
              processedChunks={chunks.length}
           />
        )}

        {/* Error State */}
        {stage === ProcessingStage.ERROR && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex flex-col items-center text-center space-y-4 max-w-lg mx-auto">
            <div className="p-3 bg-red-100 rounded-full text-red-600">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-red-900">Processing Failed</h3>
              <p className="text-red-700 mt-2">{error}</p>
            </div>
            <button 
              onClick={handleReset}
              className="px-6 py-2 bg-white border border-red-200 text-red-700 font-medium rounded-lg hover:bg-red-50 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Results */}
        {stage === ProcessingStage.COMPLETE && artifact && (
          <div className="space-y-6">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Knowledge Artifact</h2>
                <p className="text-slate-500">Synthesized from {totalChunks} source chunks.</p>
              </div>
            </div>
            <ArtifactView data={artifact} />
          </div>
        )}
      </main>
    </div>
  );
};

export default App;