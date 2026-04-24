import { GuestManager } from './GuestManager';

export const SyncManager = {
    async init() {
        if (!window.isAuthenticated) return;
        
        const guestLists = GuestManager.getLists();
        const guestTasks = GuestManager.getAllTasks();

        if (guestTasks.length === 0) {
            if (guestLists.length > 0) {
                this.clearGuestData();
                window.location.reload();
            } 
            return;
        }
        const response = await fetch('/api/user-lists-names');
        const userLists = await response.json();
        const conflicts = guestLists.filter(gl => userLists.some(ul => ul === gl.title));

        if (conflicts.length === 0) {
            await this.syncData(guestLists, guestTasks, {});
            return;
        }

        let html = `
                    <div id="conflict-manager" style="text-align: left; max-height: 400px; overflow-y: auto;">
                        <p class="text-muted small mb-3">We found lists with identical names. Choose how to handle each:</p>
                `;

        conflicts.forEach(list => {
            html += `
                <div class="conflict-row mb-4 p-3 border rounded shadow-sm conflict-card" data-guest-id="${list.id}">
                    <div class="d-flex justify-content-between align-items-center">
                        <div class="me-3">
                            <small class="text-muted d-block" style="font-size: 0.75rem;">List name:</small>
                            <span class="fw-bold list-title-text fs-5">${list.title}</span>
                        </div>
                        
                        <div class="btn-group btn-group-sm action-toggle-group" role="group">
                            <input type="radio" class="btn-check action-selector" name="action-${list.id}" 
                                id="merge-${list.id}" value="merge" checked>
                            <label class="btn btn-outline-primary" for="merge-${list.id}">Merge</label>

                            <input type="radio" class="btn-check action-selector" name="action-${list.id}" 
                                id="rename-${list.id}" value="rename">
                            <label class="btn btn-outline-warning" for="rename-${list.id}">Rename</label>

                            <input type="radio" class="btn-check action-selector" name="action-${list.id}" 
                                id="discard-${list.id}" value="discard">
                            <label class="btn btn-outline-danger" for="discard-${list.id}">Discard</label>
                        </div>
                    </div>

                    <div class="rename-input-container mt-3 pt-3 border-top" style="display: none;">
                        <label class="form-label small fw-bold text-warning mb-1">New Name:</label>
                        <input type="text" class="form-control form-control-sm new-name-input shadow-sm" 
                            placeholder="Enter new name" value="${list.title} (New)">
                    </div>
                </div>
            `;
        });

        const result = await Swal.fire({
            title: 'Conflict Resolution',
            html: html,
            text: 'We found lists with identical names. How would you like to handle them?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Start synchronization',
            confirmButtonColor: '#10b981',
            cancelButtonText: 'Discard All Guest Data',
            cancelButtonColor: '#ef4444',
            didOpen: () => {
                document.querySelectorAll('.action-selector').forEach(select => {
                    select.addEventListener('change', (e) => {
                        const container = e.target.closest('.conflict-row').querySelector('.rename-input-container');
                        if (e.target.value === 'rename') {
                            container.style.display = 'block';
                            container.animate([
                                { opacity: 0, transform: 'translateY(-10px)' },
                                { opacity: 1, transform: 'translateY(0)' }
                            ], { duration: 200, fill: 'forwards' });
                        } else {
                            container.style.display = 'none';
                        }
                    });
                });
            },
            preConfirm: () => {
                const resolutions = {};
                document.querySelectorAll('.conflict-row').forEach(row => {
                    const guestId = row.dataset.guestId;
                    const action = row.querySelector('.action-selector:checked').value;
                    const newName = row.querySelector('.new-name-input').value;
                    resolutions[guestId] = { action, newName };
                });
                return resolutions;
            }
        });

        if (result.isConfirmed) {
            await this.syncData(guestLists, guestTasks, result.value);
        } else {
            this.clearGuestData();
            window.location.reload();
        }
    },

    async syncData(lists, tasks, resolutions) {
        try {
            const response = await fetch('/sync', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify({ lists, tasks, resolutions })
            });

            if (response.ok) {
                this.clearGuestData();
                window.location.reload();
            } else {
                const error = await response.json();
                console.error('Sync Error Response:', error);
                Swal.fire({
                    title: 'Sync Failed',
                    text: error.message || 'An error occurred while syncing your data. Please try again later.',
                    icon: 'error'
                });
            }
        } catch (error) {
            console.error('Sync Network Error:', error);
            Swal.fire({
                title: 'Sync Failed',
                text: 'An error occurred while syncing your data. Please try again later.',
                icon: 'error'
            });
        }
    },

    clearGuestData() {
        localStorage.removeItem('guest_lists');
        localStorage.removeItem('guest_tasks');
        localStorage.removeItem('lastActiveListId');
        sessionStorage.removeItem('lastDeletedTasks');
    }
};