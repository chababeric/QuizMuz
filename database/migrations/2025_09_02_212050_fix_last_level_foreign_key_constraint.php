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
            // Drop the existing foreign key constraint
            $table->dropForeign(['last_level']);

            // Make the column nullable first
            $table->unsignedBigInteger('last_level')->nullable()->default(null)->change();

            // Add the new foreign key constraint with SET NULL on delete
            $table->foreign('last_level')->references('id')->on('levels')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Drop the new foreign key constraint
            $table->dropForeign(['last_level']);

            // Restore the original constraint with cascade delete
            $table->foreign('last_level')->references('id')->on('levels')->onDelete('cascade');

            // Make the column non-nullable again with default value
            $table->unsignedBigInteger('last_level')->default(1)->change();
        });
    }
};
