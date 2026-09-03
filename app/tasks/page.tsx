'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { api, ApiError } from '@/lib/api';

interface Task {
  id: number;
  title: string;
  description?: string | null;
  status: string;
  priority: string;
}

export default function TasksPage() {
     const { user, signOut } = useAuth();

  const [tasks, setTasks] = useState<Task[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState('');
const [status, setStatus] = useState('');

const [title, setTitle] = useState('');
const [description, setDescription] = useState('');
const [taskStatus, setTaskStatus] = useState('todo');

const [priority, setPriority] = useState('1');
const [projectId, setProjectId] = useState('');

const [formError, setFormError] = useState('');
const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
const [creating, setCreating] = useState(false);

  useEffect(() => {
    async function loadTasks() {
      try {
        setLoading(true);
        setError('');

        const path = status
          ? `/tasks?status=${status}`
          : '/tasks';

        const data = await api<Task[]>(path);

        setTasks(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load tasks',
        );
      } finally {
        setLoading(false);
      }
    }

    loadTasks();
  }, [status]);
  async function handleCreateTask(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();

  setFormError('');
  setFieldErrors({});

  const errors: Record<string, string> = {};

  if (!title.trim()) {
    errors.title = 'Title is required';
  } else if (title.trim().length < 3) {
    errors.title = 'Title must be at least 3 characters';
  }

  if (!priority) {
    errors.priority = 'Priority is required';
  }

  if (!projectId) {
    errors.projectId = 'Project ID is required';
  }

  if (Object.keys(errors).length > 0) {
    setFieldErrors(errors);
    return;
  }

  try {
    setCreating(true);

    const newTask = await api<Task>('/tasks', {
      method: 'POST',
      body: JSON.stringify({
        title: title.trim(),
        description: description.trim() || undefined,
        status: taskStatus,
        priority: Number(priority),
        projectId: Number(projectId),
      }),
    });

    setTasks((currentTasks) => [newTask, ...currentTasks]);

    setTitle('');
    setDescription('');
    setTaskStatus('todo');
    setPriority('1');
    setProjectId('');
  } catch (err) {
    if (err instanceof ApiError) {
      const knownFields = [
        'title',
        'description',
        'status',
        'priority',
        'projectId',
        'assigneeId',
        'tagIds',
      ];

      const newFieldErrors: Record<string, string> = {};
      const unknownMessages: string[] = [];

      err.messages.forEach((message) => {
        const field = knownFields.find((fieldName) =>
          message.toLowerCase().startsWith(fieldName.toLowerCase()),
        );

        if (field) {
          newFieldErrors[field] = message;
        } else {
          unknownMessages.push(message);
        }
      });

      setFieldErrors(newFieldErrors);

      if (unknownMessages.length > 0) {
        setFormError(unknownMessages.join(', '));
      }
    } else {
      setFormError(
        err instanceof Error ? err.message : 'Failed to create task',
      );
    }
  } finally {
    setCreating(false);
  }
}
async function handleDeleteTask(id: number) {
  try {
    setError('');

    await api<void>(`/tasks/${id}`, {
      method: 'DELETE',
    });

    setTasks((currentTasks) =>
      currentTasks.filter((task) => task.id !== id),
    );
  } catch (err) {
    setError(
      err instanceof Error ? err.message : 'Failed to delete task',
    );
  }
}
  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Tasks</h1>
            <p className="mt-2">
              Signed in as {user?.email}
            </p>
          </div>

          <button
            onClick={signOut}
            className="rounded border px-4 py-2"
          >
            Sign out
          </button>
        </div>

        <section className="mt-8">
            <div className="mb-8 rounded border p-6">
  <h2 className="text-xl font-semibold">
    Create Task
  </h2>

  <form onSubmit={handleCreateTask} className="mt-4 space-y-4">
    {formError && (
      <div className="rounded border border-red-500 p-3 text-red-600">
        {formError}
      </div>
    )}

    <div>
      <label htmlFor="title" className="block font-medium">
        Title
      </label>

      <input
        id="title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="mt-1 w-full rounded border px-3 py-2"
      />

      {fieldErrors.title && (
        <p className="mt-1 text-sm text-red-600">
          {fieldErrors.title}
        </p>
      )}
    </div>

    <div>
      <label htmlFor="description" className="block font-medium">
        Description
      </label>

      <textarea
        id="description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="mt-1 w-full rounded border px-3 py-2"
        rows={3}
      />

      {fieldErrors.description && (
        <p className="mt-1 text-sm text-red-600">
          {fieldErrors.description}
        </p>
      )}
    </div>

    <div>
      <label htmlFor="taskStatus" className="block font-medium">
        Status
      </label>

      <select
        id="taskStatus"
        value={taskStatus}
        onChange={(e) => setTaskStatus(e.target.value)}
        className="mt-1 rounded border px-3 py-2"
      >
        <option value="todo">Todo</option>
        <option value="in_progress">In Progress</option>
        <option value="done">Done</option>
      </select>

      {fieldErrors.status && (
        <p className="mt-1 text-sm text-red-600">
          {fieldErrors.status}
        </p>
      )}
    </div>

    <div>
      <label htmlFor="priority" className="block font-medium">
        Priority
      </label>

      <select
        id="priority"
        value={priority}
        onChange={(e) => setPriority(e.target.value)}
        className="mt-1 rounded border px-3 py-2"
      >
        <option value="1">1</option>
        <option value="2">2</option>
        <option value="3">3</option>
        <option value="4">4</option>
        <option value="5">5</option>
      </select>

      {fieldErrors.priority && (
        <p className="mt-1 text-sm text-red-600">
          {fieldErrors.priority}
        </p>
      )}
    </div>

    <div>
      <label htmlFor="projectId" className="block font-medium">
        Project ID
      </label>

      <input
        id="projectId"
        type="number"
        value={projectId}
        onChange={(e) => setProjectId(e.target.value)}
        className="mt-1 w-full rounded border px-3 py-2"
      />

      {fieldErrors.projectId && (
        <p className="mt-1 text-sm text-red-600">
          {fieldErrors.projectId}
        </p>
      )}
    </div>

   <button
  type="submit"
  disabled={creating}
  className="rounded bg-black px-4 py-2 text-white transition hover:scale-105 hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
>
      {creating ? 'Creating...' : 'Create Task'}
    </button>
  </form>
</div>
          {/* Status Filter */}
          <div className="mb-6">
            <label
              htmlFor="status"
              className="mr-3 font-medium"
            >
              Filter by status:
            </label>

            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded border px-3 py-2"
            >
              <option value="">All</option>
              <option value="todo">Todo</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>

          {loading && (
            <p>Loading tasks...</p>
          )}

          {!loading && error && (
            <p className="text-red-600">
              {error}
            </p>
          )}

          {!loading && !error && tasks.length === 0 && (
            <p>No tasks found.</p>
          )}

          {!loading && !error && tasks.length > 0 && (
            <div className="space-y-4">
              {tasks.map((task) => (
  <div
    key={task.id}
    className="rounded border p-4"
  >
    <h2 className="text-lg font-semibold">
      {task.title}
    </h2>

    {task.description && (
      <p className="mt-1 text-gray-600">
        {task.description}
      </p>
    )}

    <div className="mt-2 text-sm">
      <span>Status: {task.status}</span>
      {' · '}
      <span>Priority: {task.priority}</span>
    </div>

    <button
  type="button"
  onClick={() => handleDeleteTask(task.id)}
  className="mt-3 rounded border border-red-500 px-3 py-1 text-red-600 transition hover:scale-105 hover:bg-red-500 hover:text-white"
>
      Delete
    </button>
  </div>
))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
