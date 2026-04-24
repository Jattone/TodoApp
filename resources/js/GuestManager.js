export const GuestManager = {
    isGuest: !window.isAuthenticated,

    getTasks(listId) {
        const allTasks = JSON.parse(localStorage.getItem('guest_tasks') || '[]');
        return allTasks.filter(task => String(task.task_list_id) === String(listId));
    },

    getAllTasks() {
    return JSON.parse(localStorage.getItem('guest_tasks') || '[]');
    },

    saveTask(taskData) {
        const tasks = JSON.parse(localStorage.getItem('guest_tasks') || '[]');
        const newTask = { 
            id: 'temp-' + Date.now(), 
            name: taskData.name,
            task_list_id: taskData.task_list_id,
            position: tasks.length,
            completed: false,
            created_at: new Date().toISOString(),
        };
        tasks.push(newTask);
        localStorage.setItem('guest_tasks', JSON.stringify(tasks));
        return newTask;
    },

    deleteTask(taskId) {
        let tasks = JSON.parse(localStorage.getItem('guest_tasks') || '[]');
        tasks = tasks.filter(t => String(t.id) !== String(taskId));
        localStorage.setItem('guest_tasks', JSON.stringify(tasks));
    },

    reorderTasks(orderedIds) {
        let allTasks = JSON.parse(localStorage.getItem('guest_tasks') || '[]');
        const taskMap = {};

        allTasks.forEach(t => {taskMap[String(t.id)] = t;});
        const otherTasks = allTasks.filter(t => !orderedIds.includes(String(t.id)));
        const sortedTasks = orderedIds.map(id => taskMap[id]).filter(t => t !== undefined);

        const finalTasks = [...sortedTasks, ...otherTasks];
        localStorage.setItem('guest_tasks', JSON.stringify(finalTasks));
    },

    getLists() {
        return JSON.parse(localStorage.getItem('guest_lists') || '[]');
    },

    saveList(title) {
        const lists = this.getLists();
        const newList = { 
            id: 'glist-' + Date.now(), 
            title: title,
            is_favorite: false,
            share_token: null,
            user_id: 0
        };
        lists.push(newList);
        localStorage.setItem('guest_lists', JSON.stringify(lists));
        return newList;
    },

    clearListTasks(listId) {
        let allTasks = JSON.parse(localStorage.getItem('guest_tasks') || '[]');
        allTasks = allTasks.filter(task => String(task.task_list_id) !== String(listId));
        localStorage.setItem('guest_tasks', JSON.stringify(allTasks));
    },

    renameList(id, newTitle) {
        let lists = this.getLists();
        const listIndex = lists.findIndex(l => String(l.id) === String(id));

        if (listIndex !== -1) {
            lists[listIndex].title = newTitle;
            localStorage.setItem('guest_lists', JSON.stringify(lists));
        }
    },

    toggleFavorite(id) {
        let lists = this.getLists();
        const listIndex = lists.findIndex(l => String(l.id) === String(id));

        if (listIndex !== -1) {
            lists[listIndex].is_favorite = !lists[listIndex].is_favorite;
            localStorage.setItem('guest_lists', JSON.stringify(lists));
            return lists[listIndex];
        }
        return null;
    },

    deleteList(id) {
        let lists = this.getLists();
        lists = lists.filter(l => String(l.id) !== String(id));
        localStorage.setItem('guest_lists', JSON.stringify(lists));

        let tasks = JSON.parse(localStorage.getItem('guest_tasks') || '[]');
        tasks = tasks.filter(t => String(t.task_list_id) !== String(id));
        localStorage.setItem('guest_tasks', JSON.stringify(tasks));
    }
};