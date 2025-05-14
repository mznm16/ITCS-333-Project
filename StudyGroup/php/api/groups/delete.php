<?php
// Headers
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: DELETE');
header('Access-Control-Allow-Headers: Access-Control-Allow-Headers, Content-Type, Access-Control-Allow-Methods, Authorization, X-Requested-With');

// Include database connection
include_once '../../config.php';

// Initialize response array
$response = array();
$response['status'] = 'success';
$response['message'] = '';

try {
    // Get ID from URL
    if (!isset($_GET['id'])) {
        throw new Exception("Missing group ID");
    }
    
    $groupId = intval($_GET['id']);
    $userId = isset($_GET['user_id']) ? intval($_GET['user_id']) : 0;
    
    // Check if group exists and user has permission to delete
    $checkQuery = "SELECT g.*, 
                        (SELECT COUNT(*) FROM group_members WHERE group_id = g.group_id AND user_id = ? AND is_owner = 1) as is_owner
                 FROM study_groups g 
                 WHERE g.group_id = ?";
    $checkStmt = mysqli_prepare($conn, $checkQuery);
    mysqli_stmt_bind_param($checkStmt, "ii", $userId, $groupId);
    mysqli_stmt_execute($checkStmt);
    $checkResult = mysqli_stmt_get_result($checkStmt);
    
    if (mysqli_num_rows($checkResult) === 0) {
        throw new Exception("Study group not found");
    }
    
    $group = mysqli_fetch_assoc($checkResult);
    
    // Only allow owner to delete group
    if ($group['is_owner'] != 1) {
        throw new Exception("Permission denied: Only the group owner can delete this group");
    }
    
    // Begin transaction
    mysqli_begin_transaction($conn);
    
    // Delete chat messages
    $chatQuery = "DELETE FROM group_chat WHERE group_id = ?";
    $chatStmt = mysqli_prepare($conn, $chatQuery);
    mysqli_stmt_bind_param($chatStmt, "i", $groupId);
    
    if (!mysqli_stmt_execute($chatStmt)) {
        throw new Exception("Failed to delete chat messages: " . mysqli_error($conn));
    }
    
    // Delete sessions
    $sessionsQuery = "DELETE FROM group_sessions WHERE group_id = ?";
    $sessionsStmt = mysqli_prepare($conn, $sessionsQuery);
    mysqli_stmt_bind_param($sessionsStmt, "i", $groupId);
    
    if (!mysqli_stmt_execute($sessionsStmt)) {
        throw new Exception("Failed to delete sessions: " . mysqli_error($conn));
    }
    
    // Delete resources
    $resourcesQuery = "DELETE FROM group_resources WHERE group_id = ?";
    $resourcesStmt = mysqli_prepare($conn, $resourcesQuery);
    mysqli_stmt_bind_param($resourcesStmt, "i", $groupId);
    
    if (!mysqli_stmt_execute($resourcesStmt)) {
        throw new Exception("Failed to delete resources: " . mysqli_error($conn));
    }
    
    // Delete members
    $membersQuery = "DELETE FROM group_members WHERE group_id = ?";
    $membersStmt = mysqli_prepare($conn, $membersQuery);
    mysqli_stmt_bind_param($membersStmt, "i", $groupId);
    
    if (!mysqli_stmt_execute($membersStmt)) {
        throw new Exception("Failed to delete members: " . mysqli_error($conn));
    }
    
    // Delete group
    $groupQuery = "DELETE FROM study_groups WHERE group_id = ?";
    $groupStmt = mysqli_prepare($conn, $groupQuery);
    mysqli_stmt_bind_param($groupStmt, "i", $groupId);
    
    if (!mysqli_stmt_execute($groupStmt)) {
        throw new Exception("Failed to delete group: " . mysqli_error($conn));
    }
    
    // Commit transaction
    mysqli_commit($conn);
    
    $response['message'] = "Study group deleted successfully";
    
} catch (Exception $e) {
    // Rollback transaction on error
    if (isset($conn) && mysqli_ping($conn)) {
        mysqli_rollback($conn);
    }
    
    $response['status'] = 'error';
    $response['message'] = $e->getMessage();
}

// Return response
echo json_encode($response);
?> 