
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import TasksPage from '@/app/tasks/page';
import { useAuth } from '@/components/AuthProvider';
import { api, ApiError } from '@/lib/api';

jest.mock('@/components/AuthProvider', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/lib/api', () => ({
  api: jest.fn(),
  ApiError: class ApiError extends Error {
    status: number;
    messages: string[];

    constructor(status: number, messages: string[]) {
      super(messages.join(', '));
      this.status = status;
      this.messages = messages;
    }
  },
}));

const mockUseAuth = useAuth as jest.Mock;
const mockApi = api as jest.Mock;

describe('TasksPage mutations', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      user: {
        email: 'test@gmail.com',
      },
      signOut: jest.fn(),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('adds a newly created task to the list on a 201 response', async () => {
    const newTask = {
      id: 3,
      title: 'New Test Task',
      description: 'Created during the test',
      status: 'todo',
      priority: '1',
    };

    // First call: GET /tasks
    mockApi.mockResolvedValueOnce([]);

    // Second call: POST /tasks → 201
    mockApi.mockResolvedValueOnce(newTask);

    render(<TasksPage />);

    // Wait for the initial GET request to finish
    await waitFor(() => {
      expect(screen.getByText('No tasks found.')).toBeInTheDocument();
    });

    // Fill in the required fields
    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: 'New Test Task' },
    });

    fireEvent.change(screen.getByLabelText('Project ID'), {
      target: { value: '1' },
    });

    // Submit the form
    fireEvent.click(
      screen.getByRole('button', { name: 'Create Task' }),
    );

    // The new task should appear without reloading the page
    await waitFor(() => {
      expect(screen.getByText('New Test Task')).toBeInTheDocument();
    });

    expect(mockApi).toHaveBeenCalledWith('/tasks', {
      method: 'POST',
      body: JSON.stringify({
        title: 'New Test Task',
        description: undefined,
        status: 'todo',
        priority: 1,
        projectId: 1,
      }),
    });
  });

  it('renders the API field error and keeps the entered values on a 400 response', async () => {
    // First call: GET /tasks
    mockApi.mockResolvedValueOnce([]);

    // Second call: POST /tasks → 400
    mockApi.mockRejectedValueOnce(
  Object.assign(
    new Error('title must be longer than or equal to 3 characters'),
    {
      status: 400,
      messages: ['title must be longer than or equal to 3 characters'],
    },
  ),
);

    render(<TasksPage />);

    // Wait for the initial GET request to finish
    await waitFor(() => {
      expect(screen.getByText('No tasks found.')).toBeInTheDocument();
    });

    const titleInput = screen.getByLabelText('Title');
    const projectInput = screen.getByLabelText('Project ID');

    // Use a valid title so that the frontend validation passes
    // and the mocked API gets a chance to return the 400 error.
    fireEvent.change(titleInput, {
      target: { value: 'Valid Title' },
    });

    fireEvent.change(projectInput, {
      target: { value: '1' },
    });

    // Submit the form
    fireEvent.click(
      screen.getByRole('button', { name: 'Create Task' }),
    );

    // API validation error should appear next to the title field
    await waitFor(() => {
      expect(
        screen.getByText(
          'title must be longer than or equal to 3 characters',
        ),
      ).toBeInTheDocument();
    });

    // Values must remain in the form after the failed request
    expect(titleInput).toHaveValue('Valid Title');
    expect(projectInput).toHaveValue(1);
  });
});

