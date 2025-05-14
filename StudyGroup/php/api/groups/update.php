<?php
// Headers
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: PUT');
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
    
    // Check if ID is provided
    if (!isset($data['id'])) {
        throw new Exception("Missing group ID");
    }
    
    $groupId = intval($data['id']);
    $userId = isset($data['user_id']) ? intval($data['user_id']) : 0;
    
    // Check if group exists and user has permission to update
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
    
    // Check if this is a chat, resource, or regular update
    $isChatUpdate = isset($data['groupChat']) && is_array($data['groupChat']);
    $isResourceUpdate = isset($data['resources']) && is_array($data['resources']);
    $isJoinRequest = isset($data['Joined']) && $data['Joined'] === true;
    $isExitRequest = isset($data['Joined']) && $data['Joined'] === false;
    
    // Allow members to add chat messages and resources
    if (!$isJoinRequest && !$isExitRequest && !$isChatUpdate && !$isResourceUpdate && $group['is_owner'] != 1) {
        throw new Exception("Permission denied: Only the group owner can update group details");
    }
    
    // Begin transaction
    mysqli_begin_transaction($conn);
    
    // Handle join/exit group request
    if ($isJoinRequest || $isExitRequest) {
        if ($isJoinRequest) {
            // Check if user is already a member
            $memberCheckQuery = "SELECT * FROM group_members WHERE group_id = ? AND user_id = ?";
            $memberCheckStmt = mysqli_prepare($conn, $memberCheckQuery);
            mysqli_stmt_bind_param($memberCheckStmt, "ii", $groupId, $userId);
            mysqli_stmt_execute($memberCheckStmt);
            $memberCheckResult = mysqli_stmt_get_result($memberCheckStmt);
            
            if (mysqli_num_rows($memberCheckResult) === 0) {
                // Add user as member
                $joinQuery = "INSERT INTO group_members (group_id, user_id, is_owner) VALUES (?, ?, 0)";
                $joinStmt = mysqli_prepare($conn, $joinQuery);
                mysqli_stmt_bind_param($joinStmt, "ii", $groupId, $userId);
                
                if (!mysqli_stmt_execute($joinStmt)) {
                    throw new Exception("Failed to join group: " . mysqli_error($conn));
                }
            }
        } else if ($isExitRequest && $group['is_owner'] != 1) {
            // Cannot exit if you're the owner
            $exitQuery = "DELETE FROM group_members WHERE group_id = ? AND user_id = ?";
            $exitStmt = mysqli_prepare($conn, $exitQuery);
            mysqli_stmt_bind_param($exitStmt, "ii", $groupId, $userId);
            
            if (!mysqli_stmt_execute($exitStmt)) {
                throw new Exception("Failed to exit group: " . mysqli_error($conn));
            }
        }
    } else {
        // Update group details (only by owner)
        $updateFields = [];
        $updateParams = [];
        $updateTypes = "";
        
        // Only update fields that are provided
        $allowedFields = [
            'title' => 's',
            'category' => 's',
            'course' => 's',
            'description' => 's',
            'max_members' => 'i',
            'meeting_time' => 'i',
            'location' => 's',
            'days' => 's',
            'requirements' => 's',
            'image' => 's'
        ];
        
        foreach ($allowedFields as $field => $type) {
            $apiField = $field === 'max_members' ? 'maxMembers' : $field;
            $apiField = $field === 'days' ? 'Days' : $apiField;
            
            if (isset($data[$apiField])) {
                $dbField = $field;
                
                // Convert arrays to JSON
                if ($field === 'days' && is_array($data['Days'])) {
                    $value = json_encode($data['Days']);
                } else if ($field === 'requirements' && is_array($data['requirements'])) {
                    $value = json_encode($data['requirements']);
                } else {
                    $value = $data[$apiField];
                }
                
                $updateFields[] = "$dbField = ?";
                $updateParams[] = $value;
                $updateTypes .= $type;
            }
        }
        
        if (!empty($updateFields)) {
            $updateQuery = "UPDATE study_groups SET " . implode(", ", $updateFields) . " WHERE group_id = ?";
            $updateTypes .= "i"; // for group_id
            $updateParams[] = $groupId;
            
            $updateStmt = mysqli_prepare($conn, $updateQuery);
            
            // Dynamically bind parameters
            $bindParams = array();
            $bindParams[] = &$updateTypes;
            for ($i = 0; $i < count($updateParams); $i++) {
                $bindParams[] = &$updateParams[$i];
            }
            
            call_user_func_array(array($updateStmt, 'bind_param'), $bindParams);
            
            if (!mysqli_stmt_execute($updateStmt)) {
                throw new Exception("Failed to update group: " . mysqli_error($conn));
            }
        }
        
        // Handle resources update if provided
        if (isset($data['resources']) && is_array($data['resources'])) {
            // For simplicity, delete existing resources and add new ones
            // In a production app, you might want to update existing ones instead
            $deleteResourcesQuery = "DELETE FROM group_resources WHERE group_id = ?";
            $deleteResourcesStmt = mysqli_prepare($conn, $deleteResourcesQuery);
            mysqli_stmt_bind_param($deleteResourcesStmt, "i", $groupId);
            
            if (!mysqli_stmt_execute($deleteResourcesStmt)) {
                throw new Exception("Failed to update resources: " . mysqli_error($conn));
            }
            
            // Add new resources
            foreach ($data['resources'] as $resource) {
                if (isset($resource['title'], $resource['type'], $resource['url'])) {
                    $resourceQuery = "INSERT INTO group_resources 
                                    (group_id, title, type, description, url, added_by) 
                                    VALUES (?, ?, ?, ?, ?, ?)";
                    $resourceStmt = mysqli_prepare($conn, $resourceQuery);
                    $description = isset($resource['description']) ? $resource['description'] : '';
                    $addedBy = isset($resource['addedBy']) ? $resource['addedBy'] : 'Owner';
                    
                    mysqli_stmt_bind_param(
                        $resourceStmt, 
                        "isssss", 
                        $groupId, 
                        $resource['title'], 
                        $resource['type'], 
                        $description, 
                        $resource['url'], 
                        $addedBy
                    );
                    
                    if (!mysqli_stmt_execute($resourceStmt)) {
                        throw new Exception("Failed to add resource: " . mysqli_error($conn));
                    }
                }
            }
        }
        
        // Handle sessions update if provided
        if (isset($data['sessions']) && is_array($data['sessions'])) {
            // Delete existing sessions and add new ones
            $deleteSessionsQuery = "DELETE FROM group_sessions WHERE group_id = ?";
            $deleteSessionsStmt = mysqli_prepare($conn, $deleteSessionsQuery);
            mysqli_stmt_bind_param($deleteSessionsStmt, "i", $groupId);
            
            if (!mysqli_stmt_execute($deleteSessionsStmt)) {
                throw new Exception("Failed to update sessions: " . mysqli_error($conn));
            }
            
            // Add new sessions
            foreach ($data['sessions'] as $session) {
                if (isset($session['day'], $session['month'], $session['year'], $session['time'], $session['title'])) {
                    $sessionQuery = "INSERT INTO group_sessions 
                                   (group_id, day, month, year, time, title, topics, status, session_type) 
                                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
                    $sessionStmt = mysqli_prepare($conn, $sessionQuery);
                    $topics = isset($session['topics']) ? $session['topics'] : '';
                    $status = isset($session['status']) ? $session['status'] : 'Ongoing';
                    $sessionType = isset($session['sessionType']) ? $session['sessionType'] : 'study';
                    
                    mysqli_stmt_bind_param(
                        $sessionStmt, 
                        "issssssss", 
                        $groupId, 
                        $session['day'], 
                        $session['month'], 
                        $session['year'], 
                        $session['time'], 
                        $session['title'], 
                        $topics, 
                        $status, 
                        $sessionType
                    );
                    
                    if (!mysqli_stmt_execute($sessionStmt)) {
                        throw new Exception("Failed to add session: " . mysqli_error($conn));
                    }
                }
            }
        }
        
        // Handle chat messages if provided
        if (isset($data['groupChat']) && is_array($data['groupChat']) && !empty($data['groupChat'])) {
            // We'll just check for the last message and add it if it's new
            $lastMessage = end($data['groupChat']);
            
            if (isset($lastMessage['text']) && !empty($lastMessage['text'])) {
                $chatQuery = "INSERT INTO group_chat 
                            (group_id, user_id, text, is_owner) 
                            VALUES (?, ?, ?, ?)";
                $chatStmt = mysqli_prepare($conn, $chatQuery);
                $isOwner = isset($lastMessage['isOwner']) ? ($lastMessage['isOwner'] ? 1 : 0) : ($group['is_owner'] ? 1 : 0);
                
                mysqli_stmt_bind_param(
                    $chatStmt, 
                    "iisi", 
                    $groupId, 
                    $userId, 
                    $lastMessage['text'], 
                    $isOwner
                );
                
                if (!mysqli_stmt_execute($chatStmt)) {
                    throw new Exception("Failed to add message: " . mysqli_error($conn));
                }
            }
        }
    }
    
    // Commit transaction
    mysqli_commit($conn);
    
    // Get updated member count
    $countQuery = "SELECT COUNT(*) as member_count FROM group_members WHERE group_id = ?";
    $countStmt = mysqli_prepare($conn, $countQuery);
    mysqli_stmt_bind_param($countStmt, "i", $groupId);
    mysqli_stmt_execute($countStmt);
    $countResult = mysqli_stmt_get_result($countStmt);
    $countRow = mysqli_fetch_assoc($countResult);
    $memberCount = $countRow['member_count'];
    
    // Get joined status for this user
    $joinedQuery = "SELECT COUNT(*) as is_joined FROM group_members WHERE group_id = ? AND user_id = ?";
    $joinedStmt = mysqli_prepare($conn, $joinedQuery);
    mysqli_stmt_bind_param($joinedStmt, "ii", $groupId, $userId);
    mysqli_stmt_execute($joinedStmt);
    $joinedResult = mysqli_stmt_get_result($joinedStmt);
    $joinedRow = mysqli_fetch_assoc($joinedResult);
    $isJoined = $joinedRow['is_joined'] > 0;
    
    // Set response data
    $response['data'] = array(
        'id' => $groupId,
        'currentMembers' => $memberCount,
        'Joined' => $isJoined,
        'Owner' => $group['is_owner'] > 0
    );
    
    $response['message'] = 'Study group updated successfully';
    
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