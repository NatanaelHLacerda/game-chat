<!doctype html>
<html lang="pt-BR">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>@yield('title', 'República')</title>
    @vite(['resources/css/app.css', ...($scripts ?? [])])
</head>
<body class="@yield('body-class')">
    @yield('content')
</body>
</html>
