/* ==========================================
   GESTOR DO PLAYER E DA LISTA DE VÍDEOS
   ========================================== */

import { state } from './state.js';
import { listaVideos } from '../data/videos.js';
import { CONFIG } from "./config.js";


let modoAleatorioContinuoAtivo = false;
let ytPlayerInstance = null;


/* ==========================================
   CONTROLE DE CARREGAMENTO DA API DO YOUTUBE
   ========================================== */

let youtubeApiPromise = null;
let youtubeApiResolve = null;


/* ==========================================
   INICIALIZA A API DO YOUTUBE
   ========================================== */

export function initPlayer() {

  /*
     Não configuramos o botão aleatório aqui.

     O app.js já faz isso através de:
     #btn-random-videos

     Isso evita que um único clique execute
     a reprodução aleatória duas vezes.
  */

  if (window.YT && window.YT.Player) {
    return;
  }


  /*
     Cria uma Promise para esperar a API.
  */

  if (!youtubeApiPromise) {

    youtubeApiPromise = new Promise((resolve) => {

      youtubeApiResolve = resolve;

    });

  }


  /*
     Verifica se o script da API já existe.
  */

  const scriptExistente =
    document.querySelector(
      'script[src="https://www.youtube.com/iframe_api"]'
    );


  if (!scriptExistente) {

    const tag =
      document.createElement('script');

    tag.src =
      "https://www.youtube.com/iframe_api";

    tag.async = true;

    const firstScriptTag =
      document.getElementsByTagName('script')[0];

    if (firstScriptTag) {

      firstScriptTag.parentNode.insertBefore(
        tag,
        firstScriptTag
      );

    } else {

      document.head.appendChild(tag);

    }

  }

}


/* ==========================================
   CALLBACK GLOBAL DA API DO YOUTUBE
   ========================================== */

window.onYouTubeIframeAPIReady = function() {

  /*
     A API terminou de carregar.

     Libera qualquer código que esteja
     aguardando a API.
  */

  if (youtubeApiResolve) {

    youtubeApiResolve(window.YT);

    youtubeApiResolve = null;

  }

};


/* ==========================================
   AGUARDA A API DO YOUTUBE
   ========================================== */

function aguardarYouTubeAPI() {

  if (
    window.YT &&
    window.YT.Player
  ) {

    return Promise.resolve(window.YT);

  }


  if (!youtubeApiPromise) {

    youtubeApiPromise = new Promise((resolve) => {

      youtubeApiResolve = resolve;

    });

  }


  return youtubeApiPromise;

}


/* ==========================================
   RENDERIZA A LISTA DE VÍDEOS
   ========================================== */

