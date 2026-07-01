import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listQuizzes, type QuizSummary } from '@/api/quizzes';

export default function HistoryPage() {
  const [quizzes, setQuizzes] = useState<QuizSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listQuizzes()
      .then((res) => setQuizzes(res.results))
      .catch(() => setError("Impossible de charger l'historique."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-slate-500">Chargement…</p>;
  if (error) return <p className="text-rose-600">{error}</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Mon historique</h1>
          <p className="text-slate-500 text-sm">
            {quizzes.length === 0
              ? "Aucun quiz pour l'instant — créez votre premier !"
              : `${quizzes.length} quiz au compteur.`}
          </p>
        </div>
        <Link to="/upload" className="btn-primary">
          + Nouveau quiz
        </Link>
      </div>

      {quizzes.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-5xl mb-4">📚</div>
          <p className="text-slate-600 mb-4">Pas encore de quiz dans votre historique.</p>
          <Link to="/upload" className="btn-primary">
            Créer mon premier quiz
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {quizzes.map((q) => {
            // Un quiz dont la génération a échoué (ou incomplet) n'a pas de
            // questions : on n'en fait PAS un lien cliquable qui mènerait à une
            // page vide au bouton inerte. On affiche un état d'erreur explicite.
            const isBroken = q.status === 'failed' || q.nb_questions === 0;
            const isGenerating = q.status === 'generating' && q.nb_questions === 0;

            const header = (
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs text-slate-500">
                  #{q.id} · {new Date(q.created_at).toLocaleDateString('fr-FR')}
                </span>
                {isBroken && !isGenerating ? (
                  <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-700 text-xs font-mono">
                    génération échouée
                  </span>
                ) : isGenerating ? (
                  <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 text-xs font-mono">
                    en cours…
                  </span>
                ) : q.score !== null ? (
                  <span
                    className={`px-2 py-0.5 rounded font-mono text-sm font-bold ${
                      q.score >= 7
                        ? 'bg-emerald-100 text-emerald-700'
                        : q.score >= 4
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    {q.score} / 10
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-xs font-mono">
                    pas encore passé
                  </span>
                )}
              </div>
            );

            if (isBroken) {
              return (
                <div key={q.id} className="card border-rose-200 bg-rose-50/40 opacity-90">
                  {header}
                  <h3 className="font-semibold text-slate-900 mb-1">{q.title}</h3>
                  <p className="text-sm text-rose-600">
                    {isGenerating
                      ? 'Génération en cours, revenez dans un instant.'
                      : 'La génération a échoué. Relancez une création depuis « Nouveau quiz ».'}
                  </p>
                </div>
              );
            }

            return (
              <Link
                key={q.id}
                to={`/quiz/${q.id}`}
                className="card hover:border-indigo-500 hover:shadow-md transition"
              >
                {header}
                <h3 className="font-semibold text-slate-900 mb-1">{q.title}</h3>
                <p className="text-sm text-slate-500">{q.nb_questions} questions</p>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
