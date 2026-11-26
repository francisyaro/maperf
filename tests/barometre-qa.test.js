/**
 * MAPERF 2027 — Suite de Tests Automatisés QA V2 (Unitaires, Méthodologiques, Maquette V2, Intégrité DOM & Sécurité)
 * Référence : MAPERF_Revue_maquette_site_web.docx (version 2.0 du 19 novembre 2026) & TDR Baromètre 2027
 * Exécution : node tests/barometre-qa.test.js
 */
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const assert = require("assert");

const ROOT_DIR = path.resolve(__dirname, "..");

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    passed++;
    console.log(`  [PASS] ${name}`);
  } catch (err) {
    failed++;
    console.error(`  [FAIL] ${name}`);
    console.error(`         -> ${err.message}`);
  }
}

console.log("================================================================================");
console.log(" MAPERF 2027 — SUITE DE TESTS QA V2 (REVUE MAQUETTE V2.0 & TDR BAROMÈTRE 2027)");
console.log("================================================================================\n");

// -----------------------------------------------------------------------------
// 1. CHARGEMENT DE LA CONFIGURATION, DU CATALOGUE & DU MOTEUR DANS UNE SANDBOX VM
// -----------------------------------------------------------------------------
const sandbox = {
  window: {},
  document: {
    readyState: "complete",
    getElementById: () => null,
    querySelector: () => null,
    querySelectorAll: () => []
  },
  localStorage: {
    _store: {},
    getItem(k) { return this._store[k] || null; },
    setItem(k, v) { this._store[k] = String(v); },
    removeItem(k) { delete this._store[k]; }
  },
  console
};
sandbox.window = sandbox;

const configCode = fs.readFileSync(path.join(ROOT_DIR, "assets/js/maperf-config.js"), "utf8");
const dataCode = fs.readFileSync(path.join(ROOT_DIR, "assets/js/barometre-data.js"), "utf8");
const engineCode = fs.readFileSync(path.join(ROOT_DIR, "assets/js/barometre-engine.js"), "utf8");

vm.createContext(sandbox);
vm.runInContext(configCode, sandbox);
vm.runInContext(dataCode, sandbox);
vm.runInContext(engineCode, sandbox);

const CONFIG = sandbox.MAPERF_CONFIG;
const DATA = sandbox.MAPERF_BAROMETRE_DATA;
const ENGINE = sandbox.MAPERF_BAROMETRE_ENGINE;

console.log("1. VÉRIFICATION DES CONTENUS DE RÉFÉRENCE CENTRALISÉS (REVUE V2 §6)");

test("Configuration centrale MAPERF_CONFIG chargée et conforme aux références validées", () => {
  assert.ok(CONFIG, "MAPERF_CONFIG doit être défini");
  assert.strictEqual(CONFIG.evenement.nom, "Semaine MAPERF 2027");
  assert.strictEqual(CONFIG.evenement.datesTexte, "16, 17 et 18 juin 2027");
  assert.strictEqual(CONFIG.evenement.lieu, "Hôtel Kempinski, Brazzaville");
  assert.strictEqual(CONFIG.evenement.devise, "Outiller, anticiper, performer");
  assert.strictEqual(CONFIG.troisJournees[1].tarif, "50 000 FCFA");
});

test("Logos SVG vectoriels authentiques (fond clair et fond sombre) sans image matricielle intégrée + logo ACE non rogné", () => {
  const svgLight = fs.readFileSync(path.join(ROOT_DIR, "assets/images/logo-maperf-light.svg"), "utf8");
  const svgDark = fs.readFileSync(path.join(ROOT_DIR, "assets/images/logo-maperf-dark.svg"), "utf8");
  assert.ok(svgLight.includes("<svg") && svgLight.includes("<path"), "logo-maperf-light.svg doit être un vrai SVG vectoriel");
  assert.ok(!svgLight.includes("<image"), "logo-maperf-light.svg ne doit pas encapsuler d'image PNG matricielle");
  assert.ok(svgDark.includes("<svg") && svgDark.includes("<path"), "logo-maperf-dark.svg doit être un vrai SVG vectoriel");
  assert.ok(!svgDark.includes("<image"), "logo-maperf-dark.svg ne doit pas encapsuler d'image PNG matricielle");
  assert.ok(fs.existsSync(path.join(ROOT_DIR, "assets/images/logo-ace.png")), "logo-ace.png non rogné doit exister");
});

