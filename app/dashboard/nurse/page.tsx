"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Activity, Users, Calendar, ClipboardList, Plus } from "lucide-react";

export default function NurseDashboardPage() {
  const router = useRouter();
  const [nurseName, setNurseName] = useState("");

  useEffect(() => {
    const userStr = sessionStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user.role !== "Nurse") {
        router.push("/dashboard");
        return;
      }
      setNurseName(user.fullName);
    } else {
      router.push("/auth/login");
    }
  }, [router]);

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Activity className="h-8 w-8 text-pink-600" />
          Nurse Dashboard
        </h1>
        <p className="text-muted-foreground mt-2">
          Welcome back, {nurseName}. Manage your students' clinical health.
        </p>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="flex gap-4 flex-wrap">
          <Button onClick={() => router.push("/dashboard/nurse/students")} variant="default" className="gap-2">
            <Users className="h-4 w-4" /> View My Students
          </Button>
          <Button onClick={() => router.push("/dashboard/nurse/appointments")} variant="outline" className="gap-2">
            <Plus className="h-4 w-4" /> Create Appointment
          </Button>
          <Button onClick={() => router.push("/dashboard/nurse/medical-records")} variant="outline" className="gap-2">
            <Plus className="h-4 w-4" /> Add Medical Record
          </Button>
        </div>
      </div>
    </div>
  );
}
