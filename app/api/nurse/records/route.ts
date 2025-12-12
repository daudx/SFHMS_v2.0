import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/db/oracle";

export async function GET(request: NextRequest) {
    try {
        const nurseId = request.headers.get("x-nurse-id");
        const { searchParams } = new URL(request.url);
        const studentId = searchParams.get("studentId"); // Optional filter

        if (!nurseId) {
            return NextResponse.json({ error: "Nurse ID not provided" }, { status: 400 });
        }

        let sql = `
            SELECT 
                mr.RecordID,
                TO_CHAR(mr.VisitDate, 'YYYY-MM-DD') as VisitDate,
                mr.Diagnosis,
                mr.Prescription,
                mr.Notes,
                mr.FK_StudentID as StudentID,
                s.FirstName || ' ' || s.LastName as StudentName
            FROM MedicalRecord mr
            JOIN Student s ON mr.FK_StudentID = s.StudentID
            WHERE mr.FK_NurseID = :1
        `;
        const params: any[] = [parseInt(nurseId)];

        if (studentId) {
            sql += " AND mr.FK_StudentID = :2";
            params.push(parseInt(studentId));
        }

        sql += " ORDER BY mr.VisitDate DESC";

        const result = await executeQuery(sql, params);

        return NextResponse.json({
            success: true,
            records: result.rows || [],
        });
    } catch (error: any) {
        console.error("Error fetching medical records:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch medical records" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { nurseId, studentId, visitDate, diagnosis, prescription, notes } = body;

        const sql = `
            INSERT INTO MedicalRecord (VisitDate, Diagnosis, Prescription, Notes, FK_NurseID, FK_StudentID)
            VALUES (TO_DATE(:1, 'YYYY-MM-DD'), :2, :3, :4, :5, :6)
        `;

        await executeQuery(sql, [visitDate, diagnosis, prescription, notes, nurseId, studentId]);

        return NextResponse.json({ success: true, message: "Record created" });
    } catch (error: any) {
        console.error("Error creating record:", error);
        return NextResponse.json({ success: false, error: "Failed to create medical record" }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { recordId, visitDate, diagnosis, prescription, notes } = body;

        const sql = `
            UPDATE MedicalRecord
            SET VisitDate = TO_DATE(:1, 'YYYY-MM-DD'), Diagnosis = :2, Prescription = :3, Notes = :4
            WHERE RecordID = :5
        `;

        await executeQuery(sql, [visitDate, diagnosis, prescription, notes, recordId]);

        return NextResponse.json({ success: true, message: "Record updated" });
    } catch (error: any) {
        console.error("Error updating record:", error);
        return NextResponse.json({ success: false, error: "Failed to update medical record" }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const recordId = searchParams.get("id");

        if (!recordId) return NextResponse.json({ error: "ID required" }, { status: 400 });

        await executeQuery("DELETE FROM MedicalRecord WHERE RecordID = :1", [parseInt(recordId)]);

        return NextResponse.json({ success: true, message: "Record deleted" });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: "Failed to delete medical record" }, { status: 500 });
    }
}