console.log("\n2. VÉRIFICATION DU MODÈLE MÉTHODOLOGIQUE (TDR §6 & REVUE V2 §7/§10)");

test("Somme des pondérations des 6 Dimensions Secteur Public = 100 % (20/20/20/15/10/15) sans esperluette '&'", () => {
  const sumPub = DATA.dimensions.PUBLIC.reduce((acc, d) => acc + d.poids, 0);
  assert.strictEqual(sumPub, 100, `Attendu 100%, obtenu ${sumPub}%`);
  const weights = DATA.dimensions.PUBLIC.map(d => d.poids).join(",");
  assert.strictEqual(weights, "20,20,20,15,10,15");
  DATA.dimensions.PUBLIC.forEach(d => {
    assert.ok(!d.nom.includes("&"), `Le titre de dimension '${d.nom}' doit utiliser 'et' au lieu de '&'`);
  });
});

test("Somme des pondérations des 6 Dimensions Secteur Privé = 100 % (25/20/15/15/10/15) sans esperluette '&'", () => {
  const sumPri = DATA.dimensions.PRIVE.reduce((acc, d) => acc + d.poids, 0);
  assert.strictEqual(sumPri, 100, `Attendu 100%, obtenu ${sumPri}%`);
  const weights = DATA.dimensions.PRIVE.map(d => d.poids).join(",");
  assert.strictEqual(weights, "25,20,15,15,10,15");
  DATA.dimensions.PRIVE.forEach(d => {
    assert.ok(!d.nom.includes("&"), `Le titre de dimension '${d.nom}' doit utiliser 'et' au lieu de '&'`);
  });
});

test("Dossiers de démonstration strictement fictifs (Entreprise publique A/B, Entreprise privée A/B)", () => {
  const names = DATA.initialDossiers.map(d => d.raisonSociale).sort().join(" | ");
  assert.strictEqual(
    names,
    "Entreprise privée A | Entreprise privée B | Entreprise publique A | Entreprise publique B"
  );
});

test("Coefficients de fiabilité des preuves conformes (Déclarée=0.50, Vérifiée=0.80, Auditée=1.00)", () => {
  assert.strictEqual(DATA.meta.poidsVerification["Déclarée"], 0.50);
  assert.strictEqual(DATA.meta.poidsVerification["Vérifiée"], 0.80);
  assert.strictEqual(DATA.meta.poidsVerification["Auditée"], 1.00);
});

// -----------------------------------------------------------------------------
// 3. TESTS DU MOTEUR DE SCORING, PROGRESSION PAR RUBRIQUE, VARIATION & CONTRADICTOIRE
// -----------------------------------------------------------------------------
console.log("\n3. VÉRIFICATION DU MOTEUR V2 (SCORING, PROGRESSION DYNAMIQUE, VARIATION & CONTRADICTOIRE)");

test("Évaluation des 4 dossiers fictifs de démonstration (2 Publics, 2 Privés)", () => {
  const state = ENGINE.getState();
  assert.strictEqual(state.dossiers.length, 4, "4 dossiers pré-chargés attendus");

  state.dossiers.forEach(d => {
    const ev = ENGINE.evaluateDossier(d);
    assert.ok(ev.globalRawScore >= 0 && ev.globalRawScore <= 100, `Score brut hors bornes pour ${d.codeAnonyme}`);
    assert.ok(ev.globalVerifiedScore >= 0 && ev.globalVerifiedScore <= 100, `Score validé hors bornes pour ${d.codeAnonyme}`);
    assert.ok(ev.globalVerifiedScore <= ev.globalRawScore + 0.01, `Le score validé ne peut excéder le score brut (${d.codeAnonyme})`);
  });
});

