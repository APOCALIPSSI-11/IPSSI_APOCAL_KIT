import { useEffect, useState } from 'react';
import { getApiErrorMessage } from '@/api/errors';
import { getTeacherDashboardData, type TeacherDashboardData } from '@/api/classes';

function KpiCard({ label, value, gradient }: { label: string; value: string; gradient: string }) {
  return (
    <div className={`rounded-2xl p-5 text-white shadow-lg ${gradient}`}>
      <p className="text-xs uppercase tracking-wide text-white/80">{label}</p>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </div>
  );
}

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('fr-FR');
}

export default function TeacherDashboardPage() {
  const [data, setData] = useState<TeacherDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getTeacherDashboardData()
      .then(setData)
      .catch((err) => setError(getApiErrorMessage(err, 'Chargement du dashboard impossible.')))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-slate-500">Chargement…</p>;
  if (error) return <p className="text-rose-600">{error}</p>;
  if (!data) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard Classe</h1>
        <p className="text-sm text-slate-500">Suivi global de la progression de vos étudiants.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <KpiCard
          label="Étudiants"
          value={String(data.total_students)}
          gradient="bg-gradient-to-br from-indigo-600 to-indigo-500"
        />
        <KpiCard
          label="Score moyen"
          value={`${data.average_score}/10`}
          gradient="bg-gradient-to-br from-emerald-600 to-emerald-500"
        />
        <KpiCard
          label="Quiz complétés"
          value={String(data.total_quizzes_completed)}
          gradient="bg-gradient-to-br from-amber-500 to-orange-500"
        />
      </div>

      <div className="card overflow-x-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Progression des étudiants</h2>
          <span className="text-xs text-slate-500">{data.students_progress.length} entrées</span>
        </div>

        {data.students_progress.length === 0 ? (
          <p className="text-sm text-slate-500">Aucun étudiant enregistré pour le moment.</p>
        ) : (
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="text-left border-b border-slate-200 text-slate-600">
                <th className="py-2 pr-4">Étudiant</th>
                <th className="py-2 pr-4">Email</th>
                <th className="py-2 pr-4">Quiz complétés</th>
                <th className="py-2 pr-4">Score moyen</th>
                <th className="py-2">Dernière activité</th>
              </tr>
            </thead>
            <tbody>
              {data.students_progress.map((student) => {
                const fullName = `${student.first_name} ${student.last_name}`.trim() || '—';
                return (
                  <tr key={student.email} className="border-b border-slate-100 last:border-0">
                    <td className="py-3 pr-4 font-medium text-slate-800">{fullName}</td>
                    <td className="py-3 pr-4 text-slate-600">{student.email}</td>
                    <td className="py-3 pr-4">{student.quizzes_completed}</td>
                    <td className="py-3 pr-4">{student.average_score}/10</td>
                    <td className="py-3 text-slate-600">{formatDate(student.last_activity)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
