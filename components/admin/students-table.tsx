"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { toast } from "sonner";

export function StudentsTable() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  // Create state removed
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [formData, setFormData] = useState({
    userId: "",
    dateOfBirth: "",
    enrollmentDate: "",
    major: "",
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/students");
      const data = await response.json();
      setStudents(data.data || []);
    } catch (error) {
      toast.error("Failed to fetch students");
    } finally {
      setLoading(false);
    }
  };

  // handleCreate removed - use Users Management tab instead

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/admin/students", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: selectedStudent.STUDENTID,
          dateOfBirth: formData.dateOfBirth,
          enrollmentDate: formData.enrollmentDate,
          major: formData.major,
        }),
      });

      if (response.ok) {
        toast.success("Student updated successfully");
        setIsEditOpen(false);
        fetchStudents();
      } else {
        toast.error("Failed to update student");
      }
    } catch (error) {
      toast.error("Error updating student");
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(
        `/api/admin/students?studentId=${selectedStudent.STUDENTID}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        toast.success("Student deleted successfully");
        setIsDeleteOpen(false);
        setSelectedStudent(null);
        fetchStudents();
      } else {
        toast.error("Failed to delete student");
      }
    } catch (error) {
      toast.error("Error deleting student");
    }
  };

  const openEditDialog = (student: any) => {
    setSelectedStudent(student);
    const dob = student.DATEOFBIRTH
      ? new Date(student.DATEOFBIRTH).toISOString().split("T")[0]
      : "";
    const enroll = student.ENROLLMENTDATE
      ? new Date(student.ENROLLMENTDATE).toISOString().split("T")[0]
      : "";
    setFormData({
      userId: student.FK_USERID?.toString() || "",
      dateOfBirth: dob,
      enrollmentDate: enroll,
      major: student.MAJOR || "",
    });
    setIsEditOpen(true);
  };

  const filteredStudents = students.filter((student) =>
    Object.values(student).some((val) =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="space-y-4">
      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Date of Birth</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Emergency Contact</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center text-muted-foreground py-8"
                  >
                    No students found
                  </TableCell>
                </TableRow>
              ) : (
                filteredStudents.map((student) => (
                  <TableRow key={student.STUDENTID}>
                    <TableCell>{student.STUDENTID}</TableCell>
                    <TableCell className="font-medium">
                      {student.FULLNAME || "N/A"}
                    </TableCell>
                    <TableCell>{student.EMAIL || "N/A"}</TableCell>
                    <TableCell>
                      {student.DATEOFBIRTH
                        ? new Date(student.DATEOFBIRTH).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                          }
                        )
                        : "N/A"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {student.GENDER || "Not Set"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {student.EMERGENCYCONTACTPHONE || "N/A"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditDialog(student)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            setSelectedStudent(student);
                            setIsDeleteOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
            <DialogDescription>Update student information</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <Label htmlFor="edit-dateOfBirth">Date of Birth</Label>
              <Input
                id="edit-dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) =>
                  setFormData({ ...formData, dateOfBirth: e.target.value })
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-enrollmentDate">Enrollment Date</Label>
              <Input
                id="edit-enrollmentDate"
                type="date"
                value={formData.enrollmentDate}
                onChange={(e) =>
                  setFormData({ ...formData, enrollmentDate: e.target.value })
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-major">Major</Label>
              <Input
                id="edit-major"
                value={formData.major}
                onChange={(e) =>
                  setFormData({ ...formData, major: e.target.value })
                }
                required
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Update</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the student and all associated data.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
