import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Shield, UserCheck } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

// Mock hooks for demonstration
const useToast = () => ({
  toast: ({ title, description, variant }) => {
    console.log(`Toast: ${title} - ${description} (${variant})`);
  }
});

const useUserManagement = () => ({
  users: [
    {
      id: 1,
      fullname: "John Doe",
      email: "john@example.com",
      phone: "+1234567890",
      isVerified: true,
      isActive: true,
      isAdmin: false
    },
    {
      id: 2,
      fullname: "Jane Smith",
      email: "jane@example.com",
      phone: "+0987654321",
      isVerified: false,
      isActive: false,
      isAdmin: false
    },
    {
      id: 3,
      fullname: "Admin User",
      email: "admin@example.com",
      phone: "+1122334455",
      isVerified: true,
      isActive: true,
      isAdmin: true
    }
  ],
  loading: false,
  updateUserActivation: async (id, status) => {
    console.log(`Updating user ${id} activation to ${status}`);
    return Promise.resolve();
  },
  refreshUsers: async () => {
    console.log('Refreshing users');
    return Promise.resolve();
  }
});

const useAuth = () => ({
  isAdmin: true
});

const UserManagement = () => {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const {
    users,
    loading,
    updateUserActivation,
    refreshUsers,
  } = useUserManagement();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [actionType, setActionType] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState(false);

  // Filter users based on search term and status
  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.phone?.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'verified' && user.isVerified) ||
                         (statusFilter === 'unverified' && !user.isVerified) ||
                         (statusFilter === 'active' && user.isActive) ||
                         (statusFilter === 'inactive' && !user.isActive);
    
    return matchesSearch && matchesStatus;
  });

  useEffect(() => {
    // Refresh users when component mounts
    refreshUsers();
  }, []);

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Open dialog for user actions
  const openDialog = (user, action) => {
    setSelectedUser(user);
    setActionType(action);
  };

  // Close dialog and reset state
  const closeDialog = () => {
    setSelectedUser(null);
    setActionType(null);
    setNewPassword('');
    setActionLoading(false);
  };

  // Handle user activation/deactivation
  // This function toggles the user's activation status
  const handleActivateUser = async () => {
    if (!selectedUser) return;
    
    try {
      setActionLoading(true);
      await updateUserActivation(selectedUser.id, !selectedUser.isActive);

      toast({
        title: "Success",
        description: `User ${selectedUser.fullname} ${selectedUser.isActive ? 'deactivated' : 'activated'} successfully.`,
        variant: "default"
      });
      
      closeDialog();
      await refreshUsers();
    } catch (error) {
      console.error('Activation update error:', error);
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to update activation status.",
        variant: "destructive"
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Get verification badge based on user status
  const getVerificationBadge = (user) => {
    if (user.isVerified) {
      return <Badge variant="default" className="bg-green-500">Verified</Badge>;
    }
    return <Badge variant="destructive">Unverified</Badge>;
  };

  // Get activation badge based on user status
  const getActivationBadge = (user) => {
    if (user.isActive) {
      return <Badge variant="default">Active</Badge>;
    }
    return <Badge variant="secondary">Inactive</Badge>;
  };

  // Show loading state
  if (loading) {
    return (
      <div className="p-4 lg:p-6 max-w-full min-[980px]:pb-2 pb-16">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              User Management
            </CardTitle>
            <CardDescription>
              Loading users...
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check admin access
  if (!isAdmin) {
    return (
      <div className="p-4 lg:p-6 max-w-full min-[980px]:pb-2 pb-16">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              User Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Access Denied</p>
              <p className="text-sm text-muted-foreground mt-1">
                You don't have permission to access this page.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 max-w-full min-[980px]:pb-2 pb-16">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            User Management
          </CardTitle>
          <CardDescription>
            Manage user accounts, control activation status, and manage access
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users by name, email, or phone..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-8"
                type="text"
              />
            </div>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value)}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="unverified">Unverified</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="rounded-md border overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-medium">User</th>
                  <th className="text-left p-4 font-medium">Contact</th>
                  <th className="text-left p-4 font-medium">Verification</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-muted/50">
                    <td className="p-4">
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          {user.fullname}
                          {user.isAdmin && (
                            <Badge variant="outline" className="text-xs">Admin</Badge>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <div className="text-sm">{user.email}</div>
                        <div className="text-sm text-muted-foreground">{user.phone || 'No phone'}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      {getVerificationBadge(user)}
                      <div className="text-xs text-muted-foreground mt-1">
                        {user.isVerified ? 'Account verified' : 'Needs verification'}
                      </div>
                    </td>
                    <td className="p-4">
                      {getActivationBadge(user)}
                      <div className="text-xs text-muted-foreground mt-1">
                        {user.isActive ? 'Can access platform' : 'Access restricted'}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        {!user.isAdmin && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDialog(user, 'activate')}
                            className="h-8 w-8 p-0"
                            title={user.isActive ? "Deactivate User" : "Activate User"}
                          >
                            <UserCheck className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center p-8 text-muted-foreground">
                      No users found matching your search criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <Dialog open={!!selectedUser && !!actionType} onOpenChange={closeDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {actionType === 'activate' && (selectedUser?.isActive ? 'Deactivate User' : 'Activate User')}
                </DialogTitle>
                <DialogDescription>
                  {actionType === 'activate' && selectedUser?.isActive && `Deactivate ${selectedUser?.fullname}? They will lose access to the platform but their account data will remain intact.`}
                  {actionType === 'activate' && !selectedUser?.isActive && `Activate ${selectedUser?.fullname}? This will restore their access to the platform.`}
                </DialogDescription>
              </DialogHeader>

              {actionType === 'activate' && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> This action only changes the user's activation status. 
                    Verification status (email/phone verification) is managed separately and cannot be changed here.
                  </p>
                </div>
              )}

              <DialogFooter>
                <Button variant="outline" onClick={closeDialog} disabled={actionLoading}>
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    if (actionType === 'activate') handleActivateUser();
                  }}
                  disabled={actionLoading || (actionType === 'reset' && !newPassword)}
                >
                  {actionLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                      Processing...
                    </div>
                  ) : (
                    <>
                      {actionType === 'reset' && 'Reset Password'}
                      {actionType === 'activate' && (selectedUser?.isActive ? 'Deactivate' : 'Activate')}
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;