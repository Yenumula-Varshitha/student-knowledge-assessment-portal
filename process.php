<?php 
$conn = mysqli_connect("localhost", "root", "", "exam_db"); 
if (!$conn) { die("Connection failed: " . mysqli_connect_error()); } 
$action = isset($_GET['action']) ? $_GET['action'] : ""; 
if ($action == "signup") { 
    $user = mysqli_real_escape_string($conn, $_GET['user']); 
    $pass = mysqli_real_escape_string($conn, $_GET['pass']); 
    $check = mysqli_query($conn, "SELECT * FROM users WHERE username='$user'"); 
    if (mysqli_num_rows($check) > 0) { 
        echo "user_exists"; 
    } else { 
        $r = mysqli_query($conn, "INSERT INTO users (username, password) VALUES 
('$user', '$pass')"); 
        echo $r ? "signup_success" : "Error: " . mysqli_error($conn); 
    } 
} 
if ($action == "login") { 
    $user = mysqli_real_escape_string($conn, $_GET['user']); 
    $pass = mysqli_real_escape_string($conn, $_GET['pass']); 
    $r = mysqli_query($conn, "SELECT * FROM users WHERE username='$user' AND 
password='$pass'"); 
    echo (mysqli_num_rows($r) > 0) ? "success" : "fail"; 
} 
if ($action == "save") { 
    $user  = mysqli_real_escape_string($conn, $_GET['user']); 
    $score = (int)$_GET['score']; 
    $r = mysqli_query($conn, 
        "INSERT INTO leaderboard (name, score) VALUES ('$user', $score) 
         ON DUPLICATE KEY UPDATE score = GREATEST(score, $score)" 
    ); 
    echo $r ? "saved" : "Error: " . mysqli_error($conn); 
} 
if ($action == "leaderboard") { 
    $r    = mysqli_query($conn, "SELECT * FROM leaderboard ORDER BY score DESC"); 
    $rank = 1; 
    while ($row = mysqli_fetch_array($r)) { 
        echo "<tr><td>" . $rank . "</td><td>" . htmlspecialchars($row['name']) . 
"</td><td>" . $row['score'] . "</td></tr>"; 
        $rank++; 
    } 
} 
mysqli_close($conn); 
?>