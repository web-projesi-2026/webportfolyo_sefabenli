<?php
/**
 * ============================================================
 * SEFA BENLİ PORTFOLIO — auth.php
 * Kayıt / Giriş / Çıkış işlemleri
 * ============================================================
 *
 * Tüm form action'ları bu dosyayı hedefler:
 *   <form method="POST" action="../../backend/php/auth.php">
 *     <input type="hidden" name="action" value="login">   <!-- veya register / logout -->
 *     <input type="hidden" name="csrf_token" value="<?= generateCSRF() ?>">
 *   </form>
 */

session_start();

// Merkezi veritabanı bağlantısı
require_once __DIR__ . '/db.php';

// ---- YARDIMCI FONKSİYONLAR ----

/**
 * Flash mesaj bırakarak yönlendir.
 */
function redirect(string $path, string $msg = '', string $type = 'error'): never
{
    if ($msg !== '') {
        $_SESSION['flash_msg']  = $msg;
        $_SESSION['flash_type'] = $type;
    }
    header('Location: ' . $path);
    exit;
}

/**
 * Kullanıcı girdisini temizler.
 */
function sanitize(string $val): string
{
    return htmlspecialchars(trim($val), ENT_QUOTES, 'UTF-8');
}

/**
 * E-posta geçerliliğini kontrol eder.
 */
function isValidEmail(string $email): bool
{
    return (bool) filter_var($email, FILTER_VALIDATE_EMAIL);
}

// ---- CSRF KORUMASI ----

function generateCSRF(): string
{
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

function verifyCSRF(string $token): bool
{
    return isset($_SESSION['csrf_token'])
        && hash_equals($_SESSION['csrf_token'], $token);
}

// ---- CSRF DOĞRULA (logout hariç her POST için) ----
$action = $_POST['action'] ?? $_GET['action'] ?? '';

// CSRF: token gönderilip yanlışsa reddet; hiç gönderilmediyse (static HTML) geç
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action !== 'logout') {
    $csrfToken = $_POST['csrf_token'] ?? '';
    if ($csrfToken !== '' && !verifyCSRF($csrfToken)) {
        redirect(
            '../../pages/login.html',
            'Güvenlik doğrulaması başarısız. Lütfen tekrar deneyin.'
        );
    }
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}

// ---- ACTION YÖNLENDIRMESI ----
match ($action) {
    'login'    => handleLogin(),
    'register' => handleRegister(),
    'logout'   => handleLogout(),
    default    => redirect('../../pages/login.html', 'Geçersiz işlem.'),
};

// ============================================================
// GİRİŞ
// ============================================================
function handleLogin(): never
{
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        redirect('../../pages/login.html');
    }

    $email    = sanitize($_POST['email']    ?? '');
    $password =          $_POST['password'] ?? '';
    $remember = isset($_POST['remember']);

    // Temel doğrulama
    if ($email === '' || $password === '') {
        redirect('../../pages/login.html', 'E-posta ve şifre zorunludur.');
    }
    if (!isValidEmail($email)) {
        redirect('../../pages/login.html', 'Geçersiz e-posta adresi.');
    }

    $pdo  = getDB();
    $stmt = $pdo->prepare(
        'SELECT id, first_name, last_name, password_hash, role
           FROM users
          WHERE email = :email AND is_active = 1
          LIMIT 1'
    );
    $stmt->execute(['email' => $email]);
    $user = $stmt->fetch();

    // Hatalı giriş — zamanlamayı eşitle, brute-force'u zorlaştır
    if (!$user || !password_verify($password, $user['password_hash'])) {
        sleep(1);
        redirect('../../pages/login.html', 'E-posta veya şifre hatalı.');
    }

    // Oturum yenile (session fixation koruması)
    session_regenerate_id(true);

    $_SESSION['user_id']       = $user['id'];
    $_SESSION['user_name']     = $user['first_name'] . ' ' . $user['last_name'];
    $_SESSION['user_role']     = $user['role'];
    $_SESSION['logged_in']     = true;
    $_SESSION['last_activity'] = time();

    // Beni hatırla — 30 günlük güvenli cookie
    if ($remember) {
        $token     = bin2hex(random_bytes(32));
        $tokenHash = hash('sha256', $token);

        setcookie('remember_token', $token, [
            'expires'  => time() + 60 * 60 * 24 * 30,
            'path'     => '/',
            'secure'   => false,     // localhost için (XAMPP)
            'httponly' => true,      // JS erişimini engelle
            'samesite' => 'Strict',  // CSRF koruması
        ]);

        $pdo->prepare(
            'INSERT INTO remember_tokens (user_id, token_hash, expires_at)
             VALUES (:uid, :hash, DATE_ADD(NOW(), INTERVAL 30 DAY))'
        )->execute(['uid' => $user['id'], 'hash' => $tokenHash]);
    }

    // Son giriş zamanını kaydet
    $pdo->prepare('UPDATE users SET last_login = NOW() WHERE id = :id')
        ->execute(['id' => $user['id']]);

    // Admin → admin paneline, kullanıcı → ana sayfaya
    if ($user['role'] === 'admin') {
        redirect(
            '../../admin/index.html',
            'Hoş geldiniz, ' . htmlspecialchars($user['first_name']) . '!',
            'success'
        );
    }

    redirect('../../index.html', 'Başarıyla giriş yaptınız.', 'success');
}

