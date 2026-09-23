/* ==========================================
   GESTOR DO PLAYER E DA LISTA DE VÍDEOS
   ========================================== */
import { state } from './state.js';
import { listaVideos } from '../data/videos.js';

let modoAleatorioContinuoAtivo = false;
let ytPlayerInstance = null;

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

  // Carrega o script da API do YouTube IFrame se ainda não existir
  if (!window.YT) {
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
  }
}

// Global callback exigido pela API do YouTube
window.onYouTubeIframeAPIReady = function() {
  // A API está pronta, o player será criado sob demanda no overlay
};

// Renderiza a grelha de vídeos no HTML com eventos de clique diretos e seguros
export function renderizarLista(videos) {
  const playlistEl = document.getElementById("playlist");
  if (!playlistEl) return;
  playlistEl.innerHTML = "";
  
  videos.forEach((video, index) => {
    const videold = video.youtubeld || video.youtubeId;
    const card = document.createElement("div");
    card.className = "video-card-item";
    card.setAttribute("tabindex", "0");
    card.setAttribute("data-index", index);
    
    const thumbUrl = `https://img.youtube.com/vi/${videold}/hqdefault.jpg`;

    card.innerHTML = `
      <div class="video-thumbnail-wrapper" style="pointer-events: none;">
        <img src="${thumbUrl}" alt="${video.title}" onerror="this.src='https://img.youtube.com/vi/${videold}/default.jpg'">
      </div>
      <div class="video-card-title" style="pointer-events: none;">${video.title}</div>
    `;
    
    // Disparador universal de clique e toque para PC e telemóvel
    const acionarPlay = (e) => {
      e.stopPropagation();
      e.preventDefault();
      
      // Atualiza o estado global se ele existir
      if (typeof state !== 'undefined') {
        state.kbPlaylistIndex = index;
        state.currentVideoIndex = index;
      }
      
      if (typeof pararModoAleatorio === 'function') {
        pararModoAleatorio();
      }
      
      // Executa diretamente a abertura do vídeo
      tocarVideo(index);
    };

    // Adiciona tanto no mousedown/touchstart quanto no click para garantir resposta instantânea
    card.addEventListener("click", acionarPlay);
    card.addEventListener("touchend", acionarPlay);

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

// Reproduz o vídeo em ecrã inteiro usando a API do YouTube ou fallback seguro
export function tocarVideo(index) {
  if (!listaVideos || listaVideos.length === 0) return;
  state.currentVideoIndex = index;
  const video = listaVideos[index];
  const videold = video.youtubeld || video.youtubeId;

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
        background: rgba(0, 0, 0, 0.8);
        color: #fff;
        border: 2px solid #c5a059;
        font-size: 1.2rem;
        padding: 8px 16px;
        border-radius: 6px;
        cursor: pointer;
        z-index: 10000;
      ">✕ Fechar</button>
      <div style="position: relative; width: 100%; height: 100%; display: flex; justify-content: center; align-items: center;">
        <div id="youtube-player-div" style="width: 100%; height: 100%;"></div>
      </div>
    `;
    document.body.appendChild(playerOverlay);
    document.getElementById("close-fullscreen-player").addEventListener("click", () => {
      fecharPlayerFullscreen();
    });
  }

  playerOverlay.style.display = "flex";

  // Utiliza o iframe direto como fallback primário para garantir compatibilidade imediata no telemóvel e PC ao clicar
  const container = document.getElementById("youtube-player-div");
  if (container) {
    container.innerHTML = `<iframe src="https://www.youtube.com/embed/${videold}?autoplay=1&enablejsapi=1&vq=hd1080&hd=1" style="width: 100%; height: 100%; border:none;" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
  }

  // Tenta o pedido de ecrã inteiro de forma segura (sem bloquear se o navegador recusar)
  if (playerOverlay.requestFullscreen) {
    playerOverlay.requestFullscreen().catch(err => console.log("Fullscreen recusado pelo navegador:", err));
  }
}

// Monitoriza o estado do player (deteta quando o vídeo termina: estado 0)
function onPlayerStateChange(event) {
  // 0 significa que o vídeo terminou a reprodução
  if (event.data === YT.PlayerState.ENDED) {
    verificarFimDeVideoNoModoContinuo();
  }
}

export function fecharPlayerFullscreen() {
  const playerOverlay = document.getElementById("fullscreen-player-overlay");
  if (playerOverlay) {
    playerOverlay.style.display = "none";
    
    // Limpa completamente o conteúdo HTML do player (destrói o iframe e corta o áudio imediatamente)
    const container = document.getElementById("youtube-player-div");
    if (container) {
      container.innerHTML = "";
    }
  }

  // Se estiver a usar a API oficial do YouTube (YT.Player), destrói a instância se existir
  if (typeof player !== 'undefined' && player && typeof player.stopVideo === 'function') {
    try {
      player.stopVideo();
      player.destroy();
    } catch (e) {
      console.log("Erro ao parar o player do YouTube:", e);
    }
  }

  // Sai do modo de ecrã inteiro do navegador, se estiver ativo
  if (document.fullscreenElement) {
    document.exitFullscreen().catch(err => console.log("Erro ao sair do fullscreen:", err));
  }
}

// Inicia o modo de vídeos aleatórios contínuos
export function iniciarVideosAleatoriosContinuos() {
  if (!listaVideos || listaVideos.length === 0) return;
  modoAleatorioContinuoAtivo = true;
  const randomIndex = Math.floor(Math.random() * listaVideos.length);
  tocarVideo(randomIndex);
}

// Avança para o próximo vídeo aleatório quando o atual termina
export function verificarFimDeVideoNoModoContinuo() {
  if (modoAleatorioContinuoAtivo && listaVideos.length > 0) {
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