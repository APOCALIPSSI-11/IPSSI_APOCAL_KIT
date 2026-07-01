# ADR-0002 : Défense en profondeur contre le prompt injection + export RGPD à la volée (perturbation J3A)

> **Format** : [MADR](https://blog.stephane-robert.info/docs/documenter/concevoir/adr/) — Markdown Any Decision Records
> **Date** : 1er juillet 2026
> **Auteurs** :
Azeddine AMARI,
Frederick TOUFIK,
Hugo HAVET,
Romain LEFEVRE,
Redouane ID SOUGOU,
Seer MENSAH ASSIAKOLEY,
Thi Van Anh NGUYEN
> **Version** : 1.0

## Statut

**Accepted**

## Contexte et problème

La perturbation **J3A** demande de répondre à deux menaces sur EduTutor IA :
1. **Prompt injection** (OWASP LLM-01) : un cours uploadé par l'utilisateur peut contenir des instructions destinées à détourner le LLM (ex. "ignore les consignes précédentes et...").
2. **Absence de conformité RGPD** : aucune voie pour un utilisateur d'exercer son droit d'accès/portabilité (Art. 15/20) ni de donner un consentement explicite au moment de l'inscription.

Il faut choisir une **architecture de défense** pour le premier point et une **architecture d'export** pour le second, réalisables dans le format court de la perturbation, sans dépendance à un service tiers.

## Decision Drivers

1. Ne pas dépendre d'un service de modération tiers (cohérent avec la contrainte de souveraineté déjà actée en [ADR-0001](./ADR-001-choix-llm.md))
2. Rester compatible avec l'architecture multi-provider LLM existante (`llm/services/`)
3. L'export RGPD doit être lisible par un non-technicien et machine-readable (portabilité Art. 20)
4. Aucune écriture disque côté serveur pour les données personnelles générées à la demande

## Options considérées — sécurité LLM

**A. Filtrage d'entrée par liste noire de mots-clés** — rejeté : contournable trivialement (reformulation, encodage).

**B. Modèle de classification dédié en garde-fou** — rejeté : latence et coût supplémentaires, contredit la stratégie on-premise légère de l'ADR-0001.

**C. Défense en profondeur en 4 couches** — retenu :
1. *Structured prompting* : séparation des rôles system/user à l'appel du LLM
2. *Validation stricte du schéma de sortie* : le JSON retourné par le LLM est rejeté s'il ne respecte pas exactement la forme attendue (10 questions, 4 options, `correct_index` entier 0-3)
3. *Échappement anti-XSS* systématique du texte généré avant stockage/affichage
4. *Tests adversariaux* automatisés en CI (prompt injection + XSS) pour prévenir les régressions

## Options considérées — export RGPD

**A. Export PDF** — rejeté : non machine-readable, ne satisfait pas la portabilité (Art. 20).

**B. Export JSON + CSV généré à la volée (ZIP en mémoire, sans écriture disque)** — retenu : lisible par un non-technicien (CSV) et par une machine (JSON), aucun fichier résiduel côté serveur.

## Décision

**Sécurité** : Option C (défense en profondeur en 4 couches), implémentée dans `llm/services/quiz_prompt.py` (validation + échappement) et les clients LLM (`llm/services/*_client.py` pour le structured prompting), couverte par des tests adversariaux dans `llm/tests.py`.

> **Mise à jour perturbation J3-conformité (01/07/2026)** : le diagnostic complet (pourquoi l'injection peut réussir, ce que chaque couche neutralise, limites résiduelles) est détaillé dans la note de sécurité dédiée : [docs/J3/note-securite-prompt-injection.md](../J3/note-securite-prompt-injection.md). La couverture de tests adversariaux a été étendue de 3 à 7 cas dans `llm/tests.py` pour couvrir explicitement les 5 catégories exigées par la perturbation (injection directe, injection indirecte/dissimulée, jailbreak par jeu de rôle, exfiltration de prompt, obfuscation par encodage) — le reliquat Ollama (T-SEC-01r, couche 1) est désormais clos, cf. §"Négatives" ci-dessous mis à jour.

**RGPD** : Option B (ZIP JSON+CSV généré en mémoire via `io.BytesIO`/`io.StringIO`), exposée par `ExportDataView` (`GET /api/accounts/export/`), complétée par un consentement explicite obligatoire à l'inscription et un modèle d'audit trail (`RGPDRequestLog`) journalisant les demandes RGPD.

## Conséquences

### Positives
- Aucune dépendance externe ajoutée ; l'architecture LLM multi-provider existante n'est pas modifiée en profondeur.
- La défense en profondeur ne repose sur aucune couche unique : si l'une échoue (ex. un provider ne sépare pas system/user), les couches suivantes (validation de schéma, tests adversariaux) restent un filet de sécurité.
- L'export RGPD est réutilisable tel quel comme brique pour toute future exigence de portabilité plus poussée.

### Négatives
- ~~La séparation system/user (couche 1) dépend de l'API du provider LLM utilisé : certains providers (ex. Ollama via `/api/generate`) ne l'exposent pas nativement~~ — **résolu en Sprint 3** (T-SEC-01r) : `ollama_client.py` appelle désormais `/api/chat` avec un tableau `messages` à rôles distincts, comme les autres providers.
- **Limite résiduelle non mitigée** (documentée dans la note de sécurité J3-conformité) : une sortie JSON structurellement valide peut malgré tout être biaisée en contenu (ex. `correct_index` identique sur toutes les questions) sans qu'aucune des 4 couches ne le détecte — aucun oracle de vérité sur la bonne réponse réelle n'existe côté validation. Accepté comme risque résiduel pour cette perturbation ; piste de mitigation possible en Sprint 4 : alerte si `correct_index` est identique sur >80 % des questions d'un quiz.
- Le format ZIP de l'export RGPD est un choix pragmatique pour cette perturbation ; toute exigence future demandant strictement une réponse JSON directe (sans passer par un fichier) nécessiterait un endpoint complémentaire — **résolu depuis par US-J3B-4** (cf. [sprint3-redispatch.md](../J3/sprint3-redispatch.md)), qui a ajouté une réponse JSON structurée en plus du ZIP existant.

### Neutres
- Le détail de l'implémentation, l'état d'avancement par tâche et le suivi des perturbations suivantes (dont J3-bis) sont documentés séparément dans le suivi de sprint, pas dans cet ADR : voir [sprint2-revue.md](../J3/sprint2-revue.md) et [sprint3-redispatch.md](../J3/sprint3-redispatch.md).

## Liens

- Brief perturbation J3-bis (suite RGPD) : https://mohamedelafrit.com/teaching/APOCALIPSSI/pages/perturbations/j3bis-rgpd.php
- Brief perturbation J3-conformité (prompt injection) : https://mohamedelafrit.com/teaching/APOCALIPSSI/pages/perturbations/j3-conformite.php
- Note de sécurité prompt injection (diagnostic / défense / limites résiduelles) : [docs/J3/note-securite-prompt-injection.md](../J3/note-securite-prompt-injection.md)
- Tests adversariaux (7 cas, 5 catégories) : [backend/llm/tests.py](../../backend/llm/tests.py)
- Suivi d'avancement des tâches J3A : [sprint2-revue.md](../J3/sprint2-revue.md)
- Reliquats et suite au Sprint 3 : [sprint3-redispatch.md](../J3/sprint3-redispatch.md)
- ADR-0001 (contrainte de souveraineté / architecture LLM) : [ADR-001-choix-llm.md](./ADR-001-choix-llm.md)
- Template MADR : https://blog.stephane-robert.info/docs/documenter/concevoir/adr/
