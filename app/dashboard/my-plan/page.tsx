"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Dumbbell, User } from "lucide-react";

export default function MyPlanPage() {
    const [planData, setPlanData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetch("/api/student/my-plan")
            .then(res => {
                if (res.status === 401) {
                    router.push("/auth/login");
                    return null;
                }
                return res.json();
            })
            .then(data => {
                if (data && data.success) {
                    setPlanData(data.plan);
                }
            })
            .catch(err => {
                console.error("Error loading plan:", err);
            })
            .finally(() => setLoading(false));
    }, [router]);

    if (loading) return <div className="p-8">Loading Plan...</div>;

    if (!planData) {
        return (
            <div className="container mx-auto p-8 text-center">
                <Dumbbell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold">No Active Training Plan</h2>
                <p className="text-muted-foreground">Your coach hasn't assigned a plan yet.</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Dumbbell className="h-8 w-8 text-blue-600" /> {planData.PLANNAME}
                    </h1>
                    <p className="text-muted-foreground mt-2">{planData.DESCRIPTION}</p>
                </div>
                <Badge variant={planData.STATUS === 'Active' ? 'default' : 'secondary'} className="text-lg px-4 py-1">
                    {planData.STATUS || 'Assigned'}
                </Badge>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="pt-6 flex items-center gap-3">
                        <User className="h-5 w-5 text-muted-foreground" />
                        <div>
                            <p className="text-sm text-muted-foreground">Coach</p>
                            <p className="font-semibold">{planData.COACHNAME}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6 flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                        <div>
                            <p className="text-sm text-muted-foreground">Start Date</p>
                            <p className="font-semibold">{planData.STARTDATE}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6 flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                        <div>
                            <p className="text-sm text-muted-foreground">End Date</p>
                            <p className="font-semibold">{planData.ENDDATE || "Ongoing"}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <h2 className="text-xl font-semibold mt-8 mb-4">Weekly Schedule</h2>
            <div className="grid gap-4">
                {planData.exercises && planData.exercises.length > 0 ? (
                    planData.exercises.map((ex: any) => (
                        <div key={ex.DETAILID} className="bg-white p-4 rounded-lg border flex justify-between items-center shadow-sm">
                            <div className="flex items-center gap-4">
                                <Badge variant="outline" className="w-24 justify-center">{ex.DAYOFWEEK}</Badge>
                                <span className="font-medium text-lg">{ex.EXERCISENAME}</span>
                            </div>
                            <div className="text-sm font-semibold bg-slate-100 px-3 py-1 rounded">
                                {ex.SETS} Sets x {ex.REPS} Reps
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-muted-foreground">No exercises detailed in this plan.</p>
                )}
            </div>
        </div>
    );
}
