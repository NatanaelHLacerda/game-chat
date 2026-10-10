<?php

namespace App\Http\Controllers\Auth;

use App\Actions\RegisterResident;
use App\Http\Controllers\Controller;
use App\Http\Requests\RegisterRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\View\View;

class RegisterController extends Controller
{
    public function create(): View
    {
        return view('auth.register', [
            'palette' => config('republica.look_palette'),
            'styles' => config('republica.look_styles'),
            'languages' => config('republica.languages'),
            'defaultLook' => config('republica.default_look'),
        ]);
    }

    public function store(RegisterRequest $request, RegisterResident $register): RedirectResponse
    {
        $user = $register->handle($request->validated());

        Auth::login($user, remember: true);
        $request->session()->regenerate();

        return redirect()->route('hotel');
    }
}
