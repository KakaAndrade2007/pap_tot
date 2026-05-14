import emailjs from '@emailjs/browser';

export const EmailService = { // O "export" é obrigatório aqui!
  async enviarFatura(nome: string, email: string, dataReserva: string) {
    const templateParams = {
      to_name: nome,         // Vai para {{to_name}}
      to_email: email,       // Vai para {{to_email}}
      reserva_date: dataReserva,    // Vai para {{reserva_date}}
      valor: "2.50€",        // Vai para {{valor}}
      data_emissao: new Date().toLocaleString('pt-PT')
    };

    return emailjs.send(
      import.meta.env.VITE_EMAILJS_SERVICE_ID,
      import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
      templateParams,
      import.meta.env.VITE_EMAILJS_PUBLIC_KEY
    );
  }
};