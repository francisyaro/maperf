# Dossier d'Ingénierie Multidisciplinaire — Plateforme & Baromètre MAPERF 2027

**Édition :** 2e Édition — Les Journées de la Performance (17 juin 2027, Hilton Brazzaville Les Tours Jumelles)  
**Co-initiateurs :** Owando Consulting · ACE · Agence Ambition  
**Référentiels intégrés :**
- `01_TDR_Barometre_MAPERF_2027.pdf`
- `Cahier_des_charges_Plateforme_Barometre_MAPERF_2027.docx`
- `MAPERF_Barometre_Collecte_Secteur_Public.xlsx` (102 données, 92 indicateurs, 36 contrôles, 25 preuves)
- `MAPERF_Barometre_Collecte_Secteur_Prive_1.xlsx` (97 données, 89 indicateurs, 36 contrôles, 23 preuves)

---

## 1. PRODUCT & BUSINESS (Product Owner & Business Analyst Senior)

### 1.1 Vision Produit & Proposition de Valeur
- **Problème résolu :** Absence d'un dispositif national numérique, indépendant, méthodologiquement auditable et contradictoire permettant de mesurer la performance réelle des entreprises publiques et privées en République du Congo sur une base pluriannuelle (2023–2025).
- **Mécanisme clé d'incrémentation de valeur :**
  1. Chaque entreprise renseigne ses données financières, opérationnelles, de gouvernance, de transformation et de capital humain (`Déclarée` = coefficient de fiabilité **0,50**).
  2. L'entreprise joint ses pièces probantes (`DOC.01` à `DOC.25`).
  3. L'équipe technique MAPERF vérifie la cohérence et valide chaque donnée (`Vérifiée` = **0,80**, `Auditée / Certifiée` = **1,00**), ce qui **incrémente en temps réel le Taux de Performance Validé** et l'Indice de Fiabilité de l'entreprise.

### 1.2 Personas (ICP) & Jobs-to-be-Done (JTBD)
| Persona | Rôle Métier | Job-to-be-Done Principal | Critère de Succès Mesurable |
|---|---|---|---|
| **Point Focal Entreprise** (DAF, Dir. Stratégie/Audit) | Saisie & Dépôt de preuves | Renseigner les séries 2023–2025 sans erreur de cohérence et téléverser les preuves OHADA/CAC/CNSS. | Complétude $\ge 75\%$ globale ($\ge 70\%$ par dimension) et $0$ erreur bloquante. |
| **Dirigeant (DG / PCA)** | Validation & Benchmark | Signer l'engagement d'exactitude et obtenir la Fiche Individuelle Confidentielle face à son groupe homogène. | Réception de la fiche de restitution PDF/A et éligibilité aux Trophées du 17 juin 2027. |
| **Analyste Équipe MAPERF** | Revue contradictoire | Vérifier les preuves, ouvrir des demandes de précisions et faire passer les données à `Vérifiée` (80%) ou `Auditée` (100%). | Temps de revue réduit de 60%, traçabilité 100% dans l'Audit Trail. |
| **Comité Scientifique** | Homologation | Contrôler la rigueur méthodologique (modulation OSP $\times 0,5$, écart Pratiques–Résultats $> 25$ pts, seuils de publiabilité). | Zéro biais inter-sectoriel, anonymat préservé (`PUB-2027-NNN` / `PRI-2027-NNN`). |

### 1.3 Règles Métier Critiques Implémentées
1. **Non-assimilation du manquant à zéro :** Une donnée `Non disponible` ou `Non applicable` est exclue du dénominateur de pondération de sa dimension ; elle ne vaut jamais `0`.
2. **Modulation OSP ($\times 0,50$) :** Pour les entreprises publiques soumises à des Obligations de Service Public non intégralement compensées, le poids des indicateurs de rentabilité financière stricte (`FIN.007`, `FIN.008`, `FIN.009`) est modulé de $50\%$ au profit de la continuité et de la qualité de service.
3. **Alerte d'écart Pratiques – Résultats :** Si $|\text{Score Pratiques} - \text{Score Résultats}| > 25\text{ points}$, le moteur déclenche un signal automatique d'écart entre formalisme documentaire et performance réelle.
4. **Règle de publiabilité :**
   $$\text{Publiable} \iff \left(\forall d \in \{A..F\}, \text{Complétude}_d \ge 70\%\right) \land \left(\text{Complétude}_{\text{globale}} \ge 75\%\right) \land \left(\text{Fiabilité} \ge 50\%\right)$$

---

## 2. AUDIT DES BUGS CORRIGÉS SUR LA PLATEFORME EXISTANTE

