document.addEventListener("DOMContentLoaded", () => {
    iniciarDashboard();
});

function iniciarDashboard() {
    garantirDadosIniciaisDashboard();
    carregarDashboard();

    setInterval(() => {
        carregarDashboard();
    }, 60000);
}

function garantirDadosIniciaisDashboard() {
    const quartos = Storage.getQuartos();

    if (quartos.length === 0) {
        const quartosIniciais = [
            {
                id: Utils.gerarId(),
                nome: "Apartamento 01",
                numero: "01",
                tipo: "casal",
                valorHora: 25,
                status: "livre",
                observacoes: "Cama de casal e ar-condicionado."
            },
            {
                id: Utils.gerarId(),
                nome: "Apartamento 02",
                numero: "02",
                tipo: "simples",
                valorHora: 25,
                status: "livre",
                observacoes: "Quarto simples."
            },
            {
                id: Utils.gerarId(),
                nome: "Apartamento 03",
                numero: "03",
                tipo: "suite",
                valorHora: 35,
                status: "livre",
                observacoes: "Suíte com frigobar."
            },
            {
                id: Utils.gerarId(),
                nome: "Apartamento 04",
                numero: "04",
                tipo: "familia",
                valorHora: 45,
                status: "manutencao",
                observacoes: "Em manutenção."
            }
        ];

        Storage.salvarQuartos(quartosIniciais);
    }

    const consumos = Storage.getConsumos();

    if (consumos.length === 0) {
        const consumosIniciais = [
            {
                id: Utils.gerarId(),
                nome: "Água Mineral",
                categoria: "Bebidas",
                valor: 3,
                status: "ativo"
            },
            {
                id: Utils.gerarId(),
                nome: "Refrigerante",
                categoria: "Bebidas",
                valor: 6,
                status: "ativo"
            },
            {
                id: Utils.gerarId(),
                nome: "Cerveja",
                categoria: "Bebidas",
                valor: 8,
                status: "ativo"
            }
        ];

        Storage.salvarConsumos(consumosIniciais);
    }
}

function carregarDashboard() {
    atualizarCardsDashboard();
    carregarMapaQuartos();
    carregarUltimasHospedagens();
}

function atualizarCardsDashboard() {
    const quartos = Storage.getQuartos();
    const hospedagens = Storage.getHospedagens();

    const hoje = Utils.dataAtual();

    const quartosLivres = quartos.filter(quarto => quarto.status === "livre").length;
    const quartosOcupados = quartos.filter(quarto => quarto.status === "ocupado").length;

    const hospedagensHoje = hospedagens.filter(hospedagem => {
        return hospedagem.status === "finalizada" && hospedagem.dataSaida === hoje;
    });

    const receitaHoje = hospedagensHoje.reduce((total, hospedagem) => {
        return total + Number(hospedagem.totalFinal || 0);
    }, 0);

    const consumosHoje = hospedagensHoje.reduce((total, hospedagem) => {
        return total + (hospedagem.consumos || []).reduce((soma, item) => {
            return soma + Number(item.quantidade || 0);
        }, 0);
    }, 0);

    const cards = document.querySelectorAll(".cards .card");

    if (cards[0]) {
        cards[0].querySelector("h2").textContent = quartosLivres;
    }

    if (cards[1]) {
        cards[1].querySelector("h2").textContent = quartosOcupados;
    }

    if (cards[2]) {
        cards[2].querySelector("h2").textContent = Utils.formatarMoeda(receitaHoje);
    }

    if (cards[3]) {
        cards[3].querySelector("h2").textContent = consumosHoje;
    }
}

