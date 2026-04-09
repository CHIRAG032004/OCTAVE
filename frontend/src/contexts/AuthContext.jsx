import React, { useEffect, useState } from 'react';
import { ID, account, isAppwriteConfigured } from '../lib/appwrite';
import { AuthContext } from './auth-context';

const DEMO_USERS_KEY = 'smart-community-demo-users';
const DEMO_SESSION_KEY = 'smart-community-demo-session';

const readDemoUsers = () => {
  try {
    return JSON.parse(window.localStorage.getItem(DEMO_USERS_KEY) || '[]');
  } catch {
    return [];
  }
};

const saveDemoUsers = (users) => {
  window.localStorage.setItem(DEMO_USERS_KEY, JSON.stringify(users));
};

const readDemoSession = () => {
  try {
    return JSON.parse(window.localStorage.getItem(DEMO_SESSION_KEY) || 'null');
  } catch {
    return null;
  }
};

const saveDemoSession = (session) => {
  if (session) {
    window.localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(session));
    return;
  }

  window.localStorage.removeItem(DEMO_SESSION_KEY);
};

const buildDemoToken = (session) => {
  if (!session?.$id) {
    return null;
  }

  return `demo:${window.btoa(
    JSON.stringify({
      userId: session.$id,
      labels: Array.isArray(session.labels) ? session.labels : [],
    })
  )}`;
};

const buildDemoUser = ({ email, name = '' }) => ({
  $id: ID.unique(),
  email,
  name: name || email.split('@')[0],
  labels: email.toLowerCase().includes('admin') ? ['admin'] : [],
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    if (!isAppwriteConfigured || !account) {
      setUser(readDemoSession());
      setLoading(false);
      return;
    }

    try {
      const session = await account.get();
      setUser(session);
    } catch {
      console.log('No active session');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    if (!isAppwriteConfigured || !account) {
      const users = readDemoUsers();
      const demoUser = users.find(
        (item) => item.email.toLowerCase() === email.toLowerCase() && item.password === password
      );

      if (!demoUser) {
        return { success: false, error: 'Demo account not found. Please sign up first.' };
      }

      saveDemoSession(demoUser.user);
      setUser(demoUser.user);
      return { success: true };
    }

    try {
      await account.createEmailPasswordSession(email, password);
      await checkUser();
      return { success: true };
    } catch (error) {
      console.error('Login failed:', error);
      return { success: false, error: error.message };
    }
  };

  const register = async (email, password, name) => {
    if (!isAppwriteConfigured || !account) {
      const users = readDemoUsers();
      const alreadyExists = users.some((item) => item.email.toLowerCase() === email.toLowerCase());

      if (alreadyExists) {
        return { success: false, error: 'Demo account already exists. Please sign in.' };
      }

      const demoUser = buildDemoUser({ email, name });
      const nextUsers = [...users, { email, password, user: demoUser }];

      saveDemoUsers(nextUsers);
      saveDemoSession(demoUser);
      setUser(demoUser);
      return { success: true };
    }

    try {
      await account.create('unique()', email, password, name);
      await login(email, password);
      return { success: true };
    } catch (error) {
      console.error('Registration failed:', error);
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    if (!isAppwriteConfigured || !account) {
      saveDemoSession(null);
      setUser(null);
      return { success: true };
    }

    try {
      await account.deleteSession('current');
      setUser(null);
      return { success: true };
    } catch (error) {
      console.error('Logout failed:', error);
      return { success: false, error: error.message };
    }
  };

  const getToken = async () => {
    if (!isAppwriteConfigured || !account) {
      return buildDemoToken(readDemoSession());
    }

    try {
      const jwt = await account.createJWT();
      return jwt?.jwt ? `jwt:${jwt.jwt}` : null;
    } catch (error) {
      console.error('Failed to get token:', error);
      return null;
    }
  };

  const isAdmin = () => {
    try {
      return Boolean(user?.labels?.includes('admin'));
    } catch (error) {
      console.error('Failed to check admin status:', error);
      return false;
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    getToken,
    isSignedIn: !!user,
    checkUser,
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
