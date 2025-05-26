import { useState, useEffect, useCallback } from 'react';
import { adminService } from '@/services/api';
import { useAuth } from '@/hooks/use-auth';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  isVerified: boolean;
  isAdmin: boolean;
}

interface UseUserManagementReturn {
  users: User[];
  loading: boolean;
  error: string | null;
  resetUserPassword: (userId: string, newPassword: string) => Promise<void>;
  updateUserVerification: (userId: string, isVerified: boolean) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  refreshUsers: () => Promise<void>;
}

export const useUserManagement = (): UseUserManagementReturn => {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Transform API user data to match our User interface
  const transformUser = (userData: any): User => ({
    id: userData.id,
    name: userData.fullname || userData.name,
    email: userData.email,
    phone: userData.phone,
    isVerified: userData.is_verified,
    isAdmin: userData.is_admin,
  });

  // Fetch all users
  const fetchUsers = useCallback(async () => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const usersData = await adminService.getAllUsers();
      
      const formattedUsers: User[] = usersData.map(transformUser);
      setUsers(formattedUsers);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      setError(error.response?.data?.detail || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  // Reset user password
  const resetUserPassword = async (userId: string, newPassword: string): Promise<void> => {
    try {
      await adminService.resetUserPassword(userId, newPassword);
    } catch (error: any) {
      console.error('Error resetting password:', error);
      throw error;
    }
  };

  // Update user verification status
  const updateUserVerification = async (userId: string, isVerified: boolean): Promise<void> => {
    try {
      await adminService.updateUserVerification(userId, isVerified);
      
      // Update local state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId 
            ? { ...user, isVerified }
            : user
        )
      );
    } catch (error: any) {
      console.error('Error updating verification:', error);
      throw error;
    }
  };

  // Delete user
  const deleteUser = async (userId: string): Promise<void> => {
    try {
      await adminService.deleteUser(userId);
      
      // Update local state
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
    } catch (error: any) {
      console.error('Error deleting user:', error);
      throw error;
    }
  };

  // Refresh users data
  const refreshUsers = useCallback(async (): Promise<void> => {
    await fetchUsers();
  }, [fetchUsers]);

  // Initial fetch on mount
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    loading,
    error,
    resetUserPassword,
    updateUserVerification,
    deleteUser,
    refreshUsers,
  };
};