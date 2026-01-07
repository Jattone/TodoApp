<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\TaskList;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Schema;

class TaskListController extends Controller
{
    public function index()
    {
        return response()->json(
            Auth::user()->ownedTaskLists()
                        ->orderBy('is_favorite', 'desc')
                        ->orderBy('created_at', 'asc')
                        ->get()
        );
    }

    
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:20'
        ]);
        
        $list = Auth::user()->ownedTaskLists()->create([
            'title' => $request->title,
            'is_favorite' => false,
        ]);

        if (method_exists($list, 'members')) {
            $list->members()->attach(Auth::id(), ['role' => 'owner']);
        }   
            
        return response()->json($list);
    }
    
    public function toggleFavorite($id)
    {
        $list = Auth::user()->ownedTaskLists()->findOrFail($id);

        $list->is_favorite = !$list->is_favorite;
        $list->save();

        return response()->json($list);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'title' => 'required|string|max:20'
        ]);

        $list = Auth::user()->ownedTaskLists()->findOrFail($id);
        $list->update(['title' => $request->title]);

        return response()->json($list);
    }

    public function destroy($id)
    {
        $list = Auth::user()->ownedTaskLists()->findOrFail($id);

        $list->tasks()->delete();
        
        $list->delete();

        return response()->json(['success' => true]);
    }
}