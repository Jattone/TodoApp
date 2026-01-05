<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TaskList extends Model
{
    use HasFactory;

    protected $fillable = ['title', 'is_favorite'];

    public function tasks()
    {
        return $this->hasMany(Task::class);
    }
}