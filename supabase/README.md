# Supabase

Estrutura sincronizada com a produção (projeto `imhsbmtmdsltbxpafsoj`).

## Migrations

Cada arquivo em `migrations/` é uma migration timestamped que já foi aplicada
em produção. Os nomes seguem o padrão `<version>_<name>.sql`.

Para aplicar em um banco novo (fresh dev/staging):

```bash
supabase link --project-ref <ref>
supabase db push
```

Para sincronizar mudanças remotas para cá:

```bash
supabase db pull
```

## Por que não tem `schema.sql`

O `schema.sql` antigo era um dump manual desatualizado (sem RLS, sem
`plataforma_admins`, sem suporte). Migrations são a fonte da verdade agora —
elas espelham 1:1 o que está aplicado na produção.

## Checklist pós-clone

Coisas que **não** estão no SQL e precisam ser configuradas na UI do Supabase:

- [ ] **Leaked Password Protection** — Dashboard → Auth → Policies → habilitar
      HaveIBeenPwned check.
- [ ] **Site URL** + **Additional Redirect URLs** apontando pro domínio de
      produção (`https://useclin.vercel.app`) e pro dev (`http://localhost:3000`).
- [ ] **SUPABASE_SERVICE_ROLE_KEY** copiada pra Vercel env vars (nunca commitar).
