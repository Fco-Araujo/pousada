document.addEventListener("DOMContentLoaded", () => {
    iniciarConfiguracoes();
});

function iniciarConfiguracoes() {
    carregarConfiguracoes();

    const formConfiguracoes = document.getElementById("formConfiguracoes");
    const formPreferencias = document.getElementById("formPreferencias");

    if (formConfiguracoes) {
        formConfiguracoes.addEventListener("submit", salvarDadosPousada);
    }

    if (formPreferencias) {
        formPreferencias.addEventListener("submit", salvarPreferencias);
    }
}

function carregarConfiguracoes() {
    const config = Storage.getConfiguracoes();

    preencherCampo("nomePousada", config.nomePousada);
    preencherCampo("cnpjPousada", config.cnpj);
    preencherCampo("telefonePousada", config.telefone);
    preencherCampo("enderecoPousada", config.endereco);

    preencherCampo("valorHoraPadrao", config.valorHoraPadrao);
    preencherCampo("tempoMinimo", config.tempoMinimo || 1);
    preencherCampo("moedaSistema", config.moeda || "BRL");
}

function salvarDadosPousada(event) {
    event.preventDefault();

    const configAtual = Storage.getConfiguracoes();

    const novaConfig = {
        ...configAtual,
        nomePousada: document.getElementById("nomePousada").value.trim(),
        cnpj: document.getElementById("cnpjPousada").value.trim(),
        telefone: document.getElementById("telefonePousada").value.trim(),
        endereco: document.getElementById("enderecoPousada").value.trim()
    };

    Storage.salvarConfiguracoes(novaConfig);

    Utils.mostrarToast("Dados da pousada salvos com sucesso!");
}

function salvarPreferencias(event) {
    event.preventDefault();

    const configAtual = Storage.getConfiguracoes();

    const novaConfig = {
        ...configAtual,
        valorHoraPadrao: Number(document.getElementById("valorHoraPadrao").value),
        tempoMinimo: Number(document.getElementById("tempoMinimo").value),
        moeda: document.getElementById("moedaSistema").value
    };

    Storage.salvarConfiguracoes(novaConfig);

    Utils.mostrarToast("Preferências salvas com sucesso!");
}

function preencherCampo(id, valor) {
    const campo = document.getElementById(id);

    if (campo) {
        campo.value = valor || "";
    }
}