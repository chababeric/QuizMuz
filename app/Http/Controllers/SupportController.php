<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class SupportController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Support');
    }
}
