# ESN – To-Do List

A simple task management application built with Laravel 13, MySQL, Bootstrap 5, and jQuery.

## Tech stack

- **Backend:** Laravel 13 (PHP 8.3)
- **Database:** MySQL 8
- **Frontend:** Bootstrap 5.3 · jQuery 3.7 (served from `public/`, no build step)

## Setup

**1. Clone and install dependencies**
```bash
git clone <repo-url>
cd ESN-assignment
composer install
```

**2. Configure environment**
```bash
cp .env.example .env
php artisan key:generate
```

Edit `.env` and set your database credentials:
```
DB_USERNAME=your_db_user
DB_PASSWORD=your_db_password
```

**3. Create the database and run migrations**
```bash
mysql -u your_db_user -p -e "CREATE DATABASE esn_todo CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
php artisan migrate
```

**4. Start the development server**
```bash
php artisan serve
```

Open [http://localhost:8000](http://localhost:8000).

## Features

| Feature | Notes |
|---|---|
| Add task | AJAX form submission, no page reload |
| Mark done / undo | AJAX toggle |
| Delete task | AJAX with undo toast — 5-second window to cancel the deletion |
| Edit task name | Click Edit to edit inline; click Save to confirm, Escape to cancel |
| Filter tasks | All / Pending / Done with live counts, instant |