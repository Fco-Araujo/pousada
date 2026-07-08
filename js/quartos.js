document.addEventListener("DOMContentLoaded", () => {
    iniciarQuartos();
});

let quartosFiltrados = [];

function iniciarQuartos() {
    garantirQuartosIniciais();
    configurarEventosQuartos();
    carregarQuartos();
}

function configurarEventosQuartos() {
    const btnAbrirModal = document.getElementById("btnAbrirModalQuarto");
    const btnFecharModal = document.getElementById("btnFecharModalQuarto");
    const btnCancelar = document.getElementById("btnCancelarQuarto");
    const formQuarto = document.getElementById("formQuarto");
    const buscarQuarto = document.getElementById("buscarQuarto");
    const filtroStatus = document.getElementById("filtroStatus");

    if (btnAbrirModal) {
        btnAbrirModal.addEventListener("click", abrirModalNovoQuarto);
    }

    if (btnFecharModal) {
        btnFecharModal.addEventListener("click", () => fecharModal("modalQuarto"));
    }

    if (btnCancelar) {
        btnCancelar.addEventListener("click", () => fecharModal("modalQuarto"));
    }

    if (formQuarto) {
        formQuarto.addEventListener("submit", salvarQuarto);
    }

    if (buscarQuarto) {
        buscarQuarto.addEventListener("input", carregarQuartos);
    }

    if (filtroStatus) {
        filtroStatus.addEventListener("change", carregarQuartos);
    }
}

function garantirQuartosIniciais() {
    const quartos = Storage.getQuartos();

    if (quartos.length > 0) return;

    const quartosIniciais = [
        {
            id: Utils.gerarId(),
            nome: "Apartamento 01",
            numero: "01",
            tipo: "casal",
            valorHora: 25,
            status: "livre",
            observacoes: "Cama de casal, ar-condicionado e banheiro privativo."
        },
        {
            id: Utils.gerarId(),
            nome: "Apartamento 02",
            numero: "02",
            tipo: "simples",
            valorHora: 25,
            status: "livre",
            observacoes: "Quarto simples para hospedagem rápida."
        },
        {
            id: Utils.gerarId(),
            nome: "Apartamento 03",
            numero: "03",
            tipo: "suite",
            valorHora: 35,
            status: "livre",
            observacoes: "Suíte com ar-condicionado e frigobar."
        },
        {
            id: Utils.gerarId(),
            nome: "Apartamento 04",
            numero: "04",
            tipo: "familia",
            valorHora: 45,
            status: "manutencao",
            observacoes: "Quarto temporariamente em manutenção."
        }
    ];

    Storage.salvarQuartos(quartosIniciais);
}

function abrirModalNovoQuarto() {
    limparFormularioQuarto();

    const titulo = document.getElementById("tituloModalQuarto");
    const config = Storage.getConfiguracoes();

    if (titulo) {
        titulo.textContent = "Novo Quarto";
    }

    document.getElementById("valorHora").value = config.valorHoraPadrao || 25;
    document.getElementById("statusQuarto").value = "livre";

    abrirModal("modalQuarto");
}

function limparFormularioQuarto() {
    document.getElementById("quartoId").value = "";
    document.getElementById("nomeQuarto").value = "";
    document.getElementById("numeroQuarto").value = "";
    document.getElementById("tipoQuarto").value = "";
    document.getElementById("valorHora").value = "";
    document.getElementById("statusQuarto").value = "livre";
    document.getElementById("observacoesQuarto").value = "";
}

function salvarQuarto(event) {
    event.preventDefault();

    const id = document.getElementById("quartoId").value;

    const quarto = {
        id: id || Utils.gerarId(),
        nome: document.getElementById("nomeQuarto").value.trim(),
        numero: document.getElementById("numeroQuarto").value.trim(),
        tipo: document.getElementById("tipoQuarto").value,
        valorHora: Number(document.getElementById("valorHora").value),
        status: document.getElementById("statusQuarto").value,
        observacoes: document.getElementById("observacoesQuarto").value.trim()
    };

    const validacao = validarQuarto(quarto, id);

    if (!validacao.valido) {
        Utils.mostrarToast(validacao.mensagem, "erro");
        return;
    }

    if (id) {
        Storage.atualizarQuarto(id, quarto);
        Utils.mostrarToast("Quarto atualizado com sucesso!");
    } else {
        Storage.adicionarQuarto(quarto);
        Utils.mostrarToast("Quarto cadastrado com sucesso!");
    }

    fecharModal("modalQuarto");
    carregarQuartos();
}

