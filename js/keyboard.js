import { state } from './state.js';
import { listaVideos } from '../data/videos.js';
import { tocarVideo, focarCartaoVideo } from './player.js';

export function inicializarTeclado() {
  document.addEventListener("keydown", (e) => {
    const loginOverlay = document.getElementById("login-overlay");
    const menuOverlay = document.getElementById("menu-overlay");
    const adminModal = document.getElementById("admin-form-overlay") || document.getElementById("admin-modal");
    const appContainer = document.getElementById("app-container");
    
    const loginVisivel = loginOverlay && window.getComputedStyle(loginOverlay).display !== "none";
    const appVisivel = appContainer && window.getComputedStyle(appContainer).display !== "none";
    
    if (loginVisivel) return;

    if (appVisivel) {
      const searchBox = document.getElementById("search-input");
      const termoBruto = searchBox ? searchBox.value : "";
      const termos = termoBruto ? termoBruto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().split(/\s+/) : [];
      
      const listaExibida = termos.length > 0
        ? listaVideos.filter(video => {
            const tit = video.title.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
            return termos.every((t) => {
              if (/^\d{1,2}$/.test(t)) {
                const regex = new RegExp(`\\b${t}\\b`);
                return regex.test(tit);
              }
              if (/^\d{4}$/.test(t)) {
                const regex = new RegExp(`\\b${t}\\b`);
                return regex.test(tit);
              }
              return tit.includes(t);
            });
          })
        : listaVideos;

      const gridContainer = document.getElementById("playlist");
      let colunas = 4;
      if (gridContainer) {
        const computedStyle = window.getComputedStyle(gridContainer);
        const colTemplate = computedStyle.getPropertyValue("grid-template-columns");
        colunas = colTemplate ? colTemplate.split(" ").length : 4;
      }

      if (document.activeElement === searchBox) {
        if (e.key === "ArrowDown") {
          e.preventDefault();
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
        } else if (e.key === "ArrowLeft") {
          e.preventDefault();
          const btnMenu = document.getElementById("btn-app-back");
          if (btnMenu) btnMenu.focus();
        }
        return;
      }

      const btnRandom = document.getElementById("btn-random-videos");
      if (document.activeElement === btnRandom) {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          state.kbPlaylistIndex = 0;
          focarCartaoVideo(state.kbPlaylistIndex);
          const primeiroCartao = document.querySelector('.video-card-item');
          if (primeiroCartao) primeiroCartao.focus();
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          if (searchBox) searchBox.focus();
        } else if (e.key === "Enter") {
          e.preventDefault();
          btnRandom.click();
        }
        return;
      }

      const btnMenu = document.getElementById("btn-app-back");
      if (document.activeElement === btnMenu) {
        if (e.key === "ArrowRight") {
          e.preventDefault();
          if (searchBox) searchBox.focus();
        } else if (e.key === "ArrowDown") {
          e.preventDefault();
          if (btnRandom) {
            btnRandom.focus();
          } else {
            state.kbPlaylistIndex = 0;
            focarCartaoVideo(state.kbPlaylistIndex);
          }
        } else if (e.key === "Enter") {
          e.preventDefault();
          btnMenu.click();
        }
        return;
      }

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
          if (btnRandom) {
            btnRandom.focus();
          } else if (searchBox) {
            searchBox.focus();
          }
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