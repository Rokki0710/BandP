// Импорт стилей (ВАЖНО!)
import './style.css';

// ========== КОНФИГУРАЦИЯ ==========
const API_BASE_URL = 'http://127.0.0.1:8000';

// ========== МОК-ДАННЫЕ ДЛЯ КАТАЛОГА ==========
const mockStudios = [
    {
        id: 1,
        name: "Студия 'Свет'",
        description: "Профессиональная фотостудия с естественным светом. Полный комплект оборудования.",
        price_per_hour: 1500,
        address: "ул. Пушкина, 10",
        owner_username: "photo_pro"
    },
    {
        id: 2,
        name: "Лофт #1",
        description: "Просторное помещение в стиле лофт. Идеально для фото и видео съемок.",
        price_per_hour: 2000,
        address: "пр. Ленина, 25",
        owner_username: "loft_master"
    },
    {
        id: 3,
        name: "Видеостудия Pro",
        description: "Профессиональная видеостудия с хромакеем и профессиональным светом.",
        price_per_hour: 2500,
        address: "ул. Кирова, 5",
        owner_username: "video_pro"
    },
    {
        id: 4,
        name: "Минимал",
        description: "Небольшая уютная студия для портретной съемки.",
        price_per_hour: 1000,
        address: "ул. Советская, 15",
        owner_username: "minimal_photo"
    },
    {
        id: 5,
        name: "Интерьерная студия",
        description: "Студия с интерьерными зонами для предметной съемки.",
        price_per_hour: 1800,
        address: "пр. Мира, 30",
        owner_username: "interior_pro"
    },
    {
        id: 6,
        name: "Премиум Лофт",
        description: "Элитная студия с профессиональным оборудованием премиум-класса.",
        price_per_hour: 3500,
        address: "ул. Набережная, 5",
        owner_username: "premium_pro"
    }
];

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
function displayStudios() {
    const container = document.getElementById('catalog-container');
    if (!container) return;
    
    // Очищаем контейнер
    container.innerHTML = '';
    
    // Создаем ряд для карточек
    const row = document.createElement('div');
    row.className = 'row';
    
    // Добавляем каждую студию
    mockStudios.forEach(studio => {
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

// ========== ФУНКЦИИ АВТОРИЗАЦИИ ==========
async function registerUser(userData) {
    console.log('Регистрация:', userData);
    showMessage('Регистрация прошла успешно!', 'success');
    
    // Сохраняем данные в localStorage для демо
    localStorage.setItem('demo_user', JSON.stringify(userData));
    
    setTimeout(() => {
        window.location.href = '/login.html';
    }, 1500);
}

async function loginUser(credentials) {
    console.log('Вход:', credentials);
    
    // Для демо просто сохраняем токен
    localStorage.setItem('token', 'demo-token-123');
    localStorage.setItem('username', credentials.username);
    
    showMessage('Вход выполнен успешно!', 'success');
    
    setTimeout(() => {
        window.location.href = '/index.html';
    }, 1500);
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
        displayStudios();
    }
    
    // Инициализируем формы
    if (page === 'register.html') {
        initRegisterForm();
    }
    
    if (page === 'login.html') {
        initLoginForm();
    }
});