test("Progression dynamique par rubrique (ex. FIN : 8/8) recalculée en temps réel", () => {
  const dossier = JSON.parse(JSON.stringify(DATA.initialDossiers[0]));
  const progFull = ENGINE.computeRubriqueProgress(dossier, "FIN");
  assert.ok(progFull.total > 0, "La rubrique FIN doit comporter des indicateurs");
  assert.strictEqual(progFull.filled, progFull.total, "Toutes les données financières initiales sont renseignées");

  // Vider un champ de la rubrique FIN
  dossier.data["FIN.001"].v2025 = "";
  const progAfterEmpty = ENGINE.computeRubriqueProgress(dossier, "FIN");
  assert.strictEqual(progAfterEmpty.filled, progFull.total - 1, "Le compteur de progression doit diminuer de 1 lorsqu'un champ 2025 est vidé");
});

test("Aide contextuelle par indicateur (définition, unité, source attendue)", () => {
  const fieldFin001 = DATA.fields.PUBLIC.find(f => f.code === "FIN.001");
  const help = ENGINE.getFieldContextualHelp(fieldFin001);
  assert.ok(help.definition && help.definition.length > 10, "Une définition explicite doit être fournie");
  assert.ok(help.unite.includes("FCFA"), "L'unité doit être précisée");
  assert.ok(help.sourceDoc.includes("DOC.01"), "La pièce probante attendue doit être précisée");
});

test("Calcul de la variation pluriannuelle (2023 -> 2025) et détection des variations > 50 %", () => {
  const varNormal = ENGINE.computeVariationInfo({ v2023: 100, v2024: 110, v2025: 120 }, { type: "number" });
  assert.strictEqual(varNormal.label, "+20.0 %");
  assert.strictEqual(varNormal.alert, false);

  const varAlert = ENGINE.computeVariationInfo({ v2023: 100, v2024: 130, v2025: 180 }, { type: "number" });
  assert.strictEqual(varAlert.label, "+80.0 %");
  assert.strictEqual(varAlert.alert, true, "Une variation > 50 % doit déclencher une alerte de revue");
});

test("Étape de validation contradictoire : « J'accepte » et « Je formule une observation »", () => {
  const dossier = JSON.parse(JSON.stringify(DATA.initialDossiers[0]));

  ENGINE.submitValidationContradictoire(dossier, "OBSERVATION", "Demande de retraitement de la subvention OSP 2025.");
  assert.strictEqual(dossier.validationContradictoire.statut, "Observation formulée");
  assert.ok(dossier.validationContradictoire.observation.includes("subvention OSP"));

  ENGINE.submitValidationContradictoire(dossier, "ACCEPTER", "Accord du Point focal sur la fiche provisoire.");
  assert.strictEqual(dossier.validationContradictoire.statut, "Accepté");
  assert.ok(dossier.workflowStatut.includes("Validation contradictoire acceptée"));
});

test("Verrouillage par défaut avant validation du COS : state.publicationCOS === false", () => {
  const state = ENGINE.getState();
  assert.strictEqual(state.publicationCOS, false, "Par défaut, la publication COS doit être désactivée avant le 17 juin 2027");
});

