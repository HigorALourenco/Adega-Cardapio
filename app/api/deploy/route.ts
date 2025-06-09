import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { v4 as uuidv4 } from "uuid"

// Armazenamento em memória para deploys (em produção, use um banco de dados)
const deployments = new Map()

// Middleware de autenticação
function verifyToken(request: NextRequest) {
  const authHeader = request.headers.get("authorization")

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Token não fornecido")
  }

  const token = authHeader.split(" ")[1]

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "default_secret")
    return decoded
  } catch (error) {
    throw new Error("Token inválido")
  }
}

// Simular deploy na Vercel
async function simulateVercelDeploy(repoUrl: string, branch = "main") {
  const deployId = uuidv4()

  // Registrar deploy
  deployments.set(deployId, {
    id: deployId,
    repoUrl,
    branch,
    status: "initiated",
    startTime: new Date(),
    logs: [`Deploy iniciado para ${repoUrl} (branch: ${branch})`],
  })

  // Simular processo de deploy assíncrono
  setTimeout(async () => {
    try {
      const deployment = deployments.get(deployId)

      // Simular clonagem
      deployment.status = "cloning"
      deployment.logs.push("Clonando repositório...")

      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Simular build
      deployment.status = "building"
      deployment.logs.push("Executando build...")

      await new Promise((resolve) => setTimeout(resolve, 3000))

      // Simular deploy
      deployment.status = "deploying"
      deployment.logs.push("Fazendo deploy na Vercel...")

      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Completar
      deployment.status = "completed"
      deployment.endTime = new Date()
      deployment.projectUrl = `https://${deployId}.vercel.app`
      deployment.logs.push(`Deploy concluído! URL: ${deployment.projectUrl}`)

      deployments.set(deployId, deployment)
    } catch (error) {
      const deployment = deployments.get(deployId)
      deployment.status = "failed"
      deployment.endTime = new Date()
      deployment.error = error instanceof Error ? error.message : "Deploy falhou"
      deployment.logs.push(`Erro: ${deployment.error}`)
      deployments.set(deployId, deployment)
    }
  }, 0)

  return deployId
}

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    verifyToken(request)

    const { repoUrl, branch = "main", vercelToken } = await request.json()

    // Validar entrada
    if (!repoUrl) {
      return NextResponse.json({ status: "error", message: "repoUrl é obrigatório" }, { status: 400 })
    }

    // Iniciar deploy simulado
    const deployId = await simulateVercelDeploy(repoUrl, branch)

    return NextResponse.json({
      status: "success",
      message: "Deploy iniciado com sucesso",
      data: {
        deployId,
        status: "initiated",
      },
    })
  } catch (error) {
    console.error("Erro no deploy:", error)

    if (error instanceof Error && error.message.includes("Token")) {
      return NextResponse.json({ status: "error", message: error.message }, { status: 401 })
    }

    return NextResponse.json({ status: "error", message: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    verifyToken(request)

    // Converter Map para Array
    const allDeployments = Array.from(deployments.values()).map((deployment) => ({
      deployId: deployment.id,
      status: deployment.status,
      repoUrl: deployment.repoUrl,
      branch: deployment.branch,
      startTime: deployment.startTime,
      endTime: deployment.endTime,
      projectUrl: deployment.projectUrl,
    }))

    return NextResponse.json({
      status: "success",
      data: allDeployments,
    })
  } catch (error) {
    console.error("Erro ao obter deploys:", error)

    if (error instanceof Error && error.message.includes("Token")) {
      return NextResponse.json({ status: "error", message: error.message }, { status: 401 })
    }

    return NextResponse.json({ status: "error", message: "Erro interno do servidor" }, { status: 500 })
  }
}
