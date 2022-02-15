<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class HomeController extends Controller
{
    public function home()
    {
       return view('home', [
        "tasks" => Task::all()
       ]);
    }

    public function create(Request $request)
    {
      $task = Task::create([        
        "text" => $request->text
      ]);
      
      return response()->json(['text'=>$task->text, 'id'=>$task->id]);
    }
    
    public function delete(Request $request)
    {
      $task = Task::find($request->id);
      if ($task !== null) {
        $task -> delete();
        return response()->json([
          "ok" => true
        ]);
     }
    }
  }
  