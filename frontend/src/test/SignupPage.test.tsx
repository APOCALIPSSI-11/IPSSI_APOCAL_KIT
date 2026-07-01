import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AxiosError } from 'axios';
import SignupPage from '../pages/SignupPage';
import { signup } from '@/api/auth';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    refresh: vi.fn().mockResolvedValue(undefined),
  }),
}));

vi.mock('@/contexts/SiteConfigContext', () => ({
  useSiteConfig: () => ({
    config: { allow_signups: true },
    refresh: vi.fn(),
  }),
}));

vi.mock('@/api/auth', () => ({
  signup: vi.fn(),
}));

describe('SignupPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('affiche correctement les éléments du formulaire', () => {
    render(
      <MemoryRouter>
        <SignupPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: /Créer un compte/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Prénom/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Nom/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Mot de passe/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Créer mon compte/i })).toBeInTheDocument();
  });

  it("inscrit l'utilisateur et redirige vers /upload en cas de succès", async () => {
    vi.mocked(signup).mockResolvedValueOnce({
      id: 1,
      email: 'bob@test.com',
      username: 'bob@test.com',
      first_name: 'Bob',
      last_name: 'Test',
    });

    render(
      <MemoryRouter>
        <SignupPage />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'bob@test.com' } });
    fireEvent.change(screen.getByLabelText(/Prénom/i), { target: { value: 'Bob' } });
    fireEvent.change(screen.getByLabelText(/^Nom/i), { target: { value: 'Test' } });
    fireEvent.change(screen.getByLabelText(/Mot de passe/i), {
      target: { value: 'motdepasse123' },
    });
    fireEvent.click(screen.getByRole('checkbox'));

    fireEvent.click(screen.getByRole('button', { name: /Créer mon compte/i }));

    await waitFor(() => {
      expect(signup).toHaveBeenCalledWith({
        email: 'bob@test.com',
        password: 'motdepasse123',
        first_name: 'Bob',
        last_name: 'Test',
      });
      expect(mockNavigate).toHaveBeenCalledWith('/upload', { replace: true });
    });
  });

  it("affiche un message d'erreur si l'API d'inscription renvoie une erreur", async () => {
    const errorResponse = new AxiosError('Request failed with status code 400');
    errorResponse.response = {
      data: { detail: 'Un compte existe déjà avec cet email.' },
      status: 400,
      statusText: 'Bad Request',
      headers: {},
      config: errorResponse.config ?? ({} as never),
    };
    vi.mocked(signup).mockRejectedValueOnce(errorResponse);

    render(
      <MemoryRouter>
        <SignupPage />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'double@test.com' } });
    fireEvent.change(screen.getByLabelText(/Mot de passe/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('checkbox'));

    fireEvent.click(screen.getByRole('button', { name: /Créer mon compte/i }));

    await waitFor(() => {
      expect(screen.getByText(/Un compte existe déjà avec cet email./i)).toBeInTheDocument();
    });
  });
});
