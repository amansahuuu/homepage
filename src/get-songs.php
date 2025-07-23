<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$songsDir = 'songs'; // Path to your songs folder
$allowedExtensions = ['mp3', 'wav', 'm4a', 'aac', 'ogg', 'flac'];

function getSongsFromDirectory($dir) {
    global $allowedExtensions;
    $songs = [];
    
    if (is_dir($dir)) {
        $files = scandir($dir);
        foreach ($files as $file) {
            if ($file != "." && $file != "..") {
                $filePath = $dir . $file;
                if (is_file($filePath)) {
                    $extension = strtolower(pathinfo($file, PATHINFO_EXTENSION));
                    if (in_array($extension, $allowedExtensions)) {
                        $songs[] = [
                            'name' => pathinfo($file, PATHINFO_FILENAME),
                            'filename' => $file,
                            'path' => $filePath,
                            'size' => filesize($filePath),
                            'extension' => $extension,
                            'url' => './songs/' . $file
                        ];
                    }
                }
            }
        }
    }
    
    return $songs;
}

$songs = getSongsFromDirectory($songsDir);
echo json_encode($songs);
?>