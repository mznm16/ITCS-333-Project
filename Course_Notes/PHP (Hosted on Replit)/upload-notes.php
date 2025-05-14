<?php
// upload-notes.php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
require 'db_config.php';

// Check if this is an edit (update) request
$isEdit = isset($_GET['edit']) && $_GET['edit'] == '1';

$title = $_POST['title'] ?? '';
$college = $_POST['college'] ?? '';
$description = $_POST['description'] ?? '';
$long_description = $_POST['long_description'] ?? '';
$uploader = $_POST['uploader'] ?? '';

// Handle file upload
$file_url = '';
if (isset($_FILES['notesFile']) && $_FILES['notesFile']['error'] === UPLOAD_ERR_OK) {
    $uploadDir = '../uploads/';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }
    $filename = basename($_FILES['notesFile']['name']);
    $targetFile = $uploadDir . uniqid() . '_' . $filename;
    if (move_uploaded_file($_FILES['notesFile']['tmp_name'], $targetFile)) {
        $file_url = $targetFile;
    }
}

if ($isEdit) {
    $id = isset($_POST['id']) ? intval($_POST['id']) : 0;
    if ($id <= 0) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid note id for update']);
        exit;
    }
    // Only update file_url if a new file was uploaded
    if ($file_url) {
        $stmt = $pdo->prepare('UPDATE course_notes SET title=?, college=?, description=?, long_description=?, file_url=?, uploader=? WHERE id=?');
        $success = $stmt->execute([$title, $college, $description, $long_description, $file_url, $uploader, $id]);
    } else {
        $stmt = $pdo->prepare('UPDATE course_notes SET title=?, college=?, description=?, long_description=?, uploader=? WHERE id=?');
        $success = $stmt->execute([$title, $college, $description, $long_description, $uploader, $id]);
    }
    if ($success) {
        // Fetch the updated note and return it
        $stmt = $pdo->prepare('SELECT * FROM course_notes WHERE id = ?');
        $stmt->execute([$id]);
        $updatedNote = $stmt->fetch();
        echo json_encode(['success' => true, 'note' => $updatedNote]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to update note']);
    }
    exit;
}

if (!$title || !$college) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields']);
    exit;
}

$stmt = $pdo->prepare('INSERT INTO course_notes (title, college, description, long_description, file_url, uploader) VALUES (?, ?, ?, ?, ?, ?)');
if ($stmt->execute([$title, $college, $description, $long_description, $file_url, $uploader])) {
    echo json_encode(['success' => true]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to upload note']);
}
?>
