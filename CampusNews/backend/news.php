<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}
require_once 'db.php';

header('Content-Type: application/json');

function mapNewsRow($row) {
    return [
        'news-title' => $row['headline'],
        'news-short-desc' => $row['summary'],
        'whole-news' => $row['content'],
        'news-tag' => $row['category'],
        'news-date' => $row['created_at'],
        'news-id' => $row['id'],
        'tags' => $row['tags'],
        'image' => $row['image'],
        'source' => $row['source'],
        'event-date' => $row['event_date'],
        'urgent' => $row['urgent'],
    ];
}

switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        if (isset($_GET['id'])) {
            $stmt = $pdo->prepare("SELECT * FROM news WHERE id = ?");
            $stmt->execute([$_GET['id']]);
            $news = $stmt->fetch();
            if (!$news) {
                http_response_code(404);
                include __DIR__ . '/errors/404.php';
                exit;
            }
            echo json_encode(mapNewsRow($news));
        } else {
            $stmt = $pdo->query("SELECT * FROM news ORDER BY created_at DESC");
            $rows = $stmt->fetchAll();
            $mapped = array_map('mapNewsRow', $rows);
            echo json_encode($mapped);
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        if (!$data || !isset($data['headline'], $data['summary'], $data['content'], $data['category'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing required fields']);
            exit;
        }
        $stmt = $pdo->prepare("INSERT INTO news (headline, summary, content, category, image, source, event_date, tags, urgent) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $data['headline'],
            $data['summary'],
            $data['content'],
            $data['category'],
            $data['image'] ?? null,
            $data['source'] ?? null,
            $data['event_date'] ?? null,
            $data['tags'] ?? null,
            !empty($data['urgent']) ? 1 : 0
        ]);
        echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);
        break;

    default:
        http_response_code(401);
        include __DIR__ . '/errors/401.php';
        exit;
}
?>