// ===== CONFIGURAÇÃO SUPABASE =====
const SUPABASE_URL = 'https://iezyvgvwmrbizsfpewdj.supabase.co'; // 🔧 ALTERE: Coloque sua URL do Supabase
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imllenl2Z3Z3bXJiaXpzZnBld2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0NTk2NjEsImV4cCI6MjA4NjAzNTY2MX0.PnlxrstIPiLR_5pfVt1yuUB2CELzkGW_n09aYI508Xk'; // 🔧 ALTERE: Coloque sua chave anônima

// Inicializar cliente Supabase
const supabaseClient = window.supabase ? 
    window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : 
    null;

// ===== FUNÇÕES DE BANCO DE DADOS =====

// 1. VERIFICAR SENHA DE ADMIN
async function verificarSenhaAdmin(senhaDigitada) {
    if (!supabaseClient) {
        console.error("Supabase não inicializado");
        return { sucesso: false, mensagem: "Erro de configuração" };
    }

    try {
        const { data, error } = await supabaseClient
            .from('admin_senha')
            .select('senha_hash')
            .eq('id', 1)
            .single();

        if (error) {
            console.error("Erro ao verificar senha:", error);
            return { sucesso: false, mensagem: "Erro ao verificar senha" };
        }

        if (!data) {
            return { sucesso: false, mensagem: "Senha não configurada" };
        }

        // Em produção, você deve usar bcrypt ou similar
        // Aqui usamos comparação simples para demonstração
        const senhaValida = senhaDigitada === data.senha_hash;
        
        return {
            sucesso: senhaValida,
            mensagem: senhaValida ? "Senha correta" : "Senha incorreta"
        };
    } catch (error) {
        console.error("Erro na verificação:", error);
        return { sucesso: false, mensagem: "Erro no servidor" };
    }
}

// 2. CARREGAR CONFIGURAÇÕES DO SISTEMA
async function carregarConfiguracoesSistema() {
    if (!supabaseClient) {
        console.error("Supabase não inicializado");
        return { sistema: null, pix: null, menu: null };
    }

    try {
        // Carregar todas as configurações de uma vez
        const { data, error } = await supabaseClient
            .from('sistema_config')
            .select('*')
            .eq('id', 1)
            .single();

        if (error) {
            console.error("Erro ao carregar configurações:", error);
            return { sistema: null, pix: null, menu: null };
        }

        if (!data) {
            return { sistema: null, pix: null, menu: null };
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
                usarCodigoTransferencia: data.pix_usar_codigo || true,
                prefixoCodigo: data.pix_prefixo_codigo || "TRB",
                codigoAtual: data.pix_codigo_atual || 1
            }
        };
    } catch (error) {
        console.error("Erro ao carregar configurações:", error);
        return { sistema: null, pix: null, menu: null };
    }
}

// 3. SALVAR CONFIGURAÇÕES DO SISTEMA
async function salvarConfiguracoesSistema(configSistema, configPix) {
    if (!supabaseClient) {
        console.error("Supabase não inicializado");
        return { sucesso: false, mensagem: "Erro de configuração" };
    }

    try {
        const { error } = await supabaseClient
            .from('sistema_config')
            .upsert({
                id: 1,
                nome_sistema: configSistema.nome,
                whatsapp_numero: configSistema.whatsapp,
                pix_chave: configPix.chave,
                pix_nome_beneficiario: configPix.nomeBeneficiario,
                pix_cidade: configPix.cidade,
                pix_usar_codigo: configPix.usarCodigoTransferencia,
                pix_prefixo_codigo: configPix.prefixoCodigo,
                pix_codigo_atual: configPix.codigoAtual,
                atualizado_em: new Date().toISOString()
            }, {
                onConflict: 'id'
            });

        if (error) {
            console.error("Erro ao salvar configurações:", error);
            return { sucesso: false, mensagem: "Erro ao salvar" };
        }

        return { sucesso: true, mensagem: "Configurações salvas" };
    } catch (error) {
        console.error("Erro ao salvar:", error);
        return { sucesso: false, mensagem: "Erro no servidor" };
    }
}

