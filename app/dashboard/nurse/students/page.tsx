"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Activity, FileText, Calendar, Users, ClipboardList } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface Patient {
    PATIENTID: number;
    FIRSTNAME: string;
    LASTNAME: string;
    AGE: number;
    GENDER: string;
    DATEOFBIRTH: string;
    BLOODTYPE: string;
    APPOINTMENTCOUNT: number;
    RECORDCOUNT: number;
}

export default function NurseStudentsPage() {
    const router = useRouter();
    const [patients, setPatients] = useState<Patient[]>([]);
    const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userStr = sessionStorage.getItem("user");
        if (userStr) {
            const user = JSON.parse(userStr);
            if (user.role !== "Nurse") {
                router.push("/dashboard");
                return;
            }
            fetchPatients(user.nurseId || user.userId);
        } else {
            router.push("/auth/login");
        }
    }, [router]);

    useEffect(() => {
        setFilteredPatients(
            patients.filter(p =>
                (p.FIRSTNAME + " " + p.LASTNAME).toLowerCase().includes(searchTerm.toLowerCase())
            )
        );
    }, [searchTerm, patients]);

    const fetchPatients = async (nurseId: number) => {
        try {
            setLoading(true);
            const res = await fetch("/api/nurse/patients", {
                headers: { "x-nurse-id": nurseId.toString() }
            });
            const data = await res.json();
            if (data.success) {
                // Map API response keys to interface if needed, or assume backend returns strict match
                // Based on previous files, backend returns rows directly.
                // Let's ensure casing matches. Row casing from Oracle is usually uppercase keys if outFormat is OBJECT.
                // However, previous code assumed p.STUDENTID, etc.
                // Let's be safe and map them if necessary, or just use as is.
                // The API uses `outFormat: 4002` which is OBJECT.
                // The query selects StudentID, FirstName, etc.
                // Oracle returns uppercase keys usually: STUDENTID, FIRSTNAME
                // My Interface uses PATIENTID, etc.

                const mapped = data.patients.map((p: any) => ({
                    PATIENTID: p.STUDENTID,
                    FIRSTNAME: p.FIRSTNAME,
                    LASTNAME: p.LASTNAME,
                    AGE: calculateAge(p.DATEOFBIRTH),
                    GENDER: p.GENDER,
                    DATEOFBIRTH: p.DATEOFBIRTH,
                    BLOODTYPE: p.BLOODTYPE,
                    APPOINTMENTCOUNT: p.APPOINTMENTCOUNT,
                    RECORDCOUNT: p.RECORDCOUNT
                }));
                setPatients(mapped);
            }
        } catch (e) {
            toast.error("Failed to load students");
        } finally {
            setLoading(false);
        }
    };

    const calculateAge = (dob: string) => {
        if (!dob) return "N/A";
        const birthDate = new Date(dob);
        const ageDifMs = Date.now() - birthDate.getTime();
        const ageDate = new Date(ageDifMs);
        return Math.abs(ageDate.getUTCFullYear() - 1970);
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Users className="h-8 w-8 text-pink-600" />
                        My Students
                    </h1>
                    <p className="text-muted-foreground">Manage your assigned students and their health data.</p>
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <Input
                        placeholder="Search students..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="max-w-sm"
                    />
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Assigned Students List</CardTitle>
                    <CardDescription>View clinical profiles, records, and appointments.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Age / Gender</TableHead>
                                <TableHead>Blood Type</TableHead>
                                <TableHead>Stats</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? <TableRow><TableCell colSpan={5}>Loading...</TableCell></TableRow> :
                                filteredPatients.length === 0 ? <TableRow><TableCell colSpan={5}>No students found.</TableCell></TableRow> :
                                    filteredPatients.map(p => (
                                        <TableRow key={p.PATIENTID}>
                                            <TableCell className="font-medium">{p.FIRSTNAME} {p.LASTNAME}</TableCell>
                                            <TableCell>{p.AGE} / {p.GENDER}</TableCell>
                                            <TableCell><Badge variant="outline">{p.BLOODTYPE || "Unknown"}</Badge></TableCell>
                                            <TableCell className="text-xs text-muted-foreground">
                                                <div>{p.RECORDCOUNT} Records</div>
                                                <div>{p.APPOINTMENTCOUNT} Appts</div>
                                            </TableCell>
                                            <TableCell className="text-right space-x-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => router.push(`/dashboard/nurse/clinical-profile?studentId=${p.PATIENTID}`)}
                                                    title="View Clinical Profile"
                                                >
                                                    <Activity className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => router.push(`/dashboard/nurse/medical-records?studentId=${p.PATIENTID}`)}
                                                    title="View Medical Records"
                                                >
                                                    <ClipboardList className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => router.push(`/dashboard/nurse/appointments?studentId=${p.PATIENTID}`)}
                                                    title="Manage Appointments"
                                                >
                                                    <Calendar className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                            }
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
