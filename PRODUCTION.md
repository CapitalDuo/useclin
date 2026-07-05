# Production checklist

Tarefas manuais (UI dashboards) que precisam acontecer depois de cada deploy
em produção, e que não cabem em código/SQL.

## 🔐 Supabase Dashboard

Projeto: `imhsbmtmdsltbxpafsoj`

- [ ] **Leaked Password Protection** — Auth → Policies → habilitar
      "Prevent users from using a leaked password" (cruza com HaveIBeenPwned).
      Custo: zero. Bloqueia senhas vazadas conhecidas.

- [ ] **Site URL** — Auth → URL Configuration → `https://www.useclin.com.br`

- [ ] **Additional Redirect URLs** — Auth → URL Configuration:
  - `https://www.useclin.com.br/**`
  - `https://*.vercel.app/**` (pra preview deploys)
  - `http://localhost:3000/**` (dev local)

- [ ] **MFA / 2FA** — opcional mas recomendado pra `capital.schutz@gmail.com` (admin da plataforma).

## ⚙️ Vercel Dashboard

Projeto: `useclin` (team `capitalduo`) — domínio `useclin.com.br`

### Environment Variables — Production + Preview

- [ ] `NEXT_PUBLIC_SUPABASE_URL` ✓ já configurado
- [ ] `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` ✓ já configurado
- [ ] `SUPABASE_SERVICE_ROLE_KEY` — copiar da Supabase (Settings → API → service_role).
      **Marcar como Sensitive.** Só Production + Preview, NÃO Development.
- [ ] `UPSTASH_REDIS_REST_URL` — após provisionar Upstash Redis no Marketplace.
- [ ] `UPSTASH_REDIS_REST_TOKEN` — idem.

### Integrações recomendadas

- [ ] **Upstash Redis** — Vercel Marketplace → Storage → Upstash. Free tier
      sobra pro rate limit. Provisionar pra Production + Preview, vars
      auto-injetadas.
- [ ] **Vercel BotID** — GA jun/2025. Project Settings → Security → enable.
      Bloqueia bots no edge, custo zero, sem código.
- [ ] **Vercel WAF** — opcional. Settings → Firewall → enable managed rules.

## 🧪 Verificação pós-deploy

- [ ] Login com conta de teste em `https://www.useclin.com.br/login`
- [ ] Tentar criar 30 consultas em 1 minuto → deve bloquear na 21ª com mensagem
      "Muitas requisições. Tente novamente em Ns." (só funciona se Upstash
      estiver configurado).
- [ ] `GET /rest/v1/rpc/auth_clinica_id` com JWT válido → deve retornar 404 ou
      403 (função revogada do REST API).
