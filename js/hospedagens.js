document.addEventListener("DOMContentLoaded", () => {
    iniciarHospedagens();
});

let hospedagensFiltradas = [];

function iniciarHospedagens() {
    configurarEventosHospedagens();
    preencherCamposDataHora();
    carregarSelectQuartosLivres();
    carregarSelectProdutos();
    carregarHospedagens();

    setInterval(() => {
        carregarHospedagens();
    }, 60000);
}

function configurarEventosHospedagens() {
    const btnAbrirNovaHospedagem = document.getElementById("btnAbrirNovaHospedagem");
    const btnFecharNovaHospedagem = document.getElementById("btnFecharNovaHospedagem");
    const btnCancelarNovaHospedagem = document.getElementById("btnCancelarNovaHospedagem");
    const formNovaHospedagem = document.getElementById("formNovaHospedagem");

    const quartoHospedagem = document.getElementById("quartoHospedagem");

    const btnFecharConsumoHospedagem = document.getElementById("btnFecharConsumoHospedagem");
    const btnCancelarConsumoHospedagem = document.getElementById("btnCancelarConsumoHospedagem");
    const formConsumoHospedagem = document.getElementById("formConsumoHospedagem");

    const btnFecharFinalizarHospedagem = document.getElementById("btnFecharFinalizarHospedagem");
    const btnCancelarFinalizarHospedagem = document.getElementById("btnCancelarFinalizarHospedagem");
    const formFinalizarHospedagem = document.getElementById("formFinalizarHospedagem");

    const buscarHospedagem = document.getElementById("buscarHospedagem");
    const filtroHospedagem = document.getElementById("filtroHospedagem");

    if (btnAbrirNovaHospedagem) {
        btnAbrirNovaHospedagem.addEventListener("click", abrirModalNovaHospedagem);
    }

    if (btnFecharNovaHospedagem) {
        btnFecharNovaHospedagem.addEventListener("click", () => fecharModal("modalNovaHospedagem"));
    }

    if (btnCancelarNovaHospedagem) {
        btnCancelarNovaHospedagem.addEventListener("click", () => fecharModal("modalNovaHospedagem"));
    }

    if (formNovaHospedagem) {
        formNovaHospedagem.addEventListener("submit", salvarNovaHospedagem);
    }

    if (quartoHospedagem) {
        quartoHospedagem.addEventListener("change", preencherValorDoQuarto);
    }

    if (btnFecharConsumoHospedagem) {
        btnFecharConsumoHospedagem.addEventListener("click", () => fecharModal("modalConsumoHospedagem"));
    }

    if (btnCancelarConsumoHospedagem) {
        btnCancelarConsumoHospedagem.addEventListener("click", () => fecharModal("modalConsumoHospedagem"));
    }

    if (formConsumoHospedagem) {
        formConsumoHospedagem.addEventListener("submit", salvarConsumoNaHospedagem);
    }

    if (btnFecharFinalizarHospedagem) {
        btnFecharFinalizarHospedagem.addEventListener("click", () => fecharModal("modalFinalizarHospedagem"));
    }

    if (btnCancelarFinalizarHospedagem) {
        btnCancelarFinalizarHospedagem.addEventListener("click", () => fecharModal("modalFinalizarHospedagem"));
    }

    if (formFinalizarHospedagem) {
        formFinalizarHospedagem.addEventListener("submit", finalizarHospedagem);
    }

    if (buscarHospedagem) {
        buscarHospedagem.addEventListener("input", carregarHospedagens);
    }

    if (filtroHospedagem) {
        filtroHospedagem.addEventListener("change", carregarHospedagens);
    }
}

function preencherCamposDataHora() {
    const dataEntrada = document.getElementById("dataEntrada");
    const horaEntrada = document.getElementById("horaEntrada");
    const dataSaida = document.getElementById("dataSaida");
    const horaSaida = document.getElementById("horaSaida");

    if (dataEntrada) dataEntrada.value = Utils.dataAtual();
    if (horaEntrada) horaEntrada.value = Utils.horaAtual();

    if (dataSaida) dataSaida.value = Utils.dataAtual();
    if (horaSaida) horaSaida.value = Utils.horaAtual();
}

function abrirModalNovaHospedagem() {
    limparFormularioNovaHospedagem();
    preencherCamposDataHora();
    carregarSelectQuartosLivres();
    abrirModal("modalNovaHospedagem");
}

function limparFormularioNovaHospedagem() {
    document.getElementById("quartoHospedagem").value = "";
    document.getElementById("valorHospedagem").value = "";
    document.getElementById("dataEntrada").value = "";
    document.getElementById("horaEntrada").value = "";
    document.getElementById("observacoesHospedagem").value = "";
}

