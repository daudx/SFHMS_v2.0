import { NextRequest, NextResponse } from "next/server";
import { getConnection } from "@/lib/db/oracle";

export async function GET(request: NextRequest) {
    let connection;

    try {
        const nurseId = request.headers.get("x-nurse-id");

        if (!nurseId) {
            return NextResponse.json(
                { error: "Nurse ID not provided" },
                { status: 400 }
            );
        }

        connection = await getConnection();

        const result = await connection.execute(
            `SELECT 
        mr.RecordID,
        TO_CHAR(mr.VisitDate, 'YYYY-MM-DD') as VisitDate,
        mr.Diagnosis,
        mr.Prescription,
        mr.Notes,
        s.FirstName || ' ' || s.LastName as StudentName
      FROM MedicalRecord mr
      JOIN Student s ON mr.FK_StudentID = s.StudentID
      WHERE mr.FK_NurseID = :nurseId
      ORDER BY mr.VisitDate DESC`,
            { nurseId: parseInt(nurseId) },
            { outFormat: 4001 }
        );

        return NextResponse.json({
            success: true,
            records: result.rows || [],
        });
    } catch (error: any) {
        console.error("Error fetching medical records:", error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || "Failed to fetch medical records",
            },
            { status: 500 }
        );
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error("Error closing connection:", err);
            }
        }
    }
}
