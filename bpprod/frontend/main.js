import './style.css';

const API_BASE_URL = 'http://localhost:8000/api';

// ========== ТОКЕНЫ ==========
function getToken() {
    return localStorage.getItem('access_token');
}

function saveTokens(data) {
    localStorage.setItem('access_token', data.access);
    localStorage.setItem('refresh_token', data.refresh);
}

function clearTokens() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
}

function isAuthenticated() {
    return !!getToken();
}

function getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
}

// ========== API ЗАПРОСЫ ==========
async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    const token = getToken();
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, { ...options, headers });

    if (response.status === 401 && token) {
        clearTokens();
        window.location.href = '/login.html';
        throw new Error('Сессия истекла');
    }

    return response;
}

function showMessage(message, type = 'info') {
    const container = document.getElementById('message-container');
    if (!container) return;

    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type === 'success' ? 'success' : type === 'error' ? 'danger' : 'info'}`;
    alertDiv.textContent = message;
    alertDiv.style.marginBottom = '15px';

    container.innerHTML = '';
    container.appendChild(alertDiv);

    setTimeout(() => alertDiv.remove(), 3000);
}

// ========== КАТАЛОГ ==========
async function fetchCatalog(type) {
    const response = await apiRequest(`/${type}/`);
    if (response.ok) {
        return await response.json();
    }
    return [];
}

async function loadCatalog() {
    const [studios, equipment, specialists] = await Promise.all([
        fetchCatalog('studios'),
        fetchCatalog('equipment'),
        fetchCatalog('specialists')
    ]);

    displayItems(studios, 'studios', 'catalog-container');
    displayItems(equipment, 'equipment', 'equipment-container');
    displayItems(specialists, 'specialists', 'specialists-container');
}

function displayItems(items, type, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!items || items.length === 0) {
        container.innerHTML = '<div class="alert alert-info">Нет доступных объектов</div>';
        return;
    }

    const row = document.createElement('div');
    row.className = 'row';

    items.forEach(item => {
        const col = document.createElement('div');
        col.className = 'col-md-6 col-lg-4 mb-4';

        let details = '';
        if (type === 'studios') {
            details = `<p class="text-muted"><i class="bi bi-geo-alt"></i> ${item.address || 'Адрес не указан'}</p>`;
        } else if (type === 'equipment') {
            details = `<p class="text-muted"><i class="bi bi-tag"></i> Тип: ${item.type || 'Не указан'}</p>`;
        } else if (type === 'specialists') {
            details = `<p class="text-muted"><i class="bi bi-briefcase"></i> ${item.specialization || 'Специалист'}</p>`;
            if (item.portfolio) {
                details += `<p><a href="${item.portfolio}" target="_blank" class="btn btn-sm btn-outline-orange">Портфолио</a></p>`;
            }
        }

        col.innerHTML = `
            <div class="card h-100">
                <div class="card-body">
                    <h5 class="card-title">${item.name}</h5>
                    <p class="card-text small text-muted">${item.description || 'Описание отсутствует'}</p>
                    <p class="price-tag">${item.price_per_hour?.toLocaleString() || 0} ₽/час</p>
                    ${details}
                    ${isAuthenticated() ? `
                        <button class="btn btn-orange btn-sm w-100" onclick="bookItem(${item.id}, '${type.slice(0, -1)}')">
                            <i class="bi bi-calendar-plus"></i> Забронировать
                        </button>
                    ` : `
                        <a href="/login.html" class="btn btn-outline-secondary btn-sm w-100">Войдите для бронирования</a>
                    `}
                </div>
            </div>
        `;

        row.appendChild(col);
    });

    container.innerHTML = '';
    container.appendChild(row);
}

// ========== БРОНИРОВАНИЕ ==========
window.bookItem = function(id, type) {
    localStorage.setItem('booking_item_id', id);
    localStorage.setItem('booking_item_type', type);
    window.location.href = '/booking.html';
};

async function loadBookingForm() {
    const typeSelect = document.getElementById('booking-type');
    const itemSelect = document.getElementById('booking-item');
    const dateInput = document.getElementById('booking-date');
    const startTime = document.getElementById('start-time');
    const endTime = document.getElementById('end-time');
    const priceInput = document.getElementById('total-price');

    // Устанавливаем минимальную дату - сегодня
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;

    // Загружаем объекты при выборе типа
    typeSelect.addEventListener('change', async () => {
        const type = typeSelect.value;
        if (!type) {
            itemSelect.disabled = true;
            itemSelect.innerHTML = '<option value="">Сначала выберите тип</option>';
            return;
        }

        itemSelect.disabled = false;
        itemSelect.innerHTML = '<option value="">Загрузка...</option>';

        const items = await fetchCatalog(type + 's');
        itemSelect.innerHTML = '<option value="">Выберите объект</option>';
        items.forEach(item => {
            itemSelect.innerHTML += `<option value="${item.id}" data-price="${item.price_per_hour}">${item.name} - ${item.price_per_hour}₽/час</option>`;
        });
    });

    // Расчет стоимости
  function calculatePrice() {
    const priceInput = document.getElementById('total-price');

    if (!dateInput.value || !startTime.value || !endTime.value || !itemSelect.value) {
        priceInput.value = '';
        return;
    }

    const start = new Date(`${dateInput.value}T${startTime.value}`);
    const end = new Date(`${dateInput.value}T${endTime.value}`);

    // Проверка: время начала не может быть позже времени окончания
    if (start >= end) {
        priceInput.value = 'Ошибка: время начала позже времени окончания';
        priceInput.style.color = '#dc3545';
        return;
    }

    // Восстанавливаем цвет если была ошибка
    priceInput.style.color = '';

    const hours = (end - start) / (1000 * 60 * 60);

    if (hours > 0) {
        const selectedOption = itemSelect.options[itemSelect.selectedIndex];
        const pricePerHour = parseInt(selectedOption.dataset.price) || 0;
        const total = hours * pricePerHour;
        priceInput.value = `${total.toLocaleString()} ₽ (${hours.toFixed(2)} час(ов))`;
    } else {
        priceInput.value = '';
    }
}

    dateInput.addEventListener('change', calculatePrice);
    startTime.addEventListener('change', calculatePrice);
    endTime.addEventListener('change', calculatePrice);
    itemSelect.addEventListener('change', calculatePrice);

    // Отправка формы
    const form = document.getElementById('booking-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const bookingData = {
            [typeSelect.value]: parseInt(itemSelect.value),
            booking_date: dateInput.value,
            start_time: startTime.value + ':00',
            end_time: endTime.value + ':00'
        };

        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Бронирование...';

        try {
            const response = await apiRequest('/bookings/', {
                method: 'POST',
                body: JSON.stringify(bookingData)
            });

            if (response.ok) {
                showMessage('Бронирование создано успешно!', 'success');
                setTimeout(() => {
                    window.location.href = '/profile.html';
                }, 1500);
            } else {
                const error = await response.json();
                showMessage(error.error || 'Ошибка бронирования', 'error');
            }
        } catch (error) {
            showMessage('Ошибка соединения с сервером', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Забронировать';
        }
    });
}

async function loadMyBookings() {
    const container = document.getElementById('bookings-container');
    if (!container) return;

    const response = await apiRequest('/bookings/my/');

    if (!response.ok) {
        container.innerHTML = '<div class="alert alert-danger">Ошибка загрузки бронирований</div>';
        return;
    }

    const bookings = await response.json();

    if (bookings.length === 0) {
        container.innerHTML = `
            <div class="text-center py-5">
                <i class="bi bi-calendar-x display-4 text-muted"></i>
                <p class="mt-3">У вас пока нет бронирований</p>
                <a href="/catalog.html" class="btn btn-orange">Перейти в каталог</a>
            </div>
        `;
        return;
    }

    let statusColors = {
        pending: 'warning',
        confirmed: 'success',
        cancelled: 'danger',
        completed: 'secondary'
    };

    let statusText = {
        pending: 'Ожидает',
        confirmed: 'Подтверждено',
        cancelled: 'Отменено',
        completed: 'Завершено'
    };

    container.innerHTML = `
        <div class="table-responsive">
            <table class="table table-dark">
                <thead>
                    <tr>
                        <th>Объект</th>
                        <th>Дата</th>
                        <th>Время</th>
                        <th>Стоимость</th>
                        <th>Статус</th>
                    </tr>
                </thead>
                <tbody>
                    ${bookings.map(booking => {
                        let itemName = '';
                        if (booking.studio) itemName = `Студия: ${booking.studio_name || booking.studio}`;
                        else if (booking.equipment) itemName = `Оборудование: ${booking.equipment_name || booking.equipment}`;
                        else if (booking.specialist) itemName = `Специалист: ${booking.specialist_name || booking.specialist}`;

                        return `
                            <tr>
                                <td>${itemName}</td>
                                <td>${booking.booking_date}</td>
                                <td>${booking.start_time} - ${booking.end_time}</td>
                                <td>${booking.total_price?.toLocaleString() || 0} ₽</td>
                                <td><span class="badge bg-${statusColors[booking.status] || 'secondary'}">${statusText[booking.status] || booking.status}</span></td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// ========== АВТОРИЗАЦИЯ ==========
async function registerUser(userData) {
    const payload = {
        username: userData.username,
        email: userData.email,
        password: userData.password,
        password2: userData.password,   // ← ЭТО КЛЮЧЕВОЕ ПОЛЕ!
        first_name: userData.first_name || "",
        last_name: userData.last_name || "",
        phone: userData.phone || "",
        is_client: true
    };

    console.log('Отправляем:', payload);  // Проверка в консоли

    const response = await apiRequest('/register/', {
        method: 'POST',
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const error = await response.json();
        console.error('Ошибка:', error);

        // Показываем понятную ошибку пользователю
        if (error.password2) {
            showMessage('Необходимо подтверждение пароля', 'error');
        } else if (error.username) {
            showMessage(`Имя пользователя: ${error.username.join(', ')}`, 'error');
        } else if (error.email) {
            showMessage(`Email: ${error.email.join(', ')}`, 'error');
        } else {
            showMessage('Ошибка регистрации', 'error');
        }
        throw new Error(JSON.stringify(error));
    }

    return await response.json();
}

async function loginUser(credentials) {
    const response = await fetch(`${API_BASE_URL}/token/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
    });

    if (!response.ok) {
        throw new Error('Неверное имя пользователя или пароль');
    }

    const tokenData = await response.json();
    saveTokens(tokenData);

    const userResponse = await apiRequest('/users/me/');
    if (userResponse.ok) {
        const userData = await userResponse.json();
        localStorage.setItem('user', JSON.stringify(userData));
    }
}

