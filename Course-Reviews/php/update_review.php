<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: PUT, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

// Enable error logging
error_log("Update review request started");

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

$raw_data = file_get_contents('php://input');
error_log("Received data: " . $raw_data);
$data = json_decode($raw_data, true);

if (json_last_error() !== JSON_ERROR_NONE) {
    error_log("JSON decode error: " . json_last_error_msg());
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON data']);
    exit();
}

// Validate required fields
$required_fields = ['id', 'rating', 'difficulty', 'workload', 'summary', 'details'];
foreach ($required_fields as $field) {
    if (!isset($data[$field])) {
        error_log("Missing required field: " . $field);
        http_response_code(400);
        echo json_encode(['error' => "Missing required field: $field"]);
        exit();
    }
}

$review_id = intval($data['id']);
$rating = floatval($data['rating']);
$difficulty = intval($data['difficulty']);
$workload = intval($data['workload']);
$summary = $data['summary'];
$details = $data['details'];

// Update the review
$stmt = $conn->prepare('UPDATE reviews SET rating = ?, difficulty = ?, workload = ?, summary = ?, details = ? WHERE id = ?');
if (!$stmt) {
    error_log("Prepare failed: " . $conn->error);
    http_response_code(500);
    echo json_encode(['error' => 'Database error', 'mysql_error' => $conn->error]);
    exit();
}

$stmt->bind_param('diissi', $rating, $difficulty, $workload, $summary, $details, $review_id);
if ($stmt->execute()) {
    echo json_encode(['success' => true]);
} else {
    error_log("Failed to update review: " . $stmt->error);
    http_response_code(500);
    echo json_encode(['error' => 'Failed to update review', 'mysql_error' => $stmt->error]);
}
$stmt->close();
$conn->close();
?>
