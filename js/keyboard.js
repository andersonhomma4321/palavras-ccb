/* ==========================================
   GESTOR DE NAVEGAÇÃO POR TECLADO
   ========================================== */
import { state } from './state.js';
import { listaVideos } from '../data/videos.js';
import { tocarVideo, focarCartaoVideo } from './player.js';

export function inicializarTeclado() {
  document.addEventListener("keydown", (e) => {
    // Verifica o estado atual da interface
    const loginOverlay = document.getElementById("login-overlay");
    const menuOverlay = document.getElementById("menu-overlay");
    const adminModal = document.getElementById("admin-form-overlay") || document.getElementById("admin-modal");
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
    // SE O FOCO ESTIVER NO CAMPO DE PESQUISA
    if (document.activeElement === searchBox) {
        if (e.key === "ArrowDown") {
            e.preventDefault();
            // Vai para o botão de vídeos aleatórios se existir, senão vai para a grelha
            const btnRandom = document.getElementById("btn-random-videos");
            if (btnRandom) {
                btnRandom.focus();
            } else {
                state.kbPlaylistIndex = 0;
                focarCartaoVideo(state.kbPlaylistIndex);
            }
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            const btnAppBack = document.getElementById("btn-app-back");
            if (btnAppBack) btnAppBack.focus();
        } else if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
            return;
        }
        return;
    }

    // TRATAMENTO PARA O BOTÃO DE VÍDEOS ALEATÓRIOS (caso esteja focado)
    const btnRandom = document.getElementById("btn-random-videos");
    if (document.activeElement === btnRandom) {
        if (e.key === "ArrowDown") {
            e.preventDefault();
            state.kbPlaylistIndex = 0;
            focarCartaoVideo(state.kbPlaylistIndex);
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            if (searchBox) searchBox.focus();
        }
        return;
    }

    // NAVEGAÇÃO POR SETAS NOS CARTÕES DE VÍDEO
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
            // Se estiver na primeira linha, vai para o botão de vídeos aleatórios primeiro
            if (btnRandom) {
                btnRandom.focus();
            } else if (searchBox) {
                searchBox.focus();
            }
        } else {
            state.kbPlaylistIndex = novoIndex;
            focarCartaoVideo(state.kbPlaylistIndex);
        }
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

// Exporta com ambos os nomes para evitar erros de incompatibilidade no app.js
export const initKeyboard = inicializarTeclado;

export function focarMenuPrincipal() {
  const menuOverlay = document.getElementById("menu-overlay");
  if (menuOverlay) {
    const primeiroBotao = menuOverlay.querySelector("button");
    if (primeiroBotao) primeiroBotao.focus();
  }
}

export function focarAdminMenu() {
  const adminMenuOverlay = document.getElementById("admin-menu-overlay");
  if (adminMenuOverlay) {
    const primeiroBotao = adminMenuOverlay.querySelector("button");
    if (primeiroBotao) primeiroBotao.focus();
  }
}