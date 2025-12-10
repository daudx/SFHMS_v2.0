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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { FileText, Plus, Eye } from "lucide-react";
import { toast } from "sonner";

export default function MedicalRecordsPage() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [userRole, setUserRole] = useState("Nurse"); // TODO: Get from session
  const [formData, setFormData] = useState({
    diagnosis: "",
    treatment: "",
    notes: "",
    recordDate: new Date().toISOString().split("T")[0],
    studentId: "1", // TODO: Get from session or selection
    nurseId: "1", // TODO: Get from session
  });

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      // TODO: Add userId from session for filtering
      const response = await fetch("/api/medical-records");
      const data = await response.json();
      setRecords(data.data || []);
    } catch (error) {
      toast.error("Failed to fetch medical records");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/medical-records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success("Medical record created successfully");
        setIsDialogOpen(false);
        setFormData({
          diagnosis: "",
          treatment: "",
          notes: "",
          recordDate: new Date().toISOString().split("T")[0],
          studentId: "1",
          nurseId: "1",
        });
        fetchRecords();
      } else {
        toast.error("Failed to create medical record");
      }
    } catch (error) {
      toast.error("Error creating medical record");
    }
  };

  const canCreateRecords = userRole === "Nurse" || userRole === "Admin";

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FileText className="h-8 w-8" />
            Medical Records
          </h1>
          <p className="text-muted-foreground mt-2">
            {userRole === "Student"
              ? "View your health records and medical history"
              : "Manage patient medical documentation"}
          </p>
        </div>

        {canCreateRecords && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Record
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Medical Record</DialogTitle>
                <DialogDescription>
                  Document patient health information and treatment
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="recordDate">Record Date</Label>
                  <Input
                    id="recordDate"
                    type="date"
                    value={formData.recordDate}
                    onChange={(e) =>
                      setFormData({ ...formData, recordDate: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="diagnosis">Diagnosis</Label>
                  <Input
                    id="diagnosis"
                    value={formData.diagnosis}
                    onChange={(e) =>
                      setFormData({ ...formData, diagnosis: e.target.value })
                    }
                    placeholder="e.g., Muscle strain, Common cold"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="treatment">Treatment</Label>
                  <Textarea
                    id="treatment"
                    value={formData.treatment}
                    onChange={(e) =>
                      setFormData({ ...formData, treatment: e.target.value })
                    }
                    placeholder="Prescribed treatment and medication..."
                    rows={3}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="notes">Additional Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    placeholder="Any additional observations or recommendations..."
                    rows={2}
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Create Record</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {userRole === "Student"
              ? "Your Medical Records"
              : "Patient Medical Records"}
          </CardTitle>
          <CardDescription>
            {userRole === "Student"
              ? "Health documentation and treatment history"
              : "Complete medical history for all patients"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading medical records...</div>
          ) : records.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No medical records found.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Diagnosis</TableHead>
                  <TableHead>Treatment</TableHead>
                  <TableHead>Notes</TableHead>
                  {userRole !== "Student" && <TableHead>Patient</TableHead>}
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((record) => (
                  <TableRow key={record.RECORDID}>
                    <TableCell className="font-medium">
                      {new Date(record.RECORDDATE).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{record.DIAGNOSIS}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {record.TREATMENT}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {record.NOTES || "No notes"}
                    </TableCell>
                    {userRole !== "Student" && (
                      <TableCell>
                        <Badge variant="outline">
                          Student ID: {record.FK_STUDENTID}
                        </Badge>
                      </TableCell>
                    )}
                    <TableCell>
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
