<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LoginTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        User::factory()->create(['name' => 'Ana', 'name_key' => 'ana']);
    }

    public function test_login_ignores_name_case_and_redirects_to_hotel(): void
    {
        $this->post('/entrar', ['name' => 'ANA', 'password' => 'password'])->assertRedirect('/hotel');

        $this->assertAuthenticated();
    }

    public function test_wrong_password_fails(): void
    {
        $this->post('/entrar', ['name' => 'ana', 'password' => 'errada'])
            ->assertSessionHasErrors(['name' => 'Wrong name or password.']);

        $this->assertGuest();
    }

    public function test_sixth_wrong_attempt_is_throttled(): void
    {
        for ($i = 0; $i < 5; $i++) {
            $this->post('/entrar', ['name' => 'ana', 'password' => 'errada']);
        }

        $this->post('/entrar', ['name' => 'ana', 'password' => 'password'])->assertSessionHasErrors('name');
        $this->assertStringStartsWith('Muitas tentativas.', session('errors')->first('name'));
        $this->assertGuest();
    }

    public function test_logout_redirects_to_login(): void
    {
        $this->actingAs(User::first())->post('/sair')->assertRedirect('/entrar');

        $this->assertGuest();
    }
}
