<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <title inertia>{{ config('app.name', 'QuizMuz') }}</title>

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=figtree:400,500,600,700&display=swap" rel="stylesheet" />

    <!-- PWA Meta Tags -->
    <link rel="icon" type="image/png" href="{{ asset('images/logo.png') }}" />
    <meta name="theme-color" content="#000000" />
{{--    <meta name="description" content="Préparez-vous pour les tests de Littérature Musicale" />--}}
    <link rel="apple-touch-icon" href="{{ asset('images/apple-touch-icon.png') }}" />
    <link rel="manifest" href="{{ asset('manifest.json') }}" />

    <!-- Scripts -->
    @routes
    @viteReactRefresh
    @vite(['resources/js/app.jsx', "resources/js/Pages/".($page['component'] ?? 'Home').".jsx"])
    @inertiaHead
</head>
<body class="font-sans antialiased">
@inertia

<script>
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('{{ asset('serviceworker.js') }}')
                .then((registration) => {
                    console.log('Service worker registered: ', registration.scope);
                })
                .catch((error) => {
                    console.log('Service worker registration failed: ', error);
                });
        });
    }
</script>
</body>
</html>
