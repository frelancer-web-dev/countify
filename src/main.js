// Translations
const translations = {
    ua: {
        title: 'Countify',
        manual: 'Ручний режим',
        auto: 'Автоматичний',
        speed: 'Швидкість:',
        start: 'Старт',
        stop: 'Стоп',
        reset: 'Reset',
        sound: 'Звукові ефекти',
        info: 'Використовуй кнопки або клавіші ← → для зміни значення',
        undo: 'Повернути',
        settingsTitle: 'Налаштування',
        autoSpeed: 'Швидкість автоматичного режиму:',
        manualStep: 'Крок для ручного режиму:',
        autoStep: 'Крок для автоматичного режиму:',
        stepHint: 'За один клік',
        save: 'Зберегти'
    },
    en: {
        title: 'Countify',
        manual: 'Manual Mode',
        auto: 'Automatic',
        speed: 'Speed:',
        start: 'Start',
        stop: 'Stop',
        reset: 'Reset',
        sound: 'Sound Effects',
        info: 'Use buttons or arrow keys ← → to change value',
        undo: 'Undo',
        settingsTitle: 'Settings',
        autoSpeed: 'Auto mode speed:',
        manualStep: 'Manual mode step:',
        autoStep: 'Auto mode step:',
        stepHint: 'Per click',
        save: 'Save'
    },
    ru: {
        title: 'Countify',
        manual: 'Ручной режим',
        auto: 'Автоматический',
        speed: 'Скорость:',
        start: 'Старт',
        stop: 'Стоп',
        reset: 'Сброс',
        sound: 'Звуковые эффекты',
        info: 'Используй кнопки или клавиши ← → для изменения значения',
        undo: 'Вернуть',
        settingsTitle: 'Настройки',
        autoSpeed: 'Скорость автоматического режима:',
        manualStep: 'Шаг для ручного режима:',
        autoStep: 'Шаг для автоматического режима:',
        stepHint: 'За один клик',
        save: 'Сохранить'
    }
};

