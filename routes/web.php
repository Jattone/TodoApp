<?php

use App\Models\Task;
use App\Models\TaskList;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\TaskListController;

Route::get('/', [TaskController::class, 'index']);

// (Task)
Route::post('/task', [TaskController::class, 'store']);
Route::post('/task/reorder', [TaskController::class, 'reorder']);
Route::delete('/task/{task}', [TaskController::class, 'destroy']);
Route::delete('/lists/{id}/tasks', [TaskController::class, 'destroyAll']);
Route::get('/lists/{id}/tasks', [TaskController::class, 'getTasks']);

// (TaskList)
Route::get('/lists', [TaskListController::class, 'index']);
Route::post('/lists', [TaskListController::class, 'store']);
Route::put('/lists/{id}', [TaskListController::class, 'update']);
Route::delete('/lists/{id}', [TaskListController::class, 'destroy']);
Route::post('/lists/{id}/toggle-favorite', [TaskListController::class, 'toggleFavorite']);