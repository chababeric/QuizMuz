<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ChordsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $levelId = DB::table('levels')->where('name', '301')->value('id');

        DB::table('chords')->insert([
            [
                'level_id' => $levelId,
                'chord_name' => 'M6M',
                'file_name' => 'Maj6Maj_1.mp3',
            ],
            [
                'level_id' => $levelId,
                'chord_name' => 'm6M',
                'file_name' => 'min6Maj_1.mp3',
            ],
            [
                'level_id' => $levelId,
                'chord_name' => '4tes',
                'file_name' => '4tes_1.mp3',
            ],
            [
                'level_id' => $levelId,
                'chord_name' => '5tes',
                'file_name' => '5tes_1.mp3',
            ],
            [
                'level_id' => $levelId,
                'chord_name' => 'Cluster',
                'file_name' => 'Cluster_1.mp3',
            ],
            [
                'level_id' => $levelId,
                'chord_name' => 'Cluster/Tons',
                'file_name' => 'ClusterTons_1.mp3',
            ],
            [
                'level_id' => $levelId,
                'chord_name' => 'Maj2Maj',
                'file_name' => 'Maj2Maj_1.mp3',
            ],
            [
                'level_id' => $levelId,
                'chord_name' => 'M6m',
                'file_name' => 'Maj6min_1.mp3',
            ],
            [
                'level_id' => $levelId,
                'chord_name' => 'M/m',
                'file_name' => 'Majmin_1.mp3',
            ],
            [
                'level_id' => $levelId,
                'chord_name' => 'm2M',
                'file_name' => 'min2Maj_1.mp3',
            ],
            [
                'level_id' => $levelId,
                'chord_name' => 'm6m',
                'file_name' => 'min6min_1.mp3',
            ],
            [
                'level_id' => $levelId,
                'chord_name' => 'P/A',
                'file_name' => 'PA_1.mp3',
            ],
        ]);

    }
}
