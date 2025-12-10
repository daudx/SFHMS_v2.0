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
        a.AppointmentID,
        TO_CHAR(a.AppointmentDate, 'YYYY-MM-DD') as AppointmentDate,
        a.AppointmentTime,
        a.Status,
        a.Reason,
        s.FirstName || ' ' || s.LastName as StudentName
      FROM Appointment a
      JOIN Student s ON a.FK_StudentID = s.StudentID
      WHERE a.FK_NurseID = :nurseId
      ORDER BY a.AppointmentDate DESC`,
            { nurseId: parseInt(nurseId) },
            { outFormat: 4001 }
        );

        return NextResponse.json({
            success: true,
            appointments: result.rows || [],
        });
    } catch (error: any) {
        console.error("Error fetching appointments:", error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || "Failed to fetch appointments",
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
