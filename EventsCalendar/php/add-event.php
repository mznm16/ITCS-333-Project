<?php
// add-event.php
// Endpoint: POST /php/add-event.php
// Creates a new event. Expects JSON body: {title, description, date, location}
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}
header('Content-Type: application/json');
require 'db_config.php';

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
    $stmt = $pdo->prepare('INSERT INTO events (title, description, date, location, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())');
    $stmt->execute([$title, $description, $date, $location]);
    $id = $pdo->lastInsertId();
    echo json_encode(['success' => true, 'id' => $id]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to add event', 'details' => $e->getMessage()]);
}
