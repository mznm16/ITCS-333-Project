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

$sql = 'SELECT reviews.id, courses.code, courses.name, courses.professor, reviewer, rating, difficulty, workload, summary, details, created_at FROM reviews JOIN courses ON reviews.course_id = courses.id ORDER BY created_at DESC';
$result = $conn->query($sql);
$reviews = [];
while ($row = $result->fetch_assoc()) {
    $reviews[] = $row;
}
echo json_encode($reviews);
$conn->close();
?>
