/**
 * MAPERF 2027 — En-tête unifié, navigation publique V2 et pied de page institutionnel
 * Conforme à la Revue de la maquette v2.0 du 19 novembre 2026 :
 * - Arborescence centrée sur la Semaine MAPERF 2027, le Baromètre et les Trophées
 * - Sous-menu Baromètre limité à 3 entrées (Présentation et méthode, Calendrier, Espace Entreprise)
 * - Retrait de l'Observatoire sectoriel, de la Plateforme PSRE et du Forum de la navigation active
 * - Aucun lien public vers la console de l'équipe MAPERF
 * - Deux boutons d'en-tête distincts : « Espace Entreprise » (turquoise) et « S'inscrire » (orange)
 */
(function () {
  function getCurrentPage() {
    var path = window.location.pathname;
    var page = path.split('/').pop() || 'index.html';
    return page.toLowerCase();
  }

  function renderUnifiedHeader() {
    var page = getCurrentPage();
    var topBanner = document.querySelector('body > div.w-full');
    var header = document.querySelector('body > header');

    var isSemaine = page === 'semaine-maperf.html' || page === 'agenda.html';
    var isBarometre = page === 'barometre.html' || page === 'espace-entreprise.html';

    // Bandeau supérieur : réservé à une information d'actualité sans répéter la date et le lieu du bandeau principal
    var bannerHTML =
      '<div id="maperf-top-banner" class="w-full bg-[#00236D] text-white text-xs sm:text-sm border-b border-white/10 no-print">' +
      '  <div class="container mx-auto px-4 py-2 flex flex-wrap items-center justify-between gap-2">' +
      '    <div class="flex items-center gap-2 mx-auto sm:mx-0 text-center sm:text-left">' +
      '      <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#2CC3A0] text-[#00236D]">' +
      '        <span class="w-2 h-2 rounded-full bg-[#00236D] animate-pulse"></span> Actualité' +
      '      </span>' +
      '      <span>Pré-inscriptions ouvertes pour la Semaine MAPERF 2027 · Ouverture du portail du Baromètre le 15 mars 2027</span>' +
      '    </div>' +
      '    <div class="hidden lg:flex items-center gap-4 text-xs text-white/90">' +
      '      <a href="barometre.html#calendrier" class="underline decoration-[#F6C332] text-[#F6C332] font-semibold hover:text-white transition">Calendrier du Baromètre →</a>' +
      '      <a href="mentions-legales.html#contact" class="text-white/85 hover:text-white transition">infos@maperf.org · +242 06 628 52 14</a>' +
      '    </div>' +
      '  </div>' +
      '</div>';

    var navLinkClass = function (active) {
      return 'py-2 transition hover:text-[#F39A1E] ' + (active ? 'text-[#00236D] font-bold border-b-2 border-[#F39A1E]' : 'text-slate-700');
    };

    var headerHTML =
      '<header class="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-sm no-print">' +
      '  <div class="container mx-auto px-4 py-2.5 flex items-center justify-between gap-4">' +
      '    <a href="index.html" class="flex items-center group shrink-0" aria-label="Accueil Semaine MAPERF 2027">' +
      '      <img src="assets/images/logo-maperf-light.svg" onerror="this.onerror=null;this.src=\'logo-maperf.PNG\';" alt="Logo MAPERF — Les Matinées de la Performance" class="h-11 sm:h-12 w-auto transition-transform group-hover:scale-105" />' +
      '    </a>' +
      '' +
      '    <!-- Navigation principale publique (V2) -->' +
      '    <nav class="hidden xl:flex items-center gap-5 text-[14px] font-semibold whitespace-nowrap" aria-label="Navigation principale">' +
      '      <a href="index.html" class="' + navLinkClass(page === 'index.html') + '">Accueil</a>' +
      '      <a href="semaine-maperf.html" class="' + navLinkClass(isSemaine) + '">La Semaine MAPERF</a>' +
      '' +
      '      <!-- Sous-menu Baromètre limité strictement aux 3 entrées demandées -->' +
      '      <div class="relative group">' +
      '        <a href="barometre.html" class="inline-flex items-center gap-1.5 py-2 transition hover:text-[#F39A1E] ' + (isBarometre ? 'text-[#00236D] font-bold border-b-2 border-[#F39A1E]' : 'text-slate-700') + '">' +
      '          <span>Baromètre</span>' +
      '          <i data-lucide="chevron-down" class="w-4 h-4 opacity-75"></i>' +
      '        </a>' +
      '        <div class="absolute left-0 top-full pt-2 hidden group-hover:block focus-within:block z-50 w-72 whitespace-normal">' +
      '          <div class="bg-white rounded-2xl shadow-xl border border-slate-200/90 p-3 space-y-1 text-left">' +
      '            <a href="barometre.html#presentation" class="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition">' +
      '              <div class="w-9 h-9 rounded-lg bg-[#00236D]/10 text-[#00236D] flex items-center justify-center shrink-0"><i data-lucide="compass" class="w-4 h-4"></i></div>' +
      '              <div>' +
      '                <p class="font-bold text-slate-900 text-sm">Présentation et méthode</p>' +
      '                <p class="text-xs text-slate-500">Six dimensions, Indice MAPERF et confidentialité</p>' +
      '              </div>' +
      '            </a>' +
      '            <a href="barometre.html#calendrier" class="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition">' +
      '              <div class="w-9 h-9 rounded-lg bg-[#F39A1E]/15 text-[#F39A1E] flex items-center justify-center shrink-0"><i data-lucide="calendar" class="w-4 h-4"></i></div>' +
      '              <div>' +
      '                <p class="font-bold text-slate-900 text-sm">Calendrier</p>' +
      '                <p class="text-xs text-slate-500">Jalons du 15 mars au 17 juin 2027</p>' +
      '              </div>' +
      '            </a>' +
      '            <a href="espace-entreprise.html" class="flex items-start gap-3 p-2.5 rounded-xl hover:bg-emerald-50/70 transition border border-emerald-200/60 bg-emerald-50/30">' +
      '              <div class="w-9 h-9 rounded-lg bg-[#2CC3A0] text-[#00236D] flex items-center justify-center shrink-0"><i data-lucide="building-2" class="w-4 h-4"></i></div>' +
      '              <div>' +
      '                <p class="font-bold text-[#00236D] text-sm">Espace Entreprise</p>' +
      '                <p class="text-xs text-slate-600">Collecte 2023–2025, preuves et validation contradictoire</p>' +
      '              </div>' +
      '            </a>' +
      '          </div>' +
      '        </div>' +
      '      </div>' +
      '' +
      '      <a href="trophees.html" class="' + navLinkClass(page === 'trophees.html') + '">Trophées</a>' +
      '      <a href="partenaires.html" class="' + navLinkClass(page === 'partenaires.html') + '">Devenir partenaire</a>' +
      '      <a href="retour-2025.html" class="' + navLinkClass(page === 'retour-2025.html') + '">Retour sur 2025</a>' +
      '      <a href="actualites.html" class="' + navLinkClass(page === 'actualites.html') + '">Actualités</a>' +
      '      <a href="mentions-legales.html#contact" class="' + navLinkClass(page === 'mentions-legales.html') + '">Contact</a>' +
      '    </nav>' +
      '' +
      '    <!-- Deux boutons d\'en-tête distincts : Espace Entreprise (secondaire turquoise) et S\'inscrire (principal orange) -->' +
      '    <div class="hidden lg:flex items-center gap-2.5 shrink-0 whitespace-nowrap">' +
      '      <a href="espace-entreprise.html" class="btn btn-teal text-sm px-4 py-2">' +
      '        <i data-lucide="building-2" class="w-4 h-4"></i>' +
      '        <span>Espace Entreprise</span>' +
      '      </a>' +
      '      <a href="inscription.html" class="btn btn-primary text-sm px-4 py-2">' +
      '        <i data-lucide="ticket" class="w-4 h-4"></i>' +
      '        <span>S\'inscrire</span>' +
      '      </a>' +
      '    </div>' +
      '' +
      '    <!-- Bouton menu mobile (zone tactile >= 44px) -->' +
      '    <button id="maperf-mobile-menu-btn" type="button" class="xl:hidden inline-flex items-center justify-center min-w-[44px] min-h-[44px] p-2.5 rounded-xl border border-slate-200 text-[#00236D] hover:bg-slate-100 focus:outline-none" aria-label="Ouvrir le menu">' +
      '      <i data-lucide="menu" class="w-6 h-6"></i>' +
      '    </button>' +
      '  </div>' +
      '' +
      '  <!-- Menu mobile déroulant -->' +
      '  <div id="maperf-mobile-menu" class="hidden xl:hidden bg-white border-t border-slate-200 px-4 pt-3 pb-6 shadow-xl">' +
      '    <div class="grid gap-1 text-sm font-semibold text-slate-800">' +
      '      <a href="index.html" class="px-3 py-3 rounded-lg hover:bg-slate-50">Accueil</a>' +
      '      <a href="semaine-maperf.html" class="px-3 py-3 rounded-lg hover:bg-slate-50">La Semaine MAPERF (16 au 18 juin 2027)</a>' +
      '      <a href="barometre.html" class="px-3 py-3 rounded-lg bg-[#00236D]/8 text-[#00236D] font-bold">Baromètre MAPERF</a>' +
      '      <div class="pl-4 border-l-2 border-[#00236D]/15 ml-3 space-y-1 text-sm text-slate-600 my-1">' +
      '        <a href="barometre.html#presentation" class="block py-2">→ Présentation et méthode</a>' +
      '        <a href="barometre.html#calendrier" class="block py-2">→ Calendrier 2027</a>' +
      '        <a href="espace-entreprise.html" class="block py-2 font-bold text-[#00236D]">→ Espace Entreprise</a>' +
      '      </div>' +
      '      <a href="trophees.html" class="px-3 py-3 rounded-lg hover:bg-slate-50">Trophées du Manager de la Performance</a>' +
      '      <a href="partenaires.html" class="px-3 py-3 rounded-lg hover:bg-slate-50">Devenir partenaire</a>' +
      '      <a href="retour-2025.html" class="px-3 py-3 rounded-lg hover:bg-slate-50">Retour sur 2025</a>' +
      '      <a href="actualites.html" class="px-3 py-3 rounded-lg hover:bg-slate-50">Actualités et espace presse</a>' +
      '      <a href="mentions-legales.html#contact" class="px-3 py-3 rounded-lg hover:bg-slate-50">Contact</a>' +
      '    </div>' +
      '    <div class="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-2.5">' +
      '      <a href="espace-entreprise.html" class="btn btn-teal w-full justify-center">Espace Entreprise</a>' +
      '      <a href="inscription.html" class="btn btn-primary w-full justify-center">S\'inscrire</a>' +
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
      '    <div class="chevron-divider mb-10 opacity-90"></div>' +
      '    <div class="grid md:grid-cols-2 lg:grid-cols-12 gap-8 pb-10 border-b border-white/15">' +
      '      <!-- Colonne 1 : Identité, logo fond bleu nuit et gouvernance -->' +
      '      <div class="lg:col-span-4 space-y-4">' +
      '        <a href="index.html" class="inline-block">' +
      '          <img src="assets/images/logo-maperf-dark.svg" alt="MAPERF — Outiller, anticiper, performer" class="h-14 w-auto" />' +
      '        </a>' +
      '        <p class="text-sm text-white/85 leading-relaxed">' +
      '          <strong>Semaine MAPERF 2027</strong> — 16, 17 et 18 juin 2027 à l\'Hôtel Kempinski, Brazzaville (République du Congo). Devise : <em>« Outiller, anticiper, performer »</em>.' +
      '        </p>' +
      '        <div class="text-xs text-white/80 space-y-1 bg-white/5 p-3.5 rounded-xl border border-white/10">' +
      '          <p><strong class="text-[#F6C332]">Initiative MAPERF :</strong> Owando Consulting</p>' +
      '          <p><strong class="text-[#2CC3A0]">Organisation MAPERF :</strong> Agence Ambition et Association Congolaise de l\'Évaluation (ACE)</p>' +
      '          <p><strong class="text-white">Baromètre MAPERF :</strong> Co-initié par Owando Consulting, l\'Agence Ambition et l\'ACE</p>' +
      '        </div>' +
      '      </div>' +
      '' +
      '      <!-- Colonne 2 : La Semaine MAPERF et Trophées -->' +
      '      <div class="lg:col-span-3 space-y-2.5 text-sm">' +
      '        <p class="font-display font-bold text-[#F6C332] text-xs uppercase tracking-wider mb-3">La Semaine MAPERF 2027</p>' +
      '        <ul class="space-y-2 text-sm text-white/85">' +
      '          <li><a href="semaine-maperf.html#jour-16-juin" class="hover:text-[#F39A1E] transition">16 juin : Journée des entrepreneurs</a></li>' +
      '          <li><a href="semaine-maperf.html#jour-17-juin" class="hover:text-[#F39A1E] transition">17 juin : Matinées et Trophées</a></li>' +
      '          <li><a href="semaine-maperf.html#jour-18-juin" class="hover:text-[#F39A1E] transition">18 juin : Masterclass</a></li>' +
      '          <li><a href="trophees.html" class="hover:text-[#F39A1E] transition">Trophées du Manager de la Performance</a></li>' +
      '          <li><a href="partenaires.html" class="hover:text-[#F39A1E] transition">Devenir partenaire (Diamond, Or, Argent)</a></li>' +
      '          <li><a href="retour-2025.html" class="hover:text-[#F39A1E] transition">Retour sur l\'édition 2025</a></li>' +
      '        </ul>' +
      '      </div>' +
      '' +
      '      <!-- Colonne 3 : Baromètre et parcours -->' +
      '      <div class="lg:col-span-2 space-y-2.5 text-sm">' +
      '        <p class="font-display font-bold text-[#2CC3A0] text-xs uppercase tracking-wider mb-3">Baromètre</p>' +
      '        <ul class="space-y-2 text-sm text-white/85">' +
      '          <li><a href="barometre.html#presentation" class="hover:text-[#F39A1E] transition">Présentation et méthode</a></li>' +
      '          <li><a href="barometre.html#dimensions" class="hover:text-[#F39A1E] transition">Les six dimensions</a></li>' +
      '          <li><a href="barometre.html#calendrier" class="hover:text-[#F39A1E] transition">Calendrier 2027</a></li>' +
      '          <li><a href="espace-entreprise.html" class="hover:text-[#F39A1E] transition">Espace Entreprise</a></li>' +
      '          <li><a href="actualites.html" class="hover:text-[#F39A1E] transition">Actualités et presse</a></li>' +
      '          <li><a href="inscription.html" class="hover:text-[#F39A1E] transition">S\'inscrire aux journées</a></li>' +
      '        </ul>' +
      '      </div>' +
      '' +
      '      <!-- Colonne 4 : Coordonnées de contact et cadre légal -->' +
      '      <div id="footer-contact" class="lg:col-span-3 space-y-3 text-sm">' +
      '        <p class="font-display font-bold text-[#F6C332] text-xs uppercase tracking-wider mb-3">Contact et informations</p>' +
      '        <ul class="space-y-2.5 text-sm text-white/85">' +
      '          <li class="flex items-start gap-2.5">' +
      '            <i data-lucide="building" class="w-4 h-4 text-[#F39A1E] shrink-0 mt-1"></i>' +
      '            <span><strong>Lieu de l\'événement :</strong><br/>Hôtel Kempinski, Brazzaville, République du Congo</span>' +
      '          </li>' +
      '          <li class="flex items-start gap-2.5">' +
      '            <i data-lucide="map-pin" class="w-4 h-4 text-[#2CC3A0] shrink-0 mt-1"></i>' +
      '            <span><strong>Secrétariat technique :</strong><br/>Owando Consulting, Brazzaville <span class="text-xs text-white/60">(adresse postale complète à confirmer)</span></span>' +
      '          </li>' +
      '          <li class="flex items-center gap-2.5">' +
      '            <i data-lucide="mail" class="w-4 h-4 text-[#2CC3A0] shrink-0"></i>' +
      '            <a href="mailto:infos@maperf.org" class="hover:underline font-semibold">infos@maperf.org</a>' +
      '          </li>' +
      '          <li class="flex items-center gap-2.5">' +
      '            <i data-lucide="phone" class="w-4 h-4 text-[#F6C332] shrink-0"></i>' +
      '            <a href="tel:+242066285214" class="hover:underline font-semibold">+242 06 628 52 14</a>' +
      '          </li>' +
      '        </ul>' +
      '        <div class="pt-2 flex items-center gap-3">' +
      '          <a href="mentions-legales.html#contact" aria-label="LinkedIn MAPERF" class="w-10 h-10 rounded-full bg-white/10 hover:bg-[#F39A1E] flex items-center justify-center transition"><i data-lucide="linkedin" class="w-4 h-4"></i></a>' +
      '          <a href="mentions-legales.html#contact" aria-label="Facebook MAPERF" class="w-10 h-10 rounded-full bg-white/10 hover:bg-[#F39A1E] flex items-center justify-center transition"><i data-lucide="facebook" class="w-4 h-4"></i></a>' +
      '          <a href="mentions-legales.html#contact" aria-label="YouTube MAPERF" class="w-10 h-10 rounded-full bg-white/10 hover:bg-[#F39A1E] flex items-center justify-center transition"><i data-lucide="youtube" class="w-4 h-4"></i></a>' +
      '        </div>' +
      '      </div>' +
      '    </div>' +
      '' +
      '    <div class="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/70">' +
      '      <p>© 2025–2027 MAPERF — Les Matinées de la Performance (République du Congo). Tous droits réservés.</p>' +
      '      <div class="flex flex-wrap items-center gap-4">' +
      '        <a href="mentions-legales.html#contact" class="hover:text-white transition">Coordonnées de contact</a>' +
      '        <a href="mentions-legales.html#mentions" class="hover:text-white transition">Mentions légales</a>' +
      '        <a href="mentions-legales.html#confidentialite" class="hover:text-white transition">Confidentialité (loi n° 29-2019)</a>' +
      '        <a href="mentions-legales.html#charte-web" class="hover:text-white transition">Charte web</a>' +
      '      </div>' +
      '    </div>' +
      '  </div>' +
      '</footer>';
  }

  function initMobileMenu() {
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
    initMobileMenu();
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
