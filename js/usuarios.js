document.addEventListener("DOMContentLoaded", () => {
    iniciarUsuarios();
});

let usuariosFiltrados = [];

function iniciarUsuarios() {
    garantirUsuariosIniciais();
    configurarEventosUsuarios();
    carregarUsuarios();
}

function configurarEventosUsuarios() {
    const btnNovoUsuario = document.getElementById("btnNovoUsuario");
    const btnFecharModalUsuario = document.getElementById("btnFecharModalUsuario");
    const btnCancelarUsuario = document.getElementById("btnCancelarUsuario");
    const formUsuario = document.getElementById("formUsuario");

    const buscarUsuario = document.getElementById("buscarUsuario");
    const filtroPerfilUsuario = document.getElementById("filtroPerfilUsuario");
    const filtroStatusUsuario = document.getElementById("filtroStatusUsuario");

    if (btnNovoUsuario) {
        btnNovoUsuario.addEventListener("click", abrirModalNovoUsuario);
    }

    if (btnFecharModalUsuario) {
        btnFecharModalUsuario.addEventListener("click", () => fecharModal("modalUsuario"));
    }

    if (btnCancelarUsuario) {
        btnCancelarUsuario.addEventListener("click", () => fecharModal("modalUsuario"));
    }

    if (formUsuario) {
        formUsuario.addEventListener("submit", salvarUsuario);
    }

    if (buscarUsuario) {
        buscarUsuario.addEventListener("input", carregarUsuarios);
    }

    if (filtroPerfilUsuario) {
        filtroPerfilUsuario.addEventListener("change", carregarUsuarios);
    }

    if (filtroStatusUsuario) {
        filtroStatusUsuario.addEventListener("change", carregarUsuarios);
    }
}

function garantirUsuariosIniciais() {
    const usuarios = Storage.getUsuarios();

    if (usuarios.length > 0) return;

    const usuariosIniciais = [
        {
            id: Utils.gerarId(),
            nome: "Administrador",
            login: "admin",
            senha: "123",
            perfil: "administrador",
            status: "ativo",
            ultimoAcesso: "Hoje",
            criadoEm: new Date().toISOString()
        },
        {
            id: Utils.gerarId(),
            nome: "Funcionário Padrão",
            login: "funcionario",
            senha: "123",
            perfil: "padrao",
            status: "ativo",
            ultimoAcesso: "-",
            criadoEm: new Date().toISOString()
        }
    ];

    Storage.salvarUsuarios(usuariosIniciais);
}

function abrirModalNovoUsuario() {
    limparFormularioUsuario();

    const titulo = document.getElementById("tituloModalUsuario");

    if (titulo) {
        titulo.textContent = "Novo Usuário";
    }

    abrirModal("modalUsuario");
}

function limparFormularioUsuario() {
    document.getElementById("usuarioId").value = "";
    document.getElementById("nomeUsuario").value = "";
    document.getElementById("loginUsuario").value = "";
    document.getElementById("perfilUsuario").value = "padrao";
    document.getElementById("senhaUsuario").value = "";
    document.getElementById("statusUsuario").value = "ativo";
}

function salvarUsuario(event) {
    event.preventDefault();

    const id = document.getElementById("usuarioId").value;

    const usuario = {
        id: id || Utils.gerarId(),
        nome: document.getElementById("nomeUsuario").value.trim(),
        login: document.getElementById("loginUsuario").value.trim(),
        perfil: document.getElementById("perfilUsuario").value,
        senha: document.getElementById("senhaUsuario").value.trim(),
        status: document.getElementById("statusUsuario").value,
        ultimoAcesso: id
            ? (Storage.getUsuario(id)?.ultimoAcesso || "-")
            : "-",
        criadoEm: id
            ? (Storage.getUsuario(id)?.criadoEm || new Date().toISOString())
            : new Date().toISOString(),
        atualizadoEm: new Date().toISOString()
    };

    const validacao = validarUsuario(usuario, id);

    if (!validacao.valido) {
        Utils.mostrarToast(validacao.mensagem, "erro");
        return;
    }

    if (id) {
        const usuarioAtual = Storage.getUsuario(id);

        const dadosAtualizados = {
            ...usuario,
            senha: usuario.senha || usuarioAtual.senha
        };

        Storage.atualizarUsuario(id, dadosAtualizados);

        registrarMovimentacaoUsuario(
            "usuario",
            `Usuário atualizado: ${usuario.nome}`,
            `Perfil: ${textoPerfilUsuario(usuario.perfil)} | Status: ${textoStatusUsuario(usuario.status)}`
        );

        Utils.mostrarToast("Usuário atualizado com sucesso!");
    } else {
        Storage.adicionarUsuario(usuario);

        registrarMovimentacaoUsuario(
            "usuario",
            `Novo usuário cadastrado: ${usuario.nome}`,
            `Perfil: ${textoPerfilUsuario(usuario.perfil)}`
        );

        Utils.mostrarToast("Usuário cadastrado com sucesso!");
    }

    fecharModal("modalUsuario");
    carregarUsuarios();
}

