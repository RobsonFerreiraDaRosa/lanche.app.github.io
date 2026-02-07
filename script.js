// ===== CONFIGURAÇÕES =====
const STORAGE_KEY = 'carrinho_tribo';
const STATE_KEY = 'estado_tribo';

// ===== CONFIGURAÇÃO SUPABASE =====
const SUPABASE_URL = 'https://iezyvgvwmrbizsfpewdj.supabase.co'; // 🔧 ALTERE: Coloque sua URL do Supabase
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imllenl2Z3Z3bXJiaXpzZnBld2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0NTk2NjEsImV4cCI6MjA4NjAzNTY2MX0.PnlxrstIPiLR_5pfVt1yuUB2CELzkGW_n09aYI508Xk'; // 🔧 ALTERE: Coloque sua chave anônima

// ===== ESTADO GLOBAL =====
let carrinho = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
let estado = JSON.parse(localStorage.getItem(STATE_KEY)) || {bloqueado: false, pagamento: null};
let carrinhoBloqueado = estado.bloqueado;
let pagamentoSelecionado = estado.pagamento;

// ===== DADOS DO SISTEMA =====
let sistemaConfig = {
    nome: "TRIBO BAR",
    whatsapp: "5551981894966"
};

let pixConfig = {
    chave: "43979611000136",
    nomeBeneficiario: "TRIBO BAR",
    cidade: "LAJEADO",
    usarCodigoTransferencia: true,
    prefixoCodigo: "TRB",
    codigoAtual: 1
};

let menu = {};

// ===== FUNÇÕES DE BANCO DE DADOS =====
// ===== CARREGAR DADOS DO SISTEMA (CORRIGIDO) =====
async function carregarDadosSistema() {
    console.log("🔄 Carregando dados do sistema...");
    
    try {
        // Tentar carregar do Supabase
        if (window.SupabaseDB) {
            const dados = await window.SupabaseDB.carregarDadosParaPaginaPrincipal();
            
            if (dados && dados.sistema) {
                sistemaConfig = dados.sistema;
                pixConfig = dados.pix;
                menu = dados.menu;
                
                console.log("✅ Dados carregados do Supabase:");
                console.log("- Sistema:", sistemaConfig.nome);
                console.log("- WhatsApp:", sistemaConfig.whatsapp);
                console.log("- Categorias:", Object.keys(menu).length);
                
                // Atualizar título da página
                const tituloEl = document.querySelector('.titulo');
                if (tituloEl) {
                    tituloEl.textContent = sistemaConfig.nome;
                }
                
                return true;
            }
        }
        
        // Se Supabase falhar, usar dados padrão
        console.warn("⚠️ Usando dados padrão (fallback)");
        return carregarDadosPadrao();
        
    } catch (error) {
        console.error("❌ Erro ao carregar dados:", error);
        return carregarDadosPadrao();
    }
}

function carregarDadosPadrao() {
    sistemaConfig = {
        nome: "TRIBO BAR",
        whatsapp: "5551981894966"
    };
    
    pixConfig = {
        chave: "43979611000136",
        nomeBeneficiario: "TRIBO BAR",
        cidade: "LAJEADO",
        usarCodigoTransferencia: true,
        prefixoCodigo: "TRB",
        codigoAtual: 1
    };
    
    menu = {
        Salgados: [
            { id: 1, nome: 'Pastel Res', preco: 13, desc: 'Molho, frango, cebola e mussarela', obs: false },
            { id: 2, nome: 'Pastel Frango', preco: 13, desc: 'Molho, frango, cebola e mussarela', obs: false }
        ],
        Doces: [
            { id: 3, nome: 'Mini Pizza Chocolate Preto', preco: 13, desc: 'Chocolate ao Leite', obs: false }
        ],
        Bebidas: [
            { id: 4, nome: 'Pitchulinha Fruki Guaraná 200ml', preco: 2.5, desc: 'Guaraná 200ml', obs: false }
        ]
    };
    
    // Atualizar título da página
    const tituloEl = document.querySelector('.titulo');
    if (tituloEl) {
        tituloEl.textContent = sistemaConfig.nome;
    }
    
    console.log("✅ Dados padrão carregados");
    return false; // Indica que estamos usando fallback
}

// ===== INICIALIZAÇÃO (CORRIGIDA) =====
document.addEventListener('DOMContentLoaded', async () => {
    console.log("🚀 Iniciando sistema Tribo Bar...");
    
    // 1. Carregar dados do sistema
    await carregarDadosSistema();
    
    // 2. Configurar eventos de telefone
    if (telefoneEl) {
        telefoneEl.addEventListener('input', () => formatarTelefone(telefoneEl));
        
        telefoneEl.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace') {
                setTimeout(() => formatarTelefone(telefoneEl), 10);
            }
        });
    }
    
    // 3. Criar menu
    criarMenu();
    atualizarCarrinho();
    renderizarPagamentos();
    
    if (telefoneEl && telefoneEl.value) {
        formatarTelefone(telefoneEl);
    }
    
    // 4. Verificar atualizações periódicas
    setInterval(async () => {
        console.log("🔄 Verificando atualizações...");
        await carregarDadosSistema();
        criarMenu();
    }, 30000); // A cada 30 segundos
    
    console.log("✅ Sistema carregado com sucesso!");
});

