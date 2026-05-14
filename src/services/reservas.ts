import { supabase } from './supabase'

export const ReservasService = {
  async criarReserva(perfilId: string, data: string, saldoAtual: number) {
    const custo = 2.50; // Preço do almoço
    
    if (saldoAtual < custo) throw new Error("Saldo insuficiente!");

    // 1. Tenta inserir a reserva (tipo_refeicao agora é fixo)
    const { error: resError } = await supabase
      .from('reservas')
      .insert([{ 
        perfil_id: perfilId, 
        data_reserva: data, 
        tipo_refeicao: 'almoço' 
      }]);

    if (resError) {
      if (resError.code === '23505') throw new Error("Já tens almoço reservado para este dia!");
      throw resError;
    }

    // 2. Atualiza o saldo
    const novoSaldo = saldoAtual - custo;
    const { error: updateError } = await supabase
      .from('perfis')
      .update({ saldo: novoSaldo })
      .eq('id', perfilId);

    if (updateError) throw updateError;

    return novoSaldo;
  },

  async buscarMinhasReservas(perfilId: string) {
    const { data, error } = await supabase
      .from('reservas')
      .select('*')
      .eq('perfil_id', perfilId)
      .order('data_reserva', { ascending: true });

    if (error) throw error;
    return data;
  }
}