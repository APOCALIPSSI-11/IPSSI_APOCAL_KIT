import { useEffect, useRef, useState, type DragEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import ProgressBar from '@/components/ProgressBar';
import { generateQuiz, getQuizStatus } from '@/api/llm';
import { getApiErrorMessage } from '@/api/errors';

const POLL_INTERVAL_MS = 5_000;
// Garde-fou : 20 min max. Doit rester >= OLLAMA_TIMEOUT backend (1200 s), sinon
// le front abandonne alors que la génération CPU est encore en cours.
const MAX_POLL_TICKS = 240;
const MAX_PDF_SIZE_BYTES = 5 * 1024 * 1024;
const LOADING_MESSAGES = [
  'Analyse du cours en cours…',
  'Construction des 10 QCM…',
  'Vérification de la cohérence des réponses…',
  'Presque terminé, merci de patienter…',
];

export default function UploadPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [mode, setMode] = useState<'pdf' | 'text'>('text');
  const [pdf, setPdf] = useState<File | null>(null);
  const [isDraggingPdf, setIsDraggingPdf] = useState(false);
  const [sourceText, setSourceText] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const pdfInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!loading) {
      setLoadingMessageIndex(0);
      return;
    }
    const interval = window.setInterval(() => {
      setLoadingMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 2400);
    return () => window.clearInterval(interval);
  }, [loading]);

  const validatePdfFile = (file: File): string | null => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      return 'Seuls les fichiers PDF (.pdf) sont acceptés.';
    }
    if (file.size > MAX_PDF_SIZE_BYTES) {
      return 'Le fichier dépasse 5 Mo. Réduisez sa taille puis réessayez.';
    }
    return null;
  };

  const handlePdfSelection = (file: File | null) => {
    if (!file) {
      setPdf(null);
      return;
    }

    const validationError = validatePdfFile(file);
    if (validationError) {
      setPdf(null);
      setError(validationError);
      return;
    }

    setError(null);
    setPdf(file);
  };

  const handlePdfDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (loading) return;
    setIsDraggingPdf(false);

    const file = e.dataTransfer.files?.[0] ?? null;
    handlePdfSelection(file);
  };

  const isTextInvalid = mode === 'text' && sourceText.length < 200;
  const isPdfInvalid = mode === 'pdf' && (!pdf || pdf.size > 5 * 1024 * 1024);
  const isSubmitDisabled = loading || !title || (mode === 'text' ? isTextInvalid : isPdfInvalid);

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
        setError("La génération a pris trop de temps. Vérifiez qu'Ollama est lancé et réessayez.");
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
    if (isSubmitDisabled) return;
    setError(null);

    if (mode === 'pdf' && !pdf) {
      setError('Ajoutez un PDF valide (≤ 5 Mo) pour lancer la génération.');
      return;
    }
    if (mode === 'text' && sourceText.trim().length < 200) {
      setError('Le texte doit contenir au moins 200 caractères.');
      return;
    }

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
            disabled={loading}
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
              disabled={loading}
              onClick={() => {
                setMode('text');
                setError(null);
              }}
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
              disabled={loading}
              onClick={() => {
                setMode('pdf');
                setError(null);
              }}
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
              disabled={loading}
              rows={10}
              minLength={200}
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              placeholder="Collez ici le texte de votre cours (au moins 200 caractères)…"
              className="input"
            />
          ) : (
            <>
              <input
                ref={pdfInputRef}
                type="file"
                accept=".pdf,application/pdf"
                disabled={loading}
                className="hidden"
                onChange={(e) => handlePdfSelection(e.target.files?.[0] ?? null)}
              />

              <div
                role="button"
                tabIndex={0}
                aria-disabled={loading}
                onClick={() => {
                  if (loading) return;
                  pdfInputRef.current?.click();
                }}
                onKeyDown={(e) => {
                  if (loading) return;
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    pdfInputRef.current?.click();
                  }
                }}
                onDragEnter={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (loading) return;
                  setIsDraggingPdf(true);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (loading) return;
                  setIsDraggingPdf(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (loading) return;
                  setIsDraggingPdf(false);
                }}
                onDrop={handlePdfDrop}
                className={`rounded-md border-2 border-dashed p-6 text-center transition ${
                  isDraggingPdf
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-slate-300 bg-slate-50 hover:bg-slate-100'
                } ${loading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <p className="text-sm font-medium text-slate-700">
                  Glissez-déposez votre PDF ici, ou cliquez pour choisir un fichier
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Format accepté : .pdf • Taille max : 5 Mo
                </p>
                {pdf && (
                  <p className="text-xs text-emerald-700 mt-3">
                    Fichier sélectionné : {pdf.name} ({(pdf.size / (1024 * 1024)).toFixed(2)} Mo)
                  </p>
                )}
              </div>
            </>
          )}
          {mode === 'text' && (
            <p
              className={`text-xs mt-1 ${sourceText.length < 200 ? 'text-amber-600' : 'text-slate-500'}`}
            >
              {sourceText.length} / 200 caractères minimum
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitDisabled}
          className="btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <span className="animate-spin">⏳</span> {LOADING_MESSAGES[loadingMessageIndex]}
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
