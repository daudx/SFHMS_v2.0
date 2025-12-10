"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Stethoscope, Calendar, Users, FileText } from "lucide-react";

export default function NurseDashboardPage() {
  const [stats, setStats] = useState({
    todayAppointments: 0,
    weekAppointments: 0,
    totalPatients: 0,
    pendingRecords: 0,
  });

  useEffect(() => {
    fetchNurseStats();
  }, []);

  const fetchNurseStats = async () => {
    try {
      // TODO: Fetch real stats from analytics API
      setStats({
        todayAppointments: 5,
        weekAppointments: 18,
        totalPatients: 42,
        pendingRecords: 3,
      });
    } catch (error) {
      console.error("Error fetching nurse stats:", error);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Stethoscope className="h-8 w-8" />
          Nurse Dashboard
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage appointments and patient health records
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Today's Appointments
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayAppointments}</div>
            <p className="text-xs text-muted-foreground">Scheduled for today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.weekAppointments}</div>
            <p className="text-xs text-muted-foreground">Total appointments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Patients
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPatients}</div>
            <p className="text-xs text-muted-foreground">Under your care</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Records
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingRecords}</div>
            <p className="text-xs text-muted-foreground">Need documentation</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="appointments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="patients">Patients</TabsTrigger>
          <TabsTrigger value="records">Medical Records</TabsTrigger>
        </TabsList>

        <TabsContent value="appointments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Today's Schedule</CardTitle>
              <CardDescription>Upcoming appointments for today</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    time: "09:00 AM",
                    student: "Student A",
                    purpose: "Routine Checkup",
                  },
                  {
                    time: "10:30 AM",
                    student: "Student B",
                    purpose: "Injury Consultation",
                  },
                  {
                    time: "02:00 PM",
                    student: "Student C",
                    purpose: "Follow-up",
                  },
                  {
                    time: "03:30 PM",
                    student: "Student D",
                    purpose: "Health Assessment",
                  },
                  {
                    time: "04:45 PM",
                    student: "Student E",
                    purpose: "Vaccination",
                  },
                ].map((appt, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">
                        {appt.time} - {appt.student}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {appt.purpose}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Badge>Scheduled</Badge>
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patients" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Patient List</CardTitle>
              <CardDescription>Students under your care</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">Patient {i}</p>
                      <p className="text-sm text-muted-foreground">
                        Last visit:{" "}
                        {new Date(
                          Date.now() - i * 86400000 * 7
                        ).toLocaleDateString()}
                      </p>
                    </div>
                    <Button size="sm" variant="outline">
                      View Health Profile
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="records" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Medical Records</CardTitle>
              <CardDescription>Latest health documentation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">Medical Record #{1000 + i}</p>
                      <p className="text-sm text-muted-foreground">
                        Patient {i} -{" "}
                        {new Date(
                          Date.now() - i * 86400000
                        ).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="outline">Completed</Badge>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-center">
                <Button variant="link" asChild>
                  <a href="/dashboard/medical-records">View All Records</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
