document.addEventListener("DOMContentLoaded", () => {
    iniciarConsumos();
});

let produtosFiltrados = [];

function iniciarConsumos() {
    garantirProdutosIniciais();
    configurarEventosConsumos();
    carregarProdutos();
}

function configurarEventosConsumos() {
    const btnNovoProduto = document.getElementById("btnNovoProduto");
    const btnFecharModalProduto = document.getElementById("btnFecharModalProduto");
    const formProduto = document.getElementById("formProduto");
    const buscarProduto = document.getElementById("buscarProduto");
    const modalProduto = document.getElementById("modalProduto");

    if (btnNovoProduto) {
        btnNovoProduto.addEventListener("click", abrirModalNovoProduto);
    }

    if (btnFecharModalProduto) {
        btnFecharModalProduto.addEventListener("click", () => fecharModal("modalProduto"));
    }

    if (formProduto) {
        formProduto.addEventListener("submit", salvarProduto);
    }

    if (buscarProduto) {
        buscarProduto.addEventListener("input", carregarProdutos);
    }

    if (modalProduto) {
        const btnCancelar = modalProduto.querySelector(".btn-secondary");

        if (btnCancelar) {
            btnCancelar.addEventListener("click", () => fecharModal("modalProduto"));
        }
    }
}

function garantirProdutosIniciais() {
    const produtos = Storage.getConsumos();

    if (produtos.length > 0) return;

    const produtosIniciais = [
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
        },
        {
            id: Utils.gerarId(),
            nome: "Salgado",
            categoria: "Alimentos",
            valor: 5,
            status: "ativo"
        }
    ];

    Storage.salvarConsumos(produtosIniciais);
}

function abrirModalNovoProduto() {
    limparFormularioProduto();

    const titulo = document.querySelector("#modalProduto .modal-header h2");

    if (titulo) {
        titulo.textContent = "Novo Produto";
    }

    abrirModal("modalProduto");
}

function limparFormularioProduto() {
    document.getElementById("produtoId").value = "";
    document.getElementById("nomeProduto").value = "";
    document.getElementById("categoriaProduto").value = "Bebidas";
    document.getElementById("valorProduto").value = "";
    document.getElementById("statusProduto").value = "ativo";
}

function salvarProduto(event) {
    event.preventDefault();

    const id = document.getElementById("produtoId").value;

    const produto = {
        id: id || Utils.gerarId(),
        nome: document.getElementById("nomeProduto").value.trim(),
        categoria: document.getElementById("categoriaProduto").value,
        valor: Number(document.getElementById("valorProduto").value),
        status: document.getElementById("statusProduto").value
    };

    const validacao = validarProduto(produto, id);

    if (!validacao.valido) {
        Utils.mostrarToast(validacao.mensagem, "erro");
        return;
    }

    if (id) {
        Storage.atualizarConsumo(id, produto);
        Utils.mostrarToast("Produto atualizado com sucesso!");
    } else {
        Storage.adicionarConsumo(produto);
        Utils.mostrarToast("Produto cadastrado com sucesso!");
    }

    fecharModal("modalProduto");
    carregarProdutos();
}

function validarProduto(produto, idAtual = null) {
    if (!produto.nome) {
        return {
            valido: false,
            mensagem: "Informe o nome do produto."
        };
    }

    if (!produto.categoria) {
        return {
            valido: false,
            mensagem: "Selecione a categoria do produto."
        };
    }

    if (!produto.valor || produto.valor <= 0) {
        return {
            valido: false,
            mensagem: "Informe um valor válido."
        };
    }

    if (!produto.status) {
        return {
            valido: false,
            mensagem: "Selecione o status do produto."
        };
    }

    const produtos = Storage.getConsumos();

    const nomeDuplicado = produtos.some(item => {
        return item.nome.toLowerCase() === produto.nome.toLowerCase()
            && String(item.id) !== String(idAtual);
    });

    if (nomeDuplicado) {
        return {
            valido: false,
            mensagem: "Já existe um produto cadastrado com esse nome."
        };
    }

    return {
        valido: true,
        mensagem: "OK"
    };
}

