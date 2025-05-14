<?php
// get-note.php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
require 'db_config.php';

$id = isset($_GET['id']) ? intval($_GET['id']) : 0;
if ($id <= 0) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid note id']);
    exit;
}
$stmt = $pdo->prepare('SELECT * FROM course_notes WHERE id = ?');
$stmt->execute([$id]);
$note = $stmt->fetch();
echo json_encode($note);
?>
