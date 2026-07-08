document.addEventListener("DOMContentLoaded", () => {
    iniciarHistorico();
});

let historicoFiltrado = [];

function iniciarHistorico() {
    configurarEventosHistorico();
    carregarHistorico();
}

function configurarEventosHistorico() {
    const buscarHistorico = document.getElementById("buscarHistorico");
    const filtroDataInicio = document.getElementById("filtroDataInicio");
    const filtroDataFim = document.getElementById("filtroDataFim");
    const filtroPagamento = document.getElementById("filtroPagamento");
    const btnLimparFiltros = document.getElementById("btnLimparFiltros");

    const btnFecharModalRecibo = document.getElementById("btnFecharModalRecibo");
    const btnImprimirRecibo = document.getElementById("btnImprimirRecibo");

    if (buscarHistorico) {
        buscarHistorico.addEventListener("input", carregarHistorico);
    }

    if (filtroDataInicio) {
        filtroDataInicio.addEventListener("change", carregarHistorico);
    }

    if (filtroDataFim) {
        filtroDataFim.addEventListener("change", carregarHistorico);
    }

    if (filtroPagamento) {
        filtroPagamento.addEventListener("change", carregarHistorico);
    }

    if (btnLimparFiltros) {
        btnLimparFiltros.addEventListener("click", limparFiltrosHistorico);
    }

    if (btnFecharModalRecibo) {
        btnFecharModalRecibo.addEventListener("click", () => fecharModal("modalRecibo"));
    }

    if (btnImprimirRecibo) {
        btnImprimirRecibo.addEventListener("click", imprimirReciboHistorico);
    }
}

