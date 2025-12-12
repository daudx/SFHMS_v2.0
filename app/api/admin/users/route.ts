import { NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/db/oracle"
import { createUser } from "@/lib/db/queries"
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
    const { username, password, role, email, fullName, details } = body

    // Hash password before storing - createUser expects hashed password
    const passwordHash = await bcrypt.hash(password, 10)

    // Use centralized createUser function to handle role-specific records
    const result = await createUser({
      name: fullName || username, // Use fullName or fallback to username
      username,
      email,
      passwordHash,
      role,
      details, // Pass the role-specific details
    })

    return NextResponse.json({
      success: true,
      message: "User created successfully",
      userId: result.userId,
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
