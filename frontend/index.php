<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Maps to GPX</title>

  <!-- Bootstrap 5 CDN -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" />
  <link rel="manifest" href="manifest.json" />
</head>
<body class="bg-light">

  <div class="container py-5">
    <h1 class="mb-4 text-center">Google Maps → GPX</h1>

    <form method="POST" class="card p-4 shadow-sm">
      <div class="mb-3">
        <label for="url" class="form-label">Google Maps Link</label>
        <input type="url" class="form-control" id="url" name="url" placeholder="https://www.google.com/maps/dir/..." required>
      </div>
      <button type="submit" class="btn btn-primary w-100">GPX erzeugen</button>
    </form>

    <div class="mt-4 text-center">
    <?php
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $data = json_encode(['url' => $_POST['url']]);
        $opts = ['http'=>['method'=>'POST','header'=>"Content-Type: application/json\r\n",'content'=>$data]];
        $ctx = stream_context_create($opts);
        $backend = 'https://maps-to-gpx.onrender.com/api/gpx';
        $res = @file_get_contents($backend, false, $ctx);
        if ($res === false) {
            echo '<div class="alert alert-danger mt-3">❌ Fehler bei der Konvertierung.</div>';
        } else {
            file_put_contents('route.gpx', $res);
            echo '<a href="route.gpx" download class="btn btn-success mt-3">GPX herunterladen</a>';
        }
    }
    ?>

</div>
  </div>

  <!-- Bootstrap JS (nur falls du es brauchst, hier nicht zwingend nötig) -->
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>

  <!-- Service Worker -->
  <script>
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('sw.js')
        .then(() => console.log('✅ Service Worker registriert'))
        .catch(err => console.error('Service Worker Fehler:', err));
    }
  </script>
</body>
</html>