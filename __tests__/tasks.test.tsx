import { render, screen, waitFor } from '@testing-library/react';
import TasksPage from '@/app/tasks/page';
import { useAuth } from '@/components/AuthProvider';
import { api } from '@/lib/api';

jest.mock('@/components/AuthProvider', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/lib/api', () => ({
  api: jest.fn(),
  ApiError: class ApiError extends Error {},
}));

const mockUseAuth = useAuth as jest.Mock;
const mockApi = api as jest.Mock;

describe('TasksPage', () => {
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

  it('renders a row for each task from a mocked 200 response', async () => {
    mockApi.mockResolvedValueOnce([
      {
        id: 1,
        title: 'Complete Week 9',
        description: 'Finish the Next.js exercise',
        status: 'todo',
        priority: '1',
      },
      {
        id: 2,
        title: 'Write tests',
        description: 'Add Jest tests',
        status: 'in_progress',
        priority: '2',
      },
    ]);

    render(<TasksPage />);

    await waitFor(() => {
      expect(screen.getByText('Complete Week 9')).toBeInTheDocument();
      expect(screen.getByText('Write tests')).toBeInTheDocument();
    });

    expect(screen.getByText('Status: todo')).toBeInTheDocument();
    expect(screen.getByText('Status: in_progress')).toBeInTheDocument();

    expect(mockApi).toHaveBeenCalledWith('/tasks');
  });

  it('renders the empty state when the API returns an empty array', async () => {
    mockApi.mockResolvedValueOnce([]);

    render(<TasksPage />);

    await waitFor(() => {
      expect(screen.getByText('No tasks found.')).toBeInTheDocument();
    });

    expect(screen.queryByText('Loading tasks...')).not.toBeInTheDocument();
  });
});