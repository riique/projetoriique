// ===== GLOBAL VARIABLES =====
let selectedMealOptions = {
    breakfast: 'A',
    lunch: 'A',
    snack: 'A',
    dinner: 'A',
    supper: 'A'
};

let favoritePlans = [];
let selectedPlan = null;

// ===== LOADING SCREEN =====
window.addEventListener('load', function() {
    const loadingScreen = document.getElementById('loading-screen');
    const loadingProgress = document.querySelector('.loading-progress');

    if (loadingScreen && loadingProgress) {
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                setTimeout(() => {
                    loadingScreen.style.opacity = '0';
                    setTimeout(() => {
                        loadingScreen.style.display = 'none';
                    }, 500);
                }, 500);
            }
            loadingProgress.style.width = progress + '%';
        }, 100);
    }
});

// ===== NAVIGATION MENU =====
function initNavigation() {
    const menuToggle = document.getElementById('menu-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navOverlay = document.getElementById('nav-overlay');
    const navClose = document.getElementById('nav-close');

    function openNav() {
        if (navMenu && navOverlay) {
            navMenu.classList.add('active');
            navOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    function closeNav() {
        if (navMenu && navOverlay) {
            navMenu.classList.remove('active');
            navOverlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    menuToggle?.addEventListener('click', openNav);
    navClose?.addEventListener('click', closeNav);
    navOverlay?.addEventListener('click', closeNav);

    // Close nav when clicking on nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', closeNav);
    });
}

// ===== THEME SYSTEM =====
const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

function initTheme() {
    const storedTheme = localStorage.getItem('theme');
    const theme = storedTheme || (prefersDarkScheme.matches ? 'dark' : 'light');

    document.documentElement.setAttribute('data-theme', theme);
    updateThemeIcons(theme === 'dark');
}

function updateThemeIcons(isDark) {
    const themeToggles = document.querySelectorAll('.theme-toggle, #theme-toggle-float');

    themeToggles.forEach(toggle => {
        const icon = toggle.querySelector('i');
        if (icon) {
            if (isDark) {
                icon.className = 'fas fa-sun';
            } else {
                icon.className = 'fas fa-moon';
            }
        }
    });
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';

    document.documentElement.classList.add('theme-transition');
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);

    updateThemeIcons(newTheme === 'dark');

    setTimeout(() => {
        document.documentElement.classList.remove('theme-transition');
    }, 600);

    showNotification(`Tema ${newTheme === 'dark' ? 'escuro' : 'claro'} ativado!`, 'success');
}

function initThemeListeners() {
    const themeToggles = document.querySelectorAll('.theme-toggle, #theme-toggle-float');

    themeToggles.forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            e.preventDefault();
            toggleTheme();

            toggle.classList.add('theme-toggle-animate');
            setTimeout(() => {
                toggle.classList.remove('theme-toggle-animate');
            }, 700);
        });
    });
}

// ===== MEAL OPTIONS SYSTEM =====
function openOption(mealType, option) {
    // Hide all options for this meal
    document.querySelectorAll(`[id^="${mealType}-"]`).forEach(content => {
        content.classList.remove('active');
    });

    // Remove active class from all tabs for this meal
    document.querySelectorAll(`[onclick*="${mealType}"]`).forEach(tab => {
        tab.classList.remove('active');
    });

    // Show selected option with animation
    const selectedContent = document.getElementById(`${mealType}-${option}`);
    const selectedTab = document.querySelector(`[onclick="openOption('${mealType}', '${option}')"]`);

    if (selectedContent) {
        selectedContent.style.opacity = '0';
        selectedContent.classList.add('active');

        setTimeout(() => {
            selectedContent.style.opacity = '1';
            selectedContent.style.transition = 'opacity 0.5s ease';
        }, 50);
    }

    if (selectedTab) {
        selectedTab.classList.add('active');
    }

    // Update global state
    selectedMealOptions[mealType] = option;

    // Save to localStorage
    localStorage.setItem(`${mealType}-selection`, option);
    localStorage.setItem('selectedMealOptions', JSON.stringify(selectedMealOptions));

    // Update calculations
    updateDailyTotals();

    // Show feedback
    const optionName = selectedTab?.querySelector('.option-name')?.textContent || `Opção ${option}`;
    showNotification(`${optionName} selecionada para ${getMealName(mealType)}!`, 'success');
}

