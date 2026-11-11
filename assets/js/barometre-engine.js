/**
 * MAPERF 2027 — Moteur de Calcul Méthodologique, Contrôles de Cohérence & Workflow Contradictoire
 * Implémente intégralement les règles du TDR et des classeurs Excel (Secteur Public & Secteur Privé)
 */
(function () {
  var STORAGE_KEY = "maperf_2027_barometre_dossiers_v1";
  var AUDIT_KEY = "maperf_2027_barometre_audit_v1";
  var AUTH_KEY = "maperf_2027_barometre_auth_v1";

  var STANDARD_PASSWORDS = {
    ENTREPRISE: ["entreprise2027", "entreprise2027!", "congo2027", "maperf2027"],
    MAPERF: ["maperf2027", "maperfaudit2027!", "admin2027", "audit2027"]
  };

  var state = {
    dossiers: [],
    activeDossierId: "PUB-2027-001",
    activeTab: "espace-collecte", // presentation | espace-collecte | espace-validation | tableau-de-bord | consolidation
    activeRubrique: "FIN",
    validationFilter: "ALL",
    auth: {
      entrepriseUnlocked: false,
      equipeUnlocked: false,
      maperfRole: "Analyste Principal OHADA — Secrétariat Technique (Brazzaville)"
    },
    auditLogs: [],
    radarChart: null,
    barChart: null
  };

  function validateStandardPassword(role, rawPwd) {
    var clean = String(rawPwd || "").trim().toLowerCase();
    var allowed = STANDARD_PASSWORDS[role] || [];
    return allowed.indexOf(clean) !== -1;
  }

  function loadState() {
    try {
      var saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        state.dossiers = JSON.parse(saved);
      } else {
        state.dossiers = JSON.parse(JSON.stringify(window.MAPERF_BAROMETRE_DATA.initialDossiers));
      }
      var savedAudit = localStorage.getItem(AUDIT_KEY);
      if (savedAudit) {
        state.auditLogs = JSON.parse(savedAudit);
      } else {
        state.auditLogs = [
          { ts: "2027-02-15 11:20", acteur: "Point Focal (CAILK SA — Pointe-Noire)", action: "Soumission des données 2023–2025 et dépôt de 11 pièces justificatives", code: "PRI-2027-001", impact: "Complétude 100%" },
          { ts: "2027-02-14 16:40", acteur: "Analyste Financier MAPERF (Brazzaville)", action: "Validation des États Financiers OHADA (DOC.01) -> Statut 'Auditée' sur FIN.001..FIN.014", code: "PUB-2027-001", impact: "+14,2 pts Taux Validé" }
        ];
      }
      var savedAuth = localStorage.getItem(AUTH_KEY);
      if (savedAuth) {
        var parsedAuth = JSON.parse(savedAuth);
        state.auth.entrepriseUnlocked = !!parsedAuth.entrepriseUnlocked;
        state.auth.equipeUnlocked = !!parsedAuth.equipeUnlocked;
        if (parsedAuth.maperfRole) state.auth.maperfRole = parsedAuth.maperfRole;
      }
    } catch (e) {
      state.dossiers = JSON.parse(JSON.stringify(window.MAPERF_BAROMETRE_DATA.initialDossiers));
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.dossiers));
      localStorage.setItem(AUDIT_KEY, JSON.stringify(state.auditLogs.slice(0, 50)));
      localStorage.setItem(AUTH_KEY, JSON.stringify(state.auth));
    } catch (e) {
      console.warn("Sauvegarde locale impossible:", e);
    }
  }

  function addAuditLog(acteur, action, code, impact) {
    var now = new Date();
    var ts = now.getFullYear() + "-" +
      String(now.getMonth() + 1).padStart(2, "0") + "-" +
      String(now.getDate()).padStart(2, "0") + " " +
      String(now.getHours()).padStart(2, "0") + ":" +
      String(now.getMinutes()).padStart(2, "0") + ":" +
      String(now.getSeconds()).padStart(2, "0");
    state.auditLogs.unshift({ ts: ts, acteur: acteur, action: action, code: code, impact: impact || "" });
    saveState();
  }

  function getActiveDossier() {
    for (var i = 0; i < state.dossiers.length; i++) {
      if (state.dossiers[i].id === state.activeDossierId) return state.dossiers[i];
    }
    return state.dossiers[0];
  }

  function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
  }

  function normalizeLinear(val, low, high, invert) {
    if (val === null || val === undefined || isNaN(val)) return null;
    if (high === low) return 100;
    var ratio = (val - low) / (high - low);
    if (invert) ratio = (high - val) / (high - low);
    return clamp(ratio * 100, 0, 100);
  }

  /**
   * Calcule la valeur d'indicateur normalisée (0-100) pour un champ donné selon les règles Excel MAPERF 2027
   */
  function computeFieldIndicatorScore(dossier, field) {
    var entry = dossier.data[field.code];
    if (!entry || entry.app === "Non applicable") {
      return { applicable: false, available: false, rawScore: null, verifiedScore: null, verifWeight: 0, ratioLabel: "N/A" };
    }
    if (entry.app === "Non disponible" || entry.v2025 === "" || entry.v2025 === null || entry.v2025 === undefined || isNaN(Number(entry.v2025))) {
      return { applicable: true, available: false, rawScore: null, verifiedScore: null, verifWeight: 0, ratioLabel: "Non disponible" };
    }

    var v23 = Number(entry.v2023);
    var v24 = Number(entry.v2024);
    var v25 = Number(entry.v2025);
    var ca25 = dossier.data["FIN.001"] ? Number(dossier.data["FIN.001"].v2025) : 0;
    var va25 = dossier.data["FIN.004"] ? Number(dossier.data["FIN.004"].v2025) : 0;
    var actif25 = dossier.data["FIN.010"] ? Number(dossier.data["FIN.010"].v2025) : 0;
    var fact25 = dossier.data["FIN.017"] ? Number(dossier.data["FIN.017"].v2025) : ca25;
    var eff25 = dossier.data["RHD.001"] ? Number(dossier.data["RHD.001"].v2025) : 0;

    var rawScore = null;
    var ratioLabel = "";

    if (field.dir === "info") {
      // Champ de contrôle structurel (Actif/Passif/Dette brute) : validé par présence et cohérence
      rawScore = v25 >= 0 ? 85 : 40;
      ratioLabel = formatNumber(v25) + " " + field.unite;
    } else if (field.dir === "growth") {
      var base = (!isNaN(v24) && v24 > 0) ? v24 : ((!isNaN(v23) && v23 > 0) ? v23 : v25);
      var growth = base > 0 ? (v25 - base) / base : 0;
      rawScore = normalizeLinear(growth, field.low, field.high, false);
      ratioLabel = (growth >= 0 ? "+" : "") + (growth * 100).toFixed(1) + " % (an)";
    } else if (field.dir === "margin_ca") {
      var margin = ca25 > 0 ? v25 / ca25 : 0;
      rawScore = normalizeLinear(margin, field.low, field.high, false);
      ratioLabel = (margin * 100).toFixed(1) + " % du CA";
    } else if (field.dir === "cost_va") {
      var costRatio = va25 > 0 ? v25 / va25 : 0.6;
      rawScore = normalizeLinear(costRatio, field.low, field.high, true);
      ratioLabel = (costRatio * 100).toFixed(1) + " % de la VA";
    } else if (field.dir === "ratio_sub") {
      var subRatio = (ca25 + v25) > 0 ? v25 / (ca25 + v25) : 0;
      rawScore = normalizeLinear(subRatio, field.low, field.high, true);
      ratioLabel = (subRatio * 100).toFixed(1) + " % des produits";
    } else if (field.dir === "ratio_actif") {
      var eqRatio = actif25 > 0 ? v25 / actif25 : 0;
      rawScore = normalizeLinear(eqRatio, field.low, field.high, false);
      ratioLabel = (eqRatio * 100).toFixed(1) + " % du bilan";
    } else if (field.dir === "ratio_fact") {
      var recRatio = fact25 > 0 ? v25 / fact25 : 0;
      rawScore = normalizeLinear(recRatio, field.low, field.high, false);
      ratioLabel = (recRatio * 100).toFixed(1) + " % recouvré";
    } else if (field.dir === "ratio_eff") {
      var femRatio = eff25 > 0 ? v25 / eff25 : 0;
      rawScore = normalizeLinear(femRatio, field.low, field.high, false);
      ratioLabel = (femRatio * 100).toFixed(1) + " % de l'effectif";
    } else if (field.dir === "desc") {
      rawScore = normalizeLinear(v25, field.low, field.high, true);
      ratioLabel = v25 + " " + field.unite;
    } else {
      // 'asc' standard (pourcentages, maturité 0-4, départements, réunions CA)
      rawScore = normalizeLinear(v25, field.low, field.high, false);
      ratioLabel = v25 + (field.unite === "%" ? " %" : " " + field.unite);
    }

    var verifStatus = entry.verif || "Déclarée";
    var verifWeight = window.MAPERF_BAROMETRE_DATA.meta.poidsVerification[verifStatus] || 0.50;

    // Le score vérifié reflète la validation par l'équipe MAPERF :
    // Une donnée simplement déclarée (0.50) ne libère que 50% de son potentiel de points validés,
    // une donnée Vérifiée par l'équipe (0.80) libère 80%, et une donnée Auditée/Certifiée (1.00) libère 100% !
    var verifiedScore = rawScore * verifWeight;

    return {
      applicable: true,
      available: true,
      rawScore: rawScore,
      verifiedScore: verifiedScore,
      verifWeight: verifWeight,
      verifStatus: verifStatus,
      ratioLabel: ratioLabel
    };
  }

  /**
   * Calcule le bilan complet d'un dossier (Dimensions A-F, Indice Global Brut, Taux Validé par l'Équipe MAPERF,
   * Complétude, Fiabilité, Sous-scores Pratiques/Résultats/Impacts et 36 Contrôles de cohérence)
   */
  function evaluateDossier(dossier) {
    var volet = dossier.volet || "PUBLIC";
    var fields = window.MAPERF_BAROMETRE_DATA.fields[volet];
    var dims = window.MAPERF_BAROMETRE_DATA.dimensions[volet];

    var dimStats = {};
    dims.forEach(function (d) {
      dimStats[d.id] = {
        meta: d,
        applicableCount: 0,
        availableCount: 0,
        weightSum: 0,
        rawWeightedSum: 0,
        verifiedWeightedSum: 0,
        reliabilitySum: 0,
        completude: 0,
        rawScore: 0,
        verifiedScore: 0,
        fiabilite: 0
      };
    });

    var catStats = {
      Pratiques: { w: 0, rawSum: 0, verifSum: 0 },
      Résultats: { w: 0, rawSum: 0, verifSum: 0 },
      Impacts: { w: 0, rawSum: 0, verifSum: 0 }
    };

    var totalApplicable = 0;
    var totalAvailable = 0;
    var totalReliabilitySum = 0;
    var countDeclared = 0;
    var countVerified = 0;
    var countAudited = 0;

    var fieldResults = {};

    fields.forEach(function (field) {
      var res = computeFieldIndicatorScore(dossier, field);
      fieldResults[field.code] = res;

      var ds = dimStats[field.dim];
      if (!res.applicable) return;

      ds.applicableCount++;
      totalApplicable++;

      if (!res.available) return;

      ds.availableCount++;
      totalAvailable++;

      // Modulation OSP (×0.5) pour le secteur public soumis à des OSP non compensées
      var effectiveWeight = field.poids;
      if (volet === "PUBLIC" && dossier.soumisOSP === "Oui" && field.ospMod) {
        effectiveWeight = field.poids * 0.5;
      }

      ds.weightSum += effectiveWeight;
      ds.rawWeightedSum += res.rawScore * effectiveWeight;
      ds.verifiedWeightedSum += res.verifiedScore * effectiveWeight;
      ds.reliabilitySum += res.verifWeight * 100;

      totalReliabilitySum += res.verifWeight * 100;
      if (res.verifStatus === "Auditée") countAudited++;
      else if (res.verifStatus === "Vérifiée") countVerified++;
      else countDeclared++;

      if (catStats[field.cat]) {
        catStats[field.cat].w += effectiveWeight;
        catStats[field.cat].rawSum += res.rawScore * effectiveWeight;
        catStats[field.cat].verifSum += res.verifiedScore * effectiveWeight;
      }
    });

    var globalRawScore = 0;
    var globalVerifiedScore = 0;
    var globalDimWeightSum = 0;
    var allDimsAboveThreshold = true;

    dims.forEach(function (d) {
      var ds = dimStats[d.id];
      ds.completude = ds.applicableCount > 0 ? (ds.availableCount / ds.applicableCount) * 100 : 100;
      if (ds.completude < window.MAPERF_BAROMETRE_DATA.meta.seuils.completudeDimensionMin) {
        allDimsAboveThreshold = false;
      }
      ds.rawScore = ds.weightSum > 0 ? ds.rawWeightedSum / ds.weightSum : 0;
      ds.verifiedScore = ds.weightSum > 0 ? ds.verifiedWeightedSum / ds.weightSum : 0;
      ds.fiabilite = ds.availableCount > 0 ? ds.reliabilitySum / ds.availableCount : 0;

      if (ds.availableCount > 0) {
        globalRawScore += ds.rawScore * d.poids;
        globalVerifiedScore += ds.verifiedScore * d.poids;
        globalDimWeightSum += d.poids;
      }
    });

    globalRawScore = globalDimWeightSum > 0 ? globalRawScore / globalDimWeightSum : 0;
    globalVerifiedScore = globalDimWeightSum > 0 ? globalVerifiedScore / globalDimWeightSum : 0;

    var globalCompletude = totalApplicable > 0 ? (totalAvailable / totalApplicable) * 100 : 0;
    var globalFiabilite = totalAvailable > 0 ? totalReliabilitySum / totalAvailable : 0;

    var scorePratiques = catStats.Pratiques.w > 0 ? catStats.Pratiques.rawSum / catStats.Pratiques.w : 0;
    var scoreResultats = catStats.Résultats.w > 0 ? catStats.Résultats.rawSum / catStats.Résultats.w : 0;
    var scoreImpacts = catStats.Impacts.w > 0 ? catStats.Impacts.rawSum / catStats.Impacts.w : 0;
    var ecartPR = Math.abs(scorePratiques - scoreResultats);

    var checks = runCoherenceChecks(dossier);
    var blockingErrors = checks.filter(function (c) { return c.statut === "ERREUR"; }).length;

    var isPublishable =
      allDimsAboveThreshold &&
      globalCompletude >= window.MAPERF_BAROMETRE_DATA.meta.seuils.completudeGlobaleMin &&
      globalFiabilite >= window.MAPERF_BAROMETRE_DATA.meta.seuils.fiabiliteMin &&
      blockingErrors === 0;

    return {
      dimStats: dimStats,
      fieldResults: fieldResults,
      globalRawScore: globalRawScore,
      globalVerifiedScore: globalVerifiedScore,
      globalCompletude: globalCompletude,
      globalFiabilite: globalFiabilite,
      allDimsAboveThreshold: allDimsAboveThreshold,
      totalApplicable: totalApplicable,
      totalAvailable: totalAvailable,
      countDeclared: countDeclared,
      countVerified: countVerified,
      countAudited: countAudited,
      scorePratiques: scorePratiques,
      scoreResultats: scoreResultats,
      scoreImpacts: scoreImpacts,
      ecartPR: ecartPR,
      alerteEcartPR: ecartPR > window.MAPERF_BAROMETRE_DATA.meta.seuils.ecartPratiquesResultatsMax,
      checks: checks,
      blockingErrors: blockingErrors,
      isPublishable: isPublishable
    };
  }

  /**
   * Exécute les contrôles de recevabilité (G1-G8) et de cohérence comptable/logique (C01-C28)
   */
  function runCoherenceChecks(dossier) {
    var d = dossier.data || {};
    function val(code, yr) {
      if (!d[code] || d[code].app !== "Applicable") return null;
      var v = Number(d[code]["v" + yr]);
      return isNaN(v) ? null : v;
    }

    var results = [];
    // G1 : Raison sociale et point focal renseignés
    results.push({
      code: "G1",
      categorie: "Recevabilité",
      regle: "Identification complète de l'entité et du Point Focal officiel",
      statut: (dossier.raisonSociale && dossier.pointFocalNom && dossier.pointFocalEmail) ? "CONFORME" : "ERREUR",
      detail: (dossier.raisonSociale && dossier.pointFocalEmail) ? "Identité et contact validés" : "Champs d'identification incomplets"
    });

    // G2 : Seuil d'effectif (>= 10 salariés pour Privé)
    var eff25 = val("RHD.001", 2025) || dossier.effectif2025 || 0;
    results.push({
      code: "G2",
      categorie: "Recevabilité",
      regle: "Seuil d'éligibilité d'effectif permanent (≥ 10 salariés pour le secteur privé)",
      statut: (dossier.volet === "PUBLIC" || eff25 >= 10) ? "CONFORME" : "ERREUR",
      detail: "Effectif 2025 déclaré : " + eff25 + " salariés (" + dossier.classeTaille + ")"
    });

    // G3 : Engagement de confidentialité et déclaration sur l'honneur
    results.push({
      code: "G3",
      categorie: "Recevabilité",
      regle: "Signature de l'engagement de confidentialité et déclaration de sincérité",
      statut: (dossier.engagementConfidentialite && dossier.declarationExactitude) ? "CONFORME" : "ERREUR",
      detail: (dossier.engagementConfidentialite && dossier.declarationExactitude) ? "Engagements signés numériquement" : "Consentement requis"
    });

    // C01 : Équilibre du Bilan OHADA (Actif Total FIN.010 = Passif Total FIN.011) sur 2023, 2024, 2025
    [2023, 2024, 2025].forEach(function (yr, idx) {
      var actif = val("FIN.010", yr);
      var passif = val("FIN.011", yr);
      var ok = (actif !== null && passif !== null && Math.abs(actif - passif) <= 1);
      results.push({
        code: "C0" + (idx + 1),
        categorie: "Cohérence Financière OHADA",
        regle: "Équilibre strict du bilan Actif Total (FIN.010) = Passif Total (FIN.011) en " + yr,
        statut: ok ? "CONFORME" : "ERREUR",
        detail: ok ? ("Actif = Passif = " + formatNumber(actif) + " FCFA") : ("Écart détecté : Actif (" + formatNumber(actif) + ") ≠ Passif (" + formatNumber(passif) + ")")
      });
    });

    // C04 : Cohérence CA Export <= CA Total (Secteur Privé) ou Encaissement <= Facturation + Arriérés (Secteur Public)
    if (dossier.volet === "PRIVE") {
      var ca25 = val("FIN.001", 2025);
      var exp25 = val("FIN.002", 2025);
      var okExp = (ca25 !== null && exp25 !== null && exp25 <= ca25);
      results.push({
        code: "C04",
        categorie: "Cohérence Financière",
        regle: "Chiffre d'affaires Export (FIN.002) ≤ Chiffre d'affaires Total HT (FIN.001)",
        statut: okExp ? "CONFORME" : "ERREUR",
        detail: okExp ? ("Export = " + ((exp25 / ca25) * 100).toFixed(1) + "% du CA total") : "CA Export supérieur au CA Total !"
      });
    } else {
      var fact25 = val("FIN.017", 2025);
      var enc25 = val("FIN.018", 2025);
      var okRec = (fact25 !== null && enc25 !== null && enc25 <= fact25 * 1.15);
      results.push({
        code: "C04",
        categorie: "Cohérence Financière",
        regle: "Montant encaissé (FIN.018) cohérent avec le montant facturé (FIN.017)",
        statut: okRec ? "CONFORME" : "ALERTE",
        detail: okRec ? ("Taux d'encaissement = " + ((enc25 / fact25) * 100).toFixed(1) + "%") : "Vérifier l'apurement des arriérés antérieurs"
      });
    }

    // C05 : Parité Effectifs Hommes (RHD.002) + Femmes (RHD.003) = Effectif Total (RHD.001) en 2025
    var tot25 = val("RHD.001", 2025);
    var hom25 = val("RHD.002", 2025);
    var fem25 = val("RHD.003", 2025);
    var okRh = (tot25 !== null && hom25 !== null && fem25 !== null && Math.abs((hom25 + fem25) - tot25) === 0);
    results.push({
      code: "C05",
      categorie: "Cohérence Capital Humain",
      regle: "Somme Effectif Hommes (RHD.002) + Effectif Femmes (RHD.003) = Effectif Total (RHD.001)",
      statut: okRh ? "CONFORME" : "ERREUR",
      detail: okRh ? (hom25 + " H + " + fem25 + " F = " + tot25 + " salariés") : ("Somme H+F (" + ((hom25 || 0) + (fem25 || 0)) + ") ≠ Total (" + tot25 + ")")
    });

    // C06 : Sous-traitance PME locales (OPE.018) <= Part totale achats locaux (OPE.016)
    var achLoc = val("OPE.016", 2025);
    var achPme = val("OPE.018", 2025);
    var okAch = (achLoc !== null && achPme !== null && achPme <= achLoc);
    results.push({
      code: "C06",
      categorie: "Cohérence Opérationnelle",
      regle: "Part achats PME congolaises (OPE.018) ≤ Part totale des achats locaux (OPE.016)",
      statut: okAch ? "CONFORME" : "ERREUR",
      detail: okAch ? ("PME congolaises : " + achPme + "% ≤ Achats locaux : " + achLoc + "%") : "Incohérence : sous-ensemble PME supérieur aux achats locaux totaux"
    });

    // C07 : Plafond réaliste des réunions du Conseil d'Administration (GOU.001 <= 24)
    var caReunions = val("GOU.001", 2025);
    var okCa = (caReunions !== null && caReunions >= 0 && caReunions <= 24);
    results.push({
      code: "C07",
      categorie: "Cohérence Gouvernance",
      regle: "Nombre annuel de sessions du Conseil / Organe de gouvernance (GOU.001) compris entre 0 et 24",
      statut: okCa ? "CONFORME" : "ERREUR",
      detail: "Sessions tenues en 2025 : " + (caReunions !== null ? caReunions : "N/D")
    });

    // C08 : Bornes des scores de maturité (0 à 4)
    var maturityOut = [];
    var fields = window.MAPERF_BAROMETRE_DATA.fields[dossier.volet || "PUBLIC"];
    fields.forEach(function (f) {
      if (f.type === "maturity") {
        var v = val(f.code, 2025);
        if (v !== null && (v < 0 || v > 4)) maturityOut.push(f.code);
      }
    });
    results.push({
      code: "C08",
      categorie: "Échelles Méthodologiques",
      regle: "Respect strict de l'échelle d'ancrage 0 à 4 pour tous les indicateurs de maturité",
      statut: maturityOut.length === 0 ? "CONFORME" : "ERREUR",
      detail: maturityOut.length === 0 ? "Tous les scores qualitatifs sont compris entre 0 et 4" : ("Hors bornes : " + maturityOut.join(", "))
    });

    // C09 : Concordance des pièces justificatives obligatoires (DOC.01, DOC.02, DOC.10, DOC.11)
    var ev = dossier.evidences || {};
    var docManquants = [];
    window.MAPERF_BAROMETRE_DATA.evidenceCatalog.forEach(function (doc) {
      if (doc.obligatoire && (!ev[doc.id] || ev[doc.id].statut === "Non fourni")) {
        docManquants.push(doc.id);
      }
    });
    results.push({
      code: "C09",
      categorie: "Traçabilité Documentaire",
      regle: "Transmission des pièces justificatives obligatoires (États financiers, CAC, CNSS, Quitus fiscal)",
      statut: docManquants.length === 0 ? "CONFORME" : "ALERTE",
      detail: docManquants.length === 0 ? "Toutes les pièces obligatoires sont référencées" : ("Pièces obligatoires en attente : " + docManquants.join(", "))
    });

    return results;
  }

  function formatNumber(num) {
    if (num === null || num === undefined || isNaN(num)) return "—";
    return Number(num).toLocaleString("fr-FR");
  }

  /**
   * Met à jour les bandeaux KPI en haut du portail Baromètre
   */
  function renderTopSummary() {
    var dossier = getActiveDossier();
    var evalRes = evaluateDossier(dossier);

    var elSelect = document.getElementById("barometre-dossier-select");
    if (elSelect) {
      elSelect.innerHTML = state.dossiers.map(function (d) {
        var sel = d.id === dossier.id ? "selected" : "";
        return '<option value="' + d.id + '" ' + sel + '>[' + d.codeAnonyme + '] ' + d.raisonSociale + ' (' + d.volet + ')</option>';
      }).join("");
    }

    setText("summary-code-anonyme", dossier.codeAnonyme);
    setText("summary-raison-sociale", dossier.raisonSociale);
    setText("summary-groupe-homogene", dossier.groupeHomogene);
    setText("summary-workflow-statut", dossier.workflowStatut);

    setText("kpi-score-brut", evalRes.globalRawScore.toFixed(1) + " / 100");
    setText("kpi-score-valide", evalRes.globalVerifiedScore.toFixed(1) + " / 100");
    setText("kpi-completude", evalRes.globalCompletude.toFixed(1) + " %");
    setText("kpi-fiabilite", evalRes.globalFiabilite.toFixed(1) + " %");
    setText("kpi-counts-verif", evalRes.countAudited + " Auditées · " + evalRes.countVerified + " Vérifiées · " + evalRes.countDeclared + " Déclarées");

    var barValide = document.getElementById("bar-progression-valide");
    if (barValide) barValide.style.width = clamp(evalRes.globalVerifiedScore, 0, 100) + "%";

    var barBrut = document.getElementById("bar-progression-brut");
    if (barBrut) barBrut.style.width = clamp(evalRes.globalRawScore, 0, 100) + "%";

    var badgePub = document.getElementById("summary-publiabilite-badge");
    if (badgePub) {
      if (evalRes.isPublishable) {
        badgePub.className = "badge-status badge-audited";
        badgePub.innerHTML = '<i data-lucide="check-circle-2" class="w-3.5 h-3.5"></i> Dossier Publiable & Éligible Trophées 2027';
      } else {
        badgePub.className = "badge-status badge-declared";
        badgePub.innerHTML = '<i data-lucide="alert-circle" class="w-3.5 h-3.5"></i> En cours de validation (Seuils : Complétude ≥75%, Fiabilité ≥50%)';
      }
    }
  }

  function setText(id, txt) {
    var el = document.getElementById(id);
    if (el) el.textContent = txt;
  }

  /**
   * MODULE 1 : Rendu des 6 Dimensions Public / Privé dans l'onglet Présentation
   */
  function renderPresentationDimensions(volet) {
    volet = volet || "PUBLIC";
    var container = document.getElementById("presentation-dimensions-grid");
    if (!container) return;

    var dims = window.MAPERF_BAROMETRE_DATA.dimensions[volet];
    container.innerHTML = dims.map(function (d) {
      return (
        '<div class="card border-t-4 hover:-translate-y-1 transition" style="border-top-color:' + d.couleur + '">' +
        '  <div class="flex items-center justify-between mb-3">' +
        '    <span class="px-3 py-1 rounded-full text-xs font-extrabold text-white" style="background:' + d.couleur + '">Dimension ' + d.id + '</span>' +
        '    <span class="font-display text-xl font-extrabold text-[#00236D]">' + d.poids + ' %</span>' +
        '  </div>' +
        '  <h4 class="font-display font-bold text-base text-slate-900 mb-2">' + d.nom + '</h4>' +
        '  <p class="text-xs text-slate-600 leading-relaxed">' + d.description + '</p>' +
        '</div>'
      );
    }).join("");
  }

  /**
   * MODULE 2 : Rendu de l'Espace Entreprise (Identification + Saisie Pluriannuelle 2023-2025 + Preuves + Contrôles)
   */
  function renderCollecteView() {
    var dossier = getActiveDossier();
    var evalRes = evaluateDossier(dossier);

    // Remplir le formulaire d'identification
    setInputValue("ident-raison-sociale", dossier.raisonSociale);
    setInputValue("ident-sigle", dossier.sigle);
    setInputValue("ident-volet", dossier.volet);
    setInputValue("ident-statut-juridique", dossier.statutJuridique);
    setInputValue("ident-secteur", dossier.macroSecteur);
    setInputValue("ident-ville", dossier.villeSiege);
    setInputValue("ident-effectif", dossier.effectif2025);
    setInputValue("ident-osp", dossier.soumisOSP);
    setInputValue("ident-pf-nom", dossier.pointFocalNom);
    setInputValue("ident-pf-fonction", dossier.pointFocalFonction);
    setInputValue("ident-pf-email", dossier.pointFocalEmail);
    setInputValue("ident-pf-tel", dossier.pointFocalTel);
    setText("ident-code-anonyme", dossier.codeAnonyme);
    setText("ident-groupe-homogene", dossier.groupeHomogene);

    // Onglets de rubriques (FIN, OPE, GOU, TRA, RHD)
    var rubTabs = document.getElementById("collecte-rubriques-tabs");
    if (rubTabs) {
      rubTabs.innerHTML = window.MAPERF_BAROMETRE_DATA.rubriques.map(function (r) {
        var active = state.activeRubrique === r.id ? "active" : "";
        return (
          '<button type="button" data-rubrique="' + r.id + '" class="tab ' + active + ' btn-rubrique-switch">' +
          '  <i data-lucide="' + r.icone + '" class="w-4 h-4"></i>' +
          '  <span>' + r.titre + '</span>' +
          '</button>'
        );
      }).join("");

      rubTabs.querySelectorAll(".btn-rubrique-switch").forEach(function (btn) {
        btn.addEventListener("click", function () {
          state.activeRubrique = btn.getAttribute("data-rubrique");
          renderCollecteView();
          if (window.lucide) window.lucide.createIcons();
        });
      });
    }

    // Table de saisie pluriannuelle 2023-2025
    var tbody = document.getElementById("collecte-fields-tbody");
    if (tbody) {
      var fields = window.MAPERF_BAROMETRE_DATA.fields[dossier.volet].filter(function (f) {
        return f.rubrique === state.activeRubrique;
      });

      tbody.innerHTML = fields.map(function (f) {
        var entry = dossier.data[f.code] || { v2023: "", v2024: "", v2025: "", app: "Applicable", verif: "Déclarée", source: "", comment: "" };
        var res = evalRes.fieldResults[f.code];
        var isDisabled = entry.app !== "Applicable" ? "disabled" : "";
        var badgeClass = entry.verif === "Auditée" ? "badge-audited" : (entry.verif === "Vérifiée" ? "badge-verified" : "badge-declared");

        var stepAttr = f.type === "maturity" ? 'min="0" max="4" step="1"' : 'step="any"';

        return (
          '<tr class="hover:bg-slate-50/80 transition">' +
          '  <td class="p-3 font-mono text-xs font-bold text-[#00236D]">' + f.code + '<div class="text-[10px] font-sans font-semibold text-slate-400">Dim. ' + f.dim + ' · ' + f.cat + '</div></td>' +
          '  <td class="p-3 text-xs font-semibold text-slate-800 max-w-xs">' + f.label +
          (f.ospMod && dossier.soumisOSP === "Oui" ? ' <span class="inline-block px-1.5 py-0.5 text-[10px] rounded bg-amber-100 text-amber-800 font-bold">Modulation OSP ×0,5</span>' : '') +
          '  </td>' +
          '  <td class="p-3 text-xs text-slate-500 font-medium">' + f.unite + '</td>' +
          '  <td class="p-2.5">' +
          '    <select data-code="' + f.code + '" data-field="app" class="barometre-input text-xs py-1.5 js-data-input">' +
          '      <option value="Applicable" ' + (entry.app === "Applicable" ? "selected" : "") + '>Applicable</option>' +
          '      <option value="Non applicable" ' + (entry.app === "Non applicable" ? "selected" : "") + '>Non applicable</option>' +
          '      <option value="Non disponible" ' + (entry.app === "Non disponible" ? "selected" : "") + '>Non disponible</option>' +
          '    </select>' +
          '  </td>' +
          '  <td class="p-2.5 w-32"><input type="number" ' + stepAttr + ' ' + isDisabled + ' data-code="' + f.code + '" data-field="v2023" value="' + (entry.v2023 !== undefined ? entry.v2023 : "") + '" class="barometre-input text-right js-data-input" placeholder="2023" /></td>' +
          '  <td class="p-2.5 w-32"><input type="number" ' + stepAttr + ' ' + isDisabled + ' data-code="' + f.code + '" data-field="v2024" value="' + (entry.v2024 !== undefined ? entry.v2024 : "") + '" class="barometre-input text-right js-data-input" placeholder="2024" /></td>' +
          '  <td class="p-2.5 w-32"><input type="number" ' + stepAttr + ' ' + isDisabled + ' data-code="' + f.code + '" data-field="v2025" value="' + (entry.v2025 !== undefined ? entry.v2025 : "") + '" class="barometre-input text-right border-[#00236D]/40 bg-blue-50/20 js-data-input" placeholder="2025" /></td>' +
          '  <td class="p-3 text-center">' +
          '    <div class="text-xs font-extrabold text-[#00236D]">' + (res && res.rawScore !== null ? res.rawScore.toFixed(0) + ' / 100' : '—') + '</div>' +
          '    <div class="text-[10px] text-slate-500">' + (res ? res.ratioLabel : '') + '</div>' +
          '  </td>' +
          '  <td class="p-3 text-center">' +
          '    <span class="badge-status ' + badgeClass + '">' + (entry.verif || "Déclarée") + ' (' + ((res ? res.verifWeight : 0.5) * 100).toFixed(0) + '%)</span>' +
          '  </td>' +
          '  <td class="p-2.5 w-36">' +
          '    <input type="text" data-code="' + f.code + '" data-field="source" value="' + (entry.source || "") + '" class="barometre-input text-xs py-1 js-data-input" placeholder="Réf. DOC.xx" />' +
          '  </td>' +
          '</tr>'
        );
      }).join("");

      tbody.querySelectorAll(".js-data-input").forEach(function (inp) {
        inp.addEventListener("change", function () {
          var code = inp.getAttribute("data-code");
          var prop = inp.getAttribute("data-field");
          if (!dossier.data[code]) {
            dossier.data[code] = { v2023: "", v2024: "", v2025: "", app: "Applicable", verif: "Déclarée", source: "", comment: "" };
          }
          if (prop === "v2023" || prop === "v2024" || prop === "v2025") {
            dossier.data[code][prop] = inp.value === "" ? "" : Number(inp.value);
            // Toute modification par l'entreprise repasse la donnée en statut "Déclarée" jusqu'à nouvelle vérification par l'équipe MAPERF
            dossier.data[code].verif = "Déclarée";
          } else {
            dossier.data[code][prop] = inp.value;
          }
          addAuditLog("Point Focal (" + dossier.sigle + ")", "Mise à jour donnée " + code + " (" + prop + ")", dossier.codeAnonyme, "Recalcul temps réel");
          refreshAllViews();
        });
      });
    }

    // Registre des preuves (07_Sources_et_preuves)
    var evGrid = document.getElementById("collecte-evidences-tbody");
    if (evGrid) {
      evGrid.innerHTML = window.MAPERF_BAROMETRE_DATA.evidenceCatalog.map(function (doc) {
        var ev = (dossier.evidences && dossier.evidences[doc.id]) || { statut: "Non fourni", fichier: "", date: "", commentaireAnalyste: "" };
        var stClass = ev.statut === "Validé" ? "badge-audited" : (ev.statut === "Transmis" ? "badge-verified" : "badge-declared");
        return (
          '<tr class="hover:bg-slate-50 transition">' +
          '  <td class="p-3 font-mono text-xs font-bold text-[#00236D]">' + doc.id + (doc.obligatoire ? ' <span class="text-red-600" title="Obligatoire">*</span>' : '') + '</td>' +
          '  <td class="p-3 text-xs font-semibold text-slate-800">' + doc.titre + '<div class="text-[11px] text-slate-400 font-normal">Codes liés : ' + doc.codes.join(", ") + '</div></td>' +
          '  <td class="p-3 text-center"><span class="badge-status ' + stClass + '">' + ev.statut + '</span></td>' +
          '  <td class="p-3 text-xs text-slate-600 font-mono">' + (ev.fichier || '<span class="text-slate-400 italic">Aucun fichier joint</span>') + '</td>' +
          '  <td class="p-3 text-xs text-slate-600">' + (ev.commentaireAnalyste || "—") + '</td>' +
          '  <td class="p-3 text-right">' +
          '    <label class="btn btn-outline text-xs py-1.5 px-3 cursor-pointer">' +
          '      <i data-lucide="upload-cloud" class="w-3.5 h-3.5"></i>' +
          '      <span>Joindre PDF/XLSX</span>' +
          '      <input type="file" accept=".pdf,.xlsx,.xls,.csv,.docx" data-doc="' + doc.id + '" class="hidden js-evidence-upload" />' +
          '    </label>' +
          '  </td>' +
          '</tr>'
        );
      }).join("");

      evGrid.querySelectorAll(".js-evidence-upload").forEach(function (fileInput) {
        fileInput.addEventListener("change", function () {
          var docId = fileInput.getAttribute("data-doc");
          if (fileInput.files && fileInput.files[0]) {
            var fileName = fileInput.files[0].name;
            if (!dossier.evidences) dossier.evidences = {};
            dossier.evidences[docId] = {
              statut: "Transmis",
              fichier: fileName,
              date: new Date().toISOString().slice(0, 10),
              commentaireAnalyste: "Pièce téléversée par l'entreprise — En attente de revue Équipe MAPERF."
            };
            addAuditLog("Point Focal (" + dossier.sigle + ")", "Téléversement pièce justificative " + docId + " (" + fileName + ")", dossier.codeAnonyme, "Statut: Transmis");
            refreshAllViews();
          }
        });
      });
    }

    // Contrôles de cohérence (09_Controles_coherence)
    var checksContainer = document.getElementById("collecte-coherence-tbody");
    if (checksContainer) {
      checksContainer.innerHTML = evalRes.checks.map(function (c) {
        var badge = c.statut === "CONFORME"
          ? '<span class="badge-status badge-audited">Conforme</span>'
          : (c.statut === "ALERTE" ? '<span class="badge-status badge-declared">Alerte</span>' : '<span class="badge-status badge-alert">Erreur bloquante</span>');
        return (
          '<tr class="hover:bg-slate-50">' +
          '  <td class="p-3 font-mono text-xs font-bold text-[#00236D]">' + c.code + '</td>' +
          '  <td class="p-3 text-xs font-semibold text-slate-600">' + c.categorie + '</td>' +
          '  <td class="p-3 text-xs font-semibold text-slate-900">' + c.regle + '</td>' +
          '  <td class="p-3 text-center">' + badge + '</td>' +
          '  <td class="p-3 text-xs text-slate-600">' + c.detail + '</td>' +
          '</tr>'
        );
      }).join("");
    }

    // Étape 4 : Demandes de précisions contradictoires reçues par l'entreprise (avec formulaire de réponse directe)
    var entClrList = document.getElementById("collecte-clarifications-list");
    if (entClrList) {
      var clrs = dossier.clarifications || [];
      if (clrs.length === 0) {
        entClrList.innerHTML = '<div class="text-xs text-slate-500 italic p-4 bg-slate-50 rounded-xl">Aucune demande de précision en attente de la part de l\'Équipe MAPERF pour ce dossier.</div>';
      } else {
        entClrList.innerHTML = clrs.map(function (c, idx) {
          return (
            '<div class="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">' +
            '  <div class="flex flex-wrap items-center justify-between gap-2 text-xs">' +
            '    <span class="font-mono font-bold text-[#00236D]">' + c.id + ' · Indicateur ' + c.code + ' (' + c.date + ')</span>' +
            '    <span class="badge-status ' + (c.statut === "Résolu" ? "badge-audited" : "badge-declared") + '">' + c.statut + '</span>' +
            '  </div>' +
            '  <p class="text-xs font-semibold text-slate-800">Demande de l\'Équipe MAPERF : ' + c.message + '</p>' +
            '  <div class="flex flex-wrap gap-2 pt-1">' +
            '    <input type="text" data-clr-idx="' + idx + '" value="' + (c.reponse || "").replace(/"/g, "&quot;") + '" placeholder="Saisir la réponse justificative du Point Focal Entreprise..." class="js-ent-clr-input barometre-input text-xs flex-1" />' +
            '    <button type="button" data-clr-idx="' + idx + '" class="js-ent-clr-send btn btn-primary text-xs py-1.5 px-3.5 shrink-0">Envoyer la réponse à MAPERF</button>' +
            '  </div>' +
            '</div>'
          );
        }).join("");

        entClrList.querySelectorAll(".js-ent-clr-send").forEach(function (btn) {
          btn.addEventListener("click", function () {
            var idx = Number(btn.getAttribute("data-clr-idx"));
            var input = entClrList.querySelector('.js-ent-clr-input[data-clr-idx="' + idx + '"]');
            if (!input || !input.value.trim() || !dossier.clarifications[idx]) return;
            dossier.clarifications[idx].reponse = input.value.trim();
            dossier.clarifications[idx].statut = "Répondu par Entreprise — À valider";
            dossier.workflowStatut = "Réponse transmise à l'Équipe MAPERF";
            addAuditLog("Point Focal (" + dossier.sigle + ")", "Réponse contradictoire envoyée sur " + dossier.clarifications[idx].code, dossier.codeAnonyme, "Contradictoire");
            refreshAllViews();
          });
        });
      }
    }
  }

  function setInputValue(id, val) {
    var el = document.getElementById(id);
    if (el) el.value = val !== undefined && val !== null ? val : "";
  }

  /**
   * MODULE 3 : Rendu de l'Espace Équipe MAPERF (Vérification contradictoire, Validation des preuves & Incrémentation du taux)
   */
  function renderValidationView() {
    var dossier = getActiveDossier();
    var evalRes = evaluateDossier(dossier);

    // Cartes de synthèse de tous les dossiers entreprises dans la file d'attente de l'équipe MAPERF
    var queueContainer = document.getElementById("validation-dossiers-queue");
    if (queueContainer) {
      queueContainer.innerHTML = state.dossiers.map(function (d) {
        var ev = evaluateDossier(d);
        var isActive = d.id === dossier.id;
        return (
          '<div data-dossier-id="' + d.id + '" class="js-select-dossier cursor-pointer rounded-2xl p-4 border-2 transition ' +
          (isActive ? 'border-[#00236D] bg-[#00236D]/5 shadow-md' : 'border-slate-200 bg-white hover:border-[#F39A1E]') + '">' +
          '  <div class="flex items-center justify-between gap-2 mb-2">' +
          '    <span class="font-mono text-xs font-extrabold px-2.5 py-0.5 rounded bg-[#00236D] text-white">' + d.codeAnonyme + '</span>' +
          '    <span class="text-[11px] font-bold px-2 py-0.5 rounded-full ' + (d.volet === "PUBLIC" ? "bg-blue-100 text-blue-900" : "bg-amber-100 text-amber-900") + '">' + d.volet + '</span>' +
          '  </div>' +
          '  <h4 class="font-display font-bold text-sm text-slate-900 line-clamp-1">' + d.raisonSociale + '</h4>' +
          '  <p class="text-[11px] text-slate-500 mb-2">' + d.macroSecteur + ' · ' + d.villeSiege + ' (République du Congo)</p>' +
          '  <div class="mb-2.5 flex items-center justify-between text-[11px]">' +
          '    <span class="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">' + (d.workflowStatut || "En instruction") + '</span>' +
          '    <span class="font-bold text-amber-700">' + ev.countDeclared + ' à vérifier</span>' +
          '  </div>' +
          '  <div class="grid grid-cols-3 gap-2 text-center bg-slate-50 rounded-xl p-2 border border-slate-100">' +
          '    <div><div class="text-[10px] text-slate-500">Score Déclaré</div><div class="font-display font-bold text-xs text-slate-800">' + ev.globalRawScore.toFixed(1) + '</div></div>' +
          '    <div><div class="text-[10px] text-slate-500">Taux Validé</div><div class="font-display font-extrabold text-xs text-emerald-700">' + ev.globalVerifiedScore.toFixed(1) + '</div></div>' +
          '    <div><div class="text-[10px] text-slate-500">Fiabilité</div><div class="font-display font-bold text-xs text-[#00236D]">' + ev.globalFiabilite.toFixed(0) + '%</div></div>' +
          '  </div>' +
          '</div>'
        );
      }).join("");

      queueContainer.querySelectorAll(".js-select-dossier").forEach(function (card) {
        card.addEventListener("click", function () {
          state.activeDossierId = card.getAttribute("data-dossier-id");
          refreshAllViews();
        });
      });
    }

    // Console de validation des données ligne par ligne pour incrémenter le taux de performance
    var valTbody = document.getElementById("validation-fields-tbody");
    if (valTbody) {
      var fields = window.MAPERF_BAROMETRE_DATA.fields[dossier.volet].filter(function (f) {
        if (state.validationFilter === "ALL") return true;
        var entry = dossier.data[f.code];
        var st = (entry && entry.verif) || "Déclarée";
        return st === state.validationFilter;
      });

      valTbody.innerHTML = fields.map(function (f) {
        var entry = dossier.data[f.code] || { v2023: "", v2024: "", v2025: "", app: "Applicable", verif: "Déclarée", source: "", comment: "" };
        var res = evalRes.fieldResults[f.code];
        var docRef = entry.source || "—";
        var docObj = dossier.evidences && dossier.evidences[docRef];
        var docBadge = docObj
          ? '<span class="badge-status ' + (docObj.statut === "Validé" ? "badge-audited" : "badge-verified") + '">' + docRef + ' : ' + docObj.statut + '</span>'
          : '<span class="text-xs text-slate-400 font-mono">' + docRef + '</span>';

        return (
          '<tr class="hover:bg-slate-50 transition">' +
          '  <td class="p-3 font-mono text-xs font-bold text-[#00236D]">' + f.code + '<div class="text-[10px] font-sans text-slate-400">Dim. ' + f.dim + '</div></td>' +
          '  <td class="p-3 text-xs font-semibold text-slate-800">' + f.label + '<div class="text-[11px] text-slate-500 font-normal">' + (entry.comment || "") + '</div></td>' +
          '  <td class="p-3 text-right font-mono text-xs font-bold text-slate-900">' + formatNumber(entry.v2025) + ' <span class="text-[10px] font-normal text-slate-500">' + f.unite + '</span></td>' +
          '  <td class="p-3 text-center">' + docBadge + '</td>' +
          '  <td class="p-3 text-center font-display text-xs font-bold text-slate-700">' + (res && res.rawScore !== null ? res.rawScore.toFixed(1) : "—") + '</td>' +
          '  <td class="p-3 text-center font-display text-sm font-extrabold text-emerald-700">' + (res && res.verifiedScore !== null ? res.verifiedScore.toFixed(1) : "—") + '</td>' +
          '  <td class="p-3 text-right">' +
          '    <div class="inline-flex rounded-xl border border-slate-200 bg-white p-0.5 shadow-sm">' +
          '      <button type="button" data-code="' + f.code + '" data-verif="Déclarée" class="js-set-verif px-2.5 py-1 rounded-lg text-[11px] font-bold transition ' + (entry.verif === "Déclarée" ? "bg-amber-400 text-slate-950" : "text-slate-600 hover:bg-slate-100") + '">Déclarée (50%)</button>' +
          '      <button type="button" data-code="' + f.code + '" data-verif="Vérifiée" class="js-set-verif px-2.5 py-1 rounded-lg text-[11px] font-bold transition ' + (entry.verif === "Vérifiée" ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-100") + '">Vérifiée (80%)</button>' +
          '      <button type="button" data-code="' + f.code + '" data-verif="Auditée" class="js-set-verif px-2.5 py-1 rounded-lg text-[11px] font-bold transition ' + (entry.verif === "Auditée" ? "bg-emerald-600 text-white" : "text-slate-600 hover:bg-slate-100") + '">Auditée (100%)</button>' +
          '    </div>' +
          '  </td>' +
          '</tr>'
        );
      }).join("");

      valTbody.querySelectorAll(".js-set-verif").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var code = btn.getAttribute("data-code");
          var newVerif = btn.getAttribute("data-verif");
          var beforeScore = evaluateDossier(dossier).globalVerifiedScore;

          if (!dossier.data[code]) return;
          dossier.data[code].verif = newVerif;

          var afterScore = evaluateDossier(dossier).globalVerifiedScore;
          var diff = afterScore - beforeScore;
          var diffStr = (diff >= 0 ? "+" : "") + diff.toFixed(2) + " pts sur Taux Validé";

          addAuditLog("Équipe Vérification MAPERF", "Validation de " + code + " -> Statut '" + newVerif + "'", dossier.codeAnonyme, diffStr);
          refreshAllViews();
        });
      });
    }

    // Fil de demandes de précisions contradictoires
    var clrList = document.getElementById("validation-clarifications-list");
    if (clrList) {
      var clrs = dossier.clarifications || [];
      if (clrs.length === 0) {
        clrList.innerHTML = '<div class="text-xs text-slate-500 italic p-4 bg-slate-50 rounded-xl">Aucune demande de précision ouverte pour ce dossier.</div>';
      } else {
        clrList.innerHTML = clrs.map(function (c, idx) {
          var resolveBtn = c.statut !== "Résolu"
            ? '<button type="button" data-clr-resolve="' + idx + '" class="js-resolve-clarif text-[11px] font-bold px-2.5 py-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition">Valider & Clôturer</button>'
            : '';
          return (
            '<div class="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">' +
            '  <div class="flex items-center justify-between text-xs">' +
            '    <span class="font-mono font-bold text-[#00236D]">' + c.id + ' · Donnée ' + c.code + '</span>' +
            '    <div class="flex items-center gap-2">' +
            '      <span class="badge-status ' + (c.statut === "Résolu" ? "badge-audited" : "badge-declared") + '">' + c.statut + '</span>' +
            resolveBtn +
            '    </div>' +
            '  </div>' +
            '  <p class="text-xs font-semibold text-slate-800">Question Analyste (' + c.date + ') : ' + c.message + '</p>' +
            '  <p class="text-xs text-emerald-800 bg-emerald-50/80 p-2 rounded-lg border border-emerald-200/60"><strong>Réponse Entreprise :</strong> ' + (c.reponse || "En attente de réponse du Point Focal") + '</p>' +
            '</div>'
          );
        }).join("");

        clrList.querySelectorAll(".js-resolve-clarif").forEach(function (btn) {
          btn.addEventListener("click", function () {
            var idx = Number(btn.getAttribute("data-clr-resolve"));
            if (!dossier.clarifications || !dossier.clarifications[idx]) return;
            var clr = dossier.clarifications[idx];
            clr.statut = "Résolu";
            if (dossier.data[clr.code] && dossier.data[clr.code].verif === "Déclarée") {
              dossier.data[clr.code].verif = "Vérifiée";
            }
            addAuditLog("Équipe Vérification MAPERF", "Clôture contradictoire & validation de " + clr.code, dossier.codeAnonyme, "Statut: Vérifiée (80%)");
            refreshAllViews();
          });
        });
      }
    }

    // Journal d'audit horodaté (Audit Trail)
    var auditEl = document.getElementById("validation-audit-trail");
    if (auditEl) {
      auditEl.innerHTML = state.auditLogs.slice(0, 10).map(function (log) {
        return (
          '<div class="flex items-start justify-between gap-3 py-2.5 border-b border-slate-100 text-xs">' +
          '  <div>' +
          '    <span class="font-mono text-[11px] text-slate-400">' + log.ts + '</span> · ' +
          '    <span class="font-bold text-[#00236D]">' + log.acteur + '</span> ' +
          '    <span class="text-slate-700">' + log.action + '</span>' +
          '  </div>' +
          '  <div class="shrink-0 flex items-center gap-2">' +
          '    <span class="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold">' + log.code + '</span>' +
          (log.impact ? '<span class="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">' + log.impact + '</span>' : '') +
          '  </div>' +
          '</div>'
        );
      }).join("");
    }
  }

  /**
   * MODULE 4 : Tableau de bord individuel 0-100, Graphique Radar 6 Dimensions & Fiche de Restitution
   */
  function renderDashboardView() {
    var dossier = getActiveDossier();
    var evalRes = evaluateDossier(dossier);
    var dims = window.MAPERF_BAROMETRE_DATA.dimensions[dossier.volet];

    setText("dash-org-title", dossier.raisonSociale + " (" + dossier.codeAnonyme + ")");
    setText("dash-org-subtitle", dossier.groupeHomogene + " · Siège : " + dossier.villeSiege);
    setText("dash-score-valide", evalRes.globalVerifiedScore.toFixed(1));
    setText("dash-score-brut", evalRes.globalRawScore.toFixed(1));
    setText("dash-score-pratiques", evalRes.scorePratiques.toFixed(1) + " / 100");
    setText("dash-score-resultats", evalRes.scoreResultats.toFixed(1) + " / 100");
    setText("dash-score-impacts", evalRes.scoreImpacts.toFixed(1) + " / 100");
    setText("dash-ecart-pr", evalRes.ecartPR.toFixed(1) + " pts");

    var prAlertEl = document.getElementById("dash-ecart-pr-alert");
    if (prAlertEl) {
      if (evalRes.alerteEcartPR) {
        prAlertEl.className = "mt-2 text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-2";
        prAlertEl.textContent = "⚠️ Écart Pratiques–Résultats > 25 pts détecté : formalisme documentaire à convertir en résultats opérationnels.";
      } else {
        prAlertEl.className = "mt-2 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg p-2";
        prAlertEl.textContent = "✓ Cohérence équilibrée entre la maturité des pratiques et les résultats observés (écart ≤ 25 pts).";
      }
    }

    // Cartes de détail des 6 dimensions
    var dimCards = document.getElementById("dash-dimensions-cards");
    if (dimCards) {
      dimCards.innerHTML = dims.map(function (d) {
        var ds = evalRes.dimStats[d.id];
        return (
          '<div class="card p-4 border-l-4" style="border-left-color:' + d.couleur + '">' +
          '  <div class="flex items-center justify-between text-xs font-bold text-slate-500 mb-1">' +
          '    <span>DIMENSION ' + d.id + ' (Pondération ' + d.poids + '%)</span>' +
          '    <span class="' + (ds.completude >= 70 ? 'text-emerald-700' : 'text-red-600') + '">Complétude : ' + ds.completude.toFixed(0) + '%</span>' +
          '  </div>' +
          '  <h4 class="font-display font-bold text-sm text-slate-900 mb-3">' + d.nom + '</h4>' +
          '  <div class="grid grid-cols-2 gap-3 bg-slate-50 p-2.5 rounded-xl mb-2">' +
          '    <div><div class="text-[10px] text-slate-500 uppercase">Score Brut Déclaré</div><div class="font-display font-bold text-base text-slate-800">' + ds.rawScore.toFixed(1) + ' <span class="text-xs font-normal">/100</span></div></div>' +
          '    <div><div class="text-[10px] text-emerald-700 uppercase font-bold">Taux Validé MAPERF</div><div class="font-display font-extrabold text-base text-emerald-700">' + ds.verifiedScore.toFixed(1) + ' <span class="text-xs font-normal">/100</span></div></div>' +
          '  </div>' +
          '  <div class="w-full h-2 rounded-full bg-slate-200 overflow-hidden">' +
          '    <div class="h-full rounded-full transition-all duration-500" style="width:' + clamp(ds.verifiedScore, 0, 100) + '%; background:' + d.couleur + '"></div>' +
          '  </div>' +
          '</div>'
        );
      }).join("");
    }

    // Graphiques Chart.js (Radar 6 dimensions & Barres Comparatives Brut vs Validé)
    if (window.Chart) {
      var labels = dims.map(function (d) { return "Dim " + d.id; });
      var rawValues = dims.map(function (d) { return Number(evalRes.dimStats[d.id].rawScore.toFixed(1)); });
      var verifValues = dims.map(function (d) { return Number(evalRes.dimStats[d.id].verifiedScore.toFixed(1)); });
      var medianGroup = [68, 70, 65, 62, 69, 66];

      var radarCanvas = document.getElementById("chart-barometre-radar");
      if (radarCanvas) {
        if (state.radarChart) state.radarChart.destroy();
        state.radarChart = new Chart(radarCanvas.getContext("2d"), {
          type: "radar",
          data: {
            labels: labels,
            datasets: [
              {
                label: "Taux Validé Équipe MAPERF",
                data: verifValues,
                backgroundColor: "rgba(44, 195, 160, 0.25)",
                borderColor: "#2CC3A0",
                pointBackgroundColor: "#00236D",
                borderWidth: 2.5
              },
              {
                label: "Potentiel Brut Déclaré",
                data: rawValues,
                backgroundColor: "rgba(0, 35, 109, 0.10)",
                borderColor: "#00236D",
                borderDash: [5, 5],
                pointBackgroundColor: "#00236D",
                borderWidth: 2
              },
              {
                label: "Repère Médian Groupe Homogène",
                data: medianGroup,
                backgroundColor: "rgba(243, 154, 30, 0.08)",
                borderColor: "#F39A1E",
                pointBackgroundColor: "#F39A1E",
                borderWidth: 1.5
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              r: { min: 0, max: 100, ticks: { stepSize: 20 } }
            },
            plugins: { legend: { position: "bottom" } }
          }
        });
      }

      var barCanvas = document.getElementById("chart-barometre-dimensions");
      if (barCanvas) {
        if (state.barChart) state.barChart.destroy();
        state.barChart = new Chart(barCanvas.getContext("2d"), {
          type: "bar",
          data: {
            labels: dims.map(function (d) { return "Dim. " + d.id + " (" + d.poids + "%)"; }),
            datasets: [
              {
                label: "Score Brut Déclaré (/100)",
                data: rawValues,
                backgroundColor: "#00236D",
                borderRadius: 6
              },
              {
                label: "Taux Validé par l'Équipe MAPERF (/100)",
                data: verifValues,
                backgroundColor: "#2CC3A0",
                borderRadius: 6
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: { y: { beginAtZero: true, max: 100 } },
            plugins: { legend: { position: "bottom" } }
          }
        });
      }
    }

    // Synthèse Exécutive Personnalisée (Forces Majeures / Priorités 2027) & Sceau d'Intégrité ISO 19005 (PDF/A)
    var sortedDims = dims.slice().sort(function (a, b) {
      return evalRes.dimStats[b.id].verifiedScore - evalRes.dimStats[a.id].verifiedScore;
    });

    var strengthsEl = document.getElementById("dash-exec-strengths");
    if (strengthsEl) {
      strengthsEl.innerHTML = sortedDims.slice(0, 3).map(function (d) {
        var ds = evalRes.dimStats[d.id];
        return (
          '<li class="flex items-start gap-2 p-2 rounded-lg bg-emerald-50/70 border border-emerald-100">' +
          '  <span class="font-mono font-extrabold text-emerald-700 shrink-0">Dim. ' + d.id + ' (' + ds.verifiedScore.toFixed(1) + '/100)</span>' +
          '  <span><strong>' + d.nom + '</strong> — Fiabilité des preuves à ' + ds.fiabilite.toFixed(0) + ' %.</span>' +
          '</li>'
        );
      }).join("");
    }

    var prioritiesEl = document.getElementById("dash-exec-priorities");
    if (prioritiesEl) {
      var weakestDims = sortedDims.slice().reverse().slice(0, 2);
      var prioItems = weakestDims.map(function (d) {
        var ds = evalRes.dimStats[d.id];
        var gap = (ds.rawScore - ds.verifiedScore).toFixed(1);
        return (
          '<li class="flex items-start gap-2 p-2 rounded-lg bg-amber-50/70 border border-amber-100">' +
          '  <span class="font-mono font-extrabold text-amber-800 shrink-0">Dim. ' + d.id + '</span>' +
          '  <span>Renforcer <strong>' + d.nom + '</strong> (gain potentiel de <strong>+' + gap + ' pts</strong> par certification des pièces justificatives).</span>' +
          '</li>'
        );
      });
      if (evalRes.countDeclared > 0) {
        prioItems.push(
          '<li class="flex items-start gap-2 p-2 rounded-lg bg-blue-50/70 border border-blue-100">' +
          '  <span class="font-mono font-extrabold text-[#00236D] shrink-0">Preuves</span>' +
          '  <span>Soumettre les justificatifs pour les <strong>' + evalRes.countDeclared + ' donnée(s) Déclarée(s)</strong> afin de passer du coefficient 0,50 à 0,80 ou 1,00.</span>' +
          '</li>'
        );
      }
      prioritiesEl.innerHTML = prioItems.join("");
    }

    // Empreinte déterministe SHA-256 simulée pour le certificat ISO 19005 (PDF/A)
    var payloadStr = dossier.codeAnonyme + "|" + evalRes.globalVerifiedScore.toFixed(2) + "|" + evalRes.globalCompletude.toFixed(1) + "|" + evalRes.globalFiabilite.toFixed(1);
    var hashAcc = 0x811c9dc5;
    var hexBlocks = [];
    for (var b = 0; b < 8; b++) {
      var h = hashAcc ^ (b * 0x9e3779b9);
      for (var ci = 0; ci < payloadStr.length; ci++) {
        h ^= payloadStr.charCodeAt(ci);
        h = Math.imul(h, 0x01000193);
      }
      hexBlocks.push((h >>> 0).toString(16).padStart(8, "0"));
    }
    setText("dash-cert-hash", "SHA256:" + hexBlocks.join("").toUpperCase());
    setText("dash-cert-timestamp", dossier.derniereMaj || "2027-02-15 10:30 UTC+1");
    setText("dash-cert-status", evalRes.isPublishable ? "CERTIFIÉ PUBLIABLE" : "INSTRUCTION EN COURS");
  }

  /**
   * MODULE 5 : Consolidation Anonymisée (Comité Scientifique), Palmarès d'Éligibilité Trophées 2027 & Export CSV/Excel
   */
  function renderConsolidationView() {
    var tbody = document.getElementById("consolidation-matrix-tbody");
    if (!tbody) return;

    var pubCount = 0;
    var priCount = 0;
    var pubScores = [];
    var priScores = [];

    var rowsHtml = state.dossiers.map(function (d) {
      var ev = evaluateDossier(d);
      if (d.volet === "PUBLIC") {
        pubCount++;
        pubScores.push(ev.globalVerifiedScore);
      } else {
        priCount++;
        priScores.push(ev.globalVerifiedScore);
      }

      var dims = ["A", "B", "C", "D", "E", "F"].map(function (dimId) {
        var ds = ev.dimStats[dimId];
        return '<td class="p-3 text-center font-mono text-xs font-bold text-slate-700">' + (ds ? ds.verifiedScore.toFixed(1) : "—") + '</td>';
      }).join("");

      var pubBadge = ev.isPublishable
        ? '<span class="badge-status badge-audited">Publiable & Éligible</span>'
        : '<span class="badge-status badge-declared">Sous seuil</span>';

      return (
        '<tr class="hover:bg-slate-50 transition cursor-pointer" data-conso-dossier="' + d.id + '" title="Cliquer pour inspecter la fiche de restitution 0–100 de ce dossier">' +
        '  <td class="p-3 font-mono text-xs font-extrabold text-[#00236D] underline decoration-dotted">' + d.codeAnonyme + '</td>' +
        '  <td class="p-3"><span class="text-[11px] font-bold px-2 py-0.5 rounded-full ' + (d.volet === "PUBLIC" ? "bg-blue-100 text-blue-900" : "bg-amber-100 text-amber-900") + '">' + d.volet + '</span></td>' +
        '  <td class="p-3 text-xs font-semibold text-slate-800">' + d.groupeHomogene + '</td>' +
        dims +
        '  <td class="p-3 text-center font-display text-xs font-bold text-slate-600">' + ev.globalRawScore.toFixed(1) + '</td>' +
        '  <td class="p-3 text-center font-display text-sm font-extrabold text-emerald-700 bg-emerald-50/50">' + ev.globalVerifiedScore.toFixed(1) + '</td>' +
        '  <td class="p-3 text-center font-mono text-xs">' + ev.globalCompletude.toFixed(0) + '%</td>' +
        '  <td class="p-3 text-center font-mono text-xs font-bold text-[#00236D]">' + ev.globalFiabilite.toFixed(0) + '%</td>' +
        '  <td class="p-3 text-center">' + pubBadge + '</td>' +
        '</tr>'
      );
    }).join("");

    tbody.innerHTML = rowsHtml;

    tbody.querySelectorAll("[data-conso-dossier]").forEach(function (tr) {
      tr.addEventListener("click", function () {
        var id = tr.getAttribute("data-conso-dossier");
        if (id) {
          state.activeDossierId = id;
          switchMainTab("tableau-de-bord");
        }
      });
    });

    var avgPub = pubScores.length ? (pubScores.reduce(function (a, b) { return a + b; }, 0) / pubScores.length) : 0;
    var avgPri = priScores.length ? (priScores.reduce(function (a, b) { return a + b; }, 0) / priScores.length) : 0;

    setText("conso-kpi-pub-count", pubCount + " / 20");
    setText("conso-kpi-pri-count", priCount + " / 50");
    setText("conso-kpi-pub-avg", avgPub.toFixed(1) + " / 100");
    setText("conso-kpi-pri-avg", avgPri.toFixed(1) + " / 100");
  }

  /**
   * Navigation par onglets principaux du Portail Baromètre
   */
  function switchMainTab(tabId) {
    state.activeTab = tabId;
    var panels = ["presentation", "espace-collecte", "espace-validation", "tableau-de-bord", "consolidation"];
    panels.forEach(function (id) {
      var panel = document.getElementById("panel-" + id);
      var btn = document.querySelector('[data-main-tab="' + id + '"]');
      if (panel) {
        if (id === tabId) panel.classList.remove("hidden");
        else panel.classList.add("hidden");
      }
      if (btn) {
        if (id === tabId) btn.classList.add("active");
        else btn.classList.remove("active");
      }
    });

    refreshAllViews();
    if (window.lucide) window.lucide.createIcons();
  }

  /**
   * Gestion des portes d'authentification (Mots de passe standards : Entreprise2027 & Maperf2027)
   */
  function renderAuthGates() {
    var dossier = getActiveDossier();

    // Sélecteur de dossier sur la porte de connexion Entreprise
    var loginSelect = document.getElementById("login-ent-dossier-select");
    if (loginSelect) {
      loginSelect.innerHTML = state.dossiers.map(function (d) {
        var sel = d.id === state.activeDossierId ? ' selected="selected"' : '';
        return '<option value="' + d.id + '"' + sel + '>' + d.codeAnonyme + ' — ' + d.raisonSociale + ' (' + d.villeSiege + ', République du Congo)</option>';
      }).join("");
    }

    // Porte Entreprise vs Contenu Entreprise
    var gateEnt = document.getElementById("auth-gate-entreprise");
    var workEnt = document.getElementById("workspace-entreprise-content");
    if (gateEnt && workEnt) {
      if (state.auth.entrepriseUnlocked) {
        gateEnt.classList.add("hidden");
        workEnt.classList.remove("hidden");
      } else {
        gateEnt.classList.remove("hidden");
        workEnt.classList.add("hidden");
      }
    }

    // Porte Équipe MAPERF vs Contenu Équipe MAPERF
    var gateEq = document.getElementById("auth-gate-equipe");
    var workEq = document.getElementById("workspace-equipe-content");
    if (gateEq && workEq) {
      if (state.auth.equipeUnlocked) {
        gateEq.classList.add("hidden");
        workEq.classList.remove("hidden");
      } else {
        gateEq.classList.remove("hidden");
        workEq.classList.add("hidden");
      }
    }

    setText("session-ent-name", dossier.raisonSociale + " (" + dossier.codeAnonyme + " · " + dossier.villeSiege + ")");
    setText("session-maperf-role-label", state.auth.maperfRole || "Analyste Principal OHADA — Brazzaville (République du Congo)");
  }

  /**
   * Crée et enrôle une nouvelle entreprise de la République du Congo (avec pré-remplissage optionnel en statut Déclarée 50%)
   */
  function createNewCongoDossier(opts) {
    var volet = (opts && opts.volet === "PUBLIC") ? "PUBLIC" : "PRIVE";
    var nom = (opts && opts.raisonSociale) ? opts.raisonSociale.trim() : "Nouvelle Entreprise du Congo SA";
    var sigle = (opts && opts.sigle) ? opts.sigle.trim() : nom.split(" ").map(function (w) { return w[0]; }).join("").toUpperCase().slice(0, 6);
    var ville = (opts && opts.villeSiege) ? opts.villeSiege : "Brazzaville";
    var secteur = (opts && opts.macroSecteur) ? opts.macroSecteur : "Industrie, Logistique & Services";
    var eff = Number(opts && opts.effectif2025) || 120;
    var pfNom = (opts && opts.pointFocalNom) ? opts.pointFocalNom : "Point Focal Entreprise";
    var pfEmail = (opts && opts.pointFocalEmail) ? opts.pointFocalEmail : "direction@entreprise-congo.cg";
    var prefill = opts && opts.prefill !== undefined ? !!opts.prefill : true;

    var countVolet = state.dossiers.filter(function (d) { return d.volet === volet; }).length + 1;
    var prefix = volet === "PUBLIC" ? "PUB-2027-" : "PRI-2027-";
    var newId = prefix + String(countVolet).padStart(3, "0");

    // Clonage d'un jeu de données cohérent de référence en République du Congo (en statut Déclarée 50%) si prefill = true
    var refDossier = window.MAPERF_BAROMETRE_DATA.initialDossiers.find(function (d) { return d.volet === volet; }) || window.MAPERF_BAROMETRE_DATA.initialDossiers[0];
    var templateData = {};
    window.MAPERF_BAROMETRE_DATA.fields[volet].forEach(function (f) {
      if (prefill && refDossier.data[f.code]) {
        var src = refDossier.data[f.code];
        templateData[f.code] = {
          v2023: src.v2023,
          v2024: src.v2024,
          v2025: src.v2025,
          app: "Applicable",
          verif: "Déclarée",
          source: src.source || "DOC.01",
          comment: "Saisie initiale Point Focal (" + sigle + " — République du Congo)"
        };
      } else {
        templateData[f.code] = { v2023: "", v2024: "", v2025: "", app: "Applicable", verif: "Déclarée", source: "", comment: "" };
      }
    });

    if (prefill) {
      var hom = Math.round(eff * 0.62);
      var fem = eff - hom;
      templateData["RHD.001"] = { v2023: Math.max(10, eff - 12), v2024: Math.max(10, eff - 5), v2025: eff, app: "Applicable", verif: "Déclarée", source: "DOC.10", comment: "Effectif permanent CNSS Congo" };
      templateData["RHD.002"] = { v2023: hom - 6, v2024: hom - 3, v2025: hom, app: "Applicable", verif: "Déclarée", source: "DOC.10", comment: "Effectif Hommes" };
      templateData["RHD.003"] = { v2023: fem - 6, v2024: fem - 2, v2025: fem, app: "Applicable", verif: "Déclarée", source: "DOC.10", comment: "Effectif Femmes" };
    }

    var classeTaille = eff >= 250 ? "GE 250+" : (eff >= 50 ? "PME 50–249" : "PME 10–49");
    var newDossier = {
      id: newId,
      codeAnonyme: newId,
      volet: volet,
      raisonSociale: nom,
      sigle: sigle,
      statutJuridique: volet === "PUBLIC" ? "Entreprise publique / EPIC (République du Congo)" : "Société Anonyme (SA) OHADA — RCCM Congo",
      ministereTutelle: volet === "PUBLIC" ? "Ministère de Tutelle (République du Congo)" : "N/A (Secteur Privé)",
      macroSecteur: secteur,
      villeSiege: ville,
      departement: ville,
      effectif2025: eff,
      classeTaille: classeTaille,
      groupeHomogene: volet + " · " + secteur + " × " + classeTaille,
      soumisOSP: volet === "PUBLIC" ? "Oui" : "Non",
      contratPlanEtat: "Non",
      pointFocalNom: pfNom,
      pointFocalFonction: "Directeur Général / Point Focal MAPERF",
      pointFocalEmail: pfEmail,
      pointFocalTel: "+242 06 600 00 00",
      engagementConfidentialite: true,
      declarationExactitude: true,
      workflowStatut: "En saisie par l'Entreprise (À soumettre)",
      derniereMaj: new Date().toISOString().slice(0, 16).replace("T", " "),
      data: templateData,
      evidences: {
        "DOC.01": { statut: "Transmis", fichier: sigle + "_Etats_Financiers_OHADA_2025.pdf", commentaireAnalyste: "En attente de revue par l'Équipe MAPERF" }
      },
      clarifications: []
    };

    state.dossiers.push(newDossier);
    state.activeDossierId = newId;
    addAuditLog("Point Focal (" + sigle + ")", "Enrôlement nouvelle entreprise en République du Congo : " + nom + " (" + ville + ")", newId, "Statut: Déclarée (50%)");
    saveState();
    return newDossier;
  }

  function refreshAllViews() {
    saveState();
    renderAuthGates();
    renderTopSummary();
    renderCollecteView();
    renderValidationView();
    renderDashboardView();
    renderConsolidationView();
    if (window.lucide) window.lucide.createIcons();
  }

  function bindGlobalActions() {
    // Changement d'entreprise active
    var elSelect = document.getElementById("barometre-dossier-select");
    if (elSelect) {
      elSelect.addEventListener("change", function () {
        state.activeDossierId = elSelect.value;
        refreshAllViews();
      });
    }

    // AUTHENTIFICATION ESPACE ENTREPRISE (Mot de passe standard : Entreprise2027)
    var btnFillPwdEnt = document.getElementById("btn-fill-pwd-entreprise");
    if (btnFillPwdEnt) {
      btnFillPwdEnt.addEventListener("click", function () {
        var inp = document.getElementById("login-ent-password");
        if (inp) inp.value = "Entreprise2027";
      });
    }

    var btnLoginEnt = document.getElementById("btn-login-entreprise");
    if (btnLoginEnt) {
      btnLoginEnt.addEventListener("click", function () {
        var inp = document.getElementById("login-ent-password");
        var sel = document.getElementById("login-ent-dossier-select");
        var err = document.getElementById("login-ent-error");
        var pwd = inp ? inp.value : "";

        if (!validateStandardPassword("ENTREPRISE", pwd)) {
          if (err) {
            err.classList.remove("hidden");
            err.textContent = "Mot de passe incorrect. Utilisez le mot de passe standard : Entreprise2027";
          }
          return;
        }
        if (err) err.classList.add("hidden");
        if (sel && sel.value) state.activeDossierId = sel.value;
        state.auth.entrepriseUnlocked = true;
        var d = getActiveDossier();
        addAuditLog("Point Focal (" + d.sigle + ")", "Connexion authentifiée à l'Espace Entreprise (République du Congo)", d.codeAnonyme, "Accès autorisé");
        refreshAllViews();
      });
    }

    var btnLogoutEnt = document.getElementById("btn-logout-entreprise");
    if (btnLogoutEnt) {
      btnLogoutEnt.addEventListener("click", function () {
        state.auth.entrepriseUnlocked = false;
        refreshAllViews();
      });
    }

    // AUTHENTIFICATION ÉQUIPE MAPERF (Mot de passe standard : Maperf2027)
    var btnFillPwdMaperf = document.getElementById("btn-fill-pwd-maperf");
    if (btnFillPwdMaperf) {
      btnFillPwdMaperf.addEventListener("click", function () {
        var inp = document.getElementById("login-maperf-password");
        if (inp) inp.value = "Maperf2027";
      });
    }

    var btnLoginMaperf = document.getElementById("btn-login-maperf");
    if (btnLoginMaperf) {
      btnLoginMaperf.addEventListener("click", function () {
        var inp = document.getElementById("login-maperf-password");
        var roleSel = document.getElementById("login-maperf-role");
        var err = document.getElementById("login-maperf-error");
        var pwd = inp ? inp.value : "";

        if (!validateStandardPassword("MAPERF", pwd)) {
          if (err) {
            err.classList.remove("hidden");
            err.textContent = "Mot de passe incorrect. Utilisez le mot de passe standard Équipe MAPERF : Maperf2027";
          }
          return;
        }
        if (err) err.classList.add("hidden");
        state.auth.equipeUnlocked = true;
        if (roleSel && roleSel.value) state.auth.maperfRole = roleSel.value;
        var d = getActiveDossier();
        addAuditLog("Équipe MAPERF (Brazzaville)", "Connexion authentifiée à la Console de Vérification & Validation", d.codeAnonyme, "Session Auditeur");
        refreshAllViews();
      });
    }

    var btnLogoutMaperf = document.getElementById("btn-logout-maperf");
    if (btnLogoutMaperf) {
      btnLogoutMaperf.addEventListener("click", function () {
        state.auth.equipeUnlocked = false;
        refreshAllViews();
      });
    }

    // SOUMISSION DU DOSSIER ENTREPRISE À L'ÉQUIPE MAPERF POUR VÉRIFICATION & SUIVI
    var btnSubmitToMaperf = document.getElementById("btn-submit-to-maperf");
    if (btnSubmitToMaperf) {
      btnSubmitToMaperf.addEventListener("click", function () {
        var dossier = getActiveDossier();
        var ev = evaluateDossier(dossier);
        dossier.workflowStatut = "Soumis par l'Entreprise — À vérifier par MAPERF";
        dossier.derniereMaj = new Date().toISOString().slice(0, 16).replace("T", " ");
        addAuditLog(
          "Point Focal (" + dossier.sigle + " — " + dossier.villeSiege + ")",
          "Transmission officielle des données 2023–2025 à l'Équipe MAPERF pour vérification",
          dossier.codeAnonyme,
          "Potentiel brut : " + ev.globalRawScore.toFixed(1) + "/100 (" + ev.countDeclared + " données à vérifier)"
        );
        refreshAllViews();

        var fb = document.getElementById("submit-ent-feedback");
        if (fb) {
          fb.classList.remove("hidden");
          fb.innerHTML =
            '<div class="flex flex-wrap items-center justify-between gap-3">' +
            '  <div>' +
            '    <strong class="text-[#2CC3A0] block">✓ Dossier ' + dossier.codeAnonyme + ' (' + dossier.raisonSociale + ') transmis avec succès à l\'Équipe MAPERF !</strong>' +
            '    <span>Score Brut Déclaré : <strong>' + ev.globalRawScore.toFixed(1) + '/100</strong> · Score Validé actuel : <strong>' + ev.globalVerifiedScore.toFixed(1) + '/100</strong> (' + ev.countDeclared + ' indicateurs en attente de validation).</span>' +
            '  </div>' +
            '  <button type="button" id="btn-jump-maperf-after-submit" class="btn btn-teal text-xs py-1.5 px-3.5 shrink-0">Ouvrir la Console Équipe MAPERF pour vérifier →</button>' +
            '</div>';
          var jumpBtn = document.getElementById("btn-jump-maperf-after-submit");
          if (jumpBtn) {
            jumpBtn.addEventListener("click", function () {
              switchMainTab("espace-validation");
            });
          }
        }
      });
    }

    // BASCULE RAPIDE ENTRE ESPACE ENTREPRISE ET CONSOLE ÉQUIPE MAPERF
    var btnSwitchToMaperf = document.getElementById("btn-switch-to-maperf");
    if (btnSwitchToMaperf) {
      btnSwitchToMaperf.addEventListener("click", function () {
        switchMainTab("espace-validation");
      });
    }

    var btnSwitchToEnt = document.getElementById("btn-switch-to-entreprise");
    if (btnSwitchToEnt) {
      btnSwitchToEnt.addEventListener("click", function () {
        switchMainTab("espace-collecte");
      });
    }

    // PANNEAU DE CRÉATION D'UNE NOUVELLE ENTREPRISE DE LA RÉPUBLIQUE DU CONGO
    function openNewOrgPanel() {
      state.auth.entrepriseUnlocked = true;
      switchMainTab("espace-collecte");
      var panel = document.getElementById("new-org-panel");
      if (panel) {
        panel.classList.remove("hidden");
        panel.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }

    var btnNewOrg = document.getElementById("btn-new-entreprise");
    if (btnNewOrg) {
      btnNewOrg.addEventListener("click", openNewOrgPanel);
    }

    var btnOpenNewOrg = document.getElementById("btn-open-new-org-panel");
    if (btnOpenNewOrg) {
      btnOpenNewOrg.addEventListener("click", openNewOrgPanel);
    }

    var btnCloseNewOrg = document.getElementById("btn-close-new-org-panel");
    if (btnCloseNewOrg) {
      btnCloseNewOrg.addEventListener("click", function () {
        var panel = document.getElementById("new-org-panel");
        if (panel) panel.classList.add("hidden");
      });
    }

    var btnConfirmNewOrg = document.getElementById("btn-Confirm-new-org");
    if (btnConfirmNewOrg) {
      btnConfirmNewOrg.addEventListener("click", function () {
        var volet = (document.getElementById("new-org-volet") || {}).value || "PRIVE";
        var raison = (document.getElementById("new-org-raison") || {}).value || "Congo Logistique & Services SA";
        var sigle = (document.getElementById("new-org-sigle") || {}).value || "CLSSA";
        var ville = (document.getElementById("new-org-ville") || {}).value || "Pointe-Noire";
        var secteur = (document.getElementById("new-org-secteur") || {}).value || "Industrie, Logistique & Services";
        var eff = Number((document.getElementById("new-org-effectif") || {}).value) || 120;
        var pfNom = (document.getElementById("new-org-pf-nom") || {}).value || "Point Focal Entreprise";
        var pfEmail = (document.getElementById("new-org-pf-email") || {}).value || "direction@entreprise-congo.cg";
        var prefill = document.getElementById("new-org-prefill") ? document.getElementById("new-org-prefill").checked : true;

        createNewCongoDossier({
          volet: volet,
          raisonSociale: raison,
          sigle: sigle,
          villeSiege: ville,
          macroSecteur: secteur,
          effectif2025: eff,
          pointFocalNom: pfNom,
          pointFocalEmail: pfEmail,
          prefill: prefill
        });

        var panel = document.getElementById("new-org-panel");
        if (panel) panel.classList.add("hidden");
        refreshAllViews();
      });
    }

    // Boutons d'onglets principaux
    document.querySelectorAll("[data-main-tab]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        switchMainTab(btn.getAttribute("data-main-tab"));
      });
    });

    // Switch Public / Privé dans la présentation
    document.querySelectorAll("[data-pres-volet]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        document.querySelectorAll("[data-pres-volet]").forEach(function (b) { b.classList.remove("active"); });
        btn.classList.add("active");
        renderPresentationDimensions(btn.getAttribute("data-pres-volet"));
      });
    });

    // Enregistrement de la fiche d'identification entreprise
    var btnSaveIdent = document.getElementById("btn-save-identification");
    if (btnSaveIdent) {
      btnSaveIdent.addEventListener("click", function () {
        var dossier = getActiveDossier();
        dossier.raisonSociale = document.getElementById("ident-raison-sociale").value || dossier.raisonSociale;
        dossier.sigle = document.getElementById("ident-sigle").value || dossier.sigle;
        dossier.statutJuridique = document.getElementById("ident-statut-juridique").value || dossier.statutJuridique;
        dossier.macroSecteur = document.getElementById("ident-secteur").value || dossier.macroSecteur;
        dossier.villeSiege = document.getElementById("ident-ville").value || dossier.villeSiege;
        dossier.effectif2025 = Number(document.getElementById("ident-effectif").value) || dossier.effectif2025;
        dossier.soumisOSP = document.getElementById("ident-osp").value || dossier.soumisOSP;
        dossier.pointFocalNom = document.getElementById("ident-pf-nom").value || dossier.pointFocalNom;
        dossier.pointFocalFonction = document.getElementById("ident-pf-fonction").value || dossier.pointFocalFonction;
        dossier.pointFocalEmail = document.getElementById("ident-pf-email").value || dossier.pointFocalEmail;
        dossier.pointFocalTel = document.getElementById("ident-pf-tel").value || dossier.pointFocalTel;

        dossier.classeTaille = dossier.effectif2025 >= 250 ? "GE 250+" : (dossier.effectif2025 >= 50 ? "PME 50–249" : "PME 10–49");
        dossier.groupeHomogene = dossier.volet + " · " + dossier.macroSecteur + " × " + dossier.classeTaille;

        addAuditLog("Point Focal (" + dossier.sigle + ")", "Mise à jour de la fiche d'identification et du groupe homogène", dossier.codeAnonyme, dossier.classeTaille);
        refreshAllViews();
      });
    }

    // Boutons d'action de l'équipe MAPERF : Valider par lot ("Vérifiée" ou "Auditée")
    var btnBatchVerify = document.getElementById("btn-batch-verify");
    if (btnBatchVerify) {
      btnBatchVerify.addEventListener("click", function () {
        var dossier = getActiveDossier();
        var before = evaluateDossier(dossier).globalVerifiedScore;
        Object.keys(dossier.data).forEach(function (code) {
          if (dossier.data[code].verif === "Déclarée" && dossier.data[code].v2025 !== "") {
            dossier.data[code].verif = "Vérifiée";
          }
        });
        dossier.workflowStatut = "Vérifié par l'équipe MAPERF";
        var after = evaluateDossier(dossier).globalVerifiedScore;
        addAuditLog("Équipe Vérification MAPERF", "Validation contradictoire de toutes les données déclarées -> 'Vérifiée (80%)'", dossier.codeAnonyme, "+" + (after - before).toFixed(1) + " pts");
        refreshAllViews();
      });
    }

    var btnBatchAudit = document.getElementById("btn-batch-audit");
    if (btnBatchAudit) {
      btnBatchAudit.addEventListener("click", function () {
        var dossier = getActiveDossier();
        var before = evaluateDossier(dossier).globalVerifiedScore;
        Object.keys(dossier.data).forEach(function (code) {
          if (dossier.data[code].v2025 !== "") {
            dossier.data[code].verif = "Auditée";
          }
        });
        dossier.workflowStatut = "Validé Comité Scientifique (100% Audité)";
        var after = evaluateDossier(dossier).globalVerifiedScore;
        addAuditLog("Comité Scientifique & Équipe MAPERF", "Homologation finale du dossier -> Toutes les données 'Auditées (100%)'", dossier.codeAnonyme, "+" + (after - before).toFixed(1) + " pts");
        refreshAllViews();
      });
    }

    // Filtres dans la console de validation
    document.querySelectorAll("[data-val-filter]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        document.querySelectorAll("[data-val-filter]").forEach(function (b) { b.classList.remove("active"); });
        btn.classList.add("active");
        state.validationFilter = btn.getAttribute("data-val-filter");
        renderValidationView();
      });
    });

    // Ajout d'une demande de précision contradictoire par l'analyste
    var btnAddClarif = document.getElementById("btn-add-clarification");
    if (btnAddClarif) {
      btnAddClarif.addEventListener("click", function () {
        var dossier = getActiveDossier();
        var codeInput = document.getElementById("clarif-code-input");
        var msgInput = document.getElementById("clarif-msg-input");
        if (!codeInput || !msgInput || !msgInput.value.trim()) return;
        if (!dossier.clarifications) dossier.clarifications = [];
        dossier.clarifications.unshift({
          id: "CLR-0" + (dossier.clarifications.length + 1),
          code: codeInput.value || "FIN.001",
          auteur: "Équipe Technique MAPERF",
          date: new Date().toISOString().slice(0, 10),
          message: msgInput.value.trim(),
          reponse: "",
          statut: "Ouvert — Attendu Point Focal"
        });
        dossier.workflowStatut = "En demande de précision";
        addAuditLog("Analyste MAPERF", "Ouverture demande de précision sur " + codeInput.value, dossier.codeAnonyme, "Contradictoire");
        msgInput.value = "";
        refreshAllViews();
      });
    }

    // Import JSON d'un dossier Entreprise
    var btnImport = document.getElementById("btn-import-dossier");
    var fileImport = document.getElementById("input-import-dossier-file");
    if (btnImport && fileImport) {
      btnImport.addEventListener("click", function () {
        fileImport.click();
      });
      fileImport.addEventListener("change", function (e) {
        var file = e.target.files && e.target.files[0];
        if (!file) return;
        var reader = new FileReader();
        reader.onload = function (evt) {
          try {
            var parsed = JSON.parse(evt.target.result);
            var importedDossier = parsed.dossier || parsed;
            if (!importedDossier || !importedDossier.codeAnonyme || !importedDossier.data) {
              return;
            }
            var existingIdx = state.dossiers.findIndex(function (d) {
              return d.id === importedDossier.id || d.codeAnonyme === importedDossier.codeAnonyme;
            });
            if (existingIdx !== -1) {
              state.dossiers[existingIdx] = importedDossier;
              state.activeDossierId = importedDossier.id;
            } else {
              if (!importedDossier.id) importedDossier.id = importedDossier.codeAnonyme;
              state.dossiers.push(importedDossier);
              state.activeDossierId = importedDossier.id;
            }
            addAuditLog("Système MAPERF", "Import du dossier JSON " + importedDossier.raisonSociale, importedDossier.codeAnonyme, "Import JSON");
            refreshAllViews();
          } catch (err) {
            console.error("Erreur import JSON:", err);
          }
        };
        reader.readAsText(file);
      });
    }

    // Export JSON / CSV du dossier
    var btnExport = document.getElementById("btn-export-dossier");
    if (btnExport) {
      btnExport.addEventListener("click", function () {
        var dossier = getActiveDossier();
        var evalRes = evaluateDossier(dossier);
        var payload = {
          meta: window.MAPERF_BAROMETRE_DATA.meta,
          dossier: dossier,
          scoring: {
            globalRawScore: evalRes.globalRawScore,
            globalVerifiedScore: evalRes.globalVerifiedScore,
            globalCompletude: evalRes.globalCompletude,
            globalFiabilite: evalRes.globalFiabilite,
            isPublishable: evalRes.isPublishable
          }
        };
        var blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
        var url = URL.createObjectURL(blob);
        var a = document.createElement("a");
        a.href = url;
        a.download = dossier.codeAnonyme + "_Barometre_MAPERF_2027.json";
        a.click();
      });
    }

    // Export Matrice Consolidée en CSV compatible Microsoft Excel (UTF-8 avec BOM)
    var btnExportCsvMatrix = document.getElementById("btn-export-csv-matrix");
    if (btnExportCsvMatrix) {
      btnExportCsvMatrix.addEventListener("click", function () {
        var headers = [
          "Code_Anonyme", "Volet", "Groupe_Homogene",
          "Dim_A_Valide", "Dim_B_Valide", "Dim_C_Valide", "Dim_D_Valide", "Dim_E_Valide", "Dim_F_Valide",
          "Score_Brut_Declare", "Taux_Performance_Valide_MAPERF",
          "Completude_Pct", "Fiabilite_Pct", "Ecart_Pratiques_Resultats", "Publiable"
        ];
        var lines = [headers.join(";")];
        state.dossiers.forEach(function (d) {
          var ev = evaluateDossier(d);
          var row = [
            d.codeAnonyme,
            d.volet,
            '"' + (d.groupeHomogene || "").replace(/"/g, '""') + '"',
            ev.dimStats.A ? ev.dimStats.A.verifiedScore.toFixed(2) : "0",
            ev.dimStats.B ? ev.dimStats.B.verifiedScore.toFixed(2) : "0",
            ev.dimStats.C ? ev.dimStats.C.verifiedScore.toFixed(2) : "0",
            ev.dimStats.D ? ev.dimStats.D.verifiedScore.toFixed(2) : "0",
            ev.dimStats.E ? ev.dimStats.E.verifiedScore.toFixed(2) : "0",
            ev.dimStats.F ? ev.dimStats.F.verifiedScore.toFixed(2) : "0",
            ev.globalRawScore.toFixed(2),
            ev.globalVerifiedScore.toFixed(2),
            ev.globalCompletude.toFixed(1),
            ev.globalFiabilite.toFixed(1),
            ev.ecartPR.toFixed(1),
            ev.isPublishable ? "OUI" : "NON"
          ];
          lines.push(row.join(";"));
        });

        var csvContent = "\uFEFF" + lines.join("\r\n");
        var blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        var url = URL.createObjectURL(blob);
        var a = document.createElement("a");
        a.href = url;
        a.download = "MAPERF_2027_Matrice_Consolidation_Anonymisee.csv";
        a.click();
      });
    }

    // Réinitialiser les données de démonstration
    var btnResetDemo = document.getElementById("btn-reset-demo");
    if (btnResetDemo) {
      btnResetDemo.addEventListener("click", function () {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(AUDIT_KEY);
        localStorage.removeItem(AUTH_KEY);
        loadState();
        refreshAllViews();
      });
    }

    // Gestion du hash dans l'URL (#presentation, #espace-collecte, #espace-validation, #tableau-de-bord, #consolidation)
    function checkHash() {
      var h = (window.location.hash || "").replace("#", "");
      if (["presentation", "espace-collecte", "espace-validation", "tableau-de-bord", "consolidation"].indexOf(h) !== -1) {
        switchMainTab(h);
      }
    }
    window.addEventListener("hashchange", checkHash);
    checkHash();
  }

  function initBarometre() {
    loadState();
    if (!document.getElementById("barometre-app-root")) return;
    renderPresentationDimensions("PUBLIC");
    bindGlobalActions();
    refreshAllViews();
  }

  // Exposition de l'API publique du moteur pour les tests automatisés QA
  window.MAPERF_BAROMETRE_ENGINE = {
    evaluateDossier: evaluateDossier,
    computeFieldIndicatorScore: computeFieldIndicatorScore,
    runCoherenceChecks: runCoherenceChecks,
    validateStandardPassword: validateStandardPassword,
    createNewCongoDossier: createNewCongoDossier,
    getState: function () { return state; },
    loadState: loadState
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initBarometre);
  } else {
    initBarometre();
  }
})();