function carregarSelectQuartosLivres() {
    const select = document.getElementById("quartoHospedagem");

    if (!select) return;

    const quartos = Storage.getQuartos()
        .filter(quarto => quarto.status === "livre")
        .sort((a, b) => Number(a.numero) - Number(b.numero));

    select.innerHTML = `<option value="">Selecione um quarto livre</option>`;

    quartos.forEach(quarto => {
        select.innerHTML += `
            <option value="${quarto.id}">
                ${quarto.nome} - ${Utils.formatarMoeda(quarto.valorHora)}
            </option>
        `;
    });
}

function preencherValorDoQuarto() {
    const idQuarto = document.getElementById("quartoHospedagem").value;
    const campoValor = document.getElementById("valorHospedagem");

    if (!idQuarto || !campoValor) {
        return;
    }

    const quarto = Storage.getQuarto(idQuarto);

    if (!quarto) {
        campoValor.value = "";
        return;
    }

    campoValor.value = quarto.valorHora;
}

function salvarNovaHospedagem(event) {
    event.preventDefault();

    const quartoId = document.getElementById("quartoHospedagem").value;
    const quarto = Storage.getQuarto(quartoId);

    if (!quarto) {
        Utils.mostrarToast("Selecione um quarto válido.", "erro");
        return;
    }

    if (quarto.status !== "livre") {
        Utils.mostrarToast("Este quarto não está livre.", "erro");
        return;
    }

    const hospedagem = {
        id: Utils.gerarId(),
        quartoId: quarto.id,
        quartoNome: quarto.nome,
        quartoNumero: quarto.numero,
        valorHospedagem: Number(document.getElementById("valorHospedagem").value),
        valorPadraoQuarto: Number(quarto.valorHora),
        dataEntrada: document.getElementById("dataEntrada").value,
        horaEntrada: document.getElementById("horaEntrada").value,
        dataSaida: "",
        horaSaida: "",
        observacoes: document.getElementById("observacoesHospedagem").value.trim(),
        consumos: [],
        desconto: 0,
        formaPagamento: "",
        totalConsumos: 0,
        totalFinal: 0,
        status: "aberta",
        criadoEm: new Date().toISOString()
    };

    const validacao = validarHospedagem(hospedagem);

    if (!validacao.valido) {
        Utils.mostrarToast(validacao.mensagem, "erro");
        return;
    }

    Storage.adicionarHospedagem(hospedagem);
    Storage.atualizarStatusQuarto(quarto.id, "ocupado");

    registrarMovimentacao(
    "hospedagem",
    `Hospedagem iniciada - ${quarto.nome}`,
    `Entrada às ${hospedagem.horaEntrada} | Valor: ${Utils.formatarMoeda(hospedagem.valorHospedagem)}`
);

    fecharModal("modalNovaHospedagem");

    Utils.mostrarToast("Hospedagem iniciada com sucesso!");

    carregarSelectQuartosLivres();
    carregarHospedagens();
}

function validarHospedagem(hospedagem) {
    if (!hospedagem.quartoId) {
        return {
            valido: false,
            mensagem: "Selecione o quarto."
        };
    }

    if (!hospedagem.valorHospedagem || hospedagem.valorHospedagem <= 0) {
        return {
            valido: false,
            mensagem: "Informe um valor de hospedagem válido."
        };
    }

    if (!hospedagem.dataEntrada) {
        return {
            valido: false,
            mensagem: "Informe a data de entrada."
        };
    }

    if (!hospedagem.horaEntrada) {
        return {
            valido: false,
            mensagem: "Informe a hora de entrada."
        };
    }

    return {
        valido: true,
        mensagem: "OK"
    };
}
function carregarSelectProdutos() {
    const select = document.getElementById("produtoConsumo");

    if (!select) return;

    const produtos = Storage.getConsumosAtivos()
        .sort((a, b) => a.nome.localeCompare(b.nome));

    select.innerHTML = `<option value="">Selecione o produto</option>`;

    produtos.forEach(produto => {
        select.innerHTML += `
            <option value="${produto.id}">
                ${produto.nome} - ${Utils.formatarMoeda(produto.valor)}
            </option>
        `;
    });
}

