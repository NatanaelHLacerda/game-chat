<?php

namespace App\Http\Requests;

use App\Http\Requests\Concerns\ValidatesResidentProfile;
use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class RegisterRequest extends FormRequest
{
    use ValidatesResidentProfile;

    protected function prepareForValidation(): void
    {
        $name = User::normalizeName((string) $this->input('name', ''));

        $this->merge([
            'name' => $name,
            'name_key' => User::nameKey($name),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'min:3', 'max:16', 'regex:/^[\pL\pN _.\-]+$/u'],
            'name_key' => ['unique:users,name_key'],
            'password' => ['required', 'string', 'min:6', 'confirmed'],
            ...$this->profileRules(),
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name_key.unique' => 'Esse nome já tem dono.',
            'name.regex' => 'Use letras, números, espaço, _ - ou .',
            'password.confirmed' => 'As senhas não conferem.',
            ...$this->profileMessages(),
        ];
    }

    /**
     * @return array<int, callable>
     */
    public function after(): array
    {
        return [fn (Validator $validator) => $this->validateLanguageOverlap($validator)];
    }
}
