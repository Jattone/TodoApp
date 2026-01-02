document.addEventListener('DOMContentLoaded', function() {
    const listsContainer = document.getElementById('lists-container');
    const taskListContainer = document.getElementById('task-list');
    const taskForm = document.getElementById('add-task-form');
    const activeListInput = document.getElementById('active-list-id-input');
    const contextMenu = document.getElementById('context-menu');
    const createListBtn = document.getElementById('create-list-btn');
    const taskNameInput = document.getElementById('task-name');
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;

    // --- Tasks Loading ---
    function loadTasks(listId, newTaskData = null) {
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
    }

    // --- DRAG & DROP SORTING ---
    const sortable = new Sortable(taskListContainer, {
        animation: 150,
        ghostClass: 'bg-light',
        onEnd: function() {
            const order = Array.from(taskListContainer.querySelectorAll('.task-row'))
                .map(el => el.dataset.id);
            fetch('/task/reorder', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken
                },
                body: JSON.stringify({ order: order })
            });
        }
    });

    // --- Delete Task ---
    function confirmTaskDeletion(id, name, element) {
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
                        element.classList.add('animate__animated', 'animate__backOutLeft');
                        setTimeout(() => {
                            element.remove();
                            if (taskListContainer.querySelectorAll('.task-row').length === 0) {
                                loadTasks(activeListInput.value);
                            }
                        }, 500);
                    }
                });
            }
        });
    }

 // --- ADDING A TASK (WITH CHECKING THE EXISTENCE OF A LIST) ---
    if (taskForm) {
        taskForm.onsubmit = function(e) {
            e.preventDefault();
            const name = taskNameInput.value.trim();
            const listId = activeListInput.value;
            
            if (!listId) {
                Swal.fire({
                    title: 'No list selected!',
                    text: 'Please create a list first before adding a task.',
                    icon: 'info',
                    confirmButtonText: 'Got it!',
                    confirmButtonColor: '#3b82f6'
                });
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
                loadTasks(listId, newTask);
            });
        };
    }

    // --- CLEARING THE ENTIRE LIST ---
    const clearListBtn = document.getElementById('clear-list-btn');

    if (clearListBtn) {
        clearListBtn.onclick = () => {
            const listId = activeListInput.value;
            const tasksCount = taskListContainer.querySelectorAll('.task-row').length;

            if (!listId || tasksCount === 0) return;

            Swal.fire({
                title: 'Clear all tasks?',
                text: `You are about to delete all ${tasksCount} tasks from this list.`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#ef4444',
                confirmButtonText: 'Yeah, clear it all!',
                cancelButtonText: 'Nope, keep them'
            }).then((result) => {
                if (result.isConfirmed) {
                    fetch(`/lists/${listId}/tasks`, {
                        method: 'DELETE',
                        headers: { 
                            'X-CSRF-TOKEN': csrfToken,
                            'X-Requested-With': 'XMLHttpRequest'
                        }
                    }).then(res => {
                        if (res.ok) {
                            const allTasks = taskListContainer.querySelectorAll('.task-row');
                            allTasks.forEach((item, index) => {
                                setTimeout(() => {
                                    item.classList.add('animate__animated', 'animate__fadeOutRight');
                                }, index * 50);
                            });
                            setTimeout(() => {
                                loadTasks(listId);
                                Swal.fire('Cleared!', 'Your list is now empty.', 'success');
                            }, 500);
                        }
                    });
                }
            });
        };
    }

    // --- TABS ---
    function renderTab(list) {
        const tab = document.createElement('div');
        tab.className = 'list-tab';
        tab.innerText = list.title;
        tab.dataset.id = list.id;
        
        tab.onclick = () => {
            document.querySelectorAll('.list-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            activeListInput.value = list.id;
            localStorage.setItem('lastActiveListId', list.id);
            loadTasks(list.id);
        };

        tab.oncontextmenu = (e) => {
            e.preventDefault();
            contextMenu.style.display = 'block';
            contextMenu.style.position = 'fixed';
            contextMenu.style.left = e.clientX + 'px';
            contextMenu.style.top = e.clientY + 'px';
            contextMenu.dataset.selectedId = list.id;
        };

        listsContainer.appendChild(tab);
    }

    fetch('/lists').then(res => res.json()).then(data => {
        listsContainer.innerHTML = '';
        data.forEach(list => renderTab(list));
        const savedId = localStorage.getItem('lastActiveListId');
        const target = document.querySelector(`.list-tab[data-id="${savedId}"]`) || listsContainer.firstChild;
        if (target) target.click();
    });

    // --- New List, Rename, Delete ---
    if (createListBtn) {
        createListBtn.onclick = async () => {
            const { value: name } = await Swal.fire({ title: 'New List Name', input: 'text', showCancelButton: true });
            if (name) {
                fetch('/lists', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrfToken },
                    body: JSON.stringify({ title: name })
                })
                .then(res => res.json())
                .then(newList => {
                    renderTab(newList);
                    const tabs = listsContainer.querySelectorAll('.list-tab');
                    tabs[tabs.length - 1].click();
                });
            }
        };
    }

    document.addEventListener('click', () => contextMenu.style.display = 'none');

    document.getElementById('edit-list-name').onclick = async () => {
        const id = contextMenu.dataset.selectedId;
        const tab = document.querySelector(`.list-tab[data-id="${id}"]`);
        const { value: title } = await Swal.fire({ title: 'Enter New Name', input: 'text', inputValue: tab.innerText, showCancelButton: true });
        if (title) {
            fetch(`/lists/${id}`, { 
                method: 'PUT', 
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrfToken }, 
                body: JSON.stringify({ title: title }) 
            }).then(() => tab.innerText = title);
        }
    };

    document.getElementById('delete-list').onclick = () => {
        const id = contextMenu.dataset.selectedId;
        const tab = document.querySelector(`.list-tab[data-id="${id}"]`);
        const listTitle = tab ? tab.innerText : 'this list';

        Swal.fire({ 
            title: `Delete list "${listTitle}"?`,
            text: "All tasks in this list will be permanently removed!",
            icon: 'warning', 
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'Yes, delete it!'
        }).then(res => {
            if (res.isConfirmed) {
                fetch(`/lists/${id}`, { 
                    method: 'DELETE', 
                    headers: { 'X-CSRF-TOKEN': csrfToken } 
                })
                .then(() => {
                    localStorage.removeItem('lastActiveListId');
                    location.reload();
                });
            }
        });
    }
});