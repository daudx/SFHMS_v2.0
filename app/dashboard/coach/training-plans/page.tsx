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
import { Dumbbell, Plus, Trash2, Calendar, User } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

interface TrainingPlan {
    PLANID: number;
    PLANNAME: string;
    DESCRIPTION: string;
    STARTDATE: string;
    ENDDATE: string;
}

interface AssignedPlan {
    ASSIGNMENTID: number;
    ASSIGNEDDATE: string;
    STATUS: string;
    PLANNAME: string;
    STUDENTNAME: string;
    PLANID: number;
}

interface Student {
    STUDENTID: number;
    FIRSTNAME: string;
    LASTNAME: string;
}

export default function CoachTrainingPlansPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialStudentId = searchParams.get("studentId");

    const [coachId, setCoachId] = useState<number | null>(null);

    const [plans, setPlans] = useState<TrainingPlan[]>([]);
    const [assignments, setAssignments] = useState<AssignedPlan[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);

    // Dialogs
    const [isPlanDialogOpen, setIsPlanDialogOpen] = useState(false);
    const [planForm, setPlanForm] = useState({ name: "", description: "", startDate: "", endDate: "" });

    const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
    const [assignForm, setAssignForm] = useState({ studentId: initialStudentId || "", planId: "" });

    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [deleteType, setDeleteType] = useState<"plan" | "assignment">("plan");

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

    const fetchData = async (cId: number) => {
        setLoading(true);
        try {
            const [plansRes, assignRes, studentsRes] = await Promise.all([
                fetch(`/api/training-plans?coachId=${cId}`),
                fetch(`/api/coach/student-plans?coachId=${cId}`),
                fetch("/api/coach/students", { headers: { "x-coach-id": cId.toString() } })
            ]);

            const plansData = await plansRes.json();
            const assignData = await assignRes.json();
            const studentsData = await studentsRes.json();

            if (plansData.success) setPlans(plansData.data);
            if (assignData.success) setAssignments(assignData.data);
            if (studentsData.success) setStudents(studentsData.students);

        } catch (e) {
            toast.error("Error loading data");
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePlan = async () => {
        // Validation with specific error messages
        if (!coachId) {
            toast.error("Process Error: Coach ID not found. Please reload or login again.");
            return;
        }
        if (!planForm.name.trim()) {
            toast.error("Please enter a Plan Name");
            return;
        }
        if (!planForm.startDate) {
            toast.error("Start Date is required");
            return;
        }
        if (!planForm.endDate) {
            toast.error("End Date is required");
            return;
        }

        // Using existing API which likely supports POST
        try {
            const res = await fetch("/api/training-plans", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    coachId,
                    planName: planForm.name, // Mapped to match backend expectation
                    description: planForm.description,
                    startDate: planForm.startDate,
                    endDate: planForm.endDate
                })
            });
            const data = await res.json();
            if (data.success) {
                toast.success("Training Plan Created Successfully");
                setIsPlanDialogOpen(false);
                setPlanForm({ name: "", description: "", startDate: "", endDate: "" });
                fetchData(coachId);
            } else {
                toast.error(data.error || "Failed to create plan");
            }
        } catch (e) {
            console.error(e);
            toast.error("An unexpected error occurred while creating the plan");
        }
    };

    const handleAssignPlan = async () => {
        if (!coachId || !assignForm.studentId || !assignForm.planId) {
            toast.error("Please select student and plan");
            return;
        }

        try {
            const res = await fetch("/api/coach/student-plans", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    studentId: parseInt(assignForm.studentId),
                    planId: parseInt(assignForm.planId)
                })
            });
            const data = await res.json();
            if (res.ok) {
                toast.success("Plan Assigned");
                setIsAssignDialogOpen(false);
                setAssignForm({ studentId: "", planId: "" });
                fetchData(coachId);
            } else toast.error("Failed to assign");
        } catch (e) { toast.error("Error assigning"); }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        const endpoint = deleteType === "plan"
            ? `/api/training-plans?id=${deleteId}`
            : `/api/coach/student-plans?id=${deleteId}`; // Verify this endpoint exists for DELETE

        try {
            const res = await fetch(endpoint, { method: "DELETE" });
            if (res.ok) {
                toast.success("Deleted successfully");
                setIsDeleteOpen(false);
                fetchData(coachId!);
            } else toast.error("Failed to delete");
        } catch (e) { toast.error("Error deleting"); }
    }

    const confirmDelete = (id: number, type: "plan" | "assignment") => {
        setDeleteId(id);
        setDeleteType(type);
        setIsDeleteOpen(true);
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Dumbbell className="h-8 w-8 text-blue-600" />
                        Training Plans
                    </h1>
                    <p className="text-muted-foreground">Create reusable templates and assign them to students</p>
                </div>
            </div>

            <Tabs defaultValue="assignments" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="assignments">Assigned Plans</TabsTrigger>
                    <TabsTrigger value="templates">My Plan Templates</TabsTrigger>
                </TabsList>

                <TabsContent value="assignments">
                    <Card>
                        <CardHeader className="flex flex-row justify-between">
                            <CardTitle>Active Assignments</CardTitle>
                            <Button onClick={() => setIsAssignDialogOpen(true)}>
                                <Plus className="mr-2 h-4 w-4" /> Assign Plan
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Student</TableHead>
                                        <TableHead>Plan</TableHead>
                                        <TableHead>Assigned Date</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? <TableRow><TableCell colSpan={5}>Loading...</TableCell></TableRow> :
                                        assignments.length === 0 ? <TableRow><TableCell colSpan={5}>No active assignments.</TableCell></TableRow> :
                                            assignments.map(a => (
                                                <TableRow key={a.ASSIGNMENTID}>
                                                    <TableCell className="font-medium">{(a as any).STUDENTNAME || "Student"}</TableCell>
                                                    <TableCell>{a.PLANNAME}</TableCell>
                                                    <TableCell>{new Date(a.ASSIGNEDDATE).toLocaleDateString()}</TableCell>
                                                    <TableCell><Badge>{a.STATUS}</Badge></TableCell>
                                                    <TableCell className="text-right">
                                                        {/* <Button size="sm" variant="destructive" onClick={() => confirmDelete(a.ASSIGNMENTID, "assignment")}>
                                             <Trash2 className="h-4 w-4" />
                                         </Button> */}
                                                        {/* Delete assignment endpoint might strictly need AssignmentID. Assuming implemented. */}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                    }
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="templates">
                    <Card>
                        <CardHeader className="flex flex-row justify-between">
                            <CardTitle>My Templates</CardTitle>
                            <Button onClick={() => setIsPlanDialogOpen(true)}>
                                <Plus className="mr-2 h-4 w-4" /> Create New Plan
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Plan Name</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Duration</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? <TableRow><TableCell colSpan={4}>Loading...</TableCell></TableRow> :
                                        plans.length === 0 ? <TableRow><TableCell colSpan={4}>No plans created yet.</TableCell></TableRow> :
                                            plans.map(p => (
                                                <TableRow key={p.PLANID}>
                                                    <TableCell className="font-medium">{p.PLANNAME}</TableCell>
                                                    <TableCell className="text-muted-foreground text-sm max-w-md truncate">{p.DESCRIPTION}</TableCell>
                                                    <TableCell>
                                                        {p.STARTDATE && p.ENDDATE ? (
                                                            <div className="text-xs">
                                                                {new Date(p.STARTDATE).toLocaleDateString()} - {new Date(p.ENDDATE).toLocaleDateString()}
                                                            </div>
                                                        ) : "N/A"}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Button size="sm" variant="destructive" onClick={() => confirmDelete(p.PLANID, "plan")}>
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                    }
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Create Plan Dialog */}
            <Dialog open={isPlanDialogOpen} onOpenChange={setIsPlanDialogOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Create Training Plan</DialogTitle></DialogHeader>
                    <div className="space-y-4">
                        <div><Label>Plan Name</Label><Input value={planForm.name} onChange={e => setPlanForm({ ...planForm, name: e.target.value })} /></div>
                        <div><Label>Description</Label><Textarea value={planForm.description} onChange={e => setPlanForm({ ...planForm, description: e.target.value })} placeholder="E.g., 3 days split..." /></div>
                        <div className="grid grid-cols-2 gap-4">
                            <div><Label>Start Date</Label><Input type="date" value={planForm.startDate} onChange={e => setPlanForm({ ...planForm, startDate: e.target.value })} /></div>
                            <div><Label>End Date</Label><Input type="date" value={planForm.endDate} onChange={e => setPlanForm({ ...planForm, endDate: e.target.value })} /></div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsPlanDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreatePlan} disabled={loading} type="button">
                            {loading ? "Creating..." : "Create Plan"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Assign Plan Dialog */}
            <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Assign Plan to Student</DialogTitle></DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label>Student</Label>
                            <Select value={assignForm.studentId} onValueChange={v => setAssignForm({ ...assignForm, studentId: v })}>
                                <SelectTrigger><SelectValue placeholder="Select Student" /></SelectTrigger>
                                <SelectContent>
                                    {students.map(s => (
                                        <SelectItem key={s.STUDENTID} value={s.STUDENTID.toString()}>{s.FIRSTNAME} {s.LASTNAME}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Plan</Label>
                            <Select value={assignForm.planId} onValueChange={v => setAssignForm({ ...assignForm, planId: v })}>
                                <SelectTrigger><SelectValue placeholder="Select Plan" /></SelectTrigger>
                                <SelectContent>
                                    {plans.map(p => (
                                        <SelectItem key={p.PLANID} value={p.PLANID.toString()}>{p.PLANNAME}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleAssignPlan} type="button">Assign</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            {deleteType === "plan" ? "This will delete the plan template. Existing assignments might be affected." : "This will remove the assignment from the student."}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