export function renderizarLista(videos) {

  const playlistEl =
    document.getElementById("playlist");

  if (!playlistEl) return;

  playlistEl.innerHTML = "";


  videos.forEach((video, index) => {

    // Garante compatibilidade com ambas
    // as nomenclaturas de ID do YouTube.
    const videoId =
      video.youtubeld || video.youtubeId;


    const card =
      document.createElement("div");


    card.className =
      "video-card-item";


    card.setAttribute(
      "tabindex",
      "0"
    );


    card.setAttribute(
      "data-index",
      index
    );


    const thumbUrl =
      `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;


    card.innerHTML = `
      <div class="video-thumbnail-wrapper">
        <img
          src="${thumbUrl}"
          alt="${video.title}"
          onerror="this.src='https://img.youtube.com/vi/${videoId}/default.jpg'"
        >
      </div>

      <div class="video-card-title">
        ${video.title}
      </div>
    `;


    card.addEventListener(
      "click",
      (e) => {

        e.preventDefault();

        state.kbPlaylistIndex =
          index;


        /*
           Se o usuário escolheu um vídeo
           manualmente, encerra o modo
           aleatório contínuo.
        */

        pararModoAleatorio();


        tocarVideo(index);

      }
    );


    playlistEl.appendChild(card);

  });

}


/* ==========================================
   CARREGA A PLAYLIST
   ========================================== */

export function carregarPlaylist() {

  renderizarLista(listaVideos);


  if (listaVideos.length > 0) {

    if (
      state.currentVideoIndex < 0
    ) {

      state.currentVideoIndex = 0;

    }

    state.kbPlaylistIndex = 0;

  }


  const playlistElement =
    document.getElementById("playlist");


  if (playlistElement) {

    playlistElement.setAttribute(
      "tabindex",
      "0"
    );


    playlistElement.focus();


    focarCartaoVideo(0);

  }

}


/* ==========================================
   FOCA VISUALMENTE UM CARTÃO
   ========================================== */

export function focarCartaoVideo(index) {

  const cards =
    document.querySelectorAll(
      ".video-card-item"
    );


  cards.forEach((card, i) => {

    if (i === index) {

      card.classList.add(
        "kb-focus"
      );


      card.scrollIntoView({
        behavior: "smooth",
        block: "nearest"
      });

    } else {

      card.classList.remove(
        "kb-focus"
      );

    }

  });

}


/* ==========================================
   REPRODUZ O VÍDEO
   ========================================== */

export async function tocarVideo(index) {

  if (
    !listaVideos ||
    listaVideos.length === 0
  ) {

    return;

  }


  if (
    index < 0 ||
    index >= listaVideos.length
  ) {

    return;

  }


  state.currentVideoIndex =
    index;


  const video =
    listaVideos[index];


  const videoId =
    video.youtubeId || video.youtubeld;


  if (!videoId) {

    console.error(
      "ID do YouTube não encontrado:",
      video
    );

    return;

  }


  /* ======================================
     CRIA O OVERLAY
     ====================================== */

  let playerOverlay =
    document.getElementById(
      "fullscreen-player-overlay"
    );


  if (!playerOverlay) {

    playerOverlay =
      document.createElement("div");


    playerOverlay.id =
      "fullscreen-player-overlay";


    playerOverlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: #000;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    `;


    playerOverlay.innerHTML = `
      <button id="close-fullscreen-player" style="
        position: absolute;
        top: 20px;
        right: 25px;
        background: rgba(0, 0, 0, 0.6);
        color: #fff;
        border: 2px solid #c5a059;
        font-size: 1.2rem;
        padding: 2px 12px;
        border-radius: 6px;
        cursor: pointer;
        z-index: 10000;
      ">✕</button>

      <div style="
        position: relative;
        width: 100%;
        height: 100%;
      ">

        <div
          id="youtube-player-div"
          style="
            width: 100%;
            height: 100%;
          "
        ></div>

      </div>
    `;


    document.body.appendChild(
      playerOverlay
    );


    /*
       Mantém exatamente o botão Fechar
       existente no seu programa.
    */

    document
      .getElementById(
        "close-fullscreen-player"
      )
      .addEventListener(
        "click",
        () => {

          fecharPlayerFullscreen();

        }
      );

  }


  playerOverlay.style.display =
    "flex";


  /* ======================================
     FULLSCREEN
     ====================================== */

  if (
    playerOverlay.requestFullscreen
  ) {

    playerOverlay
      .requestFullscreen()
      .catch(
        err =>
          console.log(
            "Fullscreen recusado:",
            err
          )
      );

  }


  /* ======================================
     AGUARDA A API DO YOUTUBE
     ====================================== */

  try {

    await aguardarYouTubeAPI();

  } catch (error) {

    console.error(
      "Erro ao carregar a API do YouTube:",
      error
    );

    return;

  }


  /* ======================================
     LOCALIZA O CONTAINER
     ====================================== */

  const container =
    document.getElementById(
      "youtube-player-div"
    );


  if (!container) {

    return;

  }


  /* ======================================
     REUTILIZA O PLAYER EXISTENTE
     ====================================== */

  if (
    ytPlayerInstance &&
    typeof ytPlayerInstance.loadVideoById ===
      "function"
  ) {

    ytPlayerInstance.loadVideoById(
      videoId
    );

    return;

  }


  /* ======================================
     CRIA O PLAYER DO YOUTUBE
     ====================================== */

  ytPlayerInstance =
    new YT.Player(
      "youtube-player-div",
      {

        height: "100%",

        width: "100%",

        videoId: videoId,


        playerVars: {

          /*
             O vídeo deve começar
             automaticamente.
          */

          autoplay: 1,

          enablejsapi: 1,

          vq: "hd1080",

          hd: 1

        },


        events: {

          onReady:
            onPlayerReady,

          onStateChange:
            onPlayerStateChange

        }

      }
    );

}


/* ==========================================
   PLAYER PRONTO
   ========================================== */

function onPlayerReady(event) {

  /*
     Garante que o vídeo comece
     automaticamente assim que o
     player estiver pronto.
  */

  event.target.playVideo();

}


/* ==========================================
   MONITORA O ESTADO DO PLAYER
   ========================================== */

function onPlayerStateChange(event) {

  /*
     YT.PlayerState.ENDED = 0

     Quando o vídeo terminar, entra
     aqui.
  */

  if (
    event.data ===
    YT.PlayerState.ENDED
  ) {

    verificarFimDeVideoNoModoContinuo();

  }

}


/* ==========================================
   FECHA O PLAYER EM TELA CHEIA
   ========================================== */

export function fecharPlayerFullscreen() {

  /*
     Ao fechar, desativa o modo
     aleatório contínuo.
  */

  modoAleatorioContinuoAtivo =
    false;


  const playerOverlay =
    document.getElementById(
      "fullscreen-player-overlay"
    );


  if (playerOverlay) {

    playerOverlay.style.display =
      "none";


    if (
      ytPlayerInstance &&
      typeof ytPlayerInstance.stopVideo ===
        "function"
    ) {

      ytPlayerInstance.stopVideo();

    }

  }


  /* ======================================
     SAI DO FULLSCREEN
     ====================================== */

  if (
    document.fullscreenElement &&
    document.exitFullscreen
  ) {

    document
      .exitFullscreen()
      .catch(
        err =>
          console.log(err)
      );

  }


  /* ======================================
     DEVOLVE O FOCO À PLAYLIST
     ====================================== */

  const playlistElement =
    document.getElementById(
      "playlist"
    );


  if (playlistElement) {

    playlistElement.focus();

  }

}


/* ==========================================
   INICIA O MODO ALEATÓRIO CONTÍNUO
   ========================================== */

export function iniciarVideosAleatoriosContinuos() {

  if (
    !listaVideos ||
    listaVideos.length === 0
  ) {

    return;

  }


  /*
     Ativa o modo contínuo.
  */

  modoAleatorioContinuoAtivo =
    true;


  /*
     Escolhe o primeiro vídeo
     aleatoriamente.
  */

  const randomIndex =
    Math.floor(
      Math.random() *
      listaVideos.length
    );


  /*
     Começa o vídeo.
  */

  tocarVideo(randomIndex);

}


/* ==========================================
   PRÓXIMO VÍDEO ALEATÓRIO
   ========================================== */

export function verificarFimDeVideoNoModoContinuo() {

  if (
    !modoAleatorioContinuoAtivo
  ) {

    return;

  }


  if (
    !listaVideos ||
    listaVideos.length === 0
  ) {

    return;

  }


  /*
     Escolhe outro vídeo aleatoriamente.
  */

  const proximoAleatorio =
    Math.floor(
      Math.random() *
      listaVideos.length
    );


  /*
     Pequeno intervalo para garantir
     que o vídeo anterior terminou
     completamente.
  */

  setTimeout(
    () => {

      if (
        modoAleatorioContinuoAtivo
      ) {

        tocarVideo(
          proximoAleatorio
        );

      }

    },
    300
  );

}


/* ==========================================
   PARA O MODO ALEATÓRIO
   ========================================== */

function pararModoAleatorio() {

  modoAleatorioContinuoAtivo =
    false;


  if (
    typeof state !== "undefined"
  ) {

    state.modoAleatorioAtivo =
      false;

  }

}


/* ==========================================
   FILTRA OS VÍDEOS
   ========================================== */

export function filtrarVideos() {

  const searchInput =
    document.getElementById(
      "search-input"
    );


  if (!searchInput) return;


  const termoBruto =
    searchInput.value;


  const termos =
    termoBruto
      ? termoBruto
          .normalize("NFD")
          .replace(
            /[\u0300-\u036f]/g,
            ""
          )
          .toLowerCase()
          .split(/\s+/)
      : [];


  const cards =
    document.querySelectorAll(
      ".video-card-item"
    );


  cards.forEach(card => {

    const tituloEl =
      card.querySelector(
        ".video-card-title"
      );


    if (!tituloEl) return;


    const titulo =
      tituloEl.textContent
        .normalize("NFD")
        .replace(
          /[\u0300-\u036f]/g,
          ""
        )
        .toLowerCase();


    const atendeTodos =
      termos.every(
        (t, index) => {

          if (
            /^\d{1,2}$/.test(t)
          ) {

            if (
              index ===
                termos.length - 1 &&
              termos.length >= 3
            ) {

              const regex =
                new RegExp(
                  `\\b${t}\\b(?!\\s*\\d{2})`
                );

              return regex.test(
                titulo
              );

            }


            const regex =
              new RegExp(
                `\\b${t}\\b`
              );


            return regex.test(
              titulo
            );

          }


          if (
            /^\d{4}$/.test(t)
          ) {

            if (
              index ===
                termos.length - 1 &&
              termos.length >= 3
            ) {

              const regex =
                new RegExp(
                  `\\b${t}\\b(?!\\s*\\d{2})`
                );

              return regex.test(
                titulo
              );

            }


            const regex =
              new RegExp(
                `\\b${t}\\b`
              );


            return regex.test(
              titulo
            );

          }


          return titulo.includes(t);

        }
      );


    if (
      atendeTodos ||
      termos.length === 0
    ) {

      card.style.display =
        "flex";

    } else {

      card.style.display =
        "none";

    }

  });

}


/* ==========================================
   IMPORTAÇÃO DA CONFIGURAÇÃO DO GITHUB
   ========================================== */


/*
   A importação foi mantida do seu
   player.js original.
*/


/* ==========================================
   UTF-8 -> BASE64
   ========================================== */

export function utf8ToBase64(str) {

  return btoa(

    encodeURIComponent(str)
      .replace(
        /%([0-9A-F]{2})/g,
        function(match, p1) {

          return String.fromCharCode(
            "0x" + p1
          );

        }
      )

  );

}


/* ==========================================
   BASE64 -> UTF-8
   ========================================== */

export function base64ToUtf8(base64) {

  return decodeURIComponent(

    Array.prototype.map.call(

      atob(
        base64.replace(/\s/g, "")
      ),

      function(c) {

        return "%" +
          (
            "00" +
            c.charCodeAt(0)
              .toString(16)
          ).slice(-2);

      }

    ).join("")

  );

}


/* ==========================================
   FORMATA ARRAY PARA CÓDIGO
   ========================================== */

export function formatarArrayParaCodigo(
  array
) {

  const itensFormatados =
    array.map(
      item =>
        `  { title: "${item.title.replace(/"/g, '\\"')}", youtubeId: "${item.youtubeId}" }`
    );


  return `const listaVideos = [\n${itensFormatados.join(",\n")}\n];`;

}


/* ==========================================
   SALVA LISTA NO GITHUB
   ========================================== */

export async function salvarListaNoGitHub(
  token,
  novaLista,
  mensagemCommit,
  novaSenhaUser = null,
  novaSenhaAdmin = null
) {

  if (!token) {

    throw new Error(
      "Informe o Token do GitHub."
    );

  }


  const apiUrl =
    `https://api.github.com/repos/` +
    `${CONFIG.GITHUB_OWNER}/` +
    `${CONFIG.GITHUB_REPO}/contents/` +
    `${CONFIG.GITHUB_FILE}`;


  const resGet =
    await fetch(
      apiUrl,
      {

        headers: {

          "Authorization":
            `Bearer ${token}`,

          "Accept":
            "application/vnd.github.v3+json"

        }

      }
    );


  if (!resGet.ok) {

    if (
      resGet.status === 401
    ) {

      throw new Error(
        "Token do GitHub inválido."
      );

    }


    if (
      resGet.status === 404
    ) {

      throw new Error(
        "Repositório ou arquivo index.html não encontrado."
      );

    }


    throw new Error(
      `Erro na busca (${resGet.status})`
    );

  }


  const fileData =
    await resGet.json();


  let contentDecoded =
    base64ToUtf8(
      fileData.content
    );


  const regexLista =
    /const listaVideos = \[\s*[\s\S]*?\s*\];/;


  if (
    !regexLista.test(
      contentDecoded
    )
  ) {

    throw new Error(
      "A estrutura listaVideos não foi encontrada no arquivo."
    );

  }


  const novoCodigoArray =
    formatarArrayParaCodigo(
      novaLista
    );


  contentDecoded =
    contentDecoded.replace(
      regexLista,
      novoCodigoArray
    );


  if (novaSenhaUser) {

    const regexUser =
      /let SENHA_USUARIO = ".*?";/;


    contentDecoded =
      contentDecoded.replace(
        regexUser,
        `let SENHA_USUARIO = "${novaSenhaUser}";`
      );

  }


  if (novaSenhaAdmin) {

    const regexAdmin =
      /let SENHA_ADMIN = ".*?";/;


    contentDecoded =
      contentDecoded.replace(
        regexAdmin,
        `let SENHA_ADMIN = "${novaSenhaAdmin}";`
      );

  }


  const contentEncoded =
    utf8ToBase64(
      contentDecoded
    );


  const resPut =
    await fetch(
      apiUrl,
      {

        method: "PUT",

        headers: {

          "Authorization":
            `Bearer ${token}`,

          "Accept":
            "application/vnd.github.v3+json",

          "Content-Type":
            "application/json"

        },

        body:
          JSON.stringify({

            message:
              mensagemCommit,

            content:
              contentEncoded,

            sha:
              fileData.sha

          })

      }
    );


  if (!resPut.ok) {

    const errData =
      await resPut.json();


    throw new Error(
      errData.message ||
      "Erro ao salvar no GitHub."
    );

  }

}