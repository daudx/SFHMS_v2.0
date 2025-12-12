"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Activity, Droplet, Ruler, Weight, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function MyHealthProfilePage() {
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetch("/api/student/health-profile")
            .then(res => {
                if (res.status === 401) {
                    router.push("/auth/login");
                    return null;
                }
                return res.json();
            })
            .then(data => {
                if (data && data.success) setProfile(data.data);
            })
            .catch(err => {
                console.error("Error loading profile:", err);
                // Don't logout on error, just show error state
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="p-8">Loading Profile...</div>;
    if (!profile) return <div className="p-8">Failed to load profile.</div>;

    return (
        <div className="container mx-auto p-6 space-y-6">
            <h1 className="text-3xl font-bold">My Health Profile</h1>
            <p className="text-muted-foreground">Managed by your Nurse. Read-only view.</p>

            <div className="grid md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Ruler className="h-5 w-5" /> Measurements</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between border-b pb-2">
                            <span className="font-medium">Height</span>
                            <span>{profile.HEIGHT ? `${profile.HEIGHT} cm` : "N/A"}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                            <span className="font-medium">Weight</span>
                            <span className="text-muted-foreground">Not recorded</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                            <span className="font-medium">BMI</span>
                            <span className="text-muted-foreground">calc...</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-medium">Blood Type</span>
                            <Badge variant="outline">{profile.BLOODTYPE || "Unknown"}</Badge>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><AlertCircle className="h-5 w-5" /> Medical Info</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p className="font-medium mb-1">Allergies</p>
                            <div className="p-3 bg-red-50 text-red-700 rounded-md">
                                {profile.ALLERGIES || "None reported"}
                            </div>
                        </div>
                        <div>
                            <p className="font-medium mb-1">Chronic Conditions</p>
                            <div className="p-3 bg-yellow-50 text-yellow-700 rounded-md">
                                {profile.CHRONICCONDITIONS || "None reported"}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" /> Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
                            <span className="font-semibold">Last Check-up Date</span>
                            <span className="text-lg">{profile.LASTCHECKUP || "Never"}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
