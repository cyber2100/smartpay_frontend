import React, { useEffect, useState } from "react";
import { AnimatedBackground } from "@/components/animated-background";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface TimeLeft {
  hours: number;
  minutes: number;
  seconds: number;
}

const Maintenance: React.FC = () => {
  const maintenanceEndTime = new Date(Date.now() + 2 * 60 * 60 * 1000);

  const calculateTimeLeft = (): TimeLeft | null => {
    const now = new Date();
    const diff = maintenanceEndTime.getTime() - now.getTime();
    if (diff <= 0) return null;

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return { hours, minutes, seconds };
  };

  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <AnimatedBackground />
      <Card className="max-w-md w-full relative z-10">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-bold">Maintenance Mode</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-xl text-gray-600">
            Our website is currently undergoing scheduled maintenance.
          </p>
          {timeLeft ? (
            <div className="text-2xl font-mono text-gray-700">
              Estimated time left:{" "}
              <span className="font-bold">
                {String(timeLeft.hours).padStart(2, "0")}:
                {String(timeLeft.minutes).padStart(2, "0")}:
                {String(timeLeft.seconds).padStart(2, "0")}
              </span>{" "}
              (HH:MM:SS)
            </div>
          ) : (
            <p className="text-gray-600">Maintenance should be complete shortly. Please refresh the page later.</p>
          )}
          <p className="text-gray-500 mt-4">
            Thank you for your patience. If you need urgent assistance, please contact support.
          </p>
          <Button className="mt-6 w-full" variant="default" onClick={() => window.location.reload()}>
            Refresh Page
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Maintenance;
