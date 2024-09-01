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
        Schema::table('pieces_reserve', function (Blueprint $table) {
            $table->unsignedInteger('order');
            $table->unsignedBigInteger('institution_id')->default(1);
            $table->foreign('institution_id')->references('id')->on('institutions')->onDelete('cascade');
            $table->index('order');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pieces_reserve', function (Blueprint $table) {
            $table->dropColumn('order');
            $table->dropForeign(['institution_id']);
            $table->dropColumn('institution_id');
            $table->dropIndex(['order']);
        });
    }
};
