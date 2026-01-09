import React, { useState, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import InputForm from './components/InputForm';
import ModuleDisplay from './components/ModuleDisplay';
import QuizDisplay from './components/QuizDisplay';
import { generateContent } from './services/geminiService';
import { FormData, GeneratedContent, EducationLevel } from './types';
import { Sparkles, AlertCircle, Download, FileText, File as FileIcon } from 'lucide-react';

declare var html2pdf: any;

const App: React.FC = () => {
  const [data, setData] = useState<GeneratedContent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metaData, setMetaData] = useState<{subject: string, topic: string, level: EducationLevel} | null>(null);
  const exportRef = useRef<HTMLDivElement>(null);

  const handleFormSubmit = async (formData: FormData) => {
    setIsLoading(true);
    setError(null);
    setData(null);
    setMetaData({ subject: formData.subject, topic: formData.topic, level: formData.level });

    try {
      const result = await generateContent(
        formData.level,
        formData.subject,
        formData.topic,
        formData.context,
        formData.files,
        formData.includeSummary
      );
      setData(result);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const downloadWord = () => {
    if (!exportRef.current || !metaData) return;
    
    const preHtml = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head><meta charset='utf-8'><title>Export HTML To Doc</title>
    <style>
      body { font-family: 'Times New Roman', serif; font-size: 12pt; }
      h1 { font-size: 18pt; font-weight: bold; color: #2c3e50; margin-bottom: 12pt; }
      h2 { font-size: 16pt; font-weight: bold; color: #34495e; margin-top: 18pt; margin-bottom: 12pt; }
      h3 { font-size: 14pt; font-weight: bold; color: #2c3e50; }
      p { margin-bottom: 10pt; line-height: 1.5; }
      .question-box { border: 1px solid #ddd; padding: 10pt; margin-bottom: 10pt; background: #fafafa; }
      .stimulus { font-style: italic; background-color: #f0f0f0; padding: 5pt; margin-bottom: 5pt; }
      .options-list { list-style-type: none; padding-left: 0; }
      .option-item { margin-bottom: 5pt; }
      .key-section { margin-top: 30pt; border-top: 1px solid #ccc; padding-top: 20pt; }
    </style>
    </head><body>`;
    
    const postHtml = "</body></html>";
    const html = preHtml + exportRef.current.innerHTML + postHtml;

    const blob = new Blob(['\ufeff', html], {
      type: 'application/msword'
    });
    
    const url = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(html);
    
    // Create download link
    const link = document.createElement('a');
    link.href = url;
    link.download = `Modul_Soal_${metaData.subject}_${metaData.topic}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadPDF = () => {
    if (!exportRef.current || !metaData) return;
    const element = exportRef.current;
    const opt = {
      margin:       [0.5, 0.5, 0.5, 0.5], // Top, Left, Bottom, Right
      filename:     `Modul_Soal_${metaData.subject}_${metaData.topic}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-2 rounded-lg">
              <Sparkles className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-purple-700">
              EduGenius HOTS
            </h1>
          </div>
          <div className="text-xs font-medium px-3 py-1 bg-slate-100 rounded-full text-slate-500">
            Powered by Gemini
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="max-w-3xl mx-auto text-center mb-8">
          <h2 className="text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">
            Create High-Quality Assessments
          </h2>
          <p className="text-lg text-slate-600">
            Generate study modules and HOTS-compliant quizzes tailored to specific education levels in seconds.
          </p>
        </div>

        {/* Input Section */}
        <InputForm onSubmit={handleFormSubmit} isLoading={isLoading} />

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md shadow-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Generation Failed</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Results Section */}
        {data && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 border-y border-slate-200 bg-white px-4 rounded-lg shadow-sm">
              <span className="text-lg font-bold text-slate-700">
                Generated Content
              </span>
              <div className="flex gap-3">
                 <button 
                  onClick={downloadWord}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  <FileText className="w-4 h-4" />
                  Download Word
                </button>
                <button 
                  onClick={downloadPDF}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                >
                  <FileIcon className="w-4 h-4" />
                  Download PDF
                </button>
              </div>
            </div>

            {data.summary && <ModuleDisplay content={data.summary} />}
            <QuizDisplay questions={data.questions} />

            {/* Hidden Element for Export */}
            <div className="absolute top-0 left-[-9999px] w-[800px]" >
              <div ref={exportRef} className="p-10 bg-white text-black font-serif">
                <div style={{ textAlign: 'center', marginBottom: '30px', borderBottom: '2px solid #000', paddingBottom: '20px' }}>
                  <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 10px 0' }}>MODUL DAN EVALUASI BELAJAR</h1>
                  <p style={{ margin: 0, fontSize: '14px' }}><strong>Mata Pelajaran:</strong> {metaData?.subject}</p>
                  <p style={{ margin: 0, fontSize: '14px' }}><strong>Topik:</strong> {metaData?.topic}</p>
                  <p style={{ margin: 0, fontSize: '14px' }}><strong>Jenjang:</strong> {metaData?.level}</p>
                </div>

                {data.summary && (
                  <div style={{ marginBottom: '30px' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: 'bold', borderBottom: '1px solid #ccc', paddingBottom: '5px', marginBottom: '15px' }}>
                      A. RINGKASAN MATERI
                    </h2>
                    <div style={{ lineHeight: '1.6', fontSize: '12pt', textAlign: 'justify', whiteSpace: 'pre-wrap' }}>
                      {data.summary}
                    </div>
                  </div>
                )}

                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: 'bold', borderBottom: '1px solid #ccc', paddingBottom: '5px', marginBottom: '15px' }}>
                    B. EVALUASI (HOTS)
                  </h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {data.questions.map((q, idx) => (
                      <div key={q.id} style={{ pageBreakInside: 'avoid' }}>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <span style={{ fontWeight: 'bold' }}>{idx + 1}.</span>
                          <div style={{ flex: 1 }}>
                            {q.stimulus && (
                              <div style={{ fontStyle: 'italic', background: '#f9f9f9', padding: '10px', marginBottom: '10px', fontSize: '11pt', borderLeft: '3px solid #666' }}>
                                {q.stimulus}
                              </div>
                            )}
                            <p style={{ margin: '0 0 10px 0', fontWeight: 'bold' }}>{q.questionText}</p>
                            <div style={{ marginLeft: '10px' }}>
                              {q.options.map((opt) => (
                                <div key={opt.key} style={{ marginBottom: '5px' }}>
                                  <span style={{ fontWeight: 'bold', width: '25px', display: 'inline-block' }}>{opt.key}.</span>
                                  {opt.text}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ marginTop: '50px', pageBreakBefore: 'always' }}>
                  <h2 style={{ fontSize: '18px', fontWeight: 'bold', borderBottom: '1px solid #ccc', paddingBottom: '5px', marginBottom: '15px' }}>
                    KUNCI JAWABAN & PEMBAHASAN
                  </h2>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11pt' }}>
                     <thead>
                       <tr style={{ background: '#eee' }}>
                         <th style={{ border: '1px solid #000', padding: '8px', width: '50px' }}>No</th>
                         <th style={{ border: '1px solid #000', padding: '8px', width: '50px' }}>Kunci</th>
                         <th style={{ border: '1px solid #000', padding: '8px' }}>Pembahasan / Analisis</th>
                       </tr>
                     </thead>
                     <tbody>
                       {data.questions.map((q, idx) => (
                         <tr key={q.id}>
                           <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>{idx + 1}</td>
                           <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'center', fontWeight: 'bold' }}>{q.correctAnswer}</td>
                           <td style={{ border: '1px solid #000', padding: '8px' }}>{q.explanation}</td>
                         </tr>
                       ))}
                     </tbody>
                  </table>
                </div>
              </div>
            </div>
            
          </div>
        )}
      </main>
    </div>
  );
};

export default App;