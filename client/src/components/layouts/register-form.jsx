import { useState } from "react";
import { GalleryVerticalEnd, HeartPulse, Activity } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function RegisterForm({
  className,
  ...props
}) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [healthData, setHealthData] = useState({
    heartRate: null,
    SpO2: null
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitted(true);
    setIsAnimating(true);

    try {
      const response = await fetch(import.meta.env.VITE_BACKEND_URL + '/api/v1/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_API_KEY}`
        },
      });
      const data = await response.json();
      setHealthData({
        heartRate: data.heartRate,
        SpO2: data.SpO2
      });
    } catch (error) {
      console.error("Error during registration:", error);
    }
  };

  if (isSubmitted) {
    return (
      <div className={cn("flex flex-col items-center gap-8 p-6", className)} {...props}>
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Registration Successful!</h1>
          <p className="text-muted-foreground">
            Connecting to your health monitoring device...
          </p>
        </div>

        <div className="w-full max-w-md space-y-8">
          {/* Heart Rate Animation */}
          <div className="bg-card rounded-lg p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <HeartPulse className="h-6 w-6 text-red-500" />
              <h3 className="font-medium">Heart Rate</h3>
              <span className="ml-auto font-mono text-lg">
                {isAnimating ? (
                  <span className="animate-pulse">{healthData.heartRate || '--'}</span>
                ) : (
                  `${healthData.heartRate || '--'} bpm`
                )}
              </span>
            </div>
            <div className="h-12 relative">
              {isAnimating && (
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute bottom-0 h-full w-full flex items-end">
                    {[...Array(20)].map((_, i) => (
                      <div
                        key={i}
                        className="h-1 bg-red-500 rounded-full mx-0.5"
                        style={{
                          height: `${(healthData.heartRate ? (healthData.heartRate - 60) : 10) + Math.random() * 10}%`,
                          width: "4px",
                          animation: `pulse ${0.5 + Math.random() * 0.5}s infinite alternate`,
                          animationDelay: `${i * 0.1}s`
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* SpO2 Animation */}
          <div className="bg-card rounded-lg p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <Activity className="h-6 w-6 text-blue-500" />
              <h3 className="font-medium">Blood Oxygen (SpO₂)</h3>
              <span className="ml-auto font-mono text-lg">
                {isAnimating ? (
                  <span className="animate-pulse">{healthData.SpO2 || '--'}</span>
                ) : (
                  `${healthData.SpO2 || '--'}%`
                )}
              </span>
            </div>
            <div className="h-12 relative">
              {isAnimating && (
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute bottom-0 h-full w-full flex items-end">
                    {[...Array(20)].map((_, i) => (
                      <div
                        key={i}
                        className="h-1 bg-blue-500 rounded-full mx-0.5"
                        style={{
                          height: `${(healthData.SpO2 ? (healthData.SpO2 - 90) : 8) + Math.random() * 10}%`,
                          width: "4px",
                          animation: `pulse ${1 + Math.random() * 0.5}s infinite`,
                          animationDelay: `${i * 0.2}s`
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <Button className="w-full" onClick={() => setIsSubmitted(false)}>
            Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2">
            <a href="#" className="flex flex-col items-center gap-2 font-medium">
              <div className="flex size-8 items-center justify-center rounded-md">
                <GalleryVerticalEnd className="size-6" />
              </div>
              <span className="sr-only">Health Monitor</span>
            </a>
            <div className='space-y-1 text-center'>
              <h1 className="text-xl font-bold">
                Register for Health Monitoring System
              </h1>
              <p className='text-muted-foreground'>
                Create your account to start tracking your health
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-3">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" type="text" placeholder="John" required />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" type="text" placeholder="Doe" required />
              </div>
            </div>
            
            <div className="grid gap-3">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="m@example.com" required />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-3">
                <Label htmlFor="age">Age</Label>
                <Input id="age" type="number" placeholder="30" min="0" max="120" required />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="contactNumber">Contact Number</Label>
                <Input id="contactNumber" type="tel" placeholder="+1 (555) 123-4567" required />
              </div>
            </div>
            
            <div className="grid gap-3">
              <Label htmlFor="gender">Gender</Label>
              <Select required>
                <SelectTrigger id="gender">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button type="submit" className="w-full">
              Register
            </Button>
          </div>
        </div>
      </form>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>

      <style jsx>{`
        @keyframes pulse {
          0% { opacity: 0.6; }
          50% { opacity: 1; }
          100% { opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}