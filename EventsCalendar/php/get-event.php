<?php
// get-event.php
// Endpoint: GET /php/get-event.php?id=123
// Returns a single event by ID
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
require 'db_config.php';

$id = isset($_GET['id']) ? intval($_GET['id']) : 0;
if ($id <= 0) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid event id']);
    exit;
}
try {
    $stmt = $pdo->prepare('SELECT * FROM events WHERE id = ?');
    $stmt->execute([$id]);
    $event = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($event) {
        echo json_encode($event);
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'Event not found']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to fetch event', 'details' => $e->getMessage()]);
}
?>
