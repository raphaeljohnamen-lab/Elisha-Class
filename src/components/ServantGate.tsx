import React, { useState } from 'react';
import { SERVANTS } from '../data/students';
import { Servant, Language } from '../types/quiz';
import { t } from '../data/translations';
import { ShieldCheck, Lock, ArrowRight, UserCheck } from 'lucide-react';

interface ServantGateProps {
  lang: Language;
  onSuccess: (servant: Servant) => void;
  onCancel: () => void;
}

export const ServantGate: React.FC<ServantGateProps> = ({ lang, onSuccess, onCancel }) => {
  const [selectedServant, setSelectedServant] = useState<Servant>(SERVANTS[0]);
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.trim() === selectedServant.pin) {
      setError(null);
      onSuccess(selectedServant);
    } else {
      setError(lang === 'ar' ? 'رمز المرور غير صحيح. حاول مرة أخرى.' : 'Incorrect PIN. Please try again.');
      setPin('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="glass-card w-full max-w-md p-6 sm:p-8 rounded-2xl border border-amber-500/30 shadow-2xl relative animate-scaleIn">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-navy-950 shadow-lg shadow-amber-500/20">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-amber-300 font-cinzel">
              {t('servantPortal', lang)}
            </h2>
            <p className="text-xs text-slate-400">
              {lang === 'ar' ? 'تسجيل دخول الخدام المعتمدين' : 'Authorized Servants Sign-in'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Servant Select */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-amber-400" />
              {lang === 'ar' ? 'اختر الخادم' : 'Select Servant'}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {SERVANTS.map(s => {
                const isSelected = selectedServant.name === s.name;
                return (
                  <button
                    key={s.name}
                    type="button"
                    onClick={() => {
                      setSelectedServant(s);
                      setError(null);
                    }}
                    className={`p-3 rounded-xl text-center text-xs font-semibold transition-all border ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-md shadow-amber-500/10'
                        : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <span className="block truncate">{s.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* PIN Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-amber-400" />
              {t('servantPinLabel', lang)}
            </label>
            <input
              type="password"
              inputMode="numeric"
              maxLength={6}
              value={pin}
              onChange={e => {
                setPin(e.target.value);
                if (error) setError(null);
              }}
              placeholder="••••"
              autoFocus
              className="w-full px-4 py-3 text-center text-2xl tracking-[0.4em] rounded-xl bg-black/40 border border-white/15 text-white placeholder-slate-600 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 font-mono transition-all"
            />
            <p className="mt-2 text-[11px] text-slate-400 text-center">
              {lang === 'ar'
                ? `الرمز الافتراضي لـ ${selectedServant.name}: ${selectedServant.pin}`
                : `Default PIN for ${selectedServant.name}: ${selectedServant.pin}`}
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs text-center font-medium animate-shake">
              {error}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-sm font-semibold transition-colors border border-white/10"
            >
              {t('cancel', lang)}
            </button>
            <button
              type="submit"
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-navy-950 font-bold text-sm transition-all shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2"
            >
              <span>{t('loginButton', lang)}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
