<?php

namespace Database\Seeders;

use App\Models\Chord;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ChordsOrderSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $chords = Chord::all();
        $order = 1;
        foreach ($chords as $chord) {
            $chord->order = $order;
            $chord->save();
            $order++;
        }
    }
}
