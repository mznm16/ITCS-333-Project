<?php
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
    
    // Validate user (in a real app, you'd check for authentication)
    $userId = isset($data['user_id']) ? intval($data['user_id']) : 1; // Default to user 1 for testing
    
    // Validate required fields
    $requiredFields = ['title', 'category', 'course', 'description', 'maxMembers', 'location', 'Days'];
    foreach ($requiredFields as $field) {
        if (!isset($data[$field]) || empty($data[$field])) {
            throw new Exception("Missing required field: $field");
        }
    }
    
    // Prepare JSON data for MySQL
    $days = json_encode($data['Days']);
    $requirements = isset($data['requirements']) ? json_encode($data['requirements']) : json_encode([]);
    
    // Process meeting time
    $meetingTime = isset($data['meetingTime']) ? intval($data['meetingTime']) : 0;
    
    // Default image if not provided
    $image = isset($data['image']) ? $data['image'] : '../images/newcs.jpg';
    
    // Begin transaction
    mysqli_begin_transaction($conn);
    
    // Insert study group
    $query = "INSERT INTO study_groups 
              (title, category, course, description, max_members, meeting_time, location, days, requirements, image, owner_id) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    
    $stmt = mysqli_prepare($conn, $query);
    mysqli_stmt_bind_param(
        $stmt, 
        "ssssisssssi", 
        $data['title'], 
        $data['category'], 
        $data['course'], 
        $data['description'], 
        $data['maxMembers'], 
        $meetingTime, 
        $data['location'], 
        $days, 
        $requirements, 
        $image, 
        $userId
    );
    
    if (mysqli_stmt_execute($stmt)) {
        $groupId = mysqli_insert_id($conn);
        
        // Add the creator as a group member and owner
        $memberQuery = "INSERT INTO group_members (group_id, user_id, is_owner) VALUES (?, ?, 1)";
        $memberStmt = mysqli_prepare($conn, $memberQuery);
        mysqli_stmt_bind_param($memberStmt, "ii", $groupId, $userId);
        
        if (!mysqli_stmt_execute($memberStmt)) {
            throw new Exception("Failed to add owner as member: " . mysqli_error($conn));
        }
        
        // Add resources if provided
        if (isset($data['resources']) && is_array($data['resources']) && count($data['resources']) > 0) {
            foreach ($data['resources'] as $resource) {
                if (isset($resource['title'], $resource['type'], $resource['url'])) {
                    $resourceQuery = "INSERT INTO group_resources 
                                     (group_id, title, type, description, url, added_by) 
                                     VALUES (?, ?, ?, ?, ?, ?)";
                    $resourceStmt = mysqli_prepare($conn, $resourceQuery);
                    $description = isset($resource['description']) ? $resource['description'] : '';
                    $addedBy = 'Owner';
                    
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
        
        // Commit transaction
        mysqli_commit($conn);
        
        // Return the newly created group
        $response['data'] = array(
            'id' => $groupId,
            'title' => $data['title'],
            'category' => $data['category'],
            'course' => $data['course'],
            'description' => $data['description'],
            'maxMembers' => intval($data['maxMembers']),
            'currentMembers' => 1,  // Owner is the first member
            'meetingTime' => $meetingTime,
            'location' => $data['location'],
            'Days' => $data['Days'],
            'requirements' => isset($data['requirements']) ? $data['requirements'] : [],
            'image' => $image,
            'Owner' => true,
            'Joined' => true,
            'resources' => isset($data['resources']) ? $data['resources'] : [],
            'sessions' => [],
            'groupChat' => []
        );
        
        $response['message'] = 'Study group created successfully';
    } else {
        throw new Exception("Failed to create study group: " . mysqli_error($conn));
    }
    
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