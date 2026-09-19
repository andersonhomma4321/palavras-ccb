import { listaVideos } from "../data/videos.js";
import { state } from "./state.js";

let ytModalPlayer = null;

// Garante que o script da API do YouTube está carregado
if (!window.YT) {
  const tag = document.createElement('script');
  tag.src = "https://www.youtube.com/iframe_api";
  document.head.appendChild(tag);
}

export function carregarPlaylist() {
  renderizarLista(listaVideos);
  if (listaVideos.length > 0) {
    // Apenas renderiza a lista, o vídeo agora abre no modal ao interagir
    atualizarTextoElemento("current-title", "Selecione um vídeo");
  } else {
    atualizarTextoElemento("current-title", "Nenhum vídeo disponível");
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

  // Mostra o modal de vídeo em tela cheia
  const modal = document.getElementById("video-modal");
  if (modal) modal.style.display = "flex";

  // Cria ou carrega o vídeo no player do modal com qualidade máxima forçada
  if (ytModalPlayer && typeof ytModalPlayer.loadVideoById === 'function') {
    ytModalPlayer.loadVideoById({
      videoId: video.youtubeId,
      suggestedQuality: 'hd1080'
    });
  } else {
    window.onYouTubeIframeAPIReady = function() {
      ytModalPlayer = new YT.Player('player-container-modal', {
        videoId: video.youtubeId,
        playerVars: {
          'autoplay': 1,
          'controls': 1,
          'rel': 0,
          'enablejsapi': 1,
          'vq': 'hd1080'
        },
        events: {
          'onReady': (event) => {
            event.target.setPlaybackQuality('hd1080');
            event.target.playVideo();
          }
        }
      });
    };

    if (window.YT && window.YT.Player) {
      window.onYouTubeIframeAPIReady();
    }
  }

  atualizarTextoElemento("current-title", video.title);

  const searchBox = document.getElementById("search-input");
  const termo = searchBox ? searchBox.value.toLowerCase() : "";

  if (termo) {
    filtrarVideos();
  } else {
    renderizarLista(listaVideos);
  }
}

// Função global para fechar o modal e parar o vídeo
window.fecharModalVideo = function() {
  const modal = document.getElementById("video-modal");
  if (modal) modal.style.display = "none";

  if (ytModalPlayer && typeof ytModalPlayer.stopVideo === 'function') {
    ytModalPlayer.stopVideo();
  }
};

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