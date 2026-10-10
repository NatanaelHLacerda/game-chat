<?php

namespace App\Http\Requests;

use App\Http\Requests\Concerns\ValidatesResidentProfile;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class UpdateProfileRequest extends FormRequest
{
    use ValidatesResidentProfile;

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return $this->profileRules();
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return $this->profileMessages();
    }

    /**
     * @return array<int, callable>
     */
    public function after(): array
    {
        return [fn (Validator $validator) => $this->validateLanguageOverlap($validator)];
    }
}
