import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import UploadPage from '../pages/UploadPage';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('@/api/llm', () => ({
  generateQuiz: vi.fn(),
}));

describe('UploadPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('bouton désactivé si le titre est vide', () => {
    render(
      <MemoryRouter>
        <UploadPage />
      </MemoryRouter>,
    );

    const submitButton = screen.getByRole('button', { name: /Générer le quiz/i });
    expect(submitButton).toBeDisabled();
  });

  it('validation client de texte : désactivé si < 200 caractères et activé si >= 200', () => {
    render(
      <MemoryRouter>
        <UploadPage />
      </MemoryRouter>,
    );

    // Titre
    fireEvent.change(screen.getByPlaceholderText(/Histoire — Révolution française/i), {
      target: { value: 'Cours Histoire' },
    });

    const submitButton = screen.getByRole('button', { name: /Générer le quiz/i });
    expect(submitButton).toBeDisabled(); // pas encore de texte

    const textarea = screen.getByPlaceholderText(/Collez ici le texte/i);

    // 150 caractères -> désactivé
    fireEvent.change(textarea, { target: { value: 'a'.repeat(150) } });
    expect(submitButton).toBeDisabled();
    expect(screen.getByText(/150 \/ 200 caractères minimum/i)).toBeInTheDocument();

    // 210 caractères -> activé
    fireEvent.change(textarea, { target: { value: 'a'.repeat(210) } });
    expect(submitButton).toBeEnabled();
    expect(screen.getByText(/210 \/ 200 caractères minimum/i)).toBeInTheDocument();
  });

  it('validation client de taille de PDF : affiche une erreur et bloque si > 5 Mo', async () => {
    render(
      <MemoryRouter>
        <UploadPage />
      </MemoryRouter>,
    );

    // Titre
    fireEvent.change(screen.getByPlaceholderText(/Histoire — Révolution française/i), {
      target: { value: 'Cours PDF' },
    });

    // Switch mode PDF
    fireEvent.click(screen.getByRole('button', { name: /📄 PDF/i }));

    const fileInput = document.querySelector('input[type="file"]')!;
    expect(fileInput).toBeInTheDocument();

    // Fichier fictif de 6 Mo
    const file = new File(['dummy_content'], 'large.pdf', { type: 'application/pdf' });
    Object.defineProperty(file, 'size', { value: 6 * 1024 * 1024 });

    fireEvent.change(fileInput, { target: { files: [file] } });

    // Devrait afficher un message d'erreur et bloquer le submit
    expect(screen.getByText(/dépasse 5 Mo/i)).toBeInTheDocument();
    const submitButton = screen.getByRole('button', { name: /Générer le quiz/i });
    expect(submitButton).toBeDisabled();
  });
});
