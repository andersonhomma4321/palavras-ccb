/* ==========================================
PLAYER.JS - Gestão do Leitor de Vídeos e Overlay
========================================== */

// Variáveis globais do player mantidas em conformidade com o projeto
export let ytPlayerInstance = null;
let apiLoadingPromise = null;

// Objeto de estado global do projeto
const state = {
    currentVideoIndex: 0
};

// Se a sua aplicação utiliza uma lista de vídeos externa, ela será referenciada aqui
// (Certifique-se de que listaVideos está importada ou declarada globalmente no seu escopo)

/* ======================================
CARREGA A API DO YOUTUBE (CASO NECESSÁRIO)
====================================== */
export function carregarYouTubeAPI() {
    if (window.YT && window.YT.Player) {
        return Promise.resolve();
    }
    if (apiLoadingPromise) {
        return apiLoadingPromise;
    }

    apiLoadingPromise = new Promise((resolve, reject) => {
        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName('script')[0];
        if (firstScriptTag && firstScriptTag.parentNode) {
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        } else {
            document.head.appendChild(tag);
        }

        window.onYouTubeIframeAPIReady = () => {
            resolve();
        };

        // Timeout de segurança caso a API demore a responder
        setTimeout(() => {
            if (window.YT && window.YT.Player) {
                resolve();
            } else {
                reject(new Error('Timeout ao carregar a API do YouTube'));
            }
        }, 10000);
    });

    return apiLoadingPromise;
}

/* ==========================================
REPRODUZ UM VÍDEO
========================================== */
export async function tocarVideo(index) {
    if (!window.listaVideos || window.listaVideos.length === 0) {
        return;
    }
    if (index < 0 || index >= window.listaVideos.length) {
        return;
    }
    state.currentVideoIndex = index;
    const video = window.listaVideos[index];
    
    // Compatibilidade com as duas nomenclaturas de ID presentes no projeto
    const videoId = video.youtubeId || video.youtubeld;
    if (!videoId) {
        console.error('Vídeo sem ID do YouTube:', video);
        return;
    }

    /* ======================================
    CRIA OU RECUPERA O OVERLAY EM FULLSCREEN
    ====================================== */
    let playerOverlay = document.getElementById('fullscreen-player-overlay');
    if (!playerOverlay) {
        playerOverlay = document.createElement('div');
        playerOverlay.id = 'fullscreen-player-overlay';
        playerOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: #000;
            z-index: 99999;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
        `;
        playerOverlay.innerHTML = `
            <button
                id="close-fullscreen-player"
                style="
                    position: absolute;
                    top: 25px;
                    right: 35px;
                    background: rgba(0, 0, 0, 0.8);
                    color: #fff;
                    border: 2px solid #c5a059;
                    font-size: 1.8rem;
                    padding: 5px 15px;
                    border-radius: 8px;
                    cursor: pointer;
                    z-index: 100000;
                "
            >
                ✕
            </button>
            <div
                id="youtube-player-container"
                style="
                    position: relative;
                    width: 100%;
                    height: 100%;
                "
            ></div>
        `;
        document.body.appendChild(playerOverlay);

        // Evento seguro no botão "X" para fechar
        document.getElementById('close-fullscreen-player').addEventListener('click', (e) => {
            e.stopPropagation();
            fecharPlayerFullscreen();
        });
    }

    // Exibe o overlay
    playerOverlay.style.display = 'flex';

    // Solicita o modo tela cheia do navegador
    if (playerOverlay.requestFullscreen) {
        playerOverlay.requestFullscreen().catch(err => console.log('Fullscreen recusado:', err));
    }

    /* ======================================
    INSERE O IFRAME DO VÍDEO
    ====================================== */
    const playerContainer = document.getElementById('youtube-player-container');
    if (playerContainer) {
        playerContainer.innerHTML = `
            <iframe 
                src="https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1" 
                width="100%" 
                height="100%" 
                frameborder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen>
            </iframe>
        `;
    }
}

/* ==========================================
FECHA O PLAYER FULLSCREEN
========================================== */
export function fecharPlayerFullscreen() {
    const playerOverlay = document.getElementById('fullscreen-player-overlay');
    if (playerOverlay) {
        // Destrói o iframe e interrompe o fluxo do vídeo imediatamente
        const container = document.getElementById('youtube-player-container');
        if (container) {
            container.innerHTML = '';
        }
        playerOverlay.style.display = 'none';
    }

    // Sai do modo tela cheia do navegador com segurança
    if (document.fullscreenElement) {
        document.exitFullscreen().catch(err => console.log('Erro ao sair do fullscreen:', err));
    }

    // Devolve o foco para o elemento principal de grelha de vídeos da interface
    const gridContainer = document.querySelector('.tv-grid-container');
    if (gridContainer) {
        gridContainer.focus();
    }
}