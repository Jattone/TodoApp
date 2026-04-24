<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Task;
use App\Models\TaskList;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class SyncController extends Controller
{
    public function getUserListsNames()
    {
        $lists = Auth::user()->taskLists()->pluck('title');

        return response()->json($lists);
    }

    public function sync(Request $request)
    {
        $data = $request->validate([
            'lists' => 'required|array',
            'tasks' => 'required|array',
            'resolutions' => 'nullable|array',
        ]);

        $user = Auth::user();
        $listIdMap = [];
        $resolutions = $data['resolutions'] ?? [];

        DB::transaction(function () use ($data, $user, $resolutions, &$listIdMap) {

            // Sync Lists
            foreach ($data['lists'] as $listData) {
                $guestId = $listData['id'];
                $res = $resolutions[$guestId] ?? ['action' => 'merge'];

                if ($res['action'] === 'discard') {
                    continue;
                }

                $existingList = $user->taskLists()->where('title', $listData['title'])->first();

                if ($res['action'] === 'merge' && $existingList) {
                    $listIdMap[$guestId] = $existingList->id;
                } else {
                    $title = ($res['action'] === 'rename' && !empty($res['newName']))
                        ? $res['newName'] 
                        : $listData['title'];
                    
                    if ($user->taskLists()->where('title', $title)->exists() && $res['action'] !== 'rename') {
                        $title .= ' (Copy)';
                    }

                    $newList = TaskList::Create([
                        'user_id'     => $user->id,
                        'title'       => $title,
                        'is_favorite' => $listData['is_favorite'] ?? false,
                    ]);
                    $listIdMap[$guestId] = $newList->id;
                }
            }

            // Sync Tasks
            foreach ($data['tasks'] as $taskData) {
                $newListId = $listIdMap[$taskData['task_list_id']] ?? null;

                if ($newListId) {
                    Task::firstOrCreate([
                        'user_id'      => $user->id,
                        'task_list_id' => $newListId,
                        'name'         => $taskData['name'],
                    ], [
                        'position'     => $taskData['position'] ?? 0,
                    ]);
                }
            }
        });

        return response()->json(['success' => true, 'message' => 'Sync completed!']);

    }
}
