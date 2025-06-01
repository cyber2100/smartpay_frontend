export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  isVerified: boolean;
  isActive: boolean;
  isAdmin: boolean;
}