function carregarDadosPadrao() {
    // Dados padrão de fallback
    sistemaConfig = {
        nome: "TRIBO BAR",
        whatsapp: "5551981894966"
    };
    
    pixConfig = {
        chave: "43979611000136",
        nomeBeneficiario: "TRIBO BAR",
        cidade: "LAJEADO",
        usarCodigoTransferencia: true,
        prefixoCodigo: "TRB",
        codigoAtual: 1
    };
    
    menu = {
        Salgados: [
            { id: 1, nome: 'Pastel Res', preco: 13, desc: 'Molho, frango, cebola e mussarela', obs: false },
            { id: 2, nome: 'Pastel Frango', preco: 13, desc: 'Molho, frango, cebola e mussarela', obs: false }
        ],
        Doces: [
            { id: 3, nome: 'Mini Pizza Chocolate Preto', preco: 13, desc: 'Chocolate ao Leite', obs: false }
        ],
        Bebidas: [
            { id: 4, nome: 'Pitchulinha Fruki Guaraná 200ml', preco: 2.5, desc: 'Guaraná 200ml', obs: false }
        ]
    };
    
    console.log("⚠️ Usando dados padrão");
    return false;
}

// ===== PAGAMENTOS =====
const pagamentos = {
    dinheiro: {titulo: 'DINHEIRO', mensagem: 'Pagamento no caixa'},
    pix: {titulo: 'PIX', mensagem: 'Pague via PIX antes de enviar'}
};

// ===== ELEMENTOS DOM =====
const telefoneEl = document.getElementById('telefone');
const nomeClienteEl = document.getElementById('nomeCliente');
const menuDiv = document.getElementById('menu');
const listaEl = document.getElementById('lista');
const totalSpan = document.getElementById('total');
const btnPagarEl = document.getElementById('btnPagar');
const btnEditarEl = document.getElementById('btnEditar');
const pagamentosDiv = document.getElementById('pagamentos');
const finalizarEl = document.getElementById('finalizar');

// ===== FUNÇÕES DE UTILIDADE =====
function salvar() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(carrinho));
    localStorage.setItem(STATE_KEY, JSON.stringify({
        bloqueado: carrinhoBloqueado,
        pagamento: pagamentoSelecionado
    }));
}

// ===== FUNÇÃO PARA GERAR CÓDIGO DE TRANSFERÊNCIA =====
function gerarCodigoTransferencia() {
    if (!pixConfig.usarCodigoTransferencia) {
        return ""; // Retorna vazio se não estiver configurado para usar
    }
    
    // Gera código no formato: TRB001, TRB002, etc.
    const codigo = `${pixConfig.prefixoCodigo}${pixConfig.codigoAtual.toString().padStart(3, '0')}`;
    
    // Incrementa para o próximo pedido
    pixConfig.codigoAtual++;
    
    // Salvar no localStorage (temporário - em produção salvar no Supabase)
    localStorage.setItem('codigo_transferencia_tribo', pixConfig.codigoAtual.toString());
    
    // Limita a 20 caracteres (limite do padrão PIX)
    return codigo.substring(0, 20);
}

// ===== FUNÇÃO PARA CALCULAR CRC16 =====
function calcularCRC16(str) {
    let crc = 0xFFFF;
    for (let i = 0; i < str.length; i++) {
        crc ^= str.charCodeAt(i) << 8;
        for (let j = 0; j < 8; j++) {
            if (crc & 0x8000) {
                crc = (crc << 1) ^ 0x1021;
            } else {
                crc = crc << 1;
            }
            crc &= 0xFFFF;
        }
    }
    return crc.toString(16).toUpperCase().padStart(4, '0');
}

