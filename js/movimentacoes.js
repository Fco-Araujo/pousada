document.addEventListener("DOMContentLoaded", () => {
    iniciarMovimentacoes();
});

let movimentacoesFiltradas = [];

function iniciarMovimentacoes() {
    garantirMovimentacoesIniciais();
    configurarEventosMovimentacoes();
    carregarMovimentacoes();
}

function configurarEventosMovimentacoes() {
    const buscarMovimentacao = document.getElementById("buscarMovimentacao");
    const filtroTipo = document.getElementById("filtroTipoMovimentacao");
    const filtroData = document.getElementById("filtroDataMovimentacao");
    const btnLimpar = document.getElementById("btnLimparMovimentacoes");

    if (buscarMovimentacao) {
        buscarMovimentacao.addEventListener("input", carregarMovimentacoes);
    }

    if (filtroTipo) {
        filtroTipo.addEventListener("change", carregarMovimentacoes);
    }

    if (filtroData) {
        filtroData.addEventListener("change", carregarMovimentacoes);
    }

    if (btnLimpar) {
        btnLimpar.addEventListener("click", limparMovimentacoes);
    }
}

function garantirMovimentacoesIniciais() {
    const movimentacoes = Storage.getMovimentacoes();

    if (movimentacoes.length > 0) return;

    const movimentacoesIniciais = [
        {
            id: Utils.gerarId(),
            tipo: "sistema",
            usuario: "Administrador",
            descricao: "Sistema iniciado",
            detalhes: "Demonstração local carregada com sucesso.",
            data: Utils.dataAtual(),
            hora: Utils.horaAtual(),
            criadoEm: new Date().toISOString()
        },
        {
            id: Utils.gerarId(),
            tipo: "usuario",
            usuario: "Administrador",
            descricao: "Usuário administrador disponível",
            detalhes: "Login de demonstração criado automaticamente.",
            data: Utils.dataAtual(),
            hora: Utils.horaAtual(),
            criadoEm: new Date().toISOString()
        }
    ];

    Storage.salvarMovimentacoes(movimentacoesIniciais);
}

