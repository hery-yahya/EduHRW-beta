import React from 'react';
import { BookOpen } from 'lucide-react';

interface Props {
  content: string;
}

const ModuleDisplay: React.FC<Props> = ({ content }) => {
  if (!content) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8">
      <div className="bg-emerald-50 px-6 py-4 border-b border-emerald-100 flex items-center gap-3">
        <div className="p-2 bg-white rounded-full shadow-sm">
          <BookOpen className="w-5 h-5 text-emerald-600" />
        </div>
        <h3 className="text-lg font-bold text-emerald-900">Study Module (Materi Esensial)</h3>
      </div>
      <div className="p-6 md:p-8 prose prose-slate max-w-none prose-headings:text-slate-800 prose-p:text-slate-600 prose-li:text-slate-600">
        <div className="whitespace-pre-wrap">{content}</div>
      </div>
    </div>
  );
};

export default ModuleDisplay;