function randomizeOption(mealType) {
    const options = ['A', 'B', 'C', 'D', 'E'];
    const randomOption = options[Math.floor(Math.random() * options.length)];
    openOption(mealType, randomOption);

    // Add visual effect
    const mealContainer = document.getElementById(mealType);
    if (mealContainer) {
        mealContainer.classList.add('randomize-effect');
        setTimeout(() => {
            mealContainer.classList.remove('randomize-effect');
        }, 1000);
    }
}

function compareOptions(mealType) {
    const modal = createComparisonModal(mealType);
    document.body.appendChild(modal);

    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
}

function createComparisonModal(mealType) {
    const modal = document.createElement('div');
    modal.className = 'comparison-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3><i class="fas fa-balance-scale"></i> Comparar Opções - ${getMealName(mealType)}</h3>
                <button class="modal-close" onclick="closeModal(this)">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="comparison-grid">
                    ${generateComparisonContent(mealType)}
                </div>
            </div>
        </div>
        <div class="modal-overlay" onclick="closeModal(this.parentElement)"></div>
    `;

    return modal;
}

function generateComparisonContent(mealType) {
    const options = ['A', 'B', 'C', 'D', 'E'];
    let content = '';

    options.forEach(option => {
        const optionElement = document.getElementById(`${mealType}-${option}`);
        if (optionElement) {
            const totalElement = optionElement.querySelector('.option-total');
            const calories = totalElement?.querySelector('.macro-kcal')?.textContent || 'N/A';
            const protein = totalElement?.querySelector('.macro-proteina')?.textContent || 'N/A';

            content += `
                <div class="comparison-card" onclick="selectFromComparison('${mealType}', '${option}')">
                    <div class="comparison-header">
                        <span class="option-letter">${option}</span>
                        <span class="option-calories">${calories}</span>
                    </div>
                    <div class="comparison-protein">${protein}</div>
                    <button class="select-option-btn">
                        <i class="fas fa-check"></i>
                        Selecionar
                    </button>
                </div>
            `;
        }
    });

    return content;
}

function selectFromComparison(mealType, option) {
    openOption(mealType, option);
    closeModal(document.querySelector('.comparison-modal'));
}

function closeModal(modal) {
    modal.classList.remove('show');
    setTimeout(() => {
        modal.remove();
    }, 300);
}

// ===== PLAN SELECTION SYSTEM =====
function selectPlan(planNumber) {
    // Remove previous selections
    document.querySelectorAll('.plan-row').forEach(row => {
        row.classList.remove('selected');
    });

    // Add selection to clicked row
    const selectedRow = document.querySelector(`[data-day="${planNumber}"]`);
    if (selectedRow) {
        selectedRow.classList.add('selected');
        selectedPlan = planNumber;

        // Save selection
        localStorage.setItem('selected-plan', planNumber);

        // Show success message
        showNotification(`Plano ${planNumber} selecionado com sucesso!`, 'success');

        // Update meal options based on selected plan
        updateMealOptionsFromPlan(planNumber);
    }
}

function updateMealOptionsFromPlan(planNumber) {
    const planRow = document.querySelector(`[data-day="${planNumber}"]`);
    if (planRow) {
        const mealOptions = {
            breakfast: planRow.querySelector('[data-meal="breakfast"]')?.textContent,
            lunch: planRow.querySelector('[data-meal="lunch"]')?.textContent,
            snack: planRow.querySelector('[data-meal="snack"]')?.textContent,
            dinner: planRow.querySelector('[data-meal="dinner"]')?.textContent,
            supper: planRow.querySelector('[data-meal="supper"]')?.textContent
        };

        // Update each meal option
        Object.entries(mealOptions).forEach(([meal, option]) => {
            if (option) {
                openOption(meal, option);
            }
        });
    }
}

function toggleFavorite(planNumber) {
    const favoriteBtn = document.querySelector(`[data-day="${planNumber}"] .favorite-btn i`);
    const isFavorited = favoriteBtn.classList.contains('fas');

    if (isFavorited) {
        favoriteBtn.className = 'far fa-heart';
        favoritePlans = favoritePlans.filter(p => p !== planNumber);
        showNotification(`Plano ${planNumber} removido dos favoritos`, 'info');
    } else {
        favoriteBtn.className = 'fas fa-heart';
        favoritePlans.push(planNumber);
        showNotification(`Plano ${planNumber} adicionado aos favoritos!`, 'success');
    }

    localStorage.setItem('favorite-plans', JSON.stringify(favoritePlans));
}

function toggleMealFavorite(mealType) {
    const favoriteBtn = document.querySelector(`#${mealType} .meal-favorite i`);
    const isFavorited = favoriteBtn.classList.contains('fas');

    if (isFavorited) {
        favoriteBtn.className = 'far fa-heart';
        showNotification(`${getMealName(mealType)} removida dos favoritos`, 'info');
    } else {
        favoriteBtn.className = 'fas fa-heart';
        showNotification(`${getMealName(mealType)} adicionada aos favoritos!`, 'success');
    }
}

