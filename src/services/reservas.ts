import { supabase } from './supabase'

export const ReservasService = {
  async criarReserva(perfilId: string, data: string, saldoAtual: number, tipoOpcao: string) {
    const custo = 2.50;

    if (saldoAtual < custo) throw new Error("Saldo insuficiente!");

    const { error: resError } = await supabase
      .from('reservas')
      .insert([{
        perfil_id: perfilId,
        data_reserva: data,
        tipo_refeicao: tipoOpcao
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
  },

  async buscarHistoricoAlmocos(identificador: string) {
    const { data, error } = await supabase
      .from('historico_almocos')
      .select('prato, data_refeicao, valor, pin, comprado_em')
      .eq('identificador', identificador)
      .order('comprado_em', { ascending: false });

    if (error) throw error;
    return data ?? [];
  }
}