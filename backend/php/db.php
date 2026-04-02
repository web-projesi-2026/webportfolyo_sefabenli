<?php
/**
 * ============================================================
 * SEFA BENLİ PORTFOLIO — db.php
 * Merkezi MySQL (PDO) bağlantısı
 * ============================================================
 *
 * Kullanım:
 *   require_once __DIR__ . '/db.php';
 *   $stmt = $pdo->prepare('SELECT * FROM users WHERE id = ?');
 *   $stmt->execute([$id]);
 *   $user = $stmt->fetch();
 */

// ================================================================
// ⚙️  VERİTABANI YAPILANDIRMASI — yalnızca burası düzenlenir
// ================================================================
define('DB_HOST',    'localhost');
define('DB_PORT',    '3306');
define('DB_NAME',    'sefa_portfolio');
define('DB_USER',    'root');          // Kendi kullanıcı adınız
define('DB_PASS',    '');              // Kendi şifreniz
define('DB_CHARSET', 'utf8mb4');
// ================================================================

/**
 * Singleton PDO bağlantısı döndürür.
 * Bağlantı kurulamazsa JSON hata yanıtı gönderilir ve betik durur.
 *
 * @return PDO
 */
function getDB(): PDO
{
    static $pdo = null;

    if ($pdo !== null) {
        return $pdo;
    }

    $dsn = sprintf(
        'mysql:host=%s;port=%s;dbname=%s;charset=%s',
        DB_HOST,
        DB_PORT,
        DB_NAME,
        DB_CHARSET
    );

    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,   // Hataları exception olarak fırlat
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,         // Varsayılan: ilişkisel dizi
        PDO::ATTR_EMULATE_PREPARES   => false,                     // Gerçek prepared statement
        PDO::ATTR_PERSISTENT         => false,                     // Kalıcı bağlantı kullanma
        PDO::MYSQL_ATTR_FOUND_ROWS   => true,                     // UPDATE: etkilenen satır yerine bulunan satır
    ];

    try {
        $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
    } catch (PDOException $e) {
        // Güvenlik: gerçek hata mesajını kullanıcıya gösterme
        error_log('[DB] Bağlantı hatası: ' . $e->getMessage());
        http_response_code(500);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode([
            'success' => false,
            'message' => 'Sunucu hatası: Veritabanına bağlanılamadı.',
        ]);
        exit;
    }

    return $pdo;
}
