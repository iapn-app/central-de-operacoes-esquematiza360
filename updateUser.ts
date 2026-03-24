import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function updateUser() {
  const { data, error } = await supabase.auth.admin.updateUserById(
    '70193da5-402b-4456-93c1-a8ba365482a4',
    {
      email: 'qualidade@esquematizavigilancia.com.br',
      password: 'Esquematiz@2026'
    }
  )

  if (error) {
    console.error('Erro:', error)
  } else {
    console.log('Atualizado:', data)
  }
}

updateUser()
