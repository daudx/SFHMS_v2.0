"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dumbbell, Users, Activity, FileText, Plus, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function CoachDashboardPage() {
  const router = useRouter();
  const [coachName, setCoachName] = useState<string>("");
  const [stats, setStats] = useState({
    studentsCount: 0,
    assessmentsCount: 0,
    plansCount: 0,
    recentLogsCount: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userStr = sessionStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user.role !== "Coach") {
        toast.error("Access denied. Coach role required.");
        router.push("/dashboard");
        return;
      }
      setCoachName(user.fullName);
      fetchStats(user.coachId || user.userId);
    } else {
      router.push("/auth/login");
    }
  }, [router]);

  const fetchStats = async (userId: number) => {
    try {
      setLoading(true);
      // Fetches simple counts for the dashboard
      // We can reuse existing endpoints or create a dedicated stats one. 
      // For now, let's fetch lists and count length to save time creating new API.

      const [studentsRes, plansRes, assessmentsRes] = await Promise.all([
        fetch("/api/coach/students", { headers: { "x-coach-id": userId.toString() } }),
        fetch(`/api/training-plans?coachId=${userId}`),
        fetch(`/api/coach/assessments?coachId=${userId}`)
      ]);

      const studentsData = await studentsRes.json();
      const plansData = await plansRes.json();
      const assessmentsData = await assessmentsRes.json();

      setStats({
        studentsCount: studentsData.success ? studentsData.students.length : 0,
        plansCount: plansData.success ? plansData.data.length : 0,
        assessmentsCount: assessmentsData.success ? assessmentsData.data.length : 0,
        recentLogsCount: 0 // Placeholder, fetching logs is heavier, maybe skip or implement later
      });

    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Dumbbell className="h-8 w-8 text-blue-600" />
          Coach Dashboard
        </h1>
        <p className="text-muted-foreground mt-2">
          Welcome back, {coachName}! Here is an overview of your coaching activity.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assigned Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats.studentsCount}</div>
            <p className="text-xs text-muted-foreground">Active students under your supervision</p>
            <Button variant="link" className="px-0 h-auto mt-2" onClick={() => router.push("/dashboard/coach/students")}>
              View Details <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Assessments</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats.assessmentsCount}</div>
            <p className="text-xs text-muted-foreground">Assessments created by you</p>
            <Button variant="link" className="px-0 h-auto mt-2" onClick={() => router.push("/dashboard/coach/assessments")}>
              Manage Assessments <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Training Plans</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats.plansCount}</div>
            <p className="text-xs text-muted-foreground">Plans available to assign</p>
            <Button variant="link" className="px-0 h-auto mt-2" onClick={() => router.push("/dashboard/coach/training-plans")}>
              View Plans <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="flex gap-4">
          <Button onClick={() => router.push("/dashboard/coach/training-plans")} className="gap-2">
            <Plus className="h-4 w-4" /> Create Training Plan
          </Button>
          <Button onClick={() => router.push("/dashboard/coach/assessments")} variant="outline" className="gap-2">
            <Plus className="h-4 w-4" /> New Assessment
          </Button>
          <Button onClick={() => router.push("/dashboard/coach/students")} variant="secondary" className="gap-2">
            <Users className="h-4 w-4" /> View My Students
          </Button>
        </div>
      </div>
    </div>
  );
}