function carregarProdutos() {
    const tbody = document.getElementById("tbodyProdutos");

    if (!tbody) return;

    let produtos = Storage.getConsumos();

    const pesquisa = document.getElementById("buscarProduto")?.value.trim().toLowerCase() || "";

    if (pesquisa) {
        produtos = produtos.filter(produto => {
            return produto.nome.toLowerCase().includes(pesquisa)
                || produto.categoria.toLowerCase().includes(pesquisa)
                || produto.status.toLowerCase().includes(pesquisa);
        });
    }

    produtosFiltrados = produtos;

    atualizarCardsProdutos(produtos);

    if (produtos.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5">
                    Nenhum produto encontrado.
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = produtos
        .sort((a, b) => a.nome.localeCompare(b.nome))
        .map(criarLinhaProduto)
        .join("");
}

function criarLinhaProduto(produto) {
    return `
        <tr>
            <td>
                <div class="produto-nome">
                    <div class="produto-icon">
                        <i class="${iconeCategoria(produto.categoria)}"></i>
                    </div>

                    <span>${produto.nome}</span>
                </div>
            </td>

            <td>${produto.categoria}</td>

            <td>${Utils.formatarMoeda(produto.valor)}</td>

            <td>
                <span class="status ${produto.status === "ativo" ? "status-livre" : "status-manutencao"}">
                    ${produto.status === "ativo" ? "Ativo" : "Inativo"}
                </span>
            </td>

            <td>
                <div class="produto-actions">
                    <button class="btn-icon" onclick="editarProduto('${produto.id}')" title="Editar">
                        <i class="fa-solid fa-pen"></i>
                    </button>

                    <button class="btn-icon" onclick="alternarStatusProduto('${produto.id}')" title="Alterar status">
                        <i class="fa-solid fa-power-off"></i>
                    </button>

                    <button class="btn-icon" onclick="excluirProduto('${produto.id}')" title="Excluir">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `;
}

function editarProduto(id) {
    const produto = Storage.getConsumo(id);

    if (!produto) {
        Utils.mostrarToast("Produto não encontrado.", "erro");
        return;
    }

    const titulo = document.querySelector("#modalProduto .modal-header h2");

    if (titulo) {
        titulo.textContent = "Editar Produto";
    }

    document.getElementById("produtoId").value = produto.id;
    document.getElementById("nomeProduto").value = produto.nome;
    document.getElementById("categoriaProduto").value = produto.categoria;
    document.getElementById("valorProduto").value = produto.valor;
    document.getElementById("statusProduto").value = produto.status;

    abrirModal("modalProduto");
}

function excluirProduto(id) {
    const produto = Storage.getConsumo(id);

    if (!produto) {
        Utils.mostrarToast("Produto não encontrado.", "erro");
        return;
    }

    const usadoEmHospedagem = produtoUsadoEmHospedagem(id);

    if (usadoEmHospedagem) {
        Utils.mostrarToast(
            "Este produto já foi usado em uma hospedagem. Para preservar o histórico, altere o status para inativo.",
            "erro"
        );
        return;
    }

    const confirmar = Utils.confirmar(`Deseja realmente excluir ${produto.nome}?`);

    if (!confirmar) return;

    Storage.excluirConsumo(id);

    Utils.mostrarToast("Produto excluído com sucesso!");

    carregarProdutos();
}

function alternarStatusProduto(id) {
    const produto = Storage.getConsumo(id);

    if (!produto) {
        Utils.mostrarToast("Produto não encontrado.", "erro");
        return;
    }

    const novoStatus = produto.status === "ativo" ? "inativo" : "ativo";

    Storage.atualizarConsumo(id, {
        ...produto,
        status: novoStatus
    });

    Utils.mostrarToast(
        novoStatus === "ativo"
            ? "Produto ativado com sucesso!"
            : "Produto inativado com sucesso!"
    );

    carregarProdutos();
}

function produtoUsadoEmHospedagem(idProduto) {
    const hospedagens = Storage.getHospedagens();

    return hospedagens.some(hospedagem => {
        const consumos = hospedagem.consumos || [];

        return consumos.some(consumo => String(consumo.produtoId) === String(idProduto));
    });
}

function atualizarCardsProdutos(produtos) {
    const cardProdutos = document.getElementById("cardProdutos");
    const cardValorMedio = document.getElementById("cardValorMedio");

    if (cardProdutos) {
        cardProdutos.textContent = produtos.length;
    }

    if (cardValorMedio) {
        if (produtos.length === 0) {
            cardValorMedio.textContent = Utils.formatarMoeda(0);
            return;
        }

        const total = produtos.reduce((soma, produto) => soma + Number(produto.valor), 0);
        const media = total / produtos.length;

        cardValorMedio.textContent = Utils.formatarMoeda(media);
    }
}

function iconeCategoria(categoria) {
    const icones = {
        Bebidas: "fa-solid fa-bottle-water",
        Alimentos: "fa-solid fa-burger",
        Higiene: "fa-solid fa-soap",
        Outros: "fa-solid fa-box"
    };

    return icones[categoria] || "fa-solid fa-box";
}

function limparBuscaProdutos() {
    const buscarProduto = document.getElementById("buscarProduto");

    if (buscarProduto) {
        buscarProduto.value = "";
    }

    carregarProdutos();
}