@extends('layouts.app', ['scripts' => ['resources/js/profile-form.js']])

@section('title', 'Perfil · República')
@section('body-class', 'lobby')

@section('content')
<main class="window auth wide">
    <div class="titlebar">Perfil de {{ $user->name }}</div>
    <form method="POST" action="{{ route('profile.update') }}" class="content profile-form">
        @csrf
        @method('PUT')
        <canvas id="preview" width="140" height="170"></canvas>
        <div class="form">
            @include('partials.look-picker', ['look' => $user->look])
            @include('partials.language-picker', ['selected' => ['speaks' => $user->speaks, 'practices' => $user->practices]])

            @if ($errors->any()) <p class="error">{{ $errors->first() }}</p> @endif
            <div class="actions">
                <a class="btn" href="{{ route('hotel') }}">Voltar</a>
                <button class="btn btn-primary">Salvar</button>
            </div>
        </div>
    </form>
</main>
@endsection
