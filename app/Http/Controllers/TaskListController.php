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
        if (!$user) {
            return response()->json([]);
        }

        $lists = TaskList::query()
            ->where(function ($query) use ($user) {
                $query->where('user_id', $user->id)
                      ->orWhereHas('members', function ($q) use ($user) {
                        $q->where('user_id', $user->id);
                    });
            })
            ->with(['creator:id,name,photo_url'])
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
        $list = $this->findListWithAccess($id);

        if ($list->user_id === $user->id) {
            $list->tasks()->delete();
            $list->delete();

            return response()->json(['success' => true, 'message' => 'List was completely deleted']);
        }
        
        $list->members()->detach($user->id);
        
        return response()->json(['success' => true, 'message' => 'You successfully leave the list']);
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