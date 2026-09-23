import {
  autenticar,
  verificarSenhaAdmin
} from "./auth.js";
import {
  navegarPara,
  voltarParaMenu,
  voltarParaAdminMenu
} from "./menu.js";
import {
  abrirGerenciadorVideos,
  abrirModalSenhas,
  adicionarVideoNoGitHub,
  atualizarSenhas
} from "./admin.js";
import {
  filtrarVideos,
  initPlayer,
  iniciarVideosAleatoriosContinuos
} from "./player.js";
import {
  inicializarTeclado,
  focarMenuPrincipal,
  focarAdminMenu
} from "./keyboard.js";

document.addEventListener("DOMContentLoaded", () => {
  /* ==========================================
     LOGIN
     ========================================== */
  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      autenticar(e);
    });
  }

  /* ==========================================
     MENU PRINCIPAL
     ========================================== */
  const btnPalavras = document.getElementById("btn-menu-palavras");
  if (btnPalavras) btnPalavras.addEventListener("click", () => navegarPara("palavras"));

  const btnBiblia = document.getElementById("btn-menu-biblia");
  if (btnBiblia) btnBiblia.addEventListener("click", () => navegarPara("biblia"));

  const btnHinos = document.getElementById("btn-menu-hinos");
  if (btnHinos) btnHinos.addEventListener("click", () => navegarPara("hinos"));

  const btnConfig = document.getElementById("btn-menu-configuracao");
  if (btnConfig) btnConfig.addEventListener("click", () => navegarPara("configuracao"));

  /* ==========================================
     AUTENTICAÇÃO ADMIN
     ========================================== */
  const adminAuthForm = document.getElementById("admin-auth-form");
  if (adminAuthForm) {
    adminAuthForm.addEventListener("submit", (e) => {
      e.preventDefault();
      verificarSenhaAdmin(e);
    });
  }

  const btnCloseAdminAuth = document.getElementById("btn-close-admin-auth");
  if (btnCloseAdminAuth) btnCloseAdminAuth.addEventListener("click", voltarParaMenu);

  /* ==========================================
     MENU ADMIN
     ========================================== */
  const btnGerenciarVideos = document.getElementById("btn-gerenciar-videos");
  if (btnGerenciarVideos) btnGerenciarVideos.addEventListener("click", abrirGerenciadorVideos);

  const btnAlterarSenhas = document.getElementById("btn-alterar-senhas");
  if (btnAlterarSenhas) btnAlterarSenhas.addEventListener("click", abrirModalSenhas);

  const btnAdminVoltar = document.getElementById("btn-admin-voltar");
  if (btnAdminVoltar) btnAdminVoltar.addEventListener("click", voltarParaMenu);

  const btnCloseAdminMenu = document.getElementById("btn-close-admin-menu");
  if (btnCloseAdminMenu) btnCloseAdminMenu.addEventListener("click", voltarParaMenu);

  /* ==========================================
     ADMIN - VÍDEOS
     ========================================== */
  const btnSaveGh = document.getElementById("btn-save-gh");
  if (btnSaveGh) btnSaveGh.addEventListener("click", adicionarVideoNoGitHub);

  const btnVideoManagerBack = document.getElementById("btn-video-manager-back");
  if (btnVideoManagerBack) btnVideoManagerBack.addEventListener("click", voltarParaAdminMenu);

  const btnCloseVideoManager = document.getElementById("btn-close-video-manager");
  if (btnCloseVideoManager) btnCloseVideoManager.addEventListener("click", voltarParaAdminMenu);

  /* ==========================================
     ADMIN - SENHAS
     ========================================== */
  const btnSavePass = document.getElementById("btn-save-pass");
  if (btnSavePass) btnSavePass.addEventListener("click", atualizarSenhas);

  const btnPasswordBack = document.getElementById("btn-password-back");
  if (btnPasswordBack) btnPasswordBack.addEventListener("click", voltarParaAdminMenu);

  const btnClosePasswords = document.getElementById("btn-close-passwords");
  if (btnClosePasswords) btnClosePasswords.addEventListener("click", voltarParaAdminMenu);

  /* ==========================================
     PLACEHOLDER
     ========================================== */
  const btnPlaceholderBack = document.getElementById("btn-placeholder-back");
  if (btnPlaceholderBack) btnPlaceholderBack.addEventListener("click", voltarParaMenu);

  const btnClosePlaceholder = document.getElementById("btn-close-placeholder");
  if (btnClosePlaceholder) btnClosePlaceholder.addEventListener("click", voltarParaMenu);

  /* ==========================================
     PLAYER E SECÇÃO DE VÍDEOS
     ========================================== */
  const btnAppBack = document.getElementById("btn-app-back");
  if (btnAppBack) btnAppBack.addEventListener("click", voltarParaMenu);

  const searchInput = document.getElementById("search-input");
  if (searchInput) {
    searchInput.addEventListener("input", filtrarVideos);
  }

  initPlayer();

  const btnRandomVideos = document.getElementById("btn-random-videos");
  if (btnRandomVideos) {
    btnRandomVideos.addEventListener("click", iniciarVideosAleatoriosContinuos);
  }

  /* ==========================================
     TECLADO E NAVEGAÇÃO GLOBAL
     ========================================== */
  inicializarTeclado();
  focarMenuPrincipal();
});