function validarQuarto(quarto, idAtual = null) {
    if (!quarto.nome) {
        return {
            valido: false,
            mensagem: "Informe o nome do quarto."
        };
    }

    if (!quarto.numero) {
        return {
            valido: false,
            mensagem: "Informe o número do quarto."
        };
    }

    if (!quarto.tipo) {
        return {
            valido: false,
            mensagem: "Selecione o tipo do quarto."
        };
    }

    if (!quarto.valorHora || quarto.valorHora <= 0) {
        return {
            valido: false,
            mensagem: "Informe um valor por hora válido."
        };
    }

    if (!quarto.status) {
        return {
            valido: false,
            mensagem: "Selecione o status do quarto."
        };
    }

    const quartos = Storage.getQuartos();

    const numeroDuplicado = quartos.some(item => {
        return String(item.numero) === String(quarto.numero)
            && String(item.id) !== String(idAtual);
    });

    if (numeroDuplicado) {
        return {
            valido: false,
            mensagem: "Já existe um quarto cadastrado com esse número."
        };
    }

    return {
        valido: true,
        mensagem: "OK"
    };
}
function carregarQuartos() {

    const lista = document.getElementById("listaQuartos");

    if (!lista) return;

    let quartos = Storage.getQuartos();

    const pesquisa = document
        .getElementById("buscarQuarto")
        .value
        .trim()
        .toLowerCase();

    const status = document.getElementById("filtroStatus").value;

    if (pesquisa) {

        quartos = quartos.filter(quarto => {

            return (

                quarto.nome.toLowerCase().includes(pesquisa)

                ||

                quarto.numero.toLowerCase().includes(pesquisa)

                ||

                textoTipo(quarto.tipo)
                    .toLowerCase()
                    .includes(pesquisa)

            );

        });

    }

    if (status) {

        quartos = quartos.filter(quarto => quarto.status === status);

    }

    quartosFiltrados = quartos;

    atualizarTituloLista(quartos.length);

    if (quartos.length === 0) {

        lista.innerHTML = `

            <div class="quarto-card">

                <h3>Nenhum quarto encontrado</h3>

                <p>Tente alterar os filtros ou cadastre um novo quarto.</p>

            </div>

        `;

        return;

    }

    lista.innerHTML = quartos
        .sort((a, b) => Number(a.numero) - Number(b.numero))
        .map(criarCardQuarto)
        .join("");

}

function atualizarTituloLista(total) {

    const titulo = document.querySelector(".topbar p");

    if (!titulo) return;

    titulo.textContent = `${total} quarto(s) encontrado(s).`;

}

function criarCardQuarto(quarto) {

    return `

        <div class="quarto-card">

            <div class="quarto-card-header">

                <div>

                    <h3>${quarto.nome}</h3>

                    <p>Quarto ${quarto.numero}</p>

                </div>

                <span class="status ${classeStatus(quarto.status)}">

                    ${textoStatus(quarto.status)}

                </span>

            </div>

            <div class="quarto-info">

                <p>

                    <strong>Tipo:</strong>

                    ${textoTipo(quarto.tipo)}

                </p>

                <p>

                    <strong>Valor/Hora:</strong>

                    ${Utils.formatarMoeda(quarto.valorHora)}

                </p>

                <p>

                    <strong>Observações:</strong>

                    ${quarto.observacoes || "Nenhuma"}

                </p>

            </div>

            <div class="quarto-actions">

                <button
                    class="btn-secondary"
                    onclick="editarQuarto('${quarto.id}')">

                    <i class="fa-solid fa-pen"></i>

                    Editar

                </button>

                <button
                    class="btn-danger"
                    onclick="excluirQuarto('${quarto.id}')">

                    <i class="fa-solid fa-trash"></i>

                    Excluir

                </button>

            </div>

        </div>

    `;

}

function editarQuarto(id) {

    const quarto = Storage.getQuarto(id);

    if (!quarto) {

        Utils.mostrarToast(
            "Quarto não encontrado.",
            "erro"
        );

        return;

    }

    document.getElementById("tituloModalQuarto").textContent =
        "Editar Quarto";

    document.getElementById("quartoId").value = quarto.id;

    document.getElementById("nomeQuarto").value = quarto.nome;

    document.getElementById("numeroQuarto").value = quarto.numero;

    document.getElementById("tipoQuarto").value = quarto.tipo;

    document.getElementById("valorHora").value = quarto.valorHora;

    document.getElementById("statusQuarto").value = quarto.status;

    document.getElementById("observacoesQuarto").value =
        quarto.observacoes;

    abrirModal("modalQuarto");

}

