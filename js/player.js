/* ==========================================
   GESTOR DO PLAYER E DA LISTA DE VÍDEOS
   ========================================== */
import { state } from './state.js';
import { listaVideos } from '../data/videos.js';

let modoAleatorioContinuoAtivo = false;

// Inicializa a API do YouTube se necessário ou gere o player
export function initPlayer() {
  const btnRandom = document.querySelector(".btn-random-tv");
  if (btnRandom) {
    btnRandom.replaceWith(btnRandom.cloneNode(true));
    const novoBtnRandom = document.querySelector(".btn-random-tv");
    novoBtnRandom.addEventListener("click", () => {
      iniciarVideosAleatoriosContinuos();
    });
  }
}

// Renderiza a grelha de vídeos no HTML
export function renderizarLista(videos) {
  const playlistEl = document.getElementById("playlist");
  if (!playlistEl) return;
  playlistEl.innerHTML = "";
  
  videos.forEach((video, index) => {
    const videoId = video.youtubeId || video.youtubeld;
    const card = document.createElement("div");
    card.className = "video-card-item";
    card.setAttribute("tabindex", "-1");
    card.setAttribute("data-index", index);
    card.innerHTML = `
      <div class="video-thumbnail-wrapper">
        <img src="https://img.youtube.com/vi/${videoId}/hqdefault.jpg" alt="${video.title}">
      </div>
      <div class="video-card-title">${video.title}</div>
    `;
    card.addEventListener("click", () => {
      pararModoAleatorio();
      tocarVideo(index);
    });
    playlistEl.appendChild(card);
  });
}

// Carrega a playlist e foca o primeiro elemento
export function carregarPlaylist() {
  renderizarLista(listaVideos);
  if (listaVideos.length > 0) {
    if (state.currentVideoIndex < 0) state.currentVideoIndex = 0;
    state.kbPlaylistIndex = 0;
  }
  const playlistElement = document.getElementById("playlist");
  if (playlistElement) {
    playlistElement.setAttribute("tabindex", "0");
    playlistElement.focus();
    focarCartaoVideo(0);
  }
}

// Foca visualmente um cartão específico na grelha por teclado
export function focarCartaoVideo(index) {
  const cards = document.querySelectorAll(".video-card-item");
  cards.forEach((card, i) => {
    if (i === index) {
      card.classList.add("kb-focus");
      card.scrollIntoView({ behavior: "smooth", block: "nearest" });
    } else {
      card.classList.remove("kb-focus");
    }
  });
}

// Reproduz o vídeo em modo de ecrã inteiro (Overlay dedicado) com alta qualidade forçada
export function tocarVideo(index) {
  if (!listaVideos || listaVideos.length === 0) return;
  state.currentVideoIndex = index;
  const video = listaVideos[index];
  const videoId = video.youtubeId || video.youtubeld;

  // Procura ou cria o overlay de ecrã inteiro para o player
  let playerOverlay = document.getElementById("fullscreen-player-overlay");
  
  if (!playerOverlay) {
    playerOverlay = document.createElement("div");
    playerOverlay.id = "fullscreen-player-overlay";
    playerOverlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: #000;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    `;
    
    playerOverlay.innerHTML = `
      <button id="close-fullscreen-player" style="
        position: absolute;
        top: 20px;
        right: 25px;
        background: rgba(0, 0, 0, 0.6);
        color: #fff;
        border: 2px solid #c5a059;
        font-size: 1.5rem;
        padding: 5px 15px;
        border-radius: 6px;
        cursor: pointer;
        z-index: 10000;
      ">✕ Fechar</button>
      <div style="position: relative; width: 100%; height: 100%;">
        <iframe id="youtube-fullscreen-iframe" src="" style="width: 100%; height: 100%; border: none;" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          allowfullscreen>
        </iframe>
      </div>
    `;
    
    document.body.appendChild(playerOverlay);

    // Evento para fechar o player de ecrã inteiro e voltar à lista
    document.getElementById("close-fullscreen-player").addEventListener("click", () => {
      fecharPlayerFullscreen();
    });
  }

  // Parâmetros para incentivar o player a carregar em alta definição (HD)
  const iframe = document.getElementById("youtube-fullscreen-iframe");
  if (iframe) {
    iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&enablejsapi=1&vq=hd1080&hd=1`;
  }

  playerOverlay.style.display = "flex";

  // Ativa o Fullscreen nativo do navegador para maximizar os píxeis
  if (playerOverlay.requestFullscreen) {
    playerOverlay.requestFullscreen().catch(err => console.log("Fullscreen nativo recusado:", err));
  }
}

// Fecha o player em ecrã inteiro e para o vídeo
export function fecharPlayerFullscreen() {
  const playerOverlay = document.getElementById("fullscreen-player-overlay");
  if (playerOverlay) {
    playerOverlay.style.display = "none";
    const iframe = document.getElementById("youtube-fullscreen-iframe");
    if (iframe) iframe.src = ""; // Para a reprodução do vídeo
  }
  
  if (document.fullscreenElement && document.exitFullscreen) {
    document.exitFullscreen().catch(err => console.log(err));
  }
  
  pararModoAleatorio();
  
  // Devolve o foco à grelha de vídeos
  const playlistElement = document.getElementById("playlist");
  if (playlistElement) playlistElement.focus();
}

// Função para iniciar o modo de vídeos aleatórios contínuos
export function iniciarVideosAleatoriosContinuos() {
  if (!listaVideos || listaVideos.length === 0) return;
  modoAleatorioContinuoAtivo = true;
  const randomIndex = Math.floor(Math.random() * listaVideos.length);
  tocarVideo(randomIndex);
}

// Interrompe o modo contínuo aleatório
export function pararModoAleatorio() {
  modoAleatorioContinuoAtivo = false;
}

// Verifica fim de vídeo no modo contínuo
export function verificarFimDeVideoNoModoContinuo() {
  if (modoAleatorioContinuoAtivo) {
    const proximoAleatorio = Math.floor(Math.random() * listaVideos.length);
    tocarVideo(proximoAleatorio);
  }
}

// Filtra os vídeos com base no termo digitado na barra de pesquisa
export function filtrarVideos() {
  const searchInput = document.getElementById("search-input");
  if (!searchInput) return;
  
  const termo = searchInput.value.toLowerCase().trim();
  const cards = document.querySelectorAll(".video-card-item");
  
  cards.forEach(card => {
    const titulo = card.querySelector(".video-card-title").textContent.toLowerCase();
    if (titulo.includes(termo)) {
      card.style.display = "flex";
    } else {
      card.style.display = "none";
    }
  });
}