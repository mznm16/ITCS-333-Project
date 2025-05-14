<?php
// add-comment.php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
require 'db_config.php';

$note_id = isset($_POST['note_id']) ? intval($_POST['note_id']) : 0;
$commenter = $_POST['commenter'] ?? '';
$comment = $_POST['comment'] ?? '';

if ($note_id <= 0 || !$comment) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid input']);
    exit;
}
$stmt = $pdo->prepare('INSERT INTO note_comments (note_id, commenter, comment) VALUES (?, ?, ?)');
if ($stmt->execute([$note_id, $commenter, $comment])) {
    echo json_encode(['success' => true]);
} else {
    error_log('Failed to add comment for note_id: ' . $note_id);
    http_response_code(500);
    echo json_encode(['error' => 'Failed to add comment', 'debug' => 'Insert statement failed', 'note_id' => $note_id]);
}
?>
