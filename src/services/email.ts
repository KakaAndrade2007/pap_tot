import emailjs from '@emailjs/browser';

export const EmailService = { 
  async enviarFatura(nome: string, email: string, dataReserva: string) {
    const templateParams = {
      to_name: nome,        
      to_email: email,       
      reserva_date: dataReserva,   
      valor: "2.50€",        
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