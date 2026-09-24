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
    if (appVisivel) {
      const searchBox = document.getElementById("search-input");
      const termoBruto = searchBox ? searchBox.value : "";
      const termos = termoBruto ? termoBruto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().split(/\s+/) : [];
      const listaExibida = termos.length > 0
        ? listaVideos.filter(video => {
            const tit = video.title.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
            return termos.every((t, index) => {
              if (/^\d{1,2}$/.test(t)) {
                // Se for o último termo (dia), aplica a proteção contra horários como "19 30"
                if (index === termos.length - 1) {
                  const regex = new RegExp(`\\b${t}\\b(?!\\s*\\d{2})`);
                  return regex.test(tit);
                }
                // Para o ano ou mês (termos anteriores), apenas procura o número isolado
                const regex = new RegExp(`\\b${t}\\b`);
                return regex.test(tit);
              }
              return tit.includes(t);
            });
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

      // SE O FOCO ESTIVER NO CAMPO DE PESQUISA
      if (document.activeElement === searchBox) {
        if (e.key === "ArrowDown" || e.key === "Enter") {
          e.preventDefault();
          // Sai da busca e vai para o primeiro cartão da grelha
          state.kbPlaylistIndex = 0;
          focarCartaoVideo(state.kbPlaylistIndex);
        } else if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
          // Permite mover livremente o cursor dentro do texto da caixa de pesquisa
          return;
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
          // Se estiver na primeira linha e carregar para cima, volta para o campo de pesquisa
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
          if (indexOriginal !== -1) {
            tocarVideo(indexOriginal);
          }
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