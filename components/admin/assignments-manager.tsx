"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Search, Link as LinkIcon } from "lucide-react";
import { Input } from "@/components/ui/input";

export function AssignmentsManager() {
    const [students, setStudents] = useState<any[]>([]);
    const [coaches, setCoaches] = useState<any[]>([]);
    const [nurses, setNurses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const [selectedStudent, setSelectedStudent] = useState<any>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [coachId, setCoachId] = useState<string>("");
    const [nurseId, setNurseId] = useState<string>("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/admin/assignments");
            const data = await res.json();
            if (data.success) {
                setStudents(data.students);
                setCoaches(data.coaches);
                setNurses(data.nurses);
            } else {
                toast({ title: "Error", description: data.error, variant: "destructive" });
            }
        } catch (e) {
            toast({ title: "Error", description: "Failed to fetch assignments", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handleAssignClick = (student: any) => {
        setSelectedStudent(student);
        setCoachId(student.FK_COACHID?.toString() || "");
        setNurseId(student.FK_NURSEID?.toString() || "");
        setIsDialogOpen(true);
    };

    const handleSave = async () => {
        if (!selectedStudent) return;
        setSubmitting(true);
        try {
            const res = await fetch("/api/admin/assignments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    studentId: selectedStudent.STUDENTID,
                    coachId: coachId ? parseInt(coachId) : null,
                    nurseId: nurseId ? parseInt(nurseId) : null,
                }),
            });
            const data = await res.json();
            if (data.success) {
                toast({ title: "Success", description: "Assignment updated" });
                setIsDialogOpen(false);
                fetchData();
            } else {
                toast({ title: "Error", description: data.error, variant: "destructive" });
            }
        } catch (e) {
            toast({ title: "Error", description: "Failed to save", variant: "destructive" });
        } finally {
            setSubmitting(false);
        }
    };

    const filteredStudents = students.filter(s =>
        s.STUDENTNAME.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div className="relative w-72">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search students..." className="pl-8" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
                <Button variant="outline" onClick={fetchData}>Refresh</Button>
            </div>

            <div className="border rounded-lg overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Student Name</TableHead>
                            <TableHead>Assigned Coach</TableHead>
                            <TableHead>Assigned Nurse</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow><TableCell colSpan={4} className="text-center h-24">Loading...</TableCell></TableRow>
                        ) : filteredStudents.length === 0 ? (
                            <TableRow><TableCell colSpan={4} className="text-center h-24">No students found</TableCell></TableRow>
                        ) : (
                            filteredStudents.map((s) => (
                                <TableRow key={s.STUDENTID}>
                                    <TableCell className="font-medium">{s.STUDENTNAME}</TableCell>
                                    <TableCell>
                                        {s.COACHNAME ? (
                                            <Badge variant="secondary" className="bg-purple-100 text-purple-800 hover:bg-purple-200">{s.COACHNAME}</Badge>
                                        ) : (
                                            <span className="text-muted-foreground text-sm italic">Unassigned</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {s.NURSENAME ? (
                                            <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200">{s.NURSENAME}</Badge>
                                        ) : (
                                            <span className="text-muted-foreground text-sm italic">Unassigned</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button size="sm" onClick={() => handleAssignClick(s)}>
                                            <LinkIcon className="h-4 w-4 mr-1" /> Assign
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Assign Staff to {selectedStudent?.STUDENTNAME}</DialogTitle>
                        <DialogDescription>Select the primary coach and nurse for this student.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Coach</Label>
                            <Select value={coachId} onValueChange={setCoachId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Coach" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="unassigned">-- Unassigned --</SelectItem>
                                    {coaches.map(c => <SelectItem key={c.COACHID} value={c.COACHID.toString()}>{c.NAME}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Nurse</Label>
                            <Select value={nurseId} onValueChange={setNurseId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Nurse" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="unassigned">-- Unassigned --</SelectItem>
                                    {nurses.map(n => <SelectItem key={n.NURSEID} value={n.NURSEID.toString()}>{n.NAME}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSave} disabled={submitting}>{submitting ? 'Saving...' : 'Save Assignment'}</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
