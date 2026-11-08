import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '@/services/api';
import { User, UserProfile } from '@/types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, confirmPassword?: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<UserProfile>) => Promise<UserProfile>;
  completeCareerSetup: (data: {
    targetRole: string;
    experienceLevel: string;
    skills: string[];
    programmingLanguages?: string[];
  }) => Promise<UserProfile>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('interviewai_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    const savedToken = localStorage.getItem('interviewai_token');
    if (!savedToken) {
      setUser(null);
      setProfile(null);
      setIsLoading(false);
      return;
    }

    try {
      const response = await apiClient.get('/auth/me');
      if (response.data?.success) {
        const userData = response.data.user?.name === 'Mohammed Farooq'
          ? { ...response.data.user, name: 'Mohammed Hassan Ahmed' }
          : response.data.user;
        const profileData = response.data.profile?.name === 'Mohammed Farooq'
          ? { ...response.data.profile, name: 'Mohammed Hassan Ahmed' }
          : response.data.profile;

        setUser(userData);
        setProfile(profileData);
      } else {
        logout();
      }
    } catch (error) {
      console.warn('Failed to restore auth session:', error);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      const { token: receivedToken, user: receivedUser, profile: receivedProfile } = response.data;
      const normalizedUser = receivedUser?.name === 'Mohammed Farooq'
        ? { ...receivedUser, name: 'Mohammed Hassan Ahmed' }
        : receivedUser;
      const normalizedProfile = receivedProfile?.name === 'Mohammed Farooq'
        ? { ...receivedProfile, name: 'Mohammed Hassan Ahmed' }
        : receivedProfile;
      localStorage.setItem('interviewai_token', receivedToken);
      setToken(receivedToken);
      setUser(normalizedUser);
      setProfile(normalizedProfile);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, confirmPassword?: string) => {
    setIsLoading(true);
    try {
      const response = await apiClient.post('/auth/register', {
        name,
        email,
        password,
        confirmPassword,
      });
      const { token: receivedToken, user: receivedUser, profile: receivedProfile } = response.data;
      const normalizedUser = receivedUser?.name === 'Mohammed Farooq'
        ? { ...receivedUser, name: 'Mohammed Hassan Ahmed' }
        : receivedUser;
      const normalizedProfile = receivedProfile?.name === 'Mohammed Farooq'
        ? { ...receivedProfile, name: 'Mohammed Hassan Ahmed' }
        : receivedProfile;
      localStorage.setItem('interviewai_token', receivedToken);
      setToken(receivedToken);
      setUser(normalizedUser);
      setProfile(normalizedProfile);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('interviewai_token');
    setToken(null);
    setUser(null);
    setProfile(null);
  };

  const updateProfile = async (data: Partial<UserProfile>): Promise<UserProfile> => {
    const response = await apiClient.put('/users/profile', data);
    const updatedProfile = response.data.data;
    setProfile(updatedProfile);
    if (data.name && user) {
      setUser({ ...user, name: data.name });
    }
    return updatedProfile;
  };

  const completeCareerSetup = async (data: {
    targetRole: string;
    experienceLevel: string;
    skills: string[];
    programmingLanguages?: string[];
  }): Promise<UserProfile> => {
    const response = await apiClient.post('/users/career-setup', data);
    const updatedProfile = response.data.data;
    setProfile(updatedProfile);
    return updatedProfile;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
        completeCareerSetup,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

