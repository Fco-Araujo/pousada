document.addEventListener("DOMContentLoaded", () => {
    iniciarRelatorios();
});

let relatorioFiltrado = [];

function iniciarRelatorios() {
    configurarEventosRelatorios();
    definirPeriodoPadrao();
    carregarRelatorios();
}

function configurarEventosRelatorios() {
    const btnFiltrarRelatorio = document.getElementById("btnFiltrarRelatorio");
    const btnLimparRelatorio = document.getElementById("btnLimparRelatorio");
    const btnExportarPDF = document.getElementById("btnExportarPDF");
    const btnExportarExcel = document.getElementById("btnExportarExcel");

    if (btnFiltrarRelatorio) {
        btnFiltrarRelatorio.addEventListener("click", carregarRelatorios);
    }

    if (btnLimparRelatorio) {
        btnLimparRelatorio.addEventListener("click", limparFiltrosRelatorio);
    }

    if (btnExportarPDF) {
        btnExportarPDF.addEventListener("click", imprimirRelatorio);
    }

    if (btnExportarExcel) {
        btnExportarExcel.addEventListener("click", exportarRelatorioCSV);
    }
}

function definirPeriodoPadrao() {
    const dataInicio = document.getElementById("dataInicioRelatorio");
    const dataFim = document.getElementById("dataFimRelatorio");

    if (!dataInicio || !dataFim) return;

    const hoje = new Date();

    const primeiroDia = new Date(
        hoje.getFullYear(),
        hoje.getMonth(),
        1
    );

    dataInicio.value = primeiroDia.toISOString().split("T")[0];
    dataFim.value = Utils.dataAtual();
}

function carregarRelatorios() {
    const hospedagens = obterHospedagensFiltradas();

    relatorioFiltrado = hospedagens;

    atualizarCardsRelatorio(hospedagens);
    carregarReceitaPorDia(hospedagens);
    carregarRelatorioPagamento(hospedagens);
    carregarQuartosMaisUsados(hospedagens);
    carregarConsumosMaisVendidos(hospedagens);
    carregarResumoPeriodo(hospedagens);
}

function obterHospedagensFiltradas() {
    let hospedagens = Storage.getHospedagensFinalizadas();

    const dataInicio = document.getElementById("dataInicioRelatorio")?.value || "";
    const dataFim = document.getElementById("dataFimRelatorio")?.value || "";
    const pagamento = document.getElementById("filtroPagamentoRelatorio")?.value || "";

    if (dataInicio) {
        hospedagens = hospedagens.filter(hospedagem => hospedagem.dataSaida >= dataInicio);
    }

    if (dataFim) {
        hospedagens = hospedagens.filter(hospedagem => hospedagem.dataSaida <= dataFim);
    }

    if (pagamento) {
        hospedagens = hospedagens.filter(hospedagem => hospedagem.formaPagamento === pagamento);
    }

    return hospedagens;
}

function atualizarCardsRelatorio(hospedagens) {
    const receitaTotal = hospedagens.reduce((total, hospedagem) => {
        return total + Number(hospedagem.totalFinal || 0);
    }, 0);

    const totalConsumos = hospedagens.reduce((total, hospedagem) => {
        return total + Number(hospedagem.totalConsumos || 0);
    }, 0);

    const quantidadeHospedagens = hospedagens.length;

    const ticketMedio = quantidadeHospedagens > 0
        ? receitaTotal / quantidadeHospedagens
        : 0;

    preencherTexto("relatorioReceitaTotal", Utils.formatarMoeda(receitaTotal));
    preencherTexto("relatorioQtdHospedagens", quantidadeHospedagens);
    preencherTexto("relatorioConsumos", Utils.formatarMoeda(totalConsumos));
    preencherTexto("relatorioTicketMedio", Utils.formatarMoeda(ticketMedio));
}

function preencherTexto(id, valor) {
    const elemento = document.getElementById(id);

    if (elemento) {
        elemento.textContent = valor;
    }
}
function carregarReceitaPorDia(hospedagens) {
    const container = document.getElementById("graficoReceitaDia");

    if (!container) return;

    if (hospedagens.length === 0) {
        container.innerHTML = `
            <i class="fa-solid fa-chart-line"></i>
            <span>Nenhum dado encontrado para o período</span>
        `;
        return;
    }

    const receitaPorDia = {};

    hospedagens.forEach(hospedagem => {
        const data = hospedagem.dataSaida;

        if (!receitaPorDia[data]) {
            receitaPorDia[data] = 0;
        }

        receitaPorDia[data] += Number(hospedagem.totalFinal || 0);
    });

    const dias = Object.keys(receitaPorDia).sort();

    const maiorValor = Math.max(...Object.values(receitaPorDia));

    const barras = dias.map(data => {
        const valor = receitaPorDia[data];
        const altura = maiorValor > 0 ? (valor / maiorValor) * 180 : 0;

        return `
            <div class="barra-dia">
                <div class="barra-valor">
                    ${Utils.formatarMoeda(valor)}
                </div>

                <div class="barra" style="height:${altura}px"></div>

                <span>${formatarDiaCurto(data)}</span>
            </div>
        `;
    }).join("");

    container.innerHTML = `
        <div class="grafico-barras">
            ${barras}
        </div>
    `;
}

