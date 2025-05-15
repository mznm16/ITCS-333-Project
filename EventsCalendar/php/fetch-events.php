<?php
// fetch-events.php
// Endpoint: GET /php/fetch-events.php?page=1&pageSize=10&search=...&date=...
// Returns a paginated, filterable, searchable list of events
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
require 'db_config.php';

$page = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
$pageSize = isset($_GET['pageSize']) ? max(1, intval($_GET['pageSize'])) : 10;
$search = isset($_GET['search']) ? trim($_GET['search']) : '';
$date = isset($_GET['date']) ? trim($_GET['date']) : '';
$offset = ($page - 1) * $pageSize;

$where = [];
$params = [];
if ($search !== '') {
    $where[] = '(title LIKE :search OR description LIKE :search OR location LIKE :search)';
    $params[':search'] = "%$search%";
}
if ($date !== '') {
    $where[] = 'date = :date';
    $params[':date'] = $date;
}
$whereSql = $where ? ('WHERE ' . implode(' AND ', $where)) : '';

try {
    // Count total
    $countStmt = $pdo->prepare("SELECT COUNT(*) FROM events $whereSql");
    $countStmt->execute($params);
    $total = $countStmt->fetchColumn();

    // Fetch paginated
    $sql = "SELECT * FROM events $whereSql ORDER BY date DESC LIMIT :offset, :pageSize";
    $stmt = $pdo->prepare($sql);
    foreach ($params as $k => $v) {
        $stmt->bindValue($k, $v);
    }
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->bindValue(':pageSize', $pageSize, PDO::PARAM_INT);
    $stmt->execute();
    $events = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode([
        'total' => intval($total),
        'page' => $page,
        'pageSize' => $pageSize,
        'events' => $events
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to fetch events', 'details' => $e->getMessage()]);
}
