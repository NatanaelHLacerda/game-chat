<?php

namespace App\Models;

use App\Enums\RoomKind;
use Database\Factories\RoomFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['user_id', 'kind', 'layout'])]
class Room extends Model
{
    /** @use HasFactory<RoomFactory> */
    use HasFactory;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'kind' => RoomKind::class,
        ];
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function isCommon(): bool
    {
        return $this->kind === RoomKind::Common;
    }

    public function displayName(): string
    {
        return $this->isCommon() ? 'Living room' : $this->owner->name."'s room";
    }

    public static function commonRoom(): Room
    {
        return static::where('kind', RoomKind::Common)->firstOrFail();
    }

    /**
     * Plantas privadas se revezam: o n-ésimo quarto recebe private_layouts[(n-1) % total].
     */
    public static function nextPrivateLayout(): string
    {
        $layouts = config('republica.private_layouts');

        return $layouts[static::where('kind', RoomKind::Private)->count() % count($layouts)];
    }

    /**
     * @return array<string, mixed>
     */
    public function toNavigator(): array
    {
        return [
            'id' => $this->id,
            'kind' => $this->kind->value,
            'name' => $this->displayName(),
            'owner_id' => $this->user_id,
            'layout' => $this->layout,
        ];
    }
}
