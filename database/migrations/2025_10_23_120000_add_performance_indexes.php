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
        // Merge duplicate (user_id, course_id) stats rows into the oldest one before adding the unique index
        $duplicates = DB::table('user_course_modes')
            ->select('user_id', 'course_id')
            ->groupBy('user_id', 'course_id')
            ->havingRaw('COUNT(*) > 1')
            ->get();

        foreach ($duplicates as $duplicate) {
            DB::transaction(function () use ($duplicate) {
                $rows = DB::table('user_course_modes')
                    ->where('user_id', $duplicate->user_id)
                    ->where('course_id', $duplicate->course_id)
                    ->orderBy('id')
                    ->get();

                $keep = $rows->first();
                DB::table('user_course_modes')->where('id', $keep->id)->update([
                    'practice_count' => $rows->sum('practice_count'),
                    'quiz_count' => $rows->sum('quiz_count'),
                ]);
                DB::table('user_course_modes')
                    ->whereIn('id', $rows->pluck('id')->except(0))
                    ->delete();
            });
        }

        Schema::table('user_course_modes', function (Blueprint $table) {
            $table->unique(['user_id', 'course_id']);
        });

        // Leaderboard: filter by course, sort by score
        Schema::table('scores', function (Blueprint $table) {
            $table->index(['course_id', 'score']);
        });

        // Logs page: sorted by newest first
        Schema::table('logs', function (Blueprint $table) {
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('logs', function (Blueprint $table) {
            $table->dropIndex(['created_at']);
        });

        Schema::table('scores', function (Blueprint $table) {
            $table->dropIndex(['course_id', 'score']);
        });

        Schema::table('user_course_modes', function (Blueprint $table) {
            $table->dropUnique(['user_id', 'course_id']);
        });
    }
};
