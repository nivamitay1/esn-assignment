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
<body>

<div class="page-wrapper">

    <header class="page-header">
        <h1>My To-Do List</h1>
        <p class="subtitle">Keep track of what needs to be done</p>
    </header>

    {{-- Add task form --}}
    <div class="card-panel">
        <form id="add-task-form">
            <label for="task-name-input" class="visually-hidden">New task name</label>
            <textarea
                id="task-name-input"
                class="task-textarea"
                placeholder="What needs to be done?"
                maxlength="255"
                required
                autocomplete="off"
                rows="3"
            ></textarea>
            <div class="form-footer">
                <span class="hint">Enter to add &nbsp;·&nbsp; Shift+Enter for new line</span>
                <span class="char-counter" data-for="task-name-input">0/255</span>
                <button type="button" id="clear-input-btn" class="btn-clear" aria-label="Clear input">Clear</button>
                <button type="submit" class="btn-add">Add Task</button>
            </div>
        </form>
    </div>

    {{-- Filter bar --}}
    <div class="filter-bar" role="group" aria-label="Filter tasks">
        <button type="button" class="filter-btn active" data-filter="all"     aria-pressed="true">All</button>
        <button type="button" class="filter-btn"        data-filter="pending" aria-pressed="false">Pending</button>
        <button type="button" class="filter-btn"        data-filter="done"    aria-pressed="false">Done</button>
    </div>

    {{-- Task list --}}
    <ul id="task-list">
        @forelse($tasks as $task)
            <li class="task-item {{ $task->is_done ? 'task-done' : 'task-pending' }}" data-id="{{ $task->id }}">
                <span class="task-name">{{ $task->name }}</span>
                <div class="task-actions">
                    <button type="button" class="btn-action btn-edit"   >Edit</button>
                    <button type="button" class="btn-action btn-toggle" >{{ $task->is_done ? 'Undo' : 'Done' }}</button>
                    <button type="button" class="btn-action btn-delete" >Delete</button>
                </div>
            </li>
        @empty
            <li class="empty-message" id="empty-message">No tasks yet. Add one above!</li>
        @endforelse
    </ul>

</div>

{{-- Undo toast --}}
<div id="toast" role="alert" aria-live="polite">
    <span id="toast-msg"></span>
    <button type="button" id="toast-undo">Undo</button>
    <button type="button" id="toast-close" aria-label="Dismiss">&times;</button>
</div>

<script src="{{ asset('js/jquery.min.js') }}?v={{ filemtime(public_path('js/jquery.min.js')) }}"></script>
<script src="{{ asset('js/bootstrap.bundle.min.js') }}?v={{ filemtime(public_path('js/bootstrap.bundle.min.js')) }}"></script>
<script src="{{ asset('js/tasks.js') }}?v={{ filemtime(public_path('js/tasks.js')) }}"></script>
</body>
</html>