function carregarHospedagens() {
    const lista = document.getElementById("listaHospedagens");

    if (!lista) return;

    let hospedagens = Storage.getHospedagens();

    const pesquisa = document.getElementById("buscarHospedagem")?.value.trim().toLowerCase() || "";
    const filtro = document.getElementById("filtroHospedagem")?.value || "";

    if (pesquisa) {
        hospedagens = hospedagens.filter(hospedagem => {
            return hospedagem.quartoNome.toLowerCase().includes(pesquisa)
                || String(hospedagem.quartoNumero).toLowerCase().includes(pesquisa)
                || hospedagem.status.toLowerCase().includes(pesquisa);
        });
    }

    if (filtro) {
        hospedagens = hospedagens.filter(hospedagem => hospedagem.status === filtro);
    }

    hospedagensFiltradas = hospedagens;

    atualizarCardsHospedagens();

    if (hospedagens.length === 0) {
        lista.innerHTML = `
            <div class="hospedagem-card">
                <h3>Nenhuma hospedagem encontrada</h3>
                <p>Inicie uma nova hospedagem para acompanhar entradas e saídas.</p>
            </div>
        `;
        return;
    }

    lista.innerHTML = hospedagens
        .sort((a, b) => {
            if (a.status === "aberta" && b.status !== "aberta") return -1;
            if (a.status !== "aberta" && b.status === "aberta") return 1;
            return new Date(b.criadoEm) - new Date(a.criadoEm);
        })
        .map(criarCardHospedagem)
        .join("");
}

function criarCardHospedagem(hospedagem) {
    const totalConsumos = Utils.somarConsumos(hospedagem.consumos || []);
    const totalParcial = Number(hospedagem.valorHospedagem) + totalConsumos;

    const agora = new Date();
    const dataSaidaReferencia = hospedagem.dataSaida || agora.toISOString().split("T")[0];
    const horaSaidaReferencia = hospedagem.horaSaida || agora.toTimeString().slice(0, 5);

    const tempo = Utils.calcularTempo(
        hospedagem.dataEntrada,
        hospedagem.horaEntrada,
        dataSaidaReferencia,
        horaSaidaReferencia
    );

    const statusClasse = hospedagem.status === "aberta" ? "status-ocupado" : "status-livre";
    const statusTexto = hospedagem.status === "aberta" ? "Em aberto" : "Finalizada";

    return `
        <div class="hospedagem-card">
            <div class="hospedagem-header">
                <div>
                    <h3>${hospedagem.quartoNome}</h3>
                    <p>Quarto ${hospedagem.quartoNumero}</p>
                </div>

                <span class="status ${statusClasse}">
                    ${statusTexto}
                </span>
            </div>

            <div class="hospedagem-info">
                <p>
                    <span>Entrada</span>
                    <strong>${Utils.formatarData(hospedagem.dataEntrada)} às ${hospedagem.horaEntrada}</strong>
                </p>

                <p>
                    <span>Tempo</span>
                    <strong>${tempo.texto}</strong>
                </p>

                <p>
                    <span>Hospedagem</span>
                    <strong>${Utils.formatarMoeda(hospedagem.valorHospedagem)}</strong>
                </p>

                <p>
                    <span>Consumo</span>
                    <strong>${Utils.formatarMoeda(totalConsumos)}</strong>
                </p>

                ${hospedagem.status === "finalizada" ? `
                    <p>
                        <span>Pagamento</span>
                        <strong>${textoPagamento(hospedagem.formaPagamento)}</strong>
                    </p>
                ` : ""}
            </div>

            <div class="total-hospedagem">
                <span>${hospedagem.status === "aberta" ? "Total parcial" : "Total pago"}</span>
                <h2>${Utils.formatarMoeda(hospedagem.status === "aberta" ? totalParcial : hospedagem.totalFinal)}</h2>
            </div>

            ${criarListaConsumosHospedagem(hospedagem)}

            ${hospedagem.status === "aberta" ? `
                <div class="hospedagem-actions">
                    <button class="btn-secondary" onclick="abrirModalConsumo('${hospedagem.id}')">
                        <i class="fa-solid fa-cart-plus"></i>
                        Consumo
                    </button>

                    <button class="btn-primary" onclick="abrirModalFinalizar('${hospedagem.id}')">
                        <i class="fa-solid fa-check"></i>
                        Finalizar
                    </button>

                    <button class="btn-danger" onclick="cancelarHospedagem('${hospedagem.id}')">
                        <i class="fa-solid fa-ban"></i>
                        Cancelar
                    </button>
                </div>
            ` : `
                <div class="hospedagem-actions">
                    <button class="btn-secondary" onclick="visualizarResumoFinalizado('${hospedagem.id}')">
                        <i class="fa-solid fa-eye"></i>
                        Detalhes
                    </button>
                </div>
            `}
        </div>
    `;
}

function criarListaConsumosHospedagem(hospedagem) {
    const consumos = hospedagem.consumos || [];

    if (consumos.length === 0) {
        return `
            <div class="resumo-finalizacao" style="margin-top:18px;">
                <p>Nenhum consumo adicionado.</p>
            </div>
        `;
    }

    const itens = consumos.map(item => {
        const totalItem = Number(item.valor) * Number(item.quantidade);

        return `
            <div class="resumo-item">
                <span>${item.quantidade}x ${item.nome}</span>
                <strong>${Utils.formatarMoeda(totalItem)}</strong>
            </div>
        `;
    }).join("");

    return `
        <div class="resumo-finalizacao" style="margin-top:18px;">
            <h3>Consumos</h3>
            ${itens}
        </div>
    `;
}

