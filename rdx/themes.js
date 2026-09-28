/* ═══════════════════════════════════════════════════════════════
   THEME MANAGER — Global Theme Switching
   ═══════════════════════════════════════════════════════════════ */

const ThemeManager = {
    user: null,
    db: null,

    presets: {
        default: { name: '🏛️ Default (Gold)', css: '' },
        diwali: {
            name: '🪔 Diwali',
            css: `body { background: linear-gradient(135deg, #1a0a00 0%, #2a1000 100%) !important; }
.navbar, .footer { background: rgba(42, 16, 0, 0.95) !important; border-color: rgba(255, 153, 51, 0.4) !important; }
.hero h1 { background: linear-gradient(135deg, #ffcc00, #ff6600) !important; -webkit-background-clip: text !important; -webkit-text-fill-color: transparent !important; }
.section-title span, .card-glass h3, .icon-large { color: #ff9933 !important; }
.btn-glow, .btn-home, .btn-branch, .btn-fest { background: linear-gradient(135deg, #ff9933, #ff6600) !important; box-shadow: 0 0 40px rgba(255, 153, 51, 0.4) !important; }
.card-glass { background: rgba(42, 20, 0, 0.65) !important; border-color: rgba(255, 153, 51, 0.2) !important; }
.card-glass:hover { border-color: rgba(255, 153, 51, 0.6) !important; box-shadow: 0 0 30px rgba(255, 153, 51, 0.3) !important; }
.section-title::after { background: linear-gradient(90deg, #ff9933, transparent) !important; }
.navbar .nav-links a:hover { color: #ff9933 !important; border-bottom-color: #ff9933 !important; }`
        },
        holi: {
            name: '🎨 Holi',
            css: `body { background: linear-gradient(135deg, #1a001a 0%, #2a002a 50%, #0a1a1a 100%) !important; }
.navbar, .footer { background: rgba(42, 0, 42, 0.95) !important; border-color: rgba(255, 100, 200, 0.4) !important; }
.hero h1 { background: linear-gradient(135deg, #ff6b9d, #ffd700, #6bff9d) !important; -webkit-background-clip: text !important; -webkit-text-fill-color: transparent !important; }
.section-title span, .card-glass h3, .icon-large { color: #ff6b9d !important; }
.btn-glow, .btn-home, .btn-branch, .btn-fest { background: linear-gradient(135deg, #ff6b9d, #ffd700, #6bff9d) !important; }
.card-glass { background: rgba(42, 0, 42, 0.65) !important; border-color: rgba(255, 100, 200, 0.2) !important; }
.card-glass:hover { border-color: rgba(255, 100, 200, 0.6) !important; }
.section-title::after { background: linear-gradient(90deg, #ff6b9d, transparent) !important; }
.navbar .nav-links a:hover { color: #ff6b9d !important; border-bottom-color: #ff6b9d !important; }`
        },
        independence: {
            name: '🇮🇳 Independence Day',
            css: `body { background: linear-gradient(135deg, #0a1a0a 0%, #1a0a0a 100%) !important; }
.navbar, .footer { background: rgba(10, 26, 10, 0.95) !important; border-color: rgba(255, 153, 51, 0.4) !important; }
.hero h1 { background: linear-gradient(135deg, #ff9933, #ffffff, #138808) !important; -webkit-background-clip: text !important; -webkit-text-fill-color: transparent !important; }
.section-title span, .card-glass h3 { color: #ff9933 !important; }
.btn-glow, .btn-home { background: linear-gradient(135deg, #ff9933, #138808) !important; }
.card-glass { background: rgba(10, 26, 10, 0.65) !important; border-color: rgba(255, 153, 51, 0.2) !important; }
.section-title::after { background: linear-gradient(90deg, #ff9933, transparent) !important; }
.navbar .nav-links a:hover { color: #ff9933 !important; border-bottom-color: #ff9933 !important; }`
        },
        newyear: {
            name: '🎉 New Year',
            css: `body { background: linear-gradient(135deg, #0a0a2a 0%, #1a0a2a 100%) !important; }
.navbar, .footer { background: rgba(10, 10, 42, 0.95) !important; border-color: rgba(150, 200, 255, 0.4) !important; }
.hero h1 { background: linear-gradient(135deg, #ffd700, #ff6b9d, #6ba6ff) !important; -webkit-background-clip: text !important; -webkit-text-fill-color: transparent !important; }
.section-title span, .card-glass h3 { color: #6ba6ff !important; }
.btn-glow, .btn-home { background: linear-gradient(135deg, #6ba6ff, #ff6b9d) !important; }
.card-glass { background: rgba(18, 18, 60, 0.65) !important; border-color: rgba(150, 200, 255, 0.2) !important; }
.section-title::after { background: linear-gradient(90deg, #6ba6ff, transparent) !important; }
.navbar .nav-links a:hover { color: #6ba6ff !important; border-bottom-color: #6ba6ff !important; }`
        },
        christmas: {
            name: '🎄 Christmas',
            css: `body { background: linear-gradient(135deg, #0a1a0a 0%, #1a0a0a 100%) !important; }
.navbar, .footer { background: rgba(10, 26, 10, 0.95) !important; border-color: rgba(255, 100, 100, 0.4) !important; }
.hero h1 { background: linear-gradient(135deg, #ff0000, #00cc00) !important; -webkit-background-clip: text !important; -webkit-text-fill-color: transparent !important; }
.section-title span, .card-glass h3 { color: #ff5555 !important; }
.btn-glow, .btn-home { background: linear-gradient(135deg, #ff0000, #00cc00) !important; }
.card-glass { background: rgba(10, 30, 10, 0.65) !important; border-color: rgba(255, 100, 100, 0.2) !important; }
.section-title::after { background: linear-gradient(90deg, #ff5555, transparent) !important; }
.navbar .nav-links a:hover { color: #ff5555 !important; border-bottom-color: #ff5555 !important; }`
        },
        monsoon: {
            name: '🌧️ Monsoon',
            css: `body { background: linear-gradient(135deg, #0a1a2a 0%, #0a0a1a 100%) !important; }
.navbar, .footer { background: rgba(10, 26, 42, 0.95) !important; border-color: rgba(100, 200, 255, 0.3) !important; }
.hero h1 { background: linear-gradient(135deg, #6ba6ff, #b0d4ff) !important; -webkit-background-clip: text !important; -webkit-text-fill-color: transparent !important; }
.section-title span, .card-glass h3 { color: #6ba6ff !important; }
.btn-glow, .btn-home { background: linear-gradient(135deg, #6ba6ff, #4a86df) !important; }
.card-glass { background: rgba(10, 30, 50, 0.65) !important; border-color: rgba(100, 200, 255, 0.15) !important; }
.section-title::after { background: linear-gradient(90deg, #6ba6ff, transparent) !important; }
.navbar .nav-links a:hover { color: #6ba6ff !important; border-bottom-color: #6ba6ff !important; }`
        }
    },

    init(user, db) {
        this.user = user;
        this.db = db;
        this.bindEvents();
        this.loadActiveTheme();
    },

    bindEvents() {
        document.querySelectorAll('.theme-preset').forEach(preset => {
            preset.addEventListener('click', () => this.applyPreset(preset.dataset.theme));
        });

        const applyBtn = document.getElementById('applyCustomTheme');
        if (applyBtn) applyBtn.addEventListener('click', () => this.applyCustom());

        const resetBtn = document.getElementById('resetTheme');
        if (resetBtn) resetBtn.addEventListener('click', () => this.resetTheme());
    },

    async applyPreset(themeKey) {
        if (themeKey === 'default') return this.resetTheme();
        if (!confirm(`Apply "${this.presets[themeKey].name}" theme to ALL pages?`)) return;

        try {
            await this.db.collection('settings').doc('activeTheme').set({
                name: themeKey,
                displayName: this.presets[themeKey].name,
                css: this.presets[themeKey].css,
                isPreset: true,
                appliedBy: this.user.email,
                appliedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            this.notify('✅ Theme applied: ' + this.presets[themeKey].name, 'success');
            this.loadActiveTheme();
        } catch (err) {
            this.notify('❌ ' + err.message, 'error');
        }
    },

    async applyCustom() {
        const name = document.getElementById('themeCustomName').value.trim() || 'Custom Theme';
        const css = document.getElementById('themeCustomCss').value.trim();

        if (!css) { alert('Please enter CSS'); return; }
        if (!confirm(`Apply custom theme "${name}" to ALL pages?`)) return;

        try {
            await this.db.collection('settings').doc('activeTheme').set({
                name: 'custom',
                displayName: name,
                css: css,
                isPreset: false,
                appliedBy: this.user.email,
                appliedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            this.notify('✅ Custom theme applied', 'success');
            this.loadActiveTheme();
        } catch (err) {
            this.notify('❌ ' + err.message, 'error');
        }
    },

    async resetTheme() {
        if (!confirm('Reset to DEFAULT theme?')) return;
        try {
            await this.db.collection('settings').doc('activeTheme').delete();
            this.notify('🔄 Reset to default theme', 'success');
            this.loadActiveTheme();
        } catch (err) {
            this.notify('❌ ' + err.message, 'error');
        }
    },

    async loadActiveTheme() {
        try {
            const doc = await this.db.collection('settings').doc('activeTheme').get();
            const info = document.getElementById('activeThemeInfo');
            if (!info) return;

            if (doc.exists) {
                const data = doc.data();
                info.innerHTML = `
                    <div class="active-theme-box">
                        <div>
                            <div style="color:#ffd700; font-weight:600;">🎨 Active Theme: ${this.esc(data.displayName)}</div>
                            <div style="color:#8899bb; font-size:0.75rem; margin-top:4px;">
                                ${data.isPreset ? '📦 Preset' : '✏️ Custom'} · Applied by ${this.esc(data.appliedBy)}
                            </div>
                        </div>
                        <button onclick="ThemeManager.resetTheme()" class="btn-reset">Reset to Default</button>
                    </div>
                `;
                document.querySelectorAll('.theme-preset').forEach(p => {
                    p.classList.toggle('active', p.dataset.theme === data.name);
                });
            } else {
                info.innerHTML = `
                    <div class="active-theme-box">
                        <div>
                            <div style="color:#6bff9e; font-weight:600;">🏛️ Active Theme: Default (Gold)</div>
                            <div style="color:#8899bb; font-size:0.75rem; margin-top:4px;">Original theme in use</div>
                        </div>
                    </div>
                `;
                document.querySelectorAll('.theme-preset').forEach(p => {
                    p.classList.toggle('active', p.dataset.theme === 'default');
                });
            }
        } catch (err) {
            console.error(err);
        }
    },

    notify(msg, type) {
        const el = document.getElementById('themeNotify');
        if (!el) return;
        el.textContent = msg;
        el.className = 'theme-notify ' + type;
        setTimeout(() => el.className = 'theme-notify', 3000);
    },

    esc(s) {
        if (!s) return '';
        const d = document.createElement('div');
        d.textContent = s;
        return d.innerHTML;
    }
};