import { listaVideos } from "../data/videos.js";
import { state } from "./state.js";

export function carregarPlaylist() {
  renderizarLista(listaVideos);

  if (listaVideos.length > 0) {
    tocarVideo(state.currentVideoIndex);
  } else {
    atualizarTextoElemento("current-title", "Nenhum vídeo disponível");
    const iframe = document.getElementById("main-iframe");
    if (iframe) {
      iframe.src = "";
    }
  }
}

export function renderizarLista(lista) {
  const playlistElement = document.getElementById("playlist");
  if (!playlistElement) {
    return;
  }

  playlistElement.innerHTML = "";

  lista.forEach((vid, idx) => {
    const indexOriginal = listaVideos.findIndex(
      v => v.youtubeId === vid.youtubeId
    );

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
  if (index < 0 || index >= listaVideos.length) {
    return;
  }

  state.currentVideoIndex = index;
  const video = listaVideos[index];

  // Abre o vídeo direto no YouTube na resolução máxima real
  const urlYouTube = `https://www.youtube.com/watch?v=${video.youtubeId}`;
  window.open(urlYouTube, "_blank");

  atualizarTextoElemento("current-title", video.title);

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