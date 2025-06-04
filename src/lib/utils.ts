import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const errorProcess = (error: any, toast: any, defaultDescription: string, variant: string) => {
  console.error("Error occurred:", error);
  // Add more error handling logic here
  if(error.response?.status == 500) {
    // Handle 500 Internal Server Error
    toast({
      title: "Server Error",
      description: "Internal server error.",
      variant,
    });
  } else {
    toast({
      title: "Error",
      description: error.response?.data?.detail || defaultDescription,
      variant
    });
  }
}
