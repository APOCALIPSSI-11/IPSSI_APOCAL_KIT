/** Mentions légales — reflètent le modèle de distribution on-premise décidé
 * dans ADR-001 (souveraineté des données, hébergement chez le client). */
import LegalScaffold, { type LegalSection } from './LegalScaffold';

const DPO_EMAIL = 'dpo@edututor-ia.fr';

const SECTIONS: LegalSection[] = [
  {
    title: 'Éditeur du site',
    hint: "nom de l'organisation/équipe, statut, adresse, email de contact.",
    content: (
      <div>
        <p className="mb-2">
          EduTutor IA est édité par l'<strong>Équipe 11</strong>, dans le cadre du projet pédagogique APOCAL'IPSSI
          2026 (bootcamp de développement produit encadré par Mohamed Amine EL AFRIT).
        </p>
        <p className="mb-2"><strong>Membres de l'équipe :</strong></p>
        <ul className="list-disc pl-5 mb-2 space-y-1">
          <li>Seer MENSAH ASSIAKOLEY (Scrum Master)</li>
          <li>Frederick TOUFIK (Développeur)</li>
          <li>Romain LEFEVRE (Développeur)</li>
          <li>Thi Van Anh NGUYEN (Développeuse)</li>
          <li>Hugo HAVET (Développeur)</li>
          <li>Redouane ID SOUGOU (Développeur)</li>
          <li>Azeddine AMARI (Développeur)</li>
        </ul>
        <p>
          Contact :{' '}
          <a href={`mailto:${DPO_EMAIL}`} className="underline hover:no-underline">
            {DPO_EMAIL}
          </a>
          .
        </p>
      </div>
    ),
  },
  {
    title: 'Directeur de la publication',
    hint: 'nom de la personne responsable du contenu publié.',
    content: <p>Seer MENSAH ASSIAKOLEY, Scrum Master de l'Équipe 11.</p>,
  },
  {
    title: 'Hébergeur',
    hint: "nom, adresse et téléphone de l'hébergeur du site.",
    content: (
      <p>
        EduTutor IA est distribué sous <strong>licence on-premise</strong> : chaque établissement
        client héberge lui-même l'application sur sa propre infrastructure (aucun hébergeur tiers
        centralisé), conformément au choix de souveraineté des données acté dans notre décision
        d'architecture (ADR-001).
      </p>
    ),
  },
  {
    title: 'Propriété intellectuelle',
    hint: 'à qui appartiennent les textes, logos, code, contenus.',
    content: (
      <p>
        Le code source et les éléments graphiques d'EduTutor IA sont distribués sous licence CC
        BY-NC-SA 4.0. Les cours importés et contenus produits par les utilisateurs restent leur
        propriété exclusive.
      </p>
    ),
  },
  {
    title: 'Contact',
    hint: 'comment vous joindre pour toute question juridique.',
    content: (
      <p>
        Pour toute question juridique ou relative à la protection des données :{' '}
        <a href={`mailto:${DPO_EMAIL}`} className="underline hover:no-underline">
          {DPO_EMAIL}
        </a>
        .
      </p>
    ),
  },
];

export default function MentionsLegalesPage() {
  return (
    <LegalScaffold
      title="Mentions légales"
      intro="Informations légales obligatoires identifiant l'éditeur et l'hébergeur du site."
      sections={SECTIONS}
      lastUpdated="01/07/2026"
    />
  );
}
