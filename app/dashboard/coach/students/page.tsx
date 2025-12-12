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
import { Activity, Dumbbell, ClipboardList, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface Student {
    STUDENTID: number;
    FIRSTNAME: string;
    LASTNAME: string;
    EMAIL: string;
    GENDER: string;
    DATEOFBIRTH: string;
    TOTALACTIVITIES: number;
    LASTACTIVITYDATE: string;
}

export default function MyStudentsPage() {
    const router = useRouter();
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const userStr = sessionStorage.getItem("user");
        if (userStr) {
            const user = JSON.parse(userStr);
            if (user.role !== "Coach") {
                router.push("/dashboard");
                return;
            }
            fetchStudents(user.coachId || user.userId);
        } else {
            router.push("/auth/login");
        }
    }, [router]);

    const fetchStudents = async (userId: number) => {
        try {
            setLoading(true);
            const response = await fetch("/api/coach/students", { headers: { "x-coach-id": userId.toString() } });
            const data = await response.json();
            if (data.success) {
                setStudents(data.students);
            } else {
                toast.error("Failed to load students");
            }
        } catch (error) {
            console.error(error);
            toast.error("Error fetching students");
        } finally {
            setLoading(false);
        }
    };

    const filteredStudents = students.filter(s =>
        s.FIRSTNAME.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.LASTNAME.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">My Students</h1>
                    <p className="text-muted-foreground">Manage your assigned list</p>
                </div>
            </div>

            <div className="flex items-center gap-4 max-w-sm">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Student Name</TableHead>
                                <TableHead>Gender</TableHead>
                                <TableHead>Age</TableHead>
                                <TableHead>Last Activity</TableHead>
                                <TableHead className="text-center">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={5} className="text-center py-8">Loading...</TableCell></TableRow>
                            ) : filteredStudents.length === 0 ? (
                                <TableRow><TableCell colSpan={5} className="text-center py-8">No students found.</TableCell></TableRow>
                            ) : (
                                filteredStudents.map((student) => {
                                    const dob = new Date(student.DATEOFBIRTH);
                                    const age = new Date().getFullYear() - dob.getFullYear();

                                    return (
                                        <TableRow key={student.STUDENTID}>
                                            <TableCell className="font-medium">
                                                {student.FIRSTNAME} {student.LASTNAME}
                                            </TableCell>
                                            <TableCell>{student.GENDER}</TableCell>
                                            <TableCell>{age} yrs</TableCell>
                                            <TableCell>{student.LASTACTIVITYDATE ? new Date(student.LASTACTIVITYDATE).toLocaleDateString() : "Never"}</TableCell>
                                            <TableCell>
                                                <div className="flex justify-center gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => router.push(`/dashboard/coach/fitness-logs?studentId=${student.STUDENTID}`)}
                                                        title="View Fitness Logs"
                                                    >
                                                        <Activity className="h-4 w-4 mr-1" /> Logs
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => router.push(`/dashboard/coach/assessments?studentId=${student.STUDENTID}`)}
                                                        title="Assessments"
                                                    >
                                                        <ClipboardList className="h-4 w-4 mr-1" /> Assess
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => router.push(`/dashboard/coach/training-plans?studentId=${student.STUDENTID}`)}
                                                        title="Training Plans"
                                                    >
                                                        <Dumbbell className="h-4 w-4 mr-1" /> Plans
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
