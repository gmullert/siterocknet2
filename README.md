# 🚀 Rocknet Telecom — Landing Page & Painel de Gestão para Provedor ISP

<p align="center">
  <img src="public/rocknet-banner.jpg" alt="Rocknet Telecom Showcase" width="100%" style="border-radius: 12px; box-shadow: 0 20px 40px rgba(0,0,0,0.5);" />
</p>

<p align="center">
  <strong>Website institucional e comercial de ultra-conversão para Provedores de Internet Fibra Óptica (FTTH).</strong><br>
  Integrado com Painel de Gestão Administrativo, contratação online express com WhatsApp, consulta de viabilidade técnica em tempo real e persistência sincronizada no servidor.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-7.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/TailwindCSS-v4.3-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="TailwindCSS" />
  <img src="https://img.shields.io/badge/Vite-8.3-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
  <img src="https://img.shields.io/badge/Cloudflare_Tunnel-Zero_Trust-F38020?style=for-the-badge&logo=cloudflare&logoColor=white" alt="Cloudflare" />
</p>

---

## 🌟 Principais Recursos

### 🖥️ Frontend do Assinante (Cliente)
- **Hero Interativo com Carrossel Dinâmico**: Banners com estatísticas de latência (~5ms a 10ms), Wi-Fi Dual Band e modo Gamer com rotas otimizadas.
- **Planos de Fibra Óptica**: Vitrine de planos com seletor de roteadores inclusos (comodato), badges personalizáveis e cálculo de mensalidade.
- **Contratação Online Express (5 Etapas)**: Formulário que valida CPF, dados de instalação e gera protocolo formatado no WhatsApp do provedor.
- **Consulta de Viabilidade Técnica**: Busca instantânea por rua e bairro com indicação de fibra imediata ou em expansão.
- **Ferramentas do Assinante**: Central de 2ª via de fatura (PIX), Speedtest, desbloqueio em confiança e suporte técnico.
- **Botão Flutuante Inteligente de WhatsApp**: Card retrátil com atalhos frequentes, status de atendimento online e direcionamento ágil.
- **Transparência & LGPD**: Modais informativos sobre termos de adesão SCM e política de privacidade.

---

### 🛡️ Painel de Gestão Administrativo (Dashboard)

<p align="center">
  <img src="public/rocknet-dashboard.jpg" alt="Painel de Gestão Rocknet Telecom" width="100%" style="border-radius: 12px; box-shadow: 0 20px 40px rgba(0,0,0,0.5);" />
</p>

- **Gestão em Tempo Real**: Adicione, edite ou pause planos de internet, valores e equipamentos inclusos.
- **Cadastro de Bairros e Ruas**: Gerenciamento de áreas de atendimento com indicação de status (Fibra Ativa / Em Expansão).
- **Pipeline de Leads**: Histórico dos pedidos recebidos com protocolo, endereço, plano escolhido e botão de WhatsApp do cliente.
- **Editor de Identidade Visual**: Upload de logomarca oficial, ajuste de tamanho em pixels, troca de favicon e foto do mascote técnico.
- **Multi-usuários com Níveis de Acesso**: Suporte a administradores com permissões de Mestre e Operador.
- **Persistência Total no Servidor**: Todas as alterações feitas no dashboard são salvas atomicamente em `data/db.json` e propagadas instantaneamente para todos os visitantes do site.

---

## 🏗️ Arquitetura e Stack Tecnológica

| Camada | Tecnologia | Descrição |
|---|---|---|
| **Frontend** | React 19 + TypeScript | Interface ultra-rápida, tipada e modular |
| **Estilização** | TailwindCSS v4 | Design moderno dark-mode com efeitos neon glassmorphism |
| **Build Tool** | Vite 8 | Transpilação e empacotamento ultrarrápido |
| **Servidor / API** | Node.js 20 + Express | API REST para persistência JSON (`/api/site-data`) e upload de mídias |
| **Containerização** | Docker + Docker Compose | Deploy multi-stage com Alpine Linux e volumes persistentes |
| **Borda / SSL** | Cloudflare Tunnel (Zero Trust) | HTTPS automático, proteção anti-DDoS e acesso externo sem portas abertas no CGNAT |

---

## 🚀 Como Executar Localmente

```bash
# 1. Clonar o repositório
git clone https://github.com/gmullert/siterocknet2.git
cd siterocknet2

# 2. Instalar dependências
npm install

# 3. Iniciar o ambiente de desenvolvimento
npm run dev
```
Acesse no navegador: `http://localhost:3000`

---

## 🐳 Implantação em Produção (Proxmox / Docker)

### 1. Criar e Subir o Container

```bash
cd /opt/siterocknet2
docker compose up -d --build
```

O container `rocknet-telecom` estará rodando na porta `3000` com os seguintes volumes persistentes mapeados:
- `rocknet_data`: Garante que `data/db.json` nunca seja apagado entre atualizações.
- `rocknet_uploads`: Mantém as imagens enviadas pelo dashboard salvas com segurança.

### 2. Atualização Automática com 1 Comando

```bash
chmod +x atualizar.sh
./atualizar.sh
```

---

## 🌐 Acesso Externo via Cloudflare Tunnel (Zero Trust)

Mesmo com **CGNAT ou IP Dinâmico**, o Cloudflare Tunnel estabelece uma conexão de saída segura e publica o site com HTTPS automático:

1. No painel da **Cloudflare Zero Trust** (`one.dash.cloudflare.com`), acesse **Networks** > **Tunnels**.
2. Crie um novo túnel e execute o comando do conector no seu servidor:
   ```bash
   curl -L --output cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb && sudo dpkg -i cloudflared.deb && sudo cloudflared service install <TOKEN_DO_SEU_TUNNEL>
   ```
3. Na aba **Public Hostname**, aponte:
   - **Type**: `HTTP`
   - **URL**: `localhost:3000`
