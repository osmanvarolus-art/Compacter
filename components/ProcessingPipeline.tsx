import React from 'react';
import { ProcessingStage, ChunkResult } from '../types';
import { Zap, BrainCircuit, CheckCircle2, Loader2, FileText } from 'lucide-react';

interface ProcessingPipelineProps {
  stage: ProcessingStage;
  chunks: ChunkResult[];
  totalChunks: number;
  processedChunks: number;
}

const ProcessingPipeline: React.FC<ProcessingPipelineProps> = ({ 
  stage, 
  chunks, 
  totalChunks, 
  processedChunks 
}) => {
  
  const getStageStatus = (current: ProcessingStage, target: ProcessingStage) => {
    if (current === target) return 'active';
    const order = [ProcessingStage.IDLE, ProcessingStage.CHUNKING, ProcessingStage.COMPACTING, ProcessingStage.SYNTHESIZING, ProcessingStage.COMPLETE];
    if (order.indexOf(current) > order.indexOf(target)) return 'completed';
    return 'pending';
  };

  const renderStep = (
    title: string, 
    description: string, 
    icon: React.ReactNode, 
    status: 'active' | 'completed' | 'pending'
  ) => {
    const activeColor = 'text-brand-600 border-brand-200 bg-brand-50';
    const completedColor = 'text-emerald-600 border-emerald-200 bg-emerald-50';
    const pendingColor = 'text-slate-400 border-slate-200 bg-slate-50';

    const colorClass = status === 'active' ? activeColor : status === 'completed' ? completedColor : pendingColor;

    return (
      <div className={`flex items-start space-x-4 p-4 rounded-lg border ${colorClass} transition-all duration-300`}>
        <div className={`p-2 rounded-md bg-white shadow-sm`}>
          {status === 'active' ? <Loader2 className="w-5 h-5 animate-spin" /> : status === 'completed' ? <CheckCircle2 className="w-5 h-5" /> : icon}
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-sm">{title}</h4>
          <p className="text-xs opacity-80 mt-1">{description}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {renderStep(
          "Ingestion & Chunking",
          `Splitting document into ${totalChunks || '?'} semantic units`,
          <FileText className="w-5 h-5" />,
          getStageStatus(stage, ProcessingStage.CHUNKING)
        )}
        
        {renderStep(
          "Fast Worker (Flash)",
          processedChunks > 0 ? `Compacted ${processedChunks}/${totalChunks} chunks` : "High-speed noise removal",
          <Zap className="w-5 h-5" />,
          getStageStatus(stage, ProcessingStage.COMPACTING)
        )}

        {renderStep(
          "Smart Synthesizer (Pro)",
          "Building durable knowledge artifact",
          <BrainCircuit className="w-5 h-5" />,
          getStageStatus(stage, ProcessingStage.SYNTHESIZING)
        )}
      </div>

      {/* Real-time Compaction Feed */}
      {stage !== ProcessingStage.IDLE && (
        <div className="mt-6 border border-slate-200 rounded-lg overflow-hidden bg-slate-900 text-slate-300 font-mono text-xs">
          <div className="bg-slate-800 px-4 py-2 border-b border-slate-700 flex justify-between items-center">
            <span className="font-bold text-slate-100 flex items-center gap-2">
              <Zap className="w-3 h-3 text-yellow-400" /> 
              LIVE COMPACTION FEED
            </span>
            <span className="bg-slate-700 px-2 py-0.5 rounded text-[10px]">
              MODEL: gemini-2.5-flash
            </span>
          </div>
          <div className="h-48 overflow-y-auto p-4 space-y-2">
            {chunks.length === 0 && <span className="opacity-50 italic">Waiting for chunks...</span>}
            {chunks.map((chunk, idx) => (
              <div key={idx} className="border-l-2 border-brand-500 pl-3 py-1">
                <div className="text-brand-400 mb-1">CHUNK #{chunk.index + 1} processed:</div>
                <div className="opacity-80 line-clamp-2">{chunk.compactedText}</div>
              </div>
            ))}
            {stage === ProcessingStage.COMPACTING && (
              <div className="animate-pulse text-brand-400 pl-3">Processing next batch...</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProcessingPipeline;