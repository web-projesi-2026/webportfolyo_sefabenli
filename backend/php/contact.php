<?php
/**
 * ============================================================
 * SEFA BENLİ PORTFOLIO — contact.php
 * İletişim formu işleme + MySQL kaydı + e-posta gönderimi
 * ============================================================
 */

session_start();
header('Content-Type: application/json; charset=utf-8');

// Merkezi veritabanı bağlantısı
require_once __DIR__ . '/db.php';

// ================================================================
// ⚙️  YAPILANDIRMA
// ================================================================
define('SITE_EMAIL',  'sefa@example.com');   // Mesajların gideceği e-posta
define('SITE_NAME',   'Sefa Benli Portfolio');
define('RATE_LIMIT',  5);                     // Dakikada maksimum mesaj
define('RATE_WINDOW', 60);                    // Saniye cinsinden pencere
// ================================================================

// ---- YARDIMCI ----

function respond(bool $success, string $message, int $code = 200): never
{
    http_response_code($code);
    echo json_encode(['success' => $success, 'message' => $message], JSON_UNESCAPED_UNICODE);
    exit;
}

function sanitize(string $val): string
{
    return htmlspecialchars(trim($val), ENT_QUOTES, 'UTF-8');
}

// ---- RATE LIMITING (session tabanlı) ----

function checkRateLimit(): void
{
    $now   = time();
    $key   = 'contact_timestamps';
    $times = $_SESSION[$key] ?? [];

    // Pencere dışındakileri temizle
    $times = array_values(array_filter($times, fn($t) => ($now - $t) < RATE_WINDOW));

    if (count($times) >= RATE_LIMIT) {
        respond(false, 'Çok fazla istek gönderdiniz. Lütfen bir dakika bekleyin.', 429);
    }

    $times[]        = $now;
    $_SESSION[$key] = $times;
}

// ---- SADECE POST ----
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(false, 'Geçersiz istek yöntemi.', 405);
}

// ---- HONEYPOT (bot koruması) ----
// Formda gizli <input name="website"> alanı olmalı; botlar doldurur, insanlar doldurmaz
if (!empty($_POST['website'])) {
    respond(true, 'Mesajınız alındı. En kısa sürede dönüş yapacağım!');
}

// ---- RATE LIMIT KONTROLÜ ----
checkRateLimit();

// ---- VERİYİ AL & TEMİZLE ----
$name    = sanitize($_POST['name']    ?? '');
$email   = sanitize($_POST['email']   ?? '');
$subject = sanitize($_POST['subject'] ?? 'İletişim Formu Mesajı');
$type    = sanitize($_POST['type']    ?? '');
$message = sanitize($_POST['message'] ?? '');

// ---- DOĞRULAMA ----
$errors = [];

if (empty($name) || strlen($name) < 2)         $errors[] = 'Ad soyad en az 2 karakter olmalıdır.';
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) $errors[] = 'Geçerli bir e-posta adresi girin.';
if (empty($message) || strlen($message) < 10)  $errors[] = 'Mesaj en az 10 karakter olmalıdır.';
if (strlen($name) > 100)                        $errors[] = 'Ad soyad çok uzun.';
if (strlen($subject) > 200)                     $errors[] = 'Konu çok uzun.';
if (strlen($message) > 5000)                    $errors[] = 'Mesaj çok uzun (max 5000 karakter).';

if ($errors) {
    respond(false, implode(' ', $errors), 422);
}

// ---- TİP ETİKETİ ----
$typeLabels = [
    'job'        => 'İş Teklifi',
    'internship' => 'Staj Teklifi',
    'project'    => 'Proje İş Birliği',
    'question'   => 'Soru / Danışmanlık',
    'other'      => 'Diğer',
];
$typeLabel = $typeLabels[$type] ?? 'Genel';

// ---- VERİTABANINA KAYDET ----
$ip        = $_SERVER['REMOTE_ADDR'] ?? 'bilinmiyor';
$savedToDb = false;

