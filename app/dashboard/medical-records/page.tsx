"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileText, Calendar } from "lucide-react";

export default function MedicalRecordsPage() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/student/medical-records")
      .then(res => {
        if (res.status === 401) {
          router.push("/auth/login");
          return null;
        }
        return res.json();
      })
      .then(data => {
        if (data && data.success) setRecords(data.data);
      })
      .catch(err => {
        console.error("Error loading records:", err);
      })
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) return <div className="p-8">Loading Records...</div>;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-2">
        <FileText className="h-8 w-8 text-red-600" /> Medical Records
      </h1>
      <p className="text-muted-foreground">Clinical history managed by your Nurse.</p>

      <Card>
        <CardHeader>
          <CardTitle>Visit History</CardTitle>
        </CardHeader>
        <CardContent>
          {records.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No medical records found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Nurse</TableHead>
                  <TableHead>Diagnosis</TableHead>
                  <TableHead>Prescription</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((rec) => (
                  <TableRow key={rec.RECORDID}>
                    <TableCell className="font-medium">{rec.VISITDATE}</TableCell>
                    <TableCell>{rec.NURSENAME}</TableCell>
                    <TableCell><span className="font-semibold text-red-600">{rec.DIAGNOSIS}</span></TableCell>
                    <TableCell>{rec.PRESCRIPTION || "-"}</TableCell>
                    <TableCell className="max-w-xs truncate text-muted-foreground">{rec.NOTES}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
