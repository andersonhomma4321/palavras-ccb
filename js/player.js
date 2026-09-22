/* ==========================================
   GESTOR DO PLAYER E DA LISTA DE VÍDEOS
   ========================================== */
import { state } from './state.js';
import { listaVideos } from '../data/videos.js';

let player = null;
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

// Reproduz um vídeo específico com base no índice original da lista
export function tocarVideo(index) {
  if (!listaVideos || listaVideos.length === 0) return;
  state.currentVideoIndex = index;
  const video = listaVideos[index];
  const videoId = video.youtubeId || video.youtubeld;
  
  let iframePlayer = document.getElementById("youtube-player");
  if (iframePlayer) {
    iframePlayer.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&enablejsapi=1`;
  } else {
    console.log("A reproduzir vídeo:", video.title);
  }
}

// Função para iniciar o modo de vídeos aleatórios contínuos
export function iniciarVideosAleatoriosContinuos() {
  if (!listaVideos || listaVideos.length === 0) return;
  modoAleatorioContinuoAtivo = true;
  const randomIndex = Math.floor(Math.random() * listaVideos.length);
  tocarVideo(randomIndex);
  
  const appContainer = document.getElementById("app-container");
  if (appContainer && appContainer.requestFullscreen) {
    appContainer.requestFullscreen().catch(err => console.log("Fullscreen negado:", err));
  }
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