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

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'task_list_id' => 'required' 
        ]);

        $task = Task::create([
            'name' => $request->name,
            'task_list_id' => $request->task_list_id,
        ]);

        return response()->json($task);
    }

    public function getTasks($id) 
    {
        $tasks = Task::where('task_list_id', $id)->orderBy('created_at', 'asc')->get();
        return response()->json($tasks);
    }

    public function destroy(Task $task) 
    {
        $task->delete();
        return response()->json(['success' => true]);
    }
}