function abrirModalConsumo(idHospedagem) {
    const hospedagem = Storage.getHospedagem(idHospedagem);

    if (!hospedagem) {
        Utils.mostrarToast("Hospedagem não encontrada.", "erro");
        return;
    }

    if (hospedagem.status !== "aberta") {
        Utils.mostrarToast("Só é possível adicionar consumo em hospedagens abertas.", "erro");
        return;
    }

    document.getElementById("hospedagemConsumoId").value = hospedagem.id;
    document.getElementById("produtoConsumo").value = "";
    document.getElementById("quantidadeConsumo").value = 1;

    carregarSelectProdutos();

    abrirModal("modalConsumoHospedagem");
}

function salvarConsumoNaHospedagem(event) {
    event.preventDefault();

    const hospedagemId = document.getElementById("hospedagemConsumoId").value;
    const produtoId = document.getElementById("produtoConsumo").value;
    const quantidade = Number(document.getElementById("quantidadeConsumo").value);

    const hospedagem = Storage.getHospedagem(hospedagemId);
    const produto = Storage.getConsumo(produtoId);

    if (!hospedagem) {
        Utils.mostrarToast("Hospedagem não encontrada.", "erro");
        return;
    }

    if (!produto) {
        Utils.mostrarToast("Selecione um produto válido.", "erro");
        return;
    }

    if (!quantidade || quantidade <= 0) {
        Utils.mostrarToast("Informe uma quantidade válida.", "erro");
        return;
    }

    const consumo = {
        id: Utils.gerarId(),
        produtoId: produto.id,
        nome: produto.nome,
        categoria: produto.categoria,
        valor: Number(produto.valor),
        quantidade,
        total: Number(produto.valor) * quantidade,
        criadoEm: new Date().toISOString()
    };

    Storage.adicionarConsumoNaHospedagem(hospedagemId, consumo);

    registrarMovimentacao(
    "consumo",
    `Consumo adicionado - ${produto.nome}`,
    `${quantidade} unidade(s) no ${hospedagem.quartoNome}`
);

    fecharModal("modalConsumoHospedagem");

    Utils.mostrarToast("Consumo adicionado com sucesso!");

    carregarHospedagens();
}

function atualizarCardsHospedagens() {
    const abertas = Storage.getHospedagensAbertas();

    const totalAbertas = document.getElementById("totalAbertas");
    const maiorPermanencia = document.getElementById("maiorPermanencia");
    const totalParcial = document.getElementById("totalParcial");

    if (totalAbertas) {
        totalAbertas.textContent = abertas.length;
    }

    let maiorMinutos = 0;
    let somaParcial = 0;

    abertas.forEach(hospedagem => {
        const agora = new Date();

        const tempo = Utils.calcularTempo(
            hospedagem.dataEntrada,
            hospedagem.horaEntrada,
            agora.toISOString().split("T")[0],
            agora.toTimeString().slice(0, 5)
        );

        if (tempo.minutos > maiorMinutos) {
            maiorMinutos = tempo.minutos;
        }

        const totalConsumos = Utils.somarConsumos(hospedagem.consumos || []);
        somaParcial += Number(hospedagem.valorHospedagem) + totalConsumos;
    });

    if (maiorPermanencia) {
        const horas = Math.floor(maiorMinutos / 60);
        const minutos = maiorMinutos % 60;
        maiorPermanencia.textContent = `${horas}h ${minutos}min`;
    }

    if (totalParcial) {
        totalParcial.textContent = Utils.formatarMoeda(somaParcial);
    }
}
function abrirModalFinalizar(idHospedagem) {
    const hospedagem = Storage.getHospedagem(idHospedagem);

    if (!hospedagem) {
        Utils.mostrarToast("Hospedagem não encontrada.", "erro");
        return;
    }

    if (hospedagem.status !== "aberta") {
        Utils.mostrarToast("Esta hospedagem já foi finalizada.", "erro");
        return;
    }

    document.getElementById("hospedagemFinalizarId").value = hospedagem.id;
    document.getElementById("dataSaida").value = Utils.dataAtual();
    document.getElementById("horaSaida").value = Utils.horaAtual();
    document.getElementById("formaPagamento").value = "";
    document.getElementById("descontoHospedagem").value = 0;

    montarResumoFinalizacao(hospedagem);

    abrirModal("modalFinalizarHospedagem");
}

