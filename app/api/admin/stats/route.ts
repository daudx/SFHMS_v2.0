import { NextRequest, NextResponse } from "next/server";
import { getConnection } from "@/lib/db/oracle";

export async function GET(request: NextRequest) {
    let connection;
    try {
        connection = await getConnection();

        // Parallel queries or single query with subselects
        // Oracle supports subqueries in select list

        const query = `
            SELECT 
                (SELECT COUNT(*) FROM Student) as StudentCount,
                (SELECT COUNT(*) FROM Coach) as CoachCount,
                (SELECT COUNT(*) FROM Nurse) as NurseCount,
                (SELECT COUNT(*) FROM "User") as UserCount,
                (SELECT COUNT(*) FROM Student WHERE FK_CoachID IS NULL OR FK_NurseID IS NULL) as PendingAssignments
            FROM DUAL
        `;

        const result = await connection.execute(query, [], { outFormat: 4002 });
        return NextResponse.json({ success: true, stats: result.rows[0] });

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    } finally {
        if (connection) await connection.close();
    }
}
