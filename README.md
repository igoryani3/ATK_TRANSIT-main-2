# ATK Transit CRM

Система управления рейсами для транспортной компании.

## Технологии

- **Backend**: Flask + SQLAlchemy
- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **Database**: SQLite (для разработки)

## Установка и запуск

### Быстрый старт (Windows)

Просто запустите:
```bash
start_dev.bat
```

Этот скрипт автоматически:
- Установит зависимости Python и Node.js
<<<<<<< HEAD
- Запустит Flask backend на http://localhost:5555
- Запустит Next.js frontend на http://localhost:3333
=======
- Запустит Flask backend на http://localhost:5000
- Запустит Next.js frontend на http://localhost:3000
>>>>>>> dd8253c808e8aa07b5293422ac7cd77a72602389

### Вход в систему

```
Логин: dispatcher
Пароль: dispatcher123
```

### Ручной запуск

#### Backend (Flask)
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

#### Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev
```

## Структура проекта

```
ATK_TRANSIT/
├── backend/
│   ├── app.py              # Главный файл Flask приложения
│   ├── config.py           # Конфигурация
│   ├── models.py           # Модели базы данных
│   ├── routes/
│   │   ├── auth.py         # Авторизация
│   │   ├── trips.py        # API рейсов
│   │   └── references.py   # API справочников
│   └── requirements.txt    # Python зависимости
│
├── frontend/
│   ├── app/
│   │   ├── login/page.tsx       # Страница входа
│   │   ├── dashboard/page.tsx   # Главная страница с рейсами
│   │   └── layout.tsx           # Layout приложения
│   ├── components/
│   │   └── TripForm.tsx         # Форма создания/редактирования рейса
│   ├── lib/
│   │   ├── api.ts               # API клиент
│   │   └── types.ts             # TypeScript типы
│   └── package.json
│
└── start_dev.bat           # Скрипт запуска для Windows
```

## Функционал

### Реализовано

✅ Авторизация диспетчера  
✅ Создание рейсов с автоматической генерацией номера  
✅ Редактирование рейсов  
✅ Удаление рейсов  
✅ Просмотр списка рейсов в таблице  
✅ Справочники: водители, машины, клиенты, маршруты  
✅ Темно-синяя минималистичная тема  

### Поля рейса

1. Номер рейса (автогенерация)
2. Север/Юг
3. Договор
4. Заказчик (ЮЛ)
5. Направление
6. Тип
7. Количество человек
8. Утро/Вечер
9. Подача
10. Выезд
11. Начало маршрута
12. Промежуточные точки
13. Окончание маршрута
14. Тип рейса
15. Исполнитель
16. Гос. номер
17. Водитель
18. Номер водителя
19. Цена без НДС
20. Цена с НДС

## База данных

SQLite база данных создается автоматически при первом запуске.

**Таблицы:**
- `users` - пользователи системы
- `trips` - рейсы
- `drivers` - водители
- `vehicles` - транспортные средства
- `clients` - клиенты (юридические лица)
- `routes` - маршруты

## API Endpoints

### Авторизация
- `POST /api/auth/login` - Вход
- `POST /api/auth/logout` - Выход
- `GET /api/auth/check` - Проверка сессии

### Рейсы
- `GET /api/trips` - Список всех рейсов
- `GET /api/trips/:id` - Детали рейса
- `POST /api/trips` - Создать рейс
- `PUT /api/trips/:id` - Обновить рейс
- `DELETE /api/trips/:id` - Удалить рейс

### Справочники
- `GET/POST /api/drivers` - Водители
- `GET/POST /api/vehicles` - Машины
- `GET/POST /api/clients` - Клиенты
- `GET/POST /api/routes` - Маршруты

## Дальнейшее развитие

- Добавление интерфейса управления справочниками
- Фильтрация и поиск рейсов
- Экспорт данных в Excel
- Печать путевых листов
- Статистика и аналитика
- Мобильная адаптация
"# ATK_TRANSIT" 
"# ATK_TRANSIT" 
