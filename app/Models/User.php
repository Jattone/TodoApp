<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use App\Models\TaskList;
use App\Models\Task;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'telegram_id',
        'username',
        'photo_url',
    ];

    public function ownedTaskLists() : HasMany
    {
        return $this->hasMany(TaskList::class);
    }

    public function sharedTaskLists() : HasMany
    {
        return $this->belongsToMany(TaskList::class, 'task_list_user')
                    ->withPivot('role')
                    ->withTimestamps();
    }

    public function tasks() : HasMany
    {
        return $this->hasMany(Task::class);
    }

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            //
        ];
    }
}
