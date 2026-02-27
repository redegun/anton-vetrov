<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$dbHost = 'localhost';
$dbName = 'redegun_openclaw';
$dbUser = 'redegun_openclaw';
$dbPass = 'XXvK8bgq';

try {
    $pdo = new PDO("mysql:host=$dbHost;dbname=$dbName;charset=utf8mb4", $dbUser, $dbPass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo json_encode(['error' => 'DB connection failed']);
    exit;
}

$slugsRaw = isset($_GET['slugs']) ? $_GET['slugs'] : '';
$slugs = array_filter(array_map('trim', explode(',', $slugsRaw)), function($s) {
    return $s && preg_match('/^[a-z0-9\-\/]+$/', $s);
});

if (empty($slugs)) {
    echo json_encode([]);
    exit;
}

$placeholders = implode(',', array_fill(0, count($slugs), '?'));
$stmt = $pdo->prepare("SELECT slug, views FROM page_views WHERE slug IN ($placeholders)");
$stmt->execute($slugs);

$result = [];
foreach ($slugs as $s) $result[$s] = 0;
while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    $result[$row['slug']] = (int)$row['views'];
}

echo json_encode($result);
