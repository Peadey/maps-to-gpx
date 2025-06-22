<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <link rel="manifest" href="manifest.json">
  <title>Maps → GPX</title>
</head>
<body>
  <h1>Google Maps → GPX</h1>
  <form method="POST">
    <input type="url" name="url" placeholder="Google Maps Link" required style="width:100%">
    <button type="submit">GPX erzeugen</button>
  </form>

<?php
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_encode(['url' => $_POST['url']]);
    $opts = ['http'=>['method'=>'POST','header'=>"Content-Type: application/json\r\n",'content'=>$data]];
    $ctx = stream_context_create($opts);
    $backend = 'https://maps-to-gpx.onrender.com/api/gpx';
    $res = @file_get_contents($backend, false, $ctx);
    if ($res === false) {
        echo '<p style="color:red">Fehler bei der Konvertierung.</p>';
    } else {
        file_put_contents('route.gpx', $res);
        echo '<p><a href="route.gpx" download>GPX herunterladen</a></p>';
    }
}
?>

<script>
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
      .then(() => console.log('✅ Service Worker registriert'))
      .catch(err => console.error('SW-Fehler:', err));
  }
</script>
</body>
</html>