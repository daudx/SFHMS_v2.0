"use client";

import { useState, useEffect } from "react";
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

export function HealthProfilesTable() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [formData, setFormData] = useState({
    studentId: "",
    height: "",
    weight: "",
    bloodType: "",
    allergies: "",
    medicalConditions: "",
  });

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/health-profiles");
      const data = await response.json();
      setProfiles(data.data || []);
    } catch (error) {
      toast.error("Failed to fetch health profiles");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/admin/health-profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: parseInt(formData.studentId),
          height: parseFloat(formData.height),
          weight: parseFloat(formData.weight),
          bloodType: formData.bloodType,
          allergies: formData.allergies,
          medicalConditions: formData.medicalConditions,
        }),
      });

      if (response.ok) {
        toast.success("Health profile created successfully");
        setIsCreateOpen(false);
        setFormData({
          studentId: "",
          height: "",
          weight: "",
          bloodType: "",
          allergies: "",
          medicalConditions: "",
        });
        fetchProfiles();
      } else {
        toast.error("Failed to create health profile");
      }
    } catch (error) {
      toast.error("Error creating health profile");
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/admin/health-profiles", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId: selectedProfile.PROFILEID,
          height: parseFloat(formData.height),
          weight: parseFloat(formData.weight),
          bloodType: formData.bloodType,
          allergies: formData.allergies,
          medicalConditions: formData.medicalConditions,
        }),
      });

      if (response.ok) {
        toast.success("Health profile updated successfully");
        setIsEditOpen(false);
        fetchProfiles();
      } else {
        toast.error("Failed to update health profile");
      }
    } catch (error) {
      toast.error("Error updating health profile");
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(
        `/api/admin/health-profiles?profileId=${selectedProfile.PROFILEID}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        toast.success("Health profile deleted successfully");
        setIsDeleteOpen(false);
        setSelectedProfile(null);
        fetchProfiles();
      } else {
        toast.error("Failed to delete health profile");
      }
    } catch (error) {
      toast.error("Error deleting health profile");
    }
  };

  const openEditDialog = (profile: any) => {
    setSelectedProfile(profile);
    setFormData({
      studentId: profile.STUDENTID?.toString() || "",
      height: profile.HEIGHT?.toString() || "",
      weight: profile.WEIGHT?.toString() || "",
      bloodType: profile.BLOODTYPE || "",
      allergies: profile.ALLERGIES || "",
      medicalConditions: profile.MEDICALCONDITIONS || "",
    });
    setIsEditOpen(true);
  };

  const filteredProfiles = profiles.filter((profile) =>
    Object.values(profile).some((val) =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="space-y-4">
      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search health profiles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Profile
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Health Profile</DialogTitle>
              <DialogDescription>
                Add a new health profile for a student
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
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
                  <Label htmlFor="bloodType">Blood Type</Label>
                  <Input
                    id="bloodType"
                    value={formData.bloodType}
                    onChange={(e) =>
                      setFormData({ ...formData, bloodType: e.target.value })
                    }
                    placeholder="e.g., O+, A-, AB+"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    step="0.1"
                    value={formData.height}
                    onChange={(e) =>
                      setFormData({ ...formData, height: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    value={formData.weight}
                    onChange={(e) =>
                      setFormData({ ...formData, weight: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="allergies">Allergies</Label>
                <Textarea
                  id="allergies"
                  value={formData.allergies}
                  onChange={(e) =>
                    setFormData({ ...formData, allergies: e.target.value })
                  }
                  placeholder="List any known allergies..."
                  rows={2}
                />
              </div>
              <div>
                <Label htmlFor="medicalConditions">Medical Conditions</Label>
                <Textarea
                  id="medicalConditions"
                  value={formData.medicalConditions}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      medicalConditions: e.target.value,
                    })
                  }
                  placeholder="List any medical conditions..."
                  rows={2}
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
                <TableHead>Blood Type</TableHead>
                <TableHead>Height</TableHead>
                <TableHead>Weight</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProfiles.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center text-muted-foreground py-8"
                  >
                    No health profiles found
                  </TableCell>
                </TableRow>
              ) : (
                filteredProfiles.map((profile) => (
                  <TableRow key={profile.PROFILEID}>
                    <TableCell>{profile.PROFILEID}</TableCell>
                    <TableCell className="font-medium">
                      {profile.STUDENTNAME}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{profile.BLOODTYPE}</Badge>
                    </TableCell>
                    <TableCell>
                      {profile.HEIGHT ? `${profile.HEIGHT} cm` : "N/A"}
                    </TableCell>
                    <TableCell>
                      {profile.WEIGHT ? `${profile.WEIGHT} kg` : "N/A"}
                    </TableCell>
                    <TableCell>
                      {profile.CREATEDDATE
                        ? new Date(profile.CREATEDDATE).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "2-digit",
                              day: "2-digit",
                            }
                          )
                        : "N/A"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditDialog(profile)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            setSelectedProfile(profile);
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Health Profile</DialogTitle>
            <DialogDescription>
              Update health profile information
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-bloodType">Blood Type</Label>
                <Input
                  id="edit-bloodType"
                  value={formData.bloodType}
                  onChange={(e) =>
                    setFormData({ ...formData, bloodType: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-height">Height (cm)</Label>
                <Input
                  id="edit-height"
                  type="number"
                  step="0.1"
                  value={formData.height}
                  onChange={(e) =>
                    setFormData({ ...formData, height: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-weight">Weight (kg)</Label>
                <Input
                  id="edit-weight"
                  type="number"
                  step="0.1"
                  value={formData.weight}
                  onChange={(e) =>
                    setFormData({ ...formData, weight: e.target.value })
                  }
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-allergies">Allergies</Label>
              <Textarea
                id="edit-allergies"
                value={formData.allergies}
                onChange={(e) =>
                  setFormData({ ...formData, allergies: e.target.value })
                }
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor="edit-medicalConditions">Medical Conditions</Label>
              <Textarea
                id="edit-medicalConditions"
                value={formData.medicalConditions}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    medicalConditions: e.target.value,
                  })
                }
                rows={2}
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
              This will permanently delete the health profile. This action
              cannot be undone.
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
