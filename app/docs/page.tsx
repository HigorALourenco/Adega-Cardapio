"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Copy, Play, CheckCircle, XCircle } from "lucide-react"

export default function DocsPage() {
  const [apiUrl, setApiUrl] = useState("")
  const [token, setToken] = useState("")
  const [testResults, setTestResults] = useState<Record<string, any>>({})

  // Detectar URL da API automaticamente
  useState(() => {
    if (typeof window !== "undefined") {
      setApiUrl(window.location.origin)
    }
  })

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const testEndpoint = async (endpoint: string, method = "GET", body?: any) => {
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      }

      if (token && endpoint !== "/api/auth/login") {
        headers.Authorization = `Bearer ${token}`
      }

      const response = await fetch(`${apiUrl}${endpoint}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      })

      const data = await response.json()

      setTestResults((prev) => ({
        ...prev,
        [endpoint]: {
          status: response.status,
          success: response.ok,
          data,
          timestamp: new Date().toISOString(),
        },
      }))
    } catch (error) {
      setTestResults((prev) => ({
        ...prev,
        [endpoint]: {
          status: 0,
          success: false,
          error: error instanceof Error ? error.message : "Erro desconhecido",
          timestamp: new Date().toISOString(),
        },
      }))
    }
  }

  const loginAndSetToken = async () => {
    await testEndpoint("/api/auth/login", "POST", {
      username: "admin",
      password: "admin123",
    })

    const result = testResults["/api/auth/login"]
    if (result?.success && result.data?.data?.token) {
      setToken(result.data.data.token)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-yellow-400 mb-4">Vercel Deploy API</h1>
            <p className="text-xl text-gray-300">API para automatizar deploys na Vercel através de chamadas HTTP</p>
          </div>

          {/* Configuração */}
          <Card className="bg-gray-900 border-gray-700 mb-8">
            <CardHeader>
              <CardTitle className="text-yellow-400">⚙️ Configuração</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">URL da API</label>
                <Input
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  placeholder="https://sua-api.vercel.app"
                  className="bg-gray-800 border-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Token JWT</label>
                <div className="flex space-x-2">
                  <Input
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="Token será preenchido automaticamente após login"
                    className="bg-gray-800 border-gray-600"
                  />
                  <Button onClick={loginAndSetToken} className="bg-green-600 hover:bg-green-700">
                    Login
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5 bg-gray-900">
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="auth">Autenticação</TabsTrigger>
              <TabsTrigger value="deploy">Deploy</TabsTrigger>
              <TabsTrigger value="examples">Exemplos</TabsTrigger>
              <TabsTrigger value="test">Testes</TabsTrigger>
            </TabsList>

            {/* Visão Geral */}
            <TabsContent value="overview">
              <div className="space-y-6">
                <Card className="bg-gray-900 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-yellow-400">📋 Sobre a API</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-300 mb-4">
                      Esta API permite automatizar deploys na Vercel através de chamadas HTTP simples. Ideal para
                      integração com sistemas CI/CD, webhooks ou automações personalizadas.
                    </p>

                    <h3 className="text-lg font-semibold text-yellow-400 mb-2">🚀 Recursos</h3>
                    <ul className="list-disc list-inside text-gray-300 space-y-1">
                      <li>Autenticação JWT segura</li>
                      <li>Deploy automático de repositórios Git</li>
                      <li>Monitoramento de status em tempo real</li>
                      <li>Logs detalhados de deploy</li>
                      <li>API RESTful simples e intuitiva</li>
                      <li>Documentação interativa</li>
                    </ul>

                    <h3 className="text-lg font-semibold text-yellow-400 mb-2 mt-6">🔗 Endpoints Disponíveis</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-800 p-3 rounded">
                        <Badge className="bg-blue-600 mb-2">GET</Badge>
                        <p className="font-mono text-sm">/api/health</p>
                        <p className="text-xs text-gray-400">Status da API</p>
                      </div>
                      <div className="bg-gray-800 p-3 rounded">
                        <Badge className="bg-green-600 mb-2">POST</Badge>
                        <p className="font-mono text-sm">/api/auth/login</p>
                        <p className="text-xs text-gray-400">Autenticação</p>
                      </div>
                      <div className="bg-gray-800 p-3 rounded">
                        <Badge className="bg-green-600 mb-2">POST</Badge>
                        <p className="font-mono text-sm">/api/deploy</p>
                        <p className="text-xs text-gray-400">Iniciar deploy</p>
                      </div>
                      <div className="bg-gray-800 p-3 rounded">
                        <Badge className="bg-blue-600 mb-2">GET</Badge>
                        <p className="font-mono text-sm">/api/deploy/:id</p>
                        <p className="text-xs text-gray-400">Status do deploy</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Autenticação */}
            <TabsContent value="auth">
              <div className="space-y-6">
                <Card className="bg-gray-900 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-yellow-400">🔐 Autenticação</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-300 mb-4">
                      A API usa autenticação JWT. Você precisa fazer login para obter um token antes de usar os
                      endpoints protegidos.
                    </p>

                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold text-yellow-400 mb-2">Login</h3>
                        <div className="bg-gray-800 p-4 rounded">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-mono">POST /api/auth/login</span>
                            <Button
                              size="sm"
                              onClick={() =>
                                testEndpoint("/api/auth/login", "POST", { username: "admin", password: "admin123" })
                              }
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Play className="h-4 w-4 mr-1" />
                              Testar
                            </Button>
                          </div>

                          <h4 className="font-semibold mb-2">Corpo da Requisição:</h4>
                          <pre className="bg-black p-3 rounded text-sm overflow-x-auto">
                            {`{
  "username": "admin",
  "password": "admin123"
}`}
                          </pre>

                          <h4 className="font-semibold mb-2 mt-4">Resposta de Sucesso:</h4>
                          <pre className="bg-black p-3 rounded text-sm overflow-x-auto">
                            {`{
  "status": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "1",
      "username": "admin",
      "role": "admin"
    }
  }
}`}
                          </pre>

                          {testResults["/api/auth/login"] && (
                            <div className="mt-4 p-3 bg-gray-700 rounded">
                              <div className="flex items-center mb-2">
                                {testResults["/api/auth/login"].success ? (
                                  <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                                ) : (
                                  <XCircle className="h-5 w-5 text-red-400 mr-2" />
                                )}
                                <span className="font-semibold">Status: {testResults["/api/auth/login"].status}</span>
                              </div>
                              <pre className="text-xs overflow-x-auto">
                                {JSON.stringify(
                                  testResults["/api/auth/login"].data || testResults["/api/auth/login"].error,
                                  null,
                                  2,
                                )}
                              </pre>
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-yellow-400 mb-2">Usando o Token</h3>
                        <p className="text-gray-300 mb-2">
                          Inclua o token no header Authorization de todas as requisições protegidas:
                        </p>
                        <pre className="bg-black p-3 rounded text-sm">
                          {`Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`}
                        </pre>
                      </div>

                      <div className="bg-yellow-900/20 border border-yellow-600 p-4 rounded">
                        <h4 className="font-semibold text-yellow-400 mb-2">🔑 Credenciais Padrão</h4>
                        <p className="text-sm text-gray-300">
                          <strong>Usuário:</strong> admin
                          <br />
                          <strong>Senha:</strong> admin123
                        </p>
                        <p className="text-xs text-yellow-400 mt-2">⚠️ Altere essas credenciais em produção!</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Deploy */}
            <TabsContent value="deploy">
              <div className="space-y-6">
                <Card className="bg-gray-900 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-yellow-400">🚀 Endpoints de Deploy</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Iniciar Deploy */}
                      <div>
                        <h3 className="text-lg font-semibold text-yellow-400 mb-2">Iniciar Deploy</h3>
                        <div className="bg-gray-800 p-4 rounded">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-mono">POST /api/deploy</span>
                            <Button
                              size="sm"
                              onClick={() =>
                                testEndpoint("/api/deploy", "POST", {
                                  repoUrl: "https://github.com/vercel/next.js",
                                  branch: "main",
                                })
                              }
                              className="bg-green-600 hover:bg-green-700"
                              disabled={!token}
                            >
                              <Play className="h-4 w-4 mr-1" />
                              Testar
                            </Button>
                          </div>

                          <h4 className="font-semibold mb-2">Headers:</h4>
                          <pre className="bg-black p-3 rounded text-sm">
                            {`Authorization: Bearer ${token || "SEU_TOKEN_AQUI"}
