import { NextRequest, NextResponse } from "next/server";
import { getConnection } from "@/lib/db/oracle";

export async function GET(request: NextRequest) {
    let connection;
    try {
        connection = await getConnection();
        const result = await connection.execute(
            `SELECT SettingID, Category, Name, Value, Type FROM SystemSettings WHERE IsActive = 1 ORDER BY Category, Name`,
            [], { outFormat: 4002 }
        );
        return NextResponse.json({ success: true, settings: result.rows });
    } catch (e: any) {
        if (e.message.includes("ORA-00942")) {
            return NextResponse.json({ success: true, settings: [] });
        }
        return NextResponse.json({ error: e.message }, { status: 500 });
    } finally {
        if (connection) await connection.close();
    }
}

export async function POST(request: NextRequest) {
    let connection;
    try {
        const body = await request.json();
        const { category, name, value, type } = body;

        connection = await getConnection();
        await connection.execute(
            `INSERT INTO SystemSettings (SettingID, Category, Name, Value, Type) 
             VALUES (seq_systemsettings_id.NEXTVAL, :category, :name, :value, :type)`,
            { category, name, value, type: type || 'String' },
            { autoCommit: true }
        );
        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    } finally {
        if (connection) await connection.close();
    }
}

export async function DELETE(request: NextRequest) {
    let connection;
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");
        if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

        connection = await getConnection();
        await connection.execute(
            `UPDATE SystemSettings SET IsActive = 0 WHERE SettingID = :id`,
            { id },
            { autoCommit: true }
        );
        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    } finally {
        if (connection) await connection.close();
    }
}
