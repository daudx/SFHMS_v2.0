"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { Activity, MessageSquare, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface FitnessLog {
    LOGID: number;
    ACTIVITYTYPE: string;
    DURATIONMINUTES: number;
    CALORIESBURNED: number;
    DISTANCE: number;
    LOGDATE: string;
    STUDENTNAME: string;
    STUDENTID: number;
}

interface Student {
    STUDENTID: number;
    FIRSTNAME: string;
    LASTNAME: string;
}

export default function CoachFitnessLogsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialStudentId = searchParams.get("studentId");

    const [logs, setLogs] = useState<FitnessLog[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [searchTerm, setSearchTerm] = useState("");
    const [activityFilter, setActivityFilter] = useState("all");
    const [studentFilter, setStudentFilter] = useState(initialStudentId || "all");

    // Review Dialog
    const [isReviewOpen, setIsReviewOpen] = useState(false);
    const [selectedLog, setSelectedLog] = useState<FitnessLog | null>(null);
    const [reviewNotes, setReviewNotes] = useState("");
    const [coachId, setCoachId] = useState<number | null>(null);

    useEffect(() => {
        const userStr = sessionStorage.getItem("user");
        if (userStr) {
            const user = JSON.parse(userStr);
            if (user.role !== "Coach") {
                router.push("/dashboard");
                return;
            }
            setCoachId(user.coachId || user.userId);
            fetchData(user.coachId || user.userId);
        } else {
            router.push("/auth/login");
        }
    }, [router]);

    useEffect(() => {
        if (initialStudentId) setStudentFilter(initialStudentId);
    }, [initialStudentId]);

    const fetchData = async (cId: number) => {
        setLoading(true);
        try {
            // Fetch logs
            const logsRes = await fetch("/api/coach/student-logs", { headers: { "x-coach-id": cId.toString() } });
            const logsData = await logsRes.json();

            // Fetch students for filter
            const studentsRes = await fetch("/api/coach/students", { headers: { "x-coach-id": cId.toString() } });
            const studentsData = await studentsRes.json();

            if (logsData.success) setLogs(logsData.logs);
            if (studentsData.success) setStudents(studentsData.students);

        } catch (error) {
            console.error(error);
            toast.error("Error fetching data");
        } finally {
            setLoading(false);
        }
    };

    const openReviewDialog = (log: FitnessLog) => {
        setSelectedLog(log);
        setReviewNotes("");
        setIsReviewOpen(true);
    };

    const submitReview = async () => {
        if (!selectedLog || !coachId || !reviewNotes) return;
        try {
            const response = await fetch("/api/coach/reviews", {
                method: "POST",
                headers: { "Content-Type": "application/json", "x-coach-id": coachId.toString() },
                body: JSON.stringify({ logId: selectedLog.LOGID, reviewNotes: reviewNotes })
            });
            if (response.ok) {
                toast.success("Review submitted");
                setIsReviewOpen(false);
            } else toast.error("Failed to submit review");
        } catch (error) { toast.error("Error submitting review"); }
    };

    // Filter Logic
    const filteredLogs = logs.filter(log => {
        const matchesSearch =
            log.ACTIVITYTYPE.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.STUDENTNAME.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStudent = studentFilter === "all" || log.STUDENTID.toString() === studentFilter;
        const matchesActivity = activityFilter === "all" || log.ACTIVITYTYPE.toLowerCase() === activityFilter.toLowerCase();

        return matchesSearch && matchesStudent && matchesActivity;
    });

    // Get unique activity types
    const activityTypes = Array.from(new Set(logs.map(l => l.ACTIVITYTYPE)));

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Activity className="h-8 w-8 text-blue-600" />
                        Fitness Logs
                    </h1>
                    <p className="text-muted-foreground">Monitor and review student activities</p>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by student or activity..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <Select value={studentFilter} onValueChange={setStudentFilter}>
                    <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Filter by Student" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Students</SelectItem>
                        {students.map(s => (
                            <SelectItem key={s.STUDENTID} value={s.STUDENTID.toString()}>
                                {s.FIRSTNAME} {s.LASTNAME}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select value={activityFilter} onValueChange={setActivityFilter}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Activity Type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Activities</SelectItem>
                        {activityTypes.map(type => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Student</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Activity</TableHead>
                                <TableHead>Duration</TableHead>
                                <TableHead>Stats</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={6} className="text-center py-8">Loading...</TableCell></TableRow>
                            ) : filteredLogs.length === 0 ? (
                                <TableRow><TableCell colSpan={6} className="text-center py-8">No logs found matching your filters.</TableCell></TableRow>
                            ) : (
                                filteredLogs.map((log) => (
                                    <TableRow key={log.LOGID}>
                                        <TableCell className="font-medium">{log.STUDENTNAME}</TableCell>
                                        <TableCell>{new Date(log.LOGDATE).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{log.ACTIVITYTYPE}</Badge>
                                        </TableCell>
                                        <TableCell>{log.DURATIONMINUTES} min</TableCell>
                                        <TableCell className="text-muted-foreground text-sm">
                                            {log.CALORIESBURNED} kcal • {log.DISTANCE} km
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => openReviewDialog(log)} title="Add Review">
                                                <MessageSquare className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Coach Feedback</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="text-sm text-muted-foreground p-3 bg-muted rounded">
                            <span className="font-semibold">Activity:</span> {selectedLog?.ACTIVITYTYPE} on {selectedLog?.LOGDATE}
                        </div>
                        <div className="space-y-2">
                            <Label>Feedback / Notes</Label>
                            <Textarea
                                value={reviewNotes}
                                onChange={(e) => setReviewNotes(e.target.value)}
                                placeholder="Great job! Keep the intensity up..."
                                rows={4}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsReviewOpen(false)}>Cancel</Button>
                        <Button onClick={submitReview}>Submit Feedback</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
