// JavaScript para o formulário de inscrição do 1º CONGRESSO DE CIÊNCIAS FARMACÊUTICAS
// Com integração ao Google Sheets e plataformas de pagamento gratuitas
// Inclui verificação de emails para preços diferenciados

document.addEventListener('DOMContentLoaded', function() {
    // Elementos do formulário
    const form = document.getElementById('inscricao-form');
    const confirmation = document.getElementById('confirmation');
    const paymentOptions = document.querySelectorAll('input[name="Pagamento"]');
    const paymentFields = document.querySelectorAll('.payment-fields');
    const pixFields = document.getElementById('pix-fields');
    const cartaoFields = document.getElementById('cartao-fields');
    const boletoFields = document.getElementById('boleto-fields');
    const tipoCartao = document.getElementById('tipo-cartao');
    const parcelasContainer = document.getElementById('parcelas-container');
    const emailInput = document.getElementById('email');
    const valorInscricao = document.getElementById('valor-inscricao');
    
    // Botões de pagamento
    const pixButton = document.getElementById('pix-button');
    const mercadoPagoButton = document.getElementById('mercadopago-button');
    const pagSeguroButton = document.getElementById('pagseguro-button');
    const boletoButton = document.getElementById('boleto-button');
    
    // URL do script do Google Sheets (será substituído pelo URL real)
    const scriptURL = 'GOOGLE_SCRIPT_URL';
    
    // Lista de emails aprovados para desconto
    const emailsAprovados = [
        'ian.oliveira.pf@gmail.com',
        // Adicione mais emails conforme necessário
    ];
    
    // Valores de inscrição
    const valorPadrao = 100;
    const valorDesconto = 80;
    let valorAtual = valorPadrao;
    
    // Mascaras para campos de cartão
    const numeroCartaoInput = document.getElementById('numero-cartao');
    const validadeInput = document.getElementById('validade');
    const cvvInput = document.getElementById('cvv');
    
    // Verificar email para aplicar desconto
    emailInput.addEventListener('blur', function() {
        const email = this.value.trim().toLowerCase();
        
        if (emailsAprovados.includes(email)) {
            valorAtual = valorDesconto;
            valorInscricao.textContent = `R$ ${valorDesconto},00`;
            valorInscricao.classList.add('desconto');
            document.getElementById('info-desconto').style.display = 'block';
        } else {
            valorAtual = valorPadrao;
            valorInscricao.textContent = `R$ ${valorPadrao},00`;
            valorInscricao.classList.remove('desconto');
            document.getElementById('info-desconto').style.display = 'none';
        }
        
        // Atualizar valores nos botões de pagamento
        atualizarBotoesPagamento();
    });
    
    // Função para atualizar textos dos botões de pagamento com o valor atual
    function atualizarBotoesPagamento() {
        pixButton.textContent = `Gerar QR Code PIX (R$ ${valorAtual},00)`;
        mercadoPagoButton.textContent = `Pagar com MercadoPago (R$ ${valorAtual},00)`;
        pagSeguroButton.textContent = `Pagar com PagSeguro (R$ ${valorAtual},00)`;
        boletoButton.textContent = `Gerar Boleto (R$ ${valorAtual},00)`;
    }
    
    // Inicializar valores
    valorInscricao.textContent = `R$ ${valorPadrao},00`;
    atualizarBotoesPagamento();
    
    // Função para mostrar campos de pagamento baseado na seleção
    function showPaymentFields() {
        // Esconde todos os campos de pagamento
        paymentFields.forEach(field => {
            field.style.display = 'none';
        });
        
        // Remove a classe 'selected' de todas as opções
        document.querySelectorAll('.payment-option').forEach(option => {
            option.classList.remove('selected');
        });
        
        // Mostra os campos correspondentes à opção selecionada
        const selectedPayment = document.querySelector('input[name="Pagamento"]:checked');
        
        if (selectedPayment) {
            // Adiciona a classe 'selected' à opção selecionada
            selectedPayment.parentElement.classList.add('selected');
            
            switch(selectedPayment.value) {
                case 'pix':
                    pixFields.style.display = 'block';
                    pixFields.classList.add('fadeIn');
                    break;
                case 'cartao':
                    cartaoFields.style.display = 'block';
                    cartaoFields.classList.add('fadeIn');
                    break;
                case 'boleto':
                    boletoFields.style.display = 'block';
                    boletoFields.classList.add('fadeIn');
                    break;
            }
        }
    }
    
    // Adiciona evento de change para as opções de pagamento
    paymentOptions.forEach(option => {
        option.addEventListener('change', showPaymentFields);
    });
    
    // Evento para mostrar/esconder parcelas baseado no tipo de cartão
    tipoCartao.addEventListener('change', function() {
        if (this.value === 'credito') {
            parcelasContainer.style.display = 'block';
        } else {
            parcelasContainer.style.display = 'none';
        }
    });
    
    // Máscara para número do cartão
    numeroCartaoInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 16) value = value.slice(0, 16);
        
        // Formata com espaços a cada 4 dígitos
        let formattedValue = '';
        for (let i = 0; i < value.length; i++) {
            if (i > 0 && i % 4 === 0) {
                formattedValue += ' ';
            }
            formattedValue += value[i];
        }
        
        e.target.value = formattedValue;
    });
    
    // Máscara para data de validade
    validadeInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 4) value = value.slice(0, 4);
        
        // Formata como MM/AA
        if (value.length > 2) {
            value = value.slice(0, 2) + '/' + value.slice(2);
        }
        
        e.target.value = value;
    });
    
    // Máscara para CVV
    cvvInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 3) value = value.slice(0, 3);
        e.target.value = value;
    });
    
    // Validação do formulário
    function validateForm() {
        let isValid = true;
        const errorMessages = document.querySelectorAll('.error-message');
        
        // Remove mensagens de erro anteriores
        errorMessages.forEach(msg => msg.remove());
        
        // Remove classe de erro de todos os campos
        const allInputs = form.querySelectorAll('input, select');
        allInputs.forEach(input => {
            input.classList.remove('error');
        });
        
        // Valida nome
        const nome = document.getElementById('nome');
        if (nome.value.trim() === '') {
            showError(nome, 'Por favor, informe seu nome completo');
            isValid = false;
        }
        
        // Valida email
        const email = document.getElementById('email');
        if (email.value.trim() === '') {
            showError(email, 'Por favor, informe seu e-mail');
            isValid = false;
        } else if (!isValidEmail(email.value)) {
            showError(email, 'Por favor, informe um e-mail válido');
            isValid = false;
        }
        
        // Valida forma de pagamento
        const selectedPayment = document.querySelector('input[name="Pagamento"]:checked');
        if (!selectedPayment) {
            const paymentSection = document.querySelector('.payment-options');
            showErrorAfter(paymentSection, 'Por favor, selecione uma forma de pagamento');
            isValid = false;
        }
        
        return isValid;
    }
    
    // Função para mostrar erro
    function showError(element, message) {
        element.classList.add('error');
        const errorMessage = document.createElement('div');
        errorMessage.className = 'error-message';
        errorMessage.textContent = message;
        element.parentNode.appendChild(errorMessage);
    }
    
    // Função para mostrar erro após um elemento
    function showErrorAfter(element, message) {
        const errorMessage = document.createElement('div');
        errorMessage.className = 'error-message';
        errorMessage.textContent = message;
        element.parentNode.insertBefore(errorMessage, element.nextSibling);
    }
    
    // Função para validar email
    function isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    // Evento de envio do formulário para o Google Sheets
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (validateForm()) {
            // Preparar dados para envio ao Google Sheets
            const formData = new FormData(form);
            
            // Adicionar a data atual e o valor da inscrição
            formData.append('Data', new Date().toLocaleString('pt-BR'));
            formData.append('Valor', `R$ ${valorAtual},00`);
            
            // Converter FormData para URLSearchParams para envio
            const data = new URLSearchParams(formData);
            
            // Enviar dados para o Google Sheets
            fetch(scriptURL, { method: 'POST', body: data })
                .then(response => {
                    console.log('Success!', response);
                    form.style.display = 'none';
                    confirmation.classList.remove('hidden');
                    confirmation.scrollIntoView({ behavior: 'smooth' });
                })
                .catch(error => {
                    console.error('Error!', error.message);
                    alert('Ocorreu um erro ao enviar o formulário. Por favor, tente novamente.');
                });
        }
    });
    
    // Eventos para os botões de pagamento
    pixButton.addEventListener('click', function() {
        if (validateForm()) {
            // Redirecionar para uma página de QR Code PIX (simulação)
            // Substitua pela URL real do Mercado Pago para pagamento PIX
            window.open(`https://www.mercadopago.com.br/checkout?valor=${valorAtual}`, '_blank');
        }
    });
    
    mercadoPagoButton.addEventListener('click', function() {
        if (validateForm()) {
            // Redirecionar para o MercadoPago
            // Substitua pela URL real do seu link de pagamento do Mercado Pago
            window.open(`https://mpago.la/1NQ4SS4/checkout?valor=${valorAtual}`, '_blank');
        }
    });
    
    pagSeguroButton.addEventListener('click', function() {
        if (validateForm()) {
            // Redirecionar para o PagSeguro
            // Substitua pela URL real do seu link de pagamento do PagSeguro
            window.open(`https://pagseguro.uol.com.br?valor=${valorAtual}`, '_blank');
        }
    });
    
    boletoButton.addEventListener('click', function() {
        if (validateForm()) {
            // Redirecionar para uma página de geração de boleto (simulação)
            // Substitua pela URL real do Mercado Pago para geração de boleto
            window.open(`https://www.mercadopago.com.br/checkout/boleto?valor=${valorAtual}`, '_blank');
        }
    });
    
    // Inicializa o estado do formulário
    parcelasContainer.style.display = 'none';
    document.getElementById('info-desconto').style.display = 'none';
});
