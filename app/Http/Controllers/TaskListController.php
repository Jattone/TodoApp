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
        $user = Auth::user();

        $lists = TaskList::where('user_id', $user->id)
                    ->orWhereHas('members', function ($query) use ($user) {
                        $query->where('user_id', $user->id);
                    })
                    ->withCount('tasks')
                    ->orderBy('is_favorite', 'desc')
                    ->orderBy('id', 'asc')
                    ->get();

        return response()->json($lists);
    }

    
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:20'
        ]);
        
        $list = TaskList::create([
            'title' => $request->title,
            'user_id' => Auth::id(),
            'is_favorite' => false,
        ]);

        if (method_exists($list, 'members')) {
            $list->members()->attach(Auth::id(), ['role' => 'owner']);
        }   
            
        return response()->json($list);
    }
    
    public function toggleFavorite($id)
    {
        $list = $this->findListWithAccess($id);

        $list->is_favorite = !$list->is_favorite;
        $list->save();

        return response()->json($list);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'title' => 'required|string|max:20'
        ]);

        $list = $this->findListWithAccess($id);
        $list->update(['title' => $request->title]);

        return response()->json($list);
    }

    public function destroy($id)
    {
        $user = Auth::user();
        $list = TaskList::findOrFail($id);

        if ($list->user_id === $user->id) {
            $list->tasks()->delete();
            $list->delete();
            return response()->json(['success' => true, 'message' => 'List was completely deleted']);
        }
        
        if ($list->members()->where('user_id', $user->id)->exists()) {
            $list->members()->detach($user->id);
            return response()->json(['success' => true, 'message' => 'You successfully leave the list']);
        }

        return response()->json(['error' => 'You have no rights to do this, champ'], 403);
    }

    private function findListWithAccess($id)
    {
        $user = Auth::user();

        return TaskList::where('id', $id)
            ->where(function ($query) use ($user) {
                $query->where('user_id', $user->id)
                      ->orWhereHas('members', function ($q) use ($user) {
                        $q->where('user_id', $user->id);
                      });
            })->firstOrFail();
    }
}