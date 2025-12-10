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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Activity,
  Calendar,
  Flame,
  ArrowLeft,
  Plus,
  TrendingUp,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

export default function FitnessActivitiesPage() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    fetchActivities();
  }, [router]);

  const fetchActivities = async () => {
    try {
      const res = await fetch("/api/fitness-activities");

      if (res.status === 401) {
        router.push("/auth/login");
        return;
      }

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to fetch fitness activities");
      }

      const data = await res.json();
      setActivities(data);
    } catch (error) {
      console.error("Error fetching fitness activities:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to load fitness activities"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAddActivity = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      activityType: formData.get("activityType"),
      durationMinutes: Number(formData.get("durationMinutes")),
      caloriesBurned: Number(formData.get("caloriesBurned")),
      distance: formData.get("distance")
        ? Number(formData.get("distance"))
        : undefined,
      activityDate: formData.get("activityDate"),
    };

    try {
      const res = await fetch("/api/fitness-activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to log activity");
      }

      toast({
        title: "Success",
        description: "Activity logged successfully",
      });

      setIsAddDialogOpen(false);
      await fetchActivities();
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to log activity",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteActivity = async (logId: number) => {
    if (!confirm("Are you sure you want to delete this activity?")) return;

    try {
      const res = await fetch(`/api/fitness-activities?id=${logId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete activity");
      }

      toast({
        title: "Success",
        description: "Activity deleted successfully",
      });

      await fetchActivities();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete activity",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-b from-gray-50 to-white p-8">
        <div className="max-w-4xl mx-auto">
          <div className="skeleton h-12 w-64 mb-6" />
          <div className="grid md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton h-48 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-linear-to-b from-gray-50 to-white flex items-center justify-center p-8">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">{error}</p>
            <p className="text-sm text-gray-600 mb-4">
              Please sign up or login to track your fitness activities.
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

  const totalCalories = activities.reduce(
    (sum: number, a: any) => sum + (a.calories_burned || 0),
    0
  );
  const totalMinutes = activities.reduce(
    (sum: number, a: any) => sum + (a.duration_minutes || 0),
    0
  );
  const totalDistance = activities.reduce(
    (sum: number, a: any) => sum + (a.distance || 0),
    0
  );

  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 to-white pt-4">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Activity className="w-8 h-8 text-emerald-600" />
              Fitness Activities
            </h1>
            <p className="text-gray-600 mt-1">
              Track your workouts and monitor your fitness progress
            </p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="btn-animate bg-emerald-600 hover:bg-emerald-700">
                <Plus className="w-4 h-4 mr-2" />
                Log Activity
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Log Fitness Activity</DialogTitle>
                <DialogDescription>
                  Track your workout and fitness progress
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddActivity} className="space-y-4">
                <div>
                  <Label htmlFor="activityType">Activity Type</Label>
                  <Select name="activityType" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select activity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Running">Running</SelectItem>
                      <SelectItem value="Cycling">Cycling</SelectItem>
                      <SelectItem value="Swimming">Swimming</SelectItem>
                      <SelectItem value="Walking">Walking</SelectItem>
                      <SelectItem value="Gym">Gym Workout</SelectItem>
                      <SelectItem value="Yoga">Yoga</SelectItem>
                      <SelectItem value="Sports">Sports</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="durationMinutes">Duration (minutes)</Label>
                  <Input
                    id="durationMinutes"
                    name="durationMinutes"
                    type="number"
                    min="1"
                    required
                    placeholder="30"
                  />
                </div>
                <div>
                  <Label htmlFor="caloriesBurned">Calories Burned</Label>
                  <Input
                    id="caloriesBurned"
                    name="caloriesBurned"
                    type="number"
                    min="1"
                    required
                    placeholder="250"
                  />
                </div>
                <div>
                  <Label htmlFor="distance">Distance (km) - Optional</Label>
                  <Input
                    id="distance"
                    name="distance"
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="5.0"
                  />
                </div>
                <div>
                  <Label htmlFor="activityDate">Activity Date</Label>
                  <Input
                    id="activityDate"
                    name="activityDate"
                    type="date"
                    required
                    max={new Date().toISOString().split("T")[0]}
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
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    {submitting ? "Logging..." : "Log Activity"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="card-premium">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-semibold">
                    Total Calories
                  </p>
                  <p className="text-3xl font-bold text-emerald-600">
                    {totalCalories}
                  </p>
                </div>
                <Flame className="w-10 h-10 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="card-premium">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-semibold">
                    Total Time
                  </p>
                  <p className="text-3xl font-bold text-blue-600">
                    {totalMinutes} min
                  </p>
                </div>
                <Calendar className="w-10 h-10 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="card-premium">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-semibold">
                    Total Distance
                  </p>
                  <p className="text-3xl font-bold text-purple-600">
                    {totalDistance.toFixed(1)} km
                  </p>
                </div>
                <TrendingUp className="w-10 h-10 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Activities Grid */}
        {activities.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-4">
            {activities.map((activity: any, idx: number) => (
              <Card
                key={activity.id}
                className="card-premium animate-scaleUp"
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="w-5 h-5 text-emerald-600" />
                        {activity.activity_type}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {new Date(activity.activity_date).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <Flame className="w-5 h-5 text-orange-500" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-emerald-600">
                        {activity.duration_minutes}
                      </p>
                      <p className="text-xs text-gray-600">Minutes</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-orange-600">
                        {activity.calories_burned}
                      </p>
                      <p className="text-xs text-gray-600">Calories</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-purple-600">
                        {activity.distance ? activity.distance.toFixed(1) : "-"}
                      </p>
                      <p className="text-xs text-gray-600">Distance (km)</p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t flex justify-between items-center">
                    <p className="text-xs text-gray-500">
                      Log ID: {activity.id}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteActivity(activity.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="card-premium">
            <CardContent className="text-center py-12">
              <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                No Activities Logged Yet
              </h3>
              <p className="text-gray-600 mb-4">
                Start tracking your fitness journey by logging your first
                activity
              </p>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-emerald-600 hover:bg-emerald-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Log Your First Activity
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
