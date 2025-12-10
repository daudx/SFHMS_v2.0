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

        // Total appointments
        const appointmentsResult = await connection.execute(
            `SELECT COUNT(*) as TOTAL FROM Appointment WHERE FK_NurseID = :nurseId`,
            { nurseId: parseInt(nurseId) },
            { outFormat: 4001 }
        );

        // Upcoming appointments (next 7 days)
        const upcomingResult = await connection.execute(
            `SELECT COUNT(*) as TOTAL 
       FROM Appointment 
       WHERE FK_NurseID = :nurseId 
       AND AppointmentDate BETWEEN SYSDATE AND SYSDATE + 7
       AND Status = 'Scheduled'`,
            { nurseId: parseInt(nurseId) },
            { outFormat: 4001 }
        );

        // Total medical records
        const recordsResult = await connection.execute(
            `SELECT COUNT(*) as TOTAL FROM MedicalRecord WHERE FK_NurseID = :nurseId`,
            { nurseId: parseInt(nurseId) },
            { outFormat: 4001 }
        );

        // Active patients (students with appointments in last 30 days)
        const patientsResult = await connection.execute(
            `SELECT COUNT(DISTINCT FK_StudentID) as TOTAL 
       FROM Appointment 
       WHERE FK_NurseID = :nurseId 
       AND AppointmentDate >= SYSDATE - 30`,
            { nurseId: parseInt(nurseId) },
            { outFormat: 4001 }
        );

        const stats = {
            totalAppointments: appointmentsResult.rows?.[0]?.TOTAL || 0,
            upcomingAppointments: upcomingResult.rows?.[0]?.TOTAL || 0,
            medicalRecords: recordsResult.rows?.[0]?.TOTAL || 0,
            activePatients: patientsResult.rows?.[0]?.TOTAL || 0,
        };

        return NextResponse.json({
            success: true,
            stats,
        });
    } catch (error: any) {
        console.error("Error fetching nurse stats:", error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || "Failed to fetch statistics",
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