window.logout = function() {
    clearTokens();
    showMessage('Вы вышли из системы', 'success');
    setTimeout(() => window.location.href = '/index.html', 1000);
};

function updateNavbar() {
    const authLinks = document.getElementById('auth-links');
    if (!authLinks) return;

    if (isAuthenticated()) {
        const user = getUser();
        const name = user?.username || 'Пользователь';

        authLinks.innerHTML = `
            <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle" href="#" data-bs-toggle="dropdown">
                    <i class="bi bi-person-circle"></i> ${name}
                </a>
                <ul class="dropdown-menu dropdown-menu-end">
                    <li><a class="dropdown-item" href="/catalog.html"><i class="bi bi-grid"></i> Каталог</a></li>
                    <li><a class="dropdown-item" href="/profile.html"><i class="bi bi-person"></i> Профиль</a></li>
                    <li><hr class="dropdown-divider"></li>
                    <li><a class="dropdown-item text-danger" href="#" onclick="logout()"><i class="bi bi-box-arrow-right"></i> Выйти</a></li>
                </ul>
            </li>
        `;
    } else {
        authLinks.innerHTML = `
            <li class="nav-item"><a class="nav-link" href="/login.html">Вход</a></li>
            <li class="nav-item"><a class="nav-link" href="/register.html">Регистрация</a></li>
        `;
    }
}