function highlightBestPlan() {
    // Remove previous highlights
    document.querySelectorAll('.plan-row').forEach(row => {
        row.classList.remove('highlighted');
    });

    // Highlight the best plan (plan 10 in this case)
    const bestPlan = document.querySelector('[data-day="10"]');
    if (bestPlan) {
        bestPlan.classList.add('highlighted');
        bestPlan.scrollIntoView({ behavior: 'smooth', block: 'center' });
        showNotification('Melhor plano destacado!', 'success');
    }
}

function toggleTableView() {
    const table = document.getElementById('meal-plan-table');
    if (table) {
        table.classList.toggle('compact-view');
        showNotification('Visualização da tabela alterada!', 'info');
    }
}

// ===== UTILITY FUNCTIONS =====
function getMealName(mealType) {
    const names = {
        'breakfast': 'Café da Manhã',
        'lunch': 'Almoço',
        'snack': 'Lanche da Tarde',
        'dinner': 'Jantar',
        'supper': 'Ceia'
    };
    return names[mealType] || mealType;
}

function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

function calculateDailyTotals() {
    // Calculate totals based on selected options
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFats = 0;

    Object.entries(selectedMealOptions).forEach(([meal, option]) => {
        const optionElement = document.getElementById(`${meal}-${option}`);
        if (optionElement) {
            const totalElement = optionElement.querySelector('.option-total');
            if (totalElement) {
                const calories = parseFloat(totalElement.querySelector('.macro-kcal')?.textContent.replace(/[^\d.]/g, '') || 0);
                const protein = parseFloat(totalElement.querySelector('.macro-proteina')?.textContent.replace(/[^\d.]/g, '') || 0);
                const carbs = parseFloat(totalElement.querySelector('.macro-carboidrato')?.textContent.replace(/[^\d.]/g, '') || 0);
                const fats = parseFloat(totalElement.querySelector('.macro-gordura')?.textContent.replace(/[^\d.]/g, '') || 0);

                totalCalories += calories;
                totalProtein += protein;
                totalCarbs += carbs;
                totalFats += fats;
            }
        }
    });

    // Update display
    updateMacroDisplay('total-calories', Math.round(totalCalories));
    updateMacroDisplay('total-protein', Math.round(totalProtein * 10) / 10);
    updateMacroDisplay('total-carbs', Math.round(totalCarbs * 10) / 10);
    updateMacroDisplay('total-fats', Math.round(totalFats * 10) / 10);

    showNotification('Totais calculados com base nas suas seleções!', 'success');
}

function updateMacroDisplay(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = value;

        // Add animation
        element.style.transform = 'scale(1.1)';
        setTimeout(() => {
            element.style.transform = '';
        }, 200);
    }
}

