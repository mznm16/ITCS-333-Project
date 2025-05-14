<?php
// Headers
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

// Include database connection
include_once '../../config.php';

// Initialize response array
$response = array();
$response['status'] = 'success';
$response['message'] = '';
$response['data'] = null;

try {
    // Check if ID parameter exists
    if(!isset($_GET['id'])) {
        throw new Exception("Missing required parameter: id");
    }
    
    $groupId = intval($_GET['id']);
    $userId = isset($_GET['user_id']) ? intval($_GET['user_id']) : 0;
    
    // Query to get study group details
    $query = "SELECT g.*, 
                    (SELECT COUNT(*) FROM group_members WHERE group_id = g.group_id) as current_members,
                    (SELECT COUNT(*) FROM group_members WHERE group_id = g.group_id AND user_id = ? AND is_owner = 1) as Owner,
                    (SELECT COUNT(*) FROM group_members WHERE group_id = g.group_id AND user_id = ?) as Joined
              FROM study_groups g
              WHERE g.group_id = ?";
    
    // Prepare statement
    $stmt = mysqli_prepare($conn, $query);
    
    // Bind parameters
    mysqli_stmt_bind_param($stmt, "iii", $userId, $userId, $groupId);
    
    // Execute query
    mysqli_stmt_execute($stmt);
    
    // Get result
    $result = mysqli_stmt_get_result($stmt);
    
    if($result) {
        // Check if record found
        if(mysqli_num_rows($result) > 0) {
            $row = mysqli_fetch_assoc($result);
            
            // Format the data to match the expected structure in the JavaScript
            $group = array(
                'id' => $row['group_id'],
                'title' => $row['title'],
                'category' => $row['category'],
                'course' => $row['course'],
                'description' => $row['description'],
                'maxMembers' => intval($row['max_members']),
                'currentMembers' => intval($row['current_members']),
                'meetingTime' => intval($row['meeting_time']),
                'location' => $row['location'],
                'Days' => json_decode($row['days']),
                'requirements' => json_decode($row['requirements']),
                'image' => $row['image'] ?: '../images/newcs.jpg',
                'Owner' => $row['Owner'] > 0,
                'Joined' => $row['Joined'] > 0,
                'createdAt' => $row['created_at']
            );
            
            // Get resources for this group
            $resourcesQuery = "SELECT * FROM group_resources WHERE group_id = ?";
            $resourcesStmt = mysqli_prepare($conn, $resourcesQuery);
            mysqli_stmt_bind_param($resourcesStmt, "i", $groupId);
            mysqli_stmt_execute($resourcesStmt);
            $resourcesResult = mysqli_stmt_get_result($resourcesStmt);
            
            $resources = array();
            while($resourceRow = mysqli_fetch_assoc($resourcesResult)) {
                $resources[] = array(
                    'title' => $resourceRow['title'],
                    'type' => $resourceRow['type'],
                    'description' => $resourceRow['description'],
                    'url' => $resourceRow['url'],
                    'addedBy' => $resourceRow['added_by'],
                    'lastUpdated' => $resourceRow['last_updated']
                );
            }
            $group['resources'] = $resources;
            
            // Get sessions for this group
            $sessionsQuery = "SELECT * FROM group_sessions WHERE group_id = ?";
            $sessionsStmt = mysqli_prepare($conn, $sessionsQuery);
            mysqli_stmt_bind_param($sessionsStmt, "i", $groupId);
            mysqli_stmt_execute($sessionsStmt);
            $sessionsResult = mysqli_stmt_get_result($sessionsStmt);
            
            $sessions = array();
            while($sessionRow = mysqli_fetch_assoc($sessionsResult)) {
                $sessions[] = array(
                    'day' => $sessionRow['day'],
                    'month' => $sessionRow['month'],
                    'year' => $sessionRow['year'],
                    'time' => $sessionRow['time'],
                    'title' => $sessionRow['title'],
                    'topics' => $sessionRow['topics'],
                    'status' => $sessionRow['status'],
                    'sessionType' => $sessionRow['session_type']
                );
            }
            $group['sessions'] = $sessions;
            
            // Get chat messages for this group
            $chatQuery = "SELECT c.*, u.username as author FROM group_chat c
                          JOIN users u ON c.user_id = u.user_id
                          WHERE c.group_id = ?
                          ORDER BY c.timestamp ASC";
            $chatStmt = mysqli_prepare($conn, $chatQuery);
            mysqli_stmt_bind_param($chatStmt, "i", $groupId);
            mysqli_stmt_execute($chatStmt);
            $chatResult = mysqli_stmt_get_result($chatStmt);
            
            $groupChat = array();
            while($chatRow = mysqli_fetch_assoc($chatResult)) {
                $groupChat[] = array(
                    'text' => $chatRow['text'],
                    'author' => $chatRow['author'],
                    'isOwner' => $chatRow['is_owner'] ? true : false,
                    'timestamp' => $chatRow['timestamp']
                );
            }
            $group['groupChat'] = $groupChat;
            
            $response['data'] = $group;
        } else {
            throw new Exception("No study group found with ID: $groupId");
        }
    } else {
        throw new Exception("Database query failed: " . mysqli_error($conn));
    }
    
} catch(Exception $e) {
    $response['status'] = 'error';
    $response['message'] = $e->getMessage();
}

// Return response
echo json_encode($response['data'] ?? (object)[]);
?> 