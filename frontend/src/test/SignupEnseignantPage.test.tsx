import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AxiosError } from 'axios';
import SignupEnseignantPage from '../pages/SignupEnseignantPage';
import { signupEnseignant } from '@/api/auth';

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
  signupEnseignant: vi.fn(),
}));

function fillForm() {
  fireEvent.change(screen.getByLabelText(/Email professionnel/i), {
    target: { value: 'prof@ecole.fr' },
  });
  fireEvent.change(screen.getByLabelText(/Établissement/i), {
    target: { value: 'Lycée Victor Hugo' },
  });
  fireEvent.change(screen.getByLabelText(/Code d'invitation/i), {
    target: { value: 'INVITE-123' },
  });
  fireEvent.change(screen.getByLabelText(/Mot de passe/i), {
    target: { value: 'motdepasse8' },
  });
  fireEvent.click(screen.getByLabelText(/J'accepte les/i));
}

describe('SignupEnseignantPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('affiche les champs spécifiques enseignant', () => {
    render(
      <MemoryRouter>
        <SignupEnseignantPage />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('heading', { name: /Créer un compte enseignant/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/Email professionnel/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Établissement/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Code d'invitation/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Créer mon compte enseignant/i }),
    ).toBeInTheDocument();
  });

  it('inscrit l\'enseignant et redirige vers /dashboard en cas de succès', async () => {
    vi.mocked(signupEnseignant).mockResolvedValueOnce({
      id: 1,
      email: 'prof@ecole.fr',
      username: 'prof@ecole.fr',
      first_name: '',
    });

    render(
      <MemoryRouter>
        <SignupEnseignantPage />
      </MemoryRouter>,
    );

    fillForm();
    fireEvent.click(screen.getByRole('button', { name: /Créer mon compte enseignant/i }));

    await waitFor(() => {
      expect(signupEnseignant).toHaveBeenCalledWith({
        email: 'prof@ecole.fr',
        password: 'motdepasse8',
        first_name: undefined,
        last_name: undefined,
        school: 'Lycée Victor Hugo',
        invite_code: 'INVITE-123',
      });
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
    });
  });

  it('affiche un message d\'erreur si l\'API échoue', async () => {
    vi.mocked(signupEnseignant).mockRejectedValueOnce(
      new AxiosError('Bad Request', 'ERR_BAD_REQUEST', undefined, undefined, {
        status: 400,
        data: { invite_code: ['Code invalide.'] },
      } as never),
    );

    render(
      <MemoryRouter>
        <SignupEnseignantPage />
      </MemoryRouter>,
    );

    fillForm();
    fireEvent.click(screen.getByRole('button', { name: /Créer mon compte enseignant/i }));

    await waitFor(() => {
      expect(screen.getByText(/Code invalide/i)).toBeInTheDocument();
    });
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
