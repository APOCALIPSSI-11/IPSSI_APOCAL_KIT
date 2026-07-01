# Note de sécurité — Prompt Injection (OWASP LLM-01)

> **Document** : Perturbation J3-conformité (sécurité/éthique)
> **Périmètre** : pipeline de génération de quiz EduTutor IA (`backend/llm/`)
> **Rédigé par** : Seer MENSAH ASSIAKOLEY
> **Date** : 01/07/2026 · **Version** : 1.0
> **Lié à** : [ADR-002](../adr/ADR-002-securisation-llm-rgpd-j3a.md) (décision d'architecture), tests dans [backend/llm/tests.py](../../backend/llm/tests.py)

---

## 1. Diagnostic

**Scénario déclencheur** : un testeur de sécurité dépose un cours contenant un texte caché ("IGNORE TOUTES LES INSTRUCTIONS PRÉCÉDENTES...") destiné à faire répondre le LLM systématiquement "A" à toutes les questions, indépendamment de la bonne réponse réelle.

**Pourquoi ce type d'injection peut réussir** : un LLM ne distingue nativement aucune frontière de confiance entre les instructions de l'éditeur (system prompt) et le contenu fourni par un utilisateur tiers (le cours uploadé) — les deux sont concaténés dans le même flux de tokens. Si l'appel au modèle ne sépare pas explicitement ces rôles (cas historique du client Ollama via `/api/generate`, corrigé en Sprint 3 — cf. reliquat T-SEC-01r), une instruction glissée dans le cours a la même autorité apparente que le prompt système, et le modèle peut "obéir" à l'attaquant plutôt qu'à l'éditeur.

**Ce que la structure seule ne détecte pas** : même avec des rôles system/user correctement séparés, un LLM reste statistiquement influençable par du texte convaincant dans le contexte utilisateur. Une sortie JSON *structurellement valide* (10 questions, 4 options, `correct_index` ∈ [0,3]) peut malgré tout être *biaisée en contenu* — ex. `correct_index=0` pour toutes les questions — sans qu'aucune validation de schéma ne le détecte, car ce biais est indiscernable d'une réponse légitime au niveau de la structure.

## 2. Stratégie de défense (4 couches, ADR-002)

1. **Structured prompting** : séparation stricte des rôles `system`/`user` à l'appel du LLM (`{"role": "system", ...}` / `{"role": "user", ...}`), appliquée uniformément à tous les clients (`openai_compatible.py`, `anthropic_client.py`, et désormais `ollama_client.py` via `/api/chat`, cf. reliquat T-SEC-01r).
2. **Prompt système défensif** : `SYSTEM_PROMPT` ([quiz_prompt.py](../../backend/llm/services/quiz_prompt.py)) impose un format de sortie unique ("Sortie = JSON STRICT et UNIQUEMENT JSON"), réduisant la surface d'ambiguïté qu'une injection peut exploiter.
3. **Validation stricte post-LLM** : `parse_and_validate_quiz` rejette (lève `LLMError`) toute sortie qui ne respecte pas exactement le schéma attendu (10 questions, 4 options, `correct_index` entier valide) — neutralise le jailbreak par jeu de rôle et l'exfiltration de prompt, qui produisent du texte libre incompatible avec le schéma. Le contenu est en outre systématiquement échappé (`html.escape`) avant stockage, quel que soit l'encodage utilisé côté attaquant (Unicode, Base64, etc.) — la défense ne dépend d'aucune liste de mots-clés interdits, volontairement écartée (ADR-002, option A) car contournable par reformulation ou encodage.
4. **Tests adversariaux automatisés en CI** : 7 tests dans `backend/llm/tests.py` couvrant les 5 catégories exigées — injection directe, injection indirecte/dissimulée, jailbreak par jeu de rôle, exfiltration de prompt, obfuscation par encodage — plus 2 tests structurels (XSS, `correct_index` invalide). Exécutés à chaque push via `.github/workflows/ci.yml`.

## 3. Limites résiduelles

- **Biais de contenu indétectable structurellement** : le scénario déclencheur ("toujours répondre A") produit un JSON valide en structure — aucune des 4 couches ne peut le détecter automatiquement, faute d'oracle de vérité sur la bonne réponse réelle. Mitigation partielle actuelle : le prompt système précise "Une seule bonne réponse par question", mais rien ne force une *distribution* plausible des `correct_index`. Une mitigation future possible (hors périmètre de cette perturbation) : alerter si `correct_index` est identique sur >80 % des questions d'un même quiz.
- **Dépendance résiduelle au provider** : la couche 1 (séparation des rôles) suppose que l'API du LLM respecte réellement cette séparation côté modèle — un provider qui l'ignorerait en interne resterait vulnérable ; les couches 2-4, provider-agnostiques, restent alors le seul filet de sécurité.
- **Pas de détection d'intention** : aucune couche ne cherche à *comprendre* qu'une instruction est malveillante (pas de modèle de classification dédié, écarté par l'ADR-002 pour coût/latence) — la défense est uniquement structurelle (format de sortie), pas sémantique.