// ===== IDENTIFICAÇÃO AUTOMÁTICA DE CHAVE PIX =====
function identificarTipoChavePIX(chave) {
    const chaveLimpa = chave.replace(/\s+/g, '');
    
    if (/^\d{11}$/.test(chaveLimpa)) {
        const cpfFormatado = chaveLimpa.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
        return {
            tipo: "CPF",
            chaveBruta: chaveLimpa,
            chaveFormatada: cpfFormatado,
            chavePIX: chaveLimpa,
            valida: true,
            descricao: `CPF: ${cpfFormatado}`
        };
    }
    
    if (/^\d{14}$/.test(chaveLimpa)) {
        const cnpjFormatado = chaveLimpa.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
        return {
            tipo: "CNPJ",
            chaveBruta: chaveLimpa,
            chaveFormatada: cnpjFormatado,
            chavePIX: chaveLimpa,
            valida: true,
            descricao: `CNPJ: ${cnpjFormatado}`
        };
    }
    
    const regexTelefone = /^(?:\+55)?(\d{10,11})$/;
    const matchTelefone = chaveLimpa.match(regexTelefone);
    if (matchTelefone) {
        const numero = matchTelefone[1];
        const ddd = numero.substring(0, 2);
        const resto = numero.substring(2);
        const telefoneFormatado = `(${ddd}) ${resto.length === 8 ? resto.replace(/(\d{4})(\d{4})/, '$1-$2') : resto.replace(/(\d{5})(\d{4})/, '$1-$2')}`;
        
        return {
            tipo: "Telefone",
            chaveBruta: chaveLimpa,
            chaveFormatada: telefoneFormatado,
            chavePIX: '+55' + numero,
            valida: true,
            descricao: `Telefone: ${telefoneFormatado}`
        };
    }
    
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (regexEmail.test(chaveLimpa)) {
        const email = chaveLimpa.toLowerCase();
        return {
            tipo: "Email",
            chaveBruta: chaveLimpa,
            chaveFormatada: email,
            chavePIX: email,
            valida: true,
            descricao: `Email: ${email}`
        };
    }
    
    const regexUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (regexUUID.test(chaveLimpa)) {
        const uuid = chaveLimpa.toLowerCase();
        return {
            tipo: "Chave Aleatória",
            chaveBruta: chaveLimpa,
            chaveFormatada: uuid,
            chavePIX: uuid,
            valida: true,
            descricao: `Chave Aleatória: ${uuid.substring(0, 8)}...`
        };
    }
    
    if (/^[0-9a-f]{32}$/i.test(chaveLimpa)) {
        const evp = chaveLimpa.toLowerCase();
        return {
            tipo: "EVP",
            chaveBruta: chaveLimpa,
            chaveFormatada: evp,
            chavePIX: evp,
            valida: true,
            descricao: `EVP: ${evp.substring(0, 8)}...`
        };
    }
    
    return {
        tipo: "Desconhecido",
        chaveBruta: chave,
        chaveFormatada: chave,
        chavePIX: chave,
        valida: false,
        descricao: `Chave inválida: ${chave}`
    };
}

// ===== FUNÇÃO GERAR PIX COMPLETA COM CÓDIGO DE TRANSFERÊNCIA =====
function gerarPixCompleto(chaveIdentificada, valorReais, codigoTransferencia = "") {
    const valorFormatado = valorReais.toFixed(2);
    const tamanhoValor = valorFormatado.length.toString().padStart(2, '0');
    
    const campo00 = "000201";
    const gui = "0014BR.GOV.BCB.PIX";
    const chaveComTamanho = "01" + chaveIdentificada.chavePIX.length.toString().padStart(2, '0') + chaveIdentificada.chavePIX;
    const tamanhoCampo26 = (gui.length + chaveComTamanho.length).toString().padStart(2, '0');
    const campo26 = "26" + tamanhoCampo26 + gui + chaveComTamanho;
    const campo52 = "52040000";
    const campo53 = "5303986";
    const campo54 = "54" + tamanhoValor + valorFormatado;
    const campo58 = "5802BR";
    const nomeLimitado = pixConfig.nomeBeneficiario.substring(0, 25);
    const campo59 = "59" + nomeLimitado.length.toString().padStart(2, '0') + nomeLimitado;
    const cidadeLimitada = pixConfig.cidade.substring(0, 15);
    const campo60 = "60" + cidadeLimitada.length.toString().padStart(2, '0') + cidadeLimitada;
    
    // 🔹 CAMPO 62: CÓDIGO DE TRANSFERÊNCIA (OPCIONAL)
    let campo62 = "";
    if (codigoTransferencia && codigoTransferencia.trim() !== "") {
        // Formato: 62 + tamanho + 05 + tamanho_codigo + codigo
        const codigo = codigoTransferencia.substring(0, 20); // Limita a 20 caracteres
        const tamanhoCodigo = codigo.length.toString().padStart(2, '0');
        const subcampo05 = "05" + tamanhoCodigo + codigo;
        const tamanhoCampo62 = subcampo05.length.toString().padStart(2, '0');
        campo62 = "62" + tamanhoCampo62 + subcampo05;
    } else {
        campo62 = "62070503***"; // Campo 62 padrão sem referência
    }
    
    const payload = campo00 + campo26 + campo52 + campo53 + campo54 + campo58 + campo59 + campo60 + campo62;
    const payloadComCRC = payload + "6304";
    const crc16 = calcularCRC16(payloadComCRC);
    
    const codigoFinal = payloadComCRC + crc16;
    
    return {
        codigo: codigoFinal,
        tipoChave: chaveIdentificada.tipo,
        chaveFormatada: chaveIdentificada.chaveFormatada,
        valorReais: valorReais,
        valorFormatado: valorFormatado,
        crc16: crc16,
        tamanho: codigoFinal.length,
        campo54: campo54,
        codigoTransferencia: codigoTransferencia || "Não informado"
    };
}

