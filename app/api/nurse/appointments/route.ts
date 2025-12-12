import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/db/oracle";

export async function GET(request: NextRequest) {
    try {
        const nurseId = request.headers.get("x-nurse-id");
        const { searchParams } = new URL(request.url);
        const studentId = searchParams.get("studentId");

        if (!nurseId) {
            return NextResponse.json({ error: "Nurse ID not provided" }, { status: 400 });
        }

        let sql = `
            SELECT 
                a.AppointmentID,
                TO_CHAR(a.AppointmentDate, 'YYYY-MM-DD') as AppointmentDate,
                a.AppointmentTime,
                a.Status,
                a.Reason,
                a.FK_StudentID as StudentID,
                s.FirstName || ' ' || s.LastName as StudentName
            FROM Appointment a
            JOIN Student s ON a.FK_StudentID = s.StudentID
            WHERE a.FK_NurseID = :1
        `;
        const params: any[] = [parseInt(nurseId)];

        if (studentId) {
            sql += " AND a.FK_StudentID = :2";
            params.push(parseInt(studentId));
        }

        sql += " ORDER BY a.AppointmentDate ASC";

        const result = await executeQuery(sql, params);

        return NextResponse.json({
            success: true,
            appointments: result.rows || [],
        });
    } catch (error: any) {
        console.error("Error fetching appointments:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch appointments" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { nurseId, studentId, date, time, reason, status } = body;

        const sql = `
            INSERT INTO Appointment (AppointmentDate, AppointmentTime, Reason, Status, FK_NurseID, FK_StudentID)
            VALUES (TO_DATE(:1, 'YYYY-MM-DD'), :2, :3, :4, :5, :6)
        `;

        await executeQuery(sql, [date, time, reason, status || 'Scheduled', nurseId, studentId]);

        return NextResponse.json({ success: true, message: "Appointment created" });
    } catch (error: any) {
        console.error("Error creating appointment:", error);
        return NextResponse.json({ success: false, error: "Failed to create appointment" }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { appointmentId, date, time, reason, status } = body;

        const sql = `
            UPDATE Appointment
            SET AppointmentDate = TO_DATE(:1, 'YYYY-MM-DD'), 
                AppointmentTime = :2, 
                Reason = :3, 
                Status = :4
            WHERE AppointmentID = :5
        `;

        await executeQuery(sql, [date, time, reason, status, appointmentId]);

        return NextResponse.json({ success: true, message: "Appointment updated" });
    } catch (error: any) {
        console.error("Error updating appointment:", error);
        return NextResponse.json({ success: false, error: "Failed to update appointment" }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const appointmentId = searchParams.get("id");

        if (!appointmentId) return NextResponse.json({ error: "ID required" }, { status: 400 });

        await executeQuery("DELETE FROM Appointment WHERE AppointmentID = :1", [parseInt(appointmentId)]);

        return NextResponse.json({ success: true, message: "Appointment deleted" });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: "Failed to delete appointment" }, { status: 500 });
    }
}