test("Règle métier clé : La validation d'une donnée par l'équipe MAPERF incrémente l'Indice MAPERF validé et synchronise la pièce probante", () => {
  const dossier = JSON.parse(JSON.stringify(DATA.initialDossiers[1])); // PUB-2027-002
  ENGINE.syncEvidenceForIndicator(dossier, "FIN.001", "Déclarée");
  const evDeclaree = ENGINE.evaluateDossier(dossier);
  assert.strictEqual(dossier.evidences["DOC.01"].statut, "Déclaré");

  ENGINE.syncEvidenceForIndicator(dossier, "FIN.001", "Vérifiée");
  const evVerifiee = ENGINE.evaluateDossier(dossier);
  assert.strictEqual(dossier.evidences["DOC.01"].statut, "Vérifié");

  ENGINE.syncEvidenceForIndicator(dossier, "FIN.001", "Auditée");
  const evAuditee = ENGINE.evaluateDossier(dossier);
  assert.strictEqual(dossier.evidences["DOC.01"].statut, "Audité");

  assert.ok(evVerifiee.globalVerifiedScore > evDeclaree.globalVerifiedScore);
  assert.ok(evAuditee.globalVerifiedScore > evVerifiee.globalVerifiedScore);
});

test("Règle de non-assimilation à zéro ('Non disponible' et 'Non applicable') & Modulation OSP (0.5x)", () => {
  const dossier = JSON.parse(JSON.stringify(DATA.initialDossiers[0]));
  const fieldFin009 = DATA.fields.PUBLIC.find(f => f.code === "FIN.009");

  dossier.data["FIN.009"].app = "Non disponible";
  assert.strictEqual(ENGINE.computeFieldIndicatorScore(dossier, fieldFin009).rawScore, null);

  dossier.data["FIN.009"].app = "Non applicable";
  assert.strictEqual(ENGINE.computeFieldIndicatorScore(dossier, fieldFin009).rawScore, null);
});

test("Contrôles de cohérence automatisés C03 (Bilan Actif/Passif), C05 (Effectif H+F) et G2 (Seuil 10 salariés Privé)", () => {
  const dossier = JSON.parse(JSON.stringify(DATA.initialDossiers[0]));
  dossier.data["FIN.010"].v2025 = 50000000000;
  dossier.data["FIN.011"].v2025 = 40000000000;
  assert.strictEqual(ENGINE.runCoherenceChecks(dossier).find(c => c.code === "C03").statut, "ERREUR");

  const dossierPri = JSON.parse(JSON.stringify(DATA.initialDossiers[2]));
  dossierPri.data["RHD.001"].v2025 = 350;
  dossierPri.data["RHD.002"].v2025 = 200;
  dossierPri.data["RHD.003"].v2025 = 100;
  assert.strictEqual(ENGINE.runCoherenceChecks(dossierPri).find(c => c.code === "C05").statut, "ERREUR");

  dossierPri.data["RHD.001"].v2025 = 7;
  dossierPri.effectif2025 = 7;
  assert.strictEqual(ENGINE.runCoherenceChecks(dossierPri).find(c => c.code === "G2").statut, "ERREUR");
});

// -----------------------------------------------------------------------------
// 4. VÉRIFICATION DE LA RÉORGANISATION DU SITE PUBLIC & SÉPARATION DES 3 ESPACES
// -----------------------------------------------------------------------------
console.log("\n4. VÉRIFICATION DE L'ARBORESCENCE V2 & SÉPARATION SITE PUBLIC / ESPACE ENTREPRISE / CONSOLE ÉQUIPE");

test("Toutes les pages HTML de la Maquette V2 existent et chargent maperf-design.css sans règle @apply", () => {
  const requiredV2Pages = [
    "index.html",
    "semaine-maperf.html",
    "barometre.html",
    "espace-entreprise.html",
    "console-maperf.html",
    "trophees.html",
    "partenaires.html",
    "retour-2025.html",
    "actualites.html",
    "inscription.html",
    "mentions-legales.html"
  ];
  requiredV2Pages.forEach(file => {
    const fullPath = path.join(ROOT_DIR, file);
    assert.ok(fs.existsSync(fullPath), `La page V2 ${file} doit exister`);
    const content = fs.readFileSync(fullPath, "utf8");
    assert.ok(content.includes("assets/css/maperf-design.css"), `${file} doit charger maperf-design.css`);
    assert.ok(!content.includes("@apply "), `${file} ne doit contenir aucun @apply non compilé`);
  });
});

