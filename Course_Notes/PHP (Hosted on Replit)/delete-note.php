<?php
// delete-note.php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
require 'db_config.php';

$id = isset($_POST['id']) ? intval($_POST['id']) : 0;
if ($id <= 0) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid note id']);
    exit;
}
$stmt = $pdo->prepare('DELETE FROM course_notes WHERE id = ?');
if ($stmt->execute([$id])) {
    echo json_encode(['success' => true]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to delete note']);
}
?>
