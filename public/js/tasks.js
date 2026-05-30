$(function () {

    // Attach CSRF token to every AJAX request automatically
    $.ajaxSetup({
        headers: {
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content'),
            'Accept':        'application/json',
        },
    });

    // ── Add task ──────────────────────────────────────────────────────────────

    $('#add-task-form').on('submit', function (e) {
        e.preventDefault();

        const $input = $('#task-name-input');
        const name   = $input.val().trim();
        if (!name) return;

        $.post('/tasks', { name })
            .done(function (task) {
                prependTask(task);
                $input.val('');
                syncEmptyMessage();
            });
    });

    // ── Toggle done / not-done ────────────────────────────────────────────────

    $('#task-list').on('click', '.toggle-btn', function () {
        const $item = $(this).closest('.task-item');

        $.post('/tasks/' + $item.data('id') + '/toggle')
            .done(function (task) {
                $item
                    .toggleClass('task-pending', !task.is_done)
                    .toggleClass('task-done',    task.is_done)
                    .find('.toggle-btn')
                    .text(task.is_done ? 'Undo' : 'Done');

                syncEmptyMessage();
            });
    });

    // ── Delete task ───────────────────────────────────────────────────────────

    $('#task-list').on('click', '.delete-btn', function () {
        const $item = $(this).closest('.task-item');

        $.ajax({ url: '/tasks/' + $item.data('id'), type: 'DELETE' })
            .done(function () {
                $item.remove();
                syncEmptyMessage();
            });
    });

    // ── Inline edit (double-click task name) ──────────────────────────────────

    $('#task-list').on('dblclick', '.task-name', function () {
        const $span    = $(this);
        const original = $span.text();

        // Replace span with a text input
        const $input = $('<input>')
            .attr({ type: 'text', maxlength: 255, 'aria-label': 'Edit task name' })
            .addClass('task-name-input flex-grow-1')
            .val(original);

        $span.replaceWith($input);
        $input.trigger('focus').select();

        function save() {
            const newName = $input.val().trim();
            if (!newName || newName === original) {
                return cancel();
            }

            $.ajax({ url: '/tasks/' + $input.closest('.task-item').data('id'), type: 'PATCH', data: { name: newName } })
                .done(function (task) {
                    // Use .text() — never .html() — to prevent XSS
                    $input.replaceWith($('<span>').addClass('task-name flex-grow-1').attr('title', 'Double-click to edit').text(task.name));
                });
        }

        function cancel() {
            $input.replaceWith($('<span>').addClass('task-name flex-grow-1').attr('title', 'Double-click to edit').text(original));
        }

        $input.on('keydown', function (e) {
            if (e.key === 'Enter')  { e.preventDefault(); save(); }
            if (e.key === 'Escape') { cancel(); }
        });

        // blur fires after keydown, so use a small delay to let keydown handle Enter/Escape first
        $input.on('blur', function () {
            setTimeout(function () {
                if ($input.closest('body').length) save();
            }, 100);
        });
    });

    // ── Filter ────────────────────────────────────────────────────────────────

    $('[data-filter]').on('click', function () {
        const filterClass = $(this).data('filter'); // '', 'filter-pending', or 'filter-done'

        // Update button states
        $('[data-filter]').attr('aria-pressed', 'false').removeClass('active');
        $(this).attr('aria-pressed', 'true').addClass('active');

        // Swap filter class on the list — CSS rules do the actual hiding
        $('#task-list')
            .removeClass('filter-pending filter-done')
            .addClass(filterClass);

        syncEmptyMessage();
    });

    // Activate "All" button on load
    $('[data-filter=""]').addClass('active').attr('aria-pressed', 'true');

    // ── Empty-state helper ────────────────────────────────────────────────────

    function syncEmptyMessage() {
        const $list    = $('#task-list');
        const hasItems = $list.find('.task-item:visible').length > 0;

        $list.find('#empty-message').remove();

        if (!hasItems) {
            const hasTasks = $list.find('.task-item').length > 0;
            $('<li>')
                .attr('id', 'empty-message')
                .addClass('list-group-item text-center text-muted')
                .text(hasTasks ? 'No tasks match this filter.' : 'No tasks yet. Add one above!')
                .appendTo($list);
        }
    }

    // ── DOM helpers ───────────────────────────────────────────────────────────

    function prependTask(task) {
        $('#empty-message').remove();

        $('<li>')
            .addClass('list-group-item task-item task-pending d-flex align-items-center gap-2')
            .attr('data-id', task.id)
            .append(
                $('<span>').addClass('task-name flex-grow-1').attr('title', 'Double-click to edit').text(task.name),
                $('<button>').attr('type', 'button').addClass('btn btn-sm btn-outline-success toggle-btn').text('Done'),
                $('<button>').attr('type', 'button').addClass('btn btn-sm btn-outline-danger delete-btn').text('Delete')
            )
            .prependTo('#task-list');
    }

});
