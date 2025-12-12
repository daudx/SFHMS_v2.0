import { NextRequest, NextResponse } from "next/server";
import { getConnection } from "@/lib/db/oracle";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
    let connection;
    try {
        const cookieStore = await cookies();
        const userId = cookieStore.get("userId")?.value;

        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        connection = await getConnection();

        // 1. Get Student ID
        const studentRes = await connection.execute(
            `SELECT StudentID FROM Student WHERE FK_UserID = :userId`,
            { userId: parseInt(userId) },
            { outFormat: 4002 }
        );
        if (!studentRes.rows || studentRes.rows.length === 0) return NextResponse.json({ error: "Student not found" }, { status: 404 });
        const studentId = (studentRes.rows[0] as any).STUDENTID;

        // 2. Next Appointment (Scheduled, >= Today)
        const nextApptRes = await connection.execute(
            `SELECT * FROM Appointment 
             WHERE FK_StudentID = :studentId AND Status = 'Scheduled' AND AppointmentDate >= TRUNC(SYSDATE)
             ORDER BY AppointmentDate ASC 
             FETCH FIRST 1 ROWS ONLY`,
            { studentId }, { outFormat: 4002 }
        );

        // 3. Latest Training Plan
        const planRes = await connection.execute(
            `SELECT tp.PlanName, stp.AssignedDate 
             FROM StudentTrainingPlan stp 
             JOIN TrainingPlan tp ON stp.FK_PlanID = tp.PlanID 
             WHERE stp.FK_StudentID = :studentId 
             ORDER BY stp.AssignedDate DESC 
             FETCH FIRST 1 ROWS ONLY`,
            { studentId }, { outFormat: 4002 }
        );

        // 4. Latest Assessment
        const assessRes = await connection.execute(
            `SELECT PerformanceScore, AssessmentDate 
             FROM FitnessAssessment 
             WHERE FK_StudentID = :studentId 
             ORDER BY AssessmentDate DESC 
             FETCH FIRST 1 ROWS ONLY`,
            { studentId }, { outFormat: 4002 }
        );

        // 5. Recent Fitness Log
        const logRes = await connection.execute(
            `SELECT ActivityType, LogDate 
             FROM FitnessLog 
             WHERE FK_StudentID = :studentId 
             ORDER BY LogDate DESC 
             FETCH FIRST 1 ROWS ONLY`,
            { studentId }, { outFormat: 4002 }
        );

        // 6. Last Check-up
        const checkupRes = await connection.execute(
            `SELECT MAX(VisitDate) as LastCheckup FROM MedicalRecord WHERE FK_StudentID = :studentId`,
            { studentId }, { outFormat: 4002 }
        );

        return NextResponse.json({
            success: true,
            data: {
                nextAppointment: (nextApptRes.rows && nextApptRes.rows.length > 0) ? nextApptRes.rows[0] : null,
                latestPlan: (planRes.rows && planRes.rows.length > 0) ? planRes.rows[0] : null,
                latestAssessment: (assessRes.rows && assessRes.rows.length > 0) ? assessRes.rows[0] : null,
                recentLog: (logRes.rows && logRes.rows.length > 0) ? logRes.rows[0] : null,
                lastCheckup: (checkupRes.rows && checkupRes.rows.length > 0) ? (checkupRes.rows[0] as any).LASTCHECKUP : null
            }
        });

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    } finally {
        if (connection) await connection.close();
    }
}
