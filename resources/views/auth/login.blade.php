@extends('layouts.app')

@section('title', 'Sign in · República')
@section('body-class', 'lobby')

@section('content')
<main class="window auth">
    <div class="titlebar">República · Sign in</div>
    <form method="POST" action="{{ route('login') }}" class="content form">
        @csrf
        <p class="intro">Welcome back! Your friends are waiting to practice languages.</p>
        <label for="name">Name</label>
        <input id="name" name="name" value="{{ old('name') }}" maxlength="16" autocomplete="username" autofocus required>
        <label for="password">Password</label>
        <input id="password" name="password" type="password" autocomplete="current-password" required>
        @if ($errors->any()) <p class="error">{{ $errors->first() }}</p> @endif
        <button class="btn btn-primary">Sign in</button>
        <p class="switch">Don't live here yet? <a href="{{ route('register') }}">Get your key</a></p>
    </form>
</main>
@endsection
