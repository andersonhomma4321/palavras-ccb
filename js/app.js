/* ==========================================
   CONTROLADOR PRINCIPAL DA APLICAÇÃO
   ========================================== */
import { state } from './state.js';
import { carregarPlaylist, initPlayer, filtrarVideos } from './player.js';
import { initKeyboard, focarMenuPrincipal } from './keyboard.js';

document.addEventListener("DOMContentLoaded", () => {
  // 1. Inicializa o motor de navegação por teclado
  initKeyboard();

  // 2. Inicializa o player e os botões de controlo
  initPlayer();

  // 3. Carrega os vídeos iniciais na grelha
  carregarPlaylist();

  // 4. Configura o campo de pesquisa em tempo real
  const searchInput = document.getElementById("search-input");
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      filtrarVideos();
    });
  }

  // 5. Configura o botão de engrenagem flutuante para abrir o menu principal
  const btnConfig = document.getElementById("btn-config-settings");
  if (btnConfig) {
    btnConfig.addEventListener("click", () => {
      const menuOverlay = document.getElementById("menu-overlay");
      if (menuOverlay) {
        menuOverlay.style.display = "flex";
        focarMenuPrincipal();
      }
    });
  }

  // 6. Exemplo de fecho do menu caso exista um botão de fechar
  const btnFecharMenu = document.getElementById("btn-close-menu");
  if (btnFecharMenu) {
    btnFecharMenu.addEventListener("click", () => {
      const menuOverlay = document.getElementById("menu-overlay");
      if (menuOverlay) {
        menuOverlay.style.display = "none";
      }
    });
  }
});