import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/db/oracle";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const studentId = searchParams.get("studentId");

        if (!studentId) {
            return NextResponse.json({ error: "Student ID required" }, { status: 400 });
        }

        // Fetch Profile - using ONLY existing database columns
        const sql = `
      SELECT 
        hp.ProfileID,
        hp.Height,
        hp.BloodType,
        hp.Allergies,
        hp.ChronicConditions,
        TO_CHAR(hp.LastUpdated, 'YYYY-MM-DD') as LastUpdated,
        s.FirstName,
        s.LastName,
        TO_CHAR(s.DateOfBirth, 'YYYY-MM-DD') as DOB,
        s.Gender
      FROM Student s
      LEFT JOIN HealthProfile hp ON s.StudentID = hp.FK_StudentID
      WHERE s.StudentID = :1
    `;

        const result = await executeQuery(sql, [parseInt(studentId)]);

        return NextResponse.json({
            success: true,
            profile: result.rows?.[0] || null
        });

    } catch (error: any) {
        console.error("Clinical profile GET error:", error);
        return NextResponse.json({ error: error.message || "Failed to fetch profile" }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            studentId,
            height,
            bloodType,
            allergies,
            conditions
        } = body;

        // Check if profile exists
        const checkSql = "SELECT ProfileID FROM HealthProfile WHERE FK_StudentID = :1";
        const checkRes = await executeQuery(checkSql, [studentId]);

        if (checkRes.rows && checkRes.rows.length > 0) {
            // Update - using ONLY existing columns
            const updateSql = `
        UPDATE HealthProfile SET
          Height = :1,
          BloodType = :2,
          Allergies = :3,
          ChronicConditions = :4,
          LastUpdated = SYSDATE
        WHERE FK_StudentID = :5
      `;
            await executeQuery(updateSql, [
                height, bloodType, allergies, conditions,
                studentId
            ]);
        } else {
            // Insert - using ONLY existing columns
            const insertSql = `
        INSERT INTO HealthProfile (
          Height, BloodType, Allergies, ChronicConditions,
          FK_StudentID
        ) VALUES (
          :1, :2, :3, :4, :5
        )
      `;
            await executeQuery(insertSql, [
                height, bloodType, allergies, conditions,
                studentId
            ]);
        }

        return NextResponse.json({ success: true, message: "Profile updated" });

    } catch (error: any) {
        console.error("Clinical profile PUT error:", error);
        return NextResponse.json({ error: error.message || "Failed to update profile" }, { status: 500 });
    }
}
