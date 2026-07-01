import { api } from './client';

export type LLMPing = {
  backend: 'ollama' | 'mock';
  model: string;
  ollama_alive: boolean;
  model_loaded?: boolean;
  message: string;
};

export async function ping(): Promise<LLMPing> {
  const { data } = await api.get<LLMPing>('/llm/ping/');
  return data;
}

export type GenerateQuizResult = { id: number; status: 'generating' };
export type QuizStatus = { status: 'generating' | 'completed' | 'failed' };

/**
 * Démarre la génération asynchrone d'un quiz.
 * Retourne immédiatement l'identifiant du quiz (202 ACCEPTED).
 * Utiliser `getQuizStatus` pour suivre la complétion.
 */
export async function generateQuiz(input: {
  title: string;
  pdf?: File;
  source_text?: string;
}): Promise<GenerateQuizResult> {
  const form = new FormData();
  form.append('title', input.title);
  if (input.pdf) form.append('pdf', input.pdf);
  if (input.source_text) form.append('source_text', input.source_text);

  const { data } = await api.post<GenerateQuizResult>('/llm/generate-quiz/', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 30_000,
  });
  return data;
}

/** Interroge le statut de génération d'un quiz (polling toutes les 5 s). */
export async function getQuizStatus(quizId: number): Promise<QuizStatus> {
  const { data } = await api.get<QuizStatus>(`/quizzes/${quizId}/status/`);
  return data;
}
