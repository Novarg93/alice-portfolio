@php
    $name = 'Алиса Шевцова';
    $role = 'UI/UX-дизайнер';
    $title = $name.' — портфолио UI/UX-дизайнера';
    $description = 'Портфолио веб-дизайнера Алисы Шевцовой. Дизайн сайтов и веб-сервисов для e-commerce, избранные кейсы, навыки и опыт работы.';
    $canonicalUrl = rtrim(config('app.url'), '/').'/';
    $previewImage = $canonicalUrl.'images/portfolio-preview.jpg';
    $previewAlt = 'Портрет Алисы Шевцовой и подпись «UI/UX-дизайнер» на тёмном фоне';
    $profile = [
        '@context' => 'https://schema.org',
        '@type' => 'ProfilePage',
        'name' => $title,
        'description' => $description,
        'url' => $canonicalUrl,
        'inLanguage' => 'ru',
        'mainEntity' => [
            '@type' => 'Person',
            'name' => $name,
            'jobTitle' => $role,
            'url' => $canonicalUrl,
            'image' => $canonicalUrl.'images/alice.webp',
        ],
    ];
@endphp
<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ $title }}</title>
    <meta name="description" content="{{ $description }}">
    <meta name="theme-color" content="#141517">
    <link rel="canonical" href="{{ $canonicalUrl }}">
    <link rel="icon" href="/favicon.ico" sizes="16x16 32x32 48x48 64x64">
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" sizes="any">
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180">

    <meta property="og:type" content="website">
    <meta property="og:locale" content="ru_RU">
    <meta property="og:site_name" content="{{ $name }}">
    <meta property="og:title" content="{{ $title }}">
    <meta property="og:description" content="{{ $description }}">
    <meta property="og:url" content="{{ $canonicalUrl }}">
    <meta property="og:image" content="{{ $previewImage }}">
    <meta property="og:image:type" content="image/jpeg">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:alt" content="{{ $previewAlt }}">

    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="{{ $title }}">
    <meta name="twitter:description" content="{{ $description }}">
    <meta name="twitter:image" content="{{ $previewImage }}">
    <meta name="twitter:image:alt" content="{{ $previewAlt }}">

    <script type="application/ld+json">{!! \Illuminate\Support\Js::encode($profile) !!}</script>
    @vite('resources/js/app.ts')
    @inertiaHead
</head>
<body>
    @inertia
</body>
</html>