function montarResumoFinalizacao(hospedagem) {
    const resumo = document.getElementById("resumoFinalizacao");

    if (!resumo) return;

    const dataSaida = document.getElementById("dataSaida")?.value || Utils.dataAtual();
    const horaSaida = document.getElementById("horaSaida")?.value || Utils.horaAtual();
    const desconto = Number(document.getElementById("descontoHospedagem")?.value || 0);

    const totalConsumos = Utils.somarConsumos(hospedagem.consumos || []);

    const tempo = Utils.calcularTempo(
        hospedagem.dataEntrada,
        hospedagem.horaEntrada,
        dataSaida,
        horaSaida
    );

    const total = Utils.calcularTotal(
        hospedagem.valorHospedagem,
        totalConsumos,
        desconto
    );

    const listaConsumos = (hospedagem.consumos || []).length > 0
        ? hospedagem.consumos.map(item => {
            const totalItem = Number(item.valor) * Number(item.quantidade);

            return `
                <div class="resumo-item">
                    <span>${item.quantidade}x ${item.nome}</span>
                    <strong>${Utils.formatarMoeda(totalItem)}</strong>
                </div>
            `;
        }).join("")
        : `
            <div class="resumo-item">
                <span>Consumo</span>
                <strong>Nenhum consumo</strong>
            </div>
        `;

    resumo.innerHTML = `
        <h3>${hospedagem.quartoNome}</h3>

        <div class="resumo-item">
            <span>Entrada</span>
            <strong>${Utils.formatarData(hospedagem.dataEntrada)} às ${hospedagem.horaEntrada}</strong>
        </div>

        <div class="resumo-item">
            <span>Saída</span>
            <strong>${Utils.formatarData(dataSaida)} às ${horaSaida}</strong>
        </div>

        <div class="resumo-item">
            <span>Tempo de permanência</span>
            <strong>${tempo.texto}</strong>
        </div>

        <div class="resumo-item">
            <span>Valor da hospedagem</span>
            <strong>${Utils.formatarMoeda(hospedagem.valorHospedagem)}</strong>
        </div>

        <h3 style="margin-top:20px;">Consumos</h3>

        ${listaConsumos}

        <div class="resumo-item">
            <span>Total de consumos</span>
            <strong>${Utils.formatarMoeda(totalConsumos)}</strong>
        </div>

        <div class="resumo-item">
            <span>Desconto</span>
            <strong>${Utils.formatarMoeda(desconto)}</strong>
        </div>

        <div class="resumo-total">
            <span>Total a pagar</span>
            <h2>${Utils.formatarMoeda(total)}</h2>
        </div>
    `;
}

document.addEventListener("input", event => {
    if (
        event.target.id === "dataSaida" ||
        event.target.id === "horaSaida" ||
        event.target.id === "descontoHospedagem"
    ) {
        const idHospedagem = document.getElementById("hospedagemFinalizarId")?.value;

        if (!idHospedagem) return;

        const hospedagem = Storage.getHospedagem(idHospedagem);

        if (!hospedagem) return;

        montarResumoFinalizacao(hospedagem);
    }
});

document.addEventListener("change", event => {
    if (
        event.target.id === "dataSaida" ||
        event.target.id === "horaSaida" ||
        event.target.id === "descontoHospedagem"
    ) {
        const idHospedagem = document.getElementById("hospedagemFinalizarId")?.value;

        if (!idHospedagem) return;

        const hospedagem = Storage.getHospedagem(idHospedagem);

        if (!hospedagem) return;

        montarResumoFinalizacao(hospedagem);
    }
});

