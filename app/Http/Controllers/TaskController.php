<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    public function index() 
    {
        $tasks = Task::orderBy('created_at', 'asc')->get();
        return view('tasks', ['tasks' => $tasks]);
    }

    public function store(Request $request) {
        $request->validate([
            'name' => 'required|max:255',
        ]);

        $task = Task::create([
            'name' => $request->name,
        ]);

    return redirect('/')->with('new_task_id', $task->id);
}

    public function destroy(Task $task) 
    {
        $task->delete();

        if (request()->ajax() || request()->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Task deleted'
            ]);
        }

        return redirect('/');
    }
}