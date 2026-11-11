/**
 * MAPERF 2027 — Suite de Tests Automatisés QA (Unitaires, Méthodologiques, Intégrité DOM & Sécurité)
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
console.log(" MAPERF 2027 — SUITE DE TESTS QA & CONFORMITÉ MÉTHODOLOGIQUE (TDR & CDC 2027)");
console.log("================================================================================\n");

// -----------------------------------------------------------------------------
// 1. CHARGEMENT DU CATALOGUE & DU MOTEUR BAROMÈTRE DANS UNE SANDBOX VM
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

const dataCode = fs.readFileSync(path.join(ROOT_DIR, "assets/js/barometre-data.js"), "utf8");
const engineCode = fs.readFileSync(path.join(ROOT_DIR, "assets/js/barometre-engine.js"), "utf8");

vm.createContext(sandbox);
vm.runInContext(dataCode, sandbox);
vm.runInContext(engineCode, sandbox);

const DATA = sandbox.MAPERF_BAROMETRE_DATA;
const ENGINE = sandbox.MAPERF_BAROMETRE_ENGINE;

console.log("1. VÉRIFICATION DU MODÈLE MÉTHODOLOGIQUE (TDR §6 & CDC §3.4)");

test("Catalogue de données et Moteur chargés avec succès", () => {
  assert.ok(DATA, "MAPERF_BAROMETRE_DATA doit être défini");
  assert.ok(ENGINE, "MAPERF_BAROMETRE_ENGINE doit être exposé");
});

test("Somme des pondérations des 6 Dimensions Secteur Public = 100% (20/20/20/15/10/15)", () => {
  const sumPub = DATA.dimensions.PUBLIC.reduce((acc, d) => acc + d.poids, 0);
  assert.strictEqual(sumPub, 100, `Attendu 100%, obtenu ${sumPub}%`);
  const weights = DATA.dimensions.PUBLIC.map(d => d.poids).join(",");
  assert.strictEqual(weights, "20,20,20,15,10,15");
});

test("Somme des pondérations des 6 Dimensions Secteur Privé = 100% (25/20/15/15/10/15)", () => {
  const sumPri = DATA.dimensions.PRIVE.reduce((acc, d) => acc + d.poids, 0);
  assert.strictEqual(sumPri, 100, `Attendu 100%, obtenu ${sumPri}%`);
  const weights = DATA.dimensions.PRIVE.map(d => d.poids).join(",");
  assert.strictEqual(weights, "25,20,15,15,10,15");
});

test("Coefficients de fiabilité des preuves conformes (Déclarée=0.50, Vérifiée=0.80, Auditée=1.00)", () => {
  assert.strictEqual(DATA.meta.poidsVerification["Déclarée"], 0.50);
  assert.strictEqual(DATA.meta.poidsVerification["Vérifiée"], 0.80);
  assert.strictEqual(DATA.meta.poidsVerification["Auditée"], 1.00);
});

// -----------------------------------------------------------------------------
// 2. TESTS DU MOTEUR DE SCORING & D'INCRÉMENTATION PAR VALIDATION D'ÉQUIPE
// -----------------------------------------------------------------------------
console.log("\n2. VÉRIFICATION DU MOTEUR DE SCORING 0-100 & WORKFLOW DE VALIDATION");

test("Évaluation des 4 dossiers de référence (2 Publics, 2 Privés)", () => {
  const state = ENGINE.getState();
  assert.strictEqual(state.dossiers.length, 4, "4 dossiers pré-chargés attendus");

  state.dossiers.forEach(d => {
    const ev = ENGINE.evaluateDossier(d);
    assert.ok(ev.globalRawScore >= 0 && ev.globalRawScore <= 100, `Score brut hors bornes pour ${d.codeAnonyme}`);
    assert.ok(ev.globalVerifiedScore >= 0 && ev.globalVerifiedScore <= 100, `Score validé hors bornes pour ${d.codeAnonyme}`);
    assert.ok(ev.globalVerifiedScore <= ev.globalRawScore + 0.01, `Le score validé ne peut excéder le score brut (${d.codeAnonyme})`);
  });
});

test("Règle métier clé : La validation d'une donnée par l'équipe MAPERF incrémente le Taux de Performance Validé", () => {
  const dossier = JSON.parse(JSON.stringify(DATA.initialDossiers[1])); // PUB-2027-002 (RNTIP)
  // Forcer FIN.001 à Déclarée
  dossier.data["FIN.001"].verif = "Déclarée";
  const evDeclaree = ENGINE.evaluateDossier(dossier);

  // Passer FIN.001 à Vérifiée (0.80)
  dossier.data["FIN.001"].verif = "Vérifiée";
  const evVerifiee = ENGINE.evaluateDossier(dossier);

  // Passer FIN.001 à Auditée (1.00)
  dossier.data["FIN.001"].verif = "Auditée";
  const evAuditee = ENGINE.evaluateDossier(dossier);

  assert.ok(
    evVerifiee.globalVerifiedScore > evDeclaree.globalVerifiedScore,
    `Le passage Déclarée -> Vérifiée doit incrémenter le score (${evDeclaree.globalVerifiedScore.toFixed(2)} -> ${evVerifiee.globalVerifiedScore.toFixed(2)})`
  );
  assert.ok(
    evAuditee.globalVerifiedScore > evVerifiee.globalVerifiedScore,
    `Le passage Vérifiée -> Auditée doit incrémenter le score (${evVerifiee.globalVerifiedScore.toFixed(2)} -> ${evAuditee.globalVerifiedScore.toFixed(2)})`
  );
  assert.ok(
    evAuditee.globalFiabilite > evDeclaree.globalFiabilite,
    "L'indice de fiabilité documentaire doit augmenter après validation"
  );
});

test("Règle de non-assimilation à zéro : 'Non disponible' et 'Non applicable' retournent null et ne valent pas 0", () => {
  const dossier = JSON.parse(JSON.stringify(DATA.initialDossiers[0]));
  const fieldFin009 = DATA.fields.PUBLIC.find(f => f.code === "FIN.009");

  dossier.data["FIN.009"].app = "Non disponible";
  const resND = ENGINE.computeFieldIndicatorScore(dossier, fieldFin009);
  assert.strictEqual(resND.rawScore, null, "Une donnée Non disponible ne doit pas produire un score de 0");
  assert.strictEqual(resND.applicable, true);
  assert.strictEqual(resND.available, false);

  dossier.data["FIN.009"].app = "Non applicable";
  const resNA = ENGINE.computeFieldIndicatorScore(dossier, fieldFin009);
  assert.strictEqual(resNA.rawScore, null, "Une donnée Non applicable doit être neutralisée (rawScore null)");
  assert.strictEqual(resNA.applicable, false);
});

test("Modulation OSP (Secteur Public) : Pondération de FIN.009 réduite de moitié (0.5x) si soumis à des OSP", () => {
  const dossierOSP = JSON.parse(JSON.stringify(DATA.initialDossiers[0]));
  dossierOSP.soumisOSP = "Oui";
  dossierOSP.data["FIN.009"] = { v2023: -5000000000, v2024: -4000000000, v2025: -3000000000, app: "Applicable", verif: "Auditée", source: "DOC.01" };

  const dossierSansOSP = JSON.parse(JSON.stringify(dossierOSP));
  dossierSansOSP.soumisOSP = "Non";

  const evOSP = ENGINE.evaluateDossier(dossierOSP);
  const evSansOSP = ENGINE.evaluateDossier(dossierSansOSP);

  assert.ok(
    evOSP.dimStats.A.rawScore > evSansOSP.dimStats.A.rawScore,
    `La modulation OSP (0.5x) doit atténuer la pénalité d'un résultat net déficitaire lié aux OSP (${evOSP.dimStats.A.rawScore.toFixed(2)} vs ${evSansOSP.dimStats.A.rawScore.toFixed(2)})`
  );
});

// -----------------------------------------------------------------------------
// 3. TESTS DES 36 CONTRÔLES DE COHÉRENCE COMPTABLE (OHADA) & ÉLIGIBILITÉ
// -----------------------------------------------------------------------------
console.log("\n3. VÉRIFICATION DES CONTRÔLES DE COHÉRENCE AUTOMATISÉS (C01-C09 & G1-G3)");

test("Contrôle C01-C03 : Détection d'un déséquilibre Bilan Actif ≠ Passif en 2025 (C03)", () => {
  const dossier = JSON.parse(JSON.stringify(DATA.initialDossiers[0]));
  // Créer un écart en 2025 entre Actif (FIN.010) et Passif (FIN.011)
  dossier.data["FIN.010"].v2025 = 50000000000;
  dossier.data["FIN.011"].v2025 = 40000000000;

  const checks = ENGINE.runCoherenceChecks(dossier);
  const c03 = checks.find(c => c.code === "C03");
  assert.strictEqual(c03.statut, "ERREUR", "Le contrôle C03 doit signaler ERREUR en cas d'écart Actif/Passif en 2025");
});

test("Contrôle C05 : Détection d'une incohérence Effectif Hommes + Femmes ≠ Effectif Total", () => {
  const dossier = JSON.parse(JSON.stringify(DATA.initialDossiers[2])); // PRI-2027-001
  dossier.data["RHD.001"].v2025 = 350;
  dossier.data["RHD.002"].v2025 = 200;
  dossier.data["RHD.003"].v2025 = 100; // 200 + 100 = 300 != 350

  const checks = ENGINE.runCoherenceChecks(dossier);
  const c05 = checks.find(c => c.code === "C05");
  assert.strictEqual(c05.statut, "ERREUR", "Le contrôle C05 doit détecter H + F != Total");
});

test("Contrôle G2 : Détection du seuil d'éligibilité Secteur Privé (< 10 salariés)", () => {
  const dossier = JSON.parse(JSON.stringify(DATA.initialDossiers[2]));
  dossier.data["RHD.001"].v2025 = 7;
  dossier.effectif2025 = 7;

  const checks = ENGINE.runCoherenceChecks(dossier);
  const g2 = checks.find(c => c.code === "G2");
  assert.strictEqual(g2.statut, "ERREUR", "Le contrôle G2 doit signaler un effectif privé < 10 salariés");
});

// -----------------------------------------------------------------------------
// 4. INTÉGRITÉ UX/UI DE TOUTES LES PAGES HTML & DE LA SÉCURITÉ PHP
// -----------------------------------------------------------------------------
console.log("\n4. VÉRIFICATION DE L'INTÉGRITÉ DES 15 PAGES HTML & DE LA SÉCURITÉ PHP");

const htmlFiles = fs.readdirSync(ROOT_DIR).filter(f => f.endsWith(".html"));

test("Toutes les 15 pages HTML chargent le Design System (maperf-design.css), sans @apply ni lien cassé", () => {
  assert.strictEqual(htmlFiles.length, 15, `Attendu 15 pages HTML, trouvé ${htmlFiles.length}`);
  htmlFiles.forEach(file => {
    const content = fs.readFileSync(path.join(ROOT_DIR, file), "utf8");
    assert.ok(content.includes("assets/css/maperf-design.css"), `${file} doit inclure maperf-design.css`);
    if (file !== "plateforme-2.html") {
      assert.ok(content.includes("assets/js/maperf-layout.js"), `${file} doit inclure maperf-layout.js`);
    }
    assert.ok(!content.includes("@apply "), `${file} ne doit contenir aucune règle @apply non compilée`);
    assert.ok(!content.includes("orateur-1.jpg"), `${file} ne doit pas contenir d'extension .jpg en minuscule cassée pour orateur-1.JPG`);
  });
});

test("barometre.html contient les 5 onglets fonctionnels et tous les conteneurs DOM requis", () => {
  const baroHtml = fs.readFileSync(path.join(ROOT_DIR, "barometre.html"), "utf8");
  const requiredIds = [
    "barometre-app-root",
    "panel-presentation",
    "panel-espace-collecte",
    "panel-espace-validation",
    "panel-tableau-de-bord",
    "panel-consolidation",
    "consolidation-matrix-tbody",
    "btn-export-csv-matrix",
    "btn-import-dossier",
    "btn-reset-demo",
    "chart-barometre-radar",
    "chart-barometre-dimensions",
    "dash-exec-strengths",
    "dash-exec-priorities",
    "dash-cert-hash"
  ];
  requiredIds.forEach(id => {
    assert.ok(baroHtml.includes(`id="${id}"`), `barometre.html doit contenir id="${id}"`);
  });
});

test("Présence des kits officiels Excel (Public/Privé), TDR PDF, Migration Supabase et Pipeline CI/CD", () => {
  const requiredDocs = [
    "assets/docs/01_TDR_Barometre_MAPERF_2027.pdf",
    "assets/docs/Cahier_des_charges_Plateforme_Barometre_MAPERF_2027.docx",
    "assets/docs/MAPERF_Barometre_Collecte_Secteur_Public.xlsx",
    "assets/docs/MAPERF_Barometre_Collecte_Secteur_Prive.xlsx",
    "supabase/migrations/20270101000000_maperf_barometre_2027.sql",
    ".github/workflows/maperf-ci-qa.yml"
  ];
  requiredDocs.forEach(relPath => {
    assert.ok(fs.existsSync(path.join(ROOT_DIR, relPath)), `Le fichier ${relPath} doit exister`);
  });
});

test("Architecture UX/UI du Header : Logo épuré sans doublon texte et navigation sans retour à la ligne", () => {
  const layoutJs = fs.readFileSync(path.join(ROOT_DIR, "assets/js/maperf-layout.js"), "utf8");
  assert.ok(!layoutJs.includes("Les Journées de la Performance · Congo"), "Le doublon texte à côté du logo doit être supprimé");
  assert.ok(layoutJs.includes("whitespace-nowrap"), "La barre de navigation doit empêcher le retour à la ligne des intitulés");
});

test("send_inscription.php applique les protections OWASP (hash_equals, anti-CRLF, htmlspecialchars)", () => {
  const phpContent = fs.readFileSync(path.join(ROOT_DIR, "send_inscription.php"), "utf8");
  assert.ok(phpContent.includes("hash_equals"), "send_inscription.php doit utiliser hash_equals contre les timing attacks");
  assert.ok(phpContent.includes('str_replace(["\\r", "\\n"]'), "send_inscription.php doit nettoyer les retours chariots CRLF");
  assert.ok(phpContent.includes("htmlspecialchars"), "send_inscription.php doit échapper les sorties HTML");
});

console.log("\n================================================================================");
console.log(` RÉSULTAT GLOBAL QA : ${passed} réussis, ${failed} échoués`);
console.log("================================================================================");

if (failed > 0) {
  process.exit(1);
}
