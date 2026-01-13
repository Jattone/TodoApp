<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\TaskList;
use Illuminate\Support\Facades\Auth;

class ShareController extends Controller
{
    public function join($token)
    {
        $list = TaskList::where('share_token', $token)->firstOrFail();

        if ($list->user_id === Auth::id()) {
            return redirect('/')->with('info', 'It is already your task list.');
        }

        $list->members()->syncWithoutDetaching([Auth::id() => ['role' => 'editor']]);

        return redirect('/')->with('status', "You have successfully added shared list {$list->title}");
    }
}
