@extends('layouts.app')

@section('content')
<div class="row justify-content-center">
    <div class="col-md-8">
        
        <div class="card mb-4 border-0 shadow-sm">
            <div class="card-header bg-white fw-bold py-3">
                <i class="fa-solid fa-plus text-primary me-2"></i>New Task
            </div>
            <div class="card-body p-4">
                @include('common.errors')

                <form action="{{ url('task') }}" method="POST" class="row g-3">
                    @csrf
                    <div class="col-sm-9">
                        <input type="text" name="name" id="task-name" class="form-control form-control-lg border-light-subtle" placeholder="What do we need to do?" required autofocus>
                    </div>
                    <div class="col-sm-3">
                        <button type="submit" class="btn btn-primary btn-lg w-100 shadow-sm">
                            Add
                        </button>
                    </div>
                </form>
            </div>
        </div>

        <div class="card border-0 shadow-sm">
            <div class="card-header bg-white fw-bold py-3 d-flex justify-content-between align-items-center">
                <span><i class="fa-solid fa-tasks text-success me-2"></i>Current Tasks</span>
                <small class="text-muted fw-normal">Click on a task to delete</small>
            </div>
            <div class="card-body p-0">
                @if (count($tasks) > 0)
                    <div class="list-group list-group-flush" id="task-list">
                        @foreach ($tasks as $task)
                            <div id="task-{{ $task->id }}" 
                                 class="list-group-item list-group-item-action py-3 px-4 border-0 task-row 
                                 {{ session('new_task_id') == $task->id ? 'animate__animated animate__backInDown' : '' }}"
                                 data-id="{{ $task->id }}"
                                 data-name="{{ $task->name }}"
                                 style="cursor: pointer; {{ session('new_task_id') == $task->id ? '--animate-duration: 0.4s;' : '' }}">
                                <div class="d-flex align-items-center">
                                    <div class="me-3 text-muted icon-box">
                                        <i class="fa-regular fa-circle"></i>
                                </div>
                                <div class="fs-5 text-dark task-text">{{ $task->name }}</div>
                            </div>
                        </div>
                    @endforeach
                    </div>
                @else
                    <div class="text-center py-5 text-muted animate__animated animate__fadeIn">
                        <i class="fa-solid fa-mug-hot fa-3x mb-3 opacity-25"></i>
                        <p class="mb-0">The task list is empty.. Time to relax!</p>
                    </div>
                @endif
            </div>
        </div>

    </div>
</div>

<style>

    .task-row {
        transition: all 0.2s ease-out;
        border-bottom: 1px solid #f8f9fa !important;
        animation-duration: 0.5s;
    }

    .task-row:hover {
        background-color: #f0fdf4 !important;
        padding-left: 1.8rem !important;
        box-shadow: inset 4px 0 0 #16a34a;
    }

    .task-row:hover .task-text {
        color: #16a34a !important;
        text-decoration: line-through;
    }

    .task-row:hover .fa-circle::before {
        content: "\f058"; 
        font-family: "Font Awesome 6 Free";
        font-weight: 900;
        color: #16a34a;
    }
</style>
@endsection

@push('scripts')
<script>
document.addEventListener('DOMContentLoaded', function () {
    const tasks = document.querySelectorAll('.task-row');

    tasks.forEach(task => {
        task.addEventListener('click', function () {
            const taskId = this.dataset.id;
            const taskName = this.dataset.name;

            Swal.fire({
                title: 'Is task completed?',
                text: `"${taskName}"`,
                icon: 'success',
                showCancelButton: true,
                confirmButtonColor: '#10b981',
                cancelButtonColor: '#6b7280',
                confirmButtonText: 'Yes, remove!',
                cancelButtonText: 'Cancel',
                heightAuto: false 
            }).then((result) => {
                if (result.isConfirmed) {
                    fetch(`/task/${taskId}`, {
                        method: 'DELETE',
                        headers: {
                            'X-CSRF-TOKEN': '{{ csrf_token() }}',
                            'Accept': 'application/json',
                            'X-Requested-With': 'XMLHttpRequest'
                        }
                    }).then(response => {
                        if (response.ok) {
                            this.classList.remove('animate__fadeInUp');
                            this.classList.add('animate__animated', 'animate__backOutLeft');
                            
                            setTimeout(() => {
                                this.style.display = 'none';
                                const remainingTasks = document.querySelectorAll('.task-row:not([style*="display: none"])');
                                if (remainingTasks.length === 0) {
                                    location.reload();
                                }
                            }, 500);
                        }
                    });
                }
            });
        });
    });
});
</script>
@endpush