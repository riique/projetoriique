// ===== GLOBAL VARIABLES =====
let selectedMealOptions = {
    breakfast: 'A',
    lunch: 'A',
    snack: 'A',
    dinner: 'A',
    supper: 'A'
};


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

        // Update meal header macros with the selected option's values
        updateMealHeaderMacros(mealType, selectedContent);
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
    calculateDailyTotals();

    // Show feedback (only for manual selections, not automatic ones)
    if (!window.isAutomaticSelection) {
        const optionName = selectedTab?.querySelector('.option-name')?.textContent || `Opção ${option}`;
        showNotification(`${optionName} selecionada!`, 'success');
    }
}

function updateMealHeaderMacros(mealType, selectedContent) {
    const totalElement = selectedContent.querySelector('.option-total');
    if (totalElement) {
        const calories = totalElement.querySelector('.macro-kcal')?.textContent || '0 kcal';
        const protein = totalElement.querySelector('.macro-proteina')?.textContent || '0g Proteína';
        const carbs = totalElement.querySelector('.macro-carboidrato')?.textContent || '0g Carboidrato';
        const fats = totalElement.querySelector('.macro-gordura')?.textContent || '0g Gordura';

        // Update header badges
        const mealContainer = document.getElementById(mealType);
        if (mealContainer) {
            const caloriesBadge = mealContainer.querySelector('.macro-badge.calories span');
            const proteinBadge = mealContainer.querySelector('.macro-badge.protein span');
            const carbBadge = mealContainer.querySelector('.macro-badge.carb span');
            const fatBadge = mealContainer.querySelector('.macro-badge.fat span');

            if (caloriesBadge) {
                caloriesBadge.textContent = calories;
                animateBadge(caloriesBadge.parentElement);
            }
            if (proteinBadge) {
                proteinBadge.textContent = protein.replace('Proteína', 'P');
                animateBadge(proteinBadge.parentElement);
            }
            if (carbBadge) {
                carbBadge.textContent = carbs.replace('Carboidrato', 'C');
                animateBadge(carbBadge.parentElement);
            }
            if (fatBadge) {
                fatBadge.textContent = fats.replace('Gordura', 'G');
                animateBadge(fatBadge.parentElement);
            }
        }
    }
}

