import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"

// Referência ao mesmo Map usado em route.ts
// Em produção, isso seria um banco de dados
const deployments = new Map()

function verifyToken(request: NextRequest) {
  const authHeader = request.headers.get("authorization")

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Token não fornecido")
  }

  const token = authHeader.split(" ")[1]

  try {
    jwt.verify(token, process.env.JWT_SECRET || "default_secret")
    return true
  } catch (error) {
    throw new Error("Token inválido")
  }
}

export async function GET(request: NextRequest, { params }: { params: { deployId: string } }) {
  try {
    // Verificar autenticação
    verifyToken(request)

    const { deployId } = params

    if (!deployId) {
      return NextResponse.json({ status: "error", message: "Deploy ID não fornecido" }, { status: 400 })
    }

    const deployment = deployments.get(deployId)

    if (!deployment) {
      return NextResponse.json({ status: "error", message: "Deploy não encontrado" }, { status: 404 })
    }

    return NextResponse.json({
      status: "success",
      data: {
        deployId: deployment.id,
        status: deployment.status,
        repoUrl: deployment.repoUrl,
        branch: deployment.branch,
        startTime: deployment.startTime,
        endTime: deployment.endTime,
        projectUrl: deployment.projectUrl,
        error: deployment.error,
        logs: deployment.logs,
      },
    })
  } catch (error) {
    console.error("Erro ao obter status:", error)

    if (error instanceof Error && error.message.includes("Token")) {
      return NextResponse.json({ status: "error", message: error.message }, { status: 401 })
    }

    return NextResponse.json({ status: "error", message: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { deployId: string } }) {
  try {
    // Verificar autenticação
    verifyToken(request)

    const { deployId } = params

    if (!deployId) {
      return NextResponse.json({ status: "error", message: "Deploy ID não fornecido" }, { status: 400 })
    }

    const deployment = deployments.get(deployId)

    if (!deployment) {
      return NextResponse.json({ status: "error", message: "Deploy não encontrado" }, { status: 404 })
    }

    // Remover deploy apenas se estiver completo ou falhou
    if (deployment.status === "completed" || deployment.status === "failed") {
      deployments.delete(deployId)

      return NextResponse.json({
        status: "success",
        message: "Deploy removido com sucesso",
      })
    } else {
      return NextResponse.json(
        { status: "error", message: "Não é possível remover deploy em andamento" },
        { status: 400 },
      )
    }
  } catch (error) {
    console.error("Erro ao remover deploy:", error)

    if (error instanceof Error && error.message.includes("Token")) {
      return NextResponse.json({ status: "error", message: error.message }, { status: 401 })
    }

    return NextResponse.json({ status: "error", message: "Erro interno do servidor" }, { status: 500 })
  }
}
