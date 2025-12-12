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
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ClipboardList, Plus, Trash2, Edit } from "lucide-react";
import { toast } from "sonner";
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

interface MedicalRecord {
    RECORDID: number;
    VISITDATE: string;
    DIAGNOSIS: string;
    PRESCRIPTION: string;
    NOTES: string;
    STUDENTNAME: string;
    STUDENTID: number;
}

interface Student {
    STUDENTID: number;
    FIRSTNAME: string;
    LASTNAME: string;
}

export default function NurseMedicalRecordsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const studentIdParam = searchParams.get("studentId");

    const [nurseId, setNurseId] = useState<number | null>(null);
    const [records, setRecords] = useState<MedicalRecord[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState<MedicalRecord | null>(null);
    const [formData, setFormData] = useState({
        studentId: studentIdParam || "",
        visitDate: "",
        diagnosis: "",
        prescription: "",
        notes: ""
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
            // Fetch records
            let url = `/api/nurse/records`;
            if (studentIdParam) url += `?studentId=${studentIdParam}`;

            const [recRes, studRes] = await Promise.all([
                fetch(url, { headers: { "x-nurse-id": nId.toString() } }),
                fetch("/api/nurse/patients", { headers: { "x-nurse-id": nId.toString() } })
            ]);

            const recData = await recRes.json();
            const studData = await studRes.json();

            if (recData.success) setRecords(recData.records);
            if (studData.success) {
                // Map patients to students for dropdown
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
        if (!formData.studentId || !formData.visitDate || !formData.diagnosis) {
            toast.error("Please fill required fields (Student, Date, Diagnosis)");
            return;
        }

        try {
            const endpoint = "/api/nurse/records";
            const method = editingRecord ? "PUT" : "POST";
            const body = editingRecord ? {
                recordId: editingRecord.RECORDID,
                visitDate: formData.visitDate,
                diagnosis: formData.diagnosis,
                prescription: formData.prescription,
                notes: formData.notes
            } : {
                nurseId,
                studentId: formData.studentId,
                visitDate: formData.visitDate,
                diagnosis: formData.diagnosis,
                prescription: formData.prescription,
                notes: formData.notes
            };

            const res = await fetch(endpoint, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                toast.success(editingRecord ? "Updated successfully" : "Created successfully");
                setIsDialogOpen(false);
                setEditingRecord(null);
                setFormData({ studentId: studentIdParam || "", visitDate: "", diagnosis: "", prescription: "", notes: "" });
                fetchData(nurseId!);
            } else {
                toast.error("Operation failed");
            }
        } catch (e) {
            toast.error("Error saving record");
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            const res = await fetch(`/api/nurse/records?id=${deleteId}`, { method: "DELETE" });
            if (res.ok) {
                toast.success("Deleted successfully");
                setIsDeleteOpen(false);
                fetchData(nurseId!);
            } else toast.error("Failed to delete");
        } catch (e) { toast.error("Error deleting"); }
    };

    const openCreate = () => {
        setEditingRecord(null);
        setFormData({
            studentId: studentIdParam || "",
            visitDate: new Date().toISOString().split('T')[0],
            diagnosis: "",
            prescription: "",
            notes: ""
        });
        setIsDialogOpen(true);
    };

    const openEdit = (r: MedicalRecord) => {
        setEditingRecord(r);
        setFormData({
            studentId: r.STUDENTID.toString(),
            visitDate: r.VISITDATE,
            diagnosis: r.DIAGNOSIS,
            prescription: r.PRESCRIPTION || "",
            notes: r.NOTES || ""
        });
        setIsDialogOpen(true);
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold flex items-center gap-2">
                    <ClipboardList className="h-8 w-8 text-pink-600" />
                    Medical Records
                </h1>
                <Button onClick={openCreate} className="gap-2">
                    <Plus className="h-4 w-4" /> Add Record
                </Button>
            </div>

            <Card>
                <CardHeader><CardTitle>{studentIdParam ? "Student Records" : "All Medical Logs"}</CardTitle></CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Student</TableHead>
                                <TableHead>Diagnosis</TableHead>
                                <TableHead>Prescription</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? <TableRow><TableCell colSpan={5}>Loading...</TableCell></TableRow> :
                                records.length === 0 ? <TableRow><TableCell colSpan={5}>No records found.</TableCell></TableRow> :
                                    records.map(r => (
                                        <TableRow key={r.RECORDID}>
                                            <TableCell>{new Date(r.VISITDATE).toLocaleDateString()}</TableCell>
                                            <TableCell className="font-medium">{r.STUDENTNAME}</TableCell>
                                            <TableCell>{r.DIAGNOSIS}</TableCell>
                                            <TableCell>{r.PRESCRIPTION}</TableCell>
                                            <TableCell className="text-right space-x-2">
                                                <Button size="sm" variant="ghost" onClick={() => openEdit(r)}><Edit className="h-4 w-4" /></Button>
                                                <Button size="sm" variant="ghost" className="text-destructive" onClick={() => { setDeleteId(r.RECORDID); setIsDeleteOpen(true); }}><Trash2 className="h-4 w-4" /></Button>
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
                    <DialogHeader><DialogTitle>{editingRecord ? "Edit Record" : "New Medical Record"}</DialogTitle></DialogHeader>
                    <div className="space-y-4">
                        {!editingRecord && (
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
                        <div className="space-y-2">
                            <Label>Visit Date</Label>
                            <Input type="date" value={formData.visitDate} onChange={e => setFormData({ ...formData, visitDate: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label>Diagnosis</Label>
                            <Input value={formData.diagnosis} onChange={e => setFormData({ ...formData, diagnosis: e.target.value })} placeholder="e.g. Flu, Migraine" />
                        </div>
                        <div className="space-y-2">
                            <Label>Prescription</Label>
                            <Input value={formData.prescription} onChange={e => setFormData({ ...formData, prescription: e.target.value })} placeholder="e.g. Ibuprofen 400mg" />
                        </div>
                        <div className="space-y-2">
                            <Label>Clinical Notes</Label>
                            <Textarea value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} placeholder="Observations..." />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSubmit}>{editingRecord ? "Update" : "Create"}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Record?</AlertDialogTitle>
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
