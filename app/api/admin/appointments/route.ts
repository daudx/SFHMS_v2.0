import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/db/oracle";

// GET: Fetch all appointments
export async function GET(request: NextRequest) {
    try {
        const result = await executeQuery(
            `SELECT 
        a.AppointmentID,
        TO_CHAR(a.AppointmentDate, 'YYYY-MM-DD') as AppointmentDate,
        a.AppointmentTime,
        a.Status,
        a.Reason,
        s.FirstName || ' ' || s.LastName as StudentName,
        n.FirstName || ' ' || n.LastName as NurseName,
        a.FK_StudentID,
        a.FK_NurseID
      FROM Appointment a
      JOIN Student s ON a.FK_StudentID = s.StudentID
      JOIN Nurse n ON a.FK_NurseID = n.NurseID
      ORDER BY a.AppointmentDate DESC`,
            []
        );

        return NextResponse.json({
            success: true,
            data: result.rows,
        });
    } catch (error) {
        console.error("Error fetching appointments:", error);
        return NextResponse.json(
            { error: "Failed to fetch appointments" },
            { status: 500 }
        );
    }
}

// POST: Create a new appointment
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { appointmentDate, appointmentTime, status, reason, studentId, nurseId } = body;

        const result = await executeQuery(
            `INSERT INTO Appointment (AppointmentDate, AppointmentTime, Status, Reason, FK_StudentID, FK_NurseID)
       VALUES (TO_DATE(:1, 'YYYY-MM-DD'), :2, :3, :4, :5, :6)
       RETURNING AppointmentID INTO :7`,
            [
                appointmentDate,
                appointmentTime,
                status || 'Scheduled',
                reason,
                studentId,
                nurseId,
                { dir: 3, type: 2010 } // OUT number
            ]
        );

        return NextResponse.json({
            success: true,
            message: "Appointment created successfully",
            id: result.outBinds?.[0],
        });
    } catch (error) {
        console.error("Error creating appointment:", error);
        return NextResponse.json(
            { error: "Failed to create appointment" },
            { status: 500 }
        );
    }
}
