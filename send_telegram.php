<?php
// Simple server-side relay to send Telegram messages (avoids browser CORS issues)
header('Content-Type: application/json; charset=utf-8');

// Allow only POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Method Not Allowed']);
    exit;
}

// Read JSON or form data
$raw = file_get_contents('php://input');
$data = json_decode($raw, true);
if (!$data) {
    $data = $_POST;
}

$text = isset($data['text']) ? trim($data['text']) : '';
if ($text === '') {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Empty text']);
    exit;
}

// Telegram credentials (server-side only)
$botToken = '8375195965:AAGLdfnVmLVnyih3b9xswnSfCSH6fVjM52s';
$chatId   = '-4955839873';
$url      = "https://api.telegram.org/bot{$botToken}/sendMessage";

// Build payload
$payload = [
    'chat_id' => $chatId,
    'text' => $text,
    'parse_mode' => 'HTML'
];

// Send via cURL
$ch = curl_init($url);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($payload));
curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 5);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);
$response = curl_exec($ch);
$errno = curl_errno($ch);
$httpCode = (int)curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
curl_close($ch);

if ($errno !== 0) {
    http_response_code(502);
    echo json_encode(['ok' => false, 'error' => 'Curl error', 'code' => $errno]);
    exit;
}

$respJson = json_decode($response, true);
if ($httpCode >= 200 && $httpCode < 300 && isset($respJson['ok']) && $respJson['ok'] === true) {
    echo json_encode(['ok' => true]);
    exit;
}

http_response_code(502);
echo json_encode(['ok' => false, 'error' => 'Telegram API error', 'status' => $httpCode, 'resp' => $respJson]);
exit;
