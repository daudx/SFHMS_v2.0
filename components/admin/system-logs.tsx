"use client";
import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export function SystemLogs() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/admin/system-logs')
            .then(res => res.json())
            .then(data => {
                if (data.success) setLogs(data.logs || []);
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div>Loading logs...</div>;

    return (
        <div className="border rounded-lg overflow-hidden max-h-[500px] overflow-y-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Time</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Details</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {logs.length === 0 ? <TableRow><TableCell colSpan={3} className="text-center">No logs found</TableCell></TableRow> :
                        logs.map((log: any) => (
                            <TableRow key={log.LOGID}>
                                <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{log.LOGTIME}</TableCell>
                                <TableCell><Badge variant="outline">{log.ACTION}</Badge></TableCell>
                                <TableCell className="text-sm">{log.DETAILS}</TableCell>
                            </TableRow>
                        ))}
                </TableBody>
            </Table>
        </div>
    )
}
