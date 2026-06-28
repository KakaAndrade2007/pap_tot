import { supabase } from './supabase'

function gerarPin() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

export const ReservasService = {
  async criarReserva(perfilId: string, identificador: string, data: string, saldoAtual: number, tipoOpcao: string) {
    const custo = 2.50;

    if (saldoAtual < custo) throw new Error("Saldo insuficiente!");

    const { data: existente, error: checkError } = await supabase
      .from('historico_almocos')
      .select('data_refeicao')
      .eq('identificador', identificador)
      .eq('data_refeicao', data)
      .maybeSingle();

    if (checkError) throw checkError;
    if (existente) throw new Error("Já tens almoço reservado para este dia!");

    // 1. Regista a compra no histórico de almoços
    const { error: historicoError } = await supabase
      .from('historico_almocos')
      .insert([{
        identificador,
        prato: tipoOpcao,
        data_refeicao: data,
        valor: custo,
        pin: gerarPin(),
        comprado_em: new Date().toISOString()
      }]);

    if (historicoError) throw historicoError;

    // 2. Atualiza o saldo
    const novoSaldo = saldoAtual - custo;
    const { error: updateError } = await supabase
      .from('perfis')
      .update({ saldo: novoSaldo })
      .eq('id', perfilId);

    if (updateError) throw updateError;

    return novoSaldo;
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