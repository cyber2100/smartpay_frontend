import React from 'react';
import { DollarSign } from 'lucide-react';

interface MoneySpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const MoneySpinner: React.FC<MoneySpinnerProps> = ({ 
  size = 'md', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-6 w-6',
    xl: 'h-8 w-8'
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`relative ${sizeClasses[size]}`}>
        {/* Outer rotating ring */}
        <div className="absolute inset-0 border-2 border-green-200 border-t-green-500 rounded-full animate-spin"></div>
        
        {/* Inner rotating ring (opposite direction) */}
        <div 
          className="absolute inset-2 border-2 border-emerald-200 border-b-emerald-500 rounded-full"
          style={{ animation: 'spin 1.5s linear infinite reverse' }}
        ></div>
        
        {/* Center dollar sign */}
        <div className="absolute inset-0 flex items-center justify-center">
          <DollarSign className={`${iconSizes[size]} text-green-600 animate-pulse`} />
        </div>
        
        {/* Floating money symbols */}
        <div className="absolute inset-0">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute text-green-400 text-xs font-bold opacity-70"
              style={{
                animation: `float-money-${i} 2s ease-in-out infinite`,
                animationDelay: `${i * 0.3}s`,
              }}
            >
              $
            </div>
          ))}
        </div>
      </div>
      
      <style>{`
        @keyframes float-money-0 {
          0%, 100% { 
            transform: translate(20px, -10px) scale(0.8); 
            opacity: 0; 
          }
          50% { 
            transform: translate(25px, -15px) scale(1); 
            opacity: 0.7; 
          }
        }
        
        @keyframes float-money-1 {
          0%, 100% { 
            transform: translate(10px, 20px) scale(0.8); 
            opacity: 0; 
          }
          50% { 
            transform: translate(15px, 25px) scale(1); 
            opacity: 0.7; 
          }
        }
        
        @keyframes float-money-2 {
          0%, 100% { 
            transform: translate(-20px, 10px) scale(0.8); 
            opacity: 0; 
          }
          50% { 
            transform: translate(-25px, 15px) scale(1); 
            opacity: 0.7; 
          }
        }
        
        @keyframes float-money-3 {
          0%, 100% { 
            transform: translate(-10px, -20px) scale(0.8); 
            opacity: 0; 
          }
          50% { 
            transform: translate(-15px, -25px) scale(1); 
            opacity: 0.7; 
          }
        }
        
        @keyframes float-money-4 {
          0%, 100% { 
            transform: translate(0px, -25px) scale(0.8); 
            opacity: 0; 
          }
          50% { 
            transform: translate(0px, -30px) scale(1); 
            opacity: 0.7; 
          }
        }
        
        @keyframes float-money-5 {
          0%, 100% { 
            transform: translate(0px, 25px) scale(0.8); 
            opacity: 0; 
          }
          50% { 
            transform: translate(0px, 30px) scale(1); 
            opacity: 0.7; 
          }
        }
      `}</style>
    </div>
  );
};

// Loading overlay component that centers the spinner
export const MoneyLoadingOverlay: React.FC<{
  size?: 'sm' | 'md' | 'lg' | 'xl';
  message?: string;
  className?: string;
}> = ({ size = 'lg', message = 'Loading...', className = '' }) => {
  return (
    <div className={`flex flex-col items-center justify-center min-h-[400px] space-y-4 ${className}`}>
      <MoneySpinner size={size} />
      {message && (
        <p className="text-muted-foreground text-sm animate-pulse">
          {message}
        </p>
      )}
    </div>
  );
};