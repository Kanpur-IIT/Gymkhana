/* ═══════════════════════════════════════════════════════════════
   POPUP MANAGER — CRUD + Page Targeting
   ═══════════════════════════════════════════════════════════════ */

const PopupManager = {
    user: null,
    db: null,
    allPages: [],
    editingId: null,

    init(user, db, allPages) {
        this.user = user;
        this.db = db;
        this.allPages = allPages;
        this.bindEvents();
        this.renderPagesCheckboxes();
        this.loadPopups();
    },

    bindEvents() {
        // Target type toggle
        document.querySelectorAll('input[name="targetType"]').forEach(radio => {
            radio.addEventListener('change', e => {
                const type = e.target.value;
                document.getElementById('specificPagesSelect').style.display = type === 'specific' ? 'block' : 'none';
                document.getElementById('patternInput').style.display = type === 'pattern' ? 'block' : 'none';
            });
        });

        // Page filter
        const filter = document.getElementById('pageFilter');
        if (filter) {
            filter.addEventListener('input', e => this.renderPagesCheckboxes(e.target.value.toLowerCase()));
        }

        // Form submit
        document.getElementById('popupForm').addEventListener('submit', e => this.handleSubmit(e));
    },

    renderPagesCheckboxes(filter = '') {
        const container = document.getElementById('pagesCheckboxes');
        if (!container) return;
        const pages = this.allPages.filter(p =>
            filter === '' ||
            p.name.toLowerCase().includes(filter) ||
            p.path.toLowerCase().includes(filter) ||
            p.cat.toLowerCase().includes(filter)
        );
        container.innerHTML = pages.map(p => `
            <label class="page-checkbox">
                <input type="checkbox" value="${p.path}" class="target-page-cb">
                <span>${p.name} <small style="color:#556">(${p.cat})</small></span>
            </label>
        `).join('');
    },

    async handleSubmit(e) {
        e.preventDefault();
        const submitBtn = document.getElementById('popupSubmitBtn');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

        const targetType = document.querySelector('input[name="targetType"]:checked').value;
        let targetPages = [];
        let urlPattern = '';

        if (targetType === 'specific') {
            targetPages = Array.from(document.querySelectorAll('.target-page-cb:checked')).map(cb => cb.value);
            if (targetPages.length === 0) {
                alert('⚠️ Please select at least one page');
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-bullhorn"></i> Publish Popup';
                return;
            }
        } else if (targetType === 'pattern') {
            urlPattern = document.getElementById('urlPattern').value.trim();
            if (!urlPattern) {
                alert('⚠️ Please enter URL pattern (e.g. /branches/*)');
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-bullhorn"></i> Publish Popup';
                return;
            }
        }

        const data = {
            title: document.getElementById('popupTitle').value.trim(),
            message: document.getElementById('popupMessage').value.trim(),
            type: document.getElementById('popupType').value,
            code: document.getElementById('popupCode').value.trim(),
            link: document.getElementById('popupLink').value.trim(),
            btnText: document.getElementById('popupBtnText').value.trim() || 'Learn More',
            image: document.getElementById('popupImage').value.trim(),
            startDate: document.getElementById('popupStartDate').value,
            startTime: document.getElementById('popupStartTime').value,
            endDate: document.getElementById('popupEndDate').value,
            endTime: document.getElementById('popupEndTime').value,
            status: document.getElementById('popupStatus').value,
            priority: document.getElementById('popupPriority').value,
            targetType: targetType,
            targetPages: targetPages,
            urlPattern: urlPattern,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        try {
            if (this.editingId) {
                await this.db.collection('popups').doc(this.editingId).update(data);
            } else {
                data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
                data.createdBy = this.user.email;
                await this.db.collection('popups').add(data);
            }
            this.resetForm();
            this.loadPopups();
        } catch (err) {
            alert('❌ Error: ' + err.message);
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-bullhorn"></i> Publish Popup';
        }
    },

    loadPopups() {
        const container = document.getElementById('popupsList');
        container.innerHTML = '<div class="loading-state"><i class="fas fa-spinner fa-spin"></i> Loading...</div>';

        this.db.collection('popups').orderBy('createdAt', 'desc').onSnapshot(snap => {
            if (snap.empty) {
                container.innerHTML = '<div class="loading-state"><i class="fas fa-bullhorn"></i> No popups yet</div>';
                return;
            }
            container.innerHTML = snap.docs.map(doc => {
                const d = doc.data();
                const statusColor = d.status === 'active' ? '#6bff9e' : '#ff6b6b';
                const targetInfo = this.getTargetLabel(d);
                return `
                    <div class="popup-item">
                        <div class="popup-item-head">
                            <div>
                                <span class="popup-title">📢 ${this.esc(d.title)}</span>
                                <span class="popup-status" style="color:${statusColor}">● ${d.status}</span>
                            </div>
                            <div class="popup-actions">
                                <button onclick="PopupManager.editPopup('${doc.id}')"><i class="fas fa-edit"></i></button>
                                <button onclick="PopupManager.deletePopup('${doc.id}')"><i class="fas fa-trash"></i></button>
                            </div>
                        </div>
                        <div class="popup-msg">${this.esc(d.message)}</div>
                        <div class="popup-target">🎯 ${targetInfo}</div>
                        ${d.startDate ? `<div class="popup-time">📅 ${d.startDate} ${d.startTime || ''} → ${d.endDate || '∞'}</div>` : ''}
                    </div>
                `;
            }).join('');
        });
    },

    getTargetLabel(d) {
        if (d.targetType === 'all') return 'All pages';
        if (d.targetType === 'specific') {
            const pages = d.targetPages || [];
            return `${pages.length} page(s): ${pages.slice(0, 2).join(', ')}${pages.length > 2 ? '...' : ''}`;
        }
        if (d.targetType === 'pattern') return `Pattern: ${d.urlPattern}`;
        return 'Unknown';
    },

    editPopup(id) {
        this.db.collection('popups').doc(id).get().then(doc => {
            if (!doc.exists) return;
            const d = doc.data();
            this.editingId = id;

            document.getElementById('popupFormTitle').textContent = '✏️ Edit Popup';
            document.getElementById('popupTitle').value = d.title || '';
            document.getElementById('popupMessage').value = d.message || '';
            document.getElementById('popupType').value = d.type || 'info';
            document.getElementById('popupCode').value = d.code || '';
            document.getElementById('popupLink').value = d.link || '';
            document.getElementById('popupBtnText').value = d.btnText || 'Learn More';
            document.getElementById('popupImage').value = d.image || '';
            document.getElementById('popupStartDate').value = d.startDate || '';
            document.getElementById('popupStartTime').value = d.startTime || '';
            document.getElementById('popupEndDate').value = d.endDate || '';
            document.getElementById('popupEndTime').value = d.endTime || '';
            document.getElementById('popupStatus').value = d.status || 'active';
            document.getElementById('popupPriority').value = d.priority || 'normal';

            // Target type
            document.querySelectorAll('input[name="targetType"]').forEach(r => {
                r.checked = r.value === (d.targetType || 'all');
                r.dispatchEvent(new Event('change'));
            });

            if (d.targetType === 'specific' && d.targetPages) {
                setTimeout(() => {
                    document.querySelectorAll('.target-page-cb').forEach(cb => {
                        cb.checked = d.targetPages.includes(cb.value);
                    });
                }, 100);
            } else if (d.targetType === 'pattern') {
                document.getElementById('urlPattern').value = d.urlPattern || '';
            }

            document.getElementById('popupSubmitBtn').innerHTML = '<i class="fas fa-save"></i> Update Popup';
            document.getElementById('popupCancelBtn').classList.remove('hidden');

            document.querySelector('.popup-form-wrap').scrollIntoView({ behavior: 'smooth' });
        });
    },

    deletePopup(id) {
        if (!confirm('Delete this popup?')) return;
        this.db.collection('popups').doc(id).delete();
    },

    resetForm() {
        this.editingId = null;
        document.getElementById('popupForm').reset();
        document.getElementById('popupFormTitle').textContent = '📢 Create New Popup';
        document.getElementById('popupSubmitBtn').innerHTML = '<i class="fas fa-bullhorn"></i> Publish Popup';
        document.getElementById('popupCancelBtn').classList.add('hidden');
        document.querySelectorAll('input[name="targetType"]')[0].checked = true;
        document.getElementById('specificPagesSelect').style.display = 'none';
        document.getElementById('patternInput').style.display = 'none';
    },

    esc(s) {
        if (!s) return '';
        const d = document.createElement('div');
        d.textContent = s;
        return d.innerHTML;
    }
};