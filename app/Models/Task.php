<?php

namespace App\Models;


use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;





class Task extends Model
{
    use HasFactory;

    protected $fillable = [

        "text"
        
    ];

    public function getShortTextAttribute()
    {
        return Str::limit($this->text, 20, '...');
    }


}


