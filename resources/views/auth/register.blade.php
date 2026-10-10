@extends('layouts.app', ['scripts' => ['resources/js/profile-form.js']])

@section('title', 'Sign up · República')
@section('body-class', 'lobby')

@section('content')
<main class="window auth wide">
    <div class="titlebar">República · New resident</div>
    <form method="POST" action="{{ route('register') }}" class="content profile-form">
        @csrf
        <canvas id="preview" width="140" height="170"></canvas>
        <div class="form">
            <p class="intro">When you move in, you get a room of your own.</p>
            <label for="name">Name</label>
            <input id="name" name="name" value="{{ old('name') }}" maxlength="16" autocomplete="username" autofocus required>
            <label for="password">Password</label>
            <input id="password" name="password" type="password" autocomplete="new-password" required>
            <label for="password_confirmation">Confirm password</label>
            <input id="password_confirmation" name="password_confirmation" type="password" autocomplete="new-password" required>

            @include('partials.look-picker', ['look' => $defaultLook])
            @include('partials.language-picker', ['selected' => []])

            @if ($errors->any()) <p class="error">{{ $errors->first() }}</p> @endif
            <button class="btn btn-primary">Get the key to my room</button>
            <p class="switch">Already live here? <a href="{{ route('login') }}">Sign in</a></p>
        </div>
    </form>
</main>
@endsection
