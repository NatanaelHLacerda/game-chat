@extends('layouts.app')

@section('title', 'Entrar · República')
@section('body-class', 'lobby')

@section('content')
<main class="window auth">
    <div class="titlebar">República · Entrar</div>
    <form method="POST" action="{{ route('login') }}" class="content form">
        @csrf
        <p class="intro">Bem-vindo de volta! Seus amigos estão esperando para praticar idiomas.</p>
        <label for="name">Nome</label>
        <input id="name" name="name" value="{{ old('name') }}" maxlength="16" autocomplete="username" autofocus required>
        <label for="password">Senha</label>
        <input id="password" name="password" type="password" autocomplete="current-password" required>
        @if ($errors->any()) <p class="error">{{ $errors->first() }}</p> @endif
        <button class="btn btn-primary">Entrar</button>
        <p class="switch">Ainda não mora aqui? <a href="{{ route('register') }}">Pegue sua chave</a></p>
    </form>
</main>
@endsection
