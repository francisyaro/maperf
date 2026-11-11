/**
 * MAPERF 2027 — Unified Header, Mega-Menu Baromètre, Mobile Navigation & Footer
 * Uniformise l'expérience UX/UI sur l'ensemble des pages de la plateforme.
 */
(function () {
  function getCurrentPage() {
    var path = window.location.pathname;
    var page = path.split('/').pop() || 'index.html';
    return page.toLowerCase();
  }

  function isBarometrePage(page) {
    return page.indexOf('barometre') === 0 || page.indexOf('plateforme') === 0;
  }

  function renderUnifiedHeader() {
    var page = getCurrentPage();
    var topBanner = document.querySelector('body > div.w-full');
    var header = document.querySelector('body > header');

    var bannerHTML =
      '<div id="maperf-top-banner" class="w-full bg-[#00236D] text-white text-xs sm:text-sm border-b border-white/10 no-print">' +
      '  <div class="container mx-auto px-4 py-2 flex flex-wrap items-center justify-between gap-2">' +
      '    <div class="flex items-center gap-2 mx-auto sm:mx-0 text-center sm:text-left">' +
      '      <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#F39A1E] text-white uppercase tracking-wider">2e Édition</span>' +
      '      <span><strong>MAPERF 2027</strong> — 17 Juin 2027 · Hilton Brazzaville Les Tours Jumelles</span>' +
      '    </div>' +
      '    <div class="hidden lg:flex items-center gap-4 text-xs text-white/85">' +
      '      <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-[#2CC3A0] animate-pulse"></span> Collecte Baromètre : <strong>21 Janv. – 19 Mars 2027</strong> (Exercices 2023–2025)</span>' +
      '      <a href="barometre.html#espace-collecte" class="underline decoration-[#F6C332] text-[#F6C332] font-semibold hover:text-white transition">Accéder au portail Entreprises & Analystes →</a>' +
      '    </div>' +
      '  </div>' +
      '</div>';

    var headerHTML =
      '<header class="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-sm no-print">' +
      '  <div class="container mx-auto px-4 py-2.5 flex items-center justify-between gap-6">' +
      '    <a href="index.html" class="flex items-center group shrink-0" aria-label="Accueil MAPERF 2027">' +
      '      <img src="logo-maperf.PNG" alt="Logo MAPERF — Les Matinées de la Performance" class="h-11 sm:h-12 w-auto transition-transform group-hover:scale-105" />' +
      '    </a>' +
      '' +
      '    <!-- Navigation Desktop Épurée (Architecture UX/UI — 6 entrées max, zéro retour à la ligne) -->' +
      '    <nav class="hidden lg:flex items-center gap-6 text-[13.5px] font-semibold text-slate-700 whitespace-nowrap" aria-label="Navigation principale">' +
      '      <a href="index.html" class="py-2 transition hover:text-[#F39A1E] ' + (page === 'index.html' ? 'text-[#00236D] font-bold border-b-2 border-[#F39A1E]' : '') + '">Accueil</a>' +
      '' +
      '      <!-- 1. Pilier Central : Méga-Menu Baromètre 2027 -->' +
      '      <div class="relative group">' +
      '        <a href="barometre.html" class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full whitespace-nowrap transition ' +
      (isBarometrePage(page)
        ? 'bg-[#00236D] text-white shadow-sm'
        : 'bg-[#00236D]/8 text-[#00236D] hover:bg-[#00236D] hover:text-white') +
      '">' +
      '          <i data-lucide="bar-chart-big" class="w-4 h-4 text-[#F39A1E] shrink-0"></i>' +
      '          <span class="font-bold">Baromètre 2027</span>' +
      '          <i data-lucide="chevron-down" class="w-3.5 h-3.5 opacity-75 shrink-0"></i>' +
      '        </a>' +
      '' +
      '        <!-- Dropdown Panel Baromètre -->' +
      '        <div class="absolute left-0 top-full pt-2 hidden group-hover:block z-50 w-[560px] whitespace-normal">' +
      '          <div class="bg-white rounded-2xl shadow-2xl border border-slate-200/90 p-5 grid grid-cols-12 gap-4 text-left">' +
      '            <div class="col-span-7 space-y-2 border-r border-slate-100 pr-4">' +
      '              <p class="text-[11px] font-bold uppercase tracking-wider text-[#00236D]/60 px-2">Portail Baromètre MAPERF 2027</p>' +
      '              <a href="barometre.html#presentation" class="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition">' +
      '                <div class="w-9 h-9 rounded-lg bg-[#00236D]/10 text-[#00236D] flex items-center justify-center shrink-0 mt-0.5"><i data-lucide="compass" class="w-4 h-4"></i></div>' +
      '                <div>' +
      '                  <p class="font-bold text-slate-900 text-xs">Présentation & Méthodologie (6 Dimensions)</p>' +
      '                  <p class="text-[11px] text-slate-500">Cadre Secteur Public (102 données) & Secteur Privé (97 données)</p>' +
      '                </div>' +
      '              </a>' +
      '              <a href="barometre.html#espace-collecte" class="flex items-start gap-3 p-2.5 rounded-xl hover:bg-amber-50/70 transition border border-amber-200/60 bg-amber-50/30">' +
      '                <div class="w-9 h-9 rounded-lg bg-[#F39A1E] text-white flex items-center justify-center shrink-0 mt-0.5"><i data-lucide="building-2" class="w-4 h-4"></i></div>' +
      '                <div>' +
      '                  <p class="font-bold text-[#00236D] text-xs">Espace Entreprise — Collecte & Preuves</p>' +
      '                  <p class="text-[11px] text-slate-600">Saisie pluriannuelle (2023–2025), 36 contrôles & dépôt de preuves</p>' +
      '                </div>' +
      '              </a>' +
      '              <a href="barometre.html#espace-validation" class="flex items-start gap-3 p-2.5 rounded-xl hover:bg-emerald-50/70 transition border border-emerald-200/60 bg-emerald-50/30">' +
      '                <div class="w-9 h-9 rounded-lg bg-[#2CC3A0] text-[#00236D] flex items-center justify-center shrink-0 mt-0.5"><i data-lucide="shield-check" class="w-4 h-4"></i></div>' +
      '                <div>' +
      '                  <p class="font-bold text-[#00236D] text-xs">Équipe MAPERF — Vérification & Validation</p>' +
      '                  <p class="text-[11px] text-slate-600">Revue contradictoire, validation des preuves & incrémentation du score</p>' +
      '                </div>' +
      '              </a>' +
      '              <a href="barometre.html#tableau-de-bord" class="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition">' +
      '                <div class="w-9 h-9 rounded-lg bg-[#00236D] text-white flex items-center justify-center shrink-0 mt-0.5"><i data-lucide="gauge" class="w-4 h-4"></i></div>' +
      '                <div>' +
      '                  <p class="font-bold text-slate-900 text-xs">Scoring 0–100 & Fiche de Restitution PDF</p>' +
      '                  <p class="text-[11px] text-slate-500">Indice global, radar 6 dimensions, écart Pratiques–Résultats</p>' +
      '                </div>' +
      '              </a>' +
      '              <a href="barometre.html#consolidation" class="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition">' +
      '                <div class="w-9 h-9 rounded-lg bg-slate-100 text-[#00236D] flex items-center justify-center shrink-0 mt-0.5"><i data-lucide="layers" class="w-4 h-4"></i></div>' +
      '                <div>' +
      '                  <p class="font-bold text-slate-900 text-xs">Matrice de Consolidation & Comité Scientifique</p>' +
      '                  <p class="text-[11px] text-slate-500">Benchmark anonymisé (PUB/PRI), quotas & export CSV/Excel</p>' +
      '                </div>' +
      '              </a>' +
      '            </div>' +
      '            <div class="col-span-5 flex flex-col justify-between">' +
      '              <div>' +
      '                <p class="text-[11px] font-bold uppercase tracking-wider text-[#00236D]/60 px-2 mb-1.5">Observatoire Sectoriel Public</p>' +
      '                <div class="space-y-0.5 text-xs">' +
      '                  <a href="barometre-economie.html" class="block px-2.5 py-1.5 rounded-lg hover:bg-slate-100 text-slate-700">Économie & Finances</a>' +
      '                  <a href="barometre-gouvernance.html" class="block px-2.5 py-1.5 rounded-lg hover:bg-slate-100 text-slate-700">Gouvernance & Souveraineté</a>' +
      '                  <a href="barometre-infrastructures.html" class="block px-2.5 py-1.5 rounded-lg hover:bg-slate-100 text-slate-700">Infrastructures</a>' +
      '                  <a href="barometre-education.html" class="block px-2.5 py-1.5 rounded-lg hover:bg-slate-100 text-slate-700">Éducation</a>' +
      '                  <a href="barometre-travail.html" class="block px-2.5 py-1.5 rounded-lg hover:bg-slate-100 text-slate-700">Travail & Action sociale</a>' +
      '                  <a href="barometre-culture.html" class="block px-2.5 py-1.5 rounded-lg hover:bg-slate-100 text-slate-700">Culture & Environnement</a>' +
      '                  <a href="barometre-defense.html" class="block px-2.5 py-1.5 rounded-lg hover:bg-slate-100 text-slate-700">Défense & Sécurité</a>' +
      '                </div>' +
      '              </div>' +
      '              <a href="plateforme.html" class="mt-2 block p-2.5 rounded-xl bg-[#00236D] text-white text-center text-xs font-bold hover:bg-[#F39A1E] transition">' +
      '                Plateforme PSRE & Réformes →' +
      '              </a>' +
      '            </div>' +
      '          </div>' +
      '        </div>' +
      '      </div>' +
      '' +
      '      <!-- 2. Menu déroulant Événement 2027 (regroupe Matinées, Trophées, Agenda & Médias) -->' +
      '      <div class="relative group">' +
      '        <a href="agenda.html" class="inline-flex items-center gap-1 py-2 transition hover:text-[#F39A1E] ' + (page === 'agenda.html' ? 'text-[#00236D] font-bold border-b-2 border-[#F39A1E]' : '') + '">' +
      '          <span>Édition 2027</span>' +
      '          <i data-lucide="chevron-down" class="w-3.5 h-3.5 opacity-70"></i>' +
      '        </a>' +
      '        <div class="absolute left-0 top-full pt-2 hidden group-hover:block z-50 w-64 whitespace-normal">' +
      '          <div class="bg-white rounded-2xl shadow-xl border border-slate-200/90 p-2.5 space-y-1 text-left text-xs">' +
      '            <a href="agenda.html" class="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-50 text-slate-800 font-semibold">' +
      '              <i data-lucide="calendar" class="w-4 h-4 text-[#00236D]"></i>' +
      '              <span>Agenda du 17 Juin 2027</span>' +
      '            </a>' +
      '            <a href="index.html#evenements" class="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-50 text-slate-700">' +
      '              <i data-lucide="presentation" class="w-4 h-4 text-[#2CC3A0]"></i>' +
      '              <span>Les Matinées & Panels</span>' +
      '            </a>' +
      '            <a href="index.html#trophees" class="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-50 text-slate-700">' +
      '              <i data-lucide="trophy" class="w-4 h-4 text-[#F39A1E]"></i>' +
      '              <span>Les Trophées MAPERF</span>' +
      '            </a>' +
      '            <a href="index.html#medias" class="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-50 text-slate-700">' +
      '              <i data-lucide="image" class="w-4 h-4 text-slate-500"></i>' +
      '              <span>Médias & Rétrospective</span>' +
      '            </a>' +
      '          </div>' +
      '        </div>' +
      '      </div>' +
      '' +
      '      <a href="actualites.html" class="py-2 transition hover:text-[#F39A1E] ' + (page === 'actualites.html' ? 'text-[#00236D] font-bold border-b-2 border-[#F39A1E]' : '') + '">Actualités</a>' +
      '      <a href="forum.html" class="py-2 transition hover:text-[#F39A1E] ' + (page === 'forum.html' ? 'text-[#00236D] font-bold border-b-2 border-[#F39A1E]' : '') + '">Forum</a>' +
      '      <a href="index.html#inscription" class="py-2 transition hover:text-[#F39A1E]">Contact</a>' +
      '    </nav>' +
      '' +
      '    <!-- Actions Droite Desktop (Compactes & Sans débordement) -->' +
      '    <div class="hidden lg:flex items-center gap-2.5 shrink-0 whitespace-nowrap">' +
      '      <a href="barometre.html#espace-collecte" class="btn btn-outline text-xs px-3.5 py-2">' +
      '        <i data-lucide="building-2" class="w-3.5 h-3.5 text-[#00236D]"></i>' +
      '        <span>Espace Entreprise</span>' +
      '      </a>' +
      '      <a href="inscription.html" class="btn btn-primary text-xs px-4 py-2">' +
      '        <i data-lucide="user-plus" class="w-3.5 h-3.5"></i>' +
      '        <span>S\'inscrire</span>' +
      '      </a>' +
      '    </div>' +
      '' +
      '    <!-- Bouton Hamburger Mobile -->' +
      '    <button id="maperf-mobile-menu-btn" type="button" class="lg:hidden inline-flex items-center justify-center p-2.5 rounded-xl border border-slate-200 text-[#00236D] hover:bg-slate-100 focus:outline-none" aria-label="Ouvrir le menu">' +
      '      <i data-lucide="menu" class="w-6 h-6"></i>' +
      '    </button>' +
      '  </div>' +
      '' +
      '  <!-- Menu Mobile Déroulant -->' +
      '  <div id="maperf-mobile-menu" class="hidden lg:hidden bg-white border-t border-slate-200 px-4 pt-3 pb-6 shadow-xl">' +
      '    <div class="grid gap-1 text-sm font-semibold text-slate-800">' +
      '      <a href="index.html" class="px-3 py-2.5 rounded-lg hover:bg-slate-50">Accueil</a>' +
      '      <a href="barometre.html" class="px-3 py-2.5 rounded-lg bg-[#00236D]/8 text-[#00236D] font-bold flex items-center justify-between">' +
      '        <span>Portail Baromètre MAPERF 2027</span>' +
      '        <span class="text-[10px] px-2 py-0.5 rounded-full bg-[#F39A1E] text-white">Prioritaire</span>' +
      '      </a>' +
      '      <div class="pl-4 border-l-2 border-[#00236D]/15 ml-3 space-y-1 text-xs text-slate-600 my-1">' +
      '        <a href="barometre.html#espace-collecte" class="block py-1.5 font-semibold text-[#00236D]">→ Espace Entreprise (Saisie & Preuves)</a>' +
      '        <a href="barometre.html#espace-validation" class="block py-1.5 font-semibold text-emerald-700">→ Espace Équipe MAPERF (Vérification & Validation)</a>' +
      '        <a href="barometre.html#tableau-de-bord" class="block py-1.5">→ Tableau de bord & Restitution 0–100</a>' +
      '        <a href="barometre.html#consolidation" class="block py-1.5">→ Consolidation & Comité Scientifique</a>' +
      '        <a href="barometre-economie.html" class="block py-1.5">→ Observatoire Sectoriel (7 secteurs)</a>' +
      '      </div>' +
      '      <a href="agenda.html" class="px-3 py-2.5 rounded-lg hover:bg-slate-50">Agenda 2027</a>' +
      '      <a href="actualites.html" class="px-3 py-2.5 rounded-lg hover:bg-slate-50">Actualités</a>' +
      '      <a href="forum.html" class="px-3 py-2.5 rounded-lg hover:bg-slate-50">Forum Citoyen</a>' +
      '      <a href="plateforme.html" class="px-3 py-2.5 rounded-lg hover:bg-slate-50">Plateforme PSRE</a>' +
      '      <a href="index.html#inscription" class="px-3 py-2.5 rounded-lg hover:bg-slate-50">Contact</a>' +
      '    </div>' +
      '    <div class="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-2.5">' +
      '      <a href="barometre.html#espace-collecte" class="btn btn-ghost w-full justify-center">Accéder au Baromètre 2027</a>' +
      '      <a href="inscription.html" class="btn btn-primary w-full justify-center">S\'inscrire à MAPERF 2027</a>' +
      '    </div>' +
      '  </div>' +
      '</header>';

    if (topBanner) {
      topBanner.outerHTML = bannerHTML;
    } else {
      document.body.insertAdjacentHTML('afterbegin', bannerHTML);
    }

    if (header) {
      header.outerHTML = headerHTML;
    }
  }

  function renderUnifiedFooter() {
    var footer = document.querySelector('body > footer');
    if (!footer) return;

    footer.outerHTML =
      '<footer class="bg-[#00236D] text-white pt-14 pb-10 border-t-4 border-[#F39A1E] no-print">' +
      '  <div class="container mx-auto px-4">' +
      '    <div class="grid md:grid-cols-2 lg:grid-cols-12 gap-8 pb-10 border-b border-white/10">' +
      '      <div class="lg:col-span-4 space-y-3">' +
      '        <div class="flex items-center gap-3">' +
      '          <img src="logo-maperf.PNG" alt="MAPERF" class="h-12 w-auto bg-white rounded-xl p-1.5" />' +
      '          <div>' +
      '            <p class="font-display font-extrabold text-lg tracking-tight text-white">MAPERF 2027</p>' +
      '            <p class="text-xs text-[#2CC3A0] font-semibold">2e Édition — 17 Juin 2027 · Brazzaville</p>' +
      '          </div>' +
      '        </div>' +
      '        <p class="text-xs text-white/80 leading-relaxed">' +
      '          Plateforme nationale de référence pour la mesure, la vérification contradictoire et la valorisation de la performance des entreprises publiques et privées en République du Congo.' +
      '        </p>' +
      '        <div class="pt-1 flex flex-wrap gap-2 text-[11px]">' +
      '          <span class="px-2.5 py-1 rounded-md bg-white/10 text-white/90 font-semibold">Owando Consulting</span>' +
      '          <span class="px-2.5 py-1 rounded-md bg-white/10 text-white/90 font-semibold">ACE</span>' +
      '          <span class="px-2.5 py-1 rounded-md bg-white/10 text-white/90 font-semibold">Agence Ambition</span>' +
      '        </div>' +
      '      </div>' +
      '' +
      '      <div class="lg:col-span-3 space-y-2 text-sm">' +
      '        <p class="font-display font-bold text-[#F6C332] text-xs uppercase tracking-wider mb-3">Baromètre MAPERF 2027</p>' +
      '        <ul class="space-y-2 text-xs text-white/80">' +
      '          <li><a href="barometre.html#presentation" class="hover:text-[#F39A1E] transition">Cadre méthodologique & 6 Dimensions</a></li>' +
      '          <li><a href="barometre.html#espace-collecte" class="hover:text-[#F39A1E] transition">Collecte Secteur Public (PUB-2027)</a></li>' +
      '          <li><a href="barometre.html#espace-collecte" class="hover:text-[#F39A1E] transition">Collecte Secteur Privé (PRI-2027)</a></li>' +
      '          <li><a href="barometre.html#espace-validation" class="hover:text-[#F39A1E] transition">Espace Vérification & Validation MAPERF</a></li>' +
      '          <li><a href="barometre.html#tableau-de-bord" class="hover:text-[#F39A1E] transition">Fiches de restitution & Scoring 0–100</a></li>' +
      '        </ul>' +
      '      </div>' +
      '' +
      '      <div class="lg:col-span-2 space-y-2 text-sm">' +
      '        <p class="font-display font-bold text-[#F6C332] text-xs uppercase tracking-wider mb-3">Navigation</p>' +
      '        <ul class="space-y-2 text-xs text-white/80">' +
      '          <li><a href="index.html" class="hover:text-[#F39A1E] transition">Accueil</a></li>' +
      '          <li><a href="agenda.html" class="hover:text-[#F39A1E] transition">Agenda & Programme</a></li>' +
      '          <li><a href="actualites.html" class="hover:text-[#F39A1E] transition">Actualités</a></li>' +
      '          <li><a href="forum.html" class="hover:text-[#F39A1E] transition">Forum Citoyen</a></li>' +
      '          <li><a href="plateforme.html" class="hover:text-[#F39A1E] transition">Plateforme PSRE</a></li>' +
      '          <li><a href="inscription.html" class="hover:text-[#F39A1E] transition">Inscription 2027</a></li>' +
      '        </ul>' +
      '      </div>' +
      '' +
      '      <div class="lg:col-span-3 space-y-2 text-xs text-white/80">' +
      '        <p class="font-display font-bold text-[#F6C332] text-xs uppercase tracking-wider mb-3">Secrétariat Technique</p>' +
      '        <p class="font-semibold text-white">Hilton Brazzaville Les Tours Jumelles</p>' +
      '        <p>Brazzaville, République du Congo</p>' +
      '        <p>E-mail : <a href="mailto:contact@maperf.org" class="text-[#2CC3A0] underline">contact@maperf.org</a></p>' +
      '        <div class="pt-3">' +
      '          <a href="barometre.html#espace-collecte" class="btn btn-primary text-xs py-2 px-4 w-full justify-center">Soumettre les données 2023–2025</a>' +
      '        </div>' +
      '      </div>' +
      '    </div>' +
      '' +
      '    <div class="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/65">' +
      '      <p>© 2027 MAPERF — Les Matinées & Journées de la Performance. Tous droits réservés.</p>' +
      '      <p>Gouvernance : Comité d\'Orientation Stratégique (COS) · Comité Scientifique Indépendant · Secrétariat Technique</p>' +
      '    </div>' +
      '  </div>' +
      '</footer>';
  }

  function bindMobileMenu() {
    var btn = document.getElementById('maperf-mobile-menu-btn');
    var menu = document.getElementById('maperf-mobile-menu');
    if (btn && menu) {
      btn.addEventListener('click', function () {
        menu.classList.toggle('hidden');
      });
    }
  }

  function initLayout() {
    renderUnifiedHeader();
    renderUnifiedFooter();
    bindMobileMenu();
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLayout);
  } else {
    initLayout();
  }
})();
