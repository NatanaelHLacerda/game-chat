<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

#[Fillable(['name', 'name_key', 'password', 'look', 'speaks', 'practices'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'look' => 'array',
            'speaks' => 'array',
            'practices' => 'array',
            'password' => 'hashed',
        ];
    }

    /**
     * Apara as pontas e colapsa espaços internos: "  Ana   Lu " vira "Ana Lu".
     */
    public static function normalizeName(string $name): string
    {
        return trim(preg_replace('/\s+/u', ' ', $name));
    }

    /**
     * Chave única do nome, sem distinção de maiúsculas/minúsculas.
     */
    public static function nameKey(string $name): string
    {
        return mb_strtolower(self::normalizeName($name));
    }

    public function room(): HasOne
    {
        return $this->hasOne(Room::class);
    }

    /**
     * Aparência completa: contas antigas sem estilos recebem os do padrão.
     *
     * @return array<string, string>
     */
    public function fullLook(): array
    {
        return array_merge(config('republica.default_look'), $this->look ?? []);
    }

    /**
     * Dados públicos do morador enviados aos canais de presença.
     *
     * @return array<string, mixed>
     */
    public function toPresence(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'look' => $this->fullLook(),
            'speaks' => $this->speaks,
            'practices' => $this->practices,
        ];
    }
}
