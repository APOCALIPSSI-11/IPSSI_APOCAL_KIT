/** Politique de gestion des cookies — reflète le mécanisme technique réel du
 * kit (token DRF en localStorage, cf. frontend/src/api/client.ts). */
import LegalScaffold, { type LegalSection } from './LegalScaffold';

const SECTIONS: LegalSection[] = [
  {
    title: "Qu'est-ce qu'un cookie ?",
    hint: 'définition simple à destination des utilisateurs.',
    content: (
      <p>
        Un cookie est un petit fichier déposé par un site dans votre navigateur pour le
        reconnaître d'une visite à l'autre. EduTutor IA n'utilise cependant{' '}
        <strong>aucun cookie</strong> : l'authentification repose sur un mécanisme de stockage
        technique différent, décrit ci-dessous.
      </p>
    ),
  },
  {
    title: 'Cookies et stockage utilisés',
    hint: "lister ce que le site dépose (ex. token d'authentification en localStorage).",
    content: (
      <p>
        Un unique jeton d'authentification (token) est stocké dans le{' '}
        <code className="bg-slate-100 px-1 rounded">localStorage</code> de votre navigateur après
        connexion. Aucun cookie tiers, aucun traceur publicitaire ou de mesure d'audience n'est
        déposé.
      </p>
    ),
  },
  {
    title: 'Finalité de chaque cookie',
    hint: "à quoi sert chaque cookie/stockage (technique, mesure d'audience…).",
    content: (
      <p>
        Le token sert exclusivement à maintenir votre session connectée entre deux pages, afin que
        l'API sache qui vous êtes sans vous redemander vos identifiants à chaque requête.
        Finalité strictement fonctionnelle — aucune mesure d'audience, aucun ciblage publicitaire.
      </p>
    ),
  },
  {
    title: 'Consentement',
    hint: 'cookies nécessitant un consentement préalable et comment il est recueilli.',
    content: (
      <p>
        Le stockage du token étant strictement nécessaire au fonctionnement du service (exemption
        légale des cookies/traceurs « essentiels »), aucune bannière de consentement cookies n'est
        requise pour ce mécanisme.
      </p>
    ),
  },
  {
    title: 'Durée de conservation',
    hint: 'combien de temps chaque cookie est conservé.',
    content: (
      <p>
        Le token reste en local jusqu'à votre déconnexion explicite (bouton « Déconnexion ») ou
        jusqu'à ce que vous videz manuellement les données de site de votre navigateur.
      </p>
    ),
  },
  {
    title: 'Gérer ou refuser les cookies',
    hint: 'comment paramétrer ou supprimer les cookies (navigateur, bannière).',
    content: (
      <p>
        Cliquez sur « Déconnexion » pour effacer le token, ou videz le stockage local du site
        depuis les réglages de confidentialité de votre navigateur. Refuser ce stockage revient à
        ne pas pouvoir rester connecté entre deux pages.
      </p>
    ),
  },
];

export default function CookiesPage() {
  return (
    <LegalScaffold
      title="Politique de gestion des cookies"
      intro="Les cookies et technologies de stockage utilisés par le site, et comment les gérer."
      sections={SECTIONS}
      lastUpdated="01/07/2026"
    />
  );
}
