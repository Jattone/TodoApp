document.addEventListener('DOMContentLoaded', function() {
    const taskListContainer = document.getElementById('task-list');
    const listsContainer = document.getElementById('lists-container');
    const activeListInput = document.getElementById('active-list-id-input');
    const contextMenu = document.getElementById('context-menu');
    const createListBtn = document.getElementById('create-list-btn');
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;
    const currentUserId = document.querySelector('meta[name="user-id"]')?.content;

    const drawer = document.getElementById('mobile-header-drawer');
    const toggleBtn = document.getElementById('toggle-drawer-btn');
    const drawerIcon = document.getElementById('drawer-icon');
    
    // --- TABS (LISTS) ---
    function renderTab(list, prepend = false) {
        const tab = document.createElement('div');
        const isShared = list.user_id != currentUserId;
        tab.className = `list-tab d-flex align-items-center ${isShared ? 'shared-tab' : ''}`;

        const starIcon = list.is_favorite ? '<i class="fa-solid fa-star text-warning ms-2" style="font-size: 0.8rem;"></i>' : '';
        const sharedIcon = isShared ? '<i class="fa-solid fa-users text-purple ms-2" style="font-size: 0.7rem;"></i>' : '';

        tab.innerHTML = `<span>${list.title}</span>${starIcon}${sharedIcon}`;
        tab.dataset.id = list.id;
        tab.dataset.shareToken = list.share_token;
        tab.dataset.isFavorite = list.is_favorite ? "1" : "0";
        
        tab.onclick = async (e) => {
            document.querySelectorAll('.list-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const listId = list.id;
            activeListInput.value = listId;
            localStorage.setItem('lastActiveListId', listId);

            if (taskListContainer) taskListContainer.innerHTML = '';
            
            if (window.loadTasks) {
                await window.loadTasks(listId);
            }

            if (typeof window.updateRevertUI === 'function') {
                window.updateRevertUI(listId);
            }

            const isManualClick = e && e.isTrusted;
            if (isManualClick && window.innerWidth < 768 && drawer && drawer.classList.contains('open')) {
                setTimeout(() => {
                    const currentTasks = taskListContainer.querySelectorAll('.task-row').length;
                    if (currentTasks > 2) {
                        drawer.classList.remove('open');
                        if (drawerIcon) {
                            drawerIcon.classList.remove('rotate-icon', 'fa-chevron-up');
                            drawerIcon.classList.add('fa-chevron-down');
                        }
                    }
                    sessionStorage.removeItem('justCreatedListId')
                }, 150);
            } 
        };

        tab.oncontextmenu = (e) => {
            e.preventDefault();
            contextMenu.style.display = 'block';
            contextMenu.style.position = 'fixed';
            contextMenu.style.left = e.clientX + 'px';
            contextMenu.style.top = e.clientY + 'px';
            contextMenu.dataset.selectedId = list.id;
            contextMenu.dataset.shareToken = list.share_token;
            contextMenu.dataset.isFavorite = list.is_favorite;

            const shareBtn = document.getElementById('share-list');
                if (shareBtn) {
                    shareBtn.style.display = isShared ? 'none' : 'block';
                }

            const favBtn = document.getElementById('toggle-favorite');
            const favBtnSpan = favBtn.querySelector('span');
            const favBtnIcon = favBtn.querySelector('i');

            if (tab.dataset.isFavorite === "1") {
                favBtnSpan.innerText = 'Unpin';
                favBtnIcon.className = 'fa-regular fa-star me-2 text-secondary';
            } else {
                favBtnSpan.innerText = 'Pin to Top';
                favBtnIcon.className = 'fa-solid fa-star me-2 text-warning';
            }
        };

        // Sort favorites to top
        if (prepend || list.is_favorite) {
            listsContainer.prepend(tab);
        } else {
            listsContainer.appendChild(tab);
        }
        return tab;
    }

    // LISTS LOADING
    function loadAllLists(targetId = null){
        fetch('/lists')
            .then(res => res.json())
            .then(data => {
                listsContainer.innerHTML = '';
                data.forEach(list => renderTab(list));

                const savedId = targetId || localStorage.getItem('lastActiveListId');
                const target = document.querySelector(`.list-tab[data-id="${savedId}"]`) || listsContainer.firstChild;
                if (target) {
                    target.click()
                    target.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center'});
                }
            });
    }

    //INIT
    loadAllLists();

    //CREATE LIST
    if (createListBtn) {
        createListBtn.onclick = async () => {
            const { value: name } = await Swal.fire({ 
                title: 'New List Name', 
                input: 'text', 
                showCancelButton: true
            });
            if (name) {
                fetch('/lists', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrfToken },
                    body: JSON.stringify({ title: name })
                })
                .then(res => res.json())
                .then(newList => {
                    const tab = renderTab(newList, true);
                    tab.click();
                });
            }
        };
    }

    // TOGGLE FAVORITE
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
                loadAllLists(id);
            }    
        });
    };

    // RENAME
    document.getElementById('edit-list-name').onclick = async () => {
        const id = contextMenu.dataset.selectedId;
        const tab = document.querySelector(`.list-tab[data-id="${id}"]`);
        const currentTitle = tab.querySelector('span').innerText;

        const { value: title } = await Swal.fire({
            title: 'Enter New Name',
            input: 'text',
            inputValue: currentTitle,
            showCancelButton: true 
        });

        if (title && title !== currentTitle) {
            fetch(`/lists/${id}`, { 
                method: 'PUT', 
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrfToken }, 
                body: JSON.stringify({ title: title }) 
            })
            .then(res => res.json())
            .then(() => {
                tab.querySelector('span').innerText =title;
            });
        }
    };
    
    // DELETE
    document.getElementById('delete-list').onclick = () => {
        const id = contextMenu.dataset.selectedId;
        Swal.fire({
            title: 'Delete list?',
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
                .then(async (response) => {
                    if (!response.ok) return;
                    const tabToDelete = document.querySelector(`.list-tab[data-id="${id}"]`);
                    if (tabToDelete) {
                        const nextTab = tabToDelete.nextElementSibling || tabToDelete.previousElementSibling;
                        tabToDelete.remove();
                        if (nextTab) {
                            nextTab.click();
                        } else {
                            await loadAllLists();
                        }
                    }
                });
            }
        });
    };
    
    // SHARE LIST
    const shareBtn = document.getElementById('share-list');
    if (shareBtn) {
        shareBtn.onclick = () => {
            const token = contextMenu.dataset.shareToken;
            const shareUrl = `${window.location.origin}/share/${token}`;
            const el = document.createElement('textarea');
            if (!token) {
                Swal.fire('Error', 'Share token not found', 'error');
                return;
            }

            el.value = shareUrl;
            document.body.appendChild(el);
            el.select();
            document.execCommand('copy');
            document.body.removeChild(el);

            Swal.fire({
                title: 'Link Copied!',
                text: 'Send this link to share the list!',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });
        };
    }
 
    // HORIZONTAL SCROLL    
    const scrollContainer = document.querySelector("#lists-container");
    if (scrollContainer) {
        scrollContainer.addEventListener("wheel", (evt) => {
            evt.preventDefault();
            scrollContainer.scrollLeft += evt.deltaY;
        }, { passive: false });
    }
 
    // --- CONTEXT MENU ---
    document.addEventListener('click', () => contextMenu.style.display = 'none');

    // --- MOBILE DRAWER ---
    if (toggleBtn) {
        toggleBtn.onclick = () => {
            const isOpen = drawer.classList.toggle('open');
            drawerIcon.classList.toggle('rotate-icon', isOpen);
            drawerIcon.classList.toggle('fa-chevron-up', isOpen);
            drawerIcon.classList.toggle('fa-chevron-down', !isOpen);
        }
    }   
});
