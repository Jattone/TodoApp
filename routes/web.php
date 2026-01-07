<?php

use App\Models\Task;
use App\Models\TaskList;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\TaskListController;
use App\Http\Controllers\Auth\TelegramController;

Route::get('/', [TaskController::class, 'index'])->middleware('auth')->name('home');

Route::middleware('auth')->group(function () {

    // (Tasks)
    Route::get('/lists/{listId}/tasks', [TaskController::class, 'getByList']);
    Route::post('/task', [TaskController::class, 'store']);
    Route::post('/task/reorder', [TaskController::class, 'reorder']);
    Route::delete('/task/{id}', [TaskController::class, 'destroy']);
    Route::delete('/lists/{id}/tasks', [TaskController::class, 'destroyAll']);

    // (TaskList)
    Route::get('/lists', [TaskListController::class, 'index']);
    Route::post('/lists', [TaskListController::class, 'store']);
    Route::put('/lists/{id}', [TaskListController::class, 'update']);
    Route::delete('/lists/{id}', [TaskListController::class, 'destroy']);
    Route::post('/lists/{id}/toggle-favorite', [TaskListController::class, 'toggleFavorite']);

    Route::post('/logout', function () {
        Auth::logout();
        return redirect('/');
    })->name('logout');

});

// Telegram Authentication
Route::get('/login', function () {
    return view('auth.login');
})->name('login')->middleware('guest');

Route::get('/auth/telegram/callback', [TelegramController::class, 'handleTelegramCallback']);