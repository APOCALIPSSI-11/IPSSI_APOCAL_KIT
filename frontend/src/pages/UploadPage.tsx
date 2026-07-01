import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import ProgressBar from '@/components/ProgressBar';
import { generateQuiz, getQuizStatus } from '@/api/llm';
import { getApiErrorMessage } from '@/api/errors';

const POLL_INTERVAL_MS = 5_000;
const MAX_POLL_TICKS = 120; // garde-fou : 10 min max

export default function UploadPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [mode, setMode] = useState<'pdf' | 'text'>('text');
  const [pdf, setPdf] = useState<File | null>(null);
  const [sourceText, setSourceText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Nettoyage de l'intervalle si le composant est démonté pendant le polling
  useEffect(() => {
    return () => {
      if (intervalRef.current !== null) clearInterval(intervalRef.current);
    };
  }, []);

  const stopPolling = () => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const startPolling = (quizId: number) => {
    let ticks = 0;
    let failCount = 0;
    const MAX_FAILS = 5;

    intervalRef.current = setInterval(async () => {
      ticks++;
      if (ticks > MAX_POLL_TICKS) {
        stopPolling();
        setError('La génération a pris trop de temps. Vérifiez qu'Ollama est lancé et réessayez.');
        setLoading(false);
        return;
      }
      try {
        const res = await getQuizStatus(quizId);
        failCount = 0;
        if (res.status === 'completed') {
          stopPolling();
          navigate(`/quiz/${quizId}`);
        } else if (res.status === 'failed') {
          stopPolling();
          setError('La génération a échoué côté serveur.');
          setLoading(false);
        }
      } catch {
        failCount++;
        if (failCount >= MAX_FAILS) {
          stopPolling();
          setError('Connexion perdue pendant la génération.');
          setLoading(false);
        }
      }
    }, POLL_INTERVAL_MS);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await generateQuiz({
        title,
        pdf: mode === 'pdf' ? (pdf ?? undefined) : undefined,
        source_text: mode === 'text' ? sourceText : undefined,
      });
      startPolling(result.id);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Échec de la génération.'));
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-slate-900 mb-2">Créer un nouveau quiz</h1>
      <p className="text-slate-600 mb-6">
        Uploade un PDF ou colle un texte. EduTutor IA génère 10 questions QCM.
      </p>

      {error && (
        <div className="mb-4 p-3 bg-rose-50 border-l-4 border-rose-500 text-sm text-rose-900 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="card space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Titre du cours</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex. Histoire — Révolution française"
            className="input"
          />
        </div>

        <div>
          <div className="flex gap-2 mb-3">
            <button
              type="button"
              onClick={() => setMode('text')}
              className={`px-3 py-1 rounded text-sm font-medium ${
                mode === 'text'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              📝 Texte collé
            </button>
            <button
              type="button"
              onClick={() => setMode('pdf')}
              className={`px-3 py-1 rounded text-sm font-medium ${
                mode === 'pdf'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              📄 PDF
            </button>
          </div>

          {mode === 'text' ? (
            <textarea
              required
              rows={10}
              minLength={200}
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              placeholder="Collez ici le texte de votre cours (au moins 200 caractères)…"
              className="input"
            />
          ) : (
            <input
              type="file"
              accept=".pdf,application/pdf"
              required
              onChange={(e) => setPdf(e.target.files?.[0] ?? null)}
              className="input"
            />
          )}
          {mode === 'text' && (
            <p className="text-xs text-slate-500 mt-1">
              {sourceText.length} / 200 caractères minimum
            </p>
          )}
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? (
            <>
              <span className="animate-spin">⏳</span> Génération en cours…
            </>
          ) : (
            <>🚀 Générer le quiz</>
          )}
        </button>

        <ProgressBar active={loading} />

        {!loading && (
          <p className="text-xs text-slate-500 text-center">
            La génération peut prendre de 1 à 5 minutes selon votre machine (bien plus rapide avec
            un GPU ou un modèle plus léger).
          </p>
        )}
      </form>
    </div>
  );
}
