import { listaVideos } from "../data/videos.js";
import { state } from "./state.js";

export function carregarPlaylist() {
  renderizarLista(listaVideos);
  if (listaVideos.length > 0) {
    if (state.currentVideoIndex < 0) state.currentVideoIndex = 0;
    const videoInicial = listaVideos[state.currentVideoIndex];
    atualizarTextoElemento("current-title", videoInicial.title);
    renderizarIframePlayer(videoInicial.youtubeId);
  } else {
    atualizarTextoElemento("current-title", "Nenhum vídeo disponível");
  }
}

function renderizarIframePlayer(videoId) {
  const host = document.getElementById("youtube-player-host");
  if (!host) return;

  // Pega a origem atual da página (funciona perfeitamente no GitHub Pages)
  const currentOrigin = window.location.origin;

  // Limpa o container e injeta o iframe diretamente, garantindo 1080p, controlos e sem erros de postMessage
  host.innerHTML = `
    <iframe 
      id="yt-iframe-engine"
      width="100%" 
      height="100%" 
      src="https://www.youtube.com/embed/${videoId}?autoplay=1&controls=1&rel=0&enablejsapi=1&vq=hd1080&origin=${encodeURIComponent(currentOrigin)}" 
      title="YouTube video player" 
      frameborder="0" 
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
      allowfullscreen>
    ></iframe>
  `;
}

export function renderizarLista(lista) {
  const playlistElement = document.getElementById("playlist");
  if (!playlistElement) return;

  playlistElement.innerHTML = "";

  lista.forEach((vid, idx) => {
    const indexOriginal = listaVideos.findIndex(v => v.youtubeId === vid.youtubeId);
    const li = document.createElement("li");
    li.className = "video-item";

    if (indexOriginal === state.currentVideoIndex) {
      li.classList.add("active");
    }
    if (idx === state.kbPlaylistIndex) {
      li.classList.add("kb-focus");
    }

    li.innerText = vid.title;
    li.addEventListener("click", () => {
      state.kbPlaylistIndex = idx;
      tocarVideo(indexOriginal);
    });

    playlistElement.appendChild(li);
  });
}

export function tocarVideo(index) {
  if (index < 0 || index >= listaVideos.length) return;

  state.currentVideoIndex = index;
  const video = listaVideos[index];

  atualizarTextoElemento("current-title", video.title);
  renderizarIframePlayer(video.youtubeId);

  const searchBox = document.getElementById("search-input");
  const termo = searchBox ? searchBox.value.toLowerCase() : "";

  if (termo) {
    filtrarVideos();
  } else {
    renderizarLista(listaVideos);
  }
}

export function filtrarVideos() {
  const searchBox = document.getElementById("search-input");
  const termo = searchBox ? searchBox.value.toLowerCase() : "";

  const filtrados = listaVideos.filter(video =>
    video.title.toLowerCase().includes(termo)
  );

  state.kbPlaylistIndex = 0;
  renderizarLista(filtrados);
}

export function atualizarTextoElemento(id, texto) {
  const elemento = document.getElementById(id);
  if (elemento) {
    elemento.textContent = texto;
  }
}