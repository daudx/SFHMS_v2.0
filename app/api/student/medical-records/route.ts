import { NextRequest, NextResponse } from "next/server";
import { getConnection } from "@/lib/db/oracle";
import { cookies } from "next/headers";

// GET /api/student/medical-records
export async function GET(request: NextRequest) {
    let connection;
    try {
        const cookieStore = await cookies();
        const userId = cookieStore.get("userId")?.value;

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        connection = await getConnection();

        // 1. Get Student ID
        const studentRes = await connection.execute(
            `SELECT StudentID FROM Student WHERE FK_UserID = :userId`,
            { userId: parseInt(userId) },
            { outFormat: 4002 }
        );
        if (!studentRes.rows || studentRes.rows.length === 0) {
            return NextResponse.json({ error: "Student not found" }, { status: 404 });
        }
        const studentId = (studentRes.rows[0] as any).STUDENTID;

        // 2. Get Medical Records
        const recordsQuery = `
            SELECT 
                mr.RecordID,
                TO_CHAR(mr.VisitDate, 'YYYY-MM-DD') as VisitDate,
                mr.Diagnosis,
                mr.Prescription,
                mr.Notes,
                n.FirstName || ' ' || n.LastName as NurseName
            FROM MedicalRecord mr
            JOIN Nurse n ON mr.FK_NurseID = n.NurseID
            WHERE mr.FK_StudentID = :studentId
            ORDER BY mr.VisitDate DESC
        `;

        const recordsRes = await connection.execute(recordsQuery, { studentId }, { outFormat: 4002 });

        return NextResponse.json({
            success: true,
            data: recordsRes.rows
        });

    } catch (e: any) {
        console.error(e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    } finally {
        if (connection) await connection.close();
    }
}
