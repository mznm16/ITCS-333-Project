<?php
// download.php: Securely serve files from the uploads directory
$uploadsDir = __DIR__ . '/../uploads/';
$file = basename($_GET['file'] ?? '');
$path = $uploadsDir . $file;

// Basic security check to prevent directory traversal
if (!$file || strpos($file, '/') !== false || strpos($file, '\\') !== false) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid file name']);
    exit;
}

if (!file_exists($path)) {
    error_log('File not found: ' . $path);
    http_response_code(404);
    echo json_encode(['error' => 'File not found']);
    exit;
}

// Set headers to force download
header('Content-Description: File Transfer');
header('Content-Type: application/octet-stream');
header('Content-Disposition: attachment; filename="' . $file . '"');
header('Expires: 0');
header('Cache-Control: must-revalidate');
header('Pragma: public');
header('Content-Length: ' . filesize($path));
readfile($path);
exit;
?>
