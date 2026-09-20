import { state } from "./state.js";
import { voltarParaMenu, voltarParaAdminMenu } from "./menu.js";
import { tocarVideo, renderizarLista, iniciarVideosAleatorios } from "./player.js";
import { listaVideos } from "../data/videos.js";
import { adicionarVideoNoGitHub, atualizarSenhas } from "./admin.js";

export function inicializarTeclado() {
    document.addEventListener("keydown", function(e) {
        const menuOverlayVisivel = document.getElementById("menu-overlay").style.display === "flex";
        const adminMenuVisivel = document.getElementById("admin-menu-overlay").style.display === "flex";
        const appVisivel = document.getElementById("app-container").style.display === "flex";
        const videoFormVisivel = document.getElementById("admin-form-overlay").style.display === "flex";
        const senhaFormVisivel = document.getElementById("admin-passwords-overlay").style.display === "flex";

        // ESC para voltar ao menu
        if (e.key === "Escape") {
            if (appVisivel) {
                voltarParaMenu();
            } else if (videoFormVisivel || senhaFormVisivel) {
                voltarParaAdminMenu();
            } else if (document.getElementById("admin-auth-overlay").style.display === "flex" ||
                       document.getElementById("placeholder-overlay").style.display === "flex" ||
                       adminMenuVisivel) {
                voltarParaMenu();
            }
            return;
        }

        // MENU PRINCIPAL
        if (menuOverlayVisivel) {
            const botoes = document.querySelectorAll("#main-menu-grid .btn-menu");
            if (e.key === "ArrowDown") {
                e.preventDefault();
                focarMenuPrincipal(state.menuFocusIndex + 1);
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                focarMenuPrincipal(state.menuFocusIndex - 1);
            } else if (e.key === "Enter") {
                if (botoes[state.menuFocusIndex]) {
                    botoes[state.menuFocusIndex].click();
                }
            }
            return;
        }

        // MENU ADMIN
        if (adminMenuVisivel) {
            const botoes = document.querySelectorAll("#admin-menu-grid .btn-menu");
            if (e.key === "ArrowDown") {
                e.preventDefault();
                focarAdminMenu(state.adminMenuFocusIndex + 1);
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                focarAdminMenu(state.adminMenuFocusIndex - 1);
            } else if (e.key === "Enter") {
                if (botoes[state.adminMenuFocusIndex]) {
                    botoes[state.adminMenuFocusIndex].click();
                }
            }
            return;
        }

        // TELA "PALAVRAS" (YOUTUBE TV)
        if (appVisivel) {
            const searchInput = document.getElementById("search-input");
            const searchFocado = document.activeElement === searchInput;
            const btnRandom = document.getElementById("btn-random-videos");
            const randomFocado = document.activeElement === btnRandom;

            if (searchFocado) {
                if (e.key === "ArrowDown") {
                    e.preventDefault();
                    btnRandom.focus();
                }
                return;
            }

            const searchBox = document.getElementById("search-input");
            const termoBruto = searchBox ? searchBox.value : "";
            const termos = termoBruto ? termoBruto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().split(/\s+/) : [];
            const listaExibida = termos.length > 0
                ? listaVideos.filter(video => {
                    const tit = video.title.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
                    return termos.every(t => tit.includes(t));
                  })
                : listaVideos;

            // Calcula quantidade de colunas na grelha dinamicamente
            const gridContainer = document.getElementById("playlist");
            let colunas = 4;
            if (gridContainer) {
                const computedStyle = window.getComputedStyle(gridContainer);
                colunas = computedStyle.getPropertyValue("grid-template-columns").split(" ").length || 4;
            }

            if (randomFocado) {
                if (e.key === "ArrowDown") {
                    e.preventDefault();
                    state.kbPlaylistIndex = 0;
                    renderizarLista(listaExibida);
                    focarCartaoVideo(0);
                } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    searchInput.focus();
                } else if (e.key === "Enter") {
                    e.preventDefault();
                    iniciarVideosAleatorios();
                }
                return;
            }

            if (e.key === "ArrowRight") {
                e.preventDefault();
                if (listaExibida.length > 0) {
                    state.kbPlaylistIndex = (state.kbPlaylistIndex + 1) % listaExibida.length;
                    renderizarLista(listaExibida);
                    focarCartaoVideo(state.kbPlaylistIndex);
                }
            } else if (e.key === "ArrowLeft") {
                e.preventDefault();
                if (listaExibida.length > 0) {
                    state.kbPlaylistIndex = (state.kbPlaylistIndex - 1 + listaExibida.length) % listaExibida.length;
                    renderizarLista(listaExibida);
                    focarCartaoVideo(state.kbPlaylistIndex);
                }
            } else if (e.key === "ArrowDown") {
                e.preventDefault();
                if (listaExibida.length > 0) {
                    let novoIndex = state.kbPlaylistIndex + colunas;
                    if (novoIndex >= listaExibida.length) novoIndex = listaExibida.length - 1;
                    state.kbPlaylistIndex = novoIndex;
                    renderizarLista(listaExibida);
                    focarCartaoVideo(state.kbPlaylistIndex);
                }
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                let novoIndex = state.kbPlaylistIndex - colunas;
                if (novoIndex < 0) {
                    btnRandom.focus();
                } else {
                    state.kbPlaylistIndex = novoIndex;
                    renderizarLista(listaExibida);
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
        }
    });
}

function focarCartaoVideo(index) {
    const cards = document.querySelectorAll(".video-card-item");
    if (cards[index]) {
        cards.forEach(c => c.classList.remove("kb-focus"));
        cards[index].classList.add("kb-focus");
        cards[index].scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
}

export function focarMenuPrincipal(index) {
    const botoes = document.querySelectorAll("#main-menu-grid .btn-menu");
    if (!botoes.length) return;
    state.menuFocusIndex = (index + botoes.length) % botoes.length;
    botoes.forEach((botao, i) => {
        botao.classList.toggle("kb-focus", i === state.menuFocusIndex);
    });
    botoes[state.menuFocusIndex].focus();
}

export function focarAdminMenu(index) {
    const botoes = document.querySelectorAll("#admin-menu-grid .btn-menu");
    if (!botoes.length) return;
    state.adminMenuFocusIndex = (index + botoes.length) % botoes.length;
    botoes.forEach((botao, i) => {
        botao.classList.toggle("kb-focus", i === state.adminMenuFocusIndex);
    });
    botoes[state.adminMenuFocusIndex].focus();
}