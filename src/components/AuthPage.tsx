import React, { useMemo, useState } from 'react';
import { Building2, KeyRound, LogIn, UserPlus } from 'lucide-react';

export interface MockAuthUser {
  id: string;
  name: string;
  email: string;
  username: string;
  password: string;
}

interface AuthPageProps {
  mode: 'login' | 'register';
  mockUsers: MockAuthUser[];
  onLogin: (user: MockAuthUser) => void;
  onRegister: (user: MockAuthUser) => void;
  onNavigate: (mode: 'login' | 'register') => void;
}

const demoUser: MockAuthUser = {
  id: 'demo-taxpayer',
  name: 'Demo Taxpayer',
  email: 'demo.taxpayer@example.com',
  username: 'citizen.demo',
  password: 'Taxprep@123',
};

export const initialMockUsers: MockAuthUser[] = [demoUser];

const createMockPassword = () => {
  const token = Math.random().toString(36).slice(2, 8);
  return `Tax@${token}`;
};

const createUsername = (name: string) => {
  const base = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '.')
    .replace(/^\.+|\.+$/g, '');

  return `${base || 'citizen'}.${Math.floor(1000 + Math.random() * 9000)}`;
};

export const AuthPage: React.FC<AuthPageProps> = ({
  mode,
  mockUsers,
  onLogin,
  onRegister,
  onNavigate,
}) => {
  const [name, setName] = useState('Citizen Taxpayer');
  const [email, setEmail] = useState('citizen@example.com');
  const [username, setUsername] = useState(demoUser.username);
  const [password, setPassword] = useState(demoUser.password);
  const [message, setMessage] = useState<{ type: 'info' | 'success' | 'error'; text: string }>({
    type: 'info',
    text: 'Use the demo credentials shown here, or register a generated mock account.',
  });

  const activeDemo = useMemo(() => mockUsers[0] || demoUser, [mockUsers]);
  const isLogin = mode === 'login';

  const handleGenerateCredentials = () => {
    setUsername(createUsername(name));
    setPassword(createMockPassword());
    setMessage({
      type: 'info',
      text: 'Generated mock credentials. They are stored only in this browser session.',
    });
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isLogin) {
      const matchedUser = mockUsers.find(
        (user) => user.username === username.trim() && user.password === password,
      );

      if (!matchedUser) {
        setMessage({
          type: 'error',
          text: 'Mock login failed. Check the username and password, or create a new account.',
        });
        return;
      }

      onLogin(matchedUser);
      return;
    }

    const cleanName = name.trim() || 'Citizen Taxpayer';
    const cleanEmail = email.trim() || 'citizen@example.com';
    const cleanUsername = username.trim() || createUsername(cleanName);
    const cleanPassword = password || createMockPassword();

    if (mockUsers.some((user) => user.username === cleanUsername)) {
      setMessage({
        type: 'error',
        text: 'This mock username already exists. Generate another username or change it manually.',
      });
      return;
    }

    onRegister({
      id: `mock-${Date.now()}`,
      name: cleanName,
      email: cleanEmail,
      username: cleanUsername,
      password: cleanPassword,
    });
  };

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900 flex items-center justify-center px-4 py-10">
      <section className="w-full max-w-5xl grid lg:grid-cols-[0.95fr_1.05fr] gap-6 items-stretch">
        <div className="ux4g-card ux4g-card-elevated p-6 sm:p-8 flex flex-col justify-between gap-8">
          <div>
            <div className="w-12 h-12 rounded-lg bg-[var(--ux4g-primary-strong)] text-white flex items-center justify-center mb-5">
              <Building2 className="w-7 h-7" />
            </div>
            <p className="ux4g-badge ux4g-badge-primary mb-4">UX4G Citizen TaxPrep</p>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-950 leading-tight">
              Secure taxpayer workspace
            </h1>
            <p className="mt-3 text-sm sm:text-base text-slate-600 max-w-md">
              Mock authentication is enabled for the prototype. The route and account flow are ready to connect to a backend auth service later.
            </p>
          </div>

          <div className="ux4g-alert ux4g-alert-info">
            <div className="font-bold mb-1">Demo credentials</div>
            <div>Username: {activeDemo.username}</div>
            <div>Password: {activeDemo.password}</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="ux4g-card ux4g-card-elevated p-6 sm:p-8" noValidate>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-950">
                {isLogin ? 'Login' : 'Register'}
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                {isLogin ? 'Access the tax preparation app.' : 'Create a mock account for this session.'}
              </p>
            </div>

            <button
              type="button"
              className="ux4g-btn ux4g-btn-outline-neutral ux4g-btn-md"
              onClick={() => onNavigate(isLogin ? 'register' : 'login')}
            >
              {isLogin ? (
                <>
                  <UserPlus className="w-4 h-4" />
                  Register
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Login
                </>
              )}
            </button>
          </div>

          <div className={`ux4g-alert ux4g-alert-${message.type} mb-5`} role="status">
            {message.text}
          </div>

          <div className="space-y-4">
            {!isLogin && (
              <>
                <label className="block">
                  <span className="ux4g-form-label">Full name</span>
                  <input
                    className="ux4g-input"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    autoComplete="name"
                  />
                </label>

                <label className="block">
                  <span className="ux4g-form-label">Email address</span>
                  <input
                    className="ux4g-input"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    autoComplete="email"
                  />
                </label>
              </>
            )}

            <label className="block">
              <span className="ux4g-form-label">Username</span>
              <input
                className="ux4g-input"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                autoComplete="username"
                required
              />
            </label>

            <label className="block">
              <span className="ux4g-form-label">Password</span>
              <input
                className="ux4g-input"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                required
              />
              {!isLogin && (
                <span className="ux4g-form-hint">
                  This password is generated for mock use only and is not persisted securely.
                </span>
              )}
            </label>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button type="submit" className="ux4g-btn ux4g-btn-primary ux4g-btn-md w-full sm:w-auto">
              {isLogin ? (
                <>
                  <LogIn className="w-4 h-4" />
                  Login to app
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Create mock account
                </>
              )}
            </button>

            {!isLogin && (
              <button
                type="button"
                className="ux4g-btn ux4g-btn-outline-neutral ux4g-btn-md w-full sm:w-auto"
                onClick={handleGenerateCredentials}
              >
                <KeyRound className="w-4 h-4" />
                Generate credentials
              </button>
            )}
          </div>
        </form>
      </section>
    </main>
  );
};
