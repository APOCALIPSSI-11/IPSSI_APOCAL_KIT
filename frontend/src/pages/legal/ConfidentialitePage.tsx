/** Politique de confidentialité — rédigée à partir des décisions RGPD actées
 * lors des perturbations J3 (consentement, sécurité LLM) et J3-bis (SAR,
 * rétention, audit trail). Cf. docs/J3/politique-retention.md et
 * docs/adr/ADR-001-choix-llm.md pour le détail technique sous-jacent. */
import { Link } from 'react-router-dom';
import LegalScaffold, { type LegalSection } from './LegalScaffold';

const DPO_EMAIL = 'dpo@edututor-ia.fr';

const SECTIONS: LegalSection[] = [
  {
    title: 'Responsable du traitement',
    hint: 'qui décide pourquoi et comment les données sont traitées.',
    content: (
      <p>
        EduTutor IA est distribué sous <strong>licence on-premise</strong> : le responsable du
        traitement des données personnelles est l'établissement client qui héberge et exploite
        l'instance (le logiciel n'envoie aucune donnée à l'éditeur). L'éditeur du logiciel
        (Équipe 11, projet APOCAL'IPSSI 2026) agit en tant que fournisseur de la solution
        technique, pas en tant que destinataire des données réelles des utilisateurs finaux.
      </p>
    ),
  },
  {
    title: 'Données personnelles collectées',
    hint: 'email, nom, prénom, documents envoyés, historique de quiz…',
    content: (
      <ul className="list-disc pl-5 space-y-1">
        <li>Identité : email, prénom, nom, rôle (étudiant/enseignant).</li>
        <li>Contenus pédagogiques : cours importés (texte ou PDF ≤ 5 Mo).</li>
        <li>Quiz générés (questions, options, corrections) et vos réponses/scores.</li>
        <li>
          Journal d'audit RGPD (<code className="bg-slate-100 px-1 rounded">RGPDRequestLog</code>)
          : demandes d'export ou de suppression, horodatage, statut.
        </li>
      </ul>
    ),
  },
  {
    title: 'Finalités du traitement',
    hint: 'pourquoi vous collectez ces données (créer un compte, générer des quiz…).',
    content: (
      <p>
        Créer et sécuriser votre compte, générer des quiz à partir de vos cours, calculer et
        afficher vos scores, suivre votre progression (tableau de bord, historique), et prouver
        notre conformité RGPD en cas de contrôle (journalisation des demandes d'accès/suppression).
      </p>
    ),
  },
  {
    title: 'Base légale',
    hint: 'consentement, contrat, intérêt légitime… (RGPD art. 6).',
    content: (
      <ul className="list-disc pl-5 space-y-1">
        <li>
          <strong>Consentement explicite</strong> (Art. 6.1.a) : case à cocher obligatoire à
          l'inscription pour la collecte initiale (email, nom, prénom).
        </li>
        <li>
          <strong>Exécution du contrat</strong> (Art. 6.1.b) : traitement des cours et réponses
          nécessaire à la fourniture du service (génération de quiz, scores, dashboard).
        </li>
        <li>
          <strong>Intérêt légitime</strong> (Art. 6.1.f) : journalisation des demandes RGPD pour
          prouver notre conformité en cas de contrôle CNIL.
        </li>
      </ul>
    ),
  },
  {
    title: 'Durée de conservation',
    hint: 'combien de temps les données sont gardées, puis supprimées/anonymisées.',
    content: (
      <ul className="list-disc pl-5 space-y-1">
        <li>Compte (email, nom, rôle) : tant qu'il est actif, suppression après 2 ans d'inactivité.</li>
        <li>Cours, quiz, réponses : durée de vie du compte, ou suppression manuelle.</li>
        <li>Logs d'audit RGPD : 5 ans (preuve de conformité en cas de contrôle).</li>
        <li>
          Détail complet des durées et procédures de suppression : politique de rétention des
          données, disponible auprès du DPO sur simple demande.
        </li>
      </ul>
    ),
  },
  {
    title: 'Destinataires des données',
    hint: 'qui y a accès (équipe, sous-traitants, fournisseurs LLM…).',
    content: (
      <p>
        Seule l'équipe technique de l'établissement client a accès aux données. La génération de
        quiz s'appuie par défaut sur un modèle IA <strong>auto-hébergé (Ollama, on-premise)</strong>
        &nbsp;: le contenu de vos cours n'est transmis à aucun service tiers. Un administrateur
        peut activer un fournisseur cloud (OpenAI, Anthropic, etc.) depuis la configuration LLM ;
        dans ce cas uniquement, le texte du cours transite par ce prestataire tiers pour la durée
        de l'appel API (voir rubrique suivante).
      </p>
    ),
  },
  {
    title: 'Transferts hors UE',
    hint: 'si un fournisseur cloud héberge les données hors Union européenne.',
    content: (
      <p>
        Aucun transfert hors UE par défaut : le modèle IA tourne localement sur l'infrastructure de
        l'établissement. Si un administrateur choisit d'activer un fournisseur cloud tiers, les
        conditions de transfert (dont un éventuel hors UE) dépendent de ce prestataire — son
        activation est un choix explicite, signalé comme tel dans l'interface d'administration.
      </p>
    ),
  },
  {
    title: 'Vos droits',
    hint: 'accès, rectification, suppression, portabilité, opposition, et comment les exercer.',
    content: (
      <ul className="list-disc pl-5 space-y-1">
        <li>
          <strong>Droit d'accès et de portabilité</strong> (Art. 15/20) : bouton d'export dans
          votre <Link to="/profile" className="underline hover:no-underline">profil</Link>{' '}
          (format JSON + CSV téléchargeable immédiatement).
        </li>
        <li>
          <strong>Droit de rectification</strong> (Art. 16) : modifiable depuis votre profil, ou
          en nous contactant.
        </li>
        <li>
          <strong>Droit à l'effacement</strong> (Art. 17) : suppression définitive de compte
          disponible depuis votre profil (suppression physique immédiate, hors trace d'audit
          légale conservée 5 ans).
        </li>
        <li>
          <strong>Droit à la limitation</strong> (Art. 18) : nous contacter à {DPO_EMAIL}.
        </li>
        <li>Chaque demande est journalisée et répondue sous 1 mois maximum.</li>
      </ul>
    ),
  },
  {
    title: 'Cookies',
    hint: 'renvoi vers la politique de cookies du site.',
    content: (
      <p>
        Voir la{' '}
        <Link to="/legal/cookies" className="underline hover:no-underline">
          politique de gestion des cookies
        </Link>{' '}
        — aucun cookie de suivi n'est utilisé, seul un jeton de session technique est stocké.
      </p>
    ),
  },
  {
    title: 'Contact & réclamation',
    hint: 'email du référent données + droit de réclamation auprès de la CNIL.',
    content: (
      <p>
        Délégué à la Protection des Données :{' '}
        <a href={`mailto:${DPO_EMAIL}`} className="underline hover:no-underline">
          {DPO_EMAIL}
        </a>
        . Vous disposez également du droit d'introduire une réclamation auprès de la{' '}
        <a
          href="https://www.cnil.fr"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:no-underline"
        >
          CNIL
        </a>{' '}
        si vous estimez que vos droits ne sont pas respectés.
      </p>
    ),
  },
];

export default function ConfidentialitePage() {
  return (
    <LegalScaffold
      title="Politique de confidentialité"
      intro="Comment les données personnelles des utilisateurs sont collectées, utilisées et protégées (RGPD)."
      sections={SECTIONS}
      lastUpdated="01/07/2026"
    />
  );
}
