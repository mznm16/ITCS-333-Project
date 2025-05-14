<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

// Enable error logging
error_log("Review submission started");

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
$required_fields = ['course_code', 'course_name', 'professor', 'reviewer', 'rating', 'difficulty', 'workload', 'summary', 'details'];
foreach ($required_fields as $field) {
    if (!isset($data[$field])) {
        error_log("Missing required field: " . $field);
        http_response_code(400);
        echo json_encode(['error' => "Missing required field: $field"]);
        exit();
    }
}

$course_code = $data['course_code'];
$course_name = $data['course_name'];
$professor = $data['professor'];
$reviewer = $data['reviewer'];
$rating = floatval($data['rating']);
$difficulty = intval($data['difficulty']);
$workload = intval($data['workload']);
$summary = $data['summary'];
$details = $data['details'];

// Find or create course
$stmt = $conn->prepare('SELECT id FROM courses WHERE code = ? AND name = ? AND professor = ?');
if (!$stmt) {
    error_log("Prepare failed: " . $conn->error);
    http_response_code(500);
    echo json_encode(['error' => 'Database error', 'mysql_error' => $conn->error]);
    exit();
}

$stmt->bind_param('sss', $course_code, $course_name, $professor);
$stmt->execute();
$stmt->bind_result($course_id);
if ($stmt->fetch()) {
    $stmt->close();
    error_log("Found existing course with ID: " . $course_id);
} else {
    $stmt->close();
    $stmt2 = $conn->prepare('INSERT INTO courses (code, name, professor) VALUES (?, ?, ?)');
    if (!$stmt2) {
        error_log("Prepare failed: " . $conn->error);
        http_response_code(500);
        echo json_encode(['error' => 'Database error', 'mysql_error' => $conn->error]);
        exit();
    }
    
    $stmt2->bind_param('sss', $course_code, $course_name, $professor);
    if ($stmt2->execute()) {
        $course_id = $stmt2->insert_id;
        error_log("Created new course with ID: " . $course_id);
    } else {
        error_log("Failed to create course: " . $stmt2->error);
        http_response_code(500);
        echo json_encode(['error' => 'Failed to create course', 'mysql_error' => $stmt2->error]);
        $stmt2->close();
        $conn->close();
        exit();
    }
    $stmt2->close();
}

$stmt3 = $conn->prepare('INSERT INTO reviews (course_id, reviewer, rating, difficulty, workload, summary, details) VALUES (?, ?, ?, ?, ?, ?, ?)');
if (!$stmt3) {
    error_log("Prepare failed: " . $conn->error);
    http_response_code(500);
    echo json_encode(['error' => 'Database error', 'mysql_error' => $conn->error]);
    exit();
}

$stmt3->bind_param('isddiss', $course_id, $reviewer, $rating, $difficulty, $workload, $summary, $details);
if ($stmt3->execute()) {
    error_log("Review inserted successfully");
    echo json_encode(['success' => true]);
} else {
    error_log("Failed to insert review: " . $stmt3->error);
    http_response_code(500);
    echo json_encode(['error' => 'Failed to submit review', 'mysql_error' => $stmt3->error]);
}
$stmt3->close();
$conn->close();
?>