// 4. CARREGAR CATEGORIAS
async function carregarCategorias() {
    if (!supabaseClient) {
        console.error("Supabase não inicializado");
        return {};
    }

    try {
        const { data: categorias, error: errorCategorias } = await supabaseClient
            .from('categorias')
            .select('*')
            .order('ordem');

        if (errorCategorias) {
            console.error("Erro ao carregar categorias:", errorCategorias);
            return {};
        }

        // Carregar itens para cada categoria
        const menuData = {};
        
        for (const categoria of categorias) {
            const { data: itens, error: errorItens } = await supabaseClient
                .from('itens_menu')
                .select('*')
                .eq('categoria_id', categoria.id)
                .order('ordem');

            if (errorItens) {
                console.error("Erro ao carregar itens:", errorItens);
                menuData[categoria.nome] = [];
                continue;
            }

            // Converter para o formato esperado pelo sistema
            menuData[categoria.nome] = itens.map(item => ({
                id: item.id,
                nome: item.nome,
                preco: parseFloat(item.preco),
                desc: item.descricao || '',
                obs: item.permite_observacao || false
            }));
        }

        return menuData;
    } catch (error) {
        console.error("Erro ao carregar categorias:", error);
        return {};
    }
}

// 5. SALVAR CATEGORIA
async function salvarCategoria(categoriaNome, itens = []) {
    if (!supabaseClient) {
        console.error("Supabase não inicializado");
        return { sucesso: false, mensagem: "Erro de configuração" };
    }

    try {
        // 1. Salvar categoria
        const { data: categoriaData, error: errorCategoria } = await supabaseClient
            .from('categorias')
            .insert({
                nome: categoriaNome,
                ordem: await obterProximaOrdemCategoria()
            })
            .select()
            .single();

        if (errorCategoria) {
            console.error("Erro ao salvar categoria:", errorCategoria);
            return { sucesso: false, mensagem: "Erro ao salvar categoria" };
        }

        // 2. Salvar itens se houver
        if (itens.length > 0) {
            const itensParaSalvar = itens.map((item, index) => ({
                nome: item.nome,
                preco: item.preco,
                descricao: item.desc || '',
                permite_observacao: item.obs || false,
                categoria_id: categoriaData.id,
                ordem: index + 1
            }));

            const { error: errorItens } = await supabaseClient
                .from('itens_menu')
                .insert(itensParaSalvar);

            if (errorItens) {
                console.error("Erro ao salvar itens:", errorItens);
                // Continuar mesmo com erro nos itens
            }
        }

        return { 
            sucesso: true, 
            mensagem: "Categoria salva",
            categoriaId: categoriaData.id 
        };
    } catch (error) {
        console.error("Erro ao salvar categoria:", error);
        return { sucesso: false, mensagem: "Erro no servidor" };
    }
}

// 6. ATUALIZAR CATEGORIA
async function atualizarCategoria(categoriaId, novoNome, novaOrdem = null) {
    if (!supabaseClient) {
        console.error("Supabase não inicializado");
        return { sucesso: false, mensagem: "Erro de configuração" };
    }

    try {
        const dadosAtualizacao = {
            nome: novoNome,
            atualizado_em: new Date().toISOString()
        };

        if (novaOrdem !== null) {
            dadosAtualizacao.ordem = novaOrdem;
        }

        const { error } = await supabaseClient
            .from('categorias')
            .update(dadosAtualizacao)
            .eq('id', categoriaId);

        if (error) {
            console.error("Erro ao atualizar categoria:", error);
            return { sucesso: false, mensagem: "Erro ao atualizar" };
        }

        return { sucesso: true, mensagem: "Categoria atualizada" };
    } catch (error) {
        console.error("Erro ao atualizar categoria:", error);
        return { sucesso: false, mensagem: "Erro no servidor" };
    }
}

// 7. EXCLUIR CATEGORIA
async function excluirCategoria(categoriaId) {
    if (!supabaseClient) {
        console.error("Supabase não inicializado");
        return { sucesso: false, mensagem: "Erro de configuração" };
    }

    try {
        // 1. Excluir todos os itens da categoria
        const { error: errorItens } = await supabaseClient
            .from('itens_menu')
            .delete()
            .eq('categoria_id', categoriaId);

        if (errorItens) {
            console.error("Erro ao excluir itens:", errorItens);
            return { sucesso: false, mensagem: "Erro ao excluir itens" };
        }

        // 2. Excluir categoria
        const { error: errorCategoria } = await supabaseClient
            .from('categorias')
            .delete()
            .eq('id', categoriaId);

        if (errorCategoria) {
            console.error("Erro ao excluir categoria:", errorCategoria);
            return { sucesso: false, mensagem: "Erro ao excluir categoria" };
        }

        return { sucesso: true, mensagem: "Categoria excluída" };
    } catch (error) {
        console.error("Erro ao excluir categoria:", error);
        return { sucesso: false, mensagem: "Erro no servidor" };
    }
}

