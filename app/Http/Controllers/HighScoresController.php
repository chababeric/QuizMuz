<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class HighScoresController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('HighScores');
    }
}