// ===== GERAR CÓDIGO PIX COM CÓDIGO DE TRANSFERÊNCIA =====
function gerarCodigoPixCompleto(valorReais) {
    try {
        const chaveIdentificada = identificarTipoChavePIX(pixConfig.chave);
        
        if (!chaveIdentificada.valida) {
            throw new Error(`Chave PIX inválida: ${pixConfig.chave}. Tipo: ${chaveIdentificada.tipo}`);
        }
        
        // Gera código de transferência se configurado
        const codigoTransferencia = pixConfig.usarCodigoTransferencia ? 
                                    gerarCodigoTransferencia() : "";
        
        return gerarPixCompleto(chaveIdentificada, valorReais, codigoTransferencia);
        
    } catch (error) {
        console.error("❌ Erro ao gerar PIX:", error);
        alert(`Erro ao gerar PIX: ${error.message}`);
        throw error;
    }
}

// ===== FORMATADOR DE TELEFONE =====
function formatarTelefone(input) {
    let valor = input.value.replace(/\D/g, '');
    if (valor.length > 11) valor = valor.substring(0, 11);
    
    let valorFormatado = '';
    if (valor.length > 0) valorFormatado = '(' + valor.substring(0, 2);
    if (valor.length > 2) valorFormatado += ') ' + valor.substring(2, 7);
    if (valor.length > 7) valorFormatado += '-' + valor.substring(7, 11);
    
    input.value = valorFormatado;
}

function obterTelefoneNumerico(telefoneFormatado) {
    return telefoneFormatado.replace(/\D/g, '').substring(0, 11);
}

// ===== RENDERIZAÇÃO DINÂMICA DO MENU =====
function criarMenu() {
    if (!menuDiv) return;
    
    // Limpar menu atual
    menuDiv.innerHTML = '';
    
    // Atualizar título do sistema
    const tituloEl = document.querySelector('.titulo');
    if (tituloEl) {
        tituloEl.textContent = sistemaConfig.nome;
    }
    
    Object.keys(menu).forEach(categoria => {
        const categoriaContainer = document.createElement('div');
        categoriaContainer.className = 'categoria';
        categoriaContainer.innerHTML = `<h2>${categoria}</h2>`;
        
        const grid = document.createElement('div');
        grid.className = 'cardapio';
        
        menu[categoria].forEach(item => {
            let quantidade = 0;
            
            const itemDiv = document.createElement('div');
            itemDiv.className = 'item';
            itemDiv.innerHTML = `
            <div class="item-header">
                <h3>${item.nome}</h3>
                <div class="qtd">
                <button class="menos" aria-label="Diminuir quantidade">−</button>
                <span>0</span>
                <button class="mais" aria-label="Aumentar quantidade">+</button>
                </div>
            </div>
            <div class="desc">${item.desc || ''}</div>
            <div class="linha-preco">
                <div class="preco">R$ ${item.preco.toFixed(2)}</div>
                <button class="add">Adicionar</button>
            </div>`;
            
            const spanQuantidade = itemDiv.querySelector('span');
            
            itemDiv.querySelector('.mais').addEventListener('click', () => {
                if (carrinhoBloqueado) return;
                quantidade++;
                spanQuantidade.textContent = quantidade;
            });
            
            itemDiv.querySelector('.menos').addEventListener('click', () => {
                if (carrinhoBloqueado) return;
                if (quantidade > 0) quantidade--;
                spanQuantidade.textContent = quantidade;
            });
            
            itemDiv.querySelector('.add').addEventListener('click', () => {
                if (!quantidade || carrinhoBloqueado) return;
                
                carrinho.push({
                    nome: item.nome,
                    preco: item.preco,
                    qtd: quantidade,
                    obs: item.obs ? '' : null
                });
                
                salvar();
                quantidade = 0;
                spanQuantidade.textContent = '0';
                atualizarCarrinho();
            });
            
            grid.appendChild(itemDiv);
        });
        
        categoriaContainer.appendChild(grid);
        menuDiv.appendChild(categoriaContainer);
    });
}

// ===== GERENCIAMENTO DO CARRINHO =====
function atualizarCarrinho() {
    if (!listaEl) return;
    
    listaEl.innerHTML = '';
    let total = 0;
    
    carrinho.forEach((item, index) => {
        total += item.preco * item.qtd;
        
        const li = document.createElement('li');
        
        let html = `
        <div class="linha-carrinho">
            <span>${item.qtd}x ${item.nome}</span>
        `;
        
        if (!carrinhoBloqueado) {
            html += `
            <button class="remover" aria-label="Remover item" 
                    onclick="removerItem(${index})">X</button>
            `;
        }
        
        html += `</div>`;
        
        if (item.obs !== null) {
            html += `
            <div class="obs-carrinho">
            <input placeholder="Observação" ${carrinhoBloqueado ? 'disabled' : ''}
                    value="${item.obs}" 
                    oninput="atualizarObservacao(${index}, this.value)">
            </div>
            `;
        }
        
        li.innerHTML = html;
        listaEl.appendChild(li);
    });
    
    totalSpan.textContent = total.toFixed(2);
    if (btnPagarEl) {
        btnPagarEl.style.display = carrinho.length && !carrinhoBloqueado ? 'block' : 'none';
    }
    if (btnEditarEl) {
        btnEditarEl.style.display = carrinhoBloqueado ? 'block' : 'none';
    }
    
    telefoneEl.disabled = carrinhoBloqueado;
    nomeClienteEl.disabled = carrinhoBloqueado;
}

