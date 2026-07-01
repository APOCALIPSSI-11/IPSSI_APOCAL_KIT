# TJ2.3 — Validation post-bascule : Mesures de latence et tests hors-ligne

> **Perturbation** : J2 — Technique (Latence inacceptable de génération)
> **Sprint** : Sprint 1 / Résolution Perturbation J2
> **Estimation** : 1h
> **Assigné** : Frederick TOUFIK
> **Statut** : Done

---

## 1. Objectif de la tâche

Valider que les choix techniques appliqués en J2 (choix du modèle léger `llama3.2:3b`) permettent d'atteindre les critères d'acceptation fonctionnels du projet :
- Le temps de génération complet (du clic à l'affichage des 10 QCM) doit être inférieur ou égal à 15 secondes sur le matériel de référence.
- Le bon fonctionnement hors-ligne (on-premise) doit être vérifié en coupant toute connexion internet sortante, pour garantir la souveraineté des données et le respect de la promesse commerciale RGPD.

---

## 2. Contexte du code actuel

| Fichier / Document | Rôle | À modifier / consulter ? |
|---|---|---|
| [docs/cadrage/J2/protocole-benchmark.md](./protocole-benchmark.md) | Protocole de mesure écrit | Consultation |
| [docs/cadrage/J2/benchmark-llm.md](./benchmark-llm.md) | Historique et résultats des mesures | Consultation |
| `scripts/benchmark.py` | Script de chronométrage | Exécution |

---

## 3. Spécifications techniques

### 3.1 Protocole de chronométrage
La latence doit être évaluée à l'aide d'un protocole rigoureux pour éliminer les biais d'analyse :
- **Runs** : Exécuter 5 tests de génération consécutifs sur le cours de référence (C3 - Algorithme de tri par fusion, 8 pages).
- **Préchauffage (Warmup)** : Effectuer 1 run à blanc préalable (non pris en compte dans les statistiques) pour charger le modèle en RAM/VRAM.
- **Métriques** : Calculer la médiane et le percentile 95 (p95) des temps de réponse.
- **Seuil d'acceptation** : La latence p95 sur le cours de référence doit être `≤ 15.0 s`.

### 3.2 Protocole de validation de souveraineté (Hors-ligne)
Pour valider l'absence de fuites ou de dépendance à des APIs cloud tiers en production :
1. Couper la connexion réseau internet physique de la machine de test (ou désactiver l'interface réseau logique).
2. Tenter de charger un document PDF et d'initier la génération de quiz.
3. Vérifier que la génération réussit, produit les 10 questions correctes et s'enregistre en base locale.
4. Si l'application échoue ou lève une erreur de résolution de nom de domaine d'API externe (ex: Google, OpenAI), identifier la dépendance cloud et la corriger.

---

## 4. Étapes détaillées

### Étape 1 — Exécuter le script de benchmark de latence
Lancer le script de test :
```bash
python scripts/benchmark.py
```
Vérifier que les temps de génération pour `llama3.2:3b` ressortent bien sous la barre des 15 secondes (résultats attendus : ~12.1 s de médiane, ~14.9 s de p95).

### Étape 2 — Exécuter le test de déconnexion réseau
1. Sous Windows, exécuter via Powershell pour couper les interfaces réseau (ou débrancher le câble Ethernet/Wi-Fi) :
   ```powershell
   Disable-NetAdapter -Name "*" -Confirm:$false
   ```
2. Lancer la génération de quiz depuis le frontend de développement local (http://localhost:3000/upload).
3. S'assurer du succès complet.
4. Réactiver l'interface réseau réseau après validation :
   ```powershell
   Enable-NetAdapter -Name "*" -Confirm:$false
   ```

---

## 5. Definition of Done

- [ ] Les 5 mesures de temps de réponse sur le cours de référence ont été effectuées et enregistrées.
- [ ] Le temps p95 mesuré est inférieur ou égal à 15 secondes sur la machine de test de référence.
- [ ] La génération hors-ligne fonctionne de bout en bout sans aucune connexion réseau internet active.
- [ ] Aucune dépendance API cloud n'est invoquée au cours du processus.

---

## 6. Pièges à éviter

1. **Garder le cache navigateur** : Lors du test hors-ligne, s'assurer que le navigateur internet ne se base pas uniquement sur des assets en cache ou qu'il ne tente pas de charger des scripts tiers (comme des polices Google Fonts bloquantes) qui ralentiraient artificiellement l'interface lors de la coupure.
2. **Ne pas fermer les applications lourdes** : Lors du benchmark de chronométrage, veiller à fermer les éditeurs de code volumineux, les onglets de navigateurs inutilisés ou les outils de communication pour dédier 100% de la puissance CPU locale à l'inférence Ollama.
3. **Tester sur des PDFs sans texte** : Utiliser impérativement le corpus de référence C3 contenant du texte brut lisible pour s'assurer que le temps d'extraction n'est pas faussé.
