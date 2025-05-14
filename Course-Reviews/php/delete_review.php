<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

// Enable error logging
error_log("Delete review request started");

$host = 'localhost';
$user = 'root';
$pass = '';
$db = 'campus_hub';
$conn = new mysqli($host, $user, $pass, $db);
if ($conn->connect_error) {
    error_log("Database connection failed: " . $conn->connect_error);
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed']);
    exit();
}

// Get review ID from URL parameter
$review_id = isset($_GET['id']) ? intval($_GET['id']) : 0;
if ($review_id === 0) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid review ID']);
    exit();
}

// First delete any comments associated with this review
$stmt = $conn->prepare('DELETE FROM comments WHERE review_id = ?');
if (!$stmt) {
    error_log("Prepare failed: " . $conn->error);
    http_response_code(500);
    echo json_encode(['error' => 'Database error', 'mysql_error' => $conn->error]);
    exit();
}

$stmt->bind_param('i', $review_id);
if (!$stmt->execute()) {
    error_log("Failed to delete comments: " . $stmt->error);
    http_response_code(500);
    echo json_encode(['error' => 'Failed to delete comments', 'mysql_error' => $stmt->error]);
    $stmt->close();
    $conn->close();
    exit();
}
$stmt->close();

// Now delete the review
$stmt2 = $conn->prepare('DELETE FROM reviews WHERE id = ?');
if (!$stmt2) {
    error_log("Prepare failed: " . $conn->error);
    http_response_code(500);
    echo json_encode(['error' => 'Database error', 'mysql_error' => $conn->error]);
    exit();
}

$stmt2->bind_param('i', $review_id);
if ($stmt2->execute()) {
    echo json_encode(['success' => true]);
} else {
    error_log("Failed to delete review: " . $stmt2->error);
    http_response_code(500);
    echo json_encode(['error' => 'Failed to delete review', 'mysql_error' => $stmt2->error]);
}
$stmt2->close();
$conn->close();
?>
