<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="Портфолио Алисы Шевцовой, UI/UX-дизайнера сайтов и веб-сервисов.">
    <meta name="theme-color" content="#141517">
    <title>Алиса Шевцова</title>
    <link rel="icon" href="/favicon.svg" type="image/svg+xml">
    @vite('resources/js/app.ts')
    @inertiaHead
</head>
<body>
    @inertia
</body>
</html>