function validarUsuario(usuario, idAtual = null) {
    if (!usuario.nome) {
        return {
            valido: false,
            mensagem: "Informe o nome do usuário."
        };
    }

    if (!usuario.login) {
        return {
            valido: false,
            mensagem: "Informe o login do usuário."
        };
    }

    if (!usuario.perfil) {
        return {
            valido: false,
            mensagem: "Selecione o perfil do usuário."
        };
    }

    if (!idAtual && !usuario.senha) {
        return {
            valido: false,
            mensagem: "Informe a senha do usuário."
        };
    }

    if (usuario.senha && usuario.senha.length < 3) {
        return {
            valido: false,
            mensagem: "A senha deve ter pelo menos 3 caracteres."
        };
    }

    if (!usuario.status) {
        return {
            valido: false,
            mensagem: "Selecione o status do usuário."
        };
    }

    const usuarios = Storage.getUsuarios();

    const loginDuplicado = usuarios.some(item => {
        return item.login.toLowerCase() === usuario.login.toLowerCase()
            && String(item.id) !== String(idAtual);
    });

    if (loginDuplicado) {
        return {
            valido: false,
            mensagem: "Já existe um usuário com esse login."
        };
    }

    return {
        valido: true,
        mensagem: "OK"
    };
}
function carregarUsuarios() {
    const tbody = document.getElementById("tbodyUsuarios");

    if (!tbody) return;

    let usuarios = Storage.getUsuarios();

    const pesquisa = document.getElementById("buscarUsuario")?.value.trim().toLowerCase() || "";
    const perfil = document.getElementById("filtroPerfilUsuario")?.value || "";
    const status = document.getElementById("filtroStatusUsuario")?.value || "";

    if (pesquisa) {
        usuarios = usuarios.filter(usuario => {
            return usuario.nome.toLowerCase().includes(pesquisa)
                || usuario.login.toLowerCase().includes(pesquisa)
                || textoPerfilUsuario(usuario.perfil).toLowerCase().includes(pesquisa)
                || textoStatusUsuario(usuario.status).toLowerCase().includes(pesquisa);
        });
    }

    if (perfil) {
        usuarios = usuarios.filter(usuario => usuario.perfil === perfil);
    }

    if (status) {
        usuarios = usuarios.filter(usuario => usuario.status === status);
    }

    usuariosFiltrados = usuarios;

    atualizarCardsUsuarios(usuarios);

    if (usuarios.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6">Nenhum usuário encontrado.</td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = usuarios
        .sort((a, b) => a.nome.localeCompare(b.nome))
        .map(criarLinhaUsuario)
        .join("");
}

function criarLinhaUsuario(usuario) {
    return `
        <tr>
            <td>
                <div class="usuario-info">
                    <div class="usuario-avatar">
                        ${obterIniciaisUsuario(usuario.nome)}
                    </div>

                    <div>
                        <h4>${usuario.nome}</h4>
                        <span>Cadastrado em ${formatarDataHoraCurtaUsuario(usuario.criadoEm)}</span>
                    </div>
                </div>
            </td>

            <td>${usuario.login}</td>

            <td>
                ${criarBadgePerfilUsuario(usuario.perfil)}
            </td>

            <td>
                <span class="status ${usuario.status === "ativo" ? "status-livre" : "status-manutencao"}">
                    ${textoStatusUsuario(usuario.status)}
                </span>
            </td>

            <td>${usuario.ultimoAcesso || "-"}</td>

            <td>
                <div class="usuario-actions">
                    <button class="btn-icon" onclick="editarUsuario('${usuario.id}')" title="Editar">
                        <i class="fa-solid fa-pen"></i>
                    </button>

                    <button class="btn-icon" onclick="alternarStatusUsuario('${usuario.id}')" title="Ativar/Inativar">
                        <i class="fa-solid fa-power-off"></i>
                    </button>

                    <button class="btn-icon" onclick="excluirUsuario('${usuario.id}')" title="Excluir">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `;
}

function atualizarCardsUsuarios(usuarios) {
    const total = usuarios.length;
    const admins = usuarios.filter(usuario => usuario.perfil === "administrador").length;
    const padrao = usuarios.filter(usuario => usuario.perfil === "padrao").length;
    const ativos = usuarios.filter(usuario => usuario.status === "ativo").length;

    preencherCardUsuario("cardTotalUsuarios", total);
    preencherCardUsuario("cardAdmins", admins);
    preencherCardUsuario("cardPadrao", padrao);
    preencherCardUsuario("cardAtivos", ativos);
}

function preencherCardUsuario(id, valor) {
    const elemento = document.getElementById(id);

    if (elemento) {
        elemento.textContent = valor;
    }
}

function editarUsuario(id) {
    const usuario = Storage.getUsuario(id);

    if (!usuario) {
        Utils.mostrarToast("Usuário não encontrado.", "erro");
        return;
    }

    const titulo = document.getElementById("tituloModalUsuario");

    if (titulo) {
        titulo.textContent = "Editar Usuário";
    }

    document.getElementById("usuarioId").value = usuario.id;
    document.getElementById("nomeUsuario").value = usuario.nome;
    document.getElementById("loginUsuario").value = usuario.login;
    document.getElementById("perfilUsuario").value = usuario.perfil;
    document.getElementById("senhaUsuario").value = "";
    document.getElementById("statusUsuario").value = usuario.status;

    abrirModal("modalUsuario");
}

function alternarStatusUsuario(id) {
    const usuario = Storage.getUsuario(id);

    if (!usuario) {
        Utils.mostrarToast("Usuário não encontrado.", "erro");
        return;
    }

    const novoStatus = usuario.status === "ativo" ? "inativo" : "ativo";

    Storage.atualizarUsuario(id, {
        ...usuario,
        status: novoStatus,
        atualizadoEm: new Date().toISOString()
    });

    registrarMovimentacaoUsuario(
        "usuario",
        `Status do usuário alterado: ${usuario.nome}`,
        `Novo status: ${textoStatusUsuario(novoStatus)}`
    );

    Utils.mostrarToast(
        novoStatus === "ativo"
            ? "Usuário ativado com sucesso!"
            : "Usuário inativado com sucesso!"
    );

    carregarUsuarios();
}
function excluirUsuario(id) {
    const usuario = Storage.getUsuario(id);

    if (!usuario) {
        Utils.mostrarToast("Usuário não encontrado.", "erro");
        return;
    }

    const usuarios = Storage.getUsuarios();

    const administradoresAtivos = usuarios.filter(item => {
        return item.perfil === "administrador" && item.status === "ativo";
    });

    if (
        usuario.perfil === "administrador" &&
        usuario.status === "ativo" &&
        administradoresAtivos.length <= 1
    ) {
        Utils.mostrarToast(
            "Não é possível excluir o único administrador ativo.",
            "erro"
        );
        return;
    }

    const confirmar = Utils.confirmar(
        `Deseja realmente excluir o usuário ${usuario.nome}?`
    );

    if (!confirmar) return;

    Storage.excluirUsuario(id);

    registrarMovimentacaoUsuario(
        "usuario",
        `Usuário excluído: ${usuario.nome}`,
        `Login: ${usuario.login}`
    );

    Utils.mostrarToast("Usuário excluído com sucesso!");

    carregarUsuarios();
}

function criarBadgePerfilUsuario(perfil) {
    if (perfil === "administrador") {
        return `
            <span class="badge-admin">
                <i class="fa-solid fa-user-shield"></i>
                Administrador
            </span>
        `;
    }

    return `
        <span class="badge-user">
            <i class="fa-solid fa-user"></i>
            Padrão
        </span>
    `;
}

function textoPerfilUsuario(perfil) {
    const perfis = {
        administrador: "Administrador",
        padrao: "Padrão"
    };

    return perfis[perfil] || perfil;
}

function textoStatusUsuario(status) {
    const statusMap = {
        ativo: "Ativo",
        inativo: "Inativo"
    };

    return statusMap[status] || status;
}

function obterIniciaisUsuario(nome) {
    if (!nome) return "?";

    const partes = nome.trim().split(" ");

    if (partes.length === 1) {
        return partes[0].substring(0, 2).toUpperCase();
    }

    return `${partes[0][0]}${partes[partes.length - 1][0]}`.toUpperCase();
}

function formatarDataHoraCurtaUsuario(dataIso) {
    if (!dataIso) return "-";

    const data = new Date(dataIso);

    if (isNaN(data.getTime())) return "-";

    return data.toLocaleDateString("pt-BR");
}

function limparFiltrosUsuarios() {
    const buscarUsuario = document.getElementById("buscarUsuario");
    const filtroPerfilUsuario = document.getElementById("filtroPerfilUsuario");
    const filtroStatusUsuario = document.getElementById("filtroStatusUsuario");

    if (buscarUsuario) buscarUsuario.value = "";
    if (filtroPerfilUsuario) filtroPerfilUsuario.value = "";
    if (filtroStatusUsuario) filtroStatusUsuario.value = "";

    carregarUsuarios();
}

function registrarMovimentacaoUsuario(tipo, descricao, detalhes = "") {
    if (!Storage.adicionarMovimentacao) return;

    const movimentacao = {
        id: Utils.gerarId(),
        tipo,
        usuario: obterUsuarioAtualNome(),
        descricao,
        detalhes,
        data: Utils.dataAtual(),
        hora: Utils.horaAtual(),
        criadoEm: new Date().toISOString()
    };

    Storage.adicionarMovimentacao(movimentacao);
}

function obterUsuarioAtualNome() {
    const usuarioLogado = localStorage.getItem("pousada_usuario_nome");

    if (usuarioLogado) {
        return usuarioLogado;
    }

    return "Administrador";
}
function exportarUsuariosJSON() {
    const usuarios = usuariosFiltrados.length > 0
        ? usuariosFiltrados
        : Storage.getUsuarios();

    const conteudo = JSON.stringify(usuarios, null, 2);

    const blob = new Blob([conteudo], {
        type: "application/json"
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = "usuarios-pousada.json";

    document.body.appendChild(link);

    link.click();

    link.remove();

    URL.revokeObjectURL(url);

    Utils.mostrarToast("Usuários exportados com sucesso!");
}

function resetarUsuariosDemo() {
    const confirmar = Utils.confirmar(
        "Deseja resetar os usuários da demonstração? Os usuários cadastrados serão apagados."
    );

    if (!confirmar) return;

    Storage.salvarUsuarios([]);

    garantirUsuariosIniciais();

    registrarMovimentacaoUsuario(
        "usuario",
        "Usuários da demonstração restaurados",
        "A lista de usuários voltou ao padrão inicial."
    );

    carregarUsuarios();

    Utils.mostrarToast("Usuários restaurados com sucesso!");
}

function usuarioPodeAcessarRelatorios(usuario) {
    if (!usuario) return false;

    return usuario.perfil === "administrador";
}

function usuarioPodeAcessarConfiguracoes(usuario) {
    if (!usuario) return false;

    return usuario.perfil === "administrador";
}

function usuarioPodeGerenciarUsuarios(usuario) {
    if (!usuario) return false;

    return usuario.perfil === "administrador";
}

function obterResumoUsuarios() {
    const usuarios = Storage.getUsuarios();

    return {
        total: usuarios.length,
        administradores: usuarios.filter(usuario => usuario.perfil === "administrador").length,
        padrao: usuarios.filter(usuario => usuario.perfil === "padrao").length,
        ativos: usuarios.filter(usuario => usuario.status === "ativo").length,
        inativos: usuarios.filter(usuario => usuario.status === "inativo").length
    };
}

function buscarUsuarioPorLogin(login) {
    if (!login) return null;

    const usuarios = Storage.getUsuarios();

    return usuarios.find(usuario => {
        return usuario.login.toLowerCase() === login.toLowerCase();
    });
}

function atualizarUltimoAcessoUsuario(login) {
    const usuario = buscarUsuarioPorLogin(login);

    if (!usuario) return;

    const agora = new Date();

    const ultimoAcesso = agora.toLocaleDateString("pt-BR") + " " +
        agora.toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit"
        });

    Storage.atualizarUsuario(usuario.id, {
        ...usuario,
        ultimoAcesso
    });
}

function validarLoginUsuario(login, senha) {
    const usuario = buscarUsuarioPorLogin(login);

    if (!usuario) {
        return {
            valido: false,
            mensagem: "Usuário não encontrado."
        };
    }

    if (usuario.status !== "ativo") {
        return {
            valido: false,
            mensagem: "Este usuário está inativo."
        };
    }

    if (usuario.senha !== senha) {
        return {
            valido: false,
            mensagem: "Senha incorreta."
        };
    }

    return {
        valido: true,
        usuario
    };
}