function finalizarHospedagem(event) {
    event.preventDefault();

    const idHospedagem = document.getElementById("hospedagemFinalizarId").value;
    const hospedagem = Storage.getHospedagem(idHospedagem);

    if (!hospedagem) {
        Utils.mostrarToast("Hospedagem não encontrada.", "erro");
        return;
    }

    const dataSaida = document.getElementById("dataSaida").value;
    const horaSaida = document.getElementById("horaSaida").value;
    const formaPagamento = document.getElementById("formaPagamento").value;
    const desconto = Number(document.getElementById("descontoHospedagem").value || 0);

    if (!dataSaida) {
        Utils.mostrarToast("Informe a data de saída.", "erro");
        return;
    }

    if (!horaSaida) {
        Utils.mostrarToast("Informe a hora de saída.", "erro");
        return;
    }

    if (!formaPagamento) {
        Utils.mostrarToast("Selecione a forma de pagamento.", "erro");
        return;
    }

    const tempo = Utils.calcularTempo(
        hospedagem.dataEntrada,
        hospedagem.horaEntrada,
        dataSaida,
        horaSaida
    );

    if (tempo.minutos < 0) {
        Utils.mostrarToast("A saída não pode ser anterior à entrada.", "erro");
        return;
    }

    const totalConsumos = Utils.somarConsumos(hospedagem.consumos || []);

    const totalFinal = Utils.calcularTotal(
        hospedagem.valorHospedagem,
        totalConsumos,
        desconto
    );

    if (totalFinal < 0) {
        Utils.mostrarToast("O desconto não pode ser maior que o total.", "erro");
        return;
    }

    const hospedagemAtualizada = {
        ...hospedagem,
        dataSaida,
        horaSaida,
        formaPagamento,
        desconto,
        totalConsumos,
        totalFinal,
        tempoMinutos: tempo.minutos,
        tempoTexto: tempo.texto,
        status: "finalizada",
        finalizadoEm: new Date().toISOString()
    };

    Storage.atualizarHospedagem(idHospedagem, hospedagemAtualizada);

    Storage.atualizarStatusQuarto(hospedagem.quartoId, "limpeza");

    registrarMovimentacao(
    "hospedagem",
    `Hospedagem finalizada - ${hospedagem.quartoNome}`,
    `Total pago: ${Utils.formatarMoeda(totalFinal)} | Pagamento: ${textoPagamento(formaPagamento)}`
);

    fecharModal("modalFinalizarHospedagem");

    Utils.mostrarToast("Hospedagem finalizada com sucesso!");

    carregarSelectQuartosLivres();
    carregarHospedagens();

    abrirReciboHospedagem(hospedagemAtualizada);
}

function cancelarHospedagem(idHospedagem) {
    const hospedagem = Storage.getHospedagem(idHospedagem);

    if (!hospedagem) {
        Utils.mostrarToast("Hospedagem não encontrada.", "erro");
        return;
    }

    if (hospedagem.status !== "aberta") {
        Utils.mostrarToast("Apenas hospedagens abertas podem ser canceladas.", "erro");
        return;
    }

    const confirmar = Utils.confirmar(
        `Deseja realmente cancelar a hospedagem do ${hospedagem.quartoNome}?`
    );

    if (!confirmar) return;

    Storage.excluirHospedagem(idHospedagem);
    Storage.atualizarStatusQuarto(hospedagem.quartoId, "livre");

    Utils.mostrarToast("Hospedagem cancelada com sucesso!");

    carregarSelectQuartosLivres();
    carregarHospedagens();
}

function visualizarResumoFinalizado(idHospedagem) {
    const hospedagem = Storage.getHospedagem(idHospedagem);

    if (!hospedagem) {
        Utils.mostrarToast("Hospedagem não encontrada.", "erro");
        return;
    }

    abrirReciboHospedagem(hospedagem);
}

