/* ==========================================
   GESTOR DE NAVEGAÇÃO POR TECLADO
   ========================================== */

import { state } from './state.js';
import { listaVideos } from '../data/videos.js';
import { tocarVideo, focarCartaoVideo } from './player.js';

export function initKeyboard() {
    document.addEventListener("keydown", (e) => {
        // Verifica o estado atual da interface
        const loginOverlay = document.getElementById("login-overlay");
        const menuOverlay = document.getElementById("menu-overlay");
        const adminModal = document.getElementById("admin-modal"); // Ajuste o ID se necessário
        const appContainer = document.getElementById("app-container");
        
        const loginVisivel = loginOverlay && window.getComputedStyle(loginOverlay).display !== "none";
        const menuVisivel = menuOverlay && window.getComputedStyle(menuOverlay).display !== "none";
        const adminVisivel = adminModal && window.getComputedStyle(adminModal).display !== "none";
        const appVisivel = appContainer && window.getComputedStyle(appContainer).display !== "none";

        // 1. SE O LOGIN ESTIVER VISÍVEL
        if (loginVisivel) {
            if (e.key === "Enter") {
                // Deixa o formulário de login submeter naturalmente ou gerencia aqui
            }
            return;
        }

        // 2. TELA "PALAVRAS" (YOUTUBE TV) - GRELHA DE VÍDEOS
        if (appVisivel) {
            const searchBox = document.getElementById("search-input");
            const termoBruto = searchBox ? searchBox.value : "";
            const termos = termoBruto ? termoBruto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().split(/\s+/) : [];
            
            const listaExibida = termos.length > 0
                ? listaVideos.filter(video => {
                    const tit = video.title.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
                    return termos.every(t => tit.includes(t));
                })
                : listaVideos;

            // Calcula dinamicamente a quantidade de colunas na grelha
            const gridContainer = document.getElementById("playlist");
            let colunas = 4;
            if (gridContainer) {
                const computedStyle = window.getComputedStyle(gridContainer);
                const colTemplate = computedStyle.getPropertyValue("grid-template-columns");
                colunas = colTemplate ? colTemplate.split(" ").length : 4;
            }

            // Se o foco estiver no campo de pesquisa e carregar para baixo, vai para os cartões
            if (document.activeElement === searchBox) {
                if (e.key === "ArrowDown") {
                    e.preventDefault();
                    focarCartaoVideo(state.kbPlaylistIndex);
                }
                return;
            }

            // Navegação por setas nos cartões de vídeo
            if (e.key === "ArrowRight") {
                e.preventDefault();
                if (listaExibida.length > 0) {
                    state.kbPlaylistIndex = (state.kbPlaylistIndex + 1) % listaExibida.length;
                    focarCartaoVideo(state.kbPlaylistIndex);
                }
            } else if (e.key === "ArrowLeft") {
                e.preventDefault();
                if (listaExibida.length > 0) {
                    state.kbPlaylistIndex = (state.kbPlaylistIndex - 1 + listaExibida.length) % listaExibida.length;
                    focarCartaoVideo(state.kbPlaylistIndex);
                }
            } else if (e.key === "ArrowDown") {
                e.preventDefault();
                if (listaExibida.length > 0) {
                    let novoIndex = state.kbPlaylistIndex + colunas;
                    if (novoIndex >= listaExibida.length) novoIndex = listaExibida.length - 1;
                    state.kbPlaylistIndex = novoIndex;
                    focarCartaoVideo(state.kbPlaylistIndex);
                }
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                let novoIndex = state.kbPlaylistIndex - colunas;
                if (novoIndex < 0) {
                    if (searchBox) searchBox.focus();
                } else {
                    state.kbPlaylistIndex = novoIndex;
                    focarCartaoVideo(state.kbPlaylistIndex);
                }
            } else if (e.key === "Enter") {
                e.preventDefault();
                if (listaExibida[state.kbPlaylistIndex]) {
                    const videoAlvo = listaExibida[state.kbPlaylistIndex];
                    const indexOriginal = listaVideos.findIndex(v => (v.youtubeId || v.youtubeld) === (videoAlvo.youtubeId || videoAlvo.youtubeld));
                    tocarVideo(indexOriginal);
                }
            }
            return;
        }

        // 3. MENU PRINCIPAL OU MODAIS (Navegação vertical genérica por botões)
        const botoesAtivos = Array.from(document.querySelectorAll('button:not([style*="display: none"]), .btn-menu:not([style*="display: none"])'))
            .filter(btn => {
                const rect = btn.getBoundingClientRect();
                return rect.width > 0 && rect.height > 0;
            });

        if (botoesAtivos.length > 0) {
            let currentIndex = botoesAtivos.indexOf(document.activeElement);

            if (e.key === "ArrowDown" || e.key === "ArrowRight") {
                e.preventDefault();
                currentIndex = (currentIndex + 1) % botoesAtivos.length;
                botoesAtivos[currentIndex].focus();
            } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
                e.preventDefault();
                currentIndex = (currentIndex - 1 + botoesAtivos.length) % botoesAtivos.length;
                botoesAtivos[currentIndex].focus();
            }
        }
    });
}