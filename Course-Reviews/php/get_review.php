<?php
header('Access-Control-Allow-Origin: *');
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

$review_id = isset($_GET['id']) ? intval($_GET['id']) : 0;
if ($review_id === 0) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid review id']);
    exit();
}

// Get review
$sql = 'SELECT reviews.*, courses.code, courses.name, courses.professor FROM reviews JOIN courses ON reviews.course_id = courses.id WHERE reviews.id = ?';
$stmt = $conn->prepare($sql);
$stmt->bind_param('i', $review_id);
$stmt->execute();
$review = $stmt->get_result()->fetch_assoc();

// Get comments
$sql2 = 'SELECT * FROM comments WHERE review_id = ? ORDER BY created_at ASC';
$stmt2 = $conn->prepare($sql2);
$stmt2->bind_param('i', $review_id);
$stmt2->execute();
$comments = $stmt2->get_result()->fetch_all(MYSQLI_ASSOC);

$response = ['review' => $review, 'comments' => $comments];
echo json_encode($response);
$stmt->close();
$stmt2->close();
$conn->close();
?>
