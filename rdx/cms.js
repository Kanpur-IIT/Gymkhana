/* ═══════════════════════════════════════════════════════════════
   CMS EDITOR — Live Content Editing Logic
   Text, Images, Sections editable via iframe
   ═══════════════════════════════════════════════════════════════ */

const FIREBASE_CONFIG = {
    apiKey: "AIzaSyDdr1WNCA-DPYo5N1Ea0uH_hA9PfkRYyX8",
    authDomain: "gymkhanaiitk.firebaseapp.com",
    databaseURL: "https://gymkhanaiitk-default-rtdb.firebaseio.com",
    projectId: "gymkhanaiitk",
    storageBucket: "gymkhanaiitk.firebasestorage.app",
    messagingSenderId: "389270259342",
    appId: "1:389270259342:web:65e918f934c8cc83b6ebdf"
};
const ALLOWED_EMAIL = "gymkhana.iitkanpur@gmail.com";

if (!firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);
const auth = firebase.auth();
const db = firebase.firestore();

const CMSEditor = {
    pagePath: null,
    iframe: null,
    isEditMode: false,
    changes: new Map(),         // element edits
    addedSections: new Map(),   // new sections
    deletedSections: new Set(), // deleted sections

    init(pagePath) {
        this.pagePath = pagePath;
        this.iframe = document.getElementById('pageFrame');

        auth.onAuthStateChanged(user => {
            if (!user || user.email !== ALLOWED_EMAIL) {
                window.location.href = 'login.html';
                return;
            }
            this.loadPage();
            this.bindEvents();
        });
    },

    loadPage() {
        this.iframe.src = '..' + this.pagePath;
        document.getElementById('statusMsg').textContent = 'Loading page...';

        this.iframe.onload = () => {
            document.getElementById('statusMsg').textContent = '✅ Page loaded';
            setTimeout(() => this.injectCMS(), 200);
        };
    },

    bindEvents() {
        document.getElementById('editToggle').addEventListener('click', () => this.toggleEditMode());
        document.getElementById('saveBtn').addEventListener('click', () => this.saveChanges());
        document.getElementById('reloadBtn').addEventListener('click', () => {
            const total = this.changes.size + this.addedSections.size + this.deletedSections.size;
            if (total > 0 && !confirm('Unsaved changes will be lost. Reload anyway?')) return;
            location.reload();
        });
    },

    injectCMS() {
        const doc = this.iframe.contentDocument;
        if (!doc) return;

        // ═══ 1. INJECT CSS FOR EDIT MODE ═══
        const style = doc.createElement('style');
        style.id = 'cms-editor-style';
        style.textContent = `
            [data-cms-editable="true"] {
                outline: 2px dashed rgba(255,215,0,0.4) !important;
                outline-offset: 3px;
                border-radius: 4px;
                transition: 0.2s;
                cursor: text;
                min-height: 1em;
            }
            [data-cms-editable="true"]:hover {
                outline: 2px solid rgba(255,215,0,0.8) !important;
                background: rgba(255,215,0,0.05);
            }
            [data-cms-editable="true"]:focus {
                outline: 2px solid #ffd700 !important;
                background: rgba(255,215,0,0.08);
                box-shadow: 0 0 20px rgba(255,215,0,0.2);
            }
            img[data-cms-editable="true"] {
                outline: 3px dashed rgba(255,215,0,0.5) !important;
                outline-offset: 3px;
                cursor: pointer;
                transition: 0.2s;
            }
            img[data-cms-editable="true"]:hover {
                outline: 3px solid #ffd700 !important;
                transform: scale(1.02);
                box-shadow: 0 0 30px rgba(255,215,0,0.3);
            }
        `;
        doc.head.appendChild(style);

        // ═══ 2. TAG EDITABLE ELEMENTS ═══
        const tags = ['h1','h2','h3','h4','h5','h6','p','span','a','li'];
        tags.forEach(tag => {
            doc.querySelectorAll(tag).forEach((el, idx) => {
                if (el.closest('nav') || el.closest('footer')) return;
                if (el.closest('script') || el.closest('style')) return;
                el.dataset.cmsId = tag + '_' + idx;
                el.dataset.cmsEditable = 'true';
            });
        });

        doc.querySelectorAll('img').forEach((img, idx) => {
            if (img.closest('nav') || img.closest('footer')) return;
            img.dataset.cmsId = 'img_' + idx;
            img.dataset.cmsEditable = 'true';
        });

        // Mark sections for potential structural edits
        doc.querySelectorAll('section, .content-section, .card-glass').forEach((s, idx) => {
            if (s.closest('nav') || s.closest('footer')) return;
            s.dataset.cmsSection = idx;
        });

        // ═══ 3. ATTACH LISTENERS ═══
        this.attachListeners(doc);

        // ═══ 4. LOAD SAVED CONTENT ═══
        this.loadSavedContent();
    },

    attachListeners(doc) {
        doc.querySelectorAll('[data-cms-editable="true"]').forEach(el => {
            // Remove old listeners by cloning
            const newEl = el.cloneNode(true);
            el.parentNode.replaceChild(newEl, el);

            if (newEl.tagName === 'IMG') {
                newEl.addEventListener('click', e => this.handleImageClick(e));
            } else {
                newEl.addEventListener('input', e => this.handleTextChange(e));
            }
        });
    },

    handleTextChange(e) {
        const el = e.target;
        this.changes.set(el.dataset.cmsId, {
            id: el.dataset.cmsId,
            type: 'text',
            value: el.innerHTML
        });
        this.updateUI();
    },

    handleImageClick(e) {
        const img = e.target;
        const newUrl = prompt('Enter new image URL:', img.src);
        if (newUrl && newUrl.trim()) {
            img.src = newUrl.trim();
            this.changes.set(img.dataset.cmsId, {
                id: img.dataset.cmsId,
                type: 'image',
                value: newUrl.trim()
            });
            this.updateUI();
        }
    },

    async loadSavedContent() {
        try {
            const ref = db.collection('pages').doc(encodeURIComponent(this.pagePath));
            const doc = await ref.get();

            if (!doc.exists) {
                document.getElementById('statusMsg').textContent = '🆕 New page (no saved edits)';
                return;
            }

            const data = doc.data();
            const iframeDoc = this.iframe.contentDocument;

            if (data.elements) {
                data.elements.forEach(item => {
                    const el = iframeDoc.querySelector(`[data-cms-id="${item.id}"]`);
                    if (!el) return;
                    if (item.type === 'text') el.innerHTML = item.value;
                    else if (item.type === 'image') el.src = item.value;
                });
            }

            if (data.addedSections) {
                data.addedSections.forEach(sec => {
                    const w = iframeDoc.createElement('div');
                    w.innerHTML = sec.html;
                    w.dataset.cmsAdded = sec.id;
                    iframeDoc.body.appendChild(w);
                    this.addedSections.set(sec.id, sec);
                });
            }

            if (data.deletedSections) {
                data.deletedSections.forEach(idx => {
                    const s = iframeDoc.querySelector(`[data-cms-section="${idx}"]`);
                    if (s) s.style.display = 'none';
                    this.deletedSections.add(idx);
                });
            }

            const count = (data.elements?.length || 0);
            document.getElementById('statusMsg').textContent = `✅ Loaded ${count} saved edits`;
        } catch (err) {
            console.error('Load error:', err);
            document.getElementById('statusMsg').textContent = '⚠️ Load failed';
        }
    },

    toggleEditMode() {
        this.isEditMode = !this.isEditMode;
        const doc = this.iframe.contentDocument;
        const btn = document.getElementById('editToggle');

        if (this.isEditMode) {
            btn.innerHTML = '<i class="fas fa-edit"></i> Edit: ON';
            btn.classList.add('on');

            doc.querySelectorAll('[data-cms-editable="true"]').forEach(el => {
                if (el.tagName !== 'IMG') {
                    el.contentEditable = 'true';
                }
            });

            document.getElementById('statusMsg').textContent = '✏️ Edit ON — click any text/image';
        } else {
            btn.innerHTML = '<i class="fas fa-edit"></i> Edit: OFF';
            btn.classList.remove('on');

            doc.querySelectorAll('[contenteditable="true"]').forEach(el => {
                el.contentEditable = 'false';
            });

            document.getElementById('statusMsg').textContent = '👁️ Edit OFF';
        }
    },

    updateUI() {
        const total = this.changes.size + this.addedSections.size + this.deletedSections.size;
        document.getElementById('changeCount').textContent = total + ' change' + (total !== 1 ? 's' : '');
        document.getElementById('saveBtn').disabled = total === 0;
    },

    async saveChanges() {
        const total = this.changes.size + this.addedSections.size + this.deletedSections.size;
        if (total === 0) return;

        const btn = document.getElementById('saveBtn');
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

        try {
            const ref = db.collection('pages').doc(encodeURIComponent(this.pagePath));
            const doc = await ref.get();

            let existingElements = [];
            let existingAdded = [];
            let existingDeleted = [];

            if (doc.exists) {
                const d = doc.data();
                existingElements = d.elements || [];
                existingAdded = d.addedSections || [];
                existingDeleted = d.deletedSections || [];
            }

            // Merge existing + new changes
            const elemMap = new Map();
            existingElements.forEach(e => elemMap.set(e.id, e));
            this.changes.forEach(e => elemMap.set(e.id, e));

            const addedMap = new Map();
            existingAdded.forEach(a => addedMap.set(a.id, a));
            this.addedSections.forEach(a => addedMap.set(a.id, a));

            const deletedSet = new Set([...existingDeleted, ...this.deletedSections]);

            await ref.set({
                path: this.pagePath,
                elements: Array.from(elemMap.values()),
                addedSections: Array.from(addedMap.values()),
                deletedSections: Array.from(deletedSet),
                lastUpdated: firebase.firestore.FieldValue.serverTimestamp(),
                updatedBy: auth.currentUser.email
            }, { merge: true });

            document.getElementById('statusMsg').textContent = '✅ Saved successfully!';

            this.changes.clear();
            this.addedSections.clear();
            this.deletedSections.clear();
            this.updateUI();

            setTimeout(() => {
                btn.innerHTML = '<i class="fas fa-save"></i> Save';
                btn.disabled = true;
            }, 1500);

        } catch (err) {
            console.error('Save error:', err);
            document.getElementById('statusMsg').textContent = '❌ Save failed: ' + err.message;
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-save"></i> Save';
        }
    }
};