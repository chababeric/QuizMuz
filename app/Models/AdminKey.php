<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AdminKey extends Model
{
    use HasFactory;

    protected $fillable = ['hashed_key'];
}
