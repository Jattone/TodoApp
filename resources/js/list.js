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
    const LONG_PRESS_DURATION = 600;

    // --- API HELPER ---
    async function apiRequest(url, method = 'GET', body = null) {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrfToken,
                'Accept': 'application/json'
            }
        };

        if (body) {
            options.body = JSON.stringify(body);
        }

        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }
            if (response.status === 204 || response.headers.get('content-length') === '0') {
                return null;
            }
            return response.json();
        } catch (error) {
            console.error('API Request Failed:', error);
            Swal.fire('Error', error.message || 'An unexpected error occurred. Please try again.', 'error');
            throw error;
        }
    }
    
    
    // --- TABS (LISTS) ---
    function renderTab(list) {
        const tab = document.createElement('div');
        const isShared = list.user_id != currentUserId;

        tab.className = `list-tab d-flex align-items-center ${isShared ? 'shared-tab' : ''}`;
        tab.style.webkitUserSelect = 'none';
        tab.style.userSelect = 'none';
        tab.style.webkitTouchCallout = 'none';

        const starIcon = list.is_favorite ? '<i class="fa-solid fa-star text-warning ms-2" style="font-size: 0.8rem;"></i>' : '';
        const sharedIcon = isShared ? '<i class="fa-solid fa-users text-purple ms-2" style="font-size: 0.7rem;"></i>' : '';

        tab.innerHTML = `<span>${list.title}</span>${starIcon}${sharedIcon}`;
        tab.dataset.id = list.id;
        tab.dataset.shareToken = list.share_token;
        tab.dataset.isFavorite = list.is_favorite ? "1" : "0";

        let pressTimer;
        let isLongPress = false;

        const startPress = (e) => {
            isLongPress = false;
            pressTimer = setTimeout(() => {
                isLongPress = true;
                showContextMenu(e, list, tab);
            }, LONG_PRESS_DURATION);
        };

        const cancelPress = () => {
            clearTimeout(pressTimer);
        };

        tab.addEventListener('touchstart', startPress, { passive: true });
        tab.addEventListener('touchend', cancelPress);
        tab.addEventListener('touchmove', cancelPress);
        
        tab.addEventListener('click', async (e) => {
            if (isLongPress) {
                isLongPress = false;
                return;
            }

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
        });

        tab.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            showContextMenu(e, list, tab);
        });
        
        // Sort favorites to top
        if (list.is_favorite) {
            listsContainer.prepend(tab);
        } else {
            listsContainer.appendChild(tab);
        }
        return tab;
    }

    function showContextMenu(e, list, tabElement) {
        let clientX, clientY;
        if (e.touches && e.touches.length > 0) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }

        contextMenu.style.display = 'block';
        contextMenu.style.position = 'fixed';
        contextMenu.style.left = clientX + 'px';
        contextMenu.style.top = clientY + 'px';
        contextMenu.dataset.selectedId = list.id;
        contextMenu.dataset.shareToken = list.share_token;
        contextMenu.dataset.isFavorite = tabElement.dataset.isFavorite;

        const isShared = list.user_id != currentUserId;
        const shareBtn = document.getElementById('share-list');
            if (shareBtn) {
                shareBtn.style.display = isShared ? 'none' : 'block';
            }

        const favBtn = document.getElementById('toggle-favorite');
        const favBtnSpan = favBtn.querySelector('span');
        const favBtnIcon = favBtn.querySelector('i');

        if (tabElement.dataset.isFavorite === "1") {
            favBtnSpan.innerText = 'Unpin';
            favBtnIcon.className = 'fa-regular fa-star me-2 text-secondary';
        } else {
            favBtnSpan.innerText = 'Pin to Top';
            favBtnIcon.className = 'fa-solid fa-star me-2 text-warning';
        }
    };

    // LISTS LOADING
    async function loadAllLists(targetId = null){
        try {
            const data = await apiRequest('/lists');
            listsContainer.innerHTML = '';
            data.forEach(list => renderTab(list));

            const savedId = targetId || localStorage.getItem('lastActiveListId');
            const target = document.querySelector(`.list-tab[data-id="${savedId}"]`) || listsContainer.firstChild;
            if (target) {
                target.click();
                target.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center'});
            }
        } catch (error) {
            // Error is handled by apiRequest
        }
    }

    //INIT
    loadAllLists();

    //CREATE LIST
    if (createListBtn) {
        createListBtn.addEventListener('click', async () => {
            const { value: name } = await Swal.fire({ 
                title: 'New List Name', 
                input: 'text', 
                showCancelButton: true
            });
            if (name) {
                try {
                    const newList = await apiRequest('/lists', 'POST', { title: name });
                    if (newList) {
                        const tab = renderTab(newList);
                        tab.click();
                        tab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                    }
                } catch (error) {
                    // Error is handled by apiRequest
                }
            }
        });
    }

    // TOGGLE FAVORITE
    document.getElementById('toggle-favorite').addEventListener('click', async () => {
        const id = contextMenu.dataset.selectedId;
        try {
            await apiRequest(`/lists/${id}/toggle-favorite`, 'POST');
            loadAllLists(id);
        } catch (error) {
            // Error is handled by apiRequest
        }
    });

    // RENAME
    document.getElementById('edit-list-name').addEventListener('click', async () => {
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
            try {
                await apiRequest(`/lists/${id}`, 'PUT', { title: title });
                tab.querySelector('span').innerText = title;
            } catch (error) {
                // Error is handled by apiRequest
            }
        }
    });
    
    // DELETE
    document.getElementById('delete-list').addEventListener('click', () => {
        const id = contextMenu.dataset.selectedId;
        Swal.fire({
            title: 'Delete list?',
            text: "All tasks in this list will be permanently removed!",
            icon: 'warning', 
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'Yes, delete it!'
        }).then(async (res) => {
            if (res.isConfirmed) {
                try {
                    await apiRequest(`/lists/${id}`, 'DELETE');
                    const tabToDelete = document.querySelector(`.list-tab[data-id="${id}"]`);
                    if (tabToDelete) {
                        const nextTab = tabToDelete.nextElementSibling || tabToDelete.previousElementSibling;
                        tabToDelete.remove();
                        if (nextTab) {
                            nextTab.click();
                        } else {
                            listsContainer.innerHTML = '';
                            if (taskListContainer) taskListContainer.innerHTML = '';
                            activeListInput.value = '';
                            localStorage.removeItem('lastActiveListId');
                        }
                    }
                } catch (error) {
                }
            }
        });
    });

    // SHARE LIST
    const shareBtn = document.getElementById('share-list');
    if (shareBtn) {
        shareBtn.addEventListener('click', () => {
            const token = contextMenu.dataset.shareToken;
            const shareUrl = `${window.location.origin}/share/${token}`;
            
            navigator.clipboard.writeText(shareUrl).then(() => {
                Swal.fire({
                    title: 'Link Copied!',
                    text: 'Send this link to share the list!',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
                });
            }).catch(err => {
                console.error('Failed to copy text: ', err);
                Swal.fire('Error', 'Could not copy the link.', 'error');
            });
        });
    }
 
    // HORIZONTAL SCROLL    
    if (listsContainer) {
        listsContainer.addEventListener("wheel", (evt) => {
            evt.preventDefault();
            listsContainer.scrollLeft += evt.deltaY;
        }, { passive: false });
    }
 
    // --- CONTEXT MENU ---
    document.addEventListener('click', () => contextMenu.style.display = 'none');

    // --- MOBILE DRAWER ---
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            const isOpen = drawer.classList.toggle('open');
            drawerIcon.classList.toggle('rotate-icon', isOpen);
            drawerIcon.classList.toggle('fa-chevron-up', isOpen);
            drawerIcon.classList.toggle('fa-chevron-down', !isOpen);
        });
    }   
});
