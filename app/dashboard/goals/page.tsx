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
import { Target, Plus, Check, X } from "lucide-react";
import { toast } from "sonner";

export default function GoalsPage() {
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    goalType: "",
    targetValue: "",
    startDate: "",
    endDate: "",
    studentId: "1", // TODO: Get from session
  });

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      // TODO: Add userId from session for filtering
      const response = await fetch("/api/goals");
      const data = await response.json();
      setGoals(data.data || []);
    } catch (error) {
      toast.error("Failed to fetch goals");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success("Goal created successfully");
        setIsDialogOpen(false);
        setFormData({
          goalType: "",
          targetValue: "",
          startDate: "",
          endDate: "",
          studentId: "1",
        });
        fetchGoals();
      } else {
        toast.error("Failed to create goal");
      }
    } catch (error) {
      toast.error("Error creating goal");
    }
  };

  const updateGoalStatus = async (goalId: number, isAchieved: string) => {
    try {
      const response = await fetch("/api/goals", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goalId, isAchieved }),
      });

      if (response.ok) {
        toast.success("Goal status updated");
        fetchGoals();
      }
    } catch (error) {
      toast.error("Failed to update goal");
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Target className="h-8 w-8" />
            Fitness Goals
          </h1>
          <p className="text-muted-foreground mt-2">
            Set and track your fitness objectives
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Goal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Goal</DialogTitle>
              <DialogDescription>
                Set a new fitness goal to track your progress
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="goalType">Goal Type</Label>
                <Input
                  id="goalType"
                  value={formData.goalType}
                  onChange={(e) =>
                    setFormData({ ...formData, goalType: e.target.value })
                  }
                  placeholder="e.g., Weight Loss, Muscle Gain, Run 5K"
                  required
                />
              </div>
              <div>
                <Label htmlFor="targetValue">Target Value</Label>
                <Input
                  id="targetValue"
                  type="number"
                  value={formData.targetValue}
                  onChange={(e) =>
                    setFormData({ ...formData, targetValue: e.target.value })
                  }
                  placeholder="e.g., 10 (kg), 5 (km)"
                  required
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
                <Label htmlFor="endDate">End Date (Optional)</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
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
                <Button type="submit">Create Goal</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Goals</CardTitle>
          <CardDescription>Track your fitness journey</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading goals...</div>
          ) : goals.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No goals yet. Create your first goal to get started!
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Goal Type</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {goals.map((goal) => (
                  <TableRow key={goal.GOALID}>
                    <TableCell className="font-medium">
                      {goal.GOALTYPE}
                    </TableCell>
                    <TableCell>{goal.TARGETVALUE}</TableCell>
                    <TableCell>
                      {new Date(goal.STARTDATE).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {goal.ENDDATE
                        ? new Date(goal.ENDDATE).toLocaleDateString()
                        : "Ongoing"}
                    </TableCell>
                    <TableCell>
                      {goal.ISACHIEVED === "Y" ? (
                        <Badge className="bg-green-500">
                          <Check className="h-3 w-3 mr-1" />
                          Achieved
                        </Badge>
                      ) : (
                        <Badge variant="secondary">In Progress</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {goal.ISACHIEVED !== "Y" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateGoalStatus(goal.GOALID, "Y")}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Mark Achieved
                        </Button>
                      )}
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
