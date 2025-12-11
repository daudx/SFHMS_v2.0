import { NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/db/oracle"
import bcrypt from "bcryptjs"

// GET all users
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const role = searchParams.get("role")

    let sql = 'SELECT * FROM "User"'
    const params: any[] = []

    if (role) {
      sql += " WHERE Role = :1"
      params.push(role)
    }

    sql += " ORDER BY CreatedDate DESC"

    const result = await executeQuery(sql, params)

    return NextResponse.json({
      success: true,
      data: result.rows,
    })
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    )
  }
}

// POST create new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password, role, email } = body

    // Hash password before storing
    const passwordHash = await bcrypt.hash(password, 10)

    const sql = `
      INSERT INTO "User" (Username, PasswordHash, Role, Email)
      VALUES (:1, :2, :3, :4)
      RETURNING UserID INTO :5
    `

    const result = await executeQuery(sql, [
      username,
      passwordHash,
      role,
      email,
      { dir: 3, type: 2 },
    ])

    return NextResponse.json({
      success: true,
      message: "User created successfully",
      userId: result.outBinds?.[0],
    })
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    )
  }
}

// PUT update user
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, username, role, email } = body

    const sql = `
      UPDATE "User"
      SET Username = :1, Role = :2, Email = :3
      WHERE UserID = :4
    `

    await executeQuery(sql, [username, role, email, userId])

    return NextResponse.json({
      success: true,
      message: "User updated successfully",
    })
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    )
  }
}

// DELETE user
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      )
    }

    const sql = 'DELETE FROM "User" WHERE UserID = :1'
    await executeQuery(sql, [parseInt(userId)])

    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    )
  }
}