// ===== FUNÇÕES GLOBAIS PARA O CARRINHO =====
window.removerItem = function(index) {
    carrinho.splice(index, 1);
    salvar();
    atualizarCarrinho();
};

window.atualizarObservacao = function(index, valor) {
    carrinho[index].obs = valor;
    salvar();
};

// ===== PAGAMENTO COM CÓDIGO DE TRANSFERÊNCIA =====
function renderizarPagamentos() {
    if (!pagamentosDiv) return;
    
    pagamentosDiv.innerHTML = '';
    
    if (!carrinhoBloqueado) return;
    
    Object.keys(pagamentos).forEach(key => {
        const div = document.createElement('div');
        div.className = `pagamento-opcao ${pagamentoSelecionado === key ? 'selecionado' : ''}`;
        
        // Criar div interna para capturar clique de seleção
        const divSelecao = document.createElement('div');
        divSelecao.style.cursor = 'pointer';
        divSelecao.style.padding = '4px 0';
        
        divSelecao.addEventListener('click', () => {
            pagamentoSelecionado = pagamentoSelecionado === key ? null : key;
            salvar();
            renderizarPagamentos();
        });
        
        let html = `
        <strong>${pagamentos[key].titulo}</strong>
        <div>${pagamentos[key].mensagem}</div>
        `;
        
        divSelecao.innerHTML = html;
        div.appendChild(divSelecao);
        
        if (key === 'pix' && pagamentoSelecionado === 'pix') {
            const total = parseFloat(totalSpan.textContent);
            
            try {
                const chaveInfo = identificarTipoChavePIX(pixConfig.chave);
                
                if (!chaveInfo.valida) {
                    throw new Error(`Chave PIX configurada é inválida`);
                }
                
                const pixInfo = gerarCodigoPixCompleto(total);
                
                const pixContainer = document.createElement('div');
                pixContainer.style.marginTop = '12px';
                pixContainer.style.paddingTop = '12px';
                pixContainer.style.borderTop = '1px solid rgba(255, 255, 255, 0.2)';
                
                // Mostrar código de transferência se estiver configurado
                const infoCodigoTransferencia = pixConfig.usarCodigoTransferencia && pixInfo.codigoTransferencia !== "Não informado" 
                ? `<div style="display: flex; margin-bottom: 4px;">
                    <span style="color: rgba(255, 255, 255, 0.8); width: 90px;">Código Ref.:</span>
                    <span style="font-weight: bold; color: #ffcc80;">${pixInfo.codigoTransferencia}</span>
                    </div>`
                : '';
                
                pixContainer.innerHTML = `
                <div style="background: rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 12px; margin-bottom: 12px;">
                    <div style="display: flex; align-items: center; margin-bottom: 8px;">
                    <div style="background: rgba(255, 255, 255, 0.3); color: white; border-radius: 4px; 
                                padding: 2px 8px; font-size: 12px; margin-right: 8px;">
                        ${pixInfo.tipoChave}
                    </div>
                    <strong style="font-size: 14px;">DADOS DO PIX</strong>
                    </div>
                    
                    <div style="font-size: 13px; margin-bottom: 8px;">
                    <div style="display: flex; margin-bottom: 4px;">
                        <span style="color: rgba(255, 255, 255, 0.8); width: 90px;">Beneficiário:</span>
                        <span style="font-weight: bold;">${pixConfig.nomeBeneficiario}</span>
                    </div>
                    <div style="display: flex; margin-bottom: 4px;">
                        <span style="color: rgba(255, 255, 255, 0.8); width: 90px;">Chave:</span>
                        <span style="font-weight: bold; word-break: break-all;">${chaveInfo.chaveFormatada}</span>
                    </div>
                    <div style="display: flex; margin-bottom: 4px;">
                        <span style="color: rgba(255, 255, 255, 0.8); width: 90px;">Valor:</span>
                        <span style="font-weight: bold; color: #90ee90;">R$ ${total.toFixed(2)}</span>
                    </div>
                    ${infoCodigoTransferencia}
                    </div>
                    
                    <div style="background: rgba(144, 238, 144, 0.2); border: 1px solid rgba(144, 238, 144, 0.3); 
                                border-radius: 4px; padding: 6px; margin-top: 8px; font-size: 11px;">
                    <div style="display: flex; align-items: center; gap: 4px;">
                        <span style="color: #90ee90;">✓</span>
                        <span>PIX gerado com sucesso. Copie o código ou gere QR Code.</span>
                    </div>
                    </div>
                </div>
                
                <div style="display: flex; gap: 8px; margin-top: 10px;">
                    <button class="botao-copiar" data-action="copiar" data-codigo="${pixInfo.codigo}" data-valor="${total}" data-referencia="${pixInfo.codigoTransferencia}">
                    📋 Copiar Código PIX
                    </button>
                    <button class="botao-copiar" data-action="qrcode" 
                            data-codigo="${pixInfo.codigo}" data-valor="${total}" 
                            data-chave="${chaveInfo.chaveFormatada}" data-tipo="${pixInfo.tipoChave}"
                            data-referencia="${pixInfo.codigoTransferencia}">
                    🖼️ Gerar QR Code
                    </button>
                </div>
                
                <div style="font-size: 10px; color: rgba(255, 255, 255, 0.6); margin-top: 8px; text-align: center;">
                    ${pixConfig.usarCodigoTransferencia ? `Código: ${pixInfo.codigoTransferencia} • ` : ''}Tamanho: ${pixInfo.tamanho} chars
                </div>
                `;
                
                // Adicionar eventos aos botões (SEM propagação)
                pixContainer.querySelectorAll('.botao-copiar').forEach(btn => {
                    btn.addEventListener('click', function(e) {
                        e.stopPropagation();
                        e.preventDefault();
                        
                        const action = this.getAttribute('data-action');
                        const codigo = this.getAttribute('data-codigo');
                        const valor = parseFloat(this.getAttribute('data-valor'));
                        const referencia = this.getAttribute('data-referencia');
                        
                        if (action === 'copiar') {
                            copiarPix(codigo, valor, referencia);
                        } else if (action === 'qrcode') {
                            const chave = this.getAttribute('data-chave');
                            const tipo = this.getAttribute('data-tipo');
                            gerarQRCodeCompleto(codigo, valor, chave, tipo, referencia);
                        }
                        
                        return false;
                    });
                });
                
                div.appendChild(pixContainer);
            } catch (error) {
                const erroContainer = document.createElement('div');
                erroContainer.style.background = 'rgba(255, 230, 230, 0.2)';
                erroContainer.style.border = '1px solid rgba(255, 200, 200, 0.3)';
                erroContainer.style.borderRadius = '8px';
                erroContainer.style.padding = '12px';
                erroContainer.style.marginTop = '12px';
                erroContainer.style.color = '#ffcccc';
                erroContainer.style.fontSize = '13px';
                
                erroContainer.innerHTML = `
                <strong>❌ Erro ao gerar PIX:</strong><br>
                ${error.message}
                `;
                
                div.appendChild(erroContainer);
            }
        }
        
        pagamentosDiv.appendChild(div);
    });
}

