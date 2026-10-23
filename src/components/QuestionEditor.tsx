import React, { useState } from 'react';
import { dbStore } from '../services/dbStore';
import { Question, Language } from '../types/quiz';
import { t } from '../data/translations';
import { HelpCircle, Plus, Trash2, RotateCcw, Check, Save } from 'lucide-react';

interface QuestionEditorProps {
  lang: Language;
}

export const QuestionEditor: React.FC<QuestionEditorProps> = ({ lang }) => {
  const [selectedLang, setSelectedLang] = useState<Language>(lang);
  const [questions, setQuestions] = useState<Question[]>(dbStore.getQuestions(selectedLang));
  const [savedNotice, setSavedNotice] = useState(false);

  const handleLangSwitch = (targetLang: Language) => {
    setSelectedLang(targetLang);
    setQuestions(dbStore.getQuestions(targetLang));
    setSavedNotice(false);
  };

  const handleTextChange = (idx: number, newQ: string) => {
    const updated = [...questions];
    updated[idx] = { ...updated[idx], q: newQ };
    setQuestions(updated);
  };

  const handleChoiceChange = (qIdx: number, choiceIdx: number, newChoice: string) => {
    const updated = [...questions];
    const choices = [...updated[qIdx].choices];
    choices[choiceIdx] = newChoice;
    updated[qIdx] = { ...updated[qIdx], choices };
    setQuestions(updated);
  };

  const handleCorrectChange = (qIdx: number, correctIdx: number) => {
    const updated = [...questions];
    updated[qIdx] = { ...updated[qIdx], correct: correctIdx };
    setQuestions(updated);
  };

  const handleAddQuestion = () => {
    const newId = `q_${selectedLang}_${Date.now().toString(36)}`;
    const newQuestion: Question = {
      id: newId,
      lang: selectedLang,
      q: selectedLang === 'ar' ? 'سؤال جديد من إنجيل لوقا 1...' : 'New question from Luke 1...',
      choices: selectedLang === 'ar'
        ? ['الخيار أ', 'الخيار ب', 'الخيار ج', 'الخيار د']
        : ['Option A', 'Option B', 'Option C', 'Option D'],
      correct: 0,
    };
    setQuestions([...questions, newQuestion]);
  };

  const handleDeleteQuestion = (idx: number) => {
    if (questions.length <= 1) return;
    const updated = questions.filter((_, i) => i !== idx);
    setQuestions(updated);
  };

  const handleSave = () => {
    dbStore.updateQuestions(selectedLang, questions);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  const handleResetDefaults = () => {
    if (confirm(lang === 'ar' ? 'هل تريد استعادة الأسئلة الافتراضية؟' : 'Reset to default questions?')) {
      dbStore.resetQuestions(selectedLang);
      setQuestions(dbStore.getQuestions(selectedLang));
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 2000);
    }
  };

  return (
    <div className="glass-card rounded-2xl border border-white/10 p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h3 className="text-lg font-bold text-white font-cinzel flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-amber-400" />
            <span>{t('questionBankEditor', lang)}</span>
          </h3>
          <p className="text-xs text-slate-400">
            {lang === 'ar'
              ? 'تعديل أو إضافة أسئلة لمسابقة إنجيل لوقا وتحديث الإجابات النموذجية'
              : 'Customize or add Luke 1 quiz questions and set correct answers.'}
          </p>
        </div>

        {/* Language selector & actions */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-xl bg-black/40 border border-white/10 p-1">
            <button
              onClick={() => handleLangSwitch('ar')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedLang === 'ar'
                  ? 'bg-amber-500 text-navy-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              العربية (Arabic)
            </button>
            <button
              onClick={() => handleLangSwitch('en')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedLang === 'en'
                  ? 'bg-amber-500 text-navy-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              English
            </button>
          </div>

          <button
            onClick={handleResetDefaults}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-colors"
            title="Reset to defaults"
          >
            <RotateCcw className="w-4 h-4 text-slate-400 hover:text-white" />
          </button>

          <button
            onClick={handleAddQuestion}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/10 text-xs font-semibold"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>{lang === 'ar' ? 'سؤال جديد' : 'Add Question'}</span>
          </button>

          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-navy-950 font-bold text-xs shadow-md shadow-amber-500/20"
          >
            <Save className="w-4 h-4" />
            <span>{lang === 'ar' ? 'حفظ التعديلات' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {savedNotice && (
        <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
          <Check className="w-4 h-4" />
          <span>{lang === 'ar' ? 'تم حفظ الأسئلة بنجاح في قاعدة البيانات!' : 'Questions successfully saved to database!'}</span>
        </div>
      )}

      {/* Questions list */}
      <div className="space-y-4">
        {questions.map((q, qIdx) => (
          <div key={q.id || qIdx} className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <span className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center text-xs shrink-0 font-mono">
                {qIdx + 1}
              </span>
              <textarea
                value={q.q}
                onChange={e => handleTextChange(qIdx, e.target.value)}
                rows={2}
                className="flex-1 p-2.5 rounded-lg bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400 resize-none"
              />
              <button
                onClick={() => handleDeleteQuestion(qIdx)}
                disabled={questions.length <= 1}
                className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Delete question"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Choices */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-10 pr-2">
              {q.choices.map((choice, cIdx) => {
                const isCorrect = q.correct === cIdx;
                return (
                  <div
                    key={cIdx}
                    className={`flex items-center gap-2 p-2 rounded-lg border transition-all ${
                      isCorrect
                        ? 'bg-emerald-500/15 border-emerald-500/40'
                        : 'bg-black/30 border-white/5'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => handleCorrectChange(qIdx, cIdx)}
                      className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                        isCorrect
                          ? 'bg-emerald-500 border-emerald-400 text-navy-950 font-bold text-xs'
                          : 'border-white/20 text-slate-400 hover:border-amber-400'
                      }`}
                      title={isCorrect ? 'Correct answer' : 'Click to mark as correct'}
                    >
                      {isCorrect ? '✓' : String.fromCharCode(65 + cIdx)}
                    </button>
                    <input
                      type="text"
                      value={choice}
                      onChange={e => handleChoiceChange(qIdx, cIdx, e.target.value)}
                      className="flex-1 bg-transparent text-white text-xs focus:outline-none"
                      placeholder={`Option ${String.fromCharCode(65 + cIdx)}`}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
