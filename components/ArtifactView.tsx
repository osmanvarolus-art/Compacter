import React, { useState } from 'react';
import { KnowledgeArtifact, SECTION_TITLES, SectionKey } from '../types';
import { 
  BookOpen, 
  Lightbulb, 
  ShieldAlert, 
  ListTodo, 
  Gavel, 
  HelpCircle, 
  Database 
} from 'lucide-react';

interface ArtifactViewProps {
  data: KnowledgeArtifact;
}

const ICONS: Record<SectionKey, React.ReactNode> = {
  overview: <BookOpen className="w-5 h-5" />,
  concepts: <Lightbulb className="w-5 h-5" />,
  facts: <Database className="w-5 h-5" />,
  decisions: <Gavel className="w-5 h-5" />,
  procedures: <ListTodo className="w-5 h-5" />,
  risks: <ShieldAlert className="w-5 h-5" />,
  openQuestions: <HelpCircle className="w-5 h-5" />
};

const COLORS: Record<SectionKey, string> = {
  overview: 'bg-slate-100 text-slate-700 border-slate-200',
  concepts: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  facts: 'bg-blue-50 text-blue-700 border-blue-200',
  decisions: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  procedures: 'bg-violet-50 text-violet-700 border-violet-200',
  risks: 'bg-rose-50 text-rose-700 border-rose-200',
  openQuestions: 'bg-amber-50 text-amber-700 border-amber-200',
};

const ArtifactView: React.FC<ArtifactViewProps> = ({ data }) => {
  const [activeTab, setActiveTab] = useState<SectionKey>('overview');

  const sections = Object.keys(data) as SectionKey[];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="border-b border-slate-200 bg-slate-50 flex overflow-x-auto no-scrollbar">
        {sections.map((section) => (
          <button
            key={section}
            onClick={() => setActiveTab(section)}
            className={`
              flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors border-b-2
              ${activeTab === section 
                ? 'border-brand-500 text-brand-700 bg-white' 
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100'}
            `}
          >
            {ICONS[section]}
            {SECTION_TITLES[section]}
            <span className="ml-1 text-xs px-1.5 py-0.5 rounded-full bg-slate-200 text-slate-600">
              {Array.isArray(data[section]) ? (data[section] as string[]).length : 1}
            </span>
          </button>
        ))}
      </div>

      <div className="p-8 min-h-[400px]">
        <div className="max-w-4xl mx-auto">
           <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-6 uppercase tracking-wider ${COLORS[activeTab]}`}>
             {ICONS[activeTab]}
             {SECTION_TITLES[activeTab]}
           </div>

           <div className="prose prose-slate max-w-none">
             {activeTab === 'overview' ? (
               <p className="text-lg leading-relaxed text-slate-800">
                 {data.overview || "No overview generated."}
               </p>
             ) : (
               <ul className="space-y-4 list-none pl-0">
                 {(data[activeTab] as string[]).map((item, idx) => (
                   <li key={idx} className="flex gap-4 items-start p-4 rounded-lg bg-slate-50 border border-slate-100">
                     <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-white border border-slate-200 text-xs font-mono text-slate-400">
                       {idx + 1}
                     </span>
                     <span className="text-slate-700">{item}</span>
                   </li>
                 ))}
                 {(data[activeTab] as string[]).length === 0 && (
                    <li className="text-slate-400 italic">No items found for this section.</li>
                 )}
               </ul>
             )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default ArtifactView;