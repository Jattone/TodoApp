document.addEventListener('DOMContentLoaded', function() {
    const listsContainer = document.getElementById('lists-container');
    const activeListInput = document.getElementById('active-list-id-input');
    const contextMenu = document.getElementById('context-menu');
    const createListBtn = document.getElementById('create-list-btn');
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;

    // --- TABS (LISTS) ---
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
            
            if (window.loadTasks) window.loadTasks(list.id);
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

    const scrollContainer = document.querySelector("#lists-container");
    if (scrollContainer) {
        scrollContainer.addEventListener("wheel", (evt) => {
            evt.preventDefault();
            scrollContainer.scrollLeft += evt.deltaY;
        });
    }

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

    // --- CONTEXT MENU ---
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
    };

    // --- MOBILE DRAWER ---
    const drawer = document.getElementById('mobile-header-drawer');
    const toggleBtn = document.getElementById('toggle-drawer-btn');
    const drawerIcon = document.getElementById('drawer-icon');

    if (toggleBtn) {
        toggleBtn.onclick = () => {
            const isOpen = drawer.classList.toggle('open');
            drawerIcon.classList.toggle('rotate-icon');
            drawerIcon.classList.toggle('fa-chevron-down', !isOpen);
            drawerIcon.classList.toggle('fa-chevron-up', isOpen);
        };
    }

    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('list-tab') && window.innerWidth < 768) {
            drawer.classList.remove('open');
            drawerIcon.classList.remove('rotate-icon', 'fa-chevron-up');
            drawerIcon.classList.add('fa-chevron-down');
        }
    });
});