// ===== FUNÇÕES DE COPIA E QR CODE =====
function copiarPix(codigoPix, valor, referencia = "") {
    navigator.clipboard.writeText(codigoPix)
        .then(() => {
            let mensagem = `✅ Código PIX copiado!\n\nValor: R$ ${valor.toFixed(2)}`;
            if (referencia && referencia !== "Não informado") {
                mensagem += `\nCódigo de referência: ${referencia}`;
            }
            mensagem += `\n\nCole no seu app bancário.`;
            alert(mensagem);
        })
        .catch(err => {
            console.error('Erro ao copiar:', err);
            
            const textarea = document.createElement('textarea');
            textarea.value = codigoPix;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            
            let mensagem = 'Código PIX selecionado. Cole (Ctrl+V) no seu app bancário.';
            if (referencia && referencia !== "Não informado") {
                mensagem += `\nCódigo de referência: ${referencia}`;
            }
            alert(mensagem);
        });
}

// ===== GERAR QR CODE COM CÓDIGO DE REFERÊNCIA =====
function gerarQRCodeCompleto(codigoPix, valor, chaveFormatada, tipoChave, codigoReferencia = "") {
    const qrSize = 300;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}x${qrSize}&data=${encodeURIComponent(codigoPix)}&format=png&margin=10`;
    
    const janela = window.open("", "QR Code PIX - TRIBO BAR", "width=500,height=700");
    
    // Informação adicional se houver código de referência
    const infoReferencia = codigoReferencia && codigoReferencia !== "Não informado" 
        ? `<div style="display: flex; margin-bottom: 4px;">
            <span style="color: #666; width: 120px;">Código Referência:</span>
            <span style="font-weight: bold; color: #ff9800;">${codigoReferencia}</span>
            </div>`
        : '';
        
    const badgeReferencia = codigoReferencia && codigoReferencia !== "Não informado"
        ? `<span class="codigo-ref">REF: ${codigoReferencia}</span>`
        : '';
    
    janela.document.write(`
    <html>
    <head>
        <title>QR Code PIX - TRIBO BAR</title>
        <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; 
            text-align: center; 
            padding: 20px; 
            background: #f5f5f5;
            margin: 0;
        }
        .container {
            background: white;
            border-radius: 12px;
            padding: 25px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            max-width: 450px;
            margin: 0 auto;
        }
        .header {
            background: #000;
            color: white;
            padding: 15px;
            border-radius: 8px 8px 0 0;
            margin: -25px -25px 20px -25px;
        }
        .valor { 
            font-size: 32px; 
            color: #1faa00; 
            font-weight: bold; 
            margin: 20px 0;
            padding: 10px;
            border: 2px dashed #1faa00;
            border-radius: 8px;
            background: #f1f8e9;
        }
        .info-card {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            margin: 15px 0;
            text-align: left;
            font-size: 14px;
            border-left: 4px solid #4caf50;
        }
        .chave-info {
            background: #e3f2fd;
            padding: 12px;
            border-radius: 6px;
            margin: 10px 0;
            font-size: 13px;
            word-break: break-all;
        }
        .tipo-chave {
            display: inline-block;
            background: #4caf50;
            color: white;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            margin-bottom: 10px;
        }
        .codigo-ref {
            display: inline-block;
            background: #ff9800;
            color: white;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            margin-bottom: 10px;
            margin-left: 8px;
        }
        img { 
            width: 100%; 
            max-width: 300px;
            height: auto;
            border: 1px solid #ddd; 
            border-radius: 8px;
            margin: 15px 0;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        .alerta {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            color: #856404;
            padding: 12px;
            border-radius: 6px;
            margin: 15px 0;
            font-size: 13px;
            text-align: left;
        }
        .btn-fechar {
            background: #d32f2f;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            margin-top: 15px;
            width: 100%;
            font-weight: bold;
            transition: background 0.2s;
        }
        .btn-fechar:hover {
            background: #b71c1c;
        }
        </style>
    </head>
    <body>
        <div class="container">
        <div class="header">
            <h3 style="margin: 0;">📱 Pagamento via PIX</h3>
            <div style="font-size: 12px; opacity: 0.9;">TRIBO BAR • ${new Date().toLocaleDateString('pt-BR')}</div>
        </div>
        
        <div>
            <span class="tipo-chave">${tipoChave}</span>
            ${badgeReferencia}
        </div>
        
        <div class="valor">R$ ${valor.toFixed(2)}</div>
        
        <div class="info-card">
            <strong>Informações do Pagamento:</strong><br>
            Beneficiário: <strong>TRIBO BAR</strong><br>
            Tipo de Chave: <strong>${tipoChave}</strong><br>
            Chave: <strong>${chaveFormatada}</strong><br>
            ${infoReferencia}
            Data: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
        </div>
        
        <div class="chave-info">
            <strong>Como pagar:</strong><br>
            1. Abra o app do seu banco<br>
            2. Escolha "Pagar com PIX"<br>
            3. Escaneie este QR Code<br>
            4. Confirme o valor: <strong>R$ ${valor.toFixed(2)}</strong>
        </div>
        
        <img src="${qrUrl}" alt="QR Code PIX">
        
        <div class="alerta">
            <strong>⚠️ ATENÇÃO:</strong><br>
            Confirme se o valor no seu app bancário é <strong>R$ ${valor.toFixed(2)}</strong><br>
            Só prossiga com o pagamento se o valor estiver correto.
        </div>
        
        <button class="btn-fechar" onclick="window.close()">Fechar</button>
        </div>
    </body>
    </html>
    `);
}

// ===== EVENTOS DOS BOTÕES =====
if (btnPagarEl) {
    btnPagarEl.addEventListener('click', () => {
        if (!carrinho.length) return;
        
        const telefoneNumerico = obterTelefoneNumerico(telefoneEl.value);
        
        if (!telefoneNumerico || telefoneNumerico.length < 10) {
            alert('Por favor, informe um telefone válido com DDD (ex: 11999999999).');
            telefoneEl.focus();
            return;
        }
        
        if (!nomeClienteEl.value.trim()) {
            alert('Por favor, informe seu nome.');
            nomeClienteEl.focus();
            return;
        }
        
        carrinhoBloqueado = true;
        salvar();
        renderizarPagamentos();
        atualizarCarrinho();
    });
}

if (btnEditarEl) {
    btnEditarEl.addEventListener('click', () => {
        carrinhoBloqueado = false;
        pagamentoSelecionado = null;
        salvar();
        renderizarPagamentos();
        atualizarCarrinho();
    });
}

if (finalizarEl) {
    finalizarEl.addEventListener('click', () => {
        const telefoneNumerico = obterTelefoneNumerico(telefoneEl.value);
        
        if (!/^\d{10,11}$/.test(telefoneNumerico)) {
            alert('Telefone inválido. Digite o DDD + número (10 ou 11 dígitos).\nExemplo: (11) 99999-9999');
            telefoneEl.focus();
            return;
        }
        
        if (!nomeClienteEl.value.trim()) {
            alert('Por favor, informe seu nome.');
            nomeClienteEl.focus();
            return;
        }
        
        if (!carrinho.length) {
            alert('Seu carrinho está vazio.');
            return;
        }
        
        if (!pagamentoSelecionado) {
            alert('Selecione uma forma de pagamento.');
            return;
        }
        
        // Gerar código de transferência para este pedido
        const codigoTransferencia = pixConfig.usarCodigoTransferencia ? 
                                    gerarCodigoTransferencia() : "";
        
        let mensagem = `*NOVO PEDIDO - ${sistemaConfig.nome}*\n\n`;
        mensagem += `👤 *Cliente:* ${nomeClienteEl.value}\n`;
        mensagem += `📞 *Telefone:* ${telefoneEl.value}\n\n`;
        mensagem += `🍕 *PEDIDO:*\n`;
        
        carrinho.forEach(item => {
            mensagem += `• ${item.qtd}x ${item.nome} - R$ ${(item.preco * item.qtd).toFixed(2)}\n`;
            if (item.obs && item.obs.trim()) {
                mensagem += `  _Obs: ${item.obs}_\n`;
            }
        });
        
        mensagem += `\n💰 *Total:* R$ ${totalSpan.textContent}\n`;
        mensagem += `💳 *Pagamento:* ${pagamentos[pagamentoSelecionado].titulo}\n\n`;
        
        if (pagamentoSelecionado === 'pix') {
            try {
                const total = parseFloat(totalSpan.textContent);
                const chaveInfo = identificarTipoChavePIX(pixConfig.chave);
                const pixInfo = gerarPixCompleto(chaveInfo, total, codigoTransferencia);
                
                mensagem += `🔐 *DETALHES PIX:*\n`;
                mensagem += `Valor: R$ ${total.toFixed(2)}\n`;
                mensagem += `Tipo: ${pixInfo.tipoChave}\n`;
                mensagem += `Chave: ${pixInfo.chaveFormatada}\n`;
                if (codigoTransferencia) {
                    mensagem += `Código Ref.: ${codigoTransferencia}\n`;
                }
                mensagem += `\n*Código PIX:*\n\`\`\`\n${pixInfo.codigo}\n\`\`\`\n`;
                
            } catch (error) {
                mensagem += `⚠️ *Aviso PIX:* Não foi possível gerar o código PIX automaticamente.\n`;
                mensagem += `Por favor, gere manualmente no sistema.\n\n`;
            }
        }
        
        mensagem += `⏰ *Horário:* ${new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}`;
        
        const url = `https://wa.me/${sistemaConfig.whatsapp}?text=${encodeURIComponent(mensagem)}`;
        window.open(url, '_blank');
        
        // Limpar carrinho
        carrinho = [];
        carrinhoBloqueado = false;
        pagamentoSelecionado = null;
        telefoneEl.value = '';
        nomeClienteEl.value = '';
        
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(STATE_KEY);
        atualizarCarrinho();
        renderizarPagamentos();
        
        finalizarEl.textContent = 'Pedido Enviado! ✓';
        finalizarEl.style.background = '#1faa00';
        
        setTimeout(() => {
            finalizarEl.textContent = 'Enviar pedido no WhatsApp';
            finalizarEl.style.background = '';
        }, 2000);
    });
}

