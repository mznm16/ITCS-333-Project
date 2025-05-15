<?php
// update-event.php
// Endpoint: POST /php/update-event.php?id=123
// Updates an event. Expects JSON body: {title, description, date, location}
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}
header('Content-Type: application/json');
require 'db_config.php';

$id = isset($_GET['id']) ? intval($_GET['id']) : 0;
if ($id <= 0) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid event id']);
    exit;
}
$data = json_decode(file_get_contents('php://input'), true);
$title = trim($data['title'] ?? '');
$description = trim($data['description'] ?? '');
$date = trim($data['date'] ?? '');
$location = trim($data['location'] ?? '');

if ($title === '' || $date === '' || $location === '') {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields']);
    exit;
}
try {
    $stmt = $pdo->prepare('UPDATE events SET title=?, description=?, date=?, location=?, updated_at=NOW() WHERE id=?');
    $stmt->execute([$title, $description, $date, $location, $id]);
    echo json_encode(['success' => true]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to update event', 'details' => $e->getMessage()]);
}