Content-Type: application/json`}
                          </pre>

                          <h4 className="font-semibold mb-2 mt-4">Corpo da Requisição:</h4>
                          <pre className="bg-black p-3 rounded text-sm">
                            {`{
  "repoUrl": "https://github.com/username/repo.git",
  "branch": "main",
  "vercelToken": "opcional_token_vercel"
}`}
                          </pre>

                          {testResults["/api/deploy"] && (
                            <div className="mt-4 p-3 bg-gray-700 rounded">
                              <div className="flex items-center mb-2">
                                {testResults["/api/deploy"].success ? (
                                  <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                                ) : (
                                  <XCircle className="h-5 w-5 text-red-400 mr-2" />
                                )}
                                <span className="font-semibold">Status: {testResults["/api/deploy"].status}</span>
                              </div>
                              <pre className="text-xs overflow-x-auto">
                                {JSON.stringify(
                                  testResults["/api/deploy"].data || testResults["/api/deploy"].error,
                                  null,
                                  2,
                                )}
                              </pre>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Listar Deploys */}
                      <div>
                        <h3 className="text-lg font-semibold text-yellow-400 mb-2">Listar Deploys</h3>
                        <div className="bg-gray-800 p-4 rounded">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-mono">GET /api/deploy</span>
                            <Button
                              size="sm"
                              onClick={() => testEndpoint("/api/deploy")}
                              className="bg-blue-600 hover:bg-blue-700"
                              disabled={!token}
                            >
                              <Play className="h-4 w-4 mr-1" />
                              Testar
                            </Button>
                          </div>

                          {testResults["/api/deploy"] && testResults["/api/deploy"].data && (
                            <div className="mt-4 p-3 bg-gray-700 rounded">
                              <div className="flex items-center mb-2">
                                <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                                <span className="font-semibold">Deploys Encontrados</span>
                              </div>
                              <pre className="text-xs overflow-x-auto">
                                {JSON.stringify(testResults["/api/deploy"].data, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Status do Deploy */}
                      <div>
                        <h3 className="text-lg font-semibold text-yellow-400 mb-2">Status do Deploy</h3>
                        <div className="bg-gray-800 p-4 rounded">
                          <span className="font-mono">GET /api/deploy/:deployId</span>
                          <p className="text-sm text-gray-400 mt-2">
                            Use o deployId retornado ao iniciar um deploy para verificar seu status.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Exemplos */}
            <TabsContent value="examples">
              <div className="space-y-6">
                <Card className="bg-gray-900 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-yellow-400">💻 Exemplos de Código</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="curl" className="space-y-4">
                      <TabsList className="grid w-full grid-cols-3 bg-gray-800">
                        <TabsTrigger value="curl">cURL</TabsTrigger>
                        <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                        <TabsTrigger value="python">Python</TabsTrigger>
                      </TabsList>

                      <TabsContent value="curl">
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-semibold mb-2">1. Login</h4>
                            <div className="relative">
                              <pre className="bg-black p-4 rounded text-sm overflow-x-auto">
                                {`curl -X POST ${apiUrl}/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"username": "admin", "password": "admin123"}'`}
                              </pre>
                              <Button
                                size="sm"
                                className="absolute top-2 right-2"
                                onClick={() =>
                                  copyToClipboard(
                                    `curl -X POST ${apiUrl}/api/auth/login -H "Content-Type: application/json" -d '{"username": "admin", "password": "admin123"}'`,
                                  )
                                }
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          <div>
                            <h4 className="font-semibold mb-2">2. Iniciar Deploy</h4>
                            <div className="relative">
                              <pre className="bg-black p-4 rounded text-sm overflow-x-auto">
                                {`curl -X POST ${apiUrl}/api/deploy \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer SEU_TOKEN" \\
  -d '{
    "repoUrl": "https://github.com/username/repo.git",
    "branch": "main"
  }'`}
                              </pre>
                              <Button
                                size="sm"
                                className="absolute top-2 right-2"
                                onClick={() =>
                                  copyToClipboard(
                                    `curl -X POST ${apiUrl}/api/deploy -H "Content-Type: application/json" -H "Authorization: Bearer SEU_TOKEN" -d '{"repoUrl": "https://github.com/username/repo.git", "branch": "main"}'`,
                                  )
                                }
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          <div>
                            <h4 className="font-semibold mb-2">3. Verificar Status</h4>
                            <div className="relative">
                              <pre className="bg-black p-4 rounded text-sm overflow-x-auto">
                                {`curl -X GET ${apiUrl}/api/deploy/DEPLOY_ID \\
  -H "Authorization: Bearer SEU_TOKEN"`}
                              </pre>
                              <Button
                                size="sm"
                                className="absolute top-2 right-2"
                                onClick={() =>
                                  copyToClipboard(
                                    `curl -X GET ${apiUrl}/api/deploy/DEPLOY_ID -H "Authorization: Bearer SEU_TOKEN"`,
                                  )
                                }
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="javascript">
                        <div className="relative">
                          <pre className="bg-black p-4 rounded text-sm overflow-x-auto">
                            {`// Cliente JavaScript para a API
class VercelDeployAPI {
  constructor(baseUrl) {
    this.baseUrl = baseUrl
    this.token = null
  }

  async login(username = 'admin', password = 'admin123') {
    const response = await fetch(\`\${this.baseUrl}/api/auth/login\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    })
    
    const data = await response.json()
    if (data.status === 'success') {
      this.token = data.data.token
      return this.token
    }
    throw new Error(data.message)
  }

  async startDeploy(repoUrl, branch = 'main') {
    const response = await fetch(\`\${this.baseUrl}/api/deploy\`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': \`Bearer \${this.token}\`
      },
      body: JSON.stringify({ repoUrl, branch })
    })
    
    const data = await response.json()
    if (data.status === 'success') {
      return data.data.deployId
    }
    throw new Error(data.message)
  }

  async getDeployStatus(deployId) {
    const response = await fetch(\`\${this.baseUrl}/api/deploy/\${deployId}\`, {
      headers: { 'Authorization': \`Bearer \${this.token}\` }
    })
    
    const data = await response.json()
    if (data.status === 'success') {
      return data.data
    }
    throw new Error(data.message)
  }
}

// Exemplo de uso
async function exemplo() {
  const api = new VercelDeployAPI('${apiUrl}')
  
  try {
    await api.login()
    const deployId = await api.startDeploy('https://github.com/username/repo.git')
    
    // Verificar status periodicamente
    const checkStatus = async () => {
      const status = await api.getDeployStatus(deployId)
      console.log('Status:', status.status)
      
      if (status.status === 'completed') {
        console.log('Deploy concluído!', status.projectUrl)
      } else if (status.status === 'failed') {
        console.log('Deploy falhou:', status.error)
      } else {
        setTimeout(checkStatus, 5000) // Verificar novamente em 5s
      }
    }
    
    checkStatus()
  } catch (error) {
    console.error('Erro:', error.message)
  }
}`}
                          </pre>
                          <Button
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={() =>
                              copyToClipboard(
                                `// Cliente JavaScript para a API\nclass VercelDeployAPI {\n  constructor(baseUrl) {\n    this.baseUrl = baseUrl\n    this.token = null\n  }\n\n  async login(username = 'admin', password = 'admin123') {\n    const response = await fetch(\`\${this.baseUrl}/api/auth/login\`, {\n      method: 'POST',\n      headers: { 'Content-Type': 'application/json' },\n      body: JSON.stringify({ username, password })\n    })\n    \n    const data = await response.json()\n    if (data.status === 'success') {\n      this.token = data.data.token\n      return this.token\n    }\n    throw new Error(data.message)\n  }\n\n  async startDeploy(repoUrl, branch = 'main') {\n    const response = await fetch(\`\${this.baseUrl}/api/deploy\`, {\n      method: 'POST',\n      headers: {\n        'Content-Type': 'application/json',\n        'Authorization': \`Bearer \${this.token}\`\n      },\n      body: JSON.stringify({ repoUrl, branch })\n    })\n    \n    const data = await response.json()\n    if (data.status === 'success') {\n      return data.data.deployId\n    }\n    throw new Error(data.message)\n  }\n\n  async getDeployStatus(deployId) {\n    const response = await fetch(\`\${this.baseUrl}/api/deploy/\${deployId}\`, {\n      headers: { 'Authorization': \`Bearer \${this.token}\` }\n    })\n    \n    const data = await response.json()\n    if (data.status === 'success') {\n      return data.data\n    }\n    throw new Error(data.message)\n  }\n}`,
                              )
                            }
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </TabsContent>

                      <TabsContent value="python">
                        <div className="relative">
                          <pre className="bg-black p-4 rounded text-sm overflow-x-auto">
                            {`import requests
import time

class VercelDeployAPI:
    def __init__(self, base_url):
        self.base_url = base_url
        self.token = None
    
    def login(self, username='admin', password='admin123'):
        response = requests.post(
            f'{self.base_url}/api/auth/login',
            json={'username': username, 'password': password}
        )
        
        data = response.json()
        if data['status'] == 'success':
            self.token = data['data']['token']
            return self.token
        raise Exception(data['message'])
    
    def start_deploy(self, repo_url, branch='main'):
        response = requests.post(
            f'{self.base_url}/api/deploy',
            json={'repoUrl': repo_url, 'branch': branch},
            headers={'Authorization': f'Bearer {self.token}'}
        )
        
        data = response.json()
        if data['status'] == 'success':
            return data['data']['deployId']
        raise Exception(data['message'])
    
    def get_deploy_status(self, deploy_id):
        response = requests.get(
            f'{self.base_url}/api/deploy/{deploy_id}',
            headers={'Authorization': f'Bearer {self.token}'}
        )
        
        data = response.json()
        if data['status'] == 'success':
            return data['data']
        raise Exception(data['message'])
    
    def wait_for_deploy(self, deploy_id, max_wait=600):
        start_time = time.time()
        
        while time.time() - start_time < max_wait:
            status = self.get_deploy_status(deploy_id)
            print(f"Status: {status['status']}")
            
            if status['status'] == 'completed':
                print(f"Deploy concluído! URL: {status.get('projectUrl')}")
                return status
            elif status['status'] == 'failed':
                raise Exception(f"Deploy falhou: {status.get('error')}")
            
            time.sleep(5)
        
        raise Exception("Timeout: Deploy demorou muito para completar")

# Exemplo de uso
if __name__ == '__main__':
    api = VercelDeployAPI('${apiUrl}')
    
    try:
        api.login()
        deploy_id = api.start_deploy('https://github.com/username/repo.git')
        result = api.wait_for_deploy(deploy_id)
        print("Deploy concluído com sucesso!", result)
    except Exception as e:
        print(f"Erro: {e}")`}
                          </pre>
                          <Button
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={() =>
                              copyToClipboard(
                                `import requests\nimport time\n\nclass VercelDeployAPI:\n    def __init__(self, base_url):\n        self.base_url = base_url\n        self.token = None\n    \n    def login(self, username='admin', password='admin123'):\n        response = requests.post(\n            f'{self.base_url}/api/auth/login',\n            json={'username': username, 'password': password}\n        )\n        \n        data = response.json()\n        if data['status'] == 'success':\n            self.token = data['data']['token']\n            return self.token\n        raise Exception(data['message'])\n    \n    def start_deploy(self, repo_url, branch='main'):\n        response = requests.post(\n            f'{self.base_url}/api/deploy',\n            json={'repoUrl': repo_url, 'branch': branch},\n            headers={'Authorization': f'Bearer {self.token}'}\n        )\n        \n        data = response.json()\n        if data['status'] == 'success':\n            return data['data']['deployId']\n        raise Exception(data['message'])`,
                              )
                            }
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Testes */}
            <TabsContent value="test">
              <div className="space-y-6">
                <Card className="bg-gray-900 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-yellow-400">🧪 Teste da API</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Button onClick={() => testEndpoint("/api/health")} className="bg-blue-600 hover:bg-blue-700">
                          <Play className="h-4 w-4 mr-2" />
                          Testar Health Check
                        </Button>

                        <Button onClick={loginAndSetToken} className="bg-green-600 hover:bg-green-700">
                          <Play className="h-4 w-4 mr-2" />
                          Fazer Login
                        </Button>

                        <Button
                          onClick={() => testEndpoint("/api/deploy")}
                          className="bg-purple-600 hover:bg-purple-700"
                          disabled={!token}
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Listar Deploys
                        </Button>

                        <Button
                          onClick={() =>
                            testEndpoint("/api/deploy", "POST", {
                              repoUrl: "https://github.com/vercel/next.js",
                              branch: "main",
                            })
                          }
                          className="bg-orange-600 hover:bg-orange-700"
                          disabled={!token}
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Testar Deploy
                        </Button>
                      </div>

                      {/* Resultados dos Testes */}
                      <div className="space-y-4">
                        {Object.entries(testResults).map(([endpoint, result]) => (
                          <div key={endpoint} className="bg-gray-800 p-4 rounded">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-mono text-sm">{endpoint}</span>
                              <div className="flex items-center space-x-2">
                                {result.success ? (
                                  <CheckCircle className="h-5 w-5 text-green-400" />
                                ) : (
                                  <XCircle className="h-5 w-5 text-red-400" />
                                )}
                                <Badge className={result.success ? "bg-green-600" : "bg-red-600"}>
                                  {result.status}
                                </Badge>
                              </div>
                            </div>
                            <pre className="text-xs bg-black p-3 rounded overflow-x-auto">
                              {JSON.stringify(result.data || result.error, null, 2)}
                            </pre>
                            <p className="text-xs text-gray-400 mt-2">{new Date(result.timestamp).toLocaleString()}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
