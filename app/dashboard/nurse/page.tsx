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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Stethoscope, Users, Calendar, FileText, Activity } from "lucide-react";
import { toast } from "sonner";

interface Patient {
  STUDENTID: number;
  FIRSTNAME: string;
  LASTNAME: string;
  GENDER: string;
  DATEOFBIRTH: string;
  BLOODTYPE: string;
  LASTAPPOINTMENT: string;
  APPOINTMENTCOUNT: number;
  RECORDCOUNT: number;
}

interface Appointment {
  APPOINTMENTID: number;
  APPOINTMENTDATE: string;
  APPOINTMENTTIME: string;
  STATUS: string;
  REASON: string;
  STUDENTNAME: string;
}

interface MedicalRecord {
  RECORDID: number;
  VISITDATE: string;
  DIAGNOSIS: string;
  PRESCRIPTION: string;
  NOTES: string;
  STUDENTNAME: string;
}

export default function NurseDashboardPage() {
  const router = useRouter();
  const [nurseId, setNurseId] = useState<number | null>(null);
  const [nurseName, setNurseName] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    totalAppointments: 0,
    upcomingAppointments: 0,
    medicalRecords: 0,
    activePatients: 0,
  });

  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [records, setRecords] = useState<MedicalRecord[]>([]);

  useEffect(() => {
    const userStr = sessionStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      console.log("[Nurse Dashboard] User from session:", user);
      if (user.role !== "Nurse") {
        toast.error("Access denied. Nurse role required.");
        router.push("/dashboard");
        return;
      }
      const nurseIdToUse = user.nurseId || user.userId;
      console.log("[Nurse Dashboard] Using nurse ID:", nurseIdToUse);
      setNurseId(nurseIdToUse);
      setNurseName(user.fullName);
      fetchAllData(nurseIdToUse);
    } else {
      toast.error("Please login first");
      router.push("/auth/login");
    }
  }, [router]);

  const fetchAllData = async (userId: number) => {
    console.log("[Nurse Dashboard] Fetching all data for nurse ID:", userId);
    setLoading(true);
    try {
      await Promise.all([
        fetchNurseStats(userId),
        fetchPatients(userId),
        fetchAppointments(userId),
        fetchRecords(userId),
      ]);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const fetchNurseStats = async (userId: number) => {
    try {
      console.log("[Nurse Dashboard] Fetching stats for nurse ID:", userId);
      const response = await fetch("/api/nurse/stats", {
        headers: { "x-nurse-id": userId.toString() },
      });
      const data = await response.json();
      console.log("[Nurse Dashboard] Stats response:", data);
      if (data.success) {
        setStats(data.stats);
      } else {
        console.error("[Nurse Dashboard] Stats fetch failed:", data.error);
      }
    } catch (error) {
      console.error("Error fetching nurse stats:", error);
    }
  };

  const fetchPatients = async (userId: number) => {
    try {
      console.log("[Nurse Dashboard] Fetching patients for nurse ID:", userId);
      const response = await fetch("/api/nurse/patients", {
        headers: { "x-nurse-id": userId.toString() },
      });
      const data = await response.json();
      console.log("[Nurse Dashboard] Patients response:", data);
      if (data.success) {
        setPatients(data.patients);
      } else {
        console.error("[Nurse Dashboard] Patients fetch failed:", data.error);
      }
    } catch (error) {
      console.error("Error fetching patients:", error);
    }
  };

  const fetchAppointments = async (userId: number) => {
    try {
      const response = await fetch("/api/nurse/appointments", {
        headers: { "x-nurse-id": userId.toString() },
      });
      const data = await response.json();
      if (data.success) {
        setAppointments(data.appointments);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
    }
  };

  const fetchRecords = async (userId: number) => {
    try {
      const response = await fetch("/api/nurse/records", {
        headers: { "x-nurse-id": userId.toString() },
      });
      const data = await response.json();
      if (data.success) {
        setRecords(data.records);
      }
    } catch (error) {
      console.error("Error fetching records:", error);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Stethoscope className="h-12 w-12 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Scheduled":
        return "default";
      case "Completed":
        return "secondary";
      case "Cancelled":
        return "destructive";
      default:
        return "outline";
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
          Welcome back, {nurseName}! Manage patient care and medical records
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Appointments
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAppointments}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Upcoming Appointments
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcomingAppointments}</div>
            <p className="text-xs text-muted-foreground">Next 7 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Medical Records
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.medicalRecords}</div>
            <p className="text-xs text-muted-foreground">Total created</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Patients
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activePatients}</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="patients" className="space-y-4">
        <TabsList>
          <TabsTrigger value="patients">My Patients ({patients.length})</TabsTrigger>
          <TabsTrigger value="appointments">Appointments ({appointments.length})</TabsTrigger>
          <TabsTrigger value="records">Medical Records ({records.length})</TabsTrigger>
        </TabsList>

        {/* Patients Tab */}
        <TabsContent value="patients" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>My Patients</CardTitle>
              <CardDescription>
                Students under your medical care
              </CardDescription>
            </CardHeader>
            <CardContent>
              {patients.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No patients assigned yet</p>
                  <p className="text-sm mt-2">
                    Patients will appear here when you schedule appointments
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {patients.map((patient) => (
                    <div
                      key={patient.STUDENTID}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                    >
                      <div className="flex-1">
                        <p className="font-medium">
                          {patient.FIRSTNAME} {patient.LASTNAME}
                        </p>
                        <div className="flex gap-4 mt-1 text-sm text-muted-foreground">
                          <span>🩸 {patient.BLOODTYPE || "N/A"}</span>
                          <span>📅 {patient.APPOINTMENTCOUNT} appointments</span>
                          <span>📋 {patient.RECORDCOUNT} records</span>
                          {patient.LASTAPPOINTMENT && (
                            <span>
                              🕒 Last visit:{" "}
                              {new Date(patient.LASTAPPOINTMENT).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <Badge variant="secondary">{patient.GENDER}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appointments Tab */}
        <TabsContent value="appointments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Appointments</CardTitle>
              <CardDescription>
                All scheduled and past appointments
              </CardDescription>
            </CardHeader>
            <CardContent>
              {appointments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No appointments scheduled</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {appointments.map((appointment) => (
                    <div
                      key={appointment.APPOINTMENTID}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{appointment.STUDENTNAME}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {appointment.REASON || "General checkup"}
                        </p>
                        <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                          <span>
                            📅 {new Date(appointment.APPOINTMENTDATE).toLocaleDateString()}
                          </span>
                          <span>🕐 {appointment.APPOINTMENTTIME}</span>
                        </div>
                      </div>
                      <Badge variant={getStatusVariant(appointment.STATUS)}>
                        {appointment.STATUS}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Medical Records Tab */}
        <TabsContent value="records" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Medical Records</CardTitle>
              <CardDescription>
                Patient medical records you've created
              </CardDescription>
            </CardHeader>
            <CardContent>
              {records.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No medical records yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {records.map((record) => (
                    <div
                      key={record.RECORDID}
                      className="p-4 border rounded-lg"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium">{record.STUDENTNAME}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(record.VISITDATE).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <p className="text-sm font-medium">Diagnosis:</p>
                          <p className="text-sm text-muted-foreground">
                            {record.DIAGNOSIS || "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Prescription:</p>
                          <p className="text-sm text-muted-foreground">
                            {record.PRESCRIPTION || "N/A"}
                          </p>
                        </div>
                        {record.NOTES && (
                          <div>
                            <p className="text-sm font-medium">Notes:</p>
                            <p className="text-sm bg-muted p-3 rounded">
                              {record.NOTES}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