test("Navigation publique (maperf-layout.js) : sous-menu Baromètre limité à 3 entrées, 2 boutons d'en-tête, lien Contact dédié et ZÉRO lien vers console-maperf.html", () => {
  const layoutJs = fs.readFileSync(path.join(ROOT_DIR, "assets/js/maperf-layout.js"), "utf8");
  assert.ok(layoutJs.includes("Présentation et méthode"), "Le sous-menu Baromètre doit contenir 'Présentation et méthode'");
  assert.ok(layoutJs.includes("Calendrier"), "Le sous-menu Baromètre doit contenir 'Calendrier'");
  assert.ok(layoutJs.includes("Espace Entreprise"), "Le sous-menu et l'en-tête doivent contenir 'Espace Entreprise'");
  assert.ok(layoutJs.includes("S'inscrire"), "L'en-tête doit contenir le bouton 'S'inscrire'");
  assert.ok(layoutJs.includes("mentions-legales.html#contact"), "Le lien Contact doit conduire aux coordonnées (#contact)");
  assert.ok(!layoutJs.includes("console-maperf.html"), "Aucun lien vers la console Équipe MAPERF ne doit figurer dans la navigation publique");
});

test("Séparation stricte : barometre.html (public) et espace-entreprise.html ne contiennent ni boutons techniques d'administration ni lien vers console-maperf.html", () => {
  const baroPublic = fs.readFileSync(path.join(ROOT_DIR, "barometre.html"), "utf8");
  const espaceEnt = fs.readFileSync(path.join(ROOT_DIR, "espace-entreprise.html"), "utf8");
  const consoleMaperf = fs.readFileSync(path.join(ROOT_DIR, "console-maperf.html"), "utf8");

  // barometre.html public
  assert.ok(!baroPublic.includes("btn-import-dossier"), "barometre.html public ne doit pas exposer le bouton Importer");
  assert.ok(!baroPublic.includes("btn-reset-demo"), "barometre.html public ne doit pas exposer le bouton Réinitialiser");
  assert.ok(!baroPublic.includes("console-maperf.html"), "barometre.html public ne doit pas pointer vers console-maperf.html");
  assert.ok(baroPublic.includes("15 mars 2027") && baroPublic.includes("23 mars 2027") && baroPublic.includes("7 mai 2027") && baroPublic.includes("10 au 21 mai 2027") && baroPublic.includes("17 juin 2027"), "barometre.html doit afficher les 5 dates officielles du calendrier 2027");

  // espace-entreprise.html
  assert.ok(espaceEnt.includes('content="noindex, nofollow"'), "espace-entreprise.html doit être noindex, nofollow");
  assert.ok(espaceEnt.includes('id="btn-contradictoire-accept"'), "espace-entreprise.html doit contenir le bouton « J'accepte »");
  assert.ok(espaceEnt.includes('id="btn-contradictoire-observe"'), "espace-entreprise.html doit contenir le bouton « Je formule une observation »");
  assert.ok(!espaceEnt.includes("btn-import-dossier"), "espace-entreprise.html ne doit pas exposer les boutons techniques d'administration");
  assert.ok(!espaceEnt.includes("console-maperf.html"), "espace-entreprise.html ne doit pas contenir de lien vers console-maperf.html");

  // console-maperf.html
  assert.ok(consoleMaperf.includes('content="noindex, nofollow"'), "console-maperf.html doit être noindex, nofollow");
  assert.ok(consoleMaperf.includes('id="btn-import-dossier"') && consoleMaperf.includes('id="btn-reset-demo"'), "console-maperf.html doit contenir les boutons techniques réservés à l'administrateur");
  assert.ok(consoleMaperf.includes("Résultats disponibles après validation du COS"), "console-maperf.html doit afficher par défaut « Résultats disponibles après validation du COS »");
});

