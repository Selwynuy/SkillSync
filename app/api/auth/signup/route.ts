import { NextRequest, NextResponse } from "next/server"
import { createUser } from "@/lib/auth/users"

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }

    const user = await createUser(email, password, name)

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    })
  } catch (error: any) {
    if (error.message === "User already exists") {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 }
    )
  }
}
