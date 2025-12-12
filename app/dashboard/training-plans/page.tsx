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
import { Dumbbell, Plus, List, Trash2, FileText } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function TrainingPlansPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [coachId, setCoachId] = useState<number | null>(null);

  // Create Plan Form Data
  const [formData, setFormData] = useState({
    planName: "",
    description: "",
    startDate: "",
    endDate: "",
    coachId: "",
  });
  const [editingId, setEditingId] = useState<number | null>(null);

  // Exercises Management
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [exercises, setExercises] = useState<any[]>([]);
  const [isExercisesOpen, setIsExercisesOpen] = useState(false);
  const [exerciseForm, setExerciseForm] = useState({
    exerciseName: "",
    sets: 3,
    reps: 10,
    dayOfWeek: "Monday"
  });

  useEffect(() => {
    const userStr = sessionStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user.role !== "Coach") {
        toast.error("Access denied. Coach role required.");
        router.push("/dashboard");
        return;
      }
      const coachIdToUse = user.coachId || user.userId;
      setCoachId(coachIdToUse);
      setFormData(prev => ({ ...prev, coachId: coachIdToUse.toString() }));
      fetchPlans(coachIdToUse);
    } else {
      toast.error("Please login first");
      router.push("/auth/login");
    }
  }, [router]);

  const fetchPlans = async (coachIdParam: number) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/training-plans?coachId=${coachIdParam}`);
      const data = await response.json();
      setPlans(data.data || []);
    } catch (error) {
      toast.error("Failed to fetch training plans");
    } finally {
      setLoading(false);
    }
  };

  const fetchExercises = async (planId: number) => {
    try {
      const response = await fetch(`/api/training-plans/details?planId=${planId}`);
      const data = await response.json();
      if (data.success) setExercises(data.details);
    } catch (error) { toast.error("Failed to load exercises"); }
  };

  const openExercisesManager = (planId: number) => {
    setSelectedPlanId(planId);
    fetchExercises(planId);
    setIsExercisesOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingId ? "/api/training-plans" : "/api/training-plans";
      const method = editingId ? "PUT" : "POST";
      const body = editingId ? { ...formData, planId: editingId } : formData;

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        toast.success(editingId ? "Plan updated" : "Plan created");
        setIsDialogOpen(false);
        setEditingId(null);
        setFormData({
          planName: "", description: "", startDate: "", endDate: "",
          coachId: coachId?.toString() || "",
        });
        if (coachId) fetchPlans(coachId);
      } else {
        toast.error("Failed to save plan");
      }
    } catch (error) { toast.error("Error saving plan"); }
  };

  const handleAddExercise = async () => {
    if (!selectedPlanId || !exerciseForm.exerciseName) return;
    try {
      const response = await fetch("/api/training-plans/details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...exerciseForm, planId: selectedPlanId })
      });
      if (response.ok) {
        toast.success("Exercise added");
        fetchExercises(selectedPlanId);
        setExerciseForm({ exerciseName: "", sets: 3, reps: 10, dayOfWeek: "Monday" });
      }
    } catch (e) { toast.error("Failed to add exercise"); }
  };

  const deleteExercise = async (detailId: number) => {
    if (!confirm("Delete this exercise?")) return;
    try {
      await fetch(`/api/training-plans/details?detailId=${detailId}`, { method: "DELETE" });
      toast.success("Deleted");
      if (selectedPlanId) fetchExercises(selectedPlanId);
    } catch (e) { toast.error("Failed to delete"); }
  };

  const handleDeletePlan = async (planId: number) => {
    if (!confirm("Delete this training plan?")) return;
    try {
      const res = await fetch(`/api/training-plans?planId=${planId}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Plan deleted");
        if (coachId) fetchPlans(coachId);
      } else toast.error("Failed to delete plan");
    } catch (e) { toast.error("Error deleting plan"); }
  };

  const getPlanStatus = (startDate: string, endDate: string) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (now < start) return { label: "Upcoming", variant: "secondary" as const };
    if (now > end) return { label: "Completed", variant: "outline" as const };
    return { label: "Active", variant: "default" as const };
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Dumbbell className="h-8 w-8" />
            Training Plans
          </h1>
          <p className="text-muted-foreground mt-2">Manage workout programs for your students</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setEditingId(null);
            setFormData({
              planName: "", description: "", startDate: "", endDate: "",
              coachId: coachId?.toString() || ""
            });
          }
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Plan
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit" : "Create"} Training Plan</DialogTitle>
              <DialogDescription>Design a new workout program for your students</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="planName">Plan Name</Label>
                <Input id="planName" value={formData.planName} onChange={(e) => setFormData({ ...formData, planName: e.target.value })} required />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input id="startDate" type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} required />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <Input id="endDate" type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} required />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button type="submit">{editingId ? "Update" : "Create"} Plan</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Training Plans</CardTitle>
          <CardDescription>Workout programs you've created</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading training plans...</div>
          ) : plans.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No training plans yet. Create your first plan to get started!</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plan Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {plans.map((plan) => {
                  const status = getPlanStatus(plan.STARTDATE, plan.ENDDATE);
                  return (
                    <TableRow key={plan.PLANID}>
                      <TableCell className="font-medium">{plan.PLANNAME}</TableCell>
                      <TableCell className="max-w-xs truncate">{plan.DESCRIPTION || "-"}</TableCell>
                      <TableCell>
                        <div className="flex flex-col text-xs">
                          <span>Start: {new Date(plan.STARTDATE).toLocaleDateString()}</span>
                          <span>End: {new Date(plan.ENDDATE).toLocaleDateString()}</span>
                        </div>
                      </TableCell>
                      <TableCell><Badge variant={status.variant}>{status.label}</Badge></TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline" onClick={() => openExercisesManager(plan.PLANID)}>
                          <List className="h-4 w-4 mr-2" />
                          Exercises
                        </Button>
                        <Button size="sm" variant="outline" className="ml-2" onClick={() => {
                          setFormData({
                            planName: plan.PLANNAME,
                            description: plan.DESCRIPTION || "",
                            startDate: new Date(plan.STARTDATE).toISOString().split('T')[0],
                            endDate: new Date(plan.ENDDATE).toISOString().split('T')[0],
                            coachId: coachId?.toString() || ""
                          });
                          setEditingId(plan.PLANID);
                          setIsDialogOpen(true);
                        }}>
                          <FileText className="h-4 w-4 mr-2" /> Edit
                        </Button>
                        <Button size="sm" variant="destructive" className="ml-2" onClick={() => handleDeletePlan(plan.PLANID)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* EXERCISE MANAGER DIALOG */}
      <Dialog open={isExercisesOpen} onOpenChange={setIsExercisesOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Manage Exercises</DialogTitle>
            <DialogDescription>Add or remove exercises for this plan</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Add New */}
            <div className="grid grid-cols-5 gap-2 items-end border-b pb-4">
              <div className="col-span-2">
                <Label>Exercise Name</Label>
                <Input placeholder="Pushups" value={exerciseForm.exerciseName} onChange={(e) => setExerciseForm({ ...exerciseForm, exerciseName: e.target.value })} />
              </div>
              <div>
                <Label>Sets / Reps</Label>
                <div className="flex gap-1">
                  <Input type="number" placeholder="S" className="w-1/2" value={exerciseForm.sets} onChange={(e) => setExerciseForm({ ...exerciseForm, sets: parseInt(e.target.value) })} />
                  <Input type="number" placeholder="R" className="w-1/2" value={exerciseForm.reps} onChange={(e) => setExerciseForm({ ...exerciseForm, reps: parseInt(e.target.value) })} />
                </div>
              </div>
              <div>
                <Label>Day</Label>
                <select
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={exerciseForm.dayOfWeek}
                  onChange={(e) => setExerciseForm({ ...exerciseForm, dayOfWeek: e.target.value })}
                >
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <Button onClick={handleAddExercise}><Plus className="h-4 w-4" /></Button>
            </div>

            {/* List */}
            <div className="max-h-[300px] overflow-y-auto space-y-2">
              {exercises.length === 0 ? <p className="text-center text-muted-foreground">No exercises added.</p> : (
                exercises.map(ex => (
                  <div key={ex.DETAILID} className="flex justify-between items-center p-2 bg-secondary rounded">
                    <div>
                      <span className="font-medium mr-2">{ex.EXERCISENAME}</span>
                      <Badge variant="outline" className="text-xs mr-2">{ex.DAYOFWEEK}</Badge>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">{ex.SETS} sets x {ex.REPS} reps</span>
                      <Button size="icon" variant="ghost" className="h-6 w-6 text-red-500" onClick={() => deleteExercise(ex.DETAILID)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
