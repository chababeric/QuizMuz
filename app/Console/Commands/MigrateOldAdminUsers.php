<?php

namespace App\Console\Commands;

use App\Models\AdminControl;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class MigrateOldAdminUsers extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'admin:migrate-old-users';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Migrate users from old admin_controls to new role system';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting migration of old admin users...');

        // Check if the old table exists
        if (!Schema::hasTable('admin_controls_old')) {
            $this->error('The table admin_controls_old does not exist. Make sure you have run the migration first.');
            return 1;
        }

        // First, let's dump the structure of the old table to see what columns we have
        $columns = Schema::getColumnListing('admin_controls_old');
        $this->info('Columns in admin_controls_old: ' . implode(', ', $columns));

        // Get the super_admin role
        $superAdminRole = AdminControl::where('system_name', 'super_admin')->first();

        if (!$superAdminRole) {
            $this->error('Super admin role not found. Make sure you have run the seeders.');
            return 1;
        }

        // Get all admin users from the old table
        $oldAdmins = DB::table('admin_controls_old')->get();

        $this->info('Found ' . $oldAdmins->count() . ' administrators in the old system.');

        $bar = $this->output->createProgressBar($oldAdmins->count());
        $bar->start();

        // Assign super_admin role to each old admin user
        foreach ($oldAdmins as $oldAdmin) {
            // Output the record for debugging
            $this->info("\nOld admin record: " . json_encode($oldAdmin));

            // Get the user ID - we know from the original schema that it's called 'user_id'
            $userId = $oldAdmin->user_id;

            $user = User::find($userId);

            if ($user) {
                // Attach the super_admin role to this user
                DB::table('user_roles')->insert([
                    'user_id' => $user->id,
                    'admin_control_id' => $superAdminRole->id,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                $this->info(' Migrated user: ' . $user->id);
            } else {
                $this->warn(' User not found: ' . $userId);
            }

            $bar->advance();
        }

        $bar->finish();
        $this->newLine(2);

        $this->info('Migration completed successfully!');
        return 0;
    }
}
