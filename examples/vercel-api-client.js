// Cliente JavaScript otimizado para a API na Vercel
class VercelDeployAPI {
  constructor(baseUrl) {
    this.baseUrl = baseUrl.replace(/\/$/, "") // Remove trailing slash
    this.token = null
  }

  async login(username = "admin", password = "admin123") {
    try {
      const response = await fetch(`${this.baseUrl}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (data.status === "success") {
        this.token = data.data.token
        console.log("✅ Login realizado com sucesso")
        return this.token
      } else {
        throw new Error(data.message || "Falha no login")
      }
    } catch (error) {
      console.error("❌ Erro no login:", error.message)
      throw error
    }
  }

  async startDeploy(repoUrl, branch = "main", vercelToken = null) {
    if (!this.token) {
      throw new Error("Token não encontrado. Faça login primeiro.")
    }

    try {
      const body = { repoUrl, branch }
      if (vercelToken) {
        body.vercelToken = vercelToken
      }

      const response = await fetch(`${this.baseUrl}/api/deploy`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.token}`,
        },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (data.status === "success") {
        console.log("🚀 Deploy iniciado:", data.data.deployId)
        return data.data.deployId
      } else {
        throw new Error(data.message || "Falha ao iniciar deploy")
      }
    } catch (error) {
      console.error("❌ Erro ao iniciar deploy:", error.message)
      throw error
    }
  }

  async getDeployStatus(deployId) {
    if (!this.token) {
      throw new Error("Token não encontrado. Faça login primeiro.")
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/deploy/${deployId}`, {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      })

      const data = await response.json()

      if (data.status === "success") {
        return data.data
      } else {
        throw new Error(data.message || "Falha ao obter status")
      }
    } catch (error) {
      console.error("❌ Erro ao obter status:", error.message)
      throw error
    }
  }

  async waitForDeploy(deployId, maxWaitTime = 300000) {
    // 5 minutos (Vercel é mais rápido)
    const startTime = Date.now()
    const checkInterval = 3000 // 3 segundos

    console.log(`⏳ Aguardando deploy ${deployId}...`)

    return new Promise((resolve, reject) => {
      const checkStatus = async () => {
        try {
          const status = await this.getDeployStatus(deployId)

          console.log(`📊 Status: ${status.status}`)

          if (status.status === "completed") {
            console.log(`✅ Deploy concluído! URL: ${status.projectUrl}`)
            resolve(status)
            return
          }

          if (status.status === "failed") {
            console.log(`❌ Deploy falhou: ${status.error}`)
            reject(new Error(status.error || "Deploy falhou"))
            return
          }

          // Verificar timeout
          if (Date.now() - startTime > maxWaitTime) {
            reject(new Error("Timeout: Deploy demorou muito para completar"))
            return
          }

          // Continuar verificando
          setTimeout(checkStatus, checkInterval)
        } catch (error) {
          reject(error)
        }
      }

      checkStatus()
    })
  }

  async getAllDeploys() {
    if (!this.token) {
      throw new Error("Token não encontrado. Faça login primeiro.")
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/deploy`, {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      })

      const data = await response.json()

      if (data.status === "success") {
        return data.data
      } else {
        throw new Error(data.message || "Falha ao obter deploys")
      }
    } catch (error) {
      console.error("❌ Erro ao obter deploys:", error.message)
      throw error
    }
  }

  async healthCheck() {
    try {
      const response = await fetch(`${this.baseUrl}/api/health`)
      const data = await response.json()

      if (data.status === "success") {
        console.log("✅ API está funcionando:", data.data.status)
        return data.data
      } else {
        throw new Error("Health check falhou")
      }
    } catch (error) {
      console.error("❌ Erro no health check:", error.message)
      throw error
    }
  }
}

// Exemplo de uso
async function exemploCompleto() {
  // Substitua pela URL da sua API na Vercel
  const API_URL = "https://sua-api.vercel.app"
  const client = new VercelDeployAPI(API_URL)

  try {
    // 1. Verificar se a API está funcionando
    await client.healthCheck()

    // 2. Fazer login
    await client.login()

    // 3. Iniciar deploy
    const deployId = await client.startDeploy("https://github.com/seu-usuario/adega-online.git", "main")

    // 4. Aguardar conclusão
    const result = await client.waitForDeploy(deployId)

    console.log("🎉 Deploy concluído com sucesso!")
    console.log("📊 Resultado:", result)

    // 5. Listar todos os deploys
    const allDeploys = await client.getAllDeploys()
    console.log("📋 Todos os deploys:", allDeploys)
  } catch (error) {
    console.error("💥 Erro:", error.message)
  }
}

// Executar exemplo (descomente para testar)
// exemploCompleto()

export default VercelDeployAPI
