$(function () {

    // X-CSRF-TOKEN: required by Laravel for all non-GET requests.
    // Accept: application/json: tells Laravel to return JSON error responses
    //   instead of HTML redirects (e.g. 422 validation errors, 419 CSRF errors).
    $.ajaxSetup({
        headers: {
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content'),
            'Accept': 'application/json',
        },
    });

    // ── State ─────────────────────────────────────────────────────────────────

    let currentFilter  = 'all';
    let toastTimer     = null;
    let pendingDelete  = null; // { $item, id }

    // ── Add task ──────────────────────────────────────────────────────────────

    $('#task-name-input').on('keydown', function (e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            $('#add-task-form').trigger('submit');
        }
    });

    $('#add-task-form').on('submit', function (e) {
        e.preventDefault();
        const $input = $('#task-name-input');
        const name = $input.val().trim();
        if (!name) return;

        $.post('/tasks', { name }).done(function (task) {
            prependTask(task);
            $input.val('').trigger('input').trigger('focus');
            syncAll();
        });
    });

    // ── Toggle done / not-done ────────────────────────────────────────────────

    $('#task-list').on('click', '.btn-toggle', function () {
        const $item = $(this).closest('.task-item');

        $.post('/tasks/' + $item.data('id') + '/toggle').done(function (task) {
            $item
                .toggleClass('task-pending', !task.is_done)
                .toggleClass('task-done',    task.is_done)
                .find('.btn-toggle')
                .text(task.is_done ? 'Undo' : 'Done');

            // Move done tasks to bottom, pending to top
            if (task.is_done) {
                $item.appendTo('#task-list');
            } else {
                $item.prependTo('#task-list');
            }

            syncAll();
        });
    });

    // ── Delete task (with undo) ───────────────────────────────────────────────
    // The actual DELETE request is deferred by 5 seconds so the user can undo.
    // The item is hidden visually (task-leaving) immediately for instant feedback,
    // but stays in the DOM until the timer fires or the user dismisses the toast.

    $('#task-list').on('click', '.btn-delete', function () {
        const $item = $(this).closest('.task-item');

        // Only one pending delete at a time — commit the previous one immediately.
        if (pendingDelete) commitDelete();

        pendingDelete = { $item, id: $item.data('id') };

        $item.addClass('task-leaving');
        syncAll();

        showToast('Task deleted', function undo() {
            pendingDelete = null;
            $item.removeClass('task-leaving');
            syncAll();
        });

        toastTimer = setTimeout(function () {
            commitDelete();
        }, 5000);
    });

    function commitDelete() {
        if (!pendingDelete) return;
        const { $item, id } = pendingDelete;
        pendingDelete = null;
        $.ajax({ url: '/tasks/' + id, type: 'DELETE' }).done(function () {
            $item.remove();
            syncAll();
        });
        hideToast();
    }

    // ── Inline edit ───────────────────────────────────────────────────────────

    $('#task-list').on('click', '.btn-edit', function () {
        const $item    = $(this).closest('.task-item');
        const $span    = $item.find('.task-name');
        const original = $span.text().trim();
        const $editBtn = $(this).text('Save').off('click');

        const $input = $('<textarea>')
            .attr({ maxlength: 255, 'aria-label': 'Edit task name', rows: 3 })
            .addClass('task-name-input')
            .val(original);

        const $counter = $('<span>').addClass('char-counter');
        bindCounter($input, $counter);

        $span.replaceWith($('<div>').addClass('task-edit-wrap').append($input, $counter));
        $input.trigger('focus').select();

        function finish() { $editBtn.text('Edit').off('click'); }

        function save() {
            const newName = $input.val().trim();
            if (!newName || newName === original) return cancel();

            $.ajax({ url: '/tasks/' + $item.data('id'), type: 'PATCH', data: { name: newName } })
                .done(function (task) {
                    $item.find('.task-edit-wrap').replaceWith($('<span>').addClass('task-name').text(task.name));
                    finish();
                });
        }

        function cancel() {
            $item.find('.task-edit-wrap').replaceWith($('<span>').addClass('task-name').text(original));
            finish();
        }

        $editBtn.on('click', save);
        $input.on('keydown', function (e) {
            if (e.key === 'Escape') cancel();
        });
    });

    // ── Filter ────────────────────────────────────────────────────────────────

    $('[data-filter]').on('click', function () {
        currentFilter = $(this).data('filter');
        $('[data-filter]').attr('aria-pressed', 'false').removeClass('active');
        $(this).attr('aria-pressed', 'true').addClass('active');
        applyFilter();
    });

    function applyFilter() {
        $('#task-list .task-item').each(function () {
            if ($(this).hasClass('task-leaving')) return; // skip pending-delete items
            const isDone = $(this).hasClass('task-done');
            const show = currentFilter === 'all'
                      || (currentFilter === 'done'    &&  isDone)
                      || (currentFilter === 'pending' && !isDone);
            $(this).toggle(show);
        });
        syncEmptyMessage();
    }

    // ── Sync helpers ──────────────────────────────────────────────────────────

    function syncAll() {
        applyFilter();
        updateFilterBadges();
    }

    function updateFilterBadges() {
        const $items   = $('#task-list .task-item:not(.task-leaving)');
        const total    = $items.length;
        const done     = $items.filter('.task-done').length;
        const pending  = total - done;

        $('[data-filter="all"]').text('All (' + total + ')');
        $('[data-filter="pending"]').text('Pending (' + pending + ')');
        $('[data-filter="done"]').text('Done (' + done + ')');
    }

    function syncEmptyMessage() {
        const $list = $('#task-list');
        $list.find('#empty-message').remove();

        if (!$list.find('.task-item:visible').length) {
            const msg = $list.find('.task-item:not(.task-leaving)').length
                ? 'No tasks match this filter.'
                : 'No tasks yet. Add one above!';
            $('<li>').attr('id', 'empty-message').addClass('empty-message').text(msg).appendTo($list);
        }
    }

    // ── Toast ─────────────────────────────────────────────────────────────────

    function showToast(msg, onUndo) {
        clearTimeout(toastTimer);
        $('#toast-msg').text(msg);
        $('#toast').addClass('visible');

        $('#toast-undo').off('click').on('click', function () {
            clearTimeout(toastTimer);
            pendingDelete = null;
            onUndo();
            hideToast();
        });

        $('#toast-close').off('click').on('click', function () {
            clearTimeout(toastTimer);
            commitDelete();
            hideToast();
        });
    }

    function hideToast() {
        $('#toast').removeClass('visible');
    }

    // ── Character counter ─────────────────────────────────────────────────────

    function bindCounter($textarea, $counter) {
        const max = parseInt($textarea.attr('maxlength'), 10);
        function update() {
            const len = $textarea.val().length;
            $counter.text(len + '/' + max)
                .toggleClass('warning', len >= max - 40 && len < max - 15)
                .toggleClass('danger',  len >= max - 15);
        }
        $textarea.on('input', update);
        update();
    }

    bindCounter($('#task-name-input'), $('[data-for="task-name-input"]'));

    $('#clear-input-btn').on('click', function () {
        $('#task-name-input').val('').trigger('input').trigger('focus');
    });

    // ── DOM builder ───────────────────────────────────────────────────────────

    function prependTask(task) {
        $('#empty-message').remove();

        const $actions = $('<div>').addClass('task-actions').append(
            $('<button>').attr('type', 'button').addClass('btn-action btn-edit').text('Edit'),
            $('<button>').attr('type', 'button').addClass('btn-action btn-toggle').text('Done'),
            $('<button>').attr('type', 'button').addClass('btn-action btn-delete').text('Delete')
        );

        // .text() is used intentionally — it escapes HTML and prevents XSS.
        $('<li>')
            .addClass('task-item task-pending')
            .attr('data-id', task.id)
            .append($('<span>').addClass('task-name').text(task.name), $actions)
            .prependTo('#task-list');
    }

    // ── Init ──────────────────────────────────────────────────────────────────

    updateFilterBadges();

});
