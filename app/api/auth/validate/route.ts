import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ status: "error", message: "Token não fornecido" }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "default_secret")

      return NextResponse.json({
        status: "success",
        data: {
          valid: true,
          decoded,
        },
      })
    } catch (error) {
      return NextResponse.json({
        status: "success",
        data: {
          valid: false,
          error: "Token inválido ou expirado",
        },
      })
    }
  } catch (error) {
    console.error("Erro na validação:", error)
    return NextResponse.json({ status: "error", message: "Erro interno do servidor" }, { status: 500 })
  }
}
