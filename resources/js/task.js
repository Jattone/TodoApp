// task.js
document.addEventListener('DOMContentLoaded', function() {
    const taskListContainer = document.getElementById('task-list');
    const taskForm = document.getElementById('add-task-form');
    const activeListInput = document.getElementById('active-list-id-input');
    const taskNameInput = document.getElementById('task-name');
    const clearListBtn = document.getElementById('clear-list-btn');
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;

    window.loadTasks = function(listId, newTaskData = null) {
        if (!listId || !taskListContainer) return;

        fetch(`/lists/${listId}/tasks`)
            .then(res => res.json())
            .then(tasks => {
                taskListContainer.innerHTML = '';

                if (tasks.length === 0) {
                    taskListContainer.innerHTML = `
                        <div class="text-center py-5 text-muted animate__animated animate__fadeIn">
                            <i class="fa-solid fa-mug-hot fa-3x mb-3 opacity-25"></i>
                            <p class="mb-0">The task list is empty.. Time to relax!</p>
                        </div>`;
                    return;
                }

                tasks.forEach(task => {
                    const item = document.createElement('div');
                    const isNew = newTaskData && task.id === newTaskData.id;
                    item.className = `list-group-item list-group-item-action py-3 px-4 border-0 task-row ${isNew ? 'animate__animated animate__fadeInDown' : ''}`;
                    item.dataset.id = task.id;
                    item.style.cursor = 'pointer';
                    item.innerHTML = `
                        <div class="d-flex align-items-center">
                            <div class="me-3 text-muted icon-box">
                                <i class="fa-regular fa-circle"></i>
                            </div>
                            <div class="fs-5 text-dark task-text">${task.name}</div>
                        </div>`;
                    
                    item.onclick = () => confirmTaskDeletion(task.id, task.name, item);
                    taskListContainer.appendChild(item);
                });
            });
    };

    // Drag & Drop
    if (taskListContainer) {
        new Sortable(taskListContainer, {
            animation: 150,
            ghostClass: 'bg-light',
            onEnd: function() {
                const order = Array.from(taskListContainer.querySelectorAll('.task-row'))
                    .map(el => el.dataset.id);
                fetch('/task/reorder', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrfToken },
                    body: JSON.stringify({ order: order })
                });
            }
        });
    }
    
    // Revert last deleted tasks
    const lastDeletedTasks = {};

    window.updateRevertUI = function (listId) {
        const revertContainer = document.getElementById('revert-container');
        if(!revertContainer) return;

        if (lastDeletedTasks[listId]) {
            revertContainer.style.display = 'block';
        } else {
            revertContainer.style.display = 'none';
        }
    }

    // Delete task confirmation
    function confirmTaskDeletion(id, name, element) {
        const listId = document.getElementById('active-list-id-input').value;

        Swal.fire({
            title: 'Is task completed?',
            text: `"${name}"`,
            icon: 'success',
            showCancelButton: true,
            confirmButtonColor: '#10b981',
            confirmButtonText: 'Yes, remove!',
            heightAuto: false 
        }).then((result) => {
            if (result.isConfirmed) {
                fetch(`/task/${id}`, {
                    method: 'DELETE',
                    headers: { 'X-CSRF-TOKEN': csrfToken, 'X-Requested-With': 'XMLHttpRequest' }
                }).then(res => {
                    if (res.ok) {
                        lastDeletedTasks[listId] = {name: name, listId: listId};
                        window.updateRevertUI(listId);
                        
                        element.classList.add('animate__animated', 'animate__backOutLeft');
                        setTimeout(() => {
                            element.remove();
                            if (taskListContainer.querySelectorAll('.task-row').length === 0) {
                                window.loadTasks(listId);
                            }
                        }, 500);
                    }
                });
            }
        });
    }

    document.getElementById('revert-btn').onclick = function() {
        const listId = document.getElementById('active-list-id-input').value;
        const taskData = lastDeletedTasks[listId];
        if (!taskData) return;

        fetch('/task', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrfToken,
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify({ name: taskData.name, task_list_id: taskData.listId })
        })
        .then(res => res.json())
        .then(newTask => {
            delete lastDeletedTasks[listId];
            window.updateRevertUI(listId);
            window.loadTasks(listId, newTask);
            const Toast = Swal.mixin({
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 2000,
        });
            Toast.fire({
                icon: 'success',
                title: `Task "${newTask.name}" restored`
            });
        });
    }

    //  Adding a new task
    if (taskForm) {
        taskForm.onsubmit = function(e) {
            e.preventDefault();
            const name = taskNameInput.value.trim();
            const listId = activeListInput.value;
            
            if (!listId) {
                Swal.fire({ title: 'No list selected!', text: 'Please create a list first.', icon: 'info' });
                return;
            }

            if (!name) return;

            fetch(this.action, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json', 
                    'X-CSRF-TOKEN': csrfToken, 
                    'X-Requested-With': 'XMLHttpRequest' 
                },
                body: JSON.stringify({ name: name, task_list_id: listId })
            })
            .then(res => res.json())
            .then(newTask => {
                taskNameInput.value = '';
                window.loadTasks(listId, newTask);
            });
        };
    }

    // Clearing all tasks in the list
    if (clearListBtn) {
        clearListBtn.onclick = () => {
            const listId = activeListInput.value;
            const tasksCount = taskListContainer.querySelectorAll('.task-row').length;

            if (!listId || tasksCount === 0) return;

            Swal.fire({
                title: 'Clear all tasks?',
                text: `You are about to delete all ${tasksCount} tasks.`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#ef4444',
                confirmButtonText: 'Clear it all!'
            }).then((result) => {
                if (result.isConfirmed) {
                    fetch(`/lists/${listId}/tasks`, {
                        method: 'DELETE',
                        headers: { 'X-CSRF-TOKEN': csrfToken, 'X-Requested-With': 'XMLHttpRequest' }
                    }).then(res => {
                        if (res.ok) {
                            const allTasks = taskListContainer.querySelectorAll('.task-row');
                            allTasks.forEach((item, index) => {
                                setTimeout(() => item.classList.add('animate__animated', 'animate__fadeOutRight'), index * 50);
                            });
                            setTimeout(() => {
                                window.loadTasks(listId);
                                Swal.fire('Cleared!', '', 'success');
                            }, 500);
                        }
                    });
                }
            });
        };
    }
});
