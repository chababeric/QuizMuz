<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['nb_practice', 'nb_game_solo', 'nb_game_multi', 'games_won']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->integer('nb_practice')->nullable();
            $table->integer('nb_game_solo')->nullable();
            $table->integer('nb_game_multi')->nullable();
            $table->integer('games_won')->nullable();
        });
    }
};
