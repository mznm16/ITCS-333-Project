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
    $requiredFields = ['email', 'password'];
    foreach ($requiredFields as $field) {
        if (!isset($data[$field]) || empty($data[$field])) {
            throw new Exception("Missing required field: $field");
        }
    }
    
    // Get user from database
    $query = "SELECT * FROM users WHERE email = ?";
    $stmt = mysqli_prepare($conn, $query);
    mysqli_stmt_bind_param($stmt, "s", $data['email']);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    
    if (mysqli_num_rows($result) === 0) {
        throw new Exception("Invalid email or password");
    }
    
    $user = mysqli_fetch_assoc($result);
    
    // Verify password
    if (!password_verify($data['password'], $user['password'])) {
        throw new Exception("Invalid email or password");
    }
    
    // Store user data in session
    $_SESSION['user_id'] = $user['user_id'];
    $_SESSION['username'] = $user['username'];
    $_SESSION['email'] = $user['email'];
    
    // Return user data without password
    $response['data'] = array(
        'user_id' => $user['user_id'],
        'username' => $user['username'],
        'email' => $user['email']
    );
    
    $response['message'] = 'Login successful';
    
} catch (Exception $e) {
    $response['status'] = 'error';
    $response['message'] = $e->getMessage();
}

// Return response
echo json_encode($response);
?> 