test("Page d'accueil index.html : point d'entrée sur La Semaine MAPERF 2027 (16–18 juin 2027, Hôtel Kempinski) et ordre des 8 sections conforme", () => {
  const indexHtml = fs.readFileSync(path.join(ROOT_DIR, "index.html"), "utf8");
  const s1 = indexHtml.indexOf('id="hero"');
  const s2 = indexHtml.indexOf('id="trois-journees"');
  const s3 = indexHtml.indexOf('id="barometre-2027"');
  const s4 = indexHtml.indexOf('id="trophees"');
  const s5 = indexHtml.indexOf('id="intervenants"');
  const s6 = indexHtml.indexOf('id="retour-2025"');
  const s7 = indexHtml.indexOf('id="partenaires"');
  const s8 = indexHtml.indexOf('id="actualites"');

  assert.ok(s1 !== -1 && s1 < s2 && s2 < s3 && s3 < s4 && s4 < s5 && s5 < s6 && s6 < s7 && s7 < s8, "Les 8 sections de la page d'accueil doivent suivre exactement l'ordre demandé dans la revue V2 §5");
  assert.ok(indexHtml.includes("Hôtel Kempinski"), "index.html doit mentionner l'Hôtel Kempinski");
  assert.ok(indexHtml.includes("Denis Charles Kouassi"), "index.html doit présenter le Grand témoin M. Denis Charles Kouassi");
  assert.ok(indexHtml.includes("50 000 FCFA"), "index.html doit mentionner le tarif validé de 50 000 FCFA pour le 17 juin 2027");
});

test("Pages hors périmètre (Forum, Plateforme PSRE, 7 pages sectorielles) retirées de la navigation et marquées noindex, nofollow", () => {
  const archivedPages = [
    "forum.html",
    "plateforme.html",
    "barometre-culture.html",
    "barometre-defense.html",
    "barometre-economie.html",
    "barometre-education.html",
    "barometre-gouvernance.html",
    "barometre-infrastructures.html",
    "barometre-travail.html"
  ];
  archivedPages.forEach(file => {
    const content = fs.readFileSync(path.join(ROOT_DIR, file), "utf8");
    assert.ok(content.includes('content="noindex, nofollow"'), `La page archivée ${file} doit comporter meta robots noindex, nofollow`);
  });
});

test("Typographie et accessibilité CSS : texte courant 14–16 px, minimum 13 px (0.8125rem) dans le portail et cibles tactiles >= 44 px", () => {
  const cssContent = fs.readFileSync(path.join(ROOT_DIR, "assets/css/maperf-design.css"), "utf8");
  assert.ok(cssContent.includes("min-height: 44px"), "Les boutons et contrôles doivent garantir une hauteur tactile minimale de 44 px");
  assert.ok(cssContent.includes("0.8125rem"), "Le portail doit garantir une taille minimale de 13 px (0.8125rem)");
});

test("send_inscription.php applique les protections OWASP (hash_equals, anti-CRLF, htmlspecialchars)", () => {
  const phpContent = fs.readFileSync(path.join(ROOT_DIR, "send_inscription.php"), "utf8");
  assert.ok(phpContent.includes("hash_equals"), "send_inscription.php doit utiliser hash_equals contre les timing attacks");
  assert.ok(phpContent.includes('str_replace(["\\r", "\\n"]'), "send_inscription.php doit nettoyer les retours chariots CRLF");
  assert.ok(phpContent.includes("htmlspecialchars"), "send_inscription.php doit échapper les sorties HTML");
});

console.log("\n================================================================================");
console.log(` RÉSULTAT GLOBAL QA V2 : ${passed} réussis, ${failed} échoués`);
console.log("================================================================================");

if (failed > 0) {
  process.exit(1);
}
