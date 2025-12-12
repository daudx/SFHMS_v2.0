"use client";

import { useState, useEffect } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

export function AppointmentsTable() {
    const [appointments, setAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchAppointments = async () => {
        try {
            setLoading(true);
            const response = await fetch("/api/admin/appointments");
            const data = await response.json();
            if (data.success) {
                setAppointments(data.data || []);
            } else {
                toast.error("Failed to fetch appointments");
            }
        } catch (error) {
            toast.error("Error loading appointments");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, []);

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this appointment?")) return;
        try {
            // Assuming generic delete or specific endpoint logic could be added
            // For now, this is a placeholder for the delete action logic
            toast.error("Delete functionality requires implementation");
        } catch (error) {
            toast.error("Failed to delete");
        }
    };

    const filteredAppointments = appointments.filter((apt) =>
        apt.STUDENTNAME?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.NURSENAME?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.REASON?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div className="relative max-w-sm w-full">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search appointments..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Removed Import/Export buttons as per request */}
                {/* <Button onClick={() => toast.info("Create logic to be added")}>
          <Plus className="h-4 w-4 mr-2" />
          Create New
        </Button> */}
            </div>

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Time</TableHead>
                            <TableHead>Student</TableHead>
                            <TableHead>Nurse</TableHead>
                            <TableHead>Reason</TableHead>
                            <TableHead>Status</TableHead>
                            {/* <TableHead>Actions</TableHead> */}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8">
                                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                                </TableCell>
                            </TableRow>
                        ) : filteredAppointments.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    No appointments found
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredAppointments.map((apt) => (
                                <TableRow key={apt.APPOINTMENTID}>
                                    <TableCell>{apt.APPOINTMENTDATE}</TableCell>
                                    <TableCell>{apt.APPOINTMENTTIME}</TableCell>
                                    <TableCell>{apt.STUDENTNAME}</TableCell>
                                    <TableCell>{apt.NURSENAME}</TableCell>
                                    <TableCell>{apt.REASON}</TableCell>
                                    <TableCell>
                                        <Badge variant={apt.STATUS === 'Completed' ? 'default' : apt.STATUS === 'Cancelled' ? 'destructive' : 'secondary'}>
                                            {apt.STATUS}
                                        </Badge>
                                    </TableCell>
                                    {/* <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(apt.APPOINTMENTID)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell> */}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
