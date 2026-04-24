import { GuestManager } from "./GuestManager";

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
        const isShared = window.isAuthenticated ? (list.user_id != currentUserId) : false;

        tab.className = `list-tab d-flex align-items-center ${isShared ? 'shared-tab' : ''}`;
        tab.style.userSelect = 'none';
        tab.style.webkitTouchCallout = 'none';

        let avatarHtml = '';
        if (isShared && list.creator) {
            if (list.creator.photo_url) {
                avatarHtml = `
                    <img src="${list.creator.photo_url}" 
                        class="rounded-circle me-2 border border-1 border-primary" 
                        style="width: 22px; height: 22px; object-fit: cover;" 
                        title="Owner: ${list.creator.name}">
                `;
            } else {
                const initial = (list.creator.name && list.creator.name.length > 0) 
                    ? list.creator.name[0].toUpperCase() 
                    : '?';
                avatarHtml = `
                    <div class="rounded-circle me-2 d-flex align-items-center justify-content-center bg-primary text-white fw-bold shadow-sm" 
                        style="width: 22px; height: 22px; font-size: 11px;" 
                        title="Owner: ${list.creator.name}">
                        ${initial}
                    </div>
                `;
            }
        }

        const starIcon = list.is_favorite ? '<i class="fa-solid fa-star text-warning ms-2" style="font-size: 0.8rem;"></i>' : '';
        tab.innerHTML = `
            <div class="d-flex align-items-center overflow-hidden">
                ${avatarHtml}
                <span class="text-truncate">${list.title}</span>
            </div>
            ${starIcon}
        `;

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
        contextMenu.dataset.isShared = isShared ? "1" : "0";

        const deleteBtn = document.getElementById('delete-list');
        const deleteBtnSpan = deleteBtn.querySelector('span');
        const deleteBtnIcon = deleteBtn.querySelector('i');

        if (isShared) {
            deleteBtnSpan.innerText = 'Leave List';
            deleteBtnIcon.className = 'fa-solid fa-right-from-bracket me-2 text-danger';
        } else {
            deleteBtnSpan.innerText = 'Delete List';
            deleteBtnIcon.className = 'fa-solid fa-trash me-2 text-danger';
        }

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
        listsContainer.innerHTML = '';

        if (!window.isAuthenticated) {
            const guestLists = GuestManager.getLists();
            if (guestLists.length === 0) {
                const defaultList = GuestManager.saveList('My First List');
                guestLists.push(defaultList);
            }
            guestLists.forEach(list => renderTab(list));
            finalizeListLoading(targetId);
            } else {
                try {
                    const data = await apiRequest('/lists');
                    if (data) {
                        data.forEach(list => renderTab(list));
                        finalizeListLoading(targetId);
                    }
                } catch (error) {
                    console.error('Failed to load lists:', error);
                }
            }
    }

    function finalizeListLoading(targetId) {
        const savedId = targetId || localStorage.getItem('lastActiveListId');
        const target = document.querySelector(`.list-tab[data-id="${savedId}"]`) || listsContainer.firstChild;

        if (target) {
            target.click();
            target.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center'});
        }
    }

    //CREATE LIST
    if (createListBtn) {
        createListBtn.addEventListener('click', async () => {
            const { value: name } = await Swal.fire({ 
                title: 'New List Name', 
                input: 'text', 
                showCancelButton: true
            });
            if (name) {
                if (!window.isAuthenticated) {
                    const newList = GuestManager.saveList(name);
                    renderTab(newList).click();
                    return;
                }
                try {
                    const newList = await apiRequest('/lists', 'POST', { title: name });
                    if (newList) renderTab(newList).click();
                } catch (error) {
                    console.error('Failed to create list:', error);
                }
            }
        });
    }

    // TOGGLE FAVORITE
    document.getElementById('toggle-favorite').addEventListener('click', async () => {
        const id = contextMenu.dataset.selectedId;
        if (!window.isAuthenticated) {
            GuestManager.toggleFavorite(id);
            loadAllLists(id);
            return;
        }
        try {
            await apiRequest(`/lists/${id}/toggle-favorite`, 'POST');
            loadAllLists(id);
        } catch (error) { console.error('Failed to toggle favorite:', error); }
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
            if (!window.isAuthenticated) {
                GuestManager.renameList(id, title);
                tab.querySelector('span').innerText = title;
                return;
            }
            try {
                await apiRequest(`/lists/${id}`, 'PUT', { title: title });
                tab.querySelector('span').innerText = title;
            } catch (error) {
                console.error('Failed to update list:', error);
            }
        }
    });
    
    // DELETE
    document.getElementById('delete-list').addEventListener('click', () => {
        const id = contextMenu.dataset.selectedId;
        const isShared = contextMenu.dataset.isShared === "1";
        const listTab = document.querySelector(`.list-tab[data-id="${id}"]`);
        const listTitle = listTab ? listTab.querySelector('span').innerText : 'this list';

        const config = {
            title: isShared ? `Leave "${listTitle}"?` : `Delete "${listTitle}"?`,
            text: isShared 
                ? 'Are you sure you want to leave this list? The owner will keep it.' 
                : 'All tasks in this list will be permanently removed!',
            confirmText: isShared ? 'Yes, leave it!' : 'Yes, delete it!',
            successMessage: isShared ? 'You have left the list.' : 'List deleted.'
        }

        Swal.fire({
            title: config.title,
            text: config.text,
            icon: 'warning', 
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: config.confirmText
        }).then(async (res) => {
            if (res.isConfirmed) {
                if (!window.isAuthenticated) {
                    GuestManager.deleteList(id);
                    finalizeTabRemoval(id);
                    return;
                }
                try {
                    await apiRequest(`/lists/${id}`, 'DELETE');
                    finalizeTabRemoval(id);
                } catch (error) {  
                    console.error('Failed to delete list:', error);
                }
            }
        });
    });

    function finalizeTabRemoval(id) {
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
                loadAllLists();
            }
        }
    }

    // SHARE LIST
    const shareBtn = document.getElementById('share-list');
    if (shareBtn) {
        shareBtn.addEventListener('click', () => {
            if (!window.isAuthenticated) {
                Swal.fire({
                    title: 'Do you want to share this list?',
                    text: 'Only authorised users can share lists. Please Log in to use this feature.',
                    icon: 'info',
                    showCancelButton: true,
                    confirmButtonText: 'LogIn via Telegram',
                    cancelButtonText: 'Maybe later',
                    confirmButtonColor: '#25eb8fff'
                }).then((result) => {
                    if (result.isConfirmed) {
                        window.location.href = '/login';
                    }
                });
                return;
            }

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
    
    //INIT
    loadAllLists();
});
