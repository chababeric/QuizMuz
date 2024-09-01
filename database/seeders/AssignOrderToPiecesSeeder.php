<?php

namespace Database\Seeders;

use App\Models\Piece;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class AssignOrderToPiecesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $pieces201 = Piece::where('level_id', 1)->orderBy('id')->get();

        foreach ($pieces201 as $index => $piece) {
            $piece->order = $index + 1;
            $piece->save();
        }

        $pieces202 = Piece::where('level_id', 2)->orderBy('id')->get();

        foreach ($pieces202 as $index => $piece) {
            $piece->order = $index + 1;
            $piece->save();
        }

        $pieces203 = Piece::where('level_id', 3)->orderBy('id')->get();

        foreach ($pieces203 as $index => $piece) {
            $piece->order = $index + 1;
            $piece->save();
        }

        $pieces204 = Piece::where('level_id', 4)->orderBy('id')->get();

        foreach ($pieces204 as $index => $piece) {
            $piece->order = $index + 1;
            $piece->save();
        }
    }
}