// ============================================================
// KAYIT
// ============================================================
function handleRegister(): never
{
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        redirect('../../pages/register.html');
    }

    $firstName = sanitize($_POST['first_name']      ?? '');
    $lastName  = sanitize($_POST['last_name']       ?? '');
    $email     = sanitize($_POST['email']           ?? '');
    $password  =          $_POST['password']        ?? '';
    $confirm   =          $_POST['password_confirm'] ?? '';
    $terms     = isset($_POST['terms']);

    // ---- Doğrulama ----
    $errors = [];

    if ($firstName === '' || $lastName === '') {
        $errors[] = 'Ad ve soyad zorunludur.';
    }
    if (!isValidEmail($email)) {
        $errors[] = 'Geçerli bir e-posta adresi girin.';
    }
    if (strlen($password) < 8) {
        $errors[] = 'Şifre en az 8 karakter olmalıdır.';
    }
    if ($password !== $confirm) {
        $errors[] = 'Şifreler eşleşmiyor.';
    }
    if (!$terms) {
        $errors[] = 'Kullanım şartlarını kabul etmelisiniz.';
    }

    if ($errors) {
        redirect('../../pages/register.html', implode(' ', $errors));
    }

    // Güçlü şifre kontrolü
    if (!preg_match('/[A-Z]/', $password) || !preg_match('/[0-9]/', $password)) {
        redirect(
            '../../pages/register.html',
            'Şifre en az bir büyük harf ve bir rakam içermelidir.'
        );
    }

    $pdo = getDB();

    // E-posta tekrar kontrolü
    $stmt = $pdo->prepare('SELECT id FROM users WHERE email = :email LIMIT 1');
    $stmt->execute(['email' => $email]);

    if ($stmt->fetch()) {
        redirect('../../pages/register.html', 'Bu e-posta adresi zaten kayıtlı.');
    }

    // Şifreyi hashle
    $hash = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);

    $stmt = $pdo->prepare(
        'INSERT INTO users (first_name, last_name, email, password_hash, role, created_at)
         VALUES (:fn, :ln, :email, :hash, "user", NOW())'
    );

    if ($stmt->execute(['fn' => $firstName, 'ln' => $lastName, 'email' => $email, 'hash' => $hash])) {
        redirect(
            '../../pages/login.html',
            'Hesabınız oluşturuldu! Giriş yapabilirsiniz.',
            'success'
        );
    }

    redirect('../../pages/register.html', 'Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyin.');
}

// ============================================================
// ÇIKIŞ
// ============================================================
function handleLogout(): never
{
    // Beni hatırla cookie'sini veritabanından sil
    if (isset($_COOKIE['remember_token'])) {
        $tokenHash = hash('sha256', $_COOKIE['remember_token']);

        try {
            $pdo = getDB();
            $pdo->prepare('DELETE FROM remember_tokens WHERE token_hash = :hash')
                ->execute(['hash' => $tokenHash]);
        } catch (Exception) {
            // Sessizce geç
        }

        // Cookie'yi temizle
        setcookie('remember_token', '', [
            'expires'  => time() - 3600,
            'path'     => '/',
            'secure'   => false, // localhost için (XAMPP)
            'httponly' => true,
            'samesite' => 'Strict',
        ]);
    }

    // Oturumu tamamen temizle
    $_SESSION = [];

    if (ini_get('session.use_cookies')) {
        $params = session_get_cookie_params();
        setcookie(
            session_name(),
            '',
            time() - 42000,
            $params['path'],
            $params['domain'],
            $params['secure'],
            $params['httponly']
        );
    }

    session_destroy();

    redirect('../../index.html', 'Çıkış yaptınız.', 'success');
}
