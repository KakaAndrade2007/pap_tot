import { createClient } from '@supabase/supabase-js'

// Substitua estas duas linhas com os dados do seu painel Supabase
const supabaseUrl = 'https://abc123xyz.supabase.co' 
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' 

export const supabase = createClient(supabaseUrl, supabaseKey)