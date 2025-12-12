import { NextRequest, NextResponse } from "next/server";
import { getConnection } from "@/lib/db/oracle";
import { cookies } from "next/headers";

// GET /api/student/health-profile
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
            `SELECT StudentID, FirstName, LastName FROM Student WHERE FK_UserID = :userId`,
            { userId: parseInt(userId) },
            { outFormat: 4002 }
        );

        if (!studentRes.rows || studentRes.rows.length === 0) {
            return NextResponse.json({ error: "Student not found" }, { status: 404 });
        }
        const student = (studentRes.rows[0] as any);

        // 2. Get Health Profile (Height, BloodType, Allergies, Conditions)
        const profileRes = await connection.execute(
            `SELECT * FROM HealthProfile WHERE FK_StudentID = :studentId`,
            { studentId: student.STUDENTID },
            { outFormat: 4002 }
        );

        // 3. Get Latest Vitals (from MedicalRecord notes or just return N/A if not structured)
        // For now, we return basic profile data.

        const profile = (profileRes.rows && profileRes.rows.length > 0) ? (profileRes.rows[0] as any) : {};

        // 4. Get Last Check-up Date
        const lastCheckupRes = await connection.execute(
            `SELECT MAX(VisitDate) as LastCheckup FROM MedicalRecord WHERE FK_StudentID = :studentId`,
            { studentId: student.STUDENTID },
            { outFormat: 4002 }
        );
        const lastCheckup = (lastCheckupRes.rows && lastCheckupRes.rows.length > 0) ? (lastCheckupRes.rows[0] as any).LASTCHECKUP : null;

        return NextResponse.json({
            success: true,
            data: {
                ...student,
                ...profile,
                LASTCHECKUP: lastCheckup,
                // WEIGHT and VITALS are not in DB, returning placeholders or null
                WEIGHT: null,
                BMI: null, // Frontend can calc if height/weight exist
                VITALS: null
            }
        });

    } catch (e: any) {
        console.error(e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    } finally {
        if (connection) await connection.close();
    }
}