function animateBadge(badge) {
    badge.style.transform = 'scale(1.1)';
    badge.style.background = 'rgba(255, 255, 255, 0.3)';
    setTimeout(() => {
        badge.style.transform = '';
        badge.style.background = '';
    }, 300);
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



// ===== PLAN SELECTION SYSTEM =====
function selectPlan(planNumber) {
    // Remove previous selections
    document.querySelectorAll('.plan-row').forEach(row => {
        row.classList.remove('selected');
        row.querySelector('.select-btn i').className = 'fas fa-check';
    });

    // Add selection to clicked row
    const selectedRow = document.querySelector(`[data-day="${planNumber}"]`);
    if (selectedRow) {
        selectedRow.classList.add('selected');
        selectedRow.querySelector('.select-btn i').className = 'fas fa-check-circle';
        selectedPlan = planNumber;

        // Save selection
        localStorage.setItem('selected-plan', planNumber);

        // Get plan macros from the table
        const calories = selectedRow.getAttribute('data-calories') || selectedRow.querySelector('.macro-value.calories').textContent.replace(/[^\d]/g, '');
        const protein = selectedRow.getAttribute('data-protein') || selectedRow.querySelector('.macro-value.protein').textContent.replace(/[^\d.,]/g, '');
        const carbs = selectedRow.getAttribute('data-carbs') || selectedRow.querySelector('.macro-value.carb').textContent.replace(/[^\d.,]/g, '');
        const fats = selectedRow.getAttribute('data-fats') || selectedRow.querySelector('.macro-value.fat').textContent.replace(/[^\d.,]/g, '');

        // Update the summary tabs with plan values
        updateSummaryTabs(calories, protein, carbs, fats);

        // Show success message with plan details
        const planLabel = selectedRow.querySelector('.day-label').textContent;
        showNotification(`${planLabel} selecionado! Totais atualizados: ${calories} kcal`, 'success');

        // Scroll to summary section to show the updated tabs
        setTimeout(() => {
            scrollToSection('summary');
        }, 300);

        // Don't auto-update meal options - let user select individually
        // Just highlight the plan for reference and update summary
    }
}

function updateSummaryTabs(calories, protein, carbs, fats) {
    // Update the main summary tabs
    const caloriesElement = document.getElementById('total-calories');
    const proteinElement = document.getElementById('total-protein');
    const carbsElement = document.getElementById('total-carbs');
    const fatsElement = document.getElementById('total-fats');

    if (caloriesElement) {
        caloriesElement.textContent = formatNumber(calories);
        animateSummaryTab(caloriesElement.closest('.macro-item'));
    }

    if (proteinElement) {
        proteinElement.textContent = formatNumber(protein);
        animateSummaryTab(proteinElement.closest('.macro-item'));
    }

    if (carbsElement) {
        carbsElement.textContent = formatNumber(carbs);
        animateSummaryTab(carbsElement.closest('.macro-item'));
    }

    if (fatsElement) {
        fatsElement.textContent = formatNumber(fats);
        animateSummaryTab(fatsElement.closest('.macro-item'));
    }

    // Update progress bars based on the new values
    updateProgressBars(parseFloat(calories), parseFloat(protein), parseFloat(carbs), parseFloat(fats));
}

function formatNumber(value) {
    const num = parseFloat(value);
    return num % 1 === 0 ? num.toString() : num.toFixed(1);
}

function animateSummaryTab(tabElement) {
    if (tabElement) {
        // Add updating class for animation
        tabElement.classList.add('updating');

        // Remove the class after animation completes
        setTimeout(() => {
            tabElement.classList.remove('updating');
        }, 600);
    }
}

function updateMealOptionsFromPlan(planNumber) {
    const planRow = document.querySelector(`[data-day="${planNumber}"]`);
    if (planRow) {
        try {
            // Get plan data from data attribute
            const planData = JSON.parse(planRow.getAttribute('data-plan'));

            // Update each meal option with animation
            Object.entries(planData).forEach(([meal, option], index) => {
                setTimeout(() => {
                    if (option && document.getElementById(`${meal}-${option}`)) {
                        openOption(meal, option);

                        // Add visual feedback
                        const mealContainer = document.getElementById(meal);
                        if (mealContainer) {
                            mealContainer.style.transform = 'scale(1.02)';
                            mealContainer.style.boxShadow = '0 8px 25px rgba(var(--accent-color-rgb), 0.15)';

                            setTimeout(() => {
                                mealContainer.style.transform = '';
                                mealContainer.style.boxShadow = '';
                            }, 500);
                        }
                    }
                }, index * 200);
            });

            // Update global selection state
            selectedMealOptions = { ...planData };
            localStorage.setItem('selectedMealOptions', JSON.stringify(selectedMealOptions));

            // Calculate and update totals after all options are set
            setTimeout(() => {
                calculateDailyTotals();
            }, Object.keys(planData).length * 200 + 500);

        } catch (error) {
            console.error('Error parsing plan data:', error);
            showNotification('Erro ao aplicar o plano selecionado', 'error');
        }
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
        if (optionElement && optionElement.classList.contains('active')) {
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

    // Update display with animation
    updateMacroDisplay('total-calories', Math.round(totalCalories));
    updateMacroDisplay('total-protein', Math.round(totalProtein * 10) / 10);
    updateMacroDisplay('total-carbs', Math.round(totalCarbs * 10) / 10);
    updateMacroDisplay('total-fats', Math.round(totalFats * 10) / 10);

    // Update progress bars
    updateProgressBars(totalCalories, totalProtein, totalCarbs, totalFats);

    // Update summary section if it exists
    updateSummarySection(totalCalories, totalProtein, totalCarbs, totalFats);
}

function updateProgressBars(calories, protein, carbs, fats) {
    // Define targets (these could be made configurable)
    const targets = {
        calories: 1700,
        protein: 150,
        carbs: 170,
        fats: 50
    };

    // Update progress bars
    updateProgressBar('calories', calories, targets.calories);
    updateProgressBar('protein', protein, targets.protein);
    updateProgressBar('carb', carbs, targets.carbs);
    updateProgressBar('fat', fats, targets.fats);
}

function updateProgressBar(type, current, target) {
    const macroItem = document.querySelector(`[data-macro="${type}"]`);
    if (macroItem) {
        const progressFill = macroItem.querySelector('.progress-fill');
        const progressText = macroItem.querySelector('.progress-text');

        if (progressFill && progressText) {
            const percentage = Math.min((current / target) * 100, 100);
            progressFill.style.width = `${percentage}%`;
            progressText.textContent = `${Math.round(percentage)}% da meta`;

            // Add color coding
            progressFill.className = 'progress-fill';
            if (percentage >= 90) {
                progressFill.classList.add('excellent');
            } else if (percentage >= 70) {
                progressFill.classList.add('good');
            } else if (percentage >= 50) {
                progressFill.classList.add('fair');
            } else {
                progressFill.classList.add('low');
            }
        }
    }
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
    localStorage.removeItem('selectedMealOptions');

    // Reset global variables
    selectedPlan = null;
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

    showNotification('Todas as seleções foram resetadas!', 'info');
}

function updateSummarySection(calories, protein, carbs, fats) {
    // Update summary section if it exists
    const summarySection = document.querySelector('.summary');
    if (summarySection) {
        const summaryCalories = summarySection.querySelector('[data-summary="calories"]');
        const summaryProtein = summarySection.querySelector('[data-summary="protein"]');
        const summaryCarbs = summarySection.querySelector('[data-summary="carbs"]');
        const summaryFats = summarySection.querySelector('[data-summary="fats"]');

        if (summaryCalories) summaryCalories.textContent = `${Math.round(calories)} kcal`;
        if (summaryProtein) summaryProtein.textContent = `${Math.round(protein * 10) / 10}g`;
        if (summaryCarbs) summaryCarbs.textContent = `${Math.round(carbs * 10) / 10}g`;
        if (summaryFats) summaryFats.textContent = `${Math.round(fats * 10) / 10}g`;

        // Add visual effect to summary items
        summarySection.querySelectorAll('.macro-item').forEach((item, index) => {
            setTimeout(() => {
                item.style.transform = 'scale(1.05)';
                setTimeout(() => {
                    item.style.transform = '';
                }, 200);
            }, index * 100);
        });
    }
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



// ===== DATA PERSISTENCE =====
function loadSavedData() {
    // Load selected meal options
    const savedMealOptions = localStorage.getItem('selectedMealOptions');
    if (savedMealOptions) {
        selectedMealOptions = JSON.parse(savedMealOptions);
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



    // Apply selected plan
    if (selectedPlan) {
        const selectedRow = document.querySelector(`[data-day="${selectedPlan}"]`);
        if (selectedRow) {
            selectedRow.classList.add('selected');
        }
    }
}

// ===== NAVIGATION HELPERS =====
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// ===== TABLE INTERACTION =====
function initializeTableInteraction() {
    // Add click handlers to table rows
    document.querySelectorAll('.plan-row').forEach(row => {
        row.addEventListener('click', function(e) {
            // Don't trigger if clicking on buttons
            if (e.target.closest('.action-btn')) {
                return;
            }

            const planNumber = parseInt(this.getAttribute('data-day'));
            selectPlan(planNumber);
        });
    });
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    // Initialize core systems
    initNavigation();

    // Initialize table interaction
    initializeTableInteraction();

    // Load saved data
    loadSavedData();

    // Load saved plan selection (just highlight, don't auto-apply)
    const savedPlan = localStorage.getItem('selected-plan');
    if (savedPlan) {
        setTimeout(() => {
            // Just highlight the saved plan without applying it
            const savedRow = document.querySelector(`[data-day="${savedPlan}"]`);
            if (savedRow) {
                savedRow.classList.add('selected');
                savedRow.querySelector('.select-btn i').className = 'fas fa-check-circle';
            }
        }, 500);
    }

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