@php($labels = ['skin' => 'Pele', 'hair' => 'Cabelo', 'shirt' => 'Camisa', 'pants' => 'Calça'])
<fieldset class="picker" data-look-picker>
    <legend>Aparência</legend>
    @foreach ($palette as $part => $colors)
        <div class="swatches">
            <span>{{ $labels[$part] }}</span>
            @foreach ($colors as $color)
                <label class="swatch" style="--c: {{ $color }}" title="{{ $labels[$part] }}">
                    <input type="radio" name="look[{{ $part }}]" value="{{ $color }}" @checked(old("look.$part", $look[$part] ?? null) === $color)>
                </label>
            @endforeach
        </div>
    @endforeach
    @php($styleLabels = ['hair_style' => 'Cabelo', 'top_style' => 'Roupa'])
    @php($optionLabels = ['curto' => 'Curto', 'medio' => 'Médio', 'cacheado' => 'Cacheado', 'longo' => 'Longo', 'camiseta' => 'Camiseta', 'regata' => 'Regata', 'moletom' => 'Moletom'])
    @foreach ($styles as $style => $options)
        <div class="swatches">
            <span>{{ $styleLabels[$style] }}</span>
            @foreach ($options as $option)
                <label class="chip-style">
                    <input type="radio" name="look[{{ $style }}]" value="{{ $option }}" @checked(old("look.$style", $look[$style] ?? null) === $option)>{{ $optionLabels[$option] }}
                </label>
            @endforeach
        </div>
    @endforeach
</fieldset>