function carregarMovimentacoes() {
    const tbody = document.getElementById("tbodyMovimentacoes");

    if (!tbody) return;

    let movimentacoes = Storage.getMovimentacoes();

    const pesquisa = document.getElementById("buscarMovimentacao")?.value.trim().toLowerCase() || "";
    const tipo = document.getElementById("filtroTipoMovimentacao")?.value || "";
    const data = document.getElementById("filtroDataMovimentacao")?.value || "";

    if (pesquisa) {
        movimentacoes = movimentacoes.filter(mov => {
            return mov.usuario.toLowerCase().includes(pesquisa)
                || mov.descricao.toLowerCase().includes(pesquisa)
                || (mov.detalhes || "").toLowerCase().includes(pesquisa)
                || textoTipoMovimentacao(mov.tipo).toLowerCase().includes(pesquisa);
        });
    }

    if (tipo) {
        movimentacoes = movimentacoes.filter(mov => mov.tipo === tipo);
    }

    if (data) {
        movimentacoes = movimentacoes.filter(mov => mov.data === data);
    }

    movimentacoesFiltradas = movimentacoes;

    atualizarCardsMovimentacoes(movimentacoes);

    if (movimentacoes.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5">Nenhuma movimentação encontrada.</td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = movimentacoes
        .sort((a, b) => new Date(b.criadoEm) - new Date(a.criadoEm))
        .map(criarLinhaMovimentacao)
        .join("");
}

function criarLinhaMovimentacao(mov) {
    return `
        <tr>
            <td>
                ${Utils.formatarData(mov.data)}
                <br>
                <small>${mov.hora}</small>
            </td>

            <td>${mov.usuario || "Sistema"}</td>

            <td>
                <span class="mov-tipo ${classeTipoMovimentacao(mov.tipo)}">
                    <i class="${iconeTipoMovimentacao(mov.tipo)}"></i>
                    ${textoTipoMovimentacao(mov.tipo)}
                </span>
            </td>

            <td>${mov.descricao}</td>

            <td class="mov-detalhes">
                ${mov.detalhes || "-"}
            </td>
        </tr>
    `;
}
function atualizarCardsMovimentacoes(movimentacoes) {
    const total = movimentacoes.length;

    const hospedagens = movimentacoes.filter(mov => mov.tipo === "hospedagem").length;
    const consumos = movimentacoes.filter(mov => mov.tipo === "consumo").length;
    const usuarios = movimentacoes.filter(mov => mov.tipo === "usuario").length;

    preencherCardMovimentacao("cardTotalMovimentacoes", total);
    preencherCardMovimentacao("cardMovHospedagens", hospedagens);
    preencherCardMovimentacao("cardMovConsumos", consumos);
    preencherCardMovimentacao("cardMovUsuarios", usuarios);
}

function preencherCardMovimentacao(id, valor) {
    const elemento = document.getElementById(id);

    if (elemento) {
        elemento.textContent = valor;
    }
}

function limparMovimentacoes() {
    const confirmar = Utils.confirmar(
        "Deseja realmente limpar todas as movimentações?"
    );

    if (!confirmar) return;

    Storage.limparMovimentacoes();

    const movimentacao = {
        id: Utils.gerarId(),
        tipo: "sistema",
        usuario: "Administrador",
        descricao: "Movimentações limpas",
        detalhes: "Os registros anteriores foram removidos da demonstração.",
        data: Utils.dataAtual(),
        hora: Utils.horaAtual(),
        criadoEm: new Date().toISOString()
    };

    Storage.adicionarMovimentacao(movimentacao);

    Utils.mostrarToast("Movimentações limpas com sucesso!");

    carregarMovimentacoes();
}

function textoTipoMovimentacao(tipo) {
    const tipos = {
        hospedagem: "Hospedagem",
        consumo: "Consumo",
        quarto: "Quarto",
        usuario: "Usuário",
        sistema: "Sistema"
    };

    return tipos[tipo] || tipo || "Sistema";
}

function classeTipoMovimentacao(tipo) {
    const classes = {
        hospedagem: "mov-hospedagem",
        consumo: "mov-consumo",
        quarto: "mov-quarto",
        usuario: "mov-usuario",
        sistema: "mov-sistema"
    };

    return classes[tipo] || "mov-sistema";
}

function iconeTipoMovimentacao(tipo) {
    const icones = {
        hospedagem: "fa-solid fa-door-open",
        consumo: "fa-solid fa-cart-shopping",
        quarto: "fa-solid fa-bed",
        usuario: "fa-solid fa-user",
        sistema: "fa-solid fa-gear"
    };

    return icones[tipo] || "fa-solid fa-gear";
}

function registrarMovimentacao(tipo, descricao, detalhes = "") {
    const movimentacao = {
        id: Utils.gerarId(),
        tipo,
        usuario: obterUsuarioMovimentacao(),
        descricao,
        detalhes,
        data: Utils.dataAtual(),
        hora: Utils.horaAtual(),
        criadoEm: new Date().toISOString()
    };

    Storage.adicionarMovimentacao(movimentacao);
}

function obterUsuarioMovimentacao() {
    return localStorage.getItem("pousada_usuario_nome") || "Administrador";
}

function exportarMovimentacoesJSON() {
    const movimentacoes = movimentacoesFiltradas.length > 0
        ? movimentacoesFiltradas
        : Storage.getMovimentacoes();

    const conteudo = JSON.stringify(movimentacoes, null, 2);

    const blob = new Blob([conteudo], {
        type: "application/json"
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = "movimentacoes-pousada.json";

    document.body.appendChild(link);

    link.click();

    link.remove();

    URL.revokeObjectURL(url);

    Utils.mostrarToast("Movimentações exportadas com sucesso!");
}