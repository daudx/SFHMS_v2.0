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

export function FitnessLogsTable() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<any>(null);
  const [formData, setFormData] = useState({
    studentId: "",
    activityType: "",
    durationMinutes: "",
    caloriesBurned: "",
    distance: "",
    logDate: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/fitness-logs");
      const data = await response.json();
      setLogs(data.data || []);
    } catch (error) {
      toast.error("Failed to fetch fitness logs");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/admin/fitness-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: parseInt(formData.studentId),
          activityType: formData.activityType,
          durationMinutes: parseInt(formData.durationMinutes),
          caloriesBurned: parseInt(formData.caloriesBurned),
          distance: parseFloat(formData.distance),
          logDate: formData.logDate,
        }),
      });

      if (response.ok) {
        toast.success("Fitness log created successfully");
        setIsCreateOpen(false);
        setFormData({
          studentId: "",
          activityType: "",
          durationMinutes: "",
          caloriesBurned: "",
          distance: "",
          logDate: new Date().toISOString().split("T")[0],
        });
        fetchLogs();
      } else {
        toast.error("Failed to create fitness log");
      }
    } catch (error) {
      toast.error("Error creating fitness log");
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/admin/fitness-logs", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          logId: selectedLog.LOGID,
          activityType: formData.activityType,
          durationMinutes: parseInt(formData.durationMinutes),
          caloriesBurned: parseInt(formData.caloriesBurned),
          distance: parseFloat(formData.distance),
        }),
      });

      if (response.ok) {
        toast.success("Fitness log updated successfully");
        setIsEditOpen(false);
        fetchLogs();
      } else {
        toast.error("Failed to update fitness log");
      }
    } catch (error) {
      toast.error("Error updating fitness log");
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(
        `/api/admin/fitness-logs?logId=${selectedLog.LOGID}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        toast.success("Fitness log deleted successfully");
        setIsDeleteOpen(false);
        setSelectedLog(null);
        fetchLogs();
      } else {
        toast.error("Failed to delete fitness log");
      }
    } catch (error) {
      toast.error("Error deleting fitness log");
    }
  };

  const openEditDialog = (log: any) => {
    setSelectedLog(log);
    setFormData({
      studentId: log.STUDENTID?.toString() || "",
      activityType: log.ACTIVITYTYPE || "",
      durationMinutes: log.DURATIONMINUTES?.toString() || "",
      caloriesBurned: log.CALORIESBURNED?.toString() || "",
      distance: log.DISTANCE?.toString() || "",
      logDate: log.LOGDATE
        ? new Date(log.LOGDATE).toISOString().split("T")[0]
        : "",
    });
    setIsEditOpen(true);
  };

  const filteredLogs = logs.filter((log) =>
    Object.values(log).some((val) =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="space-y-4">
      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search fitness logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Log
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Fitness Log</DialogTitle>
              <DialogDescription>
                Add a new fitness activity log
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <Label htmlFor="studentId">Student ID</Label>
                <Input
                  id="studentId"
                  type="number"
                  value={formData.studentId}
                  onChange={(e) =>
                    setFormData({ ...formData, studentId: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="activityType">Activity Type</Label>
                <Input
                  id="activityType"
                  value={formData.activityType}
                  onChange={(e) =>
                    setFormData({ ...formData, activityType: e.target.value })
                  }
                  placeholder="e.g., Running, Swimming, Cycling"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="durationMinutes">Duration (min)</Label>
                  <Input
                    id="durationMinutes"
                    type="number"
                    value={formData.durationMinutes}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        durationMinutes: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="caloriesBurned">Calories</Label>
                  <Input
                    id="caloriesBurned"
                    type="number"
                    value={formData.caloriesBurned}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        caloriesBurned: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="distance">Distance (km)</Label>
                <Input
                  id="distance"
                  type="number"
                  step="0.1"
                  value={formData.distance}
                  onChange={(e) =>
                    setFormData({ ...formData, distance: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="logDate">Log Date</Label>
                <Input
                  id="logDate"
                  type="date"
                  value={formData.logDate}
                  onChange={(e) =>
                    setFormData({ ...formData, logDate: e.target.value })
                  }
                  required
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Create</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Activity</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Calories</TableHead>
                <TableHead>Distance</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center text-muted-foreground py-8"
                  >
                    No fitness logs found
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map((log) => (
                  <TableRow key={log.LOGID}>
                    <TableCell>{log.LOGID}</TableCell>
                    <TableCell className="font-medium">
                      {log.STUDENTNAME}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{log.ACTIVITYTYPE}</Badge>
                    </TableCell>
                    <TableCell>
                      {log.DURATIONMINUTES
                        ? `${log.DURATIONMINUTES} min`
                        : "N/A"}
                    </TableCell>
                    <TableCell>
                      {log.CALORIESBURNED
                        ? `${log.CALORIESBURNED} kcal`
                        : "N/A"}
                    </TableCell>
                    <TableCell>
                      {log.DISTANCE ? `${log.DISTANCE} km` : "N/A"}
                    </TableCell>
                    <TableCell>
                      {log.LOGDATE
                        ? new Date(log.LOGDATE).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                          })
                        : "N/A"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditDialog(log)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            setSelectedLog(log);
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
            <DialogTitle>Edit Fitness Log</DialogTitle>
            <DialogDescription>
              Update fitness log information
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <Label htmlFor="edit-activityType">Activity Type</Label>
              <Input
                id="edit-activityType"
                value={formData.activityType}
                onChange={(e) =>
                  setFormData({ ...formData, activityType: e.target.value })
                }
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-durationMinutes">Duration (min)</Label>
                <Input
                  id="edit-durationMinutes"
                  type="number"
                  value={formData.durationMinutes}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      durationMinutes: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-caloriesBurned">Calories</Label>
                <Input
                  id="edit-caloriesBurned"
                  type="number"
                  value={formData.caloriesBurned}
                  onChange={(e) =>
                    setFormData({ ...formData, caloriesBurned: e.target.value })
                  }
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-distance">Distance (km)</Label>
              <Input
                id="edit-distance"
                type="number"
                step="0.1"
                value={formData.distance}
                onChange={(e) =>
                  setFormData({ ...formData, distance: e.target.value })
                }
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
              This will permanently delete the fitness log. This action cannot
              be undone.
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
