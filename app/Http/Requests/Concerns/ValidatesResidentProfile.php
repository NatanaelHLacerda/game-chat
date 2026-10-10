<?php

namespace App\Http\Requests\Concerns;

use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

trait ValidatesResidentProfile
{
    /**
     * Regras de aparência e idiomas, validadas contra o catálogo da República.
     *
     * @return array<string, mixed>
     */
    protected function profileRules(): array
    {
        $languages = array_keys(config('republica.languages'));
        $max = config('republica.max_languages');

        $rules = [
            'look' => ['required', 'array'],
            'speaks' => ['required', 'array', 'min:1', "max:$max"],
            'speaks.*' => ['distinct', Rule::in($languages)],
            'practices' => ['required', 'array', 'min:1', "max:$max"],
            'practices.*' => ['distinct', Rule::in($languages)],
        ];

        foreach (config('republica.look_palette') as $part => $colors) {
            $rules["look.$part"] = ['required', Rule::in($colors)];
        }

        return $rules;
    }

    /**
     * @return array<string, string>
     */
    protected function profileMessages(): array
    {
        return [
            'speaks.required' => 'Escolha pelo menos um idioma.',
            'speaks.min' => 'Escolha pelo menos um idioma.',
            'practices.required' => 'Escolha pelo menos um idioma.',
            'practices.min' => 'Escolha pelo menos um idioma.',
            'speaks.max' => 'No máximo 3 idiomas.',
            'practices.max' => 'No máximo 3 idiomas.',
        ];
    }

    protected function validateLanguageOverlap(Validator $validator): void
    {
        $speaks = (array) $this->input('speaks', []);
        $practices = (array) $this->input('practices', []);

        if (array_intersect($speaks, $practices) !== []) {
            $validator->errors()->add('practices', 'Escolha idiomas que você ainda quer praticar.');
        }
    }
}