class Countify {
    constructor() {
        this.counter = 0;
        this.history = [];
        this.soundEnabled = true;
        this.isAnimating = false;
        this.currentMode = 'manual';
        this.autoInterval = null;
        this.autoSpeed = 1000;
        this.manualStep = 1;
        this.autoStep = 1;
        this.isAutoRunning = false;
        this.currentLang = 'ua';
        this.currentTheme = 'light';
        
        this.counterDisplay = document.getElementById('counterDisplay');
        this.incrementBtn = document.getElementById('incrementBtn');
        this.decrementBtn = document.getElementById('decrementBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.undoBtn = document.getElementById('undoBtn');
        this.soundToggle = document.getElementById('soundToggle');
        this.themeToggle = document.getElementById('themeToggle');
        this.settingsBtn = document.getElementById('settingsBtn');
        this.autoSettings = document.getElementById('autoSettings');
        this.autoToggle = document.getElementById('autoToggle');
        
        this.modalOverlay = document.getElementById('modalOverlay');
        this.modalClose = document.getElementById('modalClose');
        this.modalSave = document.getElementById('modalSave');
        this.modalSpeedRange = document.getElementById('modalSpeedRange');
        this.modalSpeedValue = document.getElementById('modalSpeedValue');
        this.manualStepInput = document.getElementById('manualStepInput');
        this.autoStepInput = document.getElementById('autoStepInput');
        
        this.init();
    }
    
    init() {
        this.loadFromStorage();
        this.setupEventListeners();
        this.setupKeyboardControls();
        this.updateDisplay();
        this.applyTheme();
        this.applyLanguage();
        this.updateModalInputs();
    }
    
    setupEventListeners() {
        this.incrementBtn.addEventListener('click', () => this.increment());
        this.decrementBtn.addEventListener('click', () => this.decrement());
        this.resetBtn.addEventListener('click', () => this.reset());
        this.undoBtn.addEventListener('click', () => this.undo());
        
        this.soundToggle.addEventListener('change', (e) => {
            this.soundEnabled = e.target.checked;
            this.saveToStorage();
        });
        
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
        this.settingsBtn.addEventListener('click', () => this.openModal());
        
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const lang = e.target.dataset.lang;
                this.changeLanguage(lang);
            });
        });
        
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const mode = e.target.dataset.mode;
                this.changeMode(mode);
            });
        });
        
        this.autoToggle.addEventListener('click', () => this.toggleAutoMode());
        
        this.modalClose.addEventListener('click', () => this.closeModal());
        this.modalSave.addEventListener('click', () => this.saveSettings());
        this.modalOverlay.addEventListener('click', (e) => {
            if (e.target === this.modalOverlay) {
                this.closeModal();
            }
        });
        
        this.modalSpeedRange.addEventListener('input', (e) => {
            this.modalSpeedValue.textContent = `${e.target.value}ms`;
        });
    }
    
    setupKeyboardControls() {
        document.addEventListener('keydown', (e) => {
            if (this.currentMode === 'auto' && this.isAutoRunning) return;
            
            if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
                e.preventDefault();
                this.increment();
            } else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
                e.preventDefault();
                this.decrement();
            } else if (e.key === 'r' || e.key === 'R') {
                this.reset();
            } else if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
                e.preventDefault();
                this.undo();
            }
        });
    }
    
    openModal() {
        this.modalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    closeModal() {
        this.modalOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    updateModalInputs() {
        this.modalSpeedRange.value = this.autoSpeed;
        this.modalSpeedValue.textContent = `${this.autoSpeed}ms`;
        this.manualStepInput.value = this.manualStep;
        this.autoStepInput.value = this.autoStep;
    }
    
    saveSettings() {
        this.autoSpeed = parseInt(this.modalSpeedRange.value);
        this.manualStep = parseInt(this.manualStepInput.value) || 1;
        this.autoStep = parseInt(this.autoStepInput.value) || 1;
        
        if (this.manualStep < 1) this.manualStep = 1;
        if (this.autoStep < 1) this.autoStep = 1;
        
        this.saveToStorage();
        this.closeModal();
        
        if (this.isAutoRunning) {
            this.stopAutoMode();
            this.startAutoMode();
        }
    }
    
    addToHistory() {
        this.history.push(this.counter);
        if (this.history.length > 50) {
            this.history.shift();
        }
        this.undoBtn.disabled = false;
    }
    
    undo() {
        if (this.history.length === 0 || this.isAnimating) return;
        
        const previousValue = this.history.pop();
        const currentValue = this.counter;
        this.counter = previousValue;
        
        this.animateValue(currentValue, this.counter, 'undo');
        this.playSound('undo');
        this.saveToStorage();
        
        if (this.history.length === 0) {
            this.undoBtn.disabled = true;
        }
    }
    
    changeMode(mode) {
        this.currentMode = mode;
        
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.mode === mode) {
                btn.classList.add('active');
            }
        });
        
        if (mode === 'auto') {
            this.autoSettings.classList.add('active');
            this.incrementBtn.disabled = true;
            this.decrementBtn.disabled = true;
        } else {
            this.autoSettings.classList.remove('active');
            this.incrementBtn.disabled = false;
            this.decrementBtn.disabled = false;
            this.stopAutoMode();
        }
        
        this.saveToStorage();
    }
    
    toggleAutoMode() {
        if (this.isAutoRunning) {
            this.stopAutoMode();
        } else {
            this.startAutoMode();
        }
    }
    
    startAutoMode() {
        this.isAutoRunning = true;
        this.autoToggle.classList.add('active');
        const stopText = this.autoToggle.querySelector('span');
        stopText.setAttribute('data-i18n', 'stop');
        stopText.textContent = translations[this.currentLang].stop;
        
        this.autoInterval = setInterval(() => {
            this.increment();
        }, this.autoSpeed);
    }
    
    stopAutoMode() {
        this.isAutoRunning = false;
        this.autoToggle.classList.remove('active');
        const startText = this.autoToggle.querySelector('span');
        startText.setAttribute('data-i18n', 'start');
        startText.textContent = translations[this.currentLang].start;
        
        if (this.autoInterval) {
            clearInterval(this.autoInterval);
            this.autoInterval = null;
        }
    }
    
    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme();
        this.saveToStorage();
    }
    
    applyTheme() {
        if (this.currentTheme === 'dark') {
            document.body.classList.add('dark-theme');
        } else {
            document.body.classList.remove('dark-theme');
        }
    }
    
    changeLanguage(lang) {
        this.currentLang = lang;
        
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.lang === lang) {
                btn.classList.add('active');
            }
        });
        
        this.applyLanguage();
        this.saveToStorage();
    }
    
    applyLanguage() {
        const trans = translations[this.currentLang];
        
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (trans[key]) {
                el.textContent = trans[key];
            }
        });
    }
    
    increment() {
        if (this.isAnimating) return;
        
        this.addToHistory();
        const oldValue = this.counter;
        const step = this.currentMode === 'manual' ? this.manualStep : this.autoStep;
        this.counter += step;
        this.animateValue(oldValue, this.counter, 'increment');
        this.playSound('increment');
        this.saveToStorage();
    }
    
    decrement() {
        if (this.isAnimating) return;
        
        this.addToHistory();
        const oldValue = this.counter;
        const step = this.currentMode === 'manual' ? this.manualStep : this.autoStep;
        this.counter -= step;
        this.animateValue(oldValue, this.counter, 'decrement');
        this.playSound('decrement');
        this.saveToStorage();
    }
    
    reset() {
        if (this.isAnimating) return;
        
        if (this.isAutoRunning) {
            this.stopAutoMode();
        }
        
        this.addToHistory();
        const oldValue = this.counter;
        this.counter = 0;
        this.animateValue(oldValue, this.counter, 'reset');
        this.playSound('reset');
        this.saveToStorage();
    }
    
    animateValue(start, end, type) {
        this.isAnimating = true;
        const duration = 400;
        const startTime = performance.now();
        const difference = end - start;
        
        this.counterDisplay.classList.remove('increment', 'decrement', 'pulse');
        
        void this.counterDisplay.offsetWidth;
        
        if (type === 'increment') {
            this.counterDisplay.classList.add('increment');
        } else if (type === 'decrement') {
            this.counterDisplay.classList.add('decrement');
        } else if (type === 'reset' || type === 'undo') {
            this.counterDisplay.classList.add('pulse');
        }
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const easeOutQuad = progress * (2 - progress);
            
            const current = start + (difference * easeOutQuad);
            this.counterDisplay.textContent = Math.round(current);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.counterDisplay.textContent = end;
                this.isAnimating = false;
                
                setTimeout(() => {
                    this.counterDisplay.classList.remove('increment', 'decrement', 'pulse');
                }, 400);
            }
        };
        
        requestAnimationFrame(animate);
    }
    
    updateDisplay() {
        this.counterDisplay.textContent = this.counter;
    }
    
    playSound(type) {
        if (!this.soundEnabled) return;
        
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        let frequency, duration;
        
        switch(type) {
            case 'increment':
                frequency = 800;
                duration = 0.1;
                break;
            case 'decrement':
                frequency = 400;
                duration = 0.1;
                break;
            case 'reset':
            case 'undo':
                frequency = 600;
                duration = 0.15;
                break;
        }
        
        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
    }
    
    saveToStorage() {
        const data = {
            counter: this.counter,
            history: this.history,
            soundEnabled: this.soundEnabled,
            currentMode: this.currentMode,
            autoSpeed: this.autoSpeed,
            manualStep: this.manualStep,
            autoStep: this.autoStep,
            currentLang: this.currentLang,
            currentTheme: this.currentTheme
        };
        localStorage.setItem('countify', JSON.stringify(data));
    }
    
    loadFromStorage() {
        const saved = localStorage.getItem('countify');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.counter = data.counter || 0;
                this.history = data.history || [];
                this.soundEnabled = data.soundEnabled !== undefined ? data.soundEnabled : true;
                this.currentMode = data.currentMode || 'manual';
                this.autoSpeed = data.autoSpeed || 1000;
                this.manualStep = data.manualStep || 1;
                this.autoStep = data.autoStep || 1;
                this.currentLang = data.currentLang || 'ua';
                this.currentTheme = data.currentTheme || 'light';
                
                this.soundToggle.checked = this.soundEnabled;
                this.undoBtn.disabled = this.history.length === 0;
                
                if (this.currentMode === 'auto') {
                    this.changeMode('auto');
                }
            } catch (e) {
                console.error('Error loading from storage:', e);
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new Countify();
});
