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
            `SELECT DISTINCT
        s.StudentID,
        s.FirstName,
        s.LastName,
        s.Gender,
        TO_CHAR(s.DateOfBirth, 'YYYY-MM-DD') as DateOfBirth,
        hp.BloodType,
        (SELECT MAX(a.AppointmentDate) FROM Appointment a 
         WHERE a.FK_StudentID = s.StudentID AND a.FK_NurseID = :nurseId) as LastAppointment,
        (SELECT COUNT(*) FROM Appointment a 
         WHERE a.FK_StudentID = s.StudentID AND a.FK_NurseID = :nurseId) as AppointmentCount,
        (SELECT COUNT(*) FROM MedicalRecord mr 
         WHERE mr.FK_StudentID = s.StudentID AND mr.FK_NurseID = :nurseId) as RecordCount
      FROM Student s
      LEFT JOIN HealthProfile hp ON s.StudentID = hp.FK_StudentID
      WHERE s.FK_NurseID = :nurseId
      ORDER BY s.LastName, s.FirstName`,
            { nurseId: parseInt(nurseId) },
            { outFormat: 4002 }
        );

        return NextResponse.json({
            success: true,
            patients: result.rows || [],
        });
    } catch (error: any) {
        console.error("Error fetching nurse patients:", error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || "Failed to fetch patients",
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
