<?php
// db_config.php
$host = 'localhost';
$db   = 'course_notes_db';
$user = 'root';
$pass = '';  // Default empty password for XAMPP
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

if ($db === 'your_db_name' || $user === 'your_db_user' || $pass === 'your_db_password') {
    http_response_code(500);
    echo json_encode(['error' => 'Database credentials in db_config.php are not set. Please update them.']);
    exit;
}

try {
     $pdo = new PDO($dsn, $user, $pass, $options);
} catch (PDOException $e) {
     http_response_code(500);
     echo json_encode(['error' => 'Database connection failed']);
     exit;
}
?>
