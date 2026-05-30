<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>To-Do List</title>
    <link rel="stylesheet" href="{{ asset('css/bootstrap.min.css') }}?v={{ filemtime(public_path('css/bootstrap.min.css')) }}">
    <link rel="stylesheet" href="{{ asset('css/app.css') }}?v={{ filemtime(public_path('css/app.css')) }}">
</head>
<body class="bg-light">

<div class="container py-5" style="max-width: 640px;">

    <h1 class="mb-4 fw-bold">My To-Do List</h1>

    {{-- Add task form --}}
    <div class="card shadow-sm mb-4">
        <div class="card-body">
            <form id="add-task-form" class="d-flex gap-2">
                <label for="task-name-input" class="visually-hidden">New task name</label>
                <input
                    type="text"
                    id="task-name-input"
                    class="form-control"
                    placeholder="New task…"
                    maxlength="255"
                    required
                    autocomplete="off"
                >
                <button type="submit" class="btn btn-primary text-nowrap">Add Task</button>
            </form>
        </div>
    </div>

    {{-- Filter buttons --}}
    <div class="btn-group mb-3" role="group" aria-label="Filter tasks">
        <button type="button" class="btn btn-outline-secondary"
                data-filter="" aria-pressed="true">All</button>
        <button type="button" class="btn btn-outline-secondary"
                data-filter="filter-pending" aria-pressed="false">Pending</button>
        <button type="button" class="btn btn-outline-secondary"
                data-filter="filter-done" aria-pressed="false">Done</button>
    </div>

    {{-- Task list --}}
    <ul id="task-list" class="list-group shadow-sm">
        @forelse($tasks as $task)
            <li class="list-group-item task-item d-flex align-items-center gap-2 {{ $task->is_done ? 'task-done' : 'task-pending' }}"
                data-id="{{ $task->id }}">
                <span class="task-name flex-grow-1" title="Double-click to edit">{{ $task->name }}</span>
                <button type="button" class="btn btn-sm btn-outline-success toggle-btn">
                    {{ $task->is_done ? 'Undo' : 'Done' }}
                </button>
                <button type="button" class="btn btn-sm btn-outline-danger delete-btn">Delete</button>
            </li>
        @empty
            <li class="list-group-item text-center text-muted" id="empty-message">
                No tasks yet. Add one above!
            </li>
        @endforelse
    </ul>

</div>

<script src="{{ asset('js/jquery.min.js') }}?v={{ filemtime(public_path('js/jquery.min.js')) }}"></script>
<script src="{{ asset('js/bootstrap.bundle.min.js') }}?v={{ filemtime(public_path('js/bootstrap.bundle.min.js')) }}"></script>
<script src="{{ asset('js/tasks.js') }}?v={{ filemtime(public_path('js/tasks.js')) }}"></script>
</body>
</html>
