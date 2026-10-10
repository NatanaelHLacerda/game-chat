@extends('layouts.app', ['scripts' => ['resources/js/profile-form.js']])

@section('title', 'Cadastro · República')
@section('body-class', 'lobby')

@section('content')
<main class="window auth wide">
    <div class="titlebar">República · Novo morador</div>
    <form method="POST" action="{{ route('register') }}" class="content profile-form">
        @csrf
        <canvas id="preview" width="140" height="170"></canvas>
        <div class="form">
            <p class="intro">Ao entrar você ganha um quarto só seu.</p>
            <label for="name">Nome</label>
            <input id="name" name="name" value="{{ old('name') }}" maxlength="16" autocomplete="username" autofocus required>
            <label for="password">Senha</label>
            <input id="password" name="password" type="password" autocomplete="new-password" required>
            <label for="password_confirmation">Repita a senha</label>
            <input id="password_confirmation" name="password_confirmation" type="password" autocomplete="new-password" required>

            @include('partials.look-picker', ['look' => $defaultLook])
            @include('partials.language-picker', ['selected' => []])

            @if ($errors->any()) <p class="error">{{ $errors->first() }}</p> @endif
            <button class="btn btn-primary">Pegar a chave do meu quarto</button>
            <p class="switch">Já mora aqui? <a href="{{ route('login') }}">Entrar</a></p>
        </div>
    </form>
</main>
@endsection
