"use client";

import { useState } from "react";
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
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { UsersTable } from "@/components/admin/users-table";
import { StudentsTable } from "@/components/admin/students-table";
import { CoachesTable } from "@/components/admin/coaches-table";
import { NursesTable } from "@/components/admin/nurses-table";
import { HealthProfilesTable } from "@/components/admin/health-profiles-table";
import { FitnessLogsTable } from "@/components/admin/fitness-logs-table";
import Link from "next/link";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  const adminSections = [
    { id: "users", label: "Users", icon: Users, color: "blue" },
    { id: "students", label: "Students", icon: UserPlus, color: "green" },
    { id: "coaches", label: "Coaches", icon: Dumbbell, color: "purple" },
    { id: "nurses", label: "Nurses", icon: Stethoscope, color: "red" },
    { id: "health", label: "Health Profiles", icon: Activity, color: "orange" },
    { id: "fitness", label: "Fitness Logs", icon: Activity, color: "cyan" },
    { id: "goals", label: "Goals", icon: ClipboardList, color: "yellow" },
    {
      id: "appointments",
      label: "Appointments",
      icon: Calendar,
      color: "pink",
    },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Full control and management of all system entities
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/database-joins">
            <Button variant="outline" className="gap-2">
              <Database className="h-4 w-4" />
              Database JOINs
            </Button>
          </Link>
          <Badge variant="destructive" className="text-lg px-4 py-2">
            <Shield className="h-4 w-4 mr-2" />
            Administrator
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 lg:grid-cols-8 h-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          {adminSections.map((section) => (
            <TabsTrigger
              key={section.id}
              value={section.id}
              className="text-xs"
            >
              <section.icon className="h-4 w-4 mr-1" />
              {section.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {adminSections.map((section) => (
              <Card
                key={section.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setActiveTab(section.id)}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <section.icon className="h-5 w-5" />
                    {section.label}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full" size="sm">
                    Manage {section.label}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Admin Capabilities</CardTitle>
              <CardDescription>
                Full CRUD operations on all entities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <h4 className="font-semibold">✓ User Management</h4>
                  <ul className="space-y-1 text-muted-foreground ml-4">
                    <li>• Create, Read, Update, Delete users</li>
                    <li>• Manage roles (Student, Coach, Nurse, Admin)</li>
                    <li>• Reset passwords</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">✓ Data Management</h4>
                  <ul className="space-y-1 text-muted-foreground ml-4">
                    <li>• Full access to all records</li>
                    <li>• Bulk operations</li>
                    <li>• Data export/import</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">✓ System Oversight</h4>
                  <ul className="space-y-1 text-muted-foreground ml-4">
                    <li>• View all activities and logs</li>
                    <li>• Generate system reports</li>
                    <li>• Monitor database health</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">✓ Configuration</h4>
                  <ul className="space-y-1 text-muted-foreground ml-4">
                    <li>• System settings</li>
                    <li>• Database maintenance</li>
                    <li>• Backup and restore</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-6 w-6" />
                Manage Users
              </CardTitle>
              <CardDescription>
                Full CRUD operations for system users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UsersTable />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="students" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-6 w-6" />
                Manage Students
              </CardTitle>
              <CardDescription>
                Full CRUD operations for students
              </CardDescription>
            </CardHeader>
            <CardContent>
              <StudentsTable />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="coaches" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Dumbbell className="h-6 w-6" />
                Manage Coaches
              </CardTitle>
              <CardDescription>
                Full CRUD operations for coaches
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CoachesTable />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="nurses" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="h-6 w-6" />
                Manage Nurses
              </CardTitle>
              <CardDescription>Full CRUD operations for nurses</CardDescription>
            </CardHeader>
            <CardContent>
              <NursesTable />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="health" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-6 w-6" />
                Manage Health Profiles
              </CardTitle>
              <CardDescription>
                Full CRUD operations for health profiles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <HealthProfilesTable />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fitness" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-6 w-6" />
                Manage Fitness Logs
              </CardTitle>
              <CardDescription>
                Full CRUD operations for fitness activity logs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FitnessLogsTable />
            </CardContent>
          </Card>
        </TabsContent>

        {adminSections
          .filter(
            (s) =>
              ![
                "users",
                "students",
                "coaches",
                "nurses",
                "health",
                "fitness",
              ].includes(s.id)
          )
          .map((section) => (
            <TabsContent key={section.id} value={section.id} className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <section.icon className="h-6 w-6" />
                    Manage {section.label}
                  </CardTitle>
                  <CardDescription>
                    Full CRUD operations for {section.label.toLowerCase()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Button>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Create New
                      </Button>
                      <Button variant="outline">Import</Button>
                      <Button variant="outline">Export</Button>
                    </div>

                    <div className="border rounded-lg p-8 text-center text-muted-foreground">
                      <section.icon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>
                        CRUD interface for {section.label} will be implemented
                        here
                      </p>
                      <p className="text-sm mt-2">
                        Features: Create, Read, Update, Delete, Search, Filter
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
      </Tabs>
    </div>
  );
}
