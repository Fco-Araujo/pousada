const Utils = {

    gerarId() {
        return Date.now() + Math.floor(Math.random() * 1000);
    },

    formatarMoeda(valor) {
        return Number(valor).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });
    },

    formatarData(data) {

        if (!data) return "";

        return new Date(data).toLocaleDateString("pt-BR");

    },

    formatarHora(hora) {

        return hora ?? "";

    },

    dataAtual() {

        return new Date().toISOString().split("T")[0];

    },

    horaAtual() {

        const agora = new Date();

        return agora.toTimeString().slice(0,5);

    },

    calcularTempo(dataEntrada, horaEntrada, dataSaida, horaSaida){

        const entrada = new Date(`${dataEntrada}T${horaEntrada}`);

        const saida = new Date(`${dataSaida}T${horaSaida}`);

        const diferenca = saida - entrada;

        const minutos = Math.floor(diferenca / 60000);

        const horas = Math.floor(minutos / 60);

        const minutosRestantes = minutos % 60;

        return {

            minutos,

            horas,

            texto: `${horas}h ${minutosRestantes}min`

        };

    },

    somarConsumos(consumos){

        return consumos.reduce((total,item)=>{

            return total + (item.valor * item.quantidade);

        },0);

    },

    calcularTotal(valorHospedagem,totalConsumos,desconto=0){

        return Number(valorHospedagem)
            + Number(totalConsumos)
            - Number(desconto);

    },

    mostrarToast(mensagem,tipo="sucesso"){

        const toast = document.createElement("div");

        toast.className = `toast toast-${tipo}`;

        toast.innerHTML = mensagem;

        document.body.appendChild(toast);

        setTimeout(()=>{

            toast.classList.add("show");

        },100);

        setTimeout(()=>{

            toast.classList.remove("show");

            setTimeout(()=>{

                toast.remove();

            },300);

        },3000);

    },

    confirmar(mensagem){

        return confirm(mensagem);

    }

};