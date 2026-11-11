<?php
// send_inscription.php — Traitement sécurisé des inscriptions MAPERF 2027

// --------- CONFIG ----------
$to = 'francisyaro@gmail.com';
$fromEmail = 'no-reply@maperf.org';
$fromName  = 'Portail MAPERF 2027';
$csrfTokenExpected = 'maperf_token_2026';
// ---------------------------

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  exit('Méthode non autorisée.');
}

// Anti-CSRF
if (!isset($_POST['csrf_token']) || !hash_equals($csrfTokenExpected, (string)$_POST['csrf_token'])) {
  http_response_code(400);
  exit('Jeton CSRF invalide.');
}

// Récupération & nettoyage sécurisé (Protection contre CRLF Header Injection & XSS)
function clean($key) {
  $val = isset($_POST[$key]) ? trim((string)$_POST[$key]) : '';
  $val = str_replace(["\r", "\n"], ' ', $val);
  return htmlspecialchars($val, ENT_QUOTES, 'UTF-8');
}

$prenom       = clean('prenom');
$nom          = clean('nom');
$rawEmail     = isset($_POST['email']) ? trim((string)$_POST['email']) : '';
$email        = filter_var($rawEmail, FILTER_VALIDATE_EMAIL);
$telephone    = clean('telephone');
$organisation = clean('organisation');
$volet        = clean('volet');
$fonction     = clean('fonction');
$messageUser  = isset($_POST['message']) ? htmlspecialchars(trim((string)$_POST['message']), ENT_QUOTES, 'UTF-8') : '';
$consent      = isset($_POST['consent']) ? 'Oui' : 'Non';

if (!$prenom || !$nom || !$email) {
  http_response_code(400);
  exit('Champs requis manquants ou e-mail invalide.');
}

// Construction du message
$subject = 'Nouvelle inscription MAPERF 2027 — ' . $prenom . ' ' . $nom . ' (' . $organisation . ')';
$body  = "Nouvelle demande reçue via le portail officiel MAPERF 2027\n\n";
$body .= "Nom : $nom\n";
$body .= "Prénom : $prenom\n";
$body .= "E-mail : $email\n";
$body .= "Téléphone : $telephone\n";
$body .= "Organisation : $organisation\n";
$body .= "Volet / Secteur : $volet\n";
$body .= "Fonction : $fonction\n";
$body .= "Consentement confidentialité : $consent\n";
$body .= "-----------------------------\n";
$body .= "Message :\n$messageUser\n";
$body .= "-----------------------------\n";
$body .= "Reçu le : " . date('Y-m-d H:i:s') . "\n";
$body .= "IP : " . ($_SERVER['REMOTE_ADDR'] ?? 'n/a') . "\n";

// En-têtes sécurisés contre l'injection d'en-têtes SMTP
$safeReplyEmail = str_replace(["\r", "\n"], '', $email);
$headers  = "From: $fromName <$fromEmail>\r\n";
$headers .= "Reply-To: $safeReplyEmail\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

$sent = @mail($to, '=?UTF-8?B?' . base64_encode($subject) . '?=', $body, $headers);
?>
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Confirmation d'inscription — MAPERF 2027</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/lucide@latest"></script>
  <link rel="stylesheet" href="assets/css/maperf-design.css" />
</head>
<body class="bg-[#F4F7FB] text-slate-900">
  <div class="w-full"></div>
  <header></header>

  <main class="max-w-xl mx-auto px-6 py-16 text-center">
    <?php if ($sent): ?>
      <div class="card p-8 border-t-4 border-t-[#2CC3A0] space-y-4">
        <h1 class="font-display text-2xl font-extrabold text-[#00236D]">Votre inscription a bien été enregistrée ✅</h1>
        <p class="text-sm text-slate-600">Le Secrétariat Technique de MAPERF 2027 a bien reçu vos informations et reviendra vers vous très prochainement.</p>
        <div class="flex flex-wrap justify-center gap-3 pt-2">
          <a href="barometre.html#espace-collecte" class="btn btn-primary text-xs">Accéder au Portail Baromètre</a>
          <a href="index.html" class="btn btn-outline text-xs">Retour à l’accueil</a>
        </div>
      </div>
    <?php else: ?>
      <div class="card p-8 border-t-4 border-t-[#F39A1E] space-y-4">
        <h1 class="font-display text-2xl font-extrabold text-[#00236D]">Demande prise en compte localement</h1>
        <p class="text-sm text-slate-600">Si le serveur SMTP est en cours de configuration, vous pouvez également écrire directement à <a href="mailto:<?php echo htmlspecialchars($to); ?>" class="text-[#00236D] font-bold underline"><?php echo htmlspecialchars($to); ?></a> ou accéder directement au portail Baromètre.</p>
        <div class="flex flex-wrap justify-center gap-3 pt-2">
          <a href="barometre.html#espace-collecte" class="btn btn-primary text-xs">Ouvrir le Portail Baromètre 2027</a>
          <a href="inscription.html" class="btn btn-outline text-xs">Retour au formulaire</a>
        </div>
      </div>
    <?php endif; ?>
  </main>

  <footer></footer>
  <script src="assets/js/maperf-layout.js"></script>
</body>
</html>
