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
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('first_name');
            $table->string('last_name');
            $table->string('username')->unique();
            $table->string('password');
            $table->unsignedBigInteger('institution_id')->default(1);
            $table->integer('nb_practice')->default(0);
            $table->integer('nb_game_solo')->default(0);
            $table->integer('nb_game_multi')->default(0);
            $table->integer('games_won')->default(0);
            $table->timestamp('last_action_time')->nullable();
            $table->rememberToken();
            $table->timestamps();

            // FK
            $table->foreign('institution_id')->references('id')->on('institutions')->onDelete('cascade');
        });

//        Schema::create('password_reset_tokens', function (Blueprint $table) {
//            $table->string('email')->primary();
//            $table->string('token');
//            $table->timestamp('created_at')->nullable();
//        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['institution_id']);
        });

        Schema::dropIfExists('users');
//        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('sessions');
    }
};
