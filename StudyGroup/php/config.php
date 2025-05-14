<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

$host = "127.0.0.1";
$user = getenv("db_user") ?: "user1";
$pass = getenv("db_pass") ?: "pass123";
$db = getenv("db_name") ?: "mydb";

// Create connection
$conn = new mysqli($host, $user, $pass, $db);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Set charset to handle Unicode characters properly
$conn->set_charset("utf8mb4");
?>