// ========== ФОРМЫ ==========
function initRegisterForm() {
    const form = document.getElementById('register-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        if (password !== confirmPassword) {
            showMessage('Пароли не совпадают', 'error');
            return;
        }

        if (password.length < 6) {
            showMessage('Пароль должен быть не менее 6 символов', 'error');
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

        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Регистрация...';

        try {
            await registerUser(userData);
            showMessage('Регистрация успешна! Теперь войдите', 'success');
            setTimeout(() => window.location.href = '/login.html', 1500);
        } catch (error) {
            try {
                const err = JSON.parse(error.message);
                showMessage(Object.values(err).flat().join(', '), 'error');
            } catch {
                showMessage('Ошибка регистрации', 'error');
            }
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Зарегистрироваться';
        }
    });
}

function initLoginForm() {
    const form = document.getElementById('login-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Вход...';

        try {
            await loginUser({
                username: document.getElementById('username').value,
                password: document.getElementById('password').value
            });
            showMessage('Вход выполнен!', 'success');
            setTimeout(() => window.location.href = '/index.html', 1000);
        } catch (error) {
            showMessage(error.message, 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Войти';
        }
    });
}

async function initProfilePage() {
    const user = getUser();
    if (user) {
        document.getElementById('user-name').textContent = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username;
        document.getElementById('user-email').textContent = user.email;
        document.getElementById('user-phone').textContent = user.phone || 'Не указан';
    }
    await loadMyBookings();
}

// ========== ЗАПУСК ==========
document.addEventListener('DOMContentLoaded', async () => {
    updateNavbar();

    const path = window.location.pathname;
    const page = path.split('/').pop() || 'index.html';

    if (page === 'catalog.html') {
        await loadCatalog();
    } else if (page === 'register.html') {
        initRegisterForm();
    } else if (page === 'login.html') {
        initLoginForm();
    } else if (page === 'profile.html') {
        if (!isAuthenticated()) {
            window.location.href = '/login.html';
            return;
        }
        await initProfilePage();
    } else if (page === 'booking.html') {
        if (!isAuthenticated()) {
            window.location.href = '/login.html';
            return;
        }
        loadBookingForm();
    }
});