import React, { useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { AnimatedBackground } from "@/components/animated-background";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <AnimatedBackground />
      <Card className="max-w-md w-full relative z-10">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-bold">404</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-xl text-gray-600">
            Oops! The page <code className="bg-gray-100 px-1 rounded">{location.pathname}</code> was not found.
          </p>
          <p className="text-gray-500">
            This might be because:
          </p>
          <ul className="list-disc list-inside text-gray-500 text-left max-w-xs mx-auto mb-4">
            <li>The URL was typed incorrectly.</li>
            <li>The page has been moved or deleted.</li>
            <li>You followed an outdated or broken link.</li>
          </ul>
          <p className="text-gray-600 p-6">
            Try going back to the homepage or explore other sections of our site.
          </p>
          <Link to="/">
            <Button className="w-full" variant="default">
              Return to Home
            </Button>
          </Link>
          <div className="mt-4 text-sm text-gray-400">
            If you think this is an error, please contact support.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;
