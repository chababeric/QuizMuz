<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('scores', function (Blueprint $table) {
            // Add course_id as nullable first
            $table->unsignedBigInteger('course_id')->nullable();
        });

        // Set a default course_id for existing records
        // Get the first available course ID
        $firstCourseId = DB::table('courses')->first()->id ?? 1;

        // Update all existing scores to have this course_id
        DB::table('scores')->whereNull('course_id')->update(['course_id' => $firstCourseId]);

        Schema::table('scores', function (Blueprint $table) {
            // Make course_id not nullable
            $table->unsignedBigInteger('course_id')->nullable(false)->change();

            // Add foreign key constraint
            $table->foreign('course_id')->references('id')->on('courses')->onDelete('cascade');

            // Add composite unique constraint
            $table->unique(['user_id', 'course_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('scores', function (Blueprint $table) {
            // Drop the composite unique constraint
            $table->dropUnique(['user_id', 'course_id']);

            // Drop the foreign key constraint and column
            $table->dropForeign(['course_id']);
            $table->dropColumn('course_id');
        });
    }
};
