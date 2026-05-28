import { supabase } from './supabase'

export const EmentasService = {
  async buscarEmentas() {
    const { data, error } = await supabase.from('ementas').select('*').limit(50)

    if (error) throw error

    const ementas = Array.isArray(data) ? data : []
    return ementas.sort((a: any, b: any) => {
      const dataA = new Date(a?.data_ementa || a?.created_at || 0).getTime()
      const dataB = new Date(b?.data_ementa || b?.created_at || 0).getTime()
      return dataA - dataB
    })
  },
}
