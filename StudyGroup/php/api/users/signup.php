<?php
session_start();
// Headers
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Access-Control-Allow-Headers, Content-Type, Access-Control-Allow-Methods, Authorization, X-Requested-With');

// Include database connection
include_once '../../config.php';

// Initialize response array
$response = array();
$response['status'] = 'success';
$response['message'] = '';
$response['data'] = null;

try {
    // Get raw posted data
    $data = json_decode(file_get_contents("php://input"), true);
    
    // Validate required fields
    $requiredFields = ['username', 'email', 'password'];
    foreach ($requiredFields as $field) {
        if (!isset($data[$field]) || empty(trim($data[$field]))) {
            throw new Exception("Missing required field: $field");
        }
    }

    // Sanitize and validate inputs
    $username = filter_var(trim($data['username']), FILTER_SANITIZE_STRING);
    $email = filter_var(trim($data['email']), FILTER_SANITIZE_EMAIL);
    $password = trim($data['password']);

    // Additional validation
    if (strlen($username) < 3 || strlen($username) > 50) {
        throw new Exception("Username must be between 3 and 50 characters");
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        throw new Exception("Invalid email format");
    }

    if (strlen($password) < 8) {
        throw new Exception("Password must be at least 8 characters long");
    }

    if (!preg_match('/[A-Za-z]/', $password) || !preg_match('/[0-9]/', $password)) {
        throw new Exception("Password must contain both letters and numbers");
    }
    
    // Validate email format
    if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
        throw new Exception("Invalid email format");
    }
    
    // Check if email already exists
    $checkQuery = "SELECT * FROM users WHERE email = ?";
    $checkStmt = mysqli_prepare($conn, $checkQuery);
    mysqli_stmt_bind_param($checkStmt, "s", $data['email']);
    mysqli_stmt_execute($checkStmt);
    $checkResult = mysqli_stmt_get_result($checkStmt);
    
    if (mysqli_num_rows($checkResult) > 0) {
        throw new Exception("Email already in use");
    }
    
    // Hash password
    $hashedPassword = password_hash($data['password'], PASSWORD_DEFAULT);
    
    // Insert user
    $query = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";
    $stmt = mysqli_prepare($conn, $query);
    mysqli_stmt_bind_param($stmt, "sss", $data['username'], $data['email'], $hashedPassword);
    
    if (mysqli_stmt_execute($stmt)) {
        $userId = mysqli_insert_id($conn);
        
        // Return user data without password
        // Store user data in session
        $_SESSION['user_id'] = $userId;
        $_SESSION['username'] = $data['username'];
        $_SESSION['email'] = $data['email'];

        $response['data'] = array(
            'user_id' => $userId,
            'username' => $data['username'],
            'email' => $data['email']
        );
        
        $response['message'] = 'User registered successfully';
    } else {
        throw new Exception("Failed to register user: " . mysqli_error($conn));
    }
    
} catch (Exception $e) {
    $response['status'] = 'error';
    $response['message'] = $e->getMessage();
}

// Return response
echo json_encode($response);
?> 