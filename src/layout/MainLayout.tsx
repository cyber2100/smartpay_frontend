import React from 'react';
import { Sidebar } from '@/layout/Sidebar';

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-screen bg-background">
      <div className="hidden min-[980px]:block w-64">
        <Sidebar />
      </div>
      <div className="flex-1 pb-2">{children}</div>
    </div>
  );
};

export default AuthLayout;