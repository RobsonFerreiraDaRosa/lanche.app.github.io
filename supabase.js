// ===== CONFIGURAÇÃO SUPABASE =====
const SUPABASE_URL = 'https://iezyvgvwmrbizsfpewdj.supabase.co'; // 🔧 ALTERE: Coloque sua URL do Supabase
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imllenl2Z3Z3bXJiaXpzZnBld2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0NTk2NjEsImV4cCI6MjA4NjAzNTY2MX0.PnlxrstIPiLR_5pfVt1yuUB2CELzkGW_n09aYI508Xk'; // 🔧 ALTERE: Coloque sua chave anônima

// Inicializar cliente Supabase
let supabaseClient = null;

function inicializarSupabaseClient() {
    if (window.supabase && SUPABASE_URL && SUPABASE_ANON_KEY) {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log("✅ Cliente Supabase inicializado");
        return true;
    } else {
        console.error("❌ Supabase não disponível");
        return false;
    }
}

// ===== FUNÇÕES DE BANCO DE DADOS =====

// 1. VERIFICAR SENHA DE ADMIN (CORRIGIDA)
async function verificarSenhaAdmin(senhaDigitada) {
    if (!supabaseClient && !inicializarSupabaseClient()) {
        console.error("Supabase não inicializado");
        return { sucesso: false, mensagem: "Erro de configuração" };
    }

    try {
        // Buscar a senha hash da tabela
        const { data, error } = await supabaseClient
            .from('admin_senha')
            .select('senha_hash')
            .eq('id', 1)
            .single();

        if (error) {
            console.error("Erro ao verificar senha:", error);
            return { 
                sucesso: false, 
                mensagem: "Erro no servidor. Verifique se a tabela admin_senha existe." 
            };
        }

        if (!data) {
            console.error("Nenhuma senha encontrada na tabela admin_senha");
            return { 
                sucesso: false, 
                mensagem: "Senha não configurada no sistema. Contate o administrador." 
            };
        }

        console.log("Senha do banco:", data.senha_hash);
        console.log("Senha digitada:", senhaDigitada);

        // Comparação SIMPLES (em produção, use bcrypt)
        const senhaValida = senhaDigitada === data.senha_hash;
        
        return {
            sucesso: senhaValida,
            mensagem: senhaValida ? "Login realizado com sucesso!" : "Senha incorreta!"
        };
    } catch (error) {
        console.error("Erro na verificação:", error);
        return { 
            sucesso: false, 
            mensagem: "Erro de conexão com o servidor" 
        };
    }
}

// 2. CARREGAR CONFIGURAÇÕES DO SISTEMA (CORRIGIDA)
async function carregarConfiguracoesSistema() {
    if (!supabaseClient && !inicializarSupabaseClient()) {
        console.warn("⚠️ Supabase não disponível. Usando dados padrão.");
        return carregarConfiguracoesPadrao();
    }

    try {
        const { data, error } = await supabaseClient
            .from('sistema_config')
            .select('*')
            .eq('id', 1)
            .single();

        if (error) {
            console.error("Erro ao carregar configurações:", error);
            return carregarConfiguracoesPadrao();
        }

        if (!data) {
            console.warn("Nenhuma configuração encontrada. Usando padrão.");
            return carregarConfiguracoesPadrao();
        }

        return {
            sistema: {
                nome: data.nome_sistema || "TRIBO BAR",
                whatsapp: data.whatsapp_numero || "5551981894966"
            },
            pix: {
                chave: data.pix_chave || "43979611000136",
                nomeBeneficiario: data.pix_nome_beneficiario || "TRIBO BAR",
                cidade: data.pix_cidade || "LAJEADO",
                usarCodigoTransferencia: data.pix_usar_codigo !== false, // default true
                prefixoCodigo: data.pix_prefixo_codigo || "TRB",
                codigoAtual: data.pix_codigo_atual || 1
            }
        };
    } catch (error) {
        console.error("Erro ao carregar configurações:", error);
        return carregarConfiguracoesPadrao();
    }
}

function carregarConfiguracoesPadrao() {
    return {
        sistema: {
            nome: "TRIBO BAR",
            whatsapp: "5551981894966"
        },
        pix: {
            chave: "43979611000136",
            nomeBeneficiario: "TRIBO BAR",
            cidade: "LAJEADO",
            usarCodigoTransferencia: true,
            prefixoCodigo: "TRB",
            codigoAtual: 1
        }
    };
}