function textoPagamento(forma) {
    const formas = {
        pix: "Pix",
        dinheiro: "Dinheiro",
        cartao_credito: "Cartão de crédito",
        cartao_debito: "Cartão de débito"
    };

    return formas[forma] || forma || "Não informado";
}
function abrirReciboHospedagem(hospedagem) {
    const janela = window.open("", "_blank", "width=900,height=700");

    if (!janela) {
        Utils.mostrarToast(
            "Não foi possível abrir o recibo. Verifique se o navegador bloqueou pop-ups.",
            "erro"
        );
        return;
    }

    const configuracoes = Storage.getConfiguracoes();

    const totalConsumos = Utils.somarConsumos(hospedagem.consumos || []);

    const totalFinal = hospedagem.totalFinal || Utils.calcularTotal(
        hospedagem.valorHospedagem,
        totalConsumos,
        hospedagem.desconto || 0
    );

    const tempo = hospedagem.tempoTexto || Utils.calcularTempo(
        hospedagem.dataEntrada,
        hospedagem.horaEntrada,
        hospedagem.dataSaida || Utils.dataAtual(),
        hospedagem.horaSaida || Utils.horaAtual()
    ).texto;

    const consumosHtml = criarConsumosRecibo(hospedagem.consumos || []);

    janela.document.write(`
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <title>Recibo de Hospedagem</title>

            <style>
                *{
                    margin:0;
                    padding:0;
                    box-sizing:border-box;
                }

                body{
                    font-family:Arial, sans-serif;
                    background:#f4f6fb;
                    color:#1f2937;
                    padding:30px;
                }

                .recibo{
                    max-width:720px;
                    margin:0 auto;
                    background:#fff;
                    border-radius:18px;
                    padding:35px;
                    box-shadow:0 10px 35px rgba(15,23,42,.12);
                }

                .recibo-header{
                    text-align:center;
                    border-bottom:1px solid #e5e7eb;
                    padding-bottom:22px;
                    margin-bottom:25px;
                }

                .recibo-header h1{
                    font-size:28px;
                    margin-bottom:8px;
                }

                .recibo-header p{
                    color:#6b7280;
                    font-size:14px;
                    line-height:1.6;
                }

                .recibo-title{
                    background:#eef4ff;
                    color:#2563eb;
                    padding:16px;
                    border-radius:14px;
                    text-align:center;
                    margin-bottom:25px;
                    font-weight:700;
                    font-size:18px;
                }

                .section{
                    margin-bottom:25px;
                }

                .section h2{
                    font-size:18px;
                    margin-bottom:14px;
                    color:#111827;
                }

                .line{
                    display:flex;
                    justify-content:space-between;
                    padding:10px 0;
                    border-bottom:1px dashed #e5e7eb;
                    gap:20px;
                }

                .line span{
                    color:#6b7280;
                }

                .line strong{
                    text-align:right;
                }

                .total{
                    margin-top:26px;
                    background:#2563eb;
                    color:#fff;
                    padding:22px;
                    border-radius:16px;
                    display:flex;
                    justify-content:space-between;
                    align-items:center;
                }

                .total span{
                    font-size:16px;
                    opacity:.9;
                }

                .total strong{
                    font-size:30px;
                }

                .footer{
                    margin-top:30px;
                    text-align:center;
                    color:#6b7280;
                    font-size:13px;
                }

                .actions{
                    max-width:720px;
                    margin:20px auto 0;
                    display:flex;
                    justify-content:flex-end;
                    gap:12px;
                }

                .btn{
                    border:none;
                    border-radius:10px;
                    padding:12px 18px;
                    cursor:pointer;
                    font-weight:700;
                }

                .btn-primary{
                    background:#2563eb;
                    color:#fff;
                }

                .btn-secondary{
                    background:#fff;
                    color:#1f2937;
                    border:1px solid #e5e7eb;
                }

                @media print{
                    body{
                        background:#fff;
                        padding:0;
                    }

                    .actions{
                        display:none;
                    }

                    .recibo{
                        box-shadow:none;
                        border-radius:0;
                        max-width:100%;
                    }
                }
            </style>
        </head>

        <body>

            <div class="recibo">

                <div class="recibo-header">
                    <h1>${configuracoes.nomePousada || "Pousada Control"}</h1>

                    <p>
                        ${configuracoes.cnpj ? `CNPJ: ${configuracoes.cnpj}<br>` : ""}
                        ${configuracoes.telefone ? `Telefone: ${configuracoes.telefone}<br>` : ""}
                        ${configuracoes.endereco ? `${configuracoes.endereco}` : ""}
                    </p>
                </div>

                <div class="recibo-title">
                    RECIBO DE HOSPEDAGEM
                </div>

                <div class="section">
                    <h2>Dados da Hospedagem</h2>

                    <div class="line">
                        <span>Quarto</span>
                        <strong>${hospedagem.quartoNome}</strong>
                    </div>

                    <div class="line">
                        <span>Entrada</span>
                        <strong>${Utils.formatarData(hospedagem.dataEntrada)} às ${hospedagem.horaEntrada}</strong>
                    </div>

                    <div class="line">
                        <span>Saída</span>
                        <strong>${Utils.formatarData(hospedagem.dataSaida)} às ${hospedagem.horaSaida}</strong>
                    </div>

                    <div class="line">
                        <span>Tempo de permanência</span>
                        <strong>${tempo}</strong>
                    </div>
                </div>

                <div class="section">
                    <h2>Valores</h2>

                    <div class="line">
                        <span>Valor da hospedagem</span>
                        <strong>${Utils.formatarMoeda(hospedagem.valorHospedagem)}</strong>
                    </div>

                    <div class="line">
                        <span>Total de consumos</span>
                        <strong>${Utils.formatarMoeda(totalConsumos)}</strong>
                    </div>

                    <div class="line">
                        <span>Desconto</span>
                        <strong>${Utils.formatarMoeda(hospedagem.desconto || 0)}</strong>
                    </div>

                    <div class="line">
                        <span>Forma de pagamento</span>
                        <strong>${textoPagamento(hospedagem.formaPagamento)}</strong>
                    </div>
                </div>

                <div class="section">
                    <h2>Consumos</h2>

                    ${consumosHtml}
                </div>

                <div class="total">
                    <span>Total a pagar</span>
                    <strong>${Utils.formatarMoeda(totalFinal)}</strong>
                </div>

                <div class="footer">
                    Recibo gerado em ${Utils.formatarData(Utils.dataAtual())} às ${Utils.horaAtual()}
                </div>

            </div>

            <div class="actions">
                <button class="btn btn-secondary" onclick="window.close()">
                    Fechar
                </button>

                <button class="btn btn-primary" onclick="window.print()">
                    Imprimir / Salvar PDF
                </button>
            </div>

        </body>
        </html>
    `);

    janela.document.close();
}

