-- =============================================================================
-- MAPERF 2027 — SCHÉMA POSTGRESQL / SUPABASE (Multi-Tenant B2B/B2G + RLS + Audit)
-- Plateforme du Baromètre de la Performance des Entreprises Publiques et Privées
-- =============================================================================

create extension if not exists "pgcrypto";

-- 1. Énumérations Métier Officielles (TDR & Classeurs Excel MAPERF 2027)
create type maperf_volet as enum ('PUBLIC', 'PRIVE');
create type maperf_taille_classe as enum ('PME 10-49', 'PME 50-249', 'GE 250+');
create type maperf_applicabilite as enum ('Applicable', 'Non applicable', 'Non disponible');
create type maperf_statut_verif as enum ('Déclarée', 'Vérifiée', 'Auditée');
create type maperf_statut_dossier as enum (
  'BROUILLON',
  'EN_SAISIE',
  'SOUMIS_POUR_REVUE',
  'EN_DEMANDE_PRECISION',
  'VERIFIE_EQUIPE_MAPERF',
  'HOMOLOGUE_COMITE_SCIENTIFIQUE'
);
create type maperf_role_utilisateur as enum (
  'POINT_FOCAL_ENTREPRISE',
  'DIRIGEANT_ENTREPRISE',
  'ANALYSTE_MAPERF',
  'MEMBRE_COMITE_SCIENTIFIQUE',
  'ADMIN_SECRETARIAT_TECHNIQUE'
);

-- 2. Table des Organisations Participantes (01_Identification)
create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  code_anonyme text unique not null check (code_anonyme ~ '^(PUB|PRI)-2027-[0-9]{3,4}$'),
  volet maperf_volet not null,
  raison_sociale text not null,
  sigle text,
  statut_juridique text not null,
  ministere_tutelle text,
  macro_secteur text not null,
  ville_siege text not null,
  departement text not null,
  effectif_2025 integer not null check (effectif_2025 >= 0),
  classe_taille maperf_taille_classe generated always as (
    case
      when effectif_2025 >= 250 then 'GE 250+'::maperf_taille_classe
      when effectif_2025 >= 50 then 'PME 50-249'::maperf_taille_classe
      else 'PME 10-49'::maperf_taille_classe
    end
  ) stored,
  soumis_osp boolean not null default false,
  contrat_performance_etat boolean not null default false,
  point_focal_nom text not null,
  point_focal_fonction text not null,
  point_focal_email text not null,
  point_focal_tel text,
  engagement_confidentialite boolean not null default false,
  declaration_exactitude boolean not null default false,
  statut_dossier maperf_statut_dossier not null default 'EN_SAISIE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. Profils Utilisateurs & Habilitations RBAC
create table public.user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  organization_id uuid references public.organizations(id) on delete set null,
  role maperf_role_utilisateur not null default 'POINT_FOCAL_ENTREPRISE',
  nom_complet text not null,
  email text not null,
  mfa_enabled boolean not null default false,
  created_at timestamptz not null default now()
);

-- 4. Valeurs Pluriannuelles Collectées (2023 N-2, 2024 N-1, 2025 N)
create table public.metric_entries (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  code_donnee text not null,
  rubrique text not null check (rubrique in ('FIN', 'OPE', 'GOU', 'TRA', 'RHD')),
  dimension_code text not null check (dimension_code in ('A', 'B', 'C', 'D', 'E', 'F')),
  applicabilite maperf_applicabilite not null default 'Applicable',
  val_2023 numeric,
  val_2024 numeric,
  val_2025 numeric,
  statut_verification maperf_statut_verif not null default 'Déclarée',
  poids_fiabilite numeric generated always as (
    case statut_verification
      when 'Auditée' then 1.00
      when 'Vérifiée' then 0.80
      else 0.50
    end
  ) stored,
  score_brut_normalise numeric check (score_brut_normalise between 0 and 100),
  score_valide_pondere numeric check (score_valide_pondere between 0 and 100),
  code_preuve_liee text,
  commentaire_entreprise text,
  commentaire_analyste text,
  verified_by uuid references auth.users(id),
  verified_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (organization_id, code_donnee)
);

-- 5. Registre des Pièces Justificatives (07_Sources_et_preuves — Archivage PDF/A ISO 19005)
create table public.evidence_documents (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  code_doc text not null,
  titre text not null,
  storage_path text not null,
  mime_type text not null,
  sha256_hash text not null,
  is_pdfa_compliant boolean not null default false,
  statut_revue text not null default 'Transmis' check (statut_revue in ('Non fourni', 'Transmis', 'En cours de revue', 'Validé', 'Rejeté')),
  observation_analyste text,
  uploaded_by uuid references auth.users(id),
  reviewed_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, code_doc)
);

-- 6. Demandes de Précisions Contradictoires
create table public.clarification_threads (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  code_donnee text not null,
  question_analyste text not null,
  reponse_entreprise text,
  statut text not null default 'OUVERT' check (statut in ('OUVERT', 'REPONDU', 'RESOLU')),
  created_by uuid references auth.users(id),
  resolved_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 7. Journal d'Audit Immuable (Audit Trail ISO / OWASP)
create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete cascade,
  actor_id uuid references auth.users(id),
  actor_role text not null,
  action_type text not null,
  target_code text,
  previous_value jsonb,
  new_value jsonb,
  impact_score_delta numeric,
  ip_address inet,
  created_at timestamptz not null default now()
);

-- 8. Politiques Row Level Security (RLS) — Cloisonnement strict Inter-Entreprises
alter table public.organizations enable row level security;
alter table public.metric_entries enable row level security;
alter table public.evidence_documents enable row level security;
alter table public.clarification_threads enable row level security;
alter table public.audit_logs enable row level security;

-- Une entreprise ne voit et ne modifie QUE son propre dossier ; l'équipe MAPERF voit tous les dossiers
create policy "Isolation Entreprise ou Accès Équipe MAPERF sur organizations"
  on public.organizations
  for all
  using (
    id in (select organization_id from public.user_profiles where user_id = auth.uid())
    or exists (
      select 1 from public.user_profiles
      where user_id = auth.uid()
      and role in ('ANALYSTE_MAPERF', 'MEMBRE_COMITE_SCIENTIFIQUE', 'ADMIN_SECRETARIAT_TECHNIQUE')
    )
  );

create policy "Isolation Entreprise ou Accès Équipe MAPERF sur metric_entries"
  on public.metric_entries
  for all
  using (
    organization_id in (select organization_id from public.user_profiles where user_id = auth.uid())
    or exists (
      select 1 from public.user_profiles
      where user_id = auth.uid()
      and role in ('ANALYSTE_MAPERF', 'MEMBRE_COMITE_SCIENTIFIQUE', 'ADMIN_SECRETARIAT_TECHNIQUE')
    )
  );
