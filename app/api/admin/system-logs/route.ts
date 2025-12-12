import { NextRequest, NextResponse } from "next/server";
import { getConnection } from "@/lib/db/oracle";

export async function GET(request: NextRequest) {
    let connection;
    try {
        connection = await getConnection();
        // Check if table exists (it should, from migration)
        const result = await connection.execute(
            `SELECT LogID, Action, PerformedBy, TO_CHAR(Timestamp, 'YYYY-MM-DD HH24:MI:SS') as LogTime, Details 
             FROM SystemLogs 
             ORDER BY LogID DESC 
             FETCH FIRST 100 ROWS ONLY`,
            [], { outFormat: 4002 }
        );

        return NextResponse.json({ success: true, logs: result.rows });
    } catch (e: any) {
        // If table doesn't exist, return empty
        if (e.message.includes("ORA-00942")) {
            return NextResponse.json({ success: true, logs: [] });
        }
        return NextResponse.json({ error: e.message }, { status: 500 });
    } finally {
        if (connection) await connection.close();
    }
}