// 8. SALVAR ITEM
async function salvarItem(item) {
    if (!supabaseClient) {
        console.error("Supabase não inicializado");
        return { sucesso: false, mensagem: "Erro de configuração" };
    }

    try {
        // Obter ID da categoria pelo nome
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
            categoria_id: categoria.id,
            ordem: await obterProximaOrdemItem(categoria.id)
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

            return { sucesso: true, mensagem: "Item atualizado" };
        } else {
            // Inserir novo item
            const { error } = await supabaseClient
                .from('itens_menu')
                .insert(dadosItem);

            if (error) {
                console.error("Erro ao salvar item:", error);
                return { sucesso: false, mensagem: "Erro ao salvar item" };
            }

            return { sucesso: true, mensagem: "Item salvo" };
        }
    } catch (error) {
        console.error("Erro ao salvar item:", error);
        return { sucesso: false, mensagem: "Erro no servidor" };
    }
}

// 9. EXCLUIR ITEM
async function excluirItem(itemId) {
    if (!supabaseClient) {
        console.error("Supabase não inicializado");
        return { sucesso: false, mensagem: "Erro de configuração" };
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

        return { sucesso: true, mensagem: "Item excluído" };
    } catch (error) {
        console.error("Erro ao excluir item:", error);
        return { sucesso: false, mensagem: "Erro no servidor" };
    }
}

// 10. ATUALIZAR ORDEM DAS CATEGORIAS
async function atualizarOrdemCategorias(ordemCategorias) {
    if (!supabaseClient) {
        console.error("Supabase não inicializado");
        return { sucesso: false, mensagem: "Erro de configuração" };
    }

    try {
        const updates = ordemCategorias.map((categoriaNome, index) => ({
            nome: categoriaNome,
            ordem: index + 1
        }));

        for (const update of updates) {
            const { error } = await supabaseClient
                .from('categorias')
                .update({ ordem: update.ordem })
                .eq('nome', update.nome);

            if (error) {
                console.error("Erro ao atualizar ordem:", error);
                return { sucesso: false, mensagem: "Erro ao atualizar ordem" };
            }
        }

        return { sucesso: true, mensagem: "Ordem atualizada" };
    } catch (error) {
        console.error("Erro ao atualizar ordem:", error);
        return { sucesso: false, mensagem: "Erro no servidor" };
    }
}

// ===== FUNÇÕES AUXILIARES =====
async function obterProximaOrdemCategoria() {
    if (!supabaseClient) return 1;

    const { data, error } = await supabaseClient
        .from('categorias')
        .select('ordem')
        .order('ordem', { ascending: false })
        .limit(1);

    if (error || !data || data.length === 0) {
        return 1;
    }

    return data[0].ordem + 1;
}

async function obterProximaOrdemItem(categoriaId) {
    if (!supabaseClient) return 1;

    const { data, error } = await supabaseClient
        .from('itens_menu')
        .select('ordem')
        .eq('categoria_id', categoriaId)
        .order('ordem', { ascending: false })
        .limit(1);

    if (error || !data || data.length === 0) {
        return 1;
    }

    return data[0].ordem + 1;
}

// ===== INICIALIZAÇÃO =====
async function inicializarSupabase() {
    if (!window.supabase) {
        console.error("Supabase não carregado. Inclua a biblioteca do Supabase.");
        return false;
    }

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
        console.error("Configure a URL e chave do Supabase.");
        return false;
    }

    console.log("✅ Supabase inicializado");
    return true;
}

// ===== EXPORTAR FUNÇÕES =====
window.SupabaseDB = {
    // Configuração
    inicializarSupabase,
    
    // Autenticação
    verificarSenhaAdmin,
    
    // Sistema
    carregarConfiguracoesSistema,
    salvarConfiguracoesSistema,
    
    // Categorias
    carregarCategorias,
    salvarCategoria,
    atualizarCategoria,
    excluirCategoria,
    atualizarOrdemCategorias,
    
    // Itens
    salvarItem,
    excluirItem
};

// Inicializar automaticamente
document.addEventListener('DOMContentLoaded', async () => {
    const inicializado = await inicializarSupabase();
    if (!inicializado) {
        console.warn("⚠️ Supabase não inicializado. Usando localStorage como fallback.");
    }
});
