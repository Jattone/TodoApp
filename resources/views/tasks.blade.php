@extends('layouts.app')

@section('content')
<div class="row justify-content-center">
    <div class="col-md-8">
        
        <div class="card mb-4 border-0 shadow-sm">
            <div class="card-header bg-white py-3 d-flex align-items-center justify-content-between overflow-hidden">
                <div id="lists-container" class="d-flex gap-2 align-items-center overflow-auto me-3"></div>
                <button type="button" id="create-list-btn" class="btn btn-sm btn-light border shadow-sm px-3 fw-bold text-primary flex-shrink-0">
                    <i class="fa-solid fa-plus me-2"></i>New List
                </button>
            </div>

            <div class="card-body p-4">
                @include('common.errors')
                <form id="add-task-form" action="/task" method="POST" class="row g-3">
                    @csrf
                    <div class="col-sm-8">
                        <input type="text" name="name" id="task-name" class="form-control form-control-lg" placeholder="What do we need to do?" required autofocus>
                        <input type="hidden" name="task_list_id" id="active-list-id-input">
                    </div>
                    <div class="col-sm-4 d-flex gap-2">
                        <button type="submit" class="btn btn-primary btn-lg flex-grow-1 shadow-sm" title="Add a new task to the current list">Add Task</button>
                        <button type="button" id="clear-list-btn" class="btn btn-outline-danger btn-lg shadow-sm" title="Clear all tasks from the current list">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </div>
                </form>
            </div>
        </div>

        <div class="card border-0 shadow-sm">
            <div class="card-header bg-white fw-bold py-3 d-flex justify-content-between align-items-center">
                <span><i class="fa-solid fa-tasks text-success me-2"></i>Current Tasks</span>
                <small class="text-muted fw-normal">Click on a task to complete it</small>
            </div>
            <div class="card-body p-0">
                <div class="list-group list-group-flush" id="task-list"></div>
            </div>
        </div>
    </div>
</div>

<div id="context-menu" class="dropdown-menu shadow" style="display:none; position: absolute; z-index: 1000;">
    <button class="dropdown-item" id="edit-list-name"><i class="fa-solid fa-pen me-2"></i>Rename</button>
    <button class="dropdown-item text-danger" id="delete-list"><i class="fa-solid fa-trash me-2"></i>Delete</button>
</div>
@endsection
