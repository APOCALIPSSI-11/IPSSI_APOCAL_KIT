/** Conditions Générales d'Utilisation — rédigées à partir des décisions des
 * perturbations J3 (sécurité LLM / prompt injection) et J3-bis (RGPD). Cf.
 * docs/J3/note-securite-prompt-injection.md et docs/adr/ADR-002. */
import { Link } from 'react-router-dom';
import LegalScaffold, { type LegalSection } from './LegalScaffold';

const SECTIONS: LegalSection[] = [
  {
    title: 'Objet',
    hint: 'ce que régissent ces CGU et le service concerné (EduTutor IA).',
    content: (
      <p>
        Les présentes CGU régissent l'utilisation d'EduTutor IA, plateforme de génération de quiz
        pédagogiques à partir de vos cours, assistée par intelligence artificielle.
      </p>
    ),
  },
  {
    title: 'Acceptation des conditions',
    hint: "comment l'utilisateur accepte les CGU (inscription, usage…).",
    content: (
      <p>
        L'acceptation est requise et matérialisée par une case à cocher explicite lors de
        l'inscription, avec accès direct à ces CGU et à la{' '}
        <Link to="/legal/confidentialite" className="underline hover:no-underline">
          politique de confidentialité
        </Link>
        . Le bouton de création de compte reste désactivé tant que la case n'est pas cochée.
      </p>
    ),
  },
  {
    title: 'Accès au service',
    hint: "conditions d'accès, disponibilité, prérequis techniques.",
    content: (
      <p>
        Accès par compte personnel (email + mot de passe) après vérification. Aucun prérequis
        technique particulier côté utilisateur ; le service dépend de l'infrastructure fournie par
        votre établissement (licence on-premise).
      </p>
    ),
  },
  {
    title: 'Compte utilisateur',
    hint: 'création, responsabilité du mot de passe, exactitude des informations.',
    content: (
      <p>
        Vous êtes responsable de la confidentialité de votre mot de passe et de l'exactitude des
        informations fournies. Une procédure de réinitialisation de mot de passe est disponible en
        cas d'oubli.
      </p>
    ),
  },
  {
    title: 'Comportements interdits',
    hint: 'usages abusifs, contenus illicites, atteinte à la sécurité.',
    content: (
      <p>
        Sont notamment interdits : le dépôt de contenus illicites, et toute tentative de
        manipulation du moteur de génération par instructions cachées ou détournées (« prompt
        injection ») visant à en altérer le fonctionnement ou à en extraire la configuration
        interne. De telles tentatives sont neutralisées techniquement (validation stricte de la
        sortie du modèle) et peuvent entraîner la suspension du compte.
      </p>
    ),
  },
  {
    title: 'Contenu généré par IA',
    hint: "limites des quiz générés (peuvent contenir des erreurs), responsabilité de l'utilisateur.",
    content: (
      <p>
        Les quiz sont générés automatiquement par un modèle de langage à partir de votre cours,
        puis validés automatiquement sur leur structure (10 questions, 4 options, une réponse
        correcte). Cette validation garantit un format correct, mais <strong>ne garantit pas
        l'exactitude pédagogique du contenu</strong> : une relecture par l'utilisateur ou
        l'enseignant reste recommandée avant tout usage évalué.
      </p>
    ),
  },
  {
    title: 'Responsabilité',
    hint: "limites de responsabilité de l'éditeur.",
    content: (
      <p>
        L'éditeur ne peut être tenu responsable des décisions prises sur la base des quiz générés,
        ni des indisponibilités liées à l'infrastructure de l'établissement hébergeur.
      </p>
    ),
  },
  {
    title: 'Propriété intellectuelle',
    hint: "droits sur le service et sur les contenus déposés par l'utilisateur.",
    content: (
      <p>
        Les cours que vous importez restent votre propriété. Le logiciel EduTutor IA est distribué
        sous licence CC BY-NC-SA 4.0 dans le cadre du projet pédagogique APOCAL'IPSSI 2026.
      </p>
    ),
  },
  {
    title: 'Modification des CGU',
    hint: 'comment et quand les CGU peuvent évoluer.',
    content: (
      <p>
        Ces CGU peuvent être mises à jour ; la date de dernière mise à jour figure en bas de page.
        Toute modification substantielle vous sera signalée.
      </p>
    ),
  },
  {
    title: 'Droit applicable et litiges',
    hint: 'droit applicable et juridiction compétente.',
    content: <p>Droit français applicable ; tribunaux français compétents à défaut d'accord amiable.</p>,
  },
];

export default function CGUPage() {
  return (
    <LegalScaffold
      title="Conditions Générales d'Utilisation"
      intro="Les règles d'utilisation du service EduTutor IA, acceptées par chaque utilisateur."
      sections={SECTIONS}
      lastUpdated="01/07/2026"
    />
  );
}
