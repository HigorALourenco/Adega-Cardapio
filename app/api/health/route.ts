import { NextResponse } from "next/server"

export async function GET() {
  try {
    const startTime = Date.now()

    // Verificações básicas
    const checks = {
      service: "vercel-deploy-api",
      version: "1.0.0",
      status: "healthy",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
      vercel: {
        region: process.env.VERCEL_REGION || null,
        deployment: process.env.VERCEL_DEPLOYMENT_ID || null,
        url: process.env.VERCEL_URL || null,
      },
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      },
      config: {
        jwtSecret: !!process.env.JWT_SECRET,
        vercelToken: !!process.env.VERCEL_TOKEN,
        nodeEnv: process.env.NODE_ENV || "not_set",
      },
      responseTime: Date.now() - startTime,
    }

    return NextResponse.json({
      status: "success",
      data: checks,
    })
  } catch (error) {
    console.error("Health check error:", error)
    return NextResponse.json(
      {
        status: "error",
        message: "Health check falhou",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
