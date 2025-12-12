"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Shield,
  Users,
  UserPlus,
  Activity,
  Calendar,
  ClipboardList,
  Dumbbell,
  Stethoscope,
  Database,
  Briefcase,
  Settings,
  FileText,
  Save
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

// Components
import { UsersTable } from "@/components/admin/users-table";
import { StudentsTable } from "@/components/admin/students-table";
import { CoachesTable } from "@/components/admin/coaches-table";
import { NursesTable } from "@/components/admin/nurses-table";
import { AssignmentsManager } from "@/components/admin/assignments-manager";
import { SystemSettings } from "@/components/admin/system-settings";
import { SystemLogs } from "@/components/admin/system-logs";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(res => res.json())
      .then(data => {
        if (data.success) setStats(data.stats);
      })
      .catch(console.error);
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            System Overseer & Configuration
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/database-joins">
            <Button variant="outline" className="gap-2">
              <Database className="h-4 w-4" />
              Database Joins
            </Button>
          </Link>
          <Badge variant="destructive" className="text-lg px-4 py-2">
            <Shield className="h-4 w-4 mr-2" />
            Administrator
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 lg:grid-cols-6 h-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users Management</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="settings">System Settings</TabsTrigger>
          <TabsTrigger value="logs">Activity Logs</TabsTrigger>
          <TabsTrigger value="backups">Backups</TabsTrigger>
        </TabsList>

        {/* 1. OVERVIEW */}
        <TabsContent value="overview" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Users</CardTitle></CardHeader>
              <CardContent><div className="text-2xl font-bold">{stats?.USERCOUNT || "-"}</div><p className="text-xs text-muted-foreground">Registered in system</p></CardContent></Card>

            <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Active Students</CardTitle></CardHeader>
              <CardContent><div className="text-2xl font-bold">{stats?.STUDENTCOUNT || "-"}</div><p className="text-xs text-muted-foreground">Total students enrolled</p></CardContent></Card>

            <Card className={stats?.PENDINGASSIGNMENTS > 0 ? "border-red-500" : ""} >
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-red-600">Pending Assignments</CardTitle></CardHeader>
              <CardContent><div className="text-2xl font-bold text-red-600">{stats?.PENDINGASSIGNMENTS || 0}</div><p className="text-xs text-muted-foreground">Students without Coach/Nurse</p></CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Card className="cursor-pointer hover:bg-slate-50" onClick={() => setActiveTab('users')}>
              <CardContent className="flex items-center gap-4 p-6">
                <UserPlus className="h-8 w-8 text-blue-500" />
                <div><h3 className="font-bold">Manage Users</h3><p className="text-sm text-muted-foreground">Add, Edit, Delete Users & Roles</p></div>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:bg-slate-50" onClick={() => setActiveTab('assignments')}>
              <CardContent className="flex items-center gap-4 p-6">
                <Briefcase className="h-8 w-8 text-green-500" />
                <div><h3 className="font-bold">Assign Staff</h3><p className="text-sm text-muted-foreground">Link Students to Coaches/Nurses</p></div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 2. USERS MANAGEMENT */}
        <TabsContent value="users" className="space-y-4 mt-6">
          <Tabs defaultValue="all" className="w-full">
            <TabsList>
              <TabsTrigger value="all">All Users</TabsTrigger>
              <TabsTrigger value="students">Students</TabsTrigger>
              <TabsTrigger value="coaches">Coaches</TabsTrigger>
              <TabsTrigger value="nurses">Nurses</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="mt-4"><Card><CardHeader><CardTitle>All Users Directory</CardTitle></CardHeader><CardContent><UsersTable /></CardContent></Card></TabsContent>
            <TabsContent value="students" className="mt-4"><Card><CardHeader><CardTitle>Student Roster</CardTitle></CardHeader><CardContent><StudentsTable /></CardContent></Card></TabsContent>
            <TabsContent value="coaches" className="mt-4"><Card><CardHeader><CardTitle>Coach Registry</CardTitle></CardHeader><CardContent><CoachesTable /></CardContent></Card></TabsContent>
            <TabsContent value="nurses" className="mt-4"><Card><CardHeader><CardTitle>Nurse Medical Staff</CardTitle></CardHeader><CardContent><NursesTable /></CardContent></Card></TabsContent>
          </Tabs>
        </TabsContent>

        {/* 3. ASSIGNMENTS */}
        <TabsContent value="assignments" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Student Staff Assignments</CardTitle>
              <CardDescription>Assign a Primary Coach and Primary Nurse for every student.</CardDescription>
            </CardHeader>
            <CardContent>
              <AssignmentsManager />
            </CardContent>
          </Card>
        </TabsContent>

        {/* 4. SYSTEM SETTINGS */}
        <TabsContent value="settings" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>System Configuration</CardTitle>
              <CardDescription>Manage dropdown values (Exercise Types, Medical Categories, etc.)</CardDescription>
            </CardHeader>
            <CardContent>
              <SystemSettings />
            </CardContent>
          </Card>
        </TabsContent>

        {/* 5. ACTIVITY LOGS */}
        <TabsContent value="logs" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>System Activity Logs</CardTitle>
              <CardDescription>Audit trail of administrative actions.</CardDescription>
            </CardHeader>
            <CardContent>
              <SystemLogs />
            </CardContent>
          </Card>
        </TabsContent>

        {/* 6. BACKUPS */}
        <TabsContent value="backups" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Database Backup & Restore</CardTitle>
              <CardDescription>Create system checkpoints.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Button><Save className="h-4 w-4 mr-2" /> Create New Backup</Button>
                <Button variant="outline"><Database className="h-4 w-4 mr-2" /> Restore from File</Button>
              </div>
              <div className="border rounded p-4 bg-slate-50 text-muted-foreground text-sm">
                _Feature unavailable in demo environment_
              </div>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}