function resetSelections() {
    // Reset all meal selections to option A
    ['breakfast', 'lunch', 'snack', 'dinner', 'supper'].forEach(meal => {
        openOption(meal, 'A');
    });

    // Clear localStorage
    localStorage.removeItem('selected-plan');
    localStorage.removeItem('favorite-plans');
    localStorage.removeItem('selectedMealOptions');

    // Reset global variables
    selectedPlan = null;
    favoritePlans = [];
    selectedMealOptions = {
        breakfast: 'A',
        lunch: 'A',
        snack: 'A',
        dinner: 'A',
        supper: 'A'
    };

    // Remove selections and highlights
    document.querySelectorAll('.plan-row').forEach(row => {
        row.classList.remove('selected', 'highlighted');
    });

    // Reset favorite buttons
    document.querySelectorAll('.favorite-btn i').forEach(icon => {
        icon.className = 'far fa-heart';
    });

    showNotification('Todas as seleções foram resetadas!', 'info');
}

function updateDailyTotals() {
    // Add visual effect to macro items
    document.querySelectorAll('.macro-item').forEach((item, index) => {
        setTimeout(() => {
            item.style.transform = 'scale(1.05)';
            setTimeout(() => {
                item.style.transform = '';
            }, 200);
        }, index * 100);
    });
}

// ===== NOTIFICATIONS SYSTEM =====
function showNotification(message, type = 'info') {
    // Remove existing notifications
    document.querySelectorAll('.notification').forEach(n => n.remove());

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${getNotificationIcon(type)}"></i>
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;

    document.body.appendChild(notification);

    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);

    // Auto remove after 3 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }
    }, 3000);
}

function getNotificationIcon(type) {
    const icons = {
        'success': 'check-circle',
        'error': 'exclamation-circle',
        'warning': 'exclamation-triangle',
        'info': 'info-circle'
    };
    return icons[type] || 'info-circle';
}

// ===== PDF EXPORT =====
function generatePDF() {
    const exportButton = document.querySelector('.export-button');
    if (!exportButton) return;

    const originalContent = exportButton.innerHTML;
    exportButton.innerHTML = '<span class="tooltip">Gerando...</span><i class="fas fa-spinner fa-spin"></i>';
    exportButton.classList.add('exporting');

    // Hide floating buttons for PDF
    const elementsToHide = document.querySelectorAll('.floating-buttons, .nav-menu, .loading-screen');
    elementsToHide.forEach(el => el.style.display = 'none');

    const element = document.querySelector('.container');
    const options = {
        margin: 1,
        filename: 'minha-dieta-personalizada.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    showNotification('Gerando PDF...', 'info');

    html2pdf().set(options).from(element).save().then(() => {
        // Restore hidden elements
        elementsToHide.forEach(el => el.style.display = '');

        // Restore button
        exportButton.innerHTML = originalContent;
        exportButton.classList.remove('exporting');

        showNotification('PDF gerado com sucesso!', 'success');
    }).catch(() => {
        // Restore on error
        elementsToHide.forEach(el => el.style.display = '');
        exportButton.innerHTML = originalContent;
        exportButton.classList.remove('exporting');

        showNotification('Erro ao gerar PDF', 'error');
    });
}

// ===== DATA PERSISTENCE =====
function loadSavedData() {
    // Load selected meal options
    const savedMealOptions = localStorage.getItem('selectedMealOptions');
    if (savedMealOptions) {
        selectedMealOptions = JSON.parse(savedMealOptions);
    }

    // Load favorite plans
    const savedFavorites = localStorage.getItem('favorite-plans');
    if (savedFavorites) {
        favoritePlans = JSON.parse(savedFavorites);
    }

    // Load selected plan
    const savedPlan = localStorage.getItem('selected-plan');
    if (savedPlan) {
        selectedPlan = parseInt(savedPlan);
    }

    // Apply loaded data
    Object.entries(selectedMealOptions).forEach(([meal, option]) => {
        const savedSelection = localStorage.getItem(`${meal}-selection`);
        if (savedSelection) {
            openOption(meal, savedSelection);
        }
    });

    // Apply favorite plans
    favoritePlans.forEach(planNumber => {
        const favoriteBtn = document.querySelector(`[data-day="${planNumber}"] .favorite-btn i`);
        if (favoriteBtn) {
            favoriteBtn.className = 'fas fa-heart';
        }
    });

    // Apply selected plan
    if (selectedPlan) {
        const selectedRow = document.querySelector(`[data-day="${selectedPlan}"]`);
        if (selectedRow) {
            selectedRow.classList.add('selected');
        }
    }
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    // Initialize core systems
    initTheme();
    initThemeListeners();
    initNavigation();

    // Load saved data
    loadSavedData();

    // Add smooth scrolling to all anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add intersection observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);

    // Observe meal containers
    document.querySelectorAll('.meal-container, .summary').forEach(el => {
        observer.observe(el);
    });

    // Add food item hover effects
    document.querySelectorAll('.food-item').forEach(item => {
        item.addEventListener('mouseenter', () => {
            const macros = item.querySelectorAll('.food-macro');
            macros.forEach((macro, index) => {
                macro.style.transitionDelay = `${index * 50}ms`;
                macro.classList.add('macro-hover');
            });
        });

        item.addEventListener('mouseleave', () => {
            const macros = item.querySelectorAll('.food-macro');
            macros.forEach(macro => {
                macro.style.transitionDelay = '0ms';
                macro.classList.remove('macro-hover');
            });
        });
    });

    // Show welcome message
    setTimeout(() => {
        showNotification('Bem-vindo à sua dieta personalizada! 🍽️', 'success');
    }, 2000);
});

