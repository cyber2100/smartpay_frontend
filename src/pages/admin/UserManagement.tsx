import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Key, Trash2, Shield, UserCheck } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useUserManagement } from '@/hooks/use-user-management';
import { useAuth } from '@/hooks/use-auth';

import { User, mockUsers } from '@/mockData/users';

const UserManagement: React.FC = () => {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const {
    users,
    loading,
    updateUserActivation,
    refreshUsers,
  } = useUserManagement();
  
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState<string>('');
  const [actionType, setActionType] = useState<'reset' | 'activate' | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'verified' | 'unverified' | 'active' | 'inactive'>('all');
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  // Filter users based on search term and status
  console.log('users = ', users);
  
  const filteredUsers: User[] = (users?.length ? [...users] : mockUsers).filter((user: User) => {
    
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.phone?.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'verified' && user.isVerified) ||
                         (statusFilter === 'unverified' && !user.isVerified) ||
                         (statusFilter === 'active' && user.isActive) ||
                         (statusFilter === 'inactive' && !user.isActive);
    
    return matchesSearch && matchesStatus;
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchTerm(e.target.value);
  };

  const openDialog = (user: User, action: 'activate' ) => {
    setSelectedUser(user);
    setActionType(action);
  };

  const closeDialog = () => {
    setSelectedUser(null);
    setActionType(null);
    setNewPassword('');
    setActionLoading(false);
  };

  const handleActivateUser = async () => {
    if (!selectedUser) return;
    
    try {
      setActionLoading(true);
      await updateUserActivation(selectedUser.id, !selectedUser.isActive);

      toast({
        title: "Success",
        description: `User ${selectedUser.name} ${selectedUser.isActive ? 'deactivated' : 'activated'} successfully.`,
        variant: "default"
      });
      
      closeDialog();
      await refreshUsers();
    } catch (error: any) {
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

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(password);
  };

  const getVerificationBadge = (user: User) => {
    if (user.isVerified) {
      return <Badge variant="default" className="bg-green-500">Verified</Badge>;
    }
    return <Badge variant="destructive">Unverified</Badge>;
  };

  const getActivationBadge = (user: User) => {
    if (user.isActive) {
      return <Badge variant="default">Active</Badge>;
    }
    return <Badge variant="secondary">Inactive</Badge>;
  };

  // Show loading state
  if (loading) {
    return (
      <div className="space-y-6 m-6">
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
      <div className="space-y-6 m-6">
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
    <div className="space-y-6 m-6">
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
          {/* Search and Filter Controls */}
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
            <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
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

          {/* Users Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Verification</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user: User) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          {user.name}
                          {user.isAdmin && (
                            <Badge variant="outline" className="text-xs">Admin</Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">ID: {user.id}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="text-sm">{user.email}</div>
                        <div className="text-sm text-muted-foreground">{user.phone || 'No phone'}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getVerificationBadge(user)}
                      <div className="text-xs text-muted-foreground mt-1">
                        {user.isVerified ? 'Account verified' : 'Needs verification'}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getActivationBadge(user)}
                      <div className="text-xs text-muted-foreground mt-1">
                        {user.isActive ? 'Can access platform' : 'Access restricted'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {/* Activate/Deactivate User Button */}
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
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              {filteredUsers.length === 0 && (
                <TableCaption className='m-5'>No users found matching your search criteria.</TableCaption>
              )}
            </Table>
          </div>

          {/* Action Dialogs */}
          <Dialog open={!!selectedUser && !!actionType} onOpenChange={closeDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {actionType === 'activate' && (selectedUser?.isActive ? 'Deactivate User' : 'Activate User')}
                </DialogTitle>
                <DialogDescription>
                  {actionType === 'activate' && selectedUser?.isActive && `Deactivate ${selectedUser?.name}? They will lose access to the platform but their account data will remain intact.`}
                  {actionType === 'activate' && !selectedUser?.isActive && `Activate ${selectedUser?.name}? This will restore their access to the platform.`}
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