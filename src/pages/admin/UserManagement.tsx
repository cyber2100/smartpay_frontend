import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Key, UserX, Trash2, Shield, UserCheck } from 'lucide-react';
// Using regular HTML table since Table component isn't available
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

// Mock data for when backend communication is not working
const mockUsers = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1-234-567-8901',
    isVerified: true,
    isAdmin: false
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    phone: '+1-234-567-8902',
    isVerified: false,
    isAdmin: false
  },
  {
    id: '3',
    name: 'Admin User',
    email: 'admin@example.com',
    phone: '+1-234-567-8903',
    isVerified: true,
    isAdmin: true
  },
  {
    id: '4',
    name: 'Bob Johnson',
    email: 'bob.johnson@example.com',
    phone: '+1-234-567-8904',
    isVerified: false,
    isAdmin: false
  },
  {
    id: '5',
    name: 'Alice Brown',
    email: 'alice.brown@example.com',
    phone: null,
    isVerified: true,
    isAdmin: false
  }
];

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  isVerified: boolean;
  isAdmin: boolean;
}

interface UserManagementProps {
  onUserUpdate?: (userId: string, updates: Partial<User>) => void;
  onUserDelete?: (userId: string) => void;
  onPasswordReset?: (userId: string, newPassword: string) => void;
  allUsers?: User[];
  isBackendConnected?: boolean;
}

const UserManagement: React.FC<UserManagementProps> = ({
  onUserUpdate,
  onUserDelete,
  onPasswordReset,
  allUsers,
  isBackendConnected = false
}) => {
  // Use mock data if backend is not connected or no users provided
  const users = isBackendConnected && allUsers ? allUsers : mockUsers;
  
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState<string>('');
  const [actionType, setActionType] = useState<'reset' | 'verify' | 'delete' | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'verified' | 'unverified'>('all');

  // Filter users based on search term and status
  const filteredUsers: User[] = users.filter((user: User) => {
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

  const openDialog = (user: User, action: 'reset' | 'verify' | 'delete') => {
    setSelectedUser(user);
    setActionType(action);
  };

  const closeDialog = () => {
    setSelectedUser(null);
    setActionType(null);
    setNewPassword('');
  };

  const handlePasswordReset = () => {
    if (selectedUser && newPassword) {
      if (onPasswordReset) {
        onPasswordReset(selectedUser.id, newPassword);
      } else {
        // Mock action for demo
        alert(`Password reset for ${selectedUser.name}: ${newPassword}`);
      }
      closeDialog();
    }
  };

  const handleVerifyUser = () => {
    if (selectedUser) {
      if (onUserUpdate) {
        onUserUpdate(selectedUser.id, { isVerified: !selectedUser.isVerified });
      } else {
        // Mock action for demo
        alert(`User ${selectedUser.name} verification status would be toggled`);
      }
      closeDialog();
    }
  };

  const handleDeleteUser = () => {
    if (selectedUser) {
      if (onUserDelete) {
        onUserDelete(selectedUser.id);
      } else {
        // Mock action for demo
        alert(`User ${selectedUser.name} would be deleted`);
      }
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
      {!isBackendConnected && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
          <p className="text-yellow-800 text-sm">
            <strong>Demo Mode:</strong> Backend communication is not working. Showing mock data for demonstration purposes.
          </p>
        </div>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            User Management
          </CardTitle>
          <CardDescription>
            Manage user accounts, reset passwords, verify users, and control access
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
                        {/* Reset Password Button */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDialog(user, 'reset')}
                          className="h-8 w-8 p-0"
                          title="Reset Password"
                        >
                          <Key className="h-3 w-3" />
                        </Button>
                        
                        {/* Verify User Button */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDialog(user, 'verify')}
                          className="h-8 w-8 p-0"
                          title={user.isVerified ? "Unverify User" : "Verify User"}
                        >
                          <UserCheck className="h-3 w-3" />
                        </Button>
                        
                        {/* Delete User Button (not available for admins) */}
                        {!user.isAdmin && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDialog(user, 'delete')}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            title="Delete User"
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
                  {actionType === 'verify' && (selectedUser?.isVerified ? 'Unverify User' : 'Verify User')}
                  {actionType === 'delete' && 'Delete User'}
                </DialogTitle>
                <DialogDescription>
                  {actionType === 'reset' && `Reset password for ${selectedUser?.name}. The user will need to use this new password to log in.`}
                  {actionType === 'verify' && selectedUser?.isVerified && `Remove verification status from ${selectedUser?.name}?`}
                  {actionType === 'verify' && !selectedUser?.isVerified && `Verify ${selectedUser?.name}? This will give them full access to the platform.`}
                  {actionType === 'delete' && `Permanently delete ${selectedUser?.name}? This action cannot be undone and will remove all their data.`}
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
                  {newPassword && (
                    <div className="text-sm text-muted-foreground">
                      Make sure to share this password securely with the user.
                    </div>
                  )}
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
                  {actionType === 'verify' && (selectedUser?.isVerified ? 'Unverify' : 'Verify')}
                  {actionType === 'delete' && 'Delete User'}
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