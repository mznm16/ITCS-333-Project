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
$response['data'] = array();

try {
    // Check if user is logged in (optional, implement later)
    $userId = isset($_GET['user_id']) ? intval($_GET['user_id']) : 0;
    
    // Query to get all study groups
    $query = "SELECT g.*, 
                    (SELECT COUNT(*) FROM group_members WHERE group_id = g.group_id) as current_members,
                    (SELECT COUNT(*) FROM group_members WHERE group_id = g.group_id AND user_id = ? AND is_owner = 1) as Owner,
                    (SELECT COUNT(*) FROM group_members WHERE group_id = g.group_id AND user_id = ?) as Joined
              FROM study_groups g
              ORDER BY g.created_at DESC";
    
    // Prepare statement
    $stmt = mysqli_prepare($conn, $query);
    
    // Bind parameters
    mysqli_stmt_bind_param($stmt, "ii", $userId, $userId);
    
    // Execute query
    mysqli_stmt_execute($stmt);
    
    // Get result
    $result = mysqli_stmt_get_result($stmt);
    
    if($result) {
        // Check if any records found
        if(mysqli_num_rows($result) > 0) {
            while($row = mysqli_fetch_assoc($result)) {
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
                mysqli_stmt_bind_param($resourcesStmt, "i", $row['group_id']);
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
                mysqli_stmt_bind_param($sessionsStmt, "i", $row['group_id']);
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
                
                array_push($response['data'], $group);
            }
        } else {
            $response['message'] = 'No study groups found';
        }
    } else {
        throw new Exception("Database query failed: " . mysqli_error($conn));
    }
    
} catch(Exception $e) {
    $response['status'] = 'error';
    $response['message'] = $e->getMessage();
    error_log("Database error: " . $e->getMessage());
}

// Log the response for debugging
error_log("API Response: " . json_encode($response));

// Return response
echo json_encode($response['data']);
?> 