import { supabase } from './supabase'

export const NoticiasService = {
  async buscarNoticias() {
    const { data, error } = await supabase
      .from('noticias')
      .select('*')
      .limit(50)

    if (error) throw error

    const noticias = Array.isArray(data) ? data : []
    return noticias.sort((a: any, b: any) => {
      const dataA = new Date(a?.data_publicacao || a?.created_at || 0).getTime()
      const dataB = new Date(b?.data_publicacao || b?.created_at || 0).getTime()
      return dataB - dataA
    })
  },
}
