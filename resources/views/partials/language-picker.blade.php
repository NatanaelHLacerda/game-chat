<fieldset class="picker" data-language-picker data-max="{{ config('republica.max_languages') }}">
    <legend>Languages</legend>
    @foreach (['speaks' => 'I speak', 'practices' => 'I want to practice'] as $field => $label)
        <div class="languages" data-language-list="{{ $field }}">
            <span>{{ $label }}</span>
            <div class="language-options">
                @foreach ($languages as $code => $language)
                    <label class="chip-lang">
                        <input type="checkbox" name="{{ $field }}[]" value="{{ $code }}" @checked(in_array($code, old($field, $selected[$field] ?? []), true))>
                        <i class="flag" style="{{ collect($language['flag'])->map(fn ($c, $i) => '--flag-'.($i + 1).': '.$c)->implode('; ') }}; --flag-count: {{ count($language['flag']) }}"></i>
                        {{ $language['name'] }}
                    </label>
                @endforeach
            </div>
        </div>
    @endforeach
</fieldset>
