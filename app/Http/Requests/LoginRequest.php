<?php

namespace App\Http\Requests;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class LoginRequest extends FormRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string'],
            'password' => ['required', 'string'],
        ];
    }

    /**
     * Autentica pelo nome (sem distinção de caixa), com no máximo 5 tentativas por minuto.
     */
    public function authenticate(): void
    {
        $nameKey = User::nameKey($this->string('name'));
        $throttleKey = Str::transliterate($nameKey.'|'.$this->ip());

        if (RateLimiter::tooManyAttempts($throttleKey, 5)) {
            Log::warning('resident.login_throttled', ['name_key' => $nameKey]);

            throw ValidationException::withMessages([
                'name' => str_replace(':seconds', (string) RateLimiter::availableIn($throttleKey), 'Muitas tentativas. Tente de novo em :seconds segundos.'),
            ]);
        }

        if (! Auth::attempt(['name_key' => $nameKey, 'password' => $this->string('password')], remember: true)) {
            RateLimiter::hit($throttleKey);

            throw ValidationException::withMessages(['name' => 'Nome ou senha incorretos.']);
        }

        RateLimiter::clear($throttleKey);
    }
}
