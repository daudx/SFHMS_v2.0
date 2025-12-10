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
import { Dumbbell, Plus } from "lucide-react";
import { toast } from "sonner";

import { useRouter } from "next/navigation";

export default function TrainingPlansPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [coachId, setCoachId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    planName: "",
    description: "",
    startDate: "",
    endDate: "",
    coachId: "",
  });

  useEffect(() => {
    // Get coach info from session
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/training-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success("Training plan created successfully");
        setIsDialogOpen(false);
        setFormData({
          planName: "",
          description: "",
          startDate: "",
          endDate: "",
          coachId: coachId?.toString() || "",
        });
        if (coachId) fetchPlans(coachId);
      } else {
        toast.error("Failed to create training plan");
      }
    } catch (error) {
      toast.error("Error creating training plan");
    }
  };

  const getPlanStatus = (startDate: string, endDate: string) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (now < start)
      return { label: "Upcoming", variant: "secondary" as const };
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
          <p className="text-muted-foreground mt-2">
            Manage workout programs for your students
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Plan
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Training Plan</DialogTitle>
              <DialogDescription>
                Design a new workout program for your students
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="planName">Plan Name</Label>
                <Input
                  id="planName"
                  value={formData.planName}
                  onChange={(e) =>
                    setFormData({ ...formData, planName: e.target.value })
                  }
                  placeholder="e.g., Beginner Strength Training"
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Describe the training plan objectives..."
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                  required
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
                <Button type="submit">Create Plan</Button>
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
            <div className="text-center py-8 text-muted-foreground">
              No training plans yet. Create your first plan to get started!
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plan Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {plans.map((plan) => {
                  const status = getPlanStatus(plan.STARTDATE, plan.ENDDATE);
                  return (
                    <TableRow key={plan.PLANID}>
                      <TableCell className="font-medium">
                        {plan.PLANNAME}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {plan.DESCRIPTION || "No description"}
                      </TableCell>
                      <TableCell>
                        {new Date(plan.STARTDATE).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {new Date(plan.ENDDATE).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div >
  );
}