// ===== VERIFICAR ATUALIZAÇÕES =====
async function verificarAtualizacoes() {
    try {
        // Recarregar dados do Supabase periodicamente
        await carregarDadosSistema();
        
        // Recriar menu se necessário
        criarMenu();
        
        // Atualizar carrinho (caso itens tenham sido removidos)
        atualizarCarrinho();
        
    } catch (error) {
        console.error("Erro ao verificar atualizações:", error);
    }
}

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', async () => {
    console.log("🚀 Iniciando sistema Tribo Bar...");
    
    // Carregar dados do Supabase
    await carregarDadosSistema();
    
    // Configurar eventos de telefone
    telefoneEl.addEventListener('input', () => formatarTelefone(telefoneEl));
    
    telefoneEl.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace') {
            setTimeout(() => formatarTelefone(telefoneEl), 10);
        }
    });
    
    // Criar menu inicial
    criarMenu();
    atualizarCarrinho();
    renderizarPagamentos();
    
    if (telefoneEl.value) {
        formatarTelefone(telefoneEl);
    }
    
    // Verificar atualizações a cada 30 segundos
    setInterval(verificarAtualizacoes, 30000);
    
    console.log("✅ Sistema carregado com sucesso!");
    console.log("📊 Dados carregados:");
    console.log("- Categorias:", Object.keys(menu).length);
    console.log("- Total de itens:", Object.values(menu).reduce((acc, itens) => acc + itens.length, 0));
    console.log("- Usar código transferência:", pixConfig.usarCodigoTransferencia);
});

// Prevenir envio do formulário ao pressionar Enter
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && (e.target.id === 'telefone' || e.target.id === 'nomeCliente')) {
        e.preventDefault();
    }
});

// ===== FUNÇÕES DE DEBUG =====
window.resetarCodigoTransferencia = function() {
    if (confirm("Deseja resetar o contador de códigos de transferência para 1?")) {
        pixConfig.codigoAtual = 1;
        localStorage.setItem('codigo_transferencia_tribo', "1");
        alert("Contador resetado para TRB001");
    }
};

window.mostrarInfoPix = function() {
    console.log("🔧 INFORMAÇÕES DO SISTEMA PIX:");
    console.log("Chave configurada:", pixConfig.chave);
    console.log("Tipo identificado:", identificarTipoChavePIX(pixConfig.chave));
    console.log("Usar código transferência:", pixConfig.usarCodigoTransferencia);
    console.log("Próximo código:", pixConfig.prefixoCodigo + pixConfig.codigoAtual.toString().padStart(3, '0'));
};
