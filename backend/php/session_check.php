<?php
/**
 * ============================================================
 * SEFA BENLİ PORTFOLIO — session_check.php
 * Oturum koruma yardımcısı
 * ============================================================
 *
 * Korumalı sayfaların en üstüne ekle:
 *   require_once __DIR__ . '/../backend/php/session_check.php';
 *   requireLogin();          // Giriş yapılmamışsa login'e yönlendir
 *   requireAdmin();          // Admin değilse ana sayfaya yönlendir
 *
 * Admin panelinde:
 *   require_once '../../backend/php/session_check.php';
 *   requireAdmin();
 */

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Oturum süresi (saniye) — 2 saat
define('SESSION_LIFETIME', 7200);

/**
 * Oturum zaman aşımını kontrol eder.
 * Son aktiviteden SESSION_LIFETIME saniye geçmişse oturumu sonlandırır.
 */
function checkSessionTimeout(): void
{
    if (!isset($_SESSION['logged_in'])) {
        return;
    }

    $lastActivity = $_SESSION['last_activity'] ?? time();

    if ((time() - $lastActivity) > SESSION_LIFETIME) {
        // Oturum zaman aşımına uğradı
        $_SESSION = [];
        session_destroy();
        header('Location: ../../pages/login.html?reason=timeout');
        exit;
    }

    $_SESSION['last_activity'] = time();
}

/**
 * Giriş kontrolü — giriş yapılmamışsa login sayfasına yönlendir.
 *
 * @param string $redirectTo  Login sonrası dönülecek sayfa (opsiyonel)
 */
function requireLogin(string $redirectTo = ''): void
{
    checkSessionTimeout();

    if (empty($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
        $url = '../../pages/login.html';
        if ($redirectTo) {
            $url .= '?redirect=' . urlencode($redirectTo);
        }
        header('Location: ' . $url);
        exit;
    }
}

/**
 * Admin kontrolü — admin değilse ana sayfaya yönlendir.
 */
function requireAdmin(): void
{
    requireLogin();

    if (($_SESSION['user_role'] ?? '') !== 'admin') {
        header('Location: ../../index.html');
        exit;
    }
}

/**
 * Mevcut oturum kullanıcısını döndürür.
 *
 * @return array{id: int, name: string, role: string}|null
 */
function currentUser(): ?array
{
    if (empty($_SESSION['logged_in'])) {
        return null;
    }

    return [
        'id'   => $_SESSION['user_id']   ?? 0,
        'name' => $_SESSION['user_name'] ?? '',
        'role' => $_SESSION['user_role'] ?? 'user',
    ];
}

// Sayfa yüklendiğinde otomatik kontrol
checkSessionTimeout();