try {
    $pdo  = getDB();
    $stmt = $pdo->prepare(
        'INSERT INTO contact_messages
            (name, email, subject, message_type, message, ip_address, created_at)
         VALUES
            (:name, :email, :subject, :type, :message, :ip, NOW())'
    );
    $stmt->execute([
        'name'    => $name,
        'email'   => $email,
        'subject' => $subject,
        'type'    => $type,
        'message' => $message,
        'ip'      => $ip,
    ]);
    $savedToDb = true;
} catch (PDOException $e) {
    error_log('[contact.php] DB kayıt hatası: ' . $e->getMessage());
    // Veritabanına kayıt başarısız olsa da e-posta göndermeyi dene
}

// ---- E-POSTA BAŞLIKLARI ----
$date = date('d.m.Y H:i');
$ua   = substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 100);

$headers  = "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/html; charset=UTF-8\r\n";
$headers .= "From: {$name} <{$email}>\r\n";
$headers .= "Reply-To: {$email}\r\n";
$headers .= "X-Mailer: PHP/" . phpversion() . "\r\n";
$headers .= "X-Priority: 3\r\n";

$mailSubject = "[Portfolio] {$typeLabel}: {$subject}";

// ---- E-POSTA ŞABLONU ----
$body = <<<HTML
<!DOCTYPE html>
<html lang="tr">
<head><meta charset="UTF-8"><style>
  body { font-family: 'Segoe UI', Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
  .card { background: #fff; border-radius: 12px; max-width: 600px; margin: 0 auto;
          overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
  .header { background: linear-gradient(135deg, #6e40c9, #9b59b6); padding: 32px; color: #fff; }
  .header h1 { margin: 0; font-size: 1.4rem; }
  .header p  { margin: 6px 0 0; opacity: 0.8; font-size: 0.9rem; }
  .body      { padding: 28px 32px; }
  .badge     { display:inline-block; background:rgba(110,64,201,0.1); color:#6e40c9;
               border:1px solid rgba(110,64,201,0.25); border-radius:50px;
               padding:4px 14px; font-size:0.78rem; font-weight:600; margin-bottom:20px; }
  .field     { margin-bottom: 18px; }
  .field label { display:block; font-size:0.75rem; color:#888; font-weight:600;
                 margin-bottom:4px; text-transform:uppercase; letter-spacing:0.5px; }
  .field span  { font-size:0.95rem; color:#333; font-weight:500; }
  .field a     { color:#6e40c9; }
  .message-box { background:#f8f6ff; border:1px solid rgba(110,64,201,0.15);
                 border-radius:10px; padding:18px; color:#333; line-height:1.7; font-size:0.92rem; }
  .footer    { background:#f8f8f8; padding:18px 32px; border-top:1px solid #eee;
               font-size:0.78rem; color:#aaa; }
  hr { border:none; border-top:1px solid #eee; margin:20px 0; }
</style></head>
<body>
<div class="card">
  <div class="header">
    <h1>📬 Yeni İletişim Mesajı</h1>
    <p>{$date} tarihinde gönderildi</p>
  </div>
  <div class="body">
    <div class="badge">{$typeLabel}</div>
    <div class="field"><label>Gönderen</label><span>{$name}</span></div>
    <div class="field"><label>E-posta</label><span><a href="mailto:{$email}">{$email}</a></span></div>
    <div class="field"><label>Konu</label><span>{$subject}</span></div>
    <hr>
    <div class="field">
      <label>Mesaj</label>
      <div class="message-box">{$message}</div>
    </div>
  </div>
  <div class="footer">
    IP: {$ip} &nbsp;|&nbsp; Gönderim: {$date} &nbsp;|&nbsp; {$ua}
  </div>
</div>
</body>
</html>
HTML;

// ---- GÖNDERİM ----
$sent = mail(SITE_EMAIL, $mailSubject, $body, $headers);

if ($sent || $savedToDb) {
    respond(true, 'Mesajınız alındı! En kısa sürede dönüş yapacağım.');
}

respond(false, 'Mesaj gönderilemedi. Lütfen direkt e-posta ile iletişime geçin.', 500);
