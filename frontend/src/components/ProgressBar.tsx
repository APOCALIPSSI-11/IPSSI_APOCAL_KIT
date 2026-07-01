import { useEffect, useState } from 'react';

export default function ProgressBar({ active }: { active: boolean }) {
  const [progress, setProgress] = useState(0);
  const [stepText, setStepText] = useState('Démarrage...');

  useEffect(() => {
    if (!active) {
      setProgress(0);
      return;
    }
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return 95;
        let inc = 2.5;
        if (prev >= 50) inc = 0.8;
        if (prev >= 80) inc = 0.1;
        return Math.min(prev + inc, 95);
      });
    }, 500);
    return () => clearInterval(interval);
  }, [active]);

  useEffect(() => {
    if (progress < 25) setStepText('📥 Analyse du cours et extraction du texte...');
    else if (progress < 60)
      setStepText('🤖 Inférence LLM locale et formulation des questions (cette étape prend du temps)...');
    else if (progress < 85) setStepText('✍️ Rédaction des distracteurs et choix pédagogiques...');
    else setStepText('🔍 Validation du JSON et enregistrement du quiz...');
  }, [progress]);

  if (!active) return null;

  return (
    <div className="space-y-2 mt-4 p-4 bg-slate-50 border rounded-lg">
      <div className="flex justify-between text-sm font-medium text-slate-700">
        <span>{stepText}</span>
        <span>{Math.round(progress)}%</span>
      </div>
      <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
        <div
          className="bg-gradient-to-r from-indigo-500 to-purple-600 h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
