import { useState, useEffect, useCallback } from 'react';
import { adminService } from '@/services/api';
import { useAuth } from '@/hooks/use-auth';
import { User } from '@/types/users';

interface UseUserManagementReturn {
  users: User[];
  loading: boolean;
  error: string | null;
  updateUserActivation: (userId: string, isActive: boolean) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  refreshUsers: () => Promise<void>;
}

export const useUserManagement = (): UseUserManagementReturn => {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Transforms API user data to match our User interface.
   * @param userData - The user data from the API.
   * @returns The transformed user data.
   */
  const transformUser = (userData: any): User => ({
    id: userData.id,
    fullname: userData.fullname,
    email: userData.email,
    phone: userData.phone,
    isVerified: userData.is_verified,
    isActive: userData.is_active,
    isAdmin: userData.is_admin,
  });

  /**
   * Fetches all users from the API.
   * Only admins can fetch users.
   * Sets loading state and handles errors.
   * @returns A promise that resolves when the users are fetched.
   * @throws An error if the fetch fails.
   */
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

  /**
   * Updates the activation status of a user.
   * @param userId - The ID of the user to update.
   * @param isActive - The new activation status.
   */
  const updateUserActivation = async (userId: string, isActive: boolean): Promise<void> => {
    try {
      await adminService.updateUserActivation(userId, isActive);
      
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId 
            ? { ...user, isActive }
            : user
        )
      );
    } catch (error: any) {
      console.error('Error updating activation status:', error);
      throw error;
    }
  };

  /**
   * Deletes a user.
   * @param userId - The ID of the user to delete.
   */
  const deleteUser = async (userId: string): Promise<void> => {
    try {
      await adminService.deleteUser(userId);
      
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
    if(isAdmin){
      fetchUsers();
    }
  }, [isAdmin]);

  return {
    users,
    loading,
    error,
    updateUserActivation,
    deleteUser,
    refreshUsers,
  };
};