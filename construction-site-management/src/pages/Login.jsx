/**
 * Login Page
 * User selection for demo purposes
 * Simulates login by selecting a user from available users
 */

import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { Button, Card } from '../components/ui';
import { LogIn } from 'lucide-react';

const Login = () => {
  const { users, login } = useContext(AppContext);
  const navigate = useNavigate();
  const [selectedUserId, setSelectedUserId] = useState('');

  const handleLogin = () => {
    if (selectedUserId) {
      login(selectedUserId);
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-amber-500 mb-2">
            SiteOS Enterprise
          </h1>
          <p className="text-slate-400">
            Construction Site Management System
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Select User
            </label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-50 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            >
              <option value="">Choose a user...</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.role.replace('_', ' ')})
                </option>
              ))}
            </select>
          </div>

          <Button
            onClick={handleLogin}
            disabled={!selectedUserId}
            className="w-full flex items-center justify-center gap-2"
          >
            <LogIn size={18} />
            Login
          </Button>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800">
          <p className="text-xs text-slate-500 text-center">
            Demo Mode: Select any user to login
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Login;
