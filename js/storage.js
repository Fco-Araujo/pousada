const Storage = {
    chaves: {
    quartos: "pousada_quartos",
    hospedagens: "pousada_hospedagens",
    consumos: "pousada_consumos",
    configuracoes: "pousada_configuracoes",
    usuarios: "pousada_usuarios",
    movimentacoes: "pousada_movimentacoes"
},

    buscar(chave) {
        const dados = localStorage.getItem(chave);
        return dados ? JSON.parse(dados) : [];
    },

    salvar(chave, dados) {
        localStorage.setItem(chave, JSON.stringify(dados));
    },

    // =========================
    // QUARTOS
    // =========================

    getQuartos() {
        return this.buscar(this.chaves.quartos);
    },

    getQuarto(id) {
        return this.getQuartos().find(quarto => String(quarto.id) === String(id));
    },

    salvarQuartos(quartos) {
        this.salvar(this.chaves.quartos, quartos);
    },

    adicionarQuarto(quarto) {
        const quartos = this.getQuartos();
        quartos.push(quarto);
        this.salvarQuartos(quartos);
    },

    atualizarQuarto(id, dadosAtualizados) {
        const quartos = this.getQuartos().map(quarto => {
            if (String(quarto.id) === String(id)) {
                return {
                    ...quarto,
                    ...dadosAtualizados
                };
            }

            return quarto;
        });

        this.salvarQuartos(quartos);
    },

    excluirQuarto(id) {
        const quartos = this.getQuartos().filter(quarto => String(quarto.id) !== String(id));
        this.salvarQuartos(quartos);
    },

    atualizarStatusQuarto(id, status) {
        this.atualizarQuarto(id, { status });
    },

    // =========================
    // HOSPEDAGENS
    // =========================

    getHospedagens() {
        return this.buscar(this.chaves.hospedagens);
    },

    getHospedagem(id) {
        return this.getHospedagens().find(hospedagem => String(hospedagem.id) === String(id));
    },

    salvarHospedagens(hospedagens) {
        this.salvar(this.chaves.hospedagens, hospedagens);
    },

    adicionarHospedagem(hospedagem) {
        const hospedagens = this.getHospedagens();
        hospedagens.push(hospedagem);
        this.salvarHospedagens(hospedagens);
    },

    atualizarHospedagem(id, dadosAtualizados) {
        const hospedagens = this.getHospedagens().map(hospedagem => {
            if (String(hospedagem.id) === String(id)) {
                return {
                    ...hospedagem,
                    ...dadosAtualizados
                };
            }

            return hospedagem;
        });

        this.salvarHospedagens(hospedagens);
    },

    excluirHospedagem(id) {
        const hospedagens = this.getHospedagens().filter(hospedagem => String(hospedagem.id) !== String(id));
        this.salvarHospedagens(hospedagens);
    },

    getHospedagensAbertas() {
        return this.getHospedagens().filter(hospedagem => hospedagem.status === "aberta");
    },

    getHospedagensFinalizadas() {
        return this.getHospedagens().filter(hospedagem => hospedagem.status === "finalizada");
    },

    adicionarConsumoNaHospedagem(idHospedagem, consumo) {
        const hospedagem = this.getHospedagem(idHospedagem);

        if (!hospedagem) return;

        const consumos = hospedagem.consumos || [];

        consumos.push(consumo);

        this.atualizarHospedagem(idHospedagem, {
            consumos
        });
    },

    // =========================
    // CONSUMOS
    // =========================

    getConsumos() {
        return this.buscar(this.chaves.consumos);
    },

    getConsumo(id) {
        return this.getConsumos().find(consumo => String(consumo.id) === String(id));
    },

    salvarConsumos(consumos) {
        this.salvar(this.chaves.consumos, consumos);
    },

    adicionarConsumo(consumo) {
        const consumos = this.getConsumos();
        consumos.push(consumo);
        this.salvarConsumos(consumos);
    },

    atualizarConsumo(id, dadosAtualizados) {
        const consumos = this.getConsumos().map(consumo => {
            if (String(consumo.id) === String(id)) {
                return {
                    ...consumo,
                    ...dadosAtualizados
                };
            }

            return consumo;
        });

        this.salvarConsumos(consumos);
    },

    excluirConsumo(id) {
        const consumos = this.getConsumos().filter(consumo => String(consumo.id) !== String(id));
        this.salvarConsumos(consumos);
    },

    getConsumosAtivos() {
        return this.getConsumos().filter(consumo => consumo.status === "ativo");
    },

    // =========================
    // CONFIGURAÇÕES
    // =========================

    getConfiguracoes() {
        const dados = localStorage.getItem(this.chaves.configuracoes);

        return dados ? JSON.parse(dados) : {
            nomePousada: "Pousada Control",
            cnpj: "",
            telefone: "",
            endereco: "",
            valorHoraPadrao: 25,
            tempoMinimo: 1,
            moeda: "BRL"
        };
    },

    salvarConfiguracoes(configuracoes) {
        localStorage.setItem(
            this.chaves.configuracoes,
            JSON.stringify(configuracoes)
        );
    },

    // =========================
    // LIMPAR DEMO
    // =========================

    // =========================
// USUÁRIOS
// =========================

getUsuarios() {
    return this.buscar(this.chaves.usuarios);
},

getUsuario(id) {
    return this.getUsuarios().find(usuario => String(usuario.id) === String(id));
},

salvarUsuarios(usuarios) {
    this.salvar(this.chaves.usuarios, usuarios);
},

adicionarUsuario(usuario) {
    const usuarios = this.getUsuarios();
    usuarios.push(usuario);
    this.salvarUsuarios(usuarios);
},

atualizarUsuario(id, dadosAtualizados) {
    const usuarios = this.getUsuarios().map(usuario => {
        if (String(usuario.id) === String(id)) {
            return {
                ...usuario,
                ...dadosAtualizados
            };
        }

        return usuario;
    });

    this.salvarUsuarios(usuarios);
},

excluirUsuario(id) {
    const usuarios = this.getUsuarios().filter(usuario => String(usuario.id) !== String(id));
    this.salvarUsuarios(usuarios);
},

// =========================
// MOVIMENTAÇÕES
// =========================

getMovimentacoes() {
    return this.buscar(this.chaves.movimentacoes);
},

salvarMovimentacoes(movimentacoes) {
    this.salvar(this.chaves.movimentacoes, movimentacoes);
},

adicionarMovimentacao(movimentacao) {
    const movimentacoes = this.getMovimentacoes();
    movimentacoes.unshift(movimentacao);
    this.salvarMovimentacoes(movimentacoes);
},

limparMovimentacoes() {
    localStorage.removeItem(this.chaves.movimentacoes);
},

    limparTudo() {
        localStorage.removeItem(this.chaves.quartos);
        localStorage.removeItem(this.chaves.hospedagens);
        localStorage.removeItem(this.chaves.consumos);
        localStorage.removeItem(this.chaves.configuracoes);
    }
};