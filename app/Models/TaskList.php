<?php

namespace App\Models;

use App\Models\User;
use App\Models\Task;    
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class TaskList extends Model
{
    use HasFactory;

    protected $fillable = ['title', 'user_id', 'is_favorite'];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function members(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'task_list_user')
                    ->withPivot('role')
                    ->withTimestamps();
    }

    public function tasks()
    {
        return $this->hasMany(Task::class);
    }

    public function casts(): array
    {
        return [
            'is_favorite' => 'boolean',
        ];
    }
}