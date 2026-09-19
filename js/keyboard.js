import { state } from "./state.js";

import {
  voltarParaMenu,
  voltarParaAdminMenu
} from "./menu.js";

import {
  tocarVideo,
  renderizarLista
} from "./player.js";

import { listaVideos } from "../data/videos.js";

import {
  adicionarVideoNoGitHub,
  atualizarSenhas
} from "./admin.js";


export function inicializarTeclado() {

  document.addEventListener(
    "keydown",
    function(e) {

      const menuOverlayVisivel =
        document.getElementById(
          "menu-overlay"
        ).style.display === "flex";


      const adminMenuVisivel =
        document.getElementById(
          "admin-menu-overlay"
        ).style.display === "flex";


      const appVisivel =
        document.getElementById(
          "app-container"
        ).style.display === "block";


      const videoFormVisivel =
        document.getElementById(
          "admin-form-overlay"
        ).style.display === "flex";


      const senhaFormVisivel =
        document.getElementById(
          "admin-passwords-overlay"
        ).style.display === "flex";


      /* ==========================
         ESC
         ========================== */

      if (e.key === "Escape") {

        if (appVisivel) {

          voltarParaMenu();

        }

        else if (
          videoFormVisivel ||
          senhaFormVisivel
        ) {

          voltarParaAdminMenu();

        }

        else if (
          document.getElementById(
            "admin-auth-overlay"
          ).style.display === "flex" ||

          document.getElementById(
            "placeholder-overlay"
          ).style.display === "flex" ||

          adminMenuVisivel
        ) {

          voltarParaMenu();

        }

        return;

      }


      /* ==========================
         MENU PRINCIPAL
         ========================== */

      if (menuOverlayVisivel) {

        const botoes =
          document.querySelectorAll(
            "#main-menu-grid .btn-menu"
          );


        if (e.key === "ArrowDown") {

          e.preventDefault();

          focarMenuPrincipal(
            state.menuFocusIndex + 1
          );

        }


        else if (
          e.key === "ArrowUp"
        ) {

          e.preventDefault();

          focarMenuPrincipal(
            state.menuFocusIndex - 1
          );

        }


        else if (
          e.key === "Enter"
        ) {

          if (
            botoes[
              state.menuFocusIndex
            ]
          ) {

            botoes[
              state.menuFocusIndex
            ].click();

          }

        }

        return;

      }


      /* ==========================
         MENU ADMIN
         ========================== */

      if (adminMenuVisivel) {

        const botoes =
          document.querySelectorAll(
            "#admin-menu-grid .btn-menu"
          );


        if (
          e.key === "ArrowDown"
        ) {

          e.preventDefault();

          focarAdminMenu(
            state.adminMenuFocusIndex + 1
          );

        }


        else if (
          e.key === "ArrowUp"
        ) {

          e.preventDefault();

          focarAdminMenu(
            state.adminMenuFocusIndex - 1
          );

        }


        else if (
          e.key === "Enter"
        ) {

          if (
            botoes[
              state.adminMenuFocusIndex
            ]
          ) {

            botoes[
              state.adminMenuFocusIndex
            ].click();

          }

        }

        return;

      }


      /* ==========================
         FORMULÁRIO DE VÍDEO
         ========================== */

      if (
        videoFormVisivel &&
        e.key === "Enter"
      ) {

        const ativo =
          document.activeElement;


        if (
          ativo &&
          (
            ativo.id ===
              "new-video-title" ||

            ativo.id ===
              "new-video-url" ||

            ativo.id ===
              "gh-token-videos"
          )
        ) {

          e.preventDefault();

          adicionarVideoNoGitHub();

          return;

        }

      }


      /* ==========================
         FORMULÁRIO DE SENHAS
         ========================== */

      if (
        senhaFormVisivel &&
        e.key === "Enter"
      ) {

        const ativo =
          document.activeElement;


        if (
          ativo &&
          (
            ativo.id ===
              "new-user-pass" ||

            ativo.id ===
              "new-admin-pass" ||

            ativo.id ===
              "gh-token-pass"
          )
        ) {

          e.preventDefault();

          atualizarSenhas();

          return;

        }

      }


      /* ==========================
         PLAYER
         ========================== */

      if (appVisivel) {

        const searchInput =
          document.getElementById(
            "search-input"
          );


        const searchFocado =
          document.activeElement ===
          searchInput;


        const termo =
          searchInput
            ? searchInput.value.toLowerCase()
            : "";


        const listaExibida =
          termo
            ? listaVideos.filter(
                video =>
                  video.title
                    .toLowerCase()
                    .includes(termo)
              )
            : listaVideos;


        if (
          e.key === "ArrowDown"
        ) {

          e.preventDefault();

          if (
            listaExibida.length > 0
          ) {

            state.kbPlaylistIndex =
              (
                state.kbPlaylistIndex + 1
              ) %
              listaExibida.length;


            renderizarLista(
              listaExibida
            );

          }

        }


        else if (
          e.key === "ArrowUp"
        ) {

          e.preventDefault();

          if (
            listaExibida.length > 0
          ) {

            state.kbPlaylistIndex =
              (
                state.kbPlaylistIndex -
                1 +
                listaExibida.length
              ) %
              listaExibida.length;


            renderizarLista(
              listaExibida
            );

          }

        }


        else if (
          e.key === "Enter" &&
          !searchFocado
        ) {

          e.preventDefault();


          if (
            listaExibida[
              state.kbPlaylistIndex
            ]
          ) {

            const indexOriginal =
              listaVideos.findIndex(
                video =>
                  video.youtubeId ===
                  listaExibida[
                    state.kbPlaylistIndex
                  ].youtubeId
              );


            tocarVideo(
              indexOriginal
            );

          }

        }

      }

    }
  );

}


/* =================================
   FOCO MENU PRINCIPAL
   ================================= */

export function focarMenuPrincipal(
  index
) {

  const botoes =
    document.querySelectorAll(
      "#main-menu-grid .btn-menu"
    );


  if (!botoes.length) {
    return;
  }


  state.menuFocusIndex =
    (
      index +
      botoes.length
    ) %
    botoes.length;


  botoes.forEach(
    (botao, i) => {

      botao.classList.toggle(
        "kb-focus",
        i === state.menuFocusIndex
      );

    }
  );


  botoes[
    state.menuFocusIndex
  ].focus();

}


/* =================================
   FOCO MENU ADMIN
   ================================= */

export function focarAdminMenu(
  index
) {

  const botoes =
    document.querySelectorAll(
      "#admin-menu-grid .btn-menu"
    );


  if (!botoes.length) {
    return;
  }


  state.adminMenuFocusIndex =
    (
      index +
      botoes.length
    ) %
    botoes.length;


  botoes.forEach(
    (botao, i) => {

      botao.classList.toggle(
        "kb-focus",
        i === state.adminMenuFocusIndex
      );

    }
  );


  botoes[
    state.adminMenuFocusIndex
  ].focus();

}