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
        $list = $this->findListWithAccess($listId);

        $tasks = $list->tasks()
            ->orderBy('position', 'asc')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($tasks);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'task_list_id' => 'required', 
        ]);
        

        $listId = $request->input('task_list_id');

        $list = $this->findListWithAccess($listId);

        $task = $list->tasks()->create([
            'name' => $request->name,
            'user_id' => Auth::id(),
            'task_list_id' => $list->id,
            'position' => $list->tasks()->count(),
        ]);

        return response()->json($task);
    }

    public function reorder(Request $request) 
    {
        $request->validate([
            'order' => 'required|array',
            'order.*' => 'required|exists:tasks,id'
        ]);

        $order = $request->order;

        $firstTask = Task::find($order[0]);
        if (!$firstTask) return response()->json(['error' => 'There is no tasks'], 404);
        
        $listId = $firstTask->task_list_id;
        $this->findListWithAccess($listId);

        foreach ($order as $index => $id) {
                Task::where('id', $id)
                    ->where('task_list_id', $listId)
                    ->update(['position' => $index]);
        }

        return response()->json(['success' => true]);
    }

    public function destroy($id) 
    {
        $task = Task::findOrFail($id);
        
        $this->findListWithAccess($task->task_list_id);

        $task->delete();
        return response()->json(['success' => true]);
    }

    public function destroyAll($listId)
    {
        $list = $this->findListWithAccess($listId);

        $list->tasks()->delete();

        return response()->json(['success' => true]);
    }

    private function findListWithAccess($listId)
    {
        $user = Auth::user();

        return TaskList::where('id', $listId)
            ->where(function ($query) use ($user) {
                $query->where('user_id', $user->id)
                      ->orWhereHas('members', function ($q) use ($user) {
                          $q->where('user_id', $user->id);
                      });
            })
            ->firstOrFail();
    }
}