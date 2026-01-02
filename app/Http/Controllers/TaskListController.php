<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\TaskList;
use Illuminate\Http\Request;

class TaskListController extends Controller
{
    public function index()
    {
        return response()->json(TaskList::all());
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:20'
        ]);

        $list = TaskList::create([
            'title' => $request->title
        ]);

        return response()->json($list);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'title' => 'required|string|max:20'
        ]);

        $list = TaskList::findOrFail($id);
        $list->update(['title' => $request->title]);

        return response()->json($list);
    }

    public function destroy($id)
    {
        $list = TaskList::findOrFail($id);

        Task::where('task_list_id', $id)->delete();
        
        $list->delete();

        return response()->json(['success' => true]);
    }
}