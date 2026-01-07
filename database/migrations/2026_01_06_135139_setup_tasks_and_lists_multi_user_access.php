<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('task_lists', function (Blueprint $table) {
            if (!Schema::hasColumn('task_lists', 'user_id')) {
                $table->foreignId('user_id')->after('id')->nullable()->constrained()->onDelete('cascade');
            }
        });

        Schema::table('tasks', function (Blueprint $table) {
            if (!Schema::hasColumn('tasks', 'user_id')) {
                $table->foreignId('user_id')->after('id')->nullable()->constrained()->onDelete('cascade');
            }
        });

        Schema::create('task_list_user', function (Blueprint $table) {
            $table->id();
            $table->foreignId('task_list_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('role')->default('viewer'); 
            $table->timestamps();
            $table->unique(['task_list_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('task_list_user');

        Schema::table('task_lists', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropColumn('user_id');
        });

        Schema::table('tasks', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropColumn('user_id');
        });
    }
};