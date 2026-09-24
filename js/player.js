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

export function renderizarLista(videos) {
  const playlistEl = document.getElementById("playlist");
  if (!playlistEl) return;
  playlistEl.innerHTML = "";
  
  videos.forEach((video, index) => {
    // Garante compatibilidade com ambas as nomenclaturas de ID do YouTube
    const videoId = video.youtubeld || video.youtubeId;
    const card = document.createElement("div");
    card.className = "video-card-item";
    card.setAttribute("tabindex", "0");
    card.setAttribute("data-index", index);
    
    const thumbUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

    card.innerHTML = `
      <div class="video-thumbnail-wrapper">
        <img src="${thumbUrl}" alt="${video.title}" onerror="this.src='https://img.youtube.com/vi/${videoId}/default.jpg'">
      </div>
      <div class="video-card-title">${video.title}</div>
    `;
    
    card.addEventListener("click", (e) => {
      e.preventDefault();
      state.kbPlaylistIndex = index;
      
      // Verifica se a função existe antes de chamar para evitar erros
      if (typeof pararModoAleatorio === "function") {
        pararModoAleatorio();
      }
      
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

// Reproduz o vídeo em modo de ecrã inteiro usando a API do YouTube para detetar o fim
export function tocarVideo(index) {
  if (!listaVideos || listaVideos.length === 0) return;
  state.currentVideoIndex = index;
  const video = listaVideos[index];
  const videoId = video.youtubeId || video.youtubeld;

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
        <div id="youtube-player-div" style="width: 100%; height: 100%;"></div>
      </div>
    `;
    
    document.body.appendChild(playerOverlay);

    document.getElementById("close-fullscreen-player").addEventListener("click", () => {
      fecharPlayerFullscreen();
    });
  }

  playerOverlay.style.display = "flex";

  // Se a API do YT estiver carregada, usamos a instância para controlar os eventos de fim de vídeo
  if (window.YT && window.YT.Player) {
    if (ytPlayerInstance && typeof ytPlayerInstance.loadVideoById === 'function') {
      ytPlayerInstance.loadVideoById(videoId);
    } else {
      ytPlayerInstance = new YT.Player('youtube-player-div', {
        height: '100%',
        width: '100%',
        videoId: videoId,
        playerVars: {
          'autoplay': 1,
          'enablejsapi': 1,
          'vq': 'hd1080',
          'hd': 1
        },
        events: {
          'onStateChange': onPlayerStateChange
        }
      });
    }
  } else {
    // Fallback caso a API demore a carregar
    const container = document.getElementById("youtube-player-div");
    if (container) {
      container.innerHTML = `<iframe src="https://www.youtube.com/embed/${videoId}?autoplay=1&enablejsapi=1&vq=hd1080&hd=1" style="width:100%; height:100%; border:none;" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
    }
  }

  if (playerOverlay.requestFullscreen) {
    playerOverlay.requestFullscreen().catch(err => console.log("Fullscreen recusado:", err));
  }
}

// Monitoriza o estado do player (deteta quando o vídeo termina: estado 0)
function onPlayerStateChange(event) {
  // 0 significa que o vídeo terminou a reprodução
  if (event.data === YT.PlayerState.ENDED) {
    verificarFimDeVideoNoModoContinuo();
  }
}

// Fecha o player em ecrã inteiro e para o vídeo
export function fecharPlayerFullscreen() {
  modoAleatorioContinuoAtivo = false;
  const playerOverlay = document.getElementById("fullscreen-player-overlay");
  if (playerOverlay) {
    playerOverlay.style.display = "none";
    if (ytPlayerInstance && typeof ytPlayerInstance.stopVideo === 'function') {
      ytPlayerInstance.stopVideo();
    }
  }
  
  if (document.fullscreenElement && document.exitFullscreen) {
    document.exitFullscreen().catch(err => console.log(err));
  }
  
  const playlistElement = document.getElementById("playlist");
  if (playlistElement) playlistElement.focus();
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