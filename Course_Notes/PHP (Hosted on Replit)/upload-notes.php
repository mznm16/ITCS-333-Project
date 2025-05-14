<?php
// upload-notes.php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

header('Content-Type: application/json');
require 'db_config.php';

// Debug logging
error_log('Request method: ' . $_SERVER['REQUEST_METHOD']);
error_log('POST data: ' . print_r($_POST, true));
error_log('FILES data: ' . print_r($_FILES, true));

// Check if this is an edit (update) request
$isEdit = isset($_GET['edit']) && $_GET['edit'] == '1';

$title = $_POST['title'] ?? '';
$college = $_POST['college'] ?? '';
$description = $_POST['description'] ?? '';
$long_description = $_POST['long_description'] ?? '';
$uploader = $_POST['uploader'] ?? '';

// Validate required fields
if (empty($title) || empty($college)) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields']);
    error_log('Missing required fields: title=' . ($title ?: 'missing') . ', college=' . ($college ?: 'missing'));
    exit;
}

// Handle file upload
$file_url = '';
if (!$isEdit) {  // Only require file for new uploads
    if (!isset($_FILES['notesFile'])) {
        http_response_code(400);
        echo json_encode(['error' => 'No file was uploaded']);
        error_log('No file in request');
        exit;
    }

    // Check file size before processing
    $maxFileSize = 10 * 1024 * 1024; // 10MB in bytes
    if ($_FILES['notesFile']['size'] > $maxFileSize) {
        http_response_code(400);
        echo json_encode(['error' => 'File size exceeds the limit of 10MB']);
        error_log('File too large: ' . $_FILES['notesFile']['size'] . ' bytes');
        exit;
    }

    if ($_FILES['notesFile']['error'] !== UPLOAD_ERR_OK) {
        $error = '';
        switch ($_FILES['notesFile']['error']) {
            case UPLOAD_ERR_INI_SIZE:
                $error = 'The uploaded file exceeds the server limit of 10MB';
                break;
            case UPLOAD_ERR_FORM_SIZE:
                $error = 'The uploaded file exceeds the form limit of 10MB';
                break;
            case UPLOAD_ERR_PARTIAL:
                $error = 'The uploaded file was only partially uploaded';
                break;
            case UPLOAD_ERR_NO_FILE:
                $error = 'No file was uploaded';
                break;
            case UPLOAD_ERR_NO_TMP_DIR:
                $error = 'Missing a temporary folder';
                break;
            case UPLOAD_ERR_CANT_WRITE:
                $error = 'Failed to write file to disk';
                break;
            default:
                $error = 'Unknown upload error';
        }
        http_response_code(400);
        echo json_encode(['error' => $error]);
        error_log('File upload error: ' . $error);
        exit;
    }

    // Create uploads directory if it doesn't exist
    $uploadDir = __DIR__ . '/../uploads/';
    if (!is_dir($uploadDir)) {
        if (!mkdir($uploadDir, 0777, true)) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to create upload directory']);
            error_log('Failed to create directory: ' . $uploadDir);
            exit;
        }
    }

    // Generate unique filename
    $filename = basename($_FILES['notesFile']['name']);
    $targetFile = $uploadDir . uniqid() . '_' . $filename;
    
    if (!move_uploaded_file($_FILES['notesFile']['tmp_name'], $targetFile)) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to move uploaded file']);
        error_log('Failed to move uploaded file to: ' . $targetFile);
        exit;
    }
    
    // Store relative path in database
    $file_url = 'uploads/' . basename($targetFile);
}

try {
    if ($isEdit) {
        $id = isset($_POST['id']) ? intval($_POST['id']) : 0;
        if ($id <= 0) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid note id for update']);
            exit;
        }

        if ($file_url) {
            $stmt = $pdo->prepare('UPDATE course_notes SET title=?, college=?, description=?, long_description=?, file_url=?, uploader=? WHERE id=?');
            $success = $stmt->execute([$title, $college, $description, $long_description, $file_url, $uploader, $id]);
        } else {
            $stmt = $pdo->prepare('UPDATE course_notes SET title=?, college=?, description=?, long_description=?, uploader=? WHERE id=?');
            $success = $stmt->execute([$title, $college, $description, $long_description, $uploader, $id]);
        }

        if ($success) {
            $stmt = $pdo->prepare('SELECT * FROM course_notes WHERE id = ?');
            $stmt->execute([$id]);
            $updatedNote = $stmt->fetch();
            echo json_encode(['success' => true, 'note' => $updatedNote]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to update note']);
        }
    } else {
        $stmt = $pdo->prepare('INSERT INTO course_notes (title, college, description, long_description, file_url, uploader) VALUES (?, ?, ?, ?, ?, ?)');
        if ($stmt->execute([$title, $college, $description, $long_description, $file_url, $uploader])) {
            $noteId = $pdo->lastInsertId();
            $newNote = [
                'id' => $noteId,
                'title' => $title,
                'college' => $college,
                'description' => $description,
                'long_description' => $long_description,
                'file_url' => $file_url,
                'uploader' => $uploader
            ];
            echo json_encode(['success' => true, 'note' => $newNote]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to upload note']);
        }
    }
} catch (PDOException $e) {
    error_log('Database error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Database error occurred']);
}
?>
