import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"

// Usuários em memória (em produção, use um banco de dados)
const users = [
  {
    id: "1",
    username: "admin",
    password: "admin123", // Em produção, use hash de senha
    role: "admin",
  },
]

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    // Validar entrada
    if (!username || !password) {
      return NextResponse.json({ status: "error", message: "Username e password são obrigatórios" }, { status: 400 })
    }

    // Encontrar usuário
    const user = users.find((u) => u.username === username)

    // Verificar se o usuário existe e senha está correta
    if (!user || user.password !== password) {
      return NextResponse.json({ status: "error", message: "Credenciais inválidas" }, { status: 401 })
    }

    // Gerar token JWT
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
      },
      process.env.JWT_SECRET || "default_secret",
      { expiresIn: process.env.JWT_EXPIRATION || "24h" },
    )

    return NextResponse.json({
      status: "success",
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
        },
      },
    })
  } catch (error) {
    console.error("Erro no login:", error)
    return NextResponse.json({ status: "error", message: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  })
}
