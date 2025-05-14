<?php
// get-comments.php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
require 'db_config.php';

$note_id = isset($_GET['note_id']) ? intval($_GET['note_id']) : 0;

try {
    // Debug: Log the note_id being requested
    error_log("Fetching comments for note_id: " . $note_id);
    
    if ($note_id <= 0) {
        error_log("Invalid note_id received: " . $note_id);
        echo json_encode([
            'error' => 'Invalid note ID',
            'note_id' => $note_id,
            'debug' => 'note_id parameter missing or invalid',
        ]);
        exit;
    }

    $stmt = $pdo->prepare('SELECT * FROM note_comments WHERE note_id = ? ORDER BY created_at DESC');
    $stmt->execute([$note_id]);
    $comments = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Debug: Log the number of comments found
    error_log("Found " . count($comments) . " comments");
    
    if (count($comments) === 0) {
        echo json_encode([
            'comments' => [],
            'debug' => 'No comments found for note_id ' . $note_id
        ]);
        exit;
    }
    echo json_encode($comments);
} catch (Exception $e) {
    error_log("Error in get-comments.php: " . $e->getMessage());
    echo json_encode([
        'error' => $e->getMessage(),
        'note_id' => $note_id,
        'debug' => 'Exception thrown in get-comments.php'
    ]);
}
?>