function carregarHistorico() {
    const tbody = document.getElementById("tbodyHistorico");

    if (!tbody) return;

    let hospedagens = Storage.getHospedagensFinalizadas();

    const pesquisa = document.getElementById("buscarHistorico")?.value.trim().toLowerCase() || "";
    const dataInicio = document.getElementById("filtroDataInicio")?.value || "";
    const dataFim = document.getElementById("filtroDataFim")?.value || "";
    const pagamento = document.getElementById("filtroPagamento")?.value || "";

    if (pesquisa) {
        hospedagens = hospedagens.filter(hospedagem => {
            return hospedagem.quartoNome.toLowerCase().includes(pesquisa)
                || String(hospedagem.quartoNumero).toLowerCase().includes(pesquisa)
                || textoPagamentoHistorico(hospedagem.formaPagamento).toLowerCase().includes(pesquisa);
        });
    }

    if (dataInicio) {
        hospedagens = hospedagens.filter(hospedagem => hospedagem.dataSaida >= dataInicio);
    }

    if (dataFim) {
        hospedagens = hospedagens.filter(hospedagem => hospedagem.dataSaida <= dataFim);
    }

    if (pagamento) {
        hospedagens = hospedagens.filter(hospedagem => hospedagem.formaPagamento === pagamento);
    }

    historicoFiltrado = hospedagens;

    atualizarCardsHistorico(hospedagens);

    if (hospedagens.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9">Nenhuma hospedagem finalizada encontrada.</td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = hospedagens
        .sort((a, b) => new Date(b.finalizadoEm || b.criadoEm) - new Date(a.finalizadoEm || a.criadoEm))
        .map(criarLinhaHistorico)
        .join("");
}

function criarLinhaHistorico(hospedagem) {
    return `
        <tr>
            <td>${hospedagem.quartoNome}</td>

            <td>
                ${Utils.formatarData(hospedagem.dataEntrada)}
                <br>
                <small>${hospedagem.horaEntrada}</small>
            </td>

            <td>
                ${Utils.formatarData(hospedagem.dataSaida)}
                <br>
                <small>${hospedagem.horaSaida}</small>
            </td>

            <td>${hospedagem.tempoTexto || "-"}</td>

            <td>${Utils.formatarMoeda(hospedagem.valorHospedagem)}</td>

            <td>${Utils.formatarMoeda(hospedagem.totalConsumos || 0)}</td>

            <td>
                <strong>${Utils.formatarMoeda(hospedagem.totalFinal || 0)}</strong>
            </td>

            <td>${textoPagamentoHistorico(hospedagem.formaPagamento)}</td>

            <td>
                <div class="historico-actions">
                    <button class="btn-icon" onclick="abrirReciboHistorico('${hospedagem.id}')" title="Recibo">
                        <i class="fa-solid fa-receipt"></i>
                    </button>

                    <button class="btn-icon" onclick="verDetalhesHistorico('${hospedagem.id}')" title="Detalhes">
                        <i class="fa-solid fa-eye"></i>
                    </button>

                    <button class="btn-icon" onclick="excluirHistorico('${hospedagem.id}')" title="Excluir">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `;
}
function atualizarCardsHistorico(hospedagens) {
    const cardHospedagensFinalizadas = document.getElementById("cardHospedagensFinalizadas");
    const cardTotalRecebido = document.getElementById("cardTotalRecebido");
    const cardReceitaHoje = document.getElementById("cardReceitaHoje");

    const hoje = Utils.dataAtual();

    const totalRecebido = hospedagens.reduce((total, hospedagem) => {
        return total + Number(hospedagem.totalFinal || 0);
    }, 0);

    const receitaHoje = Storage.getHospedagensFinalizadas()
        .filter(hospedagem => hospedagem.dataSaida === hoje)
        .reduce((total, hospedagem) => {
            return total + Number(hospedagem.totalFinal || 0);
        }, 0);

    if (cardHospedagensFinalizadas) {
        cardHospedagensFinalizadas.textContent = hospedagens.length;
    }

    if (cardTotalRecebido) {
        cardTotalRecebido.textContent = Utils.formatarMoeda(totalRecebido);
    }

    if (cardReceitaHoje) {
        cardReceitaHoje.textContent = Utils.formatarMoeda(receitaHoje);
    }
}

function abrirReciboHistorico(idHospedagem) {
    const hospedagem = Storage.getHospedagem(idHospedagem);

    if (!hospedagem) {
        Utils.mostrarToast("Hospedagem não encontrada.", "erro");
        return;
    }

    montarReciboHistorico(hospedagem);
    abrirModal("modalRecibo");
}

function verDetalhesHistorico(idHospedagem) {
    abrirReciboHistorico(idHospedagem);
}

function montarReciboHistorico(hospedagem) {
    const recibo = document.getElementById("reciboConteudo");

    if (!recibo) return;

    const config = Storage.getConfiguracoes();

    const consumos = hospedagem.consumos || [];

    const consumosHtml = consumos.length > 0
        ? consumos.map(item => {
            const totalItem = Number(item.valor) * Number(item.quantidade);

            return `
                <div class="recibo-line">
                    <span>${item.quantidade}x ${item.nome}</span>
                    <strong>${Utils.formatarMoeda(totalItem)}</strong>
                </div>
            `;
        }).join("")
        : `
            <div class="recibo-line">
                <span>Consumo</span>
                <strong>Nenhum consumo registrado</strong>
            </div>
        `;

    recibo.innerHTML = `
        <div class="recibo-header">
            <h2>${config.nomePousada || "Pousada Control"}</h2>

            <p>
                ${config.cnpj ? `CNPJ: ${config.cnpj}<br>` : ""}
                ${config.telefone ? `Telefone: ${config.telefone}<br>` : ""}
                ${config.endereco ? `${config.endereco}` : ""}
            </p>
        </div>

        <div class="recibo-section">
            <h3>Recibo de Hospedagem</h3>

            <div class="recibo-line">
                <span>Quarto</span>
                <strong>${hospedagem.quartoNome}</strong>
            </div>

            <div class="recibo-line">
                <span>Entrada</span>
                <strong>${Utils.formatarData(hospedagem.dataEntrada)} às ${hospedagem.horaEntrada}</strong>
            </div>

            <div class="recibo-line">
                <span>Saída</span>
                <strong>${Utils.formatarData(hospedagem.dataSaida)} às ${hospedagem.horaSaida}</strong>
            </div>

            <div class="recibo-line">
                <span>Tempo de permanência</span>
                <strong>${hospedagem.tempoTexto || "-"}</strong>
            </div>
        </div>

        <div class="recibo-section">
            <h3>Valores</h3>

            <div class="recibo-line">
                <span>Valor da hospedagem</span>
                <strong>${Utils.formatarMoeda(hospedagem.valorHospedagem)}</strong>
            </div>

            <div class="recibo-line">
                <span>Total de consumos</span>
                <strong>${Utils.formatarMoeda(hospedagem.totalConsumos || 0)}</strong>
            </div>

            <div class="recibo-line">
                <span>Desconto</span>
                <strong>${Utils.formatarMoeda(hospedagem.desconto || 0)}</strong>
            </div>

            <div class="recibo-line">
                <span>Forma de pagamento</span>
                <strong>${textoPagamentoHistorico(hospedagem.formaPagamento)}</strong>
            </div>
        </div>

        <div class="recibo-section">
            <h3>Consumos</h3>
            ${consumosHtml}
        </div>

        <div class="recibo-total">
            <span>Total pago</span>
            <h2>${Utils.formatarMoeda(hospedagem.totalFinal || 0)}</h2>
        </div>
    `;
}

function imprimirReciboHistorico() {
    window.print();
}

function excluirHistorico(idHospedagem) {
    const hospedagem = Storage.getHospedagem(idHospedagem);

    if (!hospedagem) {
        Utils.mostrarToast("Hospedagem não encontrada.", "erro");
        return;
    }

    const confirmar = Utils.confirmar(
        `Deseja realmente excluir o histórico do ${hospedagem.quartoNome}?`
    );

    if (!confirmar) return;

    Storage.excluirHospedagem(idHospedagem);

    Utils.mostrarToast("Registro removido do histórico.");

    carregarHistorico();
}
function limparFiltrosHistorico() {
    const buscarHistorico = document.getElementById("buscarHistorico");
    const filtroDataInicio = document.getElementById("filtroDataInicio");
    const filtroDataFim = document.getElementById("filtroDataFim");
    const filtroPagamento = document.getElementById("filtroPagamento");

    if (buscarHistorico) buscarHistorico.value = "";
    if (filtroDataInicio) filtroDataInicio.value = "";
    if (filtroDataFim) filtroDataFim.value = "";
    if (filtroPagamento) filtroPagamento.value = "";

    carregarHistorico();
}

function textoPagamentoHistorico(forma) {
    const formas = {
        pix: "Pix",
        dinheiro: "Dinheiro",
        cartao_credito: "Cartão de crédito",
        cartao_debito: "Cartão de débito"
    };

    return formas[forma] || forma || "Não informado";
}

function exportarHistoricoJSON() {
    const hospedagens = historicoFiltrado.length > 0
        ? historicoFiltrado
        : Storage.getHospedagensFinalizadas();

    const conteudo = JSON.stringify(hospedagens, null, 2);

    const blob = new Blob([conteudo], {
        type: "application/json"
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = "historico-hospedagens.json";

    document.body.appendChild(link);

    link.click();

    link.remove();

    URL.revokeObjectURL(url);
}

function obterResumoHistorico() {
    const hospedagens = historicoFiltrado.length > 0
        ? historicoFiltrado
        : Storage.getHospedagensFinalizadas();

    const totalHospedagens = hospedagens.length;

    const totalRecebido = hospedagens.reduce((total, hospedagem) => {
        return total + Number(hospedagem.totalFinal || 0);
    }, 0);

    const totalConsumos = hospedagens.reduce((total, hospedagem) => {
        return total + Number(hospedagem.totalConsumos || 0);
    }, 0);

    const ticketMedio = totalHospedagens > 0
        ? totalRecebido / totalHospedagens
        : 0;

    return {
        totalHospedagens,
        totalRecebido,
        totalConsumos,
        ticketMedio
    };
}

function filtrarHistoricoPorPeriodo(dataInicio, dataFim) {
    let hospedagens = Storage.getHospedagensFinalizadas();

    if (dataInicio) {
        hospedagens = hospedagens.filter(hospedagem => hospedagem.dataSaida >= dataInicio);
    }

    if (dataFim) {
        hospedagens = hospedagens.filter(hospedagem => hospedagem.dataSaida <= dataFim);
    }

    return hospedagens;
}

function filtrarHistoricoPorPagamento(formaPagamento) {
    if (!formaPagamento) {
        return Storage.getHospedagensFinalizadas();
    }

    return Storage.getHospedagensFinalizadas().filter(hospedagem => {
        return hospedagem.formaPagamento === formaPagamento;
    });
}