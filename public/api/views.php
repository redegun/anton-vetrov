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

// Create table if not exists
$pdo->exec("CREATE TABLE IF NOT EXISTS page_views (
    slug VARCHAR(255) PRIMARY KEY,
    views INT UNSIGNED DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

$slug = isset($_GET['slug']) ? trim($_GET['slug'], '/') : '';
if (!$slug || !preg_match('/^[a-z0-9\-\/]+$/', $slug)) {
    echo json_encode(['error' => 'Invalid slug']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Increment view
    $stmt = $pdo->prepare("INSERT INTO page_views (slug, views) VALUES (?, 1) ON DUPLICATE KEY UPDATE views = views + 1");
    $stmt->execute([$slug]);
    
    $stmt = $pdo->prepare("SELECT views FROM page_views WHERE slug = ?");
    $stmt->execute([$slug]);
    $views = $stmt->fetchColumn() ?: 0;
    
    echo json_encode(['slug' => $slug, 'views' => (int)$views]);
} else {
    // Get view count
    $stmt = $pdo->prepare("SELECT views FROM page_views WHERE slug = ?");
    $stmt->execute([$slug]);
    $views = $stmt->fetchColumn() ?: 0;
    
    echo json_encode(['slug' => $slug, 'views' => (int)$views]);
}