function carregarMapaQuartos() {
    const container = document.querySelector(".quartos-grid");

    if (!container) return;

    const quartos = Storage.getQuartos()
        .sort((a, b) => Number(a.numero) - Number(b.numero));

    if (quartos.length === 0) {
        container.innerHTML = `
            <div class="quarto-dashboard-card">
                <h3>Nenhum quarto cadastrado</h3>
                <p>Cadastre quartos para visualizar o mapa da pousada.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = quartos.map(quarto => criarCardQuartoDashboard(quarto)).join("");
}

function criarCardQuartoDashboard(quarto) {
    const hospedagemAberta = Storage.getHospedagensAbertas()
        .find(hospedagem => String(hospedagem.quartoId) === String(quarto.id));

    let tempoTexto = "";
    let totalParcial = 0;

    if (hospedagemAberta) {
        const agora = new Date();

        const tempo = Utils.calcularTempo(
            hospedagemAberta.dataEntrada,
            hospedagemAberta.horaEntrada,
            agora.toISOString().split("T")[0],
            agora.toTimeString().slice(0, 5)
        );

        const totalConsumos = Utils.somarConsumos(hospedagemAberta.consumos || []);

        tempoTexto = tempo.texto;
        totalParcial = Number(hospedagemAberta.valorHospedagem) + totalConsumos;
    }

    return `
        <div class="quarto-dashboard-card">
            <div class="quarto-dashboard-header">
                <div>
                    <h3>${quarto.nome}</h3>
                    <p>Quarto ${quarto.numero}</p>
                </div>

                <span class="status ${classeStatusDashboard(quarto.status)}">
                    ${textoStatusDashboard(quarto.status)}
                </span>
            </div>

            <div class="quarto-dashboard-info">
                <span>Tipo: ${textoTipoDashboard(quarto.tipo)}</span>
                <span>Valor/hora: ${Utils.formatarMoeda(quarto.valorHora)}</span>

                ${hospedagemAberta ? `
                    <span>Entrada: ${hospedagemAberta.horaEntrada}</span>
                    <span>Tempo: ${tempoTexto}</span>
                    <span>Total parcial: ${Utils.formatarMoeda(totalParcial)}</span>
                ` : ""}
            </div>

            <div class="quarto-dashboard-actions">
                ${criarAcoesQuartoDashboard(quarto, hospedagemAberta)}
            </div>
        </div>
    `;
}
function criarAcoesQuartoDashboard(quarto, hospedagemAberta) {
    if (quarto.status === "livre") {
        return `
            <button class="btn-primary" onclick="irParaHospedagens()">
                <i class="fa-solid fa-plus"></i>
                Hospedar
            </button>
        `;
    }

    if (quarto.status === "ocupado" && hospedagemAberta) {
        return `
            <button class="btn-secondary" onclick="irParaHospedagens()">
                <i class="fa-solid fa-eye"></i>
                Ver
            </button>
        `;
    }

    if (quarto.status === "limpeza") {
        return `
            <button class="btn-secondary" onclick="liberarQuartoDashboard('${quarto.id}')">
                <i class="fa-solid fa-check"></i>
                Liberar
            </button>
        `;
    }

    if (quarto.status === "manutencao") {
        return `
            <button class="btn-secondary" onclick="liberarQuartoDashboard('${quarto.id}')">
                <i class="fa-solid fa-check"></i>
                Liberar
            </button>
        `;
    }

    return "";
}

function carregarUltimasHospedagens() {
    const tbody = document.getElementById("tbodyHospedagens");

    if (!tbody) return;

    const hospedagens = Storage.getHospedagens()
        .filter(hospedagem => hospedagem.status === "finalizada")
        .sort((a, b) => new Date(b.finalizadoEm || b.criadoEm) - new Date(a.finalizadoEm || a.criadoEm))
        .slice(0, 8);

    if (hospedagens.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5">Nenhuma hospedagem finalizada ainda.</td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = hospedagens.map(hospedagem => {
        return `
            <tr>
                <td>${hospedagem.quartoNome}</td>
                <td>${Utils.formatarData(hospedagem.dataEntrada)} ${hospedagem.horaEntrada}</td>
                <td>${Utils.formatarData(hospedagem.dataSaida)} ${hospedagem.horaSaida}</td>
                <td>${Utils.formatarMoeda(hospedagem.totalFinal || 0)}</td>
                <td>
                    <span class="status status-livre">
                        Finalizada
                    </span>
                </td>
            </tr>
        `;
    }).join("");
}

function liberarQuartoDashboard(idQuarto) {
    const quarto = Storage.getQuarto(idQuarto);

    if (!quarto) {
        Utils.mostrarToast("Quarto não encontrado.", "erro");
        return;
    }

    if (quarto.status === "ocupado") {
        Utils.mostrarToast("Este quarto está ocupado.", "erro");
        return;
    }

    Storage.atualizarStatusQuarto(idQuarto, "livre");

    Utils.mostrarToast("Quarto liberado com sucesso!");

    carregarDashboard();
}

function irParaHospedagens() {
    window.location.href = "hospedagens.html";
}

function textoStatusDashboard(status) {
    const statusMap = {
        livre: "Livre",
        ocupado: "Ocupado",
        limpeza: "Em limpeza",
        manutencao: "Manutenção"
    };

    return statusMap[status] || status;
}

function classeStatusDashboard(status) {
    const classes = {
        livre: "status-livre",
        ocupado: "status-ocupado",
        limpeza: "status-limpeza",
        manutencao: "status-manutencao"
    };

    return classes[status] || "";
}

function textoTipoDashboard(tipo) {
    const tipos = {
        simples: "Simples",
        casal: "Casal",
        suite: "Suíte",
        familia: "Família"
    };

    return tipos[tipo] || tipo;
}