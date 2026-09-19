import { listaVideos } from "../data/videos.js";
import { state } from "./state.js";

let ytPlayer = null;

// Garante que o script da API do YouTube é injetado no documento
if (!window.YT) {
  const tag = document.createElement('script');
  tag.src = "https://www.youtube.com/iframe_api";
  document.head.appendChild(tag);
}

// Callback global acionado automaticamente pela API do YouTube
window.onYouTubeIframeAPIReady = function() {
  if (listaVideos.length > 0) {
    if (state.currentVideoIndex < 0) state.currentVideoIndex = 0;
    criarOuCarregarPlayer(listaVideos[state.currentVideoIndex].youtubeId);
  }
};

export function carregarPlaylist() {
  renderizarLista(listaVideos);
  if (listaVideos.length > 0) {
    if (state.currentVideoIndex < 0) state.currentVideoIndex = 0;
    const videoInicial = listaVideos[state.currentVideoIndex];
    atualizarTextoElemento("current-title", videoInicial.title);
    
    if (window.YT && window.YT.Player) {
      criarOuCarregarPlayer(videoInicial.youtubeId);
    }
  } else {
    atualizarTextoElemento("current-title", "Nenhum vídeo disponível");
  }
}

function criarOuCarregarPlayer(videoId) {
  const host = document.getElementById("youtube-player-host");
  if (!host) return;

  if (ytPlayer && typeof ytPlayer.loadVideoById === 'function') {
    ytPlayer.loadVideoById({
      videoId: videoId,
      suggestedQuality: 'hd1080'
    });
  } else {
    ytPlayer = new YT.Player('youtube-player-host', {
      height: '100%',
      width: '100%',
      videoId: videoId,
      playerVars: {
        'autoplay': 0,
        'controls': 1,
        'rel': 0,
        'enablejsapi': 1,
        'modestbranding': 1
      },
      events: {
        'onReady': (event) => {
          event.target.setPlaybackQuality('hd1080');
        },
        'onStateChange': (event) => {
          if (event.data === YT.PlayerState.PLAYING) {
            event.target.setPlaybackQuality('hd1080');
          }
        }
      }
    });
  }
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
  criarOuCarregarPlayer(video.youtubeId);

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