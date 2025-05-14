<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

$host = 'localhost';
$user = 'root';
$pass = '';
$db = 'campus_hub';
$conn = new mysqli($host, $user, $pass, $db);
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed']);
    exit();
}

$data = json_decode(file_get_contents('php://input'), true);
$review_id = $data['review_id'];
$commenter = $data['commenter'];
$comment = $data['comment'];

$stmt = $conn->prepare('INSERT INTO comments (review_id, commenter, comment) VALUES (?, ?, ?)');
$stmt->bind_param('iss', $review_id, $commenter, $comment);
if ($stmt->execute()) {
    echo json_encode(['success' => true]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to submit comment']);
}
$stmt->close();
$conn->close();
?>