// 3. CARREGAR MENU COMPLETO (CORRIGIDA)
async function carregarMenuCompleto() {
    if (!supabaseClient && !inicializarSupabaseClient()) {
        console.warn("⚠️ Supabase não disponível. Usando menu padrão.");
        return carregarMenuPadrao();
    }

    try {
        // Carregar categorias em ordem
        const { data: categorias, error: errorCategorias } = await supabaseClient
            .from('categorias')
            .select('id, nome')
            .order('ordem', { ascending: true });

        if (errorCategorias) {
            console.error("Erro ao carregar categorias:", errorCategorias);
            return carregarMenuPadrao();
        }

        if (!categorias || categorias.length === 0) {
            console.warn("Nenhuma categoria encontrada. Usando menu padrão.");
            return carregarMenuPadrao();
        }

        const menuData = {};

        // Para cada categoria, carregar os itens
        for (const categoria of categorias) {
            const { data: itens, error: errorItens } = await supabaseClient
                .from('itens_menu')
                .select('id, nome, preco, descricao, permite_observacao')
                .eq('categoria_id', categoria.id)
                .order('ordem', { ascending: true });

            if (errorItens) {
                console.error(`Erro ao carregar itens da categoria ${categoria.nome}:`, errorItens);
                menuData[categoria.nome] = [];
                continue;
            }

            // Converter para formato esperado pelo sistema
            menuData[categoria.nome] = (itens || []).map(item => ({
                id: item.id,
                nome: item.nome,
                preco: parseFloat(item.preco),
                desc: item.descricao || '',
                obs: item.permite_observacao || false
            }));
        }

        console.log(`✅ Menu carregado: ${Object.keys(menuData).length} categorias`);
        return menuData;

    } catch (error) {
        console.error("Erro ao carregar menu:", error);
        return carregarMenuPadrao();
    }
}

