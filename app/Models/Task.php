<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    protected $fillable = ['name', 'is_done'];

    protected function casts(): array
    {
        return [
            'is_done' => 'boolean',
        ];
    }
}
