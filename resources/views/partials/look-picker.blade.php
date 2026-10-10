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
</fieldset>
