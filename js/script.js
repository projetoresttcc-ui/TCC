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

function atualizarContador() {
    const contador = document.getElementById('cart-counter');
    if (contador) contador.innerText = carrinho.length;
}

function adicionarAoCarrinho(id) {
    const item = dados.restaurantes.find(r => r.id === id);
    carrinho.push(item);
    localStorage.setItem('veggieCarrinho', JSON.stringify(carrinho));
    atualizarContador();
    alert(`${item.especialidade} adicionado ao carrinho! 🥗`);
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

// --- FUNÇÕES DA PÁGINA DE CARRINHO ---
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
    // Esconde o checkout se ele estiver aberto
    const checkoutDiv = document.getElementById('checkout-container');
    if (checkoutDiv) checkoutDiv.style.display = 'none';
}

function finalizarPedido() {
    if (carrinho.length === 0) {
        return alert("O seu carrinho está vazio!");
    }
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
        return alert("Por favor, preencha o nome e o endereço!");
    }

    const total = carrinho.reduce((sum, item) => sum + item.preco, 0);
    const itensNomes = carrinho.map(item => `- ${item.especialidade} (${item.nome})`).join('\n');

    // Cria a mensagem para o WhatsApp
    const mensagem = `*Novo Pedido - VeggieFinder* 🌿\n\n` +
                     `*Cliente:* ${nome}\n` +
                     `*Endereço:* ${endereco}\n` +
                     `*Pagamento:* ${pagamento.toUpperCase()}\n\n` +
                     `*Itens:*\n${itensNomes}\n\n` +
                     `*Total: R$ ${total.toFixed(2)}*`;

    // Codifica para URL (substitui espaços e símbolos)
    const mensagemUrl = encodeURIComponent(mensagem);
    
    // Substitua o '5500000000000' pelo seu número (com DDD)
    const numeroWhats = "(38)991940330"; 
    
    alert("Pedido confirmado! Abrindo seu WhatsApp...");
    
    window.open(`https://wa.me/${numeroWhats}?text=${mensagemUrl}`, '_blank');

    limparCarrinho();
}

// --- INICIALIZAÇÃO ---
window.onload = () => {
    atualizarContador();
    if (document.getElementById('listaRestaurantes')) filtrarRestaurantes();
    if (document.getElementById('lista-carrinho')) renderizarCarrinho();
    
    const containerCardapio = document.getElementById('pratoDestaque');
    if (containerCardapio) {
        // Buscamos o ID do restaurante "Verde Vida" (que é o 1) para o botão funcionar
        const restauranteId = 1; 

        containerCardapio.innerHTML = `
            <div class="card-destaque">
                <img src="https://images.unsplash.com/photo-1546069901-eacef0df6022?w=500" style="width:100%; max-width:400px; border-radius:15px; margin-bottom:15px;">
                <span class="tag">Destaque do Dia</span>
                <h3>${dados.cardapioDoDia.nome}</h3>
                <p>Restaurante: <strong>${dados.cardapioDoDia.restaurante}</strong></p>
                <p class="descricao">${dados.cardapioDoDia.descricao}</p>
                <p class="preco">R$ ${dados.cardapioDoDia.preco.toFixed ? dados.cardapioDoDia.preco.toFixed(2) : "34.90"}</p>
                
                <button onclick="adicionarAoCarrinho(${restauranteId})" style="width:100%; max-width:300px; background:#8db600; color:white; border:none; padding:15px; border-radius:30px; cursor:pointer; font-weight:bold; margin-top:15px; font-size:1rem;">
                    Adicionar Sugestão ao Pedido
                </button>
            </div>`;
    }
};