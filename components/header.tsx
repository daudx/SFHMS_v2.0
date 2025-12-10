"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User,
  LogOut,
  Settings,
  Heart,
  Activity,
  Dumbbell,
} from "lucide-react";
import { useEffect, useState } from "react";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState("");

  // Check if user is logged in and get user info from sessionStorage
  useEffect(() => {
    const checkAuth = () => {
      try {
        const userStr = sessionStorage.getItem("user");
        if (userStr) {
          const user = JSON.parse(userStr);
          setIsLoggedIn(true);
          setUserName(user.fullName || user.username || "User");
          setUserRole(user.role || "");
        } else {
          setIsLoggedIn(false);
        }
      } catch (error) {
        setIsLoggedIn(false);
      }
    };

    // Only check auth on dashboard pages
    if (pathname?.startsWith("/dashboard")) {
      checkAuth();
    } else if (pathname?.startsWith("/auth")) {
      setIsLoggedIn(false);
    }
  }, [pathname]);

  const handleLogout = async () => {
    try {
      // Call logout API to clear cookies
      await fetch("/api/auth/logout", { method: "POST" });
      // Clear sessionStorage
      sessionStorage.removeItem("user");
      setIsLoggedIn(false);
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
      // Fallback: clear cookies and sessionStorage manually
      document.cookie =
        "userId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      sessionStorage.removeItem("user");
      setIsLoggedIn(false);
      router.push("/");
    }
  };

  // Don't show header on auth pages or home page
  if (pathname === "/" || pathname?.startsWith("/auth")) {
    return null;
  }

  const getDashboardUrl = () => {
    if (userRole === "Admin") return "/dashboard/admin";
    if (userRole === "Coach") return "/dashboard/coach";
    if (userRole === "Nurse") return "/dashboard/nurse";
    return "/dashboard";
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-backdrop-filter:bg-white/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo - Right Side */}
        <Link href={getDashboardUrl()} className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Dumbbell className="h-8 w-8 text-blue-600" />
              <Heart className="h-4 w-4 text-emerald-600 absolute -bottom-1 -right-1" />
            </div>
            <span className="text-xl font-bold bg-linear-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
              SFHMS
            </span>
          </div>
        </Link>

        {/* Navigation Links - Center */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href={getDashboardUrl()}
            className={`text-sm font-medium transition-colors hover:text-blue-600 ${
              pathname === "/dashboard" ||
              pathname === "/dashboard/admin" ||
              pathname === "/dashboard/coach" ||
              pathname === "/dashboard/nurse"
                ? "text-blue-600"
                : "text-gray-600"
            }`}
          >
            Dashboard
          </Link>
          {userRole === "Student" && (
            <>
              <Link
                href="/dashboard/health-records"
                className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                  pathname === "/dashboard/health-records"
                    ? "text-blue-600"
                    : "text-gray-600"
                }`}
              >
                Health Records
              </Link>
              <Link
                href="/dashboard/fitness-activities"
                className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                  pathname === "/dashboard/fitness-activities"
                    ? "text-blue-600"
                    : "text-gray-600"
                }`}
              >
                Fitness
              </Link>
            </>
          )}
        </nav>

        {/* Profile Icon - Left Side */}
        {isLoggedIn ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-10 w-10 rounded-full"
              >
                <Avatar className="h-10 w-10 border-2 border-blue-100">
                  <AvatarImage src="/placeholder-user.png" alt="User" />
                  <AvatarFallback className="bg-blue-600 text-white">
                    <User className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{userName}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {userRole || "User"} Account
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {userRole === "Student" && (
                <>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/dashboard/health-records"
                      className="cursor-pointer"
                    >
                      <Heart className="mr-2 h-4 w-4" />
                      <span>Health Records</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/dashboard/fitness-activities"
                      className="cursor-pointer"
                    >
                      <Activity className="mr-2 h-4 w-4" />
                      <span>Fitness Activities</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer text-red-600"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link href="/auth/login">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/signup">Sign Up</Link>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
