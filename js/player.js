import { listaVideos } from "../data/videos.js";
import { state } from "./state.js";

export function carregarPlaylist() {
    renderizarLista(listaVideos);
    if (listaVideos.length > 0) {
        if (state.currentVideoIndex < 0) state.currentVideoIndex = 0;
    }
}

// Função para remover acentos e padronizar termos de busca
function normalizarTexto(texto) {
    return texto
        ? texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
        : "";
}

export function renderizarLista(lista) {
    const playlistElement = document.getElementById("playlist");
    if (!playlistElement) return;
    playlistElement.innerHTML = "";

    if (lista.length === 0) {
        playlistElement.innerHTML = `<p style="color: #aaa; grid-column: 1/-1; text-align: center; padding: 2rem;">Nenhum vídeo encontrado.</p>`;
        return;
    }

    lista.forEach((vid, idx) => {
        // Suporta tanto youtubeld como youtubeId para evitar falhas de leitura
        const videoId = vid.youtubeld || vid.youtubeId;
        const indexOriginal = listaVideos.findIndex(v => (v.youtubeld || v.youtubeId) === videoId);
        
        const card = document.createElement("div");
        card.className = "video-card-item";
        if (idx === state.kbPlaylistIndex) {
            card.classList.add("kb-focus");
        }

        // Miniatura oficial do YouTube com alternativa automática de segurança
        const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

        card.innerHTML = `
            <div class="video-thumbnail-wrapper">
                <img src="${thumbnailUrl}" alt="${vid.title}" loading="lazy" onerror="this.src='https://img.youtube.com/vi/${videoId}/default.jpg'">
            </div>
            <div class="video-card-title">${vid.title}</div>
        `;

        card.addEventListener("click", () => {
            state.kbPlaylistIndex = idx;
            tocarVideo(indexOriginal);
        });

        playlistElement.appendChild(card);
    });
}

export function tocarVideo(index) {
    if (index < 0 || index >= listaVideos.length) return;
    state.currentVideoIndex = index;
    const video = listaVideos[index];
    const videoId = video.youtubeld || video.youtubeId;

    // Abre o vídeo diretamente no YouTube em nova aba/ecrã para contornar restrições de incorporação de vídeos não listados
    const urlYoutube = `https://www.youtube.com/watch?v=${videoId}&autoplay=1`;
    window.open(urlYoutube, "_blank");
}

export function iniciarVideosAleatorios() {
    if (!listaVideos.length) return;
    const randomIndex = Math.floor(Math.random() * listaVideos.length);
    tocarVideo(randomIndex);
}

export function filtrarVideos() {
    const searchBox = document.getElementById("search-input");
    const termoBruto = searchBox ? searchBox.value : "";
    const termos = normalizarTexto(termoBruto).split(/\s+/).filter(Boolean);

    const filtrados = listaVideos.filter(video => {
        const tituloNorm = normalizarTexto(video.title);
        return termos.every(termo => tituloNorm.includes(termo));
    });

    state.kbPlaylistIndex = 0;
    renderizarLista(filtrados);
}

export function atualizarTextoElemento(id, texto) {
    const elemento = document.getElementById(id);
    if (elemento) {
        elemento.textContent = texto;
    }
}