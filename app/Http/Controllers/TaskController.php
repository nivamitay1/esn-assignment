<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\TaskRequest;
use App\Models\Task;
use Illuminate\Contracts\View\View;
use Illuminate\Http\JsonResponse;

class TaskController extends Controller
{
    public function index(): View
    {
        $tasks = Task::latest()->get();

        return view('tasks.index', compact('tasks'));
    }

    public function store(TaskRequest $request): JsonResponse
    {
        $task = Task::create($request->validated());

        return response()->json($task, 201);
    }

    public function update(TaskRequest $request, Task $task): JsonResponse
    {
        $task->update($request->validated());

        return response()->json($task);
    }

    public function toggle(Task $task): JsonResponse
    {
        $task->update(['is_done' => ! $task->is_done]);

        return response()->json($task);
    }

    public function destroy(Task $task): JsonResponse
    {
        $task->delete();

        return response()->json(['message' => 'Deleted']);
    }
}
