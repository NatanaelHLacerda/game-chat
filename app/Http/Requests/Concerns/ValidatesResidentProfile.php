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
        $palette = config('republica.look_palette');
        $styles = config('republica.look_styles');

        $rules = [
            'look' => ['required', 'array:'.implode(',', [...array_keys($palette), ...array_keys($styles)])],
            'speaks' => ['required', 'array', 'min:1', "max:$max"],
            'speaks.*' => ['distinct', Rule::in($languages)],
            'practices' => ['required', 'array', 'min:1', "max:$max"],
            'practices.*' => ['distinct', Rule::in($languages)],
        ];

        foreach ($palette as $part => $colors) {
            $rules["look.$part"] = ['required', Rule::in($colors)];
        }

        // Estilos são opcionais: quem não manda fica com o padrão (User::fullLook).
        foreach ($styles as $style => $options) {
            $rules["look.$style"] = ['sometimes', Rule::in($options)];
        }

        return $rules;
    }

    /**
     * @return array<string, string>
     */
    protected function profileMessages(): array
    {
        return [
            'speaks.required' => 'Choose at least one language.',
            'speaks.min' => 'Choose at least one language.',
            'practices.required' => 'Choose at least one language.',
            'practices.min' => 'Choose at least one language.',
            'speaks.max' => 'At most 3 languages.',
            'practices.max' => 'At most 3 languages.',
        ];
    }

    protected function validateLanguageOverlap(Validator $validator): void
    {
        $speaks = (array) $this->input('speaks', []);
        $practices = (array) $this->input('practices', []);

        if (array_intersect($speaks, $practices) !== []) {
            $validator->errors()->add('practices', 'Choose languages you still want to practice.');
        }
    }
}
