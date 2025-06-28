<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AdminControlsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $roles = [
            [
                'name' => 'Super Admin',
                'system_name' => 'super_admin',
                'description' => 'Accès complet à toutes les fonctionnalités du système',
                'privileges' => json_encode(['SuperAdmin']),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Enseignant',
                'system_name' => 'teacher',
                'description' => 'Accès aux fonctionnalités de gestion de contenu de cours et des étudiants',
                'privileges' => json_encode(['Teacher']),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Étudiant Admin',
                'system_name' => 'student_admin',
                'description' => 'Accès aux fonctionnalités de gestion de contenu de cours',
                'privileges' => json_encode(['StudentAdmin']),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Étudiant',
                'system_name' => 'student',
                'description' => 'Accès standard aux fonctionnalités d\'apprentissage',
                'privileges' => json_encode(['Student']),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'FMA Admin',
                'system_name' => 'fma_admin',
                'description' => 'Accès à la gestion du contenu du cours Formation Musicale et Auditive',
                'privileges' => json_encode(['FMAAdmin']),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'LitMus Admin',
                'system_name' => 'litmus_admin',
                'description' => 'Accès à la gestion du contenu du cours Littérature Musicale',
                'privileges' => json_encode(['LitMusAdmin']),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'History Admin',
                'system_name' => 'history_admin',
                'description' => 'Accès à la gestion du contenu du cours Histoire de la musique',
                'privileges' => json_encode(['HistoryAdmin']),
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        DB::table('admin_controls')->insert($roles);
    }
}
