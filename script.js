// Seleciona o canvas no HTML e o contexto 2D para desenhar no canvas 
const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');

// Array para armazenar os quadrados (tiles)
var tiles = [];

// Define o número de quadrados no eixo X e Y, e a quantidade de bombas
const nTilesX = 10;
const nTilesY = 10;
const nBombs = 10;

// Classe Tile (quadrado) que representa cada célula no tabuleiro
class Tile {
    constructor(i, j) {
        this.i = i;             // Posição X do quadrado no tabuleiro
        this.j = j;             // Posição Y do quadrado no tabuleiro
        this.isBomb = false;    // Se o quadrado é uma bomba
        this.isOpen = false;    // Se o quadrado foi aberto
        this.bombsAround = 0;   // Número de bombas ao redor desse quadrado
        this.marked = false;    // Se o quadrado foi marcado como suspeita de bomba
        this.openedAround = false; // Se os quadrados ao redor já foram abertos
    }
}

// Função para gerar todos os quadrados (tiles) do tabuleiro
function generateTiles() {
    for (let i = 0; i < nTilesX; i++) {
        for (let j = 0; j < nTilesY; j++) {
            let tile = new Tile(i, j); // Cria uma nova instância de Tile para cada posição
            tiles.push(tile);          // Adiciona o quadrado ao array de tiles
        }
    }
}

// Função para distribuir as bombas aleatoriamente no tabuleiro
function generateBombs() {
    for (let i = 0; i < nBombs; i++) {
        let random = Math.floor(Math.random() * tiles.filter(t => !t.isBomb).length);
        // Seleciona um quadrado aleatório que ainda não tenha uma bomba e marca como bomba
        tiles.filter(t => !t.isBomb)[random].isBomb = true;
    }
}

// Função que calcula o número de bombas ao redor de um quadrado específico
function calculateNBombsAround(tile) {
    let bombCounter = 0;
    // Varre todos os quadrados ao redor (na matriz de 3x3 ao redor do quadrado)
    for (let i = tile.i - 1; i <= tile.i + 1; i++) {
        for (let j = tile.j - 1; j <= tile.j + 1; j++) {
            if (i != tile.i || j != tile.j) { // Ignora o próprio quadrado
                // Se o quadrado vizinho for uma bomba, incrementa o contador
                if (getTile(i, j)?.isBomb) bombCounter += 1;
            }
        }
    }
    return bombCounter; // Retorna o número de bombas ao redor
}

// Função que calcula o número de bombas ao redor para todos os quadrados do tabuleiro
function calculateAllBombsAround() {
    tiles.forEach(tile => {
        tile.bombsAround = calculateNBombsAround(tile); // Atualiza a propriedade bombsAround
    });
}

// Função para obter um quadrado específico baseado em suas coordenadas (i, j)
function getTile(i, j) {
    return tiles.find(t => t.i == i && t.j == j); // Retorna o quadrado que está na posição (i, j)
}

// Função que desenha todo o tabuleiro no canvas
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpa o canvas
    tiles.forEach(t => {
        drawTile(t); // Chama a função drawTile para desenhar cada quadrado
    });
}

// Função para desenhar um quadrado específico no canvas
function drawTile(tile) {
    let x = (tile.i * 51) + 1; // Calcula a posição X no canvas
    let y = (tile.j * 51) + 1; // Calcula a posição Y no canvas

    if (tile.isOpen) { // Se o quadrado foi aberto
        if (tile.isBomb) {
            ctx.fillStyle = "#ff0000"; // Se for uma bomba, pinta o quadrado de vermelho
            ctx.fillRect(x, y, 50, 50);
        } else {
            ctx.fillStyle = "#999999"; // Se não for uma bomba, pinta de cinza
            ctx.fillRect(x, y, 50, 50);
            if (tile.bombsAround) { // Se houver bombas ao redor, exibe o número de bombas
                ctx.font = "30px Arial";
                ctx.textAlign = "center";
                ctx.fillStyle = getColorForNumber(tile.bombsAround); // Cor do número
                ctx.fillText(tile.bombsAround, x + 25, y + 30); // Exibe o número de bombas
            }
        }
    } else { // Se o quadrado não foi aberto
        ctx.fillStyle = tile.marked ? "#0000ff" : "#aaaaaa"; // Se marcado, pinta de azul, senão cinza claro
        ctx.fillRect(x, y, 50, 50);
    }
}

// Função que retorna a cor para o número de bombas ao redor
function getColorForNumber(number) {
    switch(number) {
        case 1: return "#0000ff"; // Azul para 1 bomba ao redor
        case 2: return "#00ff00"; // Verde para 2 bombas ao redor
        case 3: return "#ff0000"; // Vermelho para 3 bombas ao redor
        case 4: return "#000000"; // Preto para 4 bombas ao redor
        case 5: return "#800000"; // Marrom escuro para 5 bombas ao redor
        case 6: return "#00ffff"; // Azul marinho para 6 bombas ao redor
        case 7: return "#ff00ff"; // Roxo para 7 bombas ao redor
        case 8: return "#808080"; // Cinza para 8 bombas ao redor
        default: return "#000000"; // Preto para qualquer outro número
    }
}

