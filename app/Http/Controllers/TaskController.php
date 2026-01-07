<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\TaskList;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TaskController extends Controller
{
    public function index() 
    {
        return view('tasks');
    }

    public function getByList($listId) 
    {
        $list = Auth::user()->ownedTaskLists()->findOrFail($listId);

        $tasks = $list->tasks()
            ->where('user_id', Auth::id())
            ->orderBy('position', 'asc')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($tasks);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'task_list_id' => 'required|exists:task_lists,id', 
        ]);

        $list = Auth::user()->ownedTaskLists()->findOrFail($request->task_list_id);

        $task = Auth::user()->tasks()->create([
            'name' => $request->name,
            'task_list_id' => $list->id,
            'position' => $list->tasks()->count(),
        ]);

        return response()->json($task);
    }

    public function reorder(Request $request) 
    {
        $order = $request->order;

        foreach ($order as $index => $id) {
            Auth::user()->tasks()
                ->where('user_id', Auth::id())
                ->update(['position' => $index]);
        }

        return response()->json(['success' => true]);
    }

    public function destroy($id) 
    {
        Auth::user()->tasks()->findOrFail($id)->delete();

        return response()->json(['success' => true]);
    }

    public function destroyAll($listId)
    {
        $list = Auth::user()->ownedTaskLists()->findOrFail($listId);

        $list->tasks()->where('user_id', Auth::id())->delete();

        return response()->json(['success' => true]);
    }
}