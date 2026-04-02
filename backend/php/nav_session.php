<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$loggedIn = !empty($_SESSION['logged_in']) && $_SESSION['logged_in'] === true;

echo json_encode([
    'logged_in' => $loggedIn,
    'name'      => $loggedIn ? ($_SESSION['user_name'] ?? '') : '',
    'role'      => $loggedIn ? ($_SESSION['user_role'] ?? 'user') : '',
]);
