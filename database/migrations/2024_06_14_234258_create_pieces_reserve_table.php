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
        Schema::create('pieces_reserve', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('level_id')->nullable();
            $table->string('period')->nullable();
            $table->string('genre')->nullable();
            $table->string('composer')->nullable();
            $table->string('title')->nullable();
            $table->string('element')->nullable();
            $table->string('no_mvt')->nullable();
            $table->string('mvt')->nullable();
            $table->string('form')->nullable();
            $table->string('file_name');
            $table->timestamps();

            // Define foreign key constraint
            $table->foreign('level_id')->references('id')->on('levels')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pieces_reserve');
    }
};
