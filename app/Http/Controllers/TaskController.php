<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    public function index() 
    {
        $tasks = Task::orderBy('position', 'asc')->get();
        
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
        $tasks = Task::where('task_list_id', $id)
            ->orderBy('position', 'asc')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($tasks);
    }

    public function reorder(Request $request) 
    {
        $order = $request->order;

        foreach ($order as $index => $id) {
            Task::where('id', $id)->update(['position' => $index]);
        }

        return response()->json(['success' => true]);
    }

    public function destroy(Task $task) 
    {
        $task->delete();

        return response()->json(['success' => true]);
    }

    public function destroyAll($listId)
    {
        Task::where('task_list_id', $listId)->delete();

        return response()->json(['success' => true]);
    }
}