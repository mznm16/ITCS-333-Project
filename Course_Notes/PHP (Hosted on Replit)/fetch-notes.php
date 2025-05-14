<?php
// fetch-notes.php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
require 'db_config.php';

try {
    $stmt = $pdo->query('SELECT * FROM course_notes ORDER BY created_at DESC');
    $notes = $stmt->fetchAll();
    echo json_encode($notes);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to fetch notes', 'details' => $e->getMessage()]);
}
?>
