<?php
session_start();
if (empty($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
echo json_encode(['token' => $_SESSION['csrf_token']]);
