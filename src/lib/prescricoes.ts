// Bucket "prescricoes" é privado — pdf_url guarda o path do objeto (linhas
// antigas podem ter a URL pública/assinada completa) e a URL de exibição
// precisa ser assinada a cada carregamento da página.
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'

export function toStoragePath(u: string) {
  return u.replace(/^.*\/storage\/v1\/object\/(?:public|sign)\/prescricoes\//, '').replace(/\?.*$/, '')
}

export async function signPrescricaoUrls(
  supabase: SupabaseClient<Database>,
  pdfUrls: (string | null)[],
): Promise<Map<string, string>> {
  const paths = pdfUrls.filter((u): u is string => !!u).map(toStoragePath)
  if (!paths.length) return new Map()

  const { data: signed } = await supabase.storage.from('prescricoes').createSignedUrls(paths, 120)
  const entries: [string, string][] = []
  for (const s of signed ?? []) {
    if (s.path && s.signedUrl) entries.push([s.path, s.signedUrl])
  }
  return new Map(entries)
}
