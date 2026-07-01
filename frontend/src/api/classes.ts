import { api } from './client';

export type StudentProgress = {
  email: string;
  first_name: string;
  last_name: string;
  quizzes_completed: number;
  average_score: number;
  last_activity: string | null;
};

export type TeacherDashboardData = {
  total_students: number;
  average_score: number;
  total_quizzes_completed: number;
  students_progress: StudentProgress[];
};

export async function getTeacherDashboardData(): Promise<TeacherDashboardData> {
  const { data } = await api.get<TeacherDashboardData>('/courses/dashboard-classe/');
  return data;
}
