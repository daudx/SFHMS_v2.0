"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Heart,
  Calendar,
  FileText,
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

export default function HealthRecordsPage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    fetchRecords();
  }, [router]);

  const fetchRecords = async () => {
    try {
      const res = await fetch("/api/health-records");

      if (res.status === 401) {
        router.push("/auth/login");
        return;
      }

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to fetch health records");
      }

      const data = await res.json();
      setRecords(data);
    } catch (error) {
      console.error("Error fetching health records:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load health records"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAddRecord = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      visitDate: formData.get("visitDate"),
      diagnosis: formData.get("diagnosis"),
      prescription: formData.get("prescription"),
      notes: formData.get("notes"),
      nurseId: 1, // Default nurse ID
    };

    try {
      const res = await fetch("/api/health-records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to add record");
      }

      toast({
        title: "Success",
        description: "Health record added successfully",
      });

      setIsAddDialogOpen(false);
      await fetchRecords();
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to add record",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRecord = async (recordId: number) => {
    if (!confirm("Are you sure you want to delete this record?")) return;

    try {
      const res = await fetch(`/api/health-records?id=${recordId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete record");
      }

      toast({
        title: "Success",
        description: "Health record deleted successfully",
      });

      await fetchRecords();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete record",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-8">
        <div className="max-w-4xl mx-auto">
          <div className="skeleton h-12 w-64 mb-6" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-32 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-8">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">{error}</p>
            <p className="text-sm text-gray-600 mb-4">
              Please sign up or login to access your health records.
            </p>
            <div className="flex gap-2">
              <Button
                onClick={() => router.push("/auth/signup")}
                className="flex-1"
              >
                Sign Up
              </Button>
              <Button
                onClick={() => router.push("/auth/login")}
                variant="outline"
                className="flex-1"
              >
                Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-4">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Heart className="w-8 h-8 text-blue-600" />
              Health Records
            </h1>
            <p className="text-gray-600 mt-1">
              Track your medical checkups and vital signs
            </p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="btn-animate">
                <Plus className="w-4 h-4 mr-2" />
                Add Record
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add Health Record</DialogTitle>
                <DialogDescription>
                  Add a new health record to track your medical visits
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddRecord} className="space-y-4">
                <div>
                  <Label htmlFor="visitDate">Visit Date</Label>
                  <Input
                    id="visitDate"
                    name="visitDate"
                    type="date"
                    required
                    max={new Date().toISOString().split("T")[0]}
                  />
                </div>
                <div>
                  <Label htmlFor="diagnosis">Diagnosis</Label>
                  <Input
                    id="diagnosis"
                    name="diagnosis"
                    placeholder="e.g., Regular checkup, Flu, etc."
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="prescription">Prescription</Label>
                  <Textarea
                    id="prescription"
                    name="prescription"
                    placeholder="Medications prescribed..."
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    placeholder="Additional notes..."
                    rows={3}
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? "Adding..." : "Add Record"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {records.length > 0 ? (
          <div className="space-y-4">
            {records.map((record: any, idx: number) => (
              <Card
                key={record.id}
                className="card-premium animate-slideInLeft"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-blue-600" />
                        {new Date(record.visit_date).toLocaleDateString()}
                      </CardTitle>
                      {record.diagnosis && (
                        <CardDescription className="mt-2">
                          <strong>Diagnosis:</strong> {record.diagnosis}
                        </CardDescription>
                      )}
                    </div>
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {record.prescription && (
                    <div>
                      <p className="text-sm font-semibold text-gray-700">
                        Prescription:
                      </p>
                      <p className="text-sm text-gray-600">
                        {record.prescription}
                      </p>
                    </div>
                  )}
                  {record.notes && (
                    <div>
                      <p className="text-sm font-semibold text-gray-700">
                        Notes:
                      </p>
                      <p className="text-sm text-gray-600">{record.notes}</p>
                    </div>
                  )}
                  <div className="pt-2 border-t flex justify-between items-center">
                    <p className="text-xs text-gray-500">
                      Record ID: {record.id}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteRecord(record.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="card-premium">
            <CardContent className="text-center py-12">
              <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                No Health Records Yet
              </h3>
              <p className="text-gray-600 mb-4">
                Start tracking your health by adding your first record
              </p>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Record
                  </Button>
                </DialogTrigger>
              </Dialog>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
