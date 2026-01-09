import React, { useState } from 'react';
import { Question } from '../types';
import { CheckCircle2, XCircle, BrainCircuit, HelpCircle, ChevronRight, ChevronDown } from 'lucide-react';

interface Props {
  questions: Question[];
}

const QuizDisplay: React.FC<Props> = ({ questions }) => {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [showExplanation, setShowExplanation] = useState<Record<number, boolean>>({});

  const handleSelect = (questionId: number, key: string) => {
    setSelectedAnswers(prev => ({ ...prev, [questionId]: key }));
  };

  const toggleExplanation = (questionId: number) => {
    setShowExplanation(prev => ({ ...prev, [questionId]: !prev[questionId] }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-indigo-100 rounded-lg">
          <BrainCircuit className="w-6 h-6 text-indigo-700" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">HOTS Assessment</h2>
      </div>

      {questions.map((q, index) => {
        const isAnswered = !!selectedAnswers[q.id];
        const isCorrect = selectedAnswers[q.id] === q.correctAnswer;

        return (
          <div key={q.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 md:p-8">
              <div className="flex items-start justify-between gap-4 mb-4">
                <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-slate-100 text-slate-600 font-bold rounded-full text-sm">
                  {index + 1}
                </span>
                <div className="flex-1">
                  {/* Stimulus */}
                  {q.stimulus && (
                    <div className="mb-4 p-4 bg-slate-50 rounded-lg border-l-4 border-indigo-400 text-slate-700 text-sm italic">
                      {q.stimulus}
                    </div>
                  )}
                  {/* Question Stem */}
                  <h4 className="text-lg font-medium text-slate-800 mb-6">{q.questionText}</h4>
                  
                  {/* Options */}
                  <div className="space-y-3">
                    {q.options.map((opt) => {
                      let optionClass = "border-slate-200 hover:bg-slate-50 hover:border-indigo-300";
                      let icon = null;

                      if (isAnswered) {
                        if (opt.key === q.correctAnswer) {
                          optionClass = "bg-green-50 border-green-500 ring-1 ring-green-500";
                          icon = <CheckCircle2 className="w-5 h-5 text-green-600" />;
                        } else if (selectedAnswers[q.id] === opt.key) {
                          optionClass = "bg-red-50 border-red-500 ring-1 ring-red-500";
                          icon = <XCircle className="w-5 h-5 text-red-600" />;
                        } else {
                          optionClass = "border-slate-200 opacity-60";
                        }
                      } else if (selectedAnswers[q.id] === opt.key) {
                        optionClass = "border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600";
                      }

                      return (
                        <button
                          key={opt.key}
                          onClick={() => !isAnswered && handleSelect(q.id, opt.key)}
                          disabled={isAnswered}
                          className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between group ${optionClass}`}
                        >
                          <div className="flex items-center gap-4">
                            <span className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold transition-colors ${
                              isAnswered && opt.key === q.correctAnswer 
                                ? 'bg-green-200 text-green-800'
                                : isAnswered && selectedAnswers[q.id] === opt.key
                                  ? 'bg-red-200 text-red-800'
                                  : 'bg-slate-100 text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-700'
                            }`}>
                              {opt.key}
                            </span>
                            <span className="text-slate-700 font-medium">{opt.text}</span>
                          </div>
                          {icon}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Feedback Section */}
              {isAnswered && (
                <div className="mt-6 ml-12">
                  <button 
                    onClick={() => toggleExplanation(q.id)}
                    className="flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors mb-2"
                  >
                    {showExplanation[q.id] ? <ChevronDown className="w-4 h-4"/> : <ChevronRight className="w-4 h-4"/>}
                    {showExplanation[q.id] ? "Hide Analysis" : "Show Analysis & Explanation"}
                  </button>
                  
                  {showExplanation[q.id] && (
                    <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 animate-in fade-in slide-in-from-top-2">
                      <div className="flex gap-2">
                        <HelpCircle className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                        <p className="text-slate-700 text-sm leading-relaxed">
                          <span className="font-semibold block mb-1">Analysis:</span>
                          {q.explanation}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default QuizDisplay;
