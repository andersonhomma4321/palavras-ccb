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
  filtrarVideos
} from "./player.js";
import {
  inicializarTeclado,
  focarMenuPrincipal,
  focarAdminMenu
} from "./keyboard.js";

document.addEventListener(
  "DOMContentLoaded",
  () => {
    /* ==========================
     LOGIN
     ========================== */
    document
      .getElementById("login-form")
      .addEventListener(
        "submit",
        autenticar
      );

    /* ==========================
     MENU PRINCIPAL
     ========================== */
    document
      .getElementById("btn-menu-palavras")
      .addEventListener(
        "click",
        () => navegarPara("palavras")
      );
    document
      .getElementById("btn-menu-biblia")
      .addEventListener(
        "click",
        () => navegarPara("biblia")
      );
    document
      .getElementById("btn-menu-hinos")
      .addEventListener(
        "click",
        () => navegarPara("hinos")
      );
    document
      .getElementById("btn-menu-configuracao")
      .addEventListener(
        "click",
        () => navegarPara("configuracao")
      );

    /* ==========================
     AUTENTICAÇÃO ADMIN
     ========================== */
    document
      .getElementById("admin-auth-form")
      .addEventListener(
        "submit",
        verificarSenhaAdmin
      );
    document
      .getElementById("btn-close-admin-auth")
      .addEventListener(
        "click",
        voltarParaMenu
      );

    /* ==========================
     MENU ADMIN
     ========================== */
    document
      .getElementById("btn-gerenciar-videos")
      .addEventListener(
        "click",
        abrirGerenciadorVideos
      );
    document
      .getElementById("btn-alterar-senhas")
      .addEventListener(
        "click",
        abrirModalSenhas
      );
    document
      .getElementById("btn-admin-voltar")
      .addEventListener(
        "click",
        voltarParaMenu
      );
    document
      .getElementById("btn-close-admin-menu")
      .addEventListener(
        "click",
        voltarParaMenu
      );

    /* ==========================
     ADMIN - VÍDEOS
     ========================== */
    document
      .getElementById("btn-save-gh")
      .addEventListener(
        "click",
        adicionarVideoNoGitHub
      );
    document
      .getElementById("btn-video-manager-back")
      .addEventListener(
        "click",
        voltarParaAdminMenu
      );
    document
      .getElementById("btn-close-video-manager")
      .addEventListener(
        "click",
        voltarParaAdminMenu
      );

    /* ==========================
     ADMIN - SENHAS
     ========================== */
    document
      .getElementById("btn-save-pass")
      .addEventListener(
        "click",
        atualizarSenhas
      );
    document
      .getElementById("btn-password-back")
      .addEventListener(
        "click",
        voltarParaAdminMenu
      );
    document
      .getElementById("btn-close-passwords")
      .addEventListener(
        "click",
        voltarParaAdminMenu
      );

    /* ==========================
     PLACEHOLDER
     ========================== */
    document
      .getElementById("btn-placeholder-back")
      .addEventListener(
        "click",
        voltarParaMenu
      );
    document
      .getElementById("btn-close-placeholder")
      .addEventListener(
        "click",
        voltarParaMenu
      );

    /* ==========================
     PLAYER
     ========================== */
    document
      .getElementById("btn-app-back")
      .addEventListener(
        "click",
        voltarParaMenu
      );
    document
      .getElementById("search-input")
      .addEventListener(
        "input",
        filtrarVideos
      );

    /* ==========================
     TECLADO
     ========================== */
    inicializarTeclado();
    focarMenuPrincipal(0);
  }
);