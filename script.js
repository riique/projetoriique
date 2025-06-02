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

// Adicionar estilos CSS para as novas classes
const styleSheet = document.createElement('style');
styleSheet.textContent = `
    .theme-transition {
        transition: color 0.6s ease, background-color 0.6s ease, border-color 0.6s ease, box-shadow 0.6s ease;
    }
    
    .theme-toggle-animate {
        animation: spin 0.7s ease-in-out;
    }
    
    @keyframes spin {
        0% { transform: rotate(0); }
        100% { transform: rotate(360deg); }
    }
    
    .pdf-hide {
        opacity: 0;
        visibility: hidden;
    }
    
    .exporting {
        pointer-events: none;
        opacity: 0.7;
    }
    
    .success-toast {
        position: fixed;
        bottom: 30px;
        left: 50%;
        transform: translateX(-50%) translateY(20px);
        background: var(--accent-gradient);
        color: white;
        padding: 15px 25px;
        border-radius: 50px;
        box-shadow: 0 10px 30px rgba(var(--accent-color-rgb), 0.4);
        opacity: 0;
        transition: all 0.5s cubic-bezier(0.19, 1, 0.22, 1);
        z-index: 9999;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .success-toast.show {
        transform: translateX(-50%) translateY(0);
        opacity: 1;
    }
    
    .success-toast i {
        font-size: 18px;
    }
    
    .macro-hover {
        transform: translateY(-5px) scale(1.08);
        box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
    }
    
    .page-loaded .meal-container:nth-child(1) { animation-delay: 0.1s; }
    .page-loaded .meal-container:nth-child(2) { animation-delay: 0.2s; }
    .page-loaded .meal-container:nth-child(3) { animation-delay: 0.3s; }
    .page-loaded .meal-container:nth-child(4) { animation-delay: 0.4s; }
    .page-loaded .meal-container:nth-child(5) { animation-delay: 0.5s; }
`;
document.head.appendChild(styleSheet); 