import React, { useState, useRef } from 'react';
import { EducationLevel, FormData } from '../types';
import { Upload, FileText, X, BookOpen, Layers } from 'lucide-react';

interface Props {
  onSubmit: (data: FormData) => void;
  isLoading: boolean;
}

const InputForm: React.FC<Props> = ({ onSubmit, isLoading }) => {
  const [level, setLevel] = useState<EducationLevel>(EducationLevel.SMP);
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [context, setContext] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [includeSummary, setIncludeSummary] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      // Limit to images for simplicity in this demo, though logic supports it
      const validFiles = newFiles.filter(f => f.type.startsWith('image/'));
      if (validFiles.length !== newFiles.length) {
        alert("Only image files are currently supported for visual analysis.");
      }
      setFiles(prev => [...prev, ...validFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !topic) {
      alert("Please fill in Subject and Topic.");
      return;
    }
    onSubmit({
      level,
      subject,
      topic,
      context,
      files,
      includeSummary
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-indigo-50 rounded-lg">
          <BookOpen className="w-6 h-6 text-indigo-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Configuration</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Level Selection */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Education Level (Jenjang)</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.values(EducationLevel).map((l) => (
              <button
                type="button"
                key={l}
                onClick={() => setLevel(l)}
                className={`px-4 py-2 text-sm rounded-lg border transition-all ${
                  level === l
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-slate-500">
            *Determines answer options: SD 1-3 (3 options), SD 4-6/SMP (4 options), SMA (5 options).
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Subject (Mata Pelajaran)</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Matematika, IPA, Sejarah"
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Topic (Materi)</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Pecahan, Ekosistem, Perang Dunia II"
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            />
          </div>
        </div>

        {/* Material Input */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Study Material (Paste Text or Upload Image)
          </label>
          <div className="space-y-4">
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Paste reading material, notes, or context here..."
              rows={5}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-y text-slate-700 placeholder:text-slate-400"
            />
            
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors group"
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                multiple 
                accept="image/*"
              />
              <div className="p-3 bg-indigo-50 rounded-full mb-3 group-hover:scale-110 transition-transform">
                <Upload className="w-6 h-6 text-indigo-600" />
              </div>
              <p className="text-sm text-slate-600 font-medium">Click to upload images</p>
              <p className="text-xs text-slate-400 mt-1">Supports JPG, PNG (Max 5MB)</p>
            </div>

            {files.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-2">
                {files.map((file, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
                    <FileText className="w-4 h-4 text-slate-500" />
                    <span className="text-xs text-slate-700 truncate max-w-[150px]">{file.name}</span>
                    <button 
                      type="button"
                      onClick={() => removeFile(idx)}
                      className="p-0.5 hover:bg-red-100 hover:text-red-500 rounded-full transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Options */}
        <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg border border-slate-100">
          <input
            type="checkbox"
            id="summary"
            checked={includeSummary}
            onChange={(e) => setIncludeSummary(e.target.checked)}
            className="w-5 h-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
          />
          <label htmlFor="summary" className="text-sm text-slate-700 font-medium cursor-pointer">
            Generate Study Module / Summary (Ringkasan Materi)
          </label>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg shadow-indigo-200 transition-all transform hover:-translate-y-0.5 ${
            isLoading ? 'bg-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700'
          }`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <Layers className="w-5 h-5" />
              Generate Content
            </span>
          )}
        </button>
      </form>
    </div>
  );
};

export default InputForm;
