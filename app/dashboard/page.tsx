"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Activity, Dumbbell, Heart, Stethoscope, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    // Role check
    const userStr = sessionStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      setUserRole(user.role);
      // If not student, redirect to respective dashboard (safety check, though header handles this)
      if (user.role === "admin") router.push("/dashboard/admin");
      if (user.role === "Coach") router.push("/dashboard/coach");
      if (user.role === "Nurse") router.push("/dashboard/nurse");

      // Fetch stats only if student (or user)
      if (user.role === "Student" || !user.role || user.role === "User") {
        fetch("/api/student/dashboard")
          .then(res => res.json())
          .then(data => {
            if (data.success) setStats(data.data);
          })
          .catch(console.error)
          .finally(() => setLoading(false));
      }
    } else {
      router.push("/auth/login");
    }
  }, [router]);

  if (loading) return <div className="p-8 space-y-4"><Skeleton className="h-12 w-1/3" /><Skeleton className="h-64 w-full" /></div>;

  return (
    <div className="min-h-screen bg-slate-50 p-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-slate-900">Dashboard Overview</h1>
        <p className="text-slate-600">Welcome back! Here is your health & fitness summary.</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 1. Next Appointment */}
        <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Next Appointment</CardTitle>
            <Calendar className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.nextAppointment ? new Date(stats.nextAppointment.APPOINTMENTDATE).toLocaleDateString() : "No upcoming"}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats?.nextAppointment ? stats.nextAppointment.TIME || "Time TBD" : "Check back later"}
            </p>
          </CardContent>
        </Card>

        {/* 2. Latest Plan */}
        <Card className="border-l-4 border-l-emerald-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Active Plan</CardTitle>
            <Dumbbell className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold truncate">{stats?.latestPlan?.PLANNAME || "No active plan"}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats?.latestPlan ? `Assigned: ${stats.latestPlan.ASSIGNEDDATE}` : "Ask your coach"}
            </p>
          </CardContent>
        </Card>

        {/* 3. Latest Assessment */}
        <Card className="border-l-4 border-l-purple-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Latest Assessment</CardTitle>
            <Activity className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.latestAssessment?.PERFORMANCESCORE ? `Score: ${stats.latestAssessment.PERFORMANCESCORE}` : "N/A"}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats?.latestAssessment ? `Date: ${stats.latestAssessment.ASSESSMENTDATE}` : "No assessments yet"}
            </p>
          </CardContent>
        </Card>

        {/* 4. Recent Log */}
        <Card className="border-l-4 border-l-orange-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Recent Activity</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.recentLog?.ACTIVITYTYPE || "Inactive"}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats?.recentLog ? new Date(stats.recentLog.LOGDATE).toLocaleDateString() : "Log your first workout!"}
            </p>
          </CardContent>
        </Card>

        {/* 5. Last Checkup */}
        <Card className="border-l-4 border-l-red-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Last Check-up</CardTitle>
            <Stethoscope className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.lastCheckup ? new Date(stats.lastCheckup).toLocaleDateString() : "Never"}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Detailed records available
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mt-6">
        {/* Quick Actions / Links */}
        <Card>
          <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
          <CardContent className="grid gap-4">
            <Button onClick={() => router.push('/dashboard/fitness-activities')} className="w-full justify-start" variant="outline"><Activity className="mr-2 h-4 w-4" /> Log New Activity</Button>
            <Button onClick={() => router.push('/dashboard/my-plan')} className="w-full justify-start" variant="outline"><Dumbbell className="mr-2 h-4 w-4" /> View Training Plan</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Medical Profile</CardTitle></CardHeader>
          <CardContent className="grid gap-4">
            <Button onClick={() => router.push('/dashboard/profile')} className="w-full justify-start" variant="outline"><Heart className="mr-2 h-4 w-4" /> View Health Profile</Button>
            <Button onClick={() => router.push('/dashboard/medical-records')} className="w-full justify-start" variant="outline"><Stethoscope className="mr-2 h-4 w-4" /> View Clinical Records</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