function carregarMenuPadrao() {
    return {
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
}

// 4. SALVAR CONFIGURAÇÕES DO SISTEMA
async function salvarConfiguracoesSistema(configSistema, configPix) {
    if (!supabaseClient && !inicializarSupabaseClient()) {
        return { sucesso: false, mensagem: "Erro de conexão com o servidor" };
    }

    try {
        const { error } = await supabaseClient
            .from('sistema_config')
            .upsert({
                id: 1,
                nome_sistema: configSistema.nome || "TRIBO BAR",
                whatsapp_numero: configSistema.whatsapp || "5551981894966",
                pix_chave: configPix.chave || "43979611000136",
                pix_nome_beneficiario: configPix.nomeBeneficiario || "TRIBO BAR",
                pix_cidade: configPix.cidade || "LAJEADO",
                pix_usar_codigo: configPix.usarCodigoTransferencia !== false,
                pix_prefixo_codigo: configPix.prefixoCodigo || "TRB",
                pix_codigo_atual: configPix.codigoAtual || 1,
                atualizado_em: new Date().toISOString()
            }, {
                onConflict: 'id'
            });

        if (error) {
            console.error("Erro ao salvar configurações:", error);
            return { sucesso: false, mensagem: "Erro ao salvar configurações" };
        }

        return { sucesso: true, mensagem: "Configurações salvas com sucesso!" };
    } catch (error) {
        console.error("Erro ao salvar:", error);
        return { sucesso: false, mensagem: "Erro de conexão com o servidor" };
    }
}

// 5. GERENCIAMENTO DE CATEGORIAS
async function carregarCategorias() {
    if (!supabaseClient && !inicializarSupabaseClient()) {
        return [];
    }

    try {
        const { data, error } = await supabaseClient
            .from('categorias')
            .select('id, nome, ordem')
            .order('ordem', { ascending: true });

        if (error) {
            console.error("Erro ao carregar categorias:", error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error("Erro ao carregar categorias:", error);
        return [];
    }
}

async function salvarCategoria(nome) {
    if (!supabaseClient && !inicializarSupabaseClient()) {
        return { sucesso: false, mensagem: "Erro de conexão" };
    }

    try {
        // Verificar se já existe
        const { data: existe } = await supabaseClient
            .from('categorias')
            .select('id')
            .eq('nome', nome)
            .single();

        if (existe) {
            return { sucesso: false, mensagem: "Já existe uma categoria com este nome" };
        }

        // Obter próxima ordem
        const { data: ultimaCategoria } = await supabaseClient
            .from('categorias')
            .select('ordem')
            .order('ordem', { ascending: false })
            .limit(1);

        const proximaOrdem = ultimaCategoria && ultimaCategoria.length > 0 
            ? ultimaCategoria[0].ordem + 1 
            : 1;

        const { data, error } = await supabaseClient
            .from('categorias')
            .insert({
                nome: nome,
                ordem: proximaOrdem
            })
            .select()
            .single();

        if (error) {
            console.error("Erro ao salvar categoria:", error);
            return { sucesso: false, mensagem: "Erro ao salvar categoria" };
        }

        return { 
            sucesso: true, 
            mensagem: "Categoria adicionada com sucesso!",
            categoriaId: data.id 
        };
    } catch (error) {
        console.error("Erro ao salvar categoria:", error);
        return { sucesso: false, mensagem: "Erro de conexão" };
    }
}

async function excluirCategoria(categoriaNome) {
    if (!supabaseClient && !inicializarSupabaseClient()) {
        return { sucesso: false, mensagem: "Erro de conexão" };
    }

    try {
        // Primeiro, encontrar o ID da categoria
        const { data: categoria, error: errorBusca } = await supabaseClient
            .from('categorias')
            .select('id')
            .eq('nome', categoriaNome)
            .single();

        if (errorBusca || !categoria) {
            return { sucesso: false, mensagem: "Categoria não encontrada" };
        }

        // Excluir todos os itens da categoria
        const { error: errorItens } = await supabaseClient
            .from('itens_menu')
            .delete()
            .eq('categoria_id', categoria.id);

        if (errorItens) {
            console.error("Erro ao excluir itens:", errorItens);
            return { sucesso: false, mensagem: "Erro ao excluir itens da categoria" };
        }

        // Excluir a categoria
        const { error: errorCategoria } = await supabaseClient
            .from('categorias')
            .delete()
            .eq('id', categoria.id);

        if (errorCategoria) {
            console.error("Erro ao excluir categoria:", errorCategoria);
            return { sucesso: false, mensagem: "Erro ao excluir categoria" };
        }

        return { sucesso: true, mensagem: "Categoria excluída com sucesso!" };
    } catch (error) {
        console.error("Erro ao excluir categoria:", error);
        return { sucesso: false, mensagem: "Erro de conexão" };
    }
}

// 6. GERENCIAMENTO DE ITENS
async function salvarItem(item) {
    if (!supabaseClient && !inicializarSupabaseClient()) {
        return { sucesso: false, mensagem: "Erro de conexão" };
    }

    try {
        // Encontrar categoria pelo nome
        const { data: categoria, error: errorCategoria } = await supabaseClient
            .from('categorias')
            .select('id')
            .eq('nome', item.categoria)
            .single();

        if (errorCategoria || !categoria) {
            return { sucesso: false, mensagem: "Categoria não encontrada" };
        }

        const dadosItem = {
            nome: item.nome,
            preco: item.preco,
            descricao: item.desc || '',
            permite_observacao: item.obs || false,
            categoria_id: categoria.id
        };

        if (item.id) {
            // Atualizar item existente
            const { error } = await supabaseClient
                .from('itens_menu')
                .update(dadosItem)
                .eq('id', item.id);

            if (error) {
                console.error("Erro ao atualizar item:", error);
                return { sucesso: false, mensagem: "Erro ao atualizar item" };
            }

            return { sucesso: true, mensagem: "Item atualizado com sucesso!" };
        } else {
            // Obter próxima ordem para novo item
            const { data: ultimoItem } = await supabaseClient
                .from('itens_menu')
                .select('ordem')
                .eq('categoria_id', categoria.id)
                .order('ordem', { ascending: false })
                .limit(1);

            const proximaOrdem = ultimoItem && ultimoItem.length > 0 
                ? ultimoItem[0].ordem + 1 
                : 1;

            dadosItem.ordem = proximaOrdem;

            // Inserir novo item
            const { error } = await supabaseClient
                .from('itens_menu')
                .insert(dadosItem);

            if (error) {
                console.error("Erro ao salvar item:", error);
                return { sucesso: false, mensagem: "Erro ao salvar item" };
            }

            return { sucesso: true, mensagem: "Item adicionado com sucesso!" };
        }
    } catch (error) {
        console.error("Erro ao salvar item:", error);
        return { sucesso: false, mensagem: "Erro de conexão" };
    }
}

async function excluirItem(itemId) {
    if (!supabaseClient && !inicializarSupabaseClient()) {
        return { sucesso: false, mensagem: "Erro de conexão" };
    }

    try {
        const { error } = await supabaseClient
            .from('itens_menu')
            .delete()
            .eq('id', itemId);

        if (error) {
            console.error("Erro ao excluir item:", error);
            return { sucesso: false, mensagem: "Erro ao excluir item" };
        }

        return { sucesso: true, mensagem: "Item excluído com sucesso!" };
    } catch (error) {
        console.error("Erro ao excluir item:", error);
        return { sucesso: false, mensagem: "Erro de conexão" };
    }
}

// 7. ATUALIZAR ORDEM DAS CATEGORIAS
async function atualizarOrdemCategorias(ordemCategorias) {
    if (!supabaseClient && !inicializarSupabaseClient()) {
        return { sucesso: false, mensagem: "Erro de conexão" };
    }

    try {
        for (let i = 0; i < ordemCategorias.length; i++) {
            const categoriaNome = ordemCategorias[i];
            
            const { error } = await supabaseClient
                .from('categorias')
                .update({ ordem: i + 1 })
                .eq('nome', categoriaNome);

            if (error) {
                console.error(`Erro ao atualizar ordem da categoria ${categoriaNome}:`, error);
                return { sucesso: false, mensagem: "Erro ao atualizar ordem" };
            }
        }

        return { sucesso: true, mensagem: "Ordem das categorias atualizada!" };
    } catch (error) {
        console.error("Erro ao atualizar ordem:", error);
        return { sucesso: false, mensagem: "Erro de conexão" };
    }
}

// ===== INICIALIZAÇÃO =====
async function inicializarSupabase() {
    if (!window.supabase) {
        console.error("Biblioteca do Supabase não carregada. Verifique se o script foi incluído.");
        return false;
    }

    if (!SUPABASE_URL || SUPABASE_URL.includes('seu-projeto')) {
        console.error("Configure a URL do Supabase no arquivo supabase.js");
        return false;
    }

    if (!SUPABASE_ANON_KEY || SUPABASE_ANON_KEY.includes('sua-chave-anon-key')) {
        console.error("Configure a chave anônima do Supabase no arquivo supabase.js");
        return false;
    }

    const inicializado = inicializarSupabaseClient();
    if (inicializado) {
        console.log("✅ Supabase inicializado com sucesso!");
        return true;
    } else {
        console.error("❌ Falha ao inicializar Supabase");
        return false;
    }
}

// ===== FUNÇÕES PARA PÁGINA PRINCIPAL =====
async function carregarDadosParaPaginaPrincipal() {
    const configs = await carregarConfiguracoesSistema();
    const menu = await carregarMenuCompleto();
    
    return {
        sistema: configs.sistema,
        pix: configs.pix,
        menu: menu
    };
}

// ===== EXPORTAR FUNÇÕES =====
window.SupabaseDB = {
    // Inicialização
    inicializarSupabase,
    
    // Autenticação
    verificarSenhaAdmin,
    
    // Sistema (página principal)
    carregarDadosParaPaginaPrincipal,
    
    // Sistema (admin)
    carregarConfiguracoesSistema,
    salvarConfiguracoesSistema,
    carregarMenuCompleto,
    
    // Categorias
    carregarCategorias,
    salvarCategoria,
    excluirCategoria,
    atualizarOrdemCategorias,
    
    // Itens
    salvarItem,
    excluirItem
};

// Inicializar automaticamente quando a biblioteca for carregada
document.addEventListener('DOMContentLoaded', async () => {
    console.log("🔧 Inicializando SupabaseDB...");
    const inicializado = await inicializarSupabase();
    
    if (!inicializado) {
        console.warn("⚠️ Supabase não inicializado. O sistema usará dados locais como fallback.");
        
        // Mostrar alerta no console para desenvolvedor
        console.error(`
        =====================================================
        ERRO DE CONFIGURAÇÃO SUPABASE
        =====================================================
        Configure as credenciais do Supabase no arquivo:
        supabase.js
        
        Altere estas linhas:
        const SUPABASE_URL = 'https://seu-projeto.supabase.co';
        const SUPABASE_ANON_KEY = 'sua-chave-anon-key';
        
        Para as credenciais do seu projeto Supabase:
        1. Acesse supabase.com
        2. Vá em Project Settings > API
        3. Copie: URL e anon key
        =====================================================
        `);
    }
});