// ===== DYNAMIC STYLES =====
const dynamicStyles = document.createElement('style');
dynamicStyles.textContent = `
    .theme-transition {
        transition: color 0.6s ease, background-color 0.6s ease, border-color 0.6s ease, box-shadow 0.6s ease;
    }

    .theme-toggle-animate {
        animation: spin 0.7s ease-in-out;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }

    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--card-bg);
        border: 1px solid var(--border-color);
        border-radius: var(--border-radius);
        padding: 15px 20px;
        box-shadow: var(--shadow-soft);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 12px;
        min-width: 300px;
        transform: translateX(400px);
        opacity: 0;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .notification.show {
        transform: translateX(0);
        opacity: 1;
    }

    .notification.success {
        border-left: 4px solid var(--accent-color);
    }

    .notification.error {
        border-left: 4px solid #ff4757;
    }

    .notification.warning {
        border-left: 4px solid #ffa502;
    }

    .notification.info {
        border-left: 4px solid var(--primary-color);
    }

    .notification button {
        background: none;
        border: none;
        color: var(--text-color-light);
        cursor: pointer;
        padding: 5px;
        border-radius: 50%;
        transition: all 0.2s ease;
    }

    .notification button:hover {
        background: var(--border-color);
        color: var(--text-color);
    }

    .comparison-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
    }

    .comparison-modal.show {
        opacity: 1;
        visibility: visible;
    }

    .modal-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(5px);
    }

    .modal-content {
        background: var(--card-bg);
        border-radius: var(--card-radius);
        padding: 30px;
        max-width: 800px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
        position: relative;
        z-index: 1;
        box-shadow: var(--shadow-strong);
    }

    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        padding-bottom: 15px;
        border-bottom: 1px solid var(--border-color);
    }

    .modal-close {
        background: none;
        border: none;
        font-size: 20px;
        color: var(--text-color-light);
        cursor: pointer;
        padding: 8px;
        border-radius: 50%;
        transition: all 0.2s ease;
    }

    .modal-close:hover {
        background: var(--border-color);
        color: var(--text-color);
    }

    .comparison-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 15px;
    }

    .comparison-card {
        background: var(--light-color);
        border: 1px solid var(--border-color);
        border-radius: var(--border-radius);
        padding: 15px;
        text-align: center;
        cursor: pointer;
        transition: all 0.3s ease;
    }

    .comparison-card:hover {
        transform: translateY(-5px);
        box-shadow: var(--shadow-soft);
        border-color: var(--primary-color);
    }

    .randomize-effect {
        animation: randomize 1s ease-in-out;
    }

    @keyframes randomize {
        0%, 100% { transform: scale(1); }
        25% { transform: scale(1.02) rotate(1deg); }
        50% { transform: scale(0.98) rotate(-1deg); }
        75% { transform: scale(1.01) rotate(0.5deg); }
    }

    .exporting {
        pointer-events: none;
        opacity: 0.7;
    }

    .macro-hover {
        transform: translateY(-3px) scale(1.05);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    }

    .animate-in {
        animation: slideInUp 0.6s ease-out forwards;
    }

    @keyframes slideInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(dynamicStyles);