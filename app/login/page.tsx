'use client';

import { FormEvent, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { ApiError } from '@/lib/api';

export default function LoginPage() {
const { signIn } = useAuth();

const [email, setEmail] = useState('');
const [password, setPassword] = useState('');

const [error, setError] = useState('');
const [loading, setLoading] = useState(false);

async function handleSubmit(event: FormEvent<HTMLFormElement>) {
event.preventDefault();

setError('');

const trimmedEmail = email.trim();
const trimmedPassword = password.trim();

if (!trimmedEmail || !trimmedPassword) {
  setError('Email and password are required.');
  return;
}

setLoading(true);

try {
  await signIn(trimmedEmail, trimmedPassword);
} catch (err) {
  if (err instanceof ApiError) {
    setError(err.messages.join(', '));
  } else {
    setError('Something went wrong. Please try again.');
  }
} finally {
  setLoading(false);
}


}

return ( <main className="flex min-h-screen items-center justify-center p-6"> <div className="w-full max-w-md"> <h1 className="mb-6 text-3xl font-bold">Sign in</h1>

    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="mb-1 block font-medium">
          Email
        </label>

        <input
          id="email"
          name="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full rounded border p-2"
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-1 block font-medium">
          Password
        </label>

        <input
          id="password"
          name="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="w-full rounded border p-2"
        />
      </div>

      {error && (
        <p role="alert" className="text-sm">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded border px-4 py-2 font-medium"
      >
        {loading ? 'Signing in...' : 'Sign in'}
      </button>
    </form>
  </div>
</main>


);
}