// Função que abre um quadrado quando clicado
function openTile(tile) {
    tile.isOpen = true; // Marca o quadrado como aberto
    if (!tile.openedAround && tile.bombsAround == 0) openAround(tile); // Se não há bombas ao redor, abre os vizinhos
}

// Função que abre os quadrados ao redor de um quadrado
function openAround(tile) {
    tile.openedAround = true; // Marca como já aberto ao redor
    for (let i = tile.i - 1; i <= tile.i + 1; i++) {
        for (let j = tile.j - 1; j <= tile.j + 1; j++) {
            if (i != tile.i || j != tile.j) {
                const currentTile = getTile(i, j); // Obtém o quadrado vizinho
                if (currentTile && !currentTile.isBomb && !currentTile.isOpen) openTile(currentTile); // Abre se não for bomba
            }
        }
    }
}

// Função que inicia o jogo
function startGame() {
    tiles = []; // Reseta o array de tiles
    generateTiles(); // Gera os quadrados do tabuleiro
    generateBombs(); // Coloca as bombas no tabuleiro
    calculateAllBombsAround(); // Calcula as bombas ao redor de cada quadrado
    draw(); // Desenha o tabuleiro
    document.getElementById('bombs-count').textContent = nBombs; // Atualiza o contador de bombas
    document.getElementById('game-container').style.display = 'block'; // Mostra o container do jogo
}

// Função que atualiza o temporizador do jogo
function updateTimer() {
    let startTime = Date.now(); // Registra o tempo inicial
    let timerElement = document.getElementById('timer'); // Seleciona o elemento do temporizador
    setInterval(() => {
        let elapsedTime = Math.floor((Date.now() - startTime) / 1000); // Calcula o tempo passado em segundos
        timerElement.textContent = elapsedTime; // Atualiza o texto do temporizador
    }, 1000); // Atualiza a cada segundo
}

// Função que lida com o clique do jogador no canvas
canvas.addEventListener("click", e => {
    if (document.getElementById('game-container').style.display === 'none') return; // Se o jogo terminou, não faz nada

    const rect = canvas.getBoundingClientRect(); // Obtém a posição do canvas
    const mouseX = e.clientX - rect.left; // Calcula a posição X do clique
    const mouseY = e.clientY - rect.top; // Calcula a posição Y do clique

    const i = Math.floor((mouseX / canvas.width) * nTilesX); // Calcula a coluna clicada
    const j = Math.floor((mouseY / canvas.height) * nTilesY); // Calcula a linha clicada

    let tile = getTile(i, j); // Obtém o quadrado correspondente ao clique
    if (tile) {
        if (tile.isBomb) {
            alert('Você perdeu! Recarregue a pagina para jogar novamente :)'); // Se o quadrado for bomba, o jogador perde
        }
        openTile(tile); // Abre o quadrado
        draw(); // Redesenha o tabuleiro
        checkWinCondition(); // Verifica se o jogador ganhou
    }
});

// Função que lida com o clique do botão direito (marcar bandeira)
canvas.addEventListener("contextmenu", e => {
    if (document.getElementById('game-container').style.display === 'none') return; // Se o jogo terminou, não faz nada

    e.preventDefault(); // Evita o menu padrão de contexto
    const rect = canvas.getBoundingClientRect(); // Obtém a posição do canvas
    const mouseX = e.clientX - rect.left; // Calcula a posição X do clique
    const mouseY = e.clientY - rect.top; // Calcula a posição Y do clique

    const i = Math.floor((mouseX / canvas.width) * nTilesX); // Calcula a coluna clicada
    const j = Math.floor((mouseY / canvas.height) * nTilesY); // Calcula a linha clicada

    let tile = getTile(i, j); // Obtém o quadrado correspondente ao clique
    if (tile) {
        tile.marked = !tile.marked; // Alterna a marcação de bandeira
        draw(); // Redesenha o tabuleiro
        const markedBombs = tiles.filter(t => t.marked && t.isBomb).length; // Conta as bombas corretamente marcadas
        document.getElementById('bombs-count').textContent = nBombs - markedBombs; // Atualiza o contador de bombas
    }
});

// Função que verifica se o jogador ganhou
function checkWinCondition() {
    const revealedTiles = tiles.filter(t => t.isOpen); // Conta os quadrados abertos
    if (revealedTiles.length === (nTilesX * nTilesY - nBombs)) { // Se todos os quadrados sem bombas foram abertos
        alert('Parabéns! Você ganhou!'); // Mostra a mensagem de vitória
        document.getElementById('game-container').style.display = 'none'; // Esconde o container do jogo
    }
}

// Evento que inicia o jogo e o temporizador quando a página carrega
document.addEventListener('DOMContentLoaded', () => {
    startGame(); // Inicia o jogo
    updateTimer(); // Inicia o temporizador
});