| # | Sévérité | Fichier(s) affecté(s) | Anomalie identifiée (AS-IS) | Correction appliquée (TO-BE) |
|---|---|---|---|---|
| 1 | **Critique** | Toutes les pages (`index.html`, `plateforme.html`, `plateforme-2.html`, `forum.html`, `barometre-*.html`) | Utilisation de directives `@apply` dans des balises `<style>` standard sans `type="text/tailwindcss"`, ignorées par le CDN Tailwind (boutons `.tab`, `.card`, `.chip` cassés). | Création du Design System centralisé [`assets/css/maperf-design.css`](file:///c:/Users/franc/maperf.org/assets/css/maperf-design.css) avec variables CSS natives et polices officielles `Sora` & `Manrope`. |
| 2 | **Critique** | [`barometre.html`](file:///c:/Users/franc/maperf.org/barometre.html) | Ancien tableau statique sur la promulgation des lois, totalement déconnecté du TDR Baromètre MAPERF 2027 (Entreprises Publiques & Privées). | Refonte intégrale de [`barometre.html`](file:///c:/Users/franc/maperf.org/barometre.html) propulsée par [`barometre-data.js`](file:///c:/Users/franc/maperf.org/assets/js/barometre-data.js) et [`barometre-engine.js`](file:///c:/Users/franc/maperf.org/assets/js/barometre-engine.js) (4 espaces : Méthodologie 6 Dimensions, Collecte Entreprise 2023–2025, Console Validation Équipe MAPERF, Tableau de bord & Restitution 0–100). |
| 3 | **Majeure** | Toutes les pages | Absence totale de menu mobile (`hidden md:flex` cachait la navigation sur smartphone sans bouton hamburger) et incohérence des liens d'en-tête d'une page à l'autre. | Création du contrôleur [`assets/js/maperf-layout.js`](file:///c:/Users/franc/maperf.org/assets/js/maperf-layout.js) injectant un Header unifié, un **Méga-Menu Baromètre 2027**, un menu mobile responsive complet et un Footer institutionnel unifié. |
| 4 | **Majeure** | [`index.html`](file:///c:/Users/franc/maperf.org/index.html) | Casse incorrecte sur les photos des intervenants (`orateur-1.jpg` au lieu de `orateur-1.JPG`, provoquant des erreurs 404 sur serveur Linux/OVH), double chargement de `lucide`, et ancres `#trophees` / `#inscription` inexistantes. | Correction en `.JPG`, suppression du doublon script, ajout des sections `#barometre-2027`, `#trophees` et `#inscription`. |
| 5 | **Majeure** | [`send_inscription.php`](file:///c:/Users/franc/maperf.org/send_inscription.php) | Risque d'injection d'en-têtes SMTP (`CRLF` dans `$email` / `Reply-To`) et comparaison CSRF non constante. | Durcissement OWASP avec `hash_equals()`, neutralisation stricte des retours chariots `\r\n` et design de confirmation unifié. |
| 6 | **Moyenne** | Toutes les pages | Dates incohérentes ("MAPERF 2025", "Mars 2026"). | Alignement complet sur la **2e Édition — 17 juin 2027 (Hilton Brazzaville)** et la campagne de collecte **21 janvier – 19 mars 2027**. |

---

## 3. ARCHITECTURE CLOUD, SÉCURITÉ OWASP & ARCHIVAGE PDF/A (ISO 19005)

### 3.1 Architecture Base de Données & Sécurité (Supabase / PostgreSQL)
- Le schéma relationnel complet est livré dans [`supabase/migrations/20270101000000_maperf_barometre_2027.sql`](file:///c:/Users/franc/maperf.org/supabase/migrations/20270101000000_maperf_barometre_2027.sql) :
  - **Cloisonnement Multi-Tenant (RLS) :** Chaque Point Focal ne peut lire/écrire que les lignes `metric_entries` et `evidence_documents` associées à son `organization_id`. Seuls les rôles `ANALYSTE_MAPERF`, `MEMBRE_COMITE_SCIENTIFIQUE` et `ADMIN_SECRETARIAT_TECHNIQUE` disposent d'une vue transversale.
  - **Intégrité Cryptographique des Preuves :** Chaque pièce justificative téléversée (`DOC.01` à `DOC.25`) est associée à son empreinte `sha256_hash` et à un indicateur de conformité archivistique `is_pdfa_compliant` (ISO 19005-1/2 PDF/A-1b ou PDF/A-2b) pour garantir sa lisibilité et sa valeur probante sur 10 ans.
  - **Auditabilité Immuable :** Toute modification d'une valeur ou d'un statut de vérification (`Déclarée` $\rightarrow$ `Vérifiée` $\rightarrow$ `Auditée`) est journalisée dans `audit_logs` avec l'identifiant de l'analyste, l'horodatage et le delta d'impact sur le score.
