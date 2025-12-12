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

interface CoachesTableProps {
  apiEndpoint?: string;
}

export function CoachesTable({
  apiEndpoint = "/api/admin/coaches",
}: CoachesTableProps) {
  const [coaches, setCoaches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  // Create state removed
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedCoach, setSelectedCoach] = useState<any>(null);
  const [formData, setFormData] = useState({
    userId: "",
    certification: "",
    contactPhone: "",
  });

  useEffect(() => {
    fetchCoaches();
  }, []);

  const fetchCoaches = async () => {
    try {
      setLoading(true);
      const response = await fetch(apiEndpoint);
      const data = await response.json();
      setCoaches(data.data || []);
    } catch (error) {
      toast.error("Failed to fetch coaches");
    } finally {
      setLoading(false);
    }
  };

  // handleCreate removed - use Users Management tab instead

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(apiEndpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          coachId: selectedCoach.COACHID,
          certification: formData.certification,
          contactPhone: formData.contactPhone,
        }),
      });

      if (response.ok) {
        toast.success("Coach updated successfully");
        setIsEditOpen(false);
        fetchCoaches();
      } else {
        toast.error("Failed to update coach");
      }
    } catch (error) {
      toast.error("Error updating coach");
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(
        `${apiEndpoint}?coachId=${selectedCoach.COACHID}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        toast.success("Coach deleted successfully");
        setIsDeleteOpen(false);
        setSelectedCoach(null);
        fetchCoaches();
      } else {
        toast.error("Failed to delete coach");
      }
    } catch (error) {
      toast.error("Error deleting coach");
    }
  };

  const openEditDialog = (coach: any) => {
    setSelectedCoach(coach);
    setFormData({
      userId: coach.FK_USERID?.toString() || "",
      certification: coach.CERTIFICATION || "",
      contactPhone: coach.CONTACTPHONE || "",
    });
    setIsEditOpen(true);
  };

  const filteredCoaches = coaches.filter((coach) =>
    Object.values(coach).some((val) =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="space-y-4">
      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search coaches..."
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
                <TableHead>Certification</TableHead>
                <TableHead>Contact Phone</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCoaches.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-muted-foreground py-8"
                  >
                    No coaches found
                  </TableCell>
                </TableRow>
              ) : (
                filteredCoaches.map((coach) => (
                  <TableRow key={coach.COACHID}>
                    <TableCell>{coach.COACHID}</TableCell>
                    <TableCell className="font-medium">
                      {coach.FULLNAME || "N/A"}
                    </TableCell>
                    <TableCell>{coach.EMAIL || "N/A"}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {coach.CERTIFICATION || "Not Set"}
                      </Badge>
                    </TableCell>
                    <TableCell>{coach.CONTACTPHONE || "N/A"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditDialog(coach)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            setSelectedCoach(coach);
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
            <DialogTitle>Edit Coach</DialogTitle>
            <DialogDescription>Update coach information</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <Label htmlFor="edit-certification">Certification</Label>
              <Input
                id="edit-certification"
                value={formData.certification}
                onChange={(e) =>
                  setFormData({ ...formData, certification: e.target.value })
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-contactPhone">Contact Phone</Label>
              <Input
                id="edit-contactPhone"
                type="tel"
                value={formData.contactPhone}
                onChange={(e) =>
                  setFormData({ ...formData, contactPhone: e.target.value })
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
              This will permanently delete the coach and all associated data.
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
