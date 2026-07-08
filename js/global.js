document.addEventListener("DOMContentLoaded", () => {
    protegerPagina();
    marcarMenuAtivo();
});

function protegerPagina() {
    const paginaAtual = window.location.pathname.split("/").pop();

    if (paginaAtual === "login.html" || paginaAtual === "") {
        return;
    }

    const logado = localStorage.getItem("pousada_logado");

    if (logado !== "true") {
        window.location.href = "login.html";
    }
}

function marcarMenuAtivo() {
    const paginaAtual = window.location.pathname.split("/").pop();

    const links = document.querySelectorAll(".sidebar nav a");

    links.forEach(link => {
        const href = link.getAttribute("href");

        if (href === paginaAtual) {
            link.classList.add("active");
        } else {
            link.classList.remove("active");
        }
    });
}

function logout() {
    localStorage.removeItem("pousada_logado");
    window.location.href = "login.html";
}

function abrirModal(idModal) {
    const modal = document.getElementById(idModal);

    if (modal) {
        modal.classList.add("active");
    }
}

function fecharModal(idModal) {
    const modal = document.getElementById(idModal);

    if (modal) {
        modal.classList.remove("active");
    }
}

function fecharModaisAoClicarFora() {
    const modais = document.querySelectorAll(".modal");

    modais.forEach(modal => {
        modal.addEventListener("click", event => {
            if (event.target === modal) {
                modal.classList.remove("active");
            }
        });
    });
}

const btnLogout = document.getElementById("btnLogout");

if (btnLogout) {

    btnLogout.addEventListener("click", () => {

        const confirmar = confirm("Deseja realmente sair do sistema?");

        if (!confirmar) return;

        localStorage.removeItem("usuarioLogado");

        window.location.href = "login.html";

    });

}

function registrarMovimentacao(tipo, descricao, detalhes = "") {
    if (!Storage || !Storage.adicionarMovimentacao) return;

    const movimentacao = {
        id: Utils.gerarId(),
        tipo,
        usuario: localStorage.getItem("pousada_usuario_nome") || "Administrador",
        descricao,
        detalhes,
        data: Utils.dataAtual(),
        hora: Utils.horaAtual(),
        criadoEm: new Date().toISOString()
    };

    Storage.adicionarMovimentacao(movimentacao);
}

fecharModaisAoClicarFora();