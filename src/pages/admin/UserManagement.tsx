import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Key, UserX, Trash2, Shield } from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAuth } from '@/hooks/use-auth';
import { useWallet } from '@/hooks/use-wallet';
import type { User } from '@/hooks/use-auth';

interface UserManagementProps {
  onUserUpdate?: (userId: string, updates: Partial<User>) => void;
  onUserDelete?: (userId: string) => void;
  onPasswordReset?: (userId: string, newPassword: string) => void;
}

const UserManagement: React.FC<UserManagementProps> = ({
  onUserUpdate,
  onUserDelete,
  onPasswordReset
}) => {
  const { allUsers } = useWallet();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState<string>('');
  const [actionType, setActionType] = useState<'reset' | 'verify' | 'delete' | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'verified' | 'unverified'>('all');

  // Filter users based on search term and status
  const filteredUsers: User[] = allUsers.filter((user: User) => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.phone?.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'verified' && user.isVerified) ||
                         (statusFilter === 'unverified' && !user.isVerified);
    
    return matchesSearch && matchesStatus;
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchTerm(e.target.value);
  };

  const openDialog = (user: User, action: 'reset' | 'delete') => {
    setSelectedUser(user);
    setActionType(action);
  };

  const closeDialog = () => {
    setSelectedUser(null);
    setActionType(null);
    setNewPassword('');
  };

  const handlePasswordReset = () => {
    if (selectedUser && newPassword && onPasswordReset) {
      onPasswordReset(selectedUser.id, newPassword);
      closeDialog();
    }
  };

  const handleVerifyUser = () => {
    if (selectedUser && onUserUpdate) {
      onUserUpdate(selectedUser.id, { isVerified: !selectedUser.isVerified });
      closeDialog();
    }
  };

  const handleDeleteUser = () => {
    if (selectedUser && onUserDelete) {
      onUserDelete(selectedUser.id);
      closeDialog();
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

  const getStatusBadge = (user: User) => {
    if (user.isVerified) {
      return <Badge variant="default">Verified</Badge>;
    }
    return <Badge variant="secondary">Unverified</Badge>;
  };

  return (
    <div className="space-y-6 m-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            User Management
          </CardTitle>
          <CardDescription>
            Manage user accounts, reset passwords, and control access
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
                  <TableHead>Balance</TableHead>
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
                      {getStatusBadge(user)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDialog(user, 'reset')}
                          className="h-8 w-8 p-0"
                        >
                          <Key className="h-3 w-3" />
                        </Button>
                        {!user.isAdmin && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDialog(user, 'delete')}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              {filteredUsers.length === 0 && (
                <TableCaption>No users found matching your search criteria.</TableCaption>
              )}
            </Table>
          </div>

          {/* Action Dialogs */}
          <Dialog open={!!selectedUser && !!actionType} onOpenChange={closeDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {actionType === 'reset' && 'Reset Password'}
                  {actionType === 'delete' && 'Delete User'}
                </DialogTitle>
                <DialogDescription>
                  {actionType === 'reset' && `Reset password for ${selectedUser?.name}`}
                  {actionType === 'delete' && `Permanently delete ${selectedUser?.name}? This action cannot be undone.`}
                </DialogDescription>
              </DialogHeader>

              {actionType === 'reset' && (
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter new password"
                      type="text"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="flex-1"
                    />
                    <Button 
                      variant="outline" 
                      onClick={generateRandomPassword}
                      type="button"
                    >
                      Generate
                    </Button>
                  </div>
                </div>
              )}

              <DialogFooter>
                <Button variant="outline" onClick={closeDialog}>
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    if (actionType === 'reset') handlePasswordReset();
                    if (actionType === 'verify') handleVerifyUser();
                    if (actionType === 'delete') handleDeleteUser();
                  }}
                  variant={actionType === 'delete' ? 'destructive' : 'default'}
                  disabled={actionType === 'reset' && !newPassword}
                >
                  {actionType === 'reset' && 'Reset Password'}
                  {actionType === 'delete' && 'Delete'}
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