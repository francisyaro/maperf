/**
 * MAPERF 2027 — Référentiel centralisé des contenus, dates, rôles et paramètres (Maquette V2)
 * Source : Revue de la maquette du site MAPERF v2.0 (19 novembre 2026), Plan d'action v2.0 et TDR du Baromètre.
 * Règle : Distingue explicitement les informations validées, les hypothèses de travail et les contenus en attente.
 */
window.MAPERF_CONFIG = {
  versionMaquette: "2.0 (Révision du 19 novembre 2026)",
  modeDemonstration: true,

  evenement: {
    nom: "Semaine MAPERF 2027",
    sousTitre: "Les Matinées de la Performance",
    edition: "2e édition",
    datesTexte: "16, 17 et 18 juin 2027",
    datesCourtes: "16 au 18 juin 2027",
    dateDebutISO: "2027-06-16", // Heure de début non arrêtée : compte à rebours affiché uniquement en jours
    lieu: "Hôtel Kempinski, Brazzaville",
    pays: "République du Congo",
    devise: "Outiller, anticiper, performer",
    themeStatut: "En attente de validation du comité",
    themeProvisoire: "Performance durable, gouvernance et compétitivité des organisations publiques et privées en République du Congo",
    bandeauActualite: "Pré-inscriptions ouvertes pour la Semaine MAPERF 2027 (16 au 18 juin) · Ouverture du portail du Baromètre le 15 mars 2027"
  },

  troisJournees: [
    {
      id: "jour-1",
      date: "16 juin 2027",
      titre: "Journée des entrepreneurs",
      publicCible: "Entrepreneurs, dirigeants de PME, porteurs de projets et partenaires financiers",
      resume: "Ateliers pratiques, rencontres d'affaires et outils de structuration pour accompagner la croissance et la performance des PME congolaises.",
      tarif: "Tarif en attente de confirmation par le comité",
      tarifStatut: "CONTENU_ATTENDU",
      horairesStatut: "Programme horodaté en cours de finalisation par le comité d'organisation.",
      lien: "semaine-maperf.html#jour-16-juin"
    },
    {
      id: "jour-2",
      date: "17 juin 2027",
      titre: "Matinées et Trophées",
      publicCible: "Dirigeants d'entreprises publiques et privées, décideurs institutionnels, administrateurs et experts",
      resume: "Conférences plénières, panels de haut niveau, présentation officielle des résultats du Baromètre MAPERF 2027 et cérémonie de remise des Trophées du Manager de la Performance.",
      tarif: "50 000 FCFA",
      tarifMontant: 50000,
      tarifStatut: "VALIDE_PLAN_V2",
      horairesStatut: "Programme horodaté détaillé en cours de finalisation par le comité d'organisation.",
      lien: "semaine-maperf.html#jour-17-juin"
    },
    {
      id: "jour-3",
      date: "18 juin 2027",
      titre: "Masterclass",
      publicCible: "Directeurs généraux, cadres dirigeants, directeurs financiers, auditeurs et responsables qualité/performance",
      resume: "Session d'approfondissement méthodologique et stratégique animée avec la participation du Grand témoin M. Denis Charles Kouassi.",
      tarif: "Tarif en attente de confirmation par le comité",
      tarifStatut: "CONTENU_ATTENDU",
      horairesStatut: "Programme horodaté en cours de finalisation par le comité d'organisation.",
      lien: "semaine-maperf.html#jour-18-juin"
    }
  ],

  noteDecoupageTroisJours: "Hypothèse de travail issue des sections détaillées de la revue v2.0 (16 juin : Journée des entrepreneurs ; 17 juin : Matinées et Trophées ; 18 juin : Masterclass). Note au comité : une annotation de la grille d'appréciation évoque également des Matinées réparties sur trois jours — arbitrage définitif attendu avec le programme horodaté.",

  grandTemoin: {
    nom: "M. Denis Charles Kouassi",
    role: "Grand témoin de la Semaine MAPERF 2027",
    presence: "17 et 18 juin 2027 (Matinées et Masterclass)",
    statutConfirmation: "Mentionné dans le plan d'action v2.0 — Biographie officielle et portrait autorisé en attente de transmission.",
    photo: null
  },

  intervenantsReference: [
    {
      nom: "Dr Séverin Aimé Blanchard Ouadika",
      titre: "Maître-assistant CAMES · Directeur général de l'évaluation des réformes au ministère en charge de la réforme de l'État",
      photo: "orateur-1.JPG",
      edition: "Intervenant — Édition 2025 et comité scientifique"
    },
    {
      nom: "M. Ariel Ibata Bidie",
      titre: "Managing Partner d'Owando Consulting · Consultant senior en systèmes de management et excellence opérationnelle (PMP®, ISO 9001/31000/22301)",
      photo: "orateur-2.JPG",
      edition: "Initiateur MAPERF — Owando Consulting"
    },
    {
      nom: "M. Sebilo Amégas",
      titre: "Conseiller à la qualité du service public au ministère du contrôle d'État, de la qualité du service public et de la lutte contre les antivaleurs",
      photo: "orateur-3.JPG",
      edition: "Intervenant — Édition 2025"
    },
    {
      nom: "Dr Jean Daniel Ovaga",
      titre: "Président de l'Union nationale des opérateurs économiques du Congo (UNOC)",
      photo: "orateur-4.JPG",
      edition: "Intervenant — Édition 2025"
    }
  ],

  gouvernanceRoles: {
    initiativeMaperf: "Owando Consulting",
    organisationMaperf: "Agence Ambition et Association Congolaise de l'Évaluation (ACE)",
    coInitiateursBarometre: "Owando Consulting, Agence Ambition et Association Congolaise de l'Évaluation (ACE)"
  },

  contact: {
    email: "infos@maperf.org",
    telephone: "+242 06628 5214",
    telephoneAffichage: "+242 06 628 52 14",
    structure: "Owando Consulting (Secrétariat technique MAPERF)",
    ville: "Brazzaville, République du Congo",
    adresseDetaillee: "Adresse postale complète d'Owando Consulting à confirmer pour publication définitive",
    lieuEvenement: "Hôtel Kempinski, Brazzaville, République du Congo"
  },

  barometre: {
    nomIndice: "Indice MAPERF",
    echelle: "0 à 100",
    exercices: [2023, 2024, 2025],
    ciblesEchantillon: {
      publicCible: 20,
      publicSeuilMin: 15,
      priveCible: 50,
      priveSeuilMin: 30,
      priveEffectifMin: 10
    },
    nombreDonneesReference: {
      noteComite: "TDR : 103 (secteur public) et 104 (secteur privé) — version définitive à arrêter par le comité scientifique. La maquette conserve le schéma fonctionnel sans ajout ni suppression artificielle de questions."
    },
    etatPublication: {
      resultatsPublies: false,
      validationCOS: false,
      messageConsolidationAttente: "Résultats disponibles après validation du COS",
      messageBenchmarkAttente: "Le profil comparé au groupe homogène sera disponible après la publication officielle des résultats prévue le 17 juin 2027 et validation du Comité d'orientation stratégique (COS)."
    },
    calendrier2027: [
      { jalon: "Ouverture du portail", date: "15 mars 2027", description: "Ouverture des accès sécurisés aux organisations engagées et désignation des points focaux." },
      { jalon: "Lancement du Baromètre", date: "23 mars 2027", description: "Lancement officiel de la campagne nationale de collecte sur les exercices 2023, 2024 et 2025." },
      { jalon: "Fin de collecte", date: "7 mai 2027", description: "Clôture du dépôt des questionnaires et des pièces justificatives par les entreprises." },
      { jalon: "Validation contradictoire", date: "Du 10 au 21 mai 2027", description: "Vérification par l'équipe MAPERF, consultation des scores provisoires par chaque organisation (« J'accepte » ou « Je formule une observation ») et homologation." },
      { jalon: "Publication des résultats", date: "Prévue le 17 juin 2027", description: "Présentation officielle des résultats agrégés et remise des fiches de restitution lors des Matinées à l'Hôtel Kempinski, sous réserve de validation par le COS." }
    ]
  },

  trophees: {
    titre: "Trophées du Manager de la Performance",
    categories: [
      {
        id: "manager-public",
        titre: "Trophée du Manager de la Performance — Secteur public",
        cible: "Dirigeants et managers d'entreprises ou d'établissements publics à caractère industriel, commercial ou de service en République du Congo.",
        description: "Récompense un dirigeant public ayant démontré un leadership exemplaire dans la gouvernance, la qualité du service rendu aux usagers, la maîtrise financière et la modernisation."
      },
      {
        id: "manager-prive",
        titre: "Trophée du Manager de la Performance — Secteur privé",
        cible: "Dirigeants et managers d'entreprises privées opérant en République du Congo.",
        description: "Récompense un dirigeant du secteur privé s'étant illustré par la création de valeur durable, la compétitivité, le développement du contenu local et du capital humain."
      }
    ],
    distinctionBarometreNote: "Les deux Trophées du Manager de la Performance (candidatures individuelles évaluées par le jury) sont distincts des distinctions collectives du Baromètre MAPERF, lesquelles sont adossées exclusivement aux résultats de l'Indice MAPERF présentés le 17 juin 2027."
  },

  feuilleDeRouteProjet: [
    { etape: "Maquette V2", contenu: "Armature, page d'accueil et design révisés selon la revue v2.0", echeance: "15 décembre 2026", statut: "Réalisé (en revue)" },
    { etape: "Validation", contenu: "Revue de la maquette V2 par le comité d'organisation", echeance: "18 décembre 2026", statut: "Décision attendue" },
    { etape: "Contenus", contenu: "Textes définitifs, programme horodaté, Trophées, tarifs partenariat, photos et logos autorisés", echeance: "31 janvier 2027", statut: "Contenu attendu" },
    { etape: "Site public en ligne", contenu: "Mise en ligne sur www.maperf.org avec billetterie et candidatures aux Trophées", echeance: "16 février 2027", statut: "Planifié" },
    { etape: "Portail final", contenu: "Développement connecté à partir de la maquette, avec serveur et comptes individuels", echeance: "1er mars 2027", statut: "Planifié" },
    { etape: "Recette et test d'intrusion", contenu: "Tests complets de sécurité et de charge avec trois à cinq organisations pilotes", echeance: "12 mars 2027", statut: "Planifié" },
    { etape: "Ouverture du portail", contenu: "Création des comptes individuels des organisations engagées", echeance: "15 mars 2027", statut: "Planifié" }
  ]
};
