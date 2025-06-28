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
        Schema::rename('admin_controls', 'admin_controls_old');

        // Create a new admin_controls table with the desired structure
        Schema::create('admin_controls', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('system_name')->unique();
            $table->text('description')->nullable();
            $table->json('privileges');
            $table->timestamps();
        });


        // Create a new pivot table for user roles
        Schema::create('user_roles', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('admin_control_id');
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('admin_control_id')->references('id')->on('admin_controls')->onDelete('cascade');

            $table->unique(['user_id', 'admin_control_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop the new tables
        Schema::dropIfExists('user_roles');
        Schema::dropIfExists('admin_controls');

        // Restore the original admin_controls table
        Schema::rename('admin_controls_old', 'admin_controls');
    }
};