function excluirQuarto(id) {

    const quarto = Storage.getQuarto(id);

    if (!quarto) {

        Utils.mostrarToast(
            "Quarto não encontrado.",
            "erro"
        );

        return;

    }

    if (quarto.status === "ocupado") {

        Utils.mostrarToast(
            "Não é permitido excluir um quarto ocupado.",
            "erro"
        );

        return;

    }

    const confirmar = Utils.confirmar(

        `Deseja realmente excluir ${quarto.nome}?`

    );

    if (!confirmar) return;

    Storage.excluirQuarto(id);

    Utils.mostrarToast(

        "Quarto removido com sucesso."

    );

    carregarQuartos();

}

function atualizarStatus(id, novoStatus) {

    Storage.atualizarStatusQuarto(id, novoStatus);

    carregarQuartos();

}
function textoStatus(status) {
    const statusMap = {
        livre: "Livre",
        ocupado: "Ocupado",
        limpeza: "Em limpeza",
        manutencao: "Manutenção"
    };

    return statusMap[status] || status;
}

function classeStatus(status) {
    const classes = {
        livre: "status-livre",
        ocupado: "status-ocupado",
        limpeza: "status-limpeza",
        manutencao: "status-manutencao"
    };

    return classes[status] || "";
}

function textoTipo(tipo) {
    const tipos = {
        simples: "Simples",
        casal: "Casal",
        suite: "Suíte",
        familia: "Família"
    };

    return tipos[tipo] || tipo;
}

function contarQuartosPorStatus(status) {
    return Storage.getQuartos().filter(quarto => quarto.status === status).length;
}

function obterResumoQuartos() {
    const quartos = Storage.getQuartos();

    return {
        total: quartos.length,
        livres: quartos.filter(quarto => quarto.status === "livre").length,
        ocupados: quartos.filter(quarto => quarto.status === "ocupado").length,
        limpeza: quartos.filter(quarto => quarto.status === "limpeza").length,
        manutencao: quartos.filter(quarto => quarto.status === "manutencao").length
    };
}

function ordenarQuartosPorNumero(quartos) {
    return quartos.sort((a, b) => {
        const numeroA = Number(a.numero);
        const numeroB = Number(b.numero);

        if (!isNaN(numeroA) && !isNaN(numeroB)) {
            return numeroA - numeroB;
        }

        return String(a.numero).localeCompare(String(b.numero));
    });
}

function limparFiltrosQuartos() {
    const buscarQuarto = document.getElementById("buscarQuarto");
    const filtroStatus = document.getElementById("filtroStatus");

    if (buscarQuarto) buscarQuarto.value = "";
    if (filtroStatus) filtroStatus.value = "";

    carregarQuartos();
}

function quartoEstaOcupado(id) {
    const quarto = Storage.getQuarto(id);

    if (!quarto) return false;

    return quarto.status === "ocupado";
}

function existeHospedagemAbertaNoQuarto(idQuarto) {
    const hospedagens = Storage.getHospedagensAbertas();

    return hospedagens.some(hospedagem => String(hospedagem.quartoId) === String(idQuarto));
}

function podeEditarStatusQuarto(idQuarto, novoStatus) {
    const hospedagemAberta = existeHospedagemAbertaNoQuarto(idQuarto);

    if (hospedagemAberta && novoStatus !== "ocupado") {
        return {
            permitido: false,
            mensagem: "Este quarto possui uma hospedagem em aberto. Finalize a hospedagem antes de alterar o status."
        };
    }

    return {
        permitido: true,
        mensagem: "OK"
    };
}

function resetarQuartosDemo() {
    const confirmarReset = Utils.confirmar(
        "Deseja resetar os quartos da demonstração? Isso apagará os quartos cadastrados."
    );

    if (!confirmarReset) return;

    Storage.salvarQuartos([]);

    garantirQuartosIniciais();

    carregarQuartos();

    Utils.mostrarToast("Quartos da demonstração restaurados com sucesso.");
}

function exportarQuartosJSON() {
    const quartos = Storage.getQuartos();

    const conteudo = JSON.stringify(quartos, null, 2);

    const blob = new Blob([conteudo], {
        type: "application/json"
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = "quartos-pousada.json";

    document.body.appendChild(link);

    link.click();

    link.remove();

    URL.revokeObjectURL(url);
}

function importarQuartosJSON(arquivo) {
    const leitor = new FileReader();

    leitor.onload = function (evento) {
        try {
            const quartos = JSON.parse(evento.target.result);

            if (!Array.isArray(quartos)) {
                Utils.mostrarToast("Arquivo inválido.", "erro");
                return;
            }

            Storage.salvarQuartos(quartos);

            carregarQuartos();

            Utils.mostrarToast("Quartos importados com sucesso.");
        } catch (erro) {
            Utils.mostrarToast("Erro ao importar arquivo.", "erro");
        }
    };

    leitor.readAsText(arquivo);
}