function carregarRelatorioPagamento(hospedagens) {
    const lista = document.getElementById("listaPagamento");
    const grafico = document.getElementById("graficoPagamento");

    if (!lista) return;

    if (hospedagens.length === 0) {
        lista.innerHTML = `
            <div class="report-item">
                <span>Nenhum pagamento encontrado</span>
                <strong>R$ 0,00</strong>
            </div>
        `;

        if (grafico) {
            grafico.innerHTML = `
                <i class="fa-solid fa-chart-pie"></i>
                <span>Sem dados</span>
            `;
        }

        return;
    }

    const pagamentoMap = {};

    hospedagens.forEach(hospedagem => {
        const forma = hospedagem.formaPagamento || "nao_informado";

        if (!pagamentoMap[forma]) {
            pagamentoMap[forma] = 0;
        }

        pagamentoMap[forma] += Number(hospedagem.totalFinal || 0);
    });

    const total = Object.values(pagamentoMap).reduce((soma, valor) => soma + valor, 0);

    const formas = Object.entries(pagamentoMap)
        .sort((a, b) => b[1] - a[1]);

    lista.innerHTML = formas.map(([forma, valor]) => {
        const percentual = total > 0 ? (valor / total) * 100 : 0;

        return `
            <div class="report-item">
                <span>${textoPagamentoRelatorio(forma)}</span>
                <strong>${Utils.formatarMoeda(valor)} (${percentual.toFixed(1)}%)</strong>
            </div>
        `;
    }).join("");

    if (grafico) {
        const blocos = formas.map(([forma, valor]) => {
            const percentual = total > 0 ? (valor / total) * 100 : 0;

            return `
                <div class="pagamento-barra">
                    <span>${textoPagamentoRelatorio(forma)}</span>

                    <div class="pagamento-track">
                        <div class="pagamento-fill" style="width:${percentual}%"></div>
                    </div>

                    <strong>${percentual.toFixed(1)}%</strong>
                </div>
            `;
        }).join("");

        grafico.innerHTML = `
            <div class="grafico-pagamento-lista">
                ${blocos}
            </div>
        `;
    }
}

function carregarQuartosMaisUsados(hospedagens) {
    const lista = document.getElementById("listaQuartosMaisUsados");

    if (!lista) return;

    if (hospedagens.length === 0) {
        lista.innerHTML = `
            <div class="report-item">
                <span>Nenhum quarto utilizado</span>
                <strong>0</strong>
            </div>
        `;
        return;
    }

    const quartosMap = {};

    hospedagens.forEach(hospedagem => {
        const nome = hospedagem.quartoNome || "Não informado";

        if (!quartosMap[nome]) {
            quartosMap[nome] = {
                quantidade: 0,
                receita: 0
            };
        }

        quartosMap[nome].quantidade += 1;
        quartosMap[nome].receita += Number(hospedagem.totalFinal || 0);
    });

    const quartos = Object.entries(quartosMap)
        .sort((a, b) => b[1].quantidade - a[1].quantidade)
        .slice(0, 5);

    lista.innerHTML = quartos.map(([nome, dados], index) => {
        return `
            <div class="report-item">
                <span>${index + 1}. ${nome}</span>
                <strong>${dados.quantidade} hospedagem(ns)</strong>
            </div>

            <div class="report-item">
                <span>Receita gerada</span>
                <strong>${Utils.formatarMoeda(dados.receita)}</strong>
            </div>
        `;
    }).join("");
}

function carregarConsumosMaisVendidos(hospedagens) {
    const lista = document.getElementById("listaConsumosMaisVendidos");

    if (!lista) return;

    const consumosMap = {};

    hospedagens.forEach(hospedagem => {
        const consumos = hospedagem.consumos || [];

        consumos.forEach(item => {
            const nome = item.nome || "Não informado";

            if (!consumosMap[nome]) {
                consumosMap[nome] = {
                    quantidade: 0,
                    receita: 0
                };
            }

            consumosMap[nome].quantidade += Number(item.quantidade || 0);
            consumosMap[nome].receita += Number(item.valor || 0) * Number(item.quantidade || 0);
        });
    });

    const consumos = Object.entries(consumosMap)
        .sort((a, b) => b[1].quantidade - a[1].quantidade)
        .slice(0, 5);

    if (consumos.length === 0) {
        lista.innerHTML = `
            <div class="report-item">
                <span>Nenhum consumo registrado</span>
                <strong>0</strong>
            </div>
        `;
        return;
    }

    lista.innerHTML = consumos.map(([nome, dados], index) => {
        return `
            <div class="report-item">
                <span>${index + 1}. ${nome}</span>
                <strong>${dados.quantidade} un.</strong>
            </div>

            <div class="report-item">
                <span>Receita gerada</span>
                <strong>${Utils.formatarMoeda(dados.receita)}</strong>
            </div>
        `;
    }).join("");
}
function carregarResumoPeriodo(hospedagens) {
    const container = document.getElementById("resumoPeriodo");

    if (!container) return;

    const receitaTotal = hospedagens.reduce((total, hospedagem) => {
        return total + Number(hospedagem.totalFinal || 0);
    }, 0);

    const totalHospedagens = hospedagens.length;

    const totalConsumos = hospedagens.reduce((total, hospedagem) => {
        return total + Number(hospedagem.totalConsumos || 0);
    }, 0);

    const totalDescontos = hospedagens.reduce((total, hospedagem) => {
        return total + Number(hospedagem.desconto || 0);
    }, 0);

    const ticketMedio = totalHospedagens > 0
        ? receitaTotal / totalHospedagens
        : 0;

    const tempoMedio = calcularTempoMedio(hospedagens);

    container.innerHTML = `
        <div class="report-item">
            <span>Total de hospedagens</span>
            <strong>${totalHospedagens}</strong>
        </div>

        <div class="report-item">
            <span>Receita total</span>
            <strong>${Utils.formatarMoeda(receitaTotal)}</strong>
        </div>

        <div class="report-item">
            <span>Total em consumos</span>
            <strong>${Utils.formatarMoeda(totalConsumos)}</strong>
        </div>

        <div class="report-item">
            <span>Total em descontos</span>
            <strong>${Utils.formatarMoeda(totalDescontos)}</strong>
        </div>

        <div class="report-item">
            <span>Ticket médio</span>
            <strong>${Utils.formatarMoeda(ticketMedio)}</strong>
        </div>

        <div class="report-item">
            <span>Tempo médio</span>
            <strong>${tempoMedio}</strong>
        </div>
    `;
}

function calcularTempoMedio(hospedagens) {
    if (hospedagens.length === 0) {
        return "0h 0min";
    }

    const totalMinutos = hospedagens.reduce((total, hospedagem) => {
        return total + Number(hospedagem.tempoMinutos || 0);
    }, 0);

    const media = Math.floor(totalMinutos / hospedagens.length);

    const horas = Math.floor(media / 60);
    const minutos = media % 60;

    return `${horas}h ${minutos}min`;
}

function limparFiltrosRelatorio() {
    const dataInicio = document.getElementById("dataInicioRelatorio");
    const dataFim = document.getElementById("dataFimRelatorio");
    const pagamento = document.getElementById("filtroPagamentoRelatorio");

    if (dataInicio) dataInicio.value = "";
    if (dataFim) dataFim.value = "";
    if (pagamento) pagamento.value = "";

    carregarRelatorios();
}

function imprimirRelatorio() {
    window.print();
}

function exportarRelatorioCSV() {
    const hospedagens = relatorioFiltrado;

    if (!hospedagens || hospedagens.length === 0) {
        Utils.mostrarToast("Não há dados para exportar.", "erro");
        return;
    }

    const cabecalho = [
        "Quarto",
        "Entrada",
        "Saída",
        "Tempo",
        "Hospedagem",
        "Consumos",
        "Desconto",
        "Total",
        "Pagamento"
    ];

    const linhas = hospedagens.map(hospedagem => {
        return [
            hospedagem.quartoNome,
            `${Utils.formatarData(hospedagem.dataEntrada)} ${hospedagem.horaEntrada}`,
            `${Utils.formatarData(hospedagem.dataSaida)} ${hospedagem.horaSaida}`,
            hospedagem.tempoTexto || "",
            Number(hospedagem.valorHospedagem || 0).toFixed(2),
            Number(hospedagem.totalConsumos || 0).toFixed(2),
            Number(hospedagem.desconto || 0).toFixed(2),
            Number(hospedagem.totalFinal || 0).toFixed(2),
            textoPagamentoRelatorio(hospedagem.formaPagamento)
        ];
    });

    const csv = [
        cabecalho.join(";"),
        ...linhas.map(linha => linha.join(";"))
    ].join("\n");

    const blob = new Blob([csv], {
        type: "text/csv;charset=utf-8;"
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = "relatorio-pousada.csv";

    document.body.appendChild(link);

    link.click();

    link.remove();

    URL.revokeObjectURL(url);

    Utils.mostrarToast("Relatório exportado com sucesso!");
}

function textoPagamentoRelatorio(forma) {
    const formas = {
        pix: "Pix",
        dinheiro: "Dinheiro",
        cartao_credito: "Cartão de crédito",
        cartao_debito: "Cartão de débito",
        nao_informado: "Não informado"
    };

    return formas[forma] || forma || "Não informado";
}

function formatarDiaCurto(data) {
    if (!data) return "";

    const partes = data.split("-");

    if (partes.length !== 3) return data;

    return `${partes[2]}/${partes[1]}`;
}