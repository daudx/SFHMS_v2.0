"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Shield, User, Dumbbell, Stethoscope, LogIn } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    role: "Student",
  });
  const [isLoading, setIsLoading] = useState(false);

  const roleIcons = {
    Admin: Shield,
    Student: User,
    Coach: Dumbbell,
    Nurse: Stethoscope,
  };

  const roleDescriptions = {
    Admin: "Full system access - Manage all users and data",
    Student: "Track fitness goals, appointments, and health records",
    Coach: "Create training plans and review student progress",
    Nurse: "Manage appointments and patient medical records",
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`Welcome back, ${data.user.fullName}!`);

        // Store user info in sessionStorage
        sessionStorage.setItem("user", JSON.stringify(data.user));

        // Redirect based on role
        switch (data.user.role) {
          case "Admin":
            router.push("/dashboard/admin");
            break;
          case "Coach":
            router.push("/dashboard/coach");
            break;
          case "Nurse":
            router.push("/dashboard/nurse");
            break;
          case "Student":
            router.push("/dashboard");
            break;
          default:
            router.push("/dashboard");
        }
      } else {
        toast.error(data.error || "Login failed");
      }
    } catch (error) {
      toast.error("An error occurred during login");
    } finally {
      setIsLoading(false);
    }
  };

  const quickLogin = (username: string, password: string, role: string) => {
    setFormData({ username, password, role });
    setTimeout(() => {
      document
        .getElementById("login-form")
        ?.dispatchEvent(
          new Event("submit", { bubbles: true, cancelable: true })
        );
    }, 100);
  };

  const RoleIcon = roleIcons[formData.role as keyof typeof roleIcons];

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-5xl grid md:grid-cols-2 gap-6">
        {/* Main Login Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LogIn className="h-6 w-6" />
              Student Fitness & Health Management System
            </CardTitle>
            <CardDescription>Sign in with your credentials</CardDescription>
          </CardHeader>
          <CardContent>
            <form id="login-form" onSubmit={handleLogin} className="space-y-4">
              {/* Role Selection */}
              <div className="space-y-2">
                <Label htmlFor="role">Login As</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) =>
                    setFormData({ ...formData, role: value })
                  }
                >
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Admin">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        <span>Admin</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="Student">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>Student</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="Coach">
                      <div className="flex items-center gap-2">
                        <Dumbbell className="h-4 w-4" />
                        <span>Coach</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="Nurse">
                      <div className="flex items-center gap-2">
                        <Stethoscope className="h-4 w-4" />
                        <span>Nurse</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  <RoleIcon className="inline h-4 w-4 mr-1" />
                  {
                    roleDescriptions[
                    formData.role as keyof typeof roleDescriptions
                    ]
                  }
                </p>
              </div>

              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  required
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Quick Login Demo Panel */}
        <Card className="bg-slate-50 dark:bg-slate-900">
          <CardHeader>
            <CardTitle className="text-lg">Quick Login (Demo)</CardTitle>
            <CardDescription>
              Click any button below for instant access
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Admin Quick Login */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="destructive" className="gap-1">
                  <Shield className="h-3 w-3" />
                  Admin
                </Badge>
                <span className="text-sm text-muted-foreground">
                  System Administrator
                </span>
              </div>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => quickLogin("daudx", "admin123", "Admin")}
                disabled={isLoading}
              >
                <Shield className="mr-2 h-4 w-4" />
                Login as daudx (Admin)
              </Button>
            </div>

            {/* Student Quick Logins */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="default" className="gap-1">
                  <User className="h-3 w-3" />
                  Students
                </Badge>
                <span className="text-sm text-muted-foreground">
                  4 test accounts
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => quickLogin("bob_m", "student123", "Student")}
                  disabled={isLoading}
                >
                  bob_m
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    quickLogin("alex_student", "student123", "Student")
                  }
                  disabled={isLoading}
                >
                  alex_student
                </Button>
              </div>
            </div>

            {/* Coach Quick Logins */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="gap-1">
                  <Dumbbell className="h-3 w-3" />
                  Coaches
                </Badge>
                <span className="text-sm text-muted-foreground">
                  2 test accounts
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => quickLogin("mike_coach", "coach123", "Coach")}
                  disabled={isLoading}
                >
                  mike_coach
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => quickLogin("sarah_coach", "coach123", "Coach")}
                  disabled={isLoading}
                >
                  sarah_coach
                </Button>
              </div>
            </div>

            {/* Nurse Quick Logins */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="gap-1">
                  <Stethoscope className="h-3 w-3" />
                  Nurses
                </Badge>
                <span className="text-sm text-muted-foreground">
                  2 test accounts
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    quickLogin("robert_nurse", "nurse123", "Nurse")
                  }
                  disabled={isLoading}
                >
                  robert_nurse
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => quickLogin("linda_nurse", "nurse123", "Nurse")}
                  disabled={isLoading}
                >
                  linda_nurse
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
