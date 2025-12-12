import oracledb from "oracledb"

let connection: any

export async function initializeConnection() {
  try {
    const user = process.env.ORACLE_USER;
    const password = process.env.ORACLE_PASSWORD;
    const host = process.env.NEXT_PUBLIC_ORACLE_HOST;
    const port = process.env.NEXT_PUBLIC_ORACLE_PORT;
    const sid = process.env.NEXT_PUBLIC_ORACLE_SID;

    if (!user || !password || !host || !port || !sid) {
      throw new Error("Missing required Oracle database environment variables");
    }

    connection = await oracledb.getConnection({
      user,
      password,
      connectString: `${host}:${port}/${sid}`,
    })
    console.log("[v0] Oracle database connected successfully")
    return connection
  } catch (error) {
    console.error("[v0] Failed to connect to Oracle:", error)
    throw error
  }
}

export async function getConnection() {
  try {
    const user = process.env.ORACLE_USER;
    const password = process.env.ORACLE_PASSWORD;
    const host = process.env.NEXT_PUBLIC_ORACLE_HOST;
    const port = process.env.NEXT_PUBLIC_ORACLE_PORT;
    const sid = process.env.NEXT_PUBLIC_ORACLE_SID;

    if (!user || !password || !host || !port || !sid) {
      throw new Error("Missing required Oracle database environment variables");
    }

    // Always create a new connection for each request
    const connection = await oracledb.getConnection({
      user,
      password,
      connectString: `${host}:${port}/${sid}`,
    })

    return connection
  } catch (error) {
    console.error("[API] Failed to connect to Oracle:", error)
    throw error
  }
}

export async function closeConnection() {
  if (connection) {
    try {
      await connection.close()
      connection = null
      console.log("[v0] Oracle connection closed")
    } catch (error) {
      console.error("[v0] Error closing connection:", error)
    }
  }
}

export async function executeQuery(sql: string, bindParams: any[] = []) {
  let conn
  try {
    conn = await getConnection()
    const options: any = {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
      autoCommit: true
    }

    // Check if we have an OUT parameter
    const hasOutParam = bindParams.some(param => param && typeof param === 'object' && param.dir === 3003) // 3003 = BIND_OUT
    if (hasOutParam) {
      options.autoCommit = true
    }

    const result = await conn.execute(sql, bindParams, options)
    return result
  } catch (error) {
    console.error("[v0] Oracle query error:", error)
    throw error
  } finally {
    if (conn) {
      try {
        await conn.close()
      } catch (err) {
        console.error("[v0] Error closing connection in executeQuery:", err)
      }
    }
  }
}
