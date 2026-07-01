# TRGPD-02 — Consentement explicite à l'inscription (Frontend)

> **User Story** : US-RGPD-02 — *En tant que futur utilisateur d'EduTutor IA, je veux donner mon consentement explicite lors de la création de mon compte via une case à cocher, afin que l'application respecte les principes de transparence et de recueil du consentement du RGPD.*
> **Sprint** : Sprint 2
> **Estimation** : 1h
> **Assigné** : NGUYEN Thi Van Anh
> **Statut** : Done

---

## 1. Objectif de la tâche

Modifier le formulaire d'inscription sur la page `/signup` (`SignupPage.tsx`) pour ajouter une case à cocher (checkbox) obligatoire. Cette case valide que l'utilisateur accepte expressément les Conditions Générales d'Utilisation (CGU) et la Politique de Confidentialité d'EduTutor IA. Le bouton "Créer mon compte" doit rester inactif tant que la case n'est pas cochée.

---

## 2. Contexte du code actuel

| Fichier | Rôle | À modifier ? |
|---|---|---|
| [frontend/src/pages/SignupPage.tsx](../../../frontend/src/pages/SignupPage.tsx) | Page et formulaire de création de compte | **OUI** |

---

## 3. Spécifications techniques

### 3.1 Checkbox de consentement
* La case à cocher doit être placée immédiatement avant le bouton de soumission du formulaire d'inscription.
* Libellé exact : *« J'accepte les CGU et la Politique de confidentialité d'EduTutor IA. »*
* Les termes « CGU » et « Politique de confidentialité » doivent être des liens hypertextes pointant respectivement vers `/legal/cgu` et `/legal/confidentialite`.

### 3.2 Contrôle de validation
* Déclarer un état React `acceptedTerms` (boolean) initialisé à `false`.
* Associer cet état à la valeur de la checkbox.
* Lier l'attribut `disabled` du bouton de soumission pour qu'il soit désactivé si `acceptedTerms` est faux (en plus des validations existantes sur les champs email et mot de passe).

---

## 4. Étapes détaillées

1. Ouvrir le fichier `frontend/src/pages/SignupPage.tsx`.
2. Déclarer une variable d'état local via `useState` :
   ```typescript
   const [acceptedTerms, setAcceptedTerms] = useState(false);
   ```
3. Dans la structure JSX du formulaire, insérer la checkbox :
   - Utiliser un conteneur flexible pour aligner la checkbox avec son libellé.
   - Utiliser des composants React Router `<Link>` pour rediriger vers `/legal/cgu` et `/legal/confidentialite` sans recharger l'application entière.
4. Mettre à jour l'attribut `disabled` du bouton principal pour inclure `!acceptedTerms`.
5. Tester le formulaire pour s'assurer qu'on ne peut pas cliquer sur le bouton de création de compte sans cocher la case.

---

## 5. Definition of Done

- [x] La checkbox obligatoire est affichée et fonctionnelle avant le bouton de soumission sur `/signup`.
- [x] Les liens redirigent correctement vers les pages de mentions légales.
- [x] Il est impossible de s'inscrire sans cocher la case.

---

## 🤖 Prompt pour l'IA de codage (Claude Code / Antigravity)

Copiez-collez le prompt suivant dans votre agent IA de codage pour réaliser la tâche de manière autonome :

```text
Tu es Antigravity, un agent de codage expert React/TypeScript. Ta tâche est d'implémenter la case à cocher RGPD obligatoire sur la page d'inscription (tâche TRGPD-02).

Voici les instructions à suivre :
1. Ouvre le fichier frontend/src/pages/SignupPage.tsx.
2. Déclare un état React : const [acceptedTerms, setAcceptedTerms] = useState(false);
3. Dans le formulaire JSX, juste avant le bouton de soumission de type submit, ajoute un bloc div d'alignement contenant :
   - Un élément input de type="checkbox" avec id="rgpd-consent", checked={acceptedTerms}, onChange={(e) => setAcceptedTerms(e.target.checked)} et l'attribut required.
   - Un label HTML associé de texte : "J'accepte les [CGU](/legal/cgu) et la [Politique de confidentialité](/legal/confidentialite) d'EduTutor IA." (Remplace les crochets markdown par des composants Link importés de react-router-dom pointant vers toast/pages correspondantes, par exemple : <Link to="/legal/cgu" className="text-amber-500 hover:underline">CGU</Link>).
4. Trouve le bouton de soumission. Dans son attribut disabled, ajoute le test '|| !acceptedTerms' pour s'assurer que le bouton reste grisé tant que la case n'est pas cochée.
5. Compile et vérifie la page d'inscription pour t'assurer que le style visuel s'intègre harmonieusement avec le reste de l'interface (utilise les styles existants ou des classes Tailwind/Vanilla CSS de l'application).
```