function criarConsumosRecibo(consumos) {
    if (!consumos || consumos.length === 0) {
        return `
            <div class="line">
                <span>Consumo</span>
                <strong>Nenhum consumo registrado</strong>
            </div>
        `;
    }

    return consumos.map(item => {
        const total = Number(item.valor) * Number(item.quantidade);

        return `
            <div class="line">
                <span>${item.quantidade}x ${item.nome}</span>
                <strong>${Utils.formatarMoeda(total)}</strong>
            </div>
        `;
    }).join("");
}

function recalcularTodasHospedagens() {
    const hospedagens = Storage.getHospedagens();

    const hospedagensAtualizadas = hospedagens.map(hospedagem => {
        const totalConsumos = Utils.somarConsumos(hospedagem.consumos || []);

        const totalFinal = Utils.calcularTotal(
            hospedagem.valorHospedagem,
            totalConsumos,
            hospedagem.desconto || 0
        );

        return {
            ...hospedagem,
            totalConsumos,
            totalFinal
        };
    });

    Storage.salvarHospedagens(hospedagensAtualizadas);

    carregarHospedagens();
}

function obterResumoHospedagens() {
    const hospedagens = Storage.getHospedagens();

    const abertas = hospedagens.filter(h => h.status === "aberta");
    const finalizadas = hospedagens.filter(h => h.status === "finalizada");

    const receitaFinalizada = finalizadas.reduce((total, hospedagem) => {
        return total + Number(hospedagem.totalFinal || 0);
    }, 0);

    const receitaAberta = abertas.reduce((total, hospedagem) => {
        const totalConsumos = Utils.somarConsumos(hospedagem.consumos || []);

        return total + Number(hospedagem.valorHospedagem) + totalConsumos;
    }, 0);

    return {
        total: hospedagens.length,
        abertas: abertas.length,
        finalizadas: finalizadas.length,
        receitaFinalizada,
        receitaAberta
    };
}

function limparFiltrosHospedagens() {
    const buscarHospedagem = document.getElementById("buscarHospedagem");
    const filtroHospedagem = document.getElementById("filtroHospedagem");

    if (buscarHospedagem) buscarHospedagem.value = "";
    if (filtroHospedagem) filtroHospedagem.value = "";

    carregarHospedagens();
}

function restaurarQuartoDaHospedagem(idHospedagem) {
    const hospedagem = Storage.getHospedagem(idHospedagem);

    if (!hospedagem) return;

    if (hospedagem.status === "aberta") {
        Storage.atualizarStatusQuarto(hospedagem.quartoId, "ocupado");
        return;
    }

    if (hospedagem.status === "finalizada") {
        Storage.atualizarStatusQuarto(hospedagem.quartoId, "limpeza");
    }
}

function liberarQuarto(idQuarto) {
    const quarto = Storage.getQuarto(idQuarto);

    if (!quarto) {
        Utils.mostrarToast("Quarto não encontrado.", "erro");
        return;
    }

    if (quarto.status === "ocupado") {
        Utils.mostrarToast(
            "Este quarto está ocupado. Finalize a hospedagem antes de liberar.",
            "erro"
        );
        return;
    }

    Storage.atualizarStatusQuarto(idQuarto, "livre");

    Utils.mostrarToast("Quarto liberado com sucesso!");

    carregarSelectQuartosLivres();
    carregarHospedagens();
}

function colocarQuartoEmLimpeza(idQuarto) {
    const quarto = Storage.getQuarto(idQuarto);

    if (!quarto) {
        Utils.mostrarToast("Quarto não encontrado.", "erro");
        return;
    }

    if (quarto.status === "ocupado") {
        Utils.mostrarToast(
            "Não é possível colocar em limpeza enquanto estiver ocupado.",
            "erro"
        );
        return;
    }

    Storage.atualizarStatusQuarto(idQuarto, "limpeza");

    Utils.mostrarToast("Quarto marcado como em limpeza.");

    carregarSelectQuartosLivres();
    carregarHospedagens();
}

function formatarStatusHospedagem(status) {
    const statusMap = {
        aberta: "Em aberto",
        finalizada: "Finalizada",
        cancelada: "Cancelada"
    };

    return statusMap[status] || status;
}

function obterTotalParcialHospedagem(hospedagem) {
    const totalConsumos = Utils.somarConsumos(hospedagem.consumos || []);

    return Number(hospedagem.valorHospedagem) + totalConsumos;
}

function obterTotalFinalHospedagem(hospedagem) {
    const totalConsumos = Utils.somarConsumos(hospedagem.consumos || []);

    return Utils.calcularTotal(
        hospedagem.valorHospedagem,
        totalConsumos,
        hospedagem.desconto || 0
    );
}