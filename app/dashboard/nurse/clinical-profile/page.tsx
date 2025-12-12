"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, Activity } from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ClinicalProfilePage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const studentId = searchParams.get("studentId");

    // Form State
    const [profile, setProfile] = useState({
        firstName: "",
        lastName: "",
        dob: "",
        gender: "",
        height: "",
        weight: "",
        bloodType: "",
        allergies: "",
        conditions: "",
        bloodPressure: "",
        heartRate: "",
        temperature: "",
        notes: "",
        emergencyContact: "",
        lastCheckup: ""
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!studentId) {
            router.push("/dashboard/nurse/students");
            return;
        }
        fetchProfile();
    }, [studentId]);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/nurse/clinical-profile?studentId=${studentId}`);
            const data = await res.json();
            if (data.success && data.profile) {
                const p = data.profile;
                setProfile({
                    firstName: p.FIRSTNAME,
                    lastName: p.LASTNAME,
                    dob: p.DOB,
                    gender: p.GENDER,
                    height: p.HEIGHT || "",
                    weight: p.WEIGHT || "",
                    bloodType: p.BLOODTYPE || "",
                    allergies: p.ALLERGIES || "",
                    conditions: p.CHRONICCONDITIONS || "",
                    bloodPressure: p.BLOODPRESSURE || "",
                    heartRate: p.HEARTRATE || "",
                    temperature: p.TEMPERATURE || "",
                    notes: p.MEDICALNOTES || "",
                    emergencyContact: p.EMERGENCYCONTACT || "",
                    lastCheckup: p.LASTUPDATED || "Never"
                });
            } else if (data.success && !data.profile) {
                // Profile doesn't exist yet, but we have student info? 
                // The query joins LEFT JOIN, so if student exists we get names.
                // Wait, if no profile row but student exists, columns from hp are null.
                // My API query: returns one row if student exists.
                // So data.profile should be defined if student exists.
                if (data.profile) {
                    const p = data.profile;
                    setProfile(prev => ({
                        ...prev,
                        firstName: p.FIRSTNAME,
                        lastName: p.LASTNAME,
                        dob: p.DOB,
                        gender: p.GENDER
                    }));
                }
            }
        } catch (e) {
            toast.error("Failed to load profile");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            console.log("Saving profile for student:", studentId);

            const payload = {
                studentId: parseInt(studentId!),
                height: parseFloat(profile.height) || null,
                bloodType: profile.bloodType,
                allergies: profile.allergies,
                conditions: profile.conditions
            };

            console.log("Payload:", payload);

            const res = await fetch("/api/nurse/clinical-profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            console.log("Response:", data);

            if (data.success) {
                toast.success("Profile updated successfully");
                fetchProfile(); // Refresh to see update date
            } else {
                toast.error(data.error || "Failed to update");
            }
        } catch (e) {
            console.error("Save error:", e);
            toast.error("Error saving profile");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-6">Loading profile...</div>;

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Activity className="h-8 w-8 text-pink-600" />
                        Clinical Profile
                    </h1>
                    <p className="text-muted-foreground">
                        {profile.firstName} {profile.lastName} ({profile.gender}, Born: {profile.dob})
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Physical & Vitals</CardTitle>
                        <CardDescription>Last Check-up: {profile.lastCheckup}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Height (cm)</Label>
                                <Input type="number" value={profile.height} onChange={(e) => setProfile({ ...profile, height: e.target.value })} placeholder="175" />
                            </div>
                            <div className="space-y-2">
                                <Label>Weight (kg)</Label>
                                <Input type="number" value={profile.weight} onChange={(e) => setProfile({ ...profile, weight: e.target.value })} placeholder="70" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Blood Type</Label>
                            <Select value={profile.bloodType} onValueChange={(v) => setProfile({ ...profile, bloodType: v })}>
                                <SelectTrigger><SelectValue placeholder="Select Type" /></SelectTrigger>
                                <SelectContent>
                                    {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(t => (
                                        <SelectItem key={t} value={t}>{t}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label>BP (mmHg)</Label>
                                <Input value={profile.bloodPressure} onChange={(e) => setProfile({ ...profile, bloodPressure: e.target.value })} placeholder="120/80" />
                            </div>
                            <div className="space-y-2">
                                <Label>HR (bpm)</Label>
                                <Input type="number" value={profile.heartRate} onChange={(e) => setProfile({ ...profile, heartRate: e.target.value })} placeholder="72" />
                            </div>
                            <div className="space-y-2">
                                <Label>Temp (°C)</Label>
                                <Input type="number" value={profile.temperature} onChange={(e) => setProfile({ ...profile, temperature: e.target.value })} placeholder="36.5" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Medical History & Contact</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Allergies</Label>
                            <Textarea value={profile.allergies} onChange={(e) => setProfile({ ...profile, allergies: e.target.value })} placeholder="Peanuts, Penicillin..." />
                        </div>
                        <div className="space-y-2">
                            <Label>Chronic Conditions</Label>
                            <Textarea value={profile.conditions} onChange={(e) => setProfile({ ...profile, conditions: e.target.value })} placeholder="Asthma, Diabetes..." />
                        </div>
                        <div className="space-y-2">
                            <Label>Emergency Contact</Label>
                            <Input value={profile.emergencyContact} onChange={(e) => setProfile({ ...profile, emergencyContact: e.target.value })} placeholder="Jane Doe (Mother) - 555-0199" />
                        </div>
                        <div className="space-y-2">
                            <Label>Medical Notes</Label>
                            <Textarea className="min-h-[100px]" value={profile.notes} onChange={(e) => setProfile({ ...profile, notes: e.target.value })} placeholder="General observations..." />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="flex justify-end">
                <Button size="lg" onClick={handleSave} disabled={saving} type="button">
                    {saving ? "Saving..." : <><Save className="mr-2 h-4 w-4" /> Save Profile</>}
                </Button>
            </div>
        </div>
    );
}
