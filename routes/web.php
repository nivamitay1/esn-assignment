<?php

declare(strict_types=1);

use App\Http\Controllers\TaskController;
use Illuminate\Support\Facades\Route;

Route::get('/',                         [TaskController::class, 'index']);
Route::post('/tasks',                   [TaskController::class, 'store']);
Route::patch('/tasks/{task}',           [TaskController::class, 'update']);
Route::post('/tasks/{task}/toggle',     [TaskController::class, 'toggle']);
Route::delete('/tasks/{task}',          [TaskController::class, 'destroy']);
