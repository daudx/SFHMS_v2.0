"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
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
import { Dumbbell, Plus, Pencil, Trash2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription
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
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Assessment {
    ASSESSMENTID: number;
    ASSESSMENTDATE: string;
    PERFORMANCESCORE: number;
    NOTES: string;
    FK_STUDENTID: number;
    STUDENTNAME: string;
}

interface Student {
    STUDENTID: number;
    FIRSTNAME: string;
    LASTNAME: string;
}

export default function CoachAssessmentsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialStudentId = searchParams.get("studentId");

    const [assessments, setAssessments] = useState<Assessment[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);

    const [coachId, setCoachId] = useState<number | null>(null);

    // Filters
    const [searchTerm, setSearchTerm] = useState("");
    const [studentFilter, setStudentFilter] = useState(initialStudentId || "all");

    // Dialogs
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingAssessment, setEditingAssessment] = useState<Assessment | null>(null);
    const [formData, setFormData] = useState({
        studentId: "",
        date: "",
        score: "",
        notes: ""
    });

    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);

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
            const [assessRes, studentsRes] = await Promise.all([
                fetch(`/api/coach/assessments?coachId=${cId}`),
                fetch("/api/coach/students", { headers: { "x-coach-id": cId.toString() } })
            ]);

            const assessData = await assessRes.json();
            const studentsData = await studentsRes.json();

            if (assessData.success) setAssessments(assessData.data);
            if (studentsData.success) setStudents(studentsData.students);

        } catch (e) {
            toast.error("Error loading data");
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({ studentId: "", date: new Date().toISOString().split('T')[0], score: "", notes: "" });
        setEditingAssessment(null);
    };

    const handleOpenDialog = (assessment?: Assessment) => {
        if (assessment) {
            setEditingAssessment(assessment);
            setFormData({
                studentId: assessment.FK_STUDENTID.toString(),
                date: assessment.ASSESSMENTDATE,
                score: assessment.PERFORMANCESCORE.toString(),
                notes: assessment.NOTES || ""
            });
        } else {
            resetForm();
        }
        setIsDialogOpen(true);
    };

    const handleSave = async () => {
        if (!coachId || !formData.studentId || !formData.date || !formData.score) {
            toast.error("Please fill required fields");
            return;
        }

        const method = editingAssessment ? "PUT" : "POST";
        const body: any = {
            coachId,
            studentId: parseInt(formData.studentId),
            date: formData.date,
            score: parseInt(formData.score),
            notes: formData.notes
        };

        if (editingAssessment) body.assessmentId = editingAssessment.ASSESSMENTID;

        try {
            const res = await fetch("/api/coach/assessments", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });
            const data = await res.json();
            if (data.success) {
                toast.success(editingAssessment ? "Updated" : "Created");
                setIsDialogOpen(false);
                fetchData(coachId);
            } else {
                toast.error(data.error || "Failed");
            }
        } catch (e) { toast.error("Error saving assessment"); }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            const res = await fetch(`/api/coach/assessments?id=${deleteId}`, { method: "DELETE" });
            if (res.ok) {
                toast.success("Deleted");
                setIsDeleteOpen(false);
                fetchData(coachId!);
            } else toast.error("Failed to delete");
        } catch (e) { toast.error("Error deleting"); }
    }

    const filteredAssessments = assessments.filter(a => {
        const matchesSearch = a.STUDENTNAME?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = studentFilter === "all" || a.FK_STUDENTID.toString() === studentFilter;
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Dumbbell className="h-8 w-8 text-blue-600" />
                        Assessments
                    </h1>
                    <p className="text-muted-foreground">Manage student evaluations and scores</p>
                </div>
                <Button onClick={() => handleOpenDialog()}>
                    <Plus className="mr-2 h-4 w-4" /> New Assessment
                </Button>
            </div>

            <div className="flex gap-4 items-center">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search student..."
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
            </div>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Student</TableHead>
                                <TableHead>Score</TableHead>
                                <TableHead>Notes</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={5} className="text-center py-8">Loading...</TableCell></TableRow>
                            ) : filteredAssessments.length === 0 ? (
                                <TableRow><TableCell colSpan={5} className="text-center py-8">No assessments found.</TableCell></TableRow>
                            ) : (
                                filteredAssessments.map(a => (
                                    <TableRow key={a.ASSESSMENTID}>
                                        <TableCell>{a.ASSESSMENTDATE}</TableCell>
                                        <TableCell className="font-medium">{a.STUDENTNAME}</TableCell>
                                        <TableCell>{a.PERFORMANCESCORE}</TableCell>
                                        <TableCell className="max-w-xs truncate">{a.NOTES}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button size="sm" variant="outline" onClick={() => handleOpenDialog(a)}>
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button size="sm" variant="destructive" onClick={() => { setDeleteId(a.ASSESSMENTID); setIsDeleteOpen(true); }}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingAssessment ? "Edit Assessment" : "New Assessment"}</DialogTitle>
                        <DialogDescription>Record performance score and notes</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label>Student</Label>
                            <Select
                                value={formData.studentId}
                                onValueChange={(val) => setFormData({ ...formData, studentId: val })}
                                disabled={!!editingAssessment} // Prevent changing student on edit
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Student" />
                                </SelectTrigger>
                                <SelectContent>
                                    {students.map(s => (
                                        <SelectItem key={s.STUDENTID} value={s.STUDENTID.toString()}>
                                            {s.FIRSTNAME} {s.LASTNAME}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Date</Label>
                            <Input type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
                        </div>
                        <div>
                            <Label>Score (0-100)</Label>
                            <Input type="number" value={formData.score} onChange={e => setFormData({ ...formData, score: e.target.value })} />
                        </div>
                        <div>
                            <Label>Notes</Label>
                            <Textarea value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSave}>Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
