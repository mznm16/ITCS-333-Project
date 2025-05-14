<?php
// download.php: Securely serve files from the uploads directory
$uploadsDir = __DIR__ . '/../uploads/';
$file = basename($_GET['file'] ?? '');
$path = realpath($uploadsDir . $file);

if (!$file || !$path || strpos($path, realpath($uploadsDir)) !== 0 || !file_exists($path)) {
    http_response_code(404);
    echo "File not found.";
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
