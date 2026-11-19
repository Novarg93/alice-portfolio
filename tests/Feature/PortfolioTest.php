<?php

namespace Tests\Feature;

use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class PortfolioTest extends TestCase
{
    public function test_the_public_home_page_renders_the_portfolio(): void
    {
        $this->withoutVite();

        $this->get(route('portfolio'))
            ->assertOk()
            ->assertSee('lang="ru"', false)
            ->assertInertia(fn (AssertableInertia $page) => $page->component('Portfolio'));
    }

    public function test_the_health_endpoint_responds(): void
    {
        $this->get('/up')->assertOk();
    }
}
