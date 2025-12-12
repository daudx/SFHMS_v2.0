"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Plus, Trash2, Edit } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
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

interface Appointment {
    APPOINTMENTID: number;
    APPOINTMENTDATE: string;
    APPOINTMENTTIME: string;
    REASON: string;
    STATUS: string;
    STUDENTNAME: string;
    STUDENTID: number;
}

interface Student {
    STUDENTID: number;
    FIRSTNAME: string;
    LASTNAME: string;
}

export default function NurseAppointmentsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const studentIdParam = searchParams.get("studentId");

    const [nurseId, setNurseId] = useState<number | null>(null);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingAppt, setEditingAppt] = useState<Appointment | null>(null);
    const [formData, setFormData] = useState({
        studentId: studentIdParam || "",
        date: "",
        time: "",
        reason: "",
        status: "Scheduled"
    });

    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    useEffect(() => {
        const userStr = sessionStorage.getItem("user");
        if (userStr) {
            const user = JSON.parse(userStr);
            if (user.role !== "Nurse") {
                router.push("/dashboard");
                return;
            }
            setNurseId(user.nurseId || user.userId);
            fetchData(user.nurseId || user.userId);
        } else {
            router.push("/auth/login");
        }
    }, [router]);

    const fetchData = async (nId: number) => {
        setLoading(true);
        try {
            let url = `/api/nurse/appointments`;
            if (studentIdParam) url += `?studentId=${studentIdParam}`;

            const [apptRes, studRes] = await Promise.all([
                fetch(url, { headers: { "x-nurse-id": nId.toString() } }),
                fetch("/api/nurse/patients", { headers: { "x-nurse-id": nId.toString() } })
            ]);

            const apptData = await apptRes.json();
            const studData = await studRes.json();

            if (apptData.success) setAppointments(apptData.appointments);
            if (studData.success) {
                setStudents(studData.patients.map((p: any) => ({
                    STUDENTID: p.STUDENTID,
                    FIRSTNAME: p.FIRSTNAME,
                    LASTNAME: p.LASTNAME
                })));
            }
        } catch (e) {
            toast.error("Error loading data");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!formData.studentId || !formData.date || !formData.reason) {
            toast.error("Please fill required fields");
            return;
        }

        try {
            const endpoint = "/api/nurse/appointments";
            const method = editingAppt ? "PUT" : "POST";
            const body = editingAppt ? {
                appointmentId: editingAppt.APPOINTMENTID,
                date: formData.date,
                time: formData.time,
                reason: formData.reason,
                status: formData.status
            } : {
                nurseId,
                studentId: formData.studentId,
                date: formData.date,
                time: formData.time,
                reason: formData.reason,
                status: formData.status
            };

            const res = await fetch(endpoint, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                toast.success(editingAppt ? "Updated successfully" : "Created successfully");
                setIsDialogOpen(false);
                setEditingAppt(null);
                setFormData({ studentId: studentIdParam || "", date: "", time: "", reason: "", status: "Scheduled" });
                fetchData(nurseId!);
            } else {
                toast.error("Operation failed");
            }
        } catch (e) {
            toast.error("Error saving appointment");
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            const res = await fetch(`/api/nurse/appointments?id=${deleteId}`, { method: "DELETE" });
            if (res.ok) {
                toast.success("Deleted successfully");
                setIsDeleteOpen(false);
                fetchData(nurseId!);
            } else toast.error("Failed to delete");
        } catch (e) { toast.error("Error deleting"); }
    };

    const openCreate = () => {
        setEditingAppt(null);
        setFormData({
            studentId: studentIdParam || "",
            date: "",
            time: "09:00",
            reason: "",
            status: "Scheduled"
        });
        setIsDialogOpen(true);
    };

    const openEdit = (a: Appointment) => {
        setEditingAppt(a);
        setFormData({
            studentId: a.STUDENTID.toString(),
            date: a.APPOINTMENTDATE,
            time: a.APPOINTMENTTIME || "09:00",
            reason: a.REASON,
            status: a.STATUS
        });
        setIsDialogOpen(true);
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold flex items-center gap-2">
                    <Calendar className="h-8 w-8 text-pink-600" />
                    Appointments
                </h1>
                <Button onClick={openCreate} className="gap-2">
                    <Plus className="h-4 w-4" /> New Appointment
                </Button>
            </div>

            <Card>
                <CardHeader><CardTitle>{studentIdParam ? "Student Appointments" : "All Scheduled Consultations"}</CardTitle></CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Time</TableHead>
                                <TableHead>Student</TableHead>
                                <TableHead>Reason</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? <TableRow><TableCell colSpan={6}>Loading...</TableCell></TableRow> :
                                appointments.length === 0 ? <TableRow><TableCell colSpan={6}>No appointments found.</TableCell></TableRow> :
                                    appointments.map(a => (
                                        <TableRow key={a.APPOINTMENTID}>
                                            <TableCell>{new Date(a.APPOINTMENTDATE).toLocaleDateString()}</TableCell>
                                            <TableCell>{a.APPOINTMENTTIME}</TableCell>
                                            <TableCell className="font-medium">{a.STUDENTNAME}</TableCell>
                                            <TableCell>{a.REASON}</TableCell>
                                            <TableCell><Badge variant={a.STATUS === 'Completed' ? 'default' : a.STATUS === 'Cancelled' ? 'destructive' : 'outline'}>{a.STATUS}</Badge></TableCell>
                                            <TableCell className="text-right space-x-2">
                                                <Button size="sm" variant="ghost" onClick={() => openEdit(a)}><Edit className="h-4 w-4" /></Button>
                                                <Button size="sm" variant="ghost" className="text-destructive" onClick={() => { setDeleteId(a.APPOINTMENTID); setIsDeleteOpen(true); }}><Trash2 className="h-4 w-4" /></Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                            }
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>{editingAppt ? "Edit Appointment" : "New Appointment"}</DialogTitle></DialogHeader>
                    <div className="space-y-4">
                        {!editingAppt && (
                            <div className="space-y-2">
                                <Label>Student</Label>
                                <Select value={formData.studentId} onValueChange={v => setFormData({ ...formData, studentId: v })} disabled={!!studentIdParam}>
                                    <SelectTrigger><SelectValue placeholder="Select Student" /></SelectTrigger>
                                    <SelectContent>
                                        {students.map(s => (
                                            <SelectItem key={s.STUDENTID} value={s.STUDENTID.toString()}>{s.FIRSTNAME} {s.LASTNAME}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Date</Label>
                                <Input type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Time</Label>
                                <Input type="time" value={formData.time} onChange={e => setFormData({ ...formData, time: e.target.value })} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Reason</Label>
                            <Input value={formData.reason} onChange={e => setFormData({ ...formData, reason: e.target.value })} placeholder="e.g. Annual Checkup" />
                        </div>
                        <div className="space-y-2">
                            <Label>Status</Label>
                            <Select value={formData.status} onValueChange={v => setFormData({ ...formData, status: v })}>
                                <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Scheduled">Scheduled</SelectItem>
                                    <SelectItem value="Completed">Completed</SelectItem>
                                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSubmit}>{editingAppt ? "Update" : "Create"}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Appointment?</AlertDialogTitle>
                        <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
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
