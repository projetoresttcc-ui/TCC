// --- SIMULAÇÃO DE BANCO DE DADOS ---
const dados = {
    restaurantes: [
        { id: 1, nome: "Verde Vida", tipo: "Vegano", especialidade: "Moqueca de Banana", preco: 35.00, rating: 4.8, imagem: "https://images.unsplash.com/photo-1540914124281-342d8df4a199?w=500" },
        { id: 2, nome: "Grão de Bico", tipo: "Vegetariano", especialidade: "Falafel Gourmet", preco: 28.50, rating: 4.5, imagem: "https://images.unsplash.com/photo-1593001874117-c99c800e3eb7?w=500" },
        { id: 3, nome: "Raiz Viva", tipo: "Vegano", especialidade: "Hambúrguer de Lentilha", preco: 32.00, rating: 4.9, imagem: "https://images.unsplash.com/photo-1525059696034-4967a8e1dca2?w=500" },
        { id: 4, nome: "Bio Sabor", tipo: "Vegetariano", especialidade: "Lasanha de Berinjela", preco: 29.90, rating: 4.2, imagem: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500" },
        { id: 5, nome: "Santo Tempeh", tipo: "Vegano", especialidade: "Bowl de Tempeh Grelhado", preco: 31.00, rating: 4.7, imagem: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500" }
    ],
    cardapioDoDia: {
        nome: "Bowl Tropical de Quinoa e Manga",
        restaurante: "Verde Vida",
        preco: 34.90,
        descricao: "Mix de folhas, quinoa real, cubos de manga fresca e molho de maracujá.",
        imagem: "https://images.unsplash.com/photo-1546069901-eacef0df6022?w=500"
    }
};

// --- CONTROLE DO CARRINHO ---
let carrinho = JSON.parse(localStorage.getItem('veggieCarrinho')) || [];

// --- FEEDBACK VISUAL (TOAST) ---
function mostrarToast(mensagem) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span>🌿</span> ${mensagem}`;
    document.body.appendChild(toast);

    const contador = document.getElementById('cart-counter');
    if (contador) {
        contador.classList.add('cart-pop');
        setTimeout(() => contador.classList.remove('cart-pop'), 300);
    }

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = '0.5s';
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

function atualizarContador() {
    const contador = document.getElementById('cart-counter');
    if (contador) contador.innerText = carrinho.length;
}

function adicionarAoCarrinho(id) {
    const item = dados.restaurantes.find(r => r.id === id);
    if (item) {
        carrinho.push(item);
        localStorage.setItem('veggieCarrinho', JSON.stringify(carrinho));
        atualizarContador();
        mostrarToast(`${item.especialidade} adicionado!`);
    }
}

// --- BUSCA ---
function buscar() { 
    const input = document.getElementById('searchInput');
    const termo = input ? input.value : "";
    window.location.href = `restaurantes.html?busca=${encodeURIComponent(termo)}`;
}

function filtrarRestaurantes() {
    const input = document.getElementById('innerSearchInput');
    const termo = input ? input.value.toLowerCase() : "";
    const container = document.getElementById('listaRestaurantes');
    if (!container) return;

    const filtrados = dados.restaurantes.filter(res => 
        res.nome.toLowerCase().includes(termo) || res.especialidade.toLowerCase().includes(termo)
    );

    container.innerHTML = filtrados.map(res => `
        <div class="card">
            <img src="${res.imagem}" class="card-img" style="width:100%; height:150px; object-fit:cover; border-radius:10px;">
            <p class="tag">${res.tipo}</p>
            <h3>${res.nome}</h3>
            <p><strong>Prato:</strong> ${res.especialidade}</p>
            <p><strong>Preço:</strong> R$ ${res.preco.toFixed(2)}</p>
            <button onclick="adicionarAoCarrinho(${res.id})" style="width:100%; background:#8db600; color:white; border:none; padding:10px; border-radius:20px; cursor:pointer; margin:10px 0;">Adicionar ao Pedido</button>
            <div class="rating-box">
                <span class="nota-numero">⭐ ${res.rating}</span>
            </div>
        </div>
    `).join('');
}

// --- FUNÇÕES DO CARRINHO ---
function renderizarCarrinho() {
    const container = document.getElementById('lista-carrinho');
    const totalElemento = document.getElementById('valor-total');
    if (!container) return;

    if (carrinho.length === 0) {
        container.innerHTML = "<p>O seu carrinho está vazio. Adicione pratos na aba Restaurantes!</p>";
        totalElemento.innerText = "R$ 0,00";
        return;
    }

    let total = 0;
    container.innerHTML = carrinho.map((item, index) => {
        total += item.preco;
        return `
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #eee; padding:10px 0;">
                <span>${item.especialidade} (${item.nome})</span>
                <strong>R$ ${item.preco.toFixed(2)}</strong>
            </div>`;
    }).join('');
    totalElemento.innerText = `R$ ${total.toFixed(2)}`;
}

function limparCarrinho() {
    carrinho = [];
    localStorage.removeItem('veggieCarrinho');
    renderizarCarrinho();
    atualizarContador();
    const checkoutDiv = document.getElementById('checkout-container');
    if (checkoutDiv) checkoutDiv.style.display = 'none';
}

function finalizarPedido() {
    if (carrinho.length === 0) return alert("O seu carrinho está vazio!");
    const checkoutDiv = document.getElementById('checkout-container');
    if (checkoutDiv) {
        checkoutDiv.style.display = 'block';
        checkoutDiv.scrollIntoView({ behavior: 'smooth' });
    }
}

function confirmarPedido() {
    const nome = document.getElementById('nome').value;
    const endereco = document.getElementById('endereco').value;
    const pagamento = document.getElementById('pagamento').value;

    if (!nome || !endereco) {
        return alert("Por favor, preencha o nome e o endereço para a entrega!");
    }

    // Calcula o total para a mensagem
    const total = carrinho.reduce((sum, item) => sum + item.preco, 0);
    const itensNomes = carrinho.map(item => `- ${item.especialidade} (${item.nome})`).join('\n');

    // Monta a mensagem do WhatsApp
    const mensagem = `*Novo Pedido - VeggieFinder* 🌿\n\n` +
                     `*Cliente:* ${nome}\n` +
                     `*Endereço:* ${endereco}\n` +
                     `*Pagamento:* ${pagamento.toUpperCase()}\n\n` +
                     `*Itens:*\n${itensNomes}\n\n` +
                     `*Total: R$ ${total.toFixed(2)}*`;

    const mensagemUrl = encodeURIComponent(mensagem);
    const numeroWhats = "5538991940330"; 
    
    // Abre o WhatsApp em nova aba
    window.open(`https://wa.me/${numeroWhats}?text=${mensagemUrl}`, '_blank');

    // --- AQUI ACONTECE A MÁGICA DA ETAPA 3 ---
    // Substituímos o conteúdo da seção 'meu-carrinho' pela tela de sucesso
    const containerPrincipal = document.getElementById('meu-carrinho');
    
    if (containerPrincipal) {
        containerPrincipal.innerHTML = `
            <div class="sucesso-container" style="text-align: center; padding: 60px 20px; background: white; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); margin-top: 20px;">
                <div style="font-size: 80px; margin-bottom: 20px;">✅</div>
                <h2 style="color: #2d5a27; font-size: 2rem; margin-bottom: 10px;">Pedido Enviado com Sucesso!</h2>
                <p style="font-size: 1.1rem; color: #666; margin-bottom: 30px;">
                    Obrigado, <strong>${nome}</strong>! <br> 
                    As informações foram enviadas para o restaurante via WhatsApp.
                </p>
                <div style="background: #f0f7f0; padding: 20px; border-radius: 15px; display: inline-block; margin-bottom: 30px; text-align: left;">
                    <p style="margin: 5px 0;"><strong>Resumo do Envio:</strong></p>
                    <p style="margin: 5px 0; color: #555;">📍 Endereço: ${endereco}</p>
                    <p style="margin: 5px 0; color: #555;">💰 Total: R$ ${total.toFixed(2)}</p>
                </div>
                <br>
                <a href="index.html" style="text-decoration: none; background: #8db600; color: white; padding: 15px 35px; border-radius: 30px; font-weight: bold; transition: 0.3s; box-shadow: 0 4px 15px rgba(141, 182, 0, 0.3);">
                    Voltar para o Início
                </a>
            </div>
        `;
        
        // Rola a tela para o topo da mensagem de sucesso
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Limpa os dados do carrinho após o sucesso
    limparCarrinho();
}

// --- INICIALIZAÇÃO ---
window.onload = () => {
    atualizarContador();
    if (document.getElementById('listaRestaurantes')) filtrarRestaurantes();
    if (document.getElementById('lista-carrinho')) renderizarCarrinho();
    
    const containerCardapio = document.getElementById('pratoDestaque');
    if (containerCardapio) {
        containerCardapio.innerHTML = `
            <div class="card-destaque">
                <img src="${dados.cardapioDoDia.imagem}" style="width:100%; max-width:400px; border-radius:15px; margin-bottom:15px;">
                <h3>${dados.cardapioDoDia.nome}</h3>
                <p>${dados.cardapioDoDia.descricao}</p>
                <p><strong>R$ ${dados.cardapioDoDia.preco.toFixed(2)}</strong></p>
                <button onclick="adicionarAoCarrinho(1)" style="width:100%; max-width:300px; background:#8db600; color:white; border:none; padding:15px; border-radius:30px; cursor:pointer; font-weight:bold; margin-top:15px;">Adicionar ao Pedido</button>
            </div>`;
    }
};

let filtroAtivo = 'Todos';

function toggleDropdown() {
    const dropdown = document.getElementById('dropdownFiltro');
    if (dropdown) dropdown.classList.toggle('active');
}

function selecionarFiltro(tipo) {
    filtroAtivo = tipo;
    const label = document.getElementById('selectedOption');
    if (label) label.innerText = tipo;
    toggleDropdown();
    filtrarRestaurantes();
}

function filtrarRestaurantes() {
    const input = document.getElementById('innerSearchInput');
    const termo = input ? input.value.toLowerCase() : "";
    const container = document.getElementById('listaRestaurantes');
    if (!container) return;

    const filtrados = dados.restaurantes.filter(res => {
        const correspondeBusca = res.nome.toLowerCase().includes(termo) || res.especialidade.toLowerCase().includes(termo);
        const correspondeFiltro = (filtroAtivo === 'Todos' || res.tipo === filtroAtivo);
        return correspondeBusca && correspondeFiltro;
    });

    if (filtrados.length === 0) {
        container.innerHTML = `<p style="grid-column: 1/-1; text-align: center; padding: 20px;">Nenhum resultado encontrado.</p>`;
        return;
    }

    container.innerHTML = filtrados.map(res => `
        <div class="card">
            <img src="${res.imagem}" class="card-img">
            
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 0 5px; margin-bottom: 10px;">
                <p class="tag" style="margin: 0;">${res.tipo}</p>
                <a href="https://www.google.com.br/maps/search/${encodeURIComponent(res.nome)}" target="_blank" 
                   style="color: #664; text-decoration: none; font-size: 0.7rem; font-weight: bold; display: flex; align-items: center; gap: 3px;">
                     Ver Mapa
                </a>
            </div>

            <h3 style="margin-bottom: 5px;">${res.nome}</h3>
            <p style="font-size: 0.9rem; color: #555;"><strong>Prato:</strong> ${res.especialidade}</p>
            <p style="font-size: 1.1rem; color: #2d5a27; font-weight: bold; margin: 5px 0;">R$ ${res.preco.toFixed(2)}</p>
            
            <div style="border-top: 1px solid #eee; padding-top: 10px; margin-top: 10px;">
                <span style="color: ${res.id % 2 === 0 ? '#2d5a27' : '#e67e22'}; font-size: 0.8rem; font-weight: bold; display: flex; align-items: center; gap: 5px;">
                    ${res.id % 2 === 0 ? '🚚 Entrega Grátis' : `🚚 Frete: R$ 5,90`}
                </span>
            </div>

            <button class="btn-adicionar" onclick="adicionarAoCarrinho(${res.id})" style="margin-top: 12px;">
                Adicionar ao Pedido
            </button>

            <div class="rating-box" style="margin-top: 10px;">
                <span class="nota-numero" style="font-size: 0.9rem;">★ ${res.rating}</span>
            </div>
        </div>
    `).join('');
}