document.addEventListener('DOMContentLoaded', function() {
    const listsContainer = document.getElementById('lists-container');
    const activeListInput = document.getElementById('active-list-id-input');
    const contextMenu = document.getElementById('context-menu');
    const createListBtn = document.getElementById('create-list-btn');
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;

    // --- TABS (LISTS) ---
function renderTab(list) {
    const tab = document.createElement('div');
    tab.className = 'list-tab d-flex align-items-center';

    const starIcon = list.is_favorite 
        ? '<i class="fa-solid fa-star text-warning ms-2" style="font-size: 0.8rem;"></i>' 
        : '';
        
    tab.innerHTML = `<span>${list.title}</span>${starIcon}`;
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

        contextMenu.dataset.isFavorite = list.is_favorite;

        const favBtn = document.getElementById('toggle-favorite');
        const favBtnSpan = favBtn.querySelector('span');
        const favBtnIcon = favBtn.querySelector('i');

        if (list.is_favorite == true || list.is_favorite == 1) {
            favBtnSpan.innerText = 'Unpin';
            favBtnIcon.className = 'fa-regular fa-star me-2 text-secondary';
        } else {
            favBtnSpan.innerText = 'Pin to Top';
            favBtnIcon.className = 'fa-solid fa-star me-2 text-warning';
        }
    };

    // Sort favorites to top
    if (list.is_favorite) {
        listsContainer.prepend(tab);
    } else {
        listsContainer.appendChild(tab);
    }
}
    document.getElementById('toggle-favorite').onclick = () => {
        const id = contextMenu.dataset.selectedId;
        fetch(`/lists/${id}/toggle-favorite`, {
            method: 'POST',
            headers: { 
                'X-CSRF-TOKEN': csrfToken,
                'Content-Type': 'application/json'
            }
        }).then(res => {
            if (res.ok) {
                location.reload(); 
            }
        });
    };

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
