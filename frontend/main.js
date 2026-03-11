// Импорт стилей (ВАЖНО!)
import './style.css';

// ========== КОНФИГУРАЦИЯ ==========
const API_BASE_URL = 'http://127.0.0.1:8000';

// ========== ФУНКЦИИ ДЛЯ РАБОТЫ С СООБЩЕНИЯМИ ==========
function showMessage(message, type = 'info') {
    const container = document.getElementById('message-container');
    if (!container) return;
    
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    alertDiv.style.marginBottom = '15px';
    
    container.innerHTML = '';
    container.appendChild(alertDiv);
    
    // Автоматически скрываем через 3 секунды
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 3000);
}

// ========== ОТОБРАЖЕНИЕ КАТАЛОГА ==========
function renderStudios(studios) {
    const container = document.getElementById('catalog-container');
    if (!container) return;
    
    // Очищаем контейнер
    container.innerHTML = '';
    
    // Создаем ряд для карточек
    const row = document.createElement('div');
    row.className = 'row';
    
    // Добавляем каждую студию
    studios.forEach(studio => {
        const col = document.createElement('div');
        col.className = 'col-md-6 col-lg-4 mb-4';
        
        col.innerHTML = `
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">${studio.name}</h5>
                    <p class="card-text">${studio.description}</p>
                    <p class="price-tag">${studio.price_per_hour.toLocaleString()} ₽/час</p>
                    <p class="text-muted mb-1">
                        <i class="bi bi-geo-alt"></i> ${studio.address}
                    </p>
                    <p class="text-muted mb-0">
                        <small>Владелец: ${studio.owner_username}</small>
                    </p>
                </div>
            </div>
        `;
        
        row.appendChild(col);
    });
    
    container.appendChild(row);
}

async function loadStudios() {
    const container = document.getElementById('catalog-container');
    if (!container) return;

    container.innerHTML = '<p class="text-center py-4">Загрузка студий...</p>';

    try {
        const response = await fetch(`${API_BASE_URL}/api/studios/`);
        if (!response.ok) {
            throw new Error(`Ошибка загрузки: ${response.status}`);
        }
        const data = await response.json();
        if (!Array.isArray(data) || data.length === 0) {
            container.innerHTML = '<p class="text-center py-4">Пока нет ни одной студии.</p>';
            return;
        }
        renderStudios(data);
    } catch (error) {
        console.error('Ошибка при загрузке студий:', error);
        container.innerHTML = '<p class="text-center text-danger py-4">Не удалось загрузить студии. Проверьте работу backend.</p>';
    }
}

// ========== ФУНКЦИИ АВТОРИЗАЦИИ ==========
async function registerUser(userData) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/users/register/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });

        if (!response.ok) {
            let errorMessage = 'Ошибка регистрации';
            try {
                const errorData = await response.json();
                if (errorData.username && errorData.username[0]) {
                    errorMessage = errorData.username[0];
                } else if (errorData.email && errorData.email[0]) {
                    errorMessage = errorData.email[0];
                }
            } catch {
                // ignore json parse errors and use default message
            }
            showMessage(errorMessage, 'danger');
            return;
        }

        const data = await response.json();
        console.log('Успешная регистрация:', data);
        showMessage('Регистрация прошла успешно!', 'success');

        setTimeout(() => {
            window.location.href = '/login.html';
        }, 1500);
    } catch (error) {
        console.error('Ошибка при запросе регистрации:', error);
        showMessage('Сервер недоступен. Проверьте, запущен ли backend.', 'danger');
    }
}

async function loginUser(credentials) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/token/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
        });

        if (!response.ok) {
            let errorMessage = 'Ошибка входа. Проверьте логин и пароль.';
            try {
                const errorData = await response.json();
                if (errorData.detail) {
                    errorMessage = errorData.detail;
                }
            } catch {
                // ignore json parse errors
            }
            showMessage(errorMessage, 'danger');
            return;
        }

        const data = await response.json();
        localStorage.setItem('token', data.access);
        if (data.refresh) {
            localStorage.setItem('refreshToken', data.refresh);
        }
        localStorage.setItem('username', credentials.username);

        showMessage('Вход выполнен успешно!', 'success');

        setTimeout(() => {
            window.location.href = '/index.html';
        }, 1500);
    } catch (error) {
        console.error('Ошибка при запросе входа:', error);
        showMessage('Сервер недоступен. Проверьте, запущен ли backend.', 'danger');
    }
}

// ========== ВЫХОД ИЗ СИСТЕМЫ ==========
window.logout = function() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('demo_user');
    showMessage('Вы вышли из системы', 'info');
    
    setTimeout(() => {
        window.location.href = '/index.html';
    }, 1000);
};

// ========== ОБНОВЛЕНИЕ НАВБАРА ==========
function updateNavbar() {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    const authLinks = document.getElementById('auth-links');
    
    if (authLinks) {
        if (token) {
            authLinks.innerHTML = `
                <span class="nav-link text-orange">
                    <i class="bi bi-person-circle"></i> ${username || 'Пользователь'}
                </span>
                <a class="nav-link" href="#" onclick="logout(); return false;">
                    <i class="bi bi-box-arrow-right"></i> Выйти
                </a>
            `;
        } else {
            authLinks.innerHTML = `
                <a class="nav-link" href="/login.html">
                    <i class="bi bi-box-arrow-in-right"></i> Вход
                </a>
                <a class="nav-link" href="/register.html">
                    <i class="bi bi-person-plus"></i> Регистрация
                </a>
            `;
        }
    }
}

// ========== ИНИЦИАЛИЗАЦИЯ ФОРМ ==========
function initRegisterForm() {
    const form = document.getElementById('register-form');
    if (!form) return;
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        
        if (password !== confirmPassword) {
            showMessage('Пароли не совпадают', 'danger');
            return;
        }
        
        if (password.length < 6) {
            showMessage('Пароль должен быть не менее 6 символов', 'danger');
            return;
        }
        
        const userData = {
            username: document.getElementById('username').value,
            email: document.getElementById('email').value,
            password: password,
            first_name: document.getElementById('first-name').value,
            last_name: document.getElementById('last-name').value,
            phone: document.getElementById('phone').value
        };
        
        registerUser(userData);
    });
}

function initLoginForm() {
    const form = document.getElementById('login-form');
    if (!form) return;
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const credentials = {
            username: document.getElementById('username').value,
            password: document.getElementById('password').value
        };
        
        loginUser(credentials);
    });
}

// ========== ЗАГРУЗКА ПРИ ОТКРЫТИИ СТРАНИЦЫ ==========
document.addEventListener('DOMContentLoaded', () => {
    console.log('Страница загружена');
    
    // Обновляем навбар
    updateNavbar();
    
    // Определяем текущую страницу
    const path = window.location.pathname;
    const page = path.split('/').pop() || 'index.html';
    
    console.log('Текущая страница:', page);
    
    // Загружаем каталог если нужно
    if (page === 'catalog.html') {
        loadStudios();
    }
    
    // Инициализируем формы
    if (page === 'register.html') {
        initRegisterForm();
    }
    
    if (page === 'login.html') {
        initLoginForm();
    }
});