# Rapport technique et compte rendu de livraison — Maquette V2 du site et du portail du Baromètre MAPERF 2027

**Document de référence appliqué :** [`assets/docs/MAPERF_Revue_maquette_site_web.docx`](file:///c:/Users/franc/maperf.org/assets/docs/MAPERF_Revue_maquette_site_web.docx) — *Revue de la maquette du site MAPERF — Version 2.0 du 19 novembre 2026*  
**Autres référentiels officiels présents dans le dépôt :**
- [`assets/docs/01_TDR_Barometre_MAPERF_2027.pdf`](file:///c:/Users/franc/maperf.org/assets/docs/01_TDR_Barometre_MAPERF_2027.pdf) (*Termes de référence du Baromètre national de la performance 2027*)
- [`assets/docs/Cahier_des_charges_Plateforme_Barometre_MAPERF_2027.docx`](file:///c:/Users/franc/maperf.org/assets/docs/Cahier_des_charges_Plateforme_Barometre_MAPERF_2027.docx)
- [`assets/docs/MAPERF_Barometre_Collecte_Secteur_Public.xlsx`](file:///c:/Users/franc/maperf.org/assets/docs/MAPERF_Barometre_Collecte_Secteur_Public.xlsx) (103 données de référence)
- [`assets/docs/MAPERF_Barometre_Collecte_Secteur_Prive.xlsx`](file:///c:/Users/franc/maperf.org/assets/docs/MAPERF_Barometre_Collecte_Secteur_Prive.xlsx) (104 données de référence)

---

## 1. Résumé des modifications apportées au projet (Maquette V2)

1. **Point d'entrée repositionné sur la Semaine MAPERF 2027 (16, 17 et 18 juin 2027 — Hôtel Kempinski, Brazzaville)** :
   - Refonte complète de [`index.html`](file:///c:/Users/franc/maperf.org/index.html) selon l'ordre exact des 8 sections prescrites par la revue v2.0.
   - Création de la page dédiée [`semaine-maperf.html`](file:///c:/Users/franc/maperf.org/semaine-maperf.html) détaillant les trois journées (*16 juin : Journée des entrepreneurs* ; *17 juin : Matinées et Trophées* ; *18 juin : Masterclass*), le Grand témoin **M. Denis Charles Kouassi** (17 et 18 juin), les intervenants et les informations pratiques à l'Hôtel Kempinski.
2. **Distinction claire des trois piliers (Événement / Baromètre / Trophées du Manager)** :
   - Création de [`trophees.html`](file:///c:/Users/franc/maperf.org/trophees.html) présentant les **deux Trophées du Manager de la Performance** (*Secteur public* et *Secteur privé*), leur distinction avec les prix collectifs du Baromètre, le règlement, le jury, le calendrier et le formulaire de candidature.
   - Création de [`partenaires.html`](file:///c:/Users/franc/maperf.org/partenaires.html) présentant les formules **Diamond, Or, Argent et complémentaires** ainsi que le formulaire d'expression d'intérêt partenaire, sans aucun tarif de partenariat inventé.
   - Création de [`retour-2025.html`](file:///c:/Users/franc/maperf.org/retour-2025.html) valorisant l'édition du **29 août 2025** sous le patronage du Ministre délégué **M. Luc Joseph Okio**, la remise du premier Trophée du Manager de la Performance (`3.jpg`, `4.jpg`), la galerie photo et l'espace vidéo à lecture volontaire.
   - Mise à jour de [`actualites.html`](file:///c:/Users/franc/maperf.org/actualites.html) (articles datés/signés + `#espace-presse`), [`inscription.html`](file:///c:/Users/franc/maperf.org/inscription.html) (inscription par journée avec tarif validé de **50 000 FCFA** pour le 17 juin et mention d'attente comité pour les 16 et 18 juin) et [`mentions-legales.html`](file:///c:/Users/franc/maperf.org/mentions-legales.html) (`#contact`, `#mentions`, `#confidentialite` conforme à la Loi n° 29-2019, `#charte-web`).
3. **Simplification de la navigation et séparation stricte des 3 espaces du Baromètre** :
   - Mise à jour de [`assets/js/maperf-layout.js`](file:///c:/Users/franc/maperf.org/assets/js/maperf-layout.js) : sous-menu **Baromètre** limité à 3 entrées (*Présentation et méthode*, *Calendrier*, *Espace Entreprise*), deux boutons distincts dans l'en-tête (**« Espace Entreprise »** et **« S'inscrire »**), lien **Contact** pointant vers `mentions-legales.html#contact`, retrait des modules hors périmètre (*Observatoire sectoriel*, *Plateforme PSRE*, *Forum*) de la navigation active (archivés avec `noindex, nofollow`).
   - Séparation complète entre :
     - [`barometre.html`](file:///c:/Users/franc/maperf.org/barometre.html) : page publique (*Présentation et méthode*, *Six dimensions*, *Calendrier 2027*, *Confidentialité Loi n° 29-2019*, *Documents de référence*) avec un seul bouton d'action principal **« Espace Entreprise »**, sans bouton technique ni lien vers la console d'administration.
     - [`espace-entreprise.html`](file:///c:/Users/franc/maperf.org/espace-entreprise.html) (`noindex, nofollow`) : portail réservé aux entreprises participantes (saisie pluriannuelle 2023–2025, progression dynamique par rubrique, aide contextuelle par indicateur, glisser-déposer et prévisualisation des preuves, étape de **validation contradictoire** *« J'accepte »* / *« Je formule une observation »*, et fiche de restitution provisoire).
     - [`console-maperf.html`](file:///c:/Users/franc/maperf.org/console-maperf.html) (`noindex, nofollow`, aucun lien dans les menus publics) : console réservée à l'équipe technique et au COS (tableau de revue avec les 3 exercices 2023, 2024, 2025 et la colonne *Variation*, filtres et tri, synchronisation décision ↔ pièce probante, boutons techniques *Importer / Exporter / Matrice CSV / Réinitialiser*, et onglet *Consolidation* affichant par défaut **« Résultats disponibles après validation du COS »**).

---

## 2. Matrice de suivi des exigences (Revue v2.0 du 19 novembre 2026)

| Réf. & Section source | Exigence détaillée | Page ou composant concerné | Modification réalisée | Vérification | Statut |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **§1 & §5** Point d'entrée | Faire de la Semaine MAPERF 2027 (16–18 juin 2027, Hôtel Kempinski, Brazzaville) le point d'entrée du site | [`index.html`](file:///c:/Users/franc/maperf.org/index.html), [`assets/js/maperf-config.js`](file:///c:/Users/franc/maperf.org/assets/js/maperf-config.js) | Bandeau principal restructuré avec titre, devise *« Outiller, anticiper, performer »*, 2 boutons (*S'inscrire*, *Participer au Baromètre*) et compte à rebours en jours (`J-...`) | Test QA automatisé + inspection DOM | **vérifié** |
| **§4** Arborescence publique | Mettre en place les rubriques : *Accueil, La Semaine MAPERF, Baromètre, Trophées, Devenir partenaire, Retour sur 2025, Actualités, S'inscrire, Contact* | [`assets/js/maperf-layout.js`](file:///c:/Users/franc/maperf.org/assets/js/maperf-layout.js), ensemble des pages `.html` | Création des nouvelles pages dédiées et mise à jour de l'en-tête et du pied de page partagés | Test QA automatisé (présence et intégrité des pages V2) | **vérifié** |
| **§4** Navigation & En-tête | Conserver 2 boutons distincts (*Espace Entreprise*, *S'inscrire*), limiter le sous-menu Baromètre à 3 entrées, lien *Contact* vers coordonnées | [`assets/js/maperf-layout.js`](file:///c:/Users/franc/maperf.org/assets/js/maperf-layout.js), [`mentions-legales.html`](file:///c:/Users/franc/maperf.org/mentions-legales.html) | Sous-menu Baromètre limité à *Présentation et méthode*, *Calendrier*, *Espace Entreprise* ; lien Contact vers `mentions-legales.html#contact` | Test QA automatisé sur `maperf-layout.js` | **vérifié** |
| **§4** Retrait des modules hors périmètre | Retirer *Observatoire sectoriel*, *Plateforme PSRE*, *Forum* et la console Équipe MAPERF de la navigation publique (de manière réversible) | [`forum.html`](file:///c:/Users/franc/maperf.org/forum.html), [`plateforme.html`](file:///c:/Users/franc/maperf.org/plateforme.html), `barometre-*.html`, [`console-maperf.html`](file:///c:/Users/franc/maperf.org/console-maperf.html) | Retrait des menus, ajout de `<meta name="robots" content="noindex, nofollow">` et bannière d'archive réversible | Test QA automatisé (0 lien vers `console-maperf.html` dans la nav publique) | **vérifié** |
| **§5** Ordre de la page d'accueil | Respecter l'ordre des 8 sections : 1. Bandeau principal, 2. Trois journées, 3. Baromètre (4 étapes), 4. Trophées, 5. Grand témoin et intervenants, 6. Retour sur 2025, 7. Partenaires, 8. Actualités et CTA | [`index.html`](file:///c:/Users/franc/maperf.org/index.html) | Réécriture complète de `index.html` dans l'ordre exact des 8 sections | Test QA automatisé vérifiant l'ordre séquentiel des 8 IDs de section | **vérifié** |
| **§6** Contenus de référence | Centraliser les dates, lieu Kempinski, Grand témoin M. Denis Charles Kouassi, tarif 50 000 FCFA (17 juin), rôles Owando / Ambition / ACE, calendrier Baromètre | [`assets/js/maperf-config.js`](file:///c:/Users/franc/maperf.org/assets/js/maperf-config.js) | Création du fichier de configuration centralisé distinguant données validées et éléments en attente | Test QA automatisé sur `MAPERF_CONFIG` | **vérifié** |
| **§7** Identité graphique & logos SVG | Créer deux vrais fichiers vectoriels SVG du logo (fond clair et fond sombre), corriger le logo ACE rogné, harmoniser la taille des logos partenaires | [`assets/images/logo-maperf-light.svg`](file:///c:/Users/franc/maperf.org/assets/images/logo-maperf-light.svg), [`assets/images/logo-maperf-dark.svg`](file:///c:/Users/franc/maperf.org/assets/images/logo-maperf-dark.svg), [`assets/images/logo-ace.png`](file:///c:/Users/franc/maperf.org/assets/images/logo-ace.png) | Logos SVG vectoriels purs (`<path>` et `<text>`, sans `<image>` matricielle), extraction du logo ACE complet depuis la revue docx, conteneurs `.partner-logo-box` | Test QA automatisé sur les fichiers SVG et `logo-ace.png` | **vérifié** |
| **§7** Typographie & lisibilité | Texte courant 14–16 px, minimum 13 px dans le portail du Baromètre, capitalisation française, `et` au lieu de `&`, cibles tactiles $\ge 44\text{ px}$ | [`assets/css/maperf-design.css`](file:///c:/Users/franc/maperf.org/assets/css/maperf-design.css), [`assets/js/barometre-data.js`](file:///c:/Users/franc/maperf.org/assets/js/barometre-data.js) | Règles CSS `0.8125rem` (13 px min) dans `.portal-scope`, `min-height: 44px` sur `.btn`/`.tab`/`.barometre-input`, remplacement de `&` par `et` | Test QA automatisé sur `maperf-design.css` et les dimensions | **vérifié** |
| **§8 & §10** Cohérence méthodologique | Distinguer 4 étapes / 5 rubriques de collecte / 6 dimensions ; exclure les administrations publiques non marchandes ; documenter l'écart 24 indicateurs de démo vs 103/104 données des classeurs | [`barometre.html`](file:///c:/Users/franc/maperf.org/barometre.html) | Encadrés dédiés dans `barometre.html#presentation` expliquant la distinction 4/5/6, l'exclusion des administrations non marchandes et le référentiel 103/104 | Vérification du contenu de `barometre.html` | **vérifié** (*arbitrage COS attendu sur 103/104 en ligne*) |
| **§10** Séparation des 3 espaces du Baromètre | Séparer la page publique du Baromètre, l'Espace Entreprise et la Console Équipe MAPERF ; retirer les boutons techniques de la page publique | [`barometre.html`](file:///c:/Users/franc/maperf.org/barometre.html), [`espace-entreprise.html`](file:///c:/Users/franc/maperf.org/espace-entreprise.html), [`console-maperf.html`](file:///c:/Users/franc/maperf.org/console-maperf.html) | 3 pages distinctes ; boutons *Importer / Exporter / Matrice CSV / Réinitialiser* déplacés exclusivement dans `console-maperf.html` | Test QA automatisé vérifiant l'absence des boutons techniques sur les pages publiques | **vérifié** |
| **§10** Ergonomie Espace Entreprise | Progression dynamique par rubrique (`8/8`), aide contextuelle par indicateur (définition, unité, source), 3 exercices côte à côte, état de sauvegarde locale, glisser-déposer et prévisualisation des preuves | [`espace-entreprise.html`](file:///c:/Users/franc/maperf.org/espace-entreprise.html), [`assets/js/barometre-engine.js`](file:///c:/Users/franc/maperf.org/assets/js/barometre-engine.js) | Fonctions `computeRubriqueProgress`, `getFieldContextualHelp`, zone drag-and-drop et panneau `#evidence-preview-panel` | Test QA automatisé sur `computeRubriqueProgress` et `getFieldContextualHelp` | **vérifié** (*démonstration locale*) |
| **§10** Validation contradictoire (10–21 mai 2027) | Permettre à l'entreprise de consulter ses scores provisoires et de choisir **« J'accepte »** ou **« Je formule une observation »** | [`espace-entreprise.html`](file:///c:/Users/franc/maperf.org/espace-entreprise.html), [`assets/js/barometre-engine.js`](file:///c:/Users/franc/maperf.org/assets/js/barometre-engine.js) | Onglet `#panel-contradictoire` avec récapitulatif des 6 dimensions, champ d'observation et boutons `#btn-contradictoire-accept` / `#btn-contradictoire-observe` | Test QA automatisé sur `submitValidationContradictoire` | **vérifié** (*démonstration locale*) |
| **§10** Restitution & Consolidation COS | Conditionner la comparaison au groupe homogène à la validation finale ; afficher **« Résultats disponibles après validation du COS »** dans la consolidation | [`espace-entreprise.html`](file:///c:/Users/franc/maperf.org/espace-entreprise.html), [`console-maperf.html`](file:///c:/Users/franc/maperf.org/console-maperf.html), [`assets/js/barometre-engine.js`](file:///c:/Users/franc/maperf.org/assets/js/barometre-engine.js) | `state.publicationCOS = false` par défaut ; bandeau `#dash-benchmark-notice` et mention explicite dans `#panel-consolidation` | Test QA automatisé vérifiant `state.publicationCOS === false` et le texte dans `console-maperf.html` | **vérifié** |
| **§10** Console Équipe MAPERF (3 exercices + variation) | Afficher les 3 exercices (`2023`, `2024`, `2025`) et la colonne `Variation` dans la grille de revue, avec filtres, tri et intitulés de boutons courts | [`console-maperf.html`](file:///c:/Users/franc/maperf.org/console-maperf.html), [`assets/js/barometre-engine.js`](file:///c:/Users/franc/maperf.org/assets/js/barometre-engine.js) | Fonction `computeVariationInfo` avec badge d'alerte si variation $> 50\,\%$, sélecteur `#validation-sort-select`, boutons *Valider le lot* et *Homologuer le dossier* | Test QA automatisé sur `computeVariationInfo` | **vérifié** |
| **§10** Données de démonstration fictives | Remplacer les noms d'organisations par des noms manifestement fictifs | [`assets/js/barometre-data.js`](file:///c:/Users/franc/maperf.org/assets/js/barometre-data.js) | Dossiers renommés : *Entreprise publique A*, *Entreprise publique B*, *Entreprise privée A*, *Entreprise privée B* | Test QA automatisé sur `DATA.initialDossiers` | **vérifié** |
| **§11** Formulaires, billetterie et Loi n° 29-2019 | Consentement Loi n° 29-2019 non pré-coché ; distinction entre pré-inscription et paiement confirmé ; formulaires Trophées et Partenaires | [`inscription.html`](file:///c:/Users/franc/maperf.org/inscription.html), [`trophees.html`](file:///c:/Users/franc/maperf.org/trophees.html), [`partenaires.html`](file:///c:/Users/franc/maperf.org/partenaires.html) | Cases de consentement non pré-cochées (`required`), récapitulatif horodaté distinguant demande d'inscription et paiement confirmé | Vérification DOM et formulaires | **démonstration** (*passerelle de paiement en attente de choix comité*) |

---

## 3. Charte web synthétique (1 page)

La charte web synthétique est également intégrée et consultable directement sur le site à l'adresse [`mentions-legales.html#charte-web`](file:///c:/Users/franc/maperf.org/mentions-legales.html).

### 3.1. Palette chromatique et contrastes (WCAG 2.1 AA)
- **Bleu marine institutionnel (Dominante)** : `#00236D` / `#0B2341` — utilisé pour les bandeaux d'en-tête, pieds de page, titres principaux et cartes d'autorité. Texte blanc `#FFFFFF` (ratio de contraste $> 12:1$).
- **Orange dynamique (Action principale / Événement)** : `#F39A1E` — utilisé pour le bouton d'inscription (`S'inscrire`), les accents de la Semaine MAPERF et le chevron central du logo.
- **Turquoise analytique (Baromètre & Espace Entreprise)** : `#2CC3A0` — utilisé pour le bouton `Espace Entreprise`, les indicateurs vérifiés et le chevron supérieur du logo. Sur fond clair, utiliser la variante assombrie `#0E6A53` pour les textes.
- **Or institutionnel (Distinctions & Trophées)** : `#F6C332` — utilisé pour les insignes sur fond bleu marine et le chevron inférieur du logo.
- **Fonds et surfaces** : Fond de page `#F4F7FA`, cartes blanches `#FFFFFF`, bordures `#E2E8F0`, texte principal `#0F1E33`, texte secondaire `#475569`.

### 3.2. Typographie et règles éditoriales
- **Titres (`font-display`)** : *Plus Jakarta Sans* (graisses 700 et 800), capitalisation à la française (majuscule uniquement au premier mot et aux noms propres), conjonction **« et »** en toutes lettres (aucune esperluette `&` dans les titres et libellés).
- **Corps de texte (`font-sans`)** : *DM Sans* (graisses 400 à 600), taille comprise entre **14 px (`0.875rem`) et 16 px (`1rem`)** sur le site public.
- **Données chiffrées et tableaux du portail (`font-mono`)** : *JetBrains Mono* avec `font-variant-numeric: tabular-nums`. Taille minimale stricte de **13 px (`0.8125rem`)** dans l'ensemble du portail du Baromètre (`#barometre-app-root` / `.portal-scope`).

### 3.3. Logos, iconographie et composants
- **Logos MAPERF** :
  - Sur fond clair (en-tête) : [`assets/images/logo-maperf-light.svg`](file:///c:/Users/franc/maperf.org/assets/images/logo-maperf-light.svg).
  - Sur fond sombre (pied de page, bandeaux marine) : [`assets/images/logo-maperf-dark.svg`](file:///c:/Users/franc/maperf.org/assets/images/logo-maperf-dark.svg).
- **Logos partenaires** : Affichés par catégorie dans des conteneurs `.partner-logo-box` de hauteur uniforme (`88 px`) avec `object-fit: contain`, sans rognage ni déformation.
- **Portraits d'intervenants** : Conteneurs `.speaker-portrait-frame` homothétiques (`112 × 112 px`, `border-radius: 1rem`, `object-fit: cover`).
- **Accessibilité tactile et clavier** : Hauteur minimale de **44 px** sur tous les boutons, onglets et champs de formulaire ; anneau de focus visible (`outline: 2px solid #F39A1E`).

---

## 4. Résultats des vérifications techniques et fonctionnelles

La suite de tests automatisés [`tests/barometre-qa.test.js`](file:///c:/Users/franc/maperf.org/tests/barometre-qa.test.js) exécute **22 groupes de vérifications** couvrant le modèle mathématique, l'ergonomie V2, l'architecture des pages et la sécurité :

```text
================================================================================
 MAPERF 2027 — SUITE DE TESTS QA V2 (REVUE MAQUETTE V2.0 & TDR BAROMÈTRE 2027)
================================================================================
1. VÉRIFICATION DES CONTENUS DE RÉFÉRENCE CENTRALISÉS (REVUE V2 §6) : 2/2 PASS
2. VÉRIFICATION DU MODÈLE MÉTHODOLOGIQUE (TDR §6 & REVUE V2 §7/§10) : 4/4 PASS
3. VÉRIFICATION DU MOTEUR V2 (SCORING, PROGRESSION, VARIATION, CONTRADICTOIRE) : 9/9 PASS
4. VÉRIFICATION DE L'ARBORESCENCE V2 & SÉPARATION DES 3 ESPACES : 7/7 PASS
================================================================================
 RÉSULTAT GLOBAL QA V2 : 22 réussis, 0 échoués
================================================================================
```

---

## 5. Contenus, documents et décisions restant attendus du comité

Conformément à la règle de rigueur éditoriale (*aucun horaire, tarif, intervenant, biographie ou règle non validés ne doivent être inventés*), les éléments suivants ont été identifiés et balisés dans [`assets/js/maperf-config.js`](file:///c:/Users/franc/maperf.org/assets/js/maperf-config.js) :

### 5.1. Documents cités dans la revue mais absents du dépôt Git
1. **`Plan d'action et de communication de la Semaine MAPERF 2027 (version 2.0)`** : cité comme source dans la revue v2.0, mais non présent sous forme de fichier autonome dans `assets/docs/` (seules les informations citées dans la revue v2.0 ont été intégrées).
2. **`Charte graphique MAPERF` (document source complet)** : citée dans la revue v2.0, absente de `assets/docs/`. Une charte web synthétique d'une page a été rédigée et intégrée au projet.

### 5.2. Décisions et contenus attendus du comité d'organisation et du COS
1. **Thème officiel définitif de la Semaine MAPERF 2027** et **horaires précis** d'ouverture et de clôture des journées des 16, 17 et 18 juin 2027 (le compte à rebours est configuré en jours uniquement jusqu'à communication de l'heure officielle).
2. **Tarifs et modalités d'accès des journées du 16 juin (Journée des entrepreneurs) et du 18 juin (Masterclass)** : seul le tarif du 17 juin (**50 000 FCFA**) est arrêté dans la revue.
3. **Barème financier des formules de partenariat (Diamond, Or, Argent et complémentaires)** : les contreparties de visibilité sont structurées dans [`partenaires.html`](file:///c:/Users/franc/maperf.org/partenaires.html), mais les montants en FCFA sont marqués comme communicables sur dossier officiel après validation du comité.
4. **Notice biographique officielle et portrait photographique de M. Denis Charles Kouassi** (Grand témoin des 17 et 18 juin 2027), ainsi que la liste nominative complète des panélistes 2027 et des membres du jury des Trophées.
5. **Identité nominative et photographie validée du lauréat du Trophée du Manager de la Performance 2025** (les photos officielles de remise en présence du Ministre délégué M. Luc Joseph Okio sont intégrées dans [`retour-2025.html`](file:///c:/Users/franc/maperf.org/retour-2025.html), sans nom inventé).
6. **Accords écrits des partenaires institutionnels pour l'édition 2027** (distinction maintenue entre le patronage ministériel 2025 acquis et les partenaires 2027).
7. **Arbitrage du Comité d'orientation scientifique (COS) sur le périmètre de saisie en ligne** : confirmer si le formulaire web en production doit embarquer l'intégralité des **103 données (Public) / 104 données (Privé)** des classeurs Excel ou conserver la saisie hybride (24 indicateurs clés en ligne + téléversement du classeur Excel complet).

---

## 6. Distinction entre fonctionnalités de démonstration (Maquette V2) et fonctionnalités connectées

| Module / Fonctionnalité | État actuel dans la Maquette V2 | Comportement réel attendu en production connectée |
| :--- | :--- | :--- |
| **Navigation, pages publiques, calcul de l'Indice MAPERF (0–100) et contrôles de cohérence OHADA** | **Fonctionnel à 100 %** (exécuté en temps réel) | Identique, avec double validation côté serveur (API / Edge Functions) |
| **Sauvegarde des dossiers Entreprise et journal d'audit** | **Démonstration locale** (`localStorage` du navigateur avec indicateur explicite *« Enregistré dans le navigateur »*) | Persistance chiffrée dans PostgreSQL / Supabase (`dossiers_barometre`, `valeurs_indicateurs`, `journal_audit`) |
| **Authentification Espace Entreprise et Console Équipe MAPERF** | **Démonstration locale** par codes standards (`Entreprise2027` et `Maperf2027`) | Authentification nominative Supabase Auth / JWT avec MFA, rôles RBAC (`POINT_FOCAL`, `VERIFICATEUR_MAPERF`, `MEMBRE_COS`) et politiques RLS par entreprise |
| **Dépôt et prévisualisation des pièces justificatives** | **Démonstration locale** (glisser-déposer, lecture des métadonnées et aperçu instantané dans le navigateur) | Téléversement sécurisé vers un compartiment objet privé (Supabase Storage / S3) avec contrôle antivirus, hachage SHA-256 et URL signées temporaires |
| **Formulaires d'inscription (16–18 juin), de candidature aux Trophées et de partenariat** | **Démonstration front-end** avec validation des champs, consentement Loi n° 29-2019 et accusé de réception simulé (+ script [`send_inscription.php`](file:///c:/Users/franc/maperf.org/send_inscription.php) prêt pour hébergement PHP) | Enregistrement en base de données, envoi transactionnel d'e-mails (SMTP / Resend) et redirection vers la passerelle de paiement (Mobile Money / Carte bancaire) pour la billetterie du 17 juin |

---

## 7. Plan technique de mise en production (Architecture cible)

1. **Base de données et sécurité multi-locataires (PostgreSQL / Supabase)** :
   - La migration SQL complète est prête dans [`supabase/migrations/20270101000000_maperf_barometre_2027.sql`](file:///c:/Users/franc/maperf.org/supabase/migrations/20270101000000_maperf_barometre_2027.sql).
   - Activation des politiques **Row-Level Security (RLS)** garantissant qu'un Point focal ne peut lire et modifier que le dossier de son entreprise, et que la table de correspondance identité ↔ code anonyme (`PUB-2027-xxx` / `PRI-2027-xxx`) est isolée des analystes lors de la consolidation.
2. **Stockage documentaire et conformité Loi n° 29-2019 (République du Congo)** :
   - Compartiment privé pour les états financiers OHADA, bilans sociaux et déclarations CNSS.
   - Tâche planifiée (cron) de purge automatique des pièces justificatives brutes **90 jours après l'homologation du rapport annuel par le COS**, ne conservant que les empreintes SHA-256 et les scores agrégés anonymisés.
3. **Billetterie et paiement sécurisé (Journée du 17 juin — 50 000 FCFA)** :
   - Intégration d'un prestataire de paiement opérant en République du Congo (MTN Mobile Money, Airtel Money, Visa/Mastercard ou virement bancaire avec validation par le secrétariat) via webhook signé mettant à jour le statut du billet de `PRE_INSCRIPTION` à `PAIEMENT_CONFIRME` et générant le badge QR nominatif.
4. **Déploiement continu (CI/CD)** :
   - Le pipeline GitHub Actions [`.github/workflows/maperf-ci-qa.yml`](file:///c:/Users/franc/maperf.org/.github/workflows/maperf-ci-qa.yml) exécute automatiquement la suite [`tests/barometre-qa.test.js`](file:///c:/Users/franc/maperf.org/tests/barometre-qa.test.js) à chaque `push` avant déploiement sur Vercel (`https://maperf.vercel.app/`).
