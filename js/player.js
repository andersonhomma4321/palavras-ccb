/* ==========================================
GESTOR DO PLAYER E DA LISTA DE VÍDEOS
========================================== */
import { state } from './state.js';
import { listaVideos } from '../data/videos.js';
import { CONFIG } from './config.js';

/* ==========================================
VARIÁVEIS DO PLAYER
========================================== */
let modoAleatorioContinuoAtivo = false;
let ytPlayerInstance = null;
let youtubeApiPromise = null;

/* ==========================================
CARREGA A API DO YOUTUBE
========================================== */
function carregarYouTubeAPI() {
    if (window.YT && window.YT.Player) {
        return Promise.resolve(window.YT);
    } 
    if (youtubeApiPromise) {
        return youtubeApiPromise;
    }

    youtubeApiPromise = new Promise((resolve, reject) => {
        let finalizado = false;
        const timeout = setTimeout(() => {
            if (!finalizado) {
                finalizado = true;
                reject(new Error('A API do YouTube demorou muito para carregar.'));
            }
        }, 15000);

        const callbackAnterior = window.onYouTubeIframeAPIReady;
        window.onYouTubeIframeAPIReady = function () {
            if (typeof callbackAnterior === 'function') {
                callbackAnterior();
            }
            if (!finalizado) {
                finalizado = true;
                clearTimeout(timeout);
                resolve(window.YT);
            }
        };

        const scriptExistente = document.querySelector('script[src="https://www.youtube.com/iframe_api"]');
        if (!scriptExistente) {
            const tag = document.createElement('script');
            tag.src = 'https://www.youtube.com/iframe_api';
            tag.async = true;
            document.head.appendChild(tag);
        } else if (window.YT && window.YT.Player) {
            if (!finalizado) {
                finalizado = true;
                clearTimeout(timeout);
                resolve(window.YT);
            }
        }
    });

    return youtubeApiPromise;
}

/* ==========================================
INICIALIZA O PLAYER
========================================== */
export function initPlayer() {
    carregarYouTubeAPI().catch(error => {
        console.error('Erro ao carregar a API do YouTube:', error);
    });
}

/* ==========================================
RENDERIZA A LISTA DE VÍDEOS
========================================== */
export function renderizarLista(videos) {
    const playlistEl = document.getElementById('playlist');
    if (!playlistEl) return;
    playlistEl.innerHTML = '';
    
    videos.forEach((video, index) => {
        const videoId = video.youtubeld || video.youtubeId;
        const card = document.createElement('div');
        card.className = 'video-card-item';
        card.setAttribute('tabindex', '0');
        card.setAttribute('data-index', index);
        
        const thumbUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
        
        card.innerHTML = `
            <div class="video-thumbnail-wrapper">
                <img src="${thumbUrl}" alt="${video.title}" onerror="this.src='https://img.youtube.com/vi/${videoId}/default.jpg'">
            </div>
            <div class="video-card-title">${video.title}</div>
        `;
        
        card.addEventListener('click', (e) => {
            e.preventDefault();
            state.kbPlaylistIndex = index;
            pararModoAleatorio();
            tocarVideo(index);
        });
        
        playlistEl.appendChild(card);
    });
}

/* ==========================================
CARREGA A PLAYLIST
========================================== */
export function carregarPlaylist() {
    renderizarLista(listaVideos);
    if (listaVideos.length > 0) {
        if (state.currentVideoIndex < 0) {
            state.currentVideoIndex = 0;
            state.kbPlaylistIndex = 0;
        }
    }
    const playlistElement = document.getElementById('playlist');
    if (playlistElement) {
        playlistElement.setAttribute('tabindex', '0');
        playlistElement.focus();
        focarCartaoVideo(0);
    }
}

/* ==========================================
FOCA UM CARTÃO DA PLAYLIST
========================================== */
export function focarCartaoVideo(index) {
    const cards = document.querySelectorAll('.video-card-item');
    cards.forEach((card, i) => {
        if (i === index) {
            card.classList.add('kb-focus');
            card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else {
            card.classList.remove('kb-focus');
        }
    });
}

/* ==========================================
REPRODUZ UM VÍDEO
========================================== */
export async function tocarVideo(index) {
    if (!listaVideos || listaVideos.length === 0) return;
    if (index < 0 || index >= listaVideos.length) return;
    
    state.currentVideoIndex = index;
    const video = listaVideos[index];
    const videoId = video.youtubeld || video.youtubeId;
    
    if (!videoId) {
        console.error('Vídeo sem ID do YouTube:', video);
        return;
    }

    let playerOverlay = document.getElementById('fullscreen-player-overlay');
    if (!playerOverlay) {
        playerOverlay = document.createElement('div');
        playerOverlay.id = 'fullscreen-player-overlay';
        playerOverlay.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            background: #000; z-index: 9999; display: flex;
            flex-direction: column; justify-content: center; align-items: center;
        `;
        playerOverlay.innerHTML = `
            <button id="close-fullscreen-player" style="
                position: absolute; top: 40px; right: 25px;
                background: rgba(0,0,0,0.6); color: #fff; border: 2px solid #c5a059;
                font-size: 1.5rem; padding: 3px 12px; border-radius: 6px;
                cursor: pointer; z-index: 10000;
            ">&times;</button>
            <div style="position: relative; width: 100%; height: 100%;">
                <div id="youtube-player-div" style="width: 100%; height: 100%;"></div>
            </div>
        `;
        document.body.appendChild(playerOverlay);
        
        document.getElementById('close-fullscreen-player').addEventListener('click', () => {
            fecharPlayerFullscreen();
        });
    }

    playerOverlay.style.display = 'flex';

    if (playerOverlay.requestFullscreen) {
        playerOverlay.requestFullscreen().catch(err => console.log('Fullscreen recusado:', err));
    }

    try {
        await carregarYouTubeAPI();
    } catch (error) {
        console.error('Não foi possível carregar a API do YouTube:', error);
        alert('Não foi possível carregar o player do YouTube.');
        return;
    }

    const playerContainer = document.getElementById('youtube-player-div');
    if (!playerContainer) return;

    if (ytPlayerInstance && typeof ytPlayerInstance.loadVideoById === 'function') {
        ytPlayerInstance.loadVideoById(videoId);
        return;
    }

    ytPlayerInstance = new window.YT.Player('youtube-player-div', {
        height: '100%',
        width: '100%',
        videoId: videoId,
        playerVars: {
            autoplay: 1,
            enablejsapi: 1,
            vq: 'hd1080',
            hd: 1,
            playsinline: 0
        },
        events: {
            onReady: onPlayerReady,
            onStateChange: onPlayerStateChange,
            onError: onPlayerError
        }
    });
}

function onPlayerReady(event) {
    event.target.playVideo();
}

function onPlayerStateChange(event) {
    if (event.data === window.YT.PlayerState.ENDED) {
        verificarFimDeVideoNoModoContinuo();
    }
}

function onPlayerError(event) {
    console.error('Erro no player do YouTube:', event.data);
    if (modoAleatorioContinuoAtivo) {
        setTimeout(() => {
            verificarFimDeVideoNoModoContinuo();
        }, 1000);
    }
}

/* ==========================================
FECHA O PLAYER
========================================== */
export function fecharPlayerFullscreen() {
    modoAleatorioContinuoAtivo = false;
    if (typeof state !== 'undefined') {
        state.modoAleatorioAtivo = false;
    }
    
    const playerOverlay = document.getElementById('fullscreen-player-overlay');
    if (playerOverlay) {
        playerOverlay.style.display = 'none';
    }
    
    if (ytPlayerInstance && typeof ytPlayerInstance.stopVideo === 'function') {
        ytPlayerInstance.stopVideo();
    }
    
    if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(err => console.log(err));
    }
    
    const playlistElement = document.getElementById('playlist');
    if (playlistElement) {
        playlistElement.focus();
    }
}

/* ==========================================
INICIA REPRODUÇÃO ALEATÓRIA CONTÍNUA
========================================== */
export function iniciarVideosAleatoriosContinuos() {
    if (!listaVideos || listaVideos.length === 0) return;
    
    modoAleatorioContinuoAtivo = true;
    if (typeof state !== 'undefined') {
        state.modoAleatorioAtivo = true;
    }
    
    const randomIndex = Math.floor(Math.random() * listaVideos.length);
    tocarVideo(randomIndex);
}

/* ==========================================
AVANÇA PARA O PRÓXIMO VÍDEO ALEATÓRIO
========================================== */
export function verificarFimDeVideoNoModoContinuo() {
    if (!modoAleatorioContinuoAtivo) return;
    if (!listaVideos || listaVideos.length === 0) return;
    
    const proximoAleatorio = Math.floor(Math.random() * listaVideos.length);
    setTimeout(() => {
        if (modoAleatorioContinuoAtivo) {
            tocarVideo(proximoAleatorio);
        }
    }, 300);
}

/* ==========================================
PARA O MODO ALEATÓRIO
========================================== */
export function pararModoAleatorio() {
    modoAleatorioContinuoAtivo = false;
    if (typeof state !== 'undefined') {
        state.modoAleatorioAtivo = false;
    }
}

/* ==========================================
FILTRA OS VÍDEOS
========================================== */
export function filtrarVideos() {
    const searchInput = document.getElementById('search-input');
    if (!searchInput) return;
    
    const termoBruto = searchInput.value;
    const termos = termoBruto
        ? termoBruto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().split(/\s+/)
        : [];
        
    const cards = document.querySelectorAll('.video-card-item');
    cards.forEach(card => {
        const tituloEl = card.querySelector('.video-card-title');
        if (!tituloEl) return;
        
        const titulo = tituloEl.textContent.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
        const atendeTodos = termos.every((t) => {
            if (/^\d{1,2}$/.test(t)) {
                const regex = new RegExp(`\\b${t}\\b`);
                return regex.test(titulo);
            }
            if (/^\d{4}$/.test(t)) {
                const regex = new RegExp(`\\b${t}\\b`);
                return regex.test(titulo);
            }
            if (t.length === 1) {
                const regex = new RegExp(`\\b${t}`);
                return regex.test(titulo);
            }
            return titulo.includes(t);
        });
        
        if (atendeTodos || termos.length === 0) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });
}

/* ==========================================
CONVERSÃO UTF-8 -> BASE64
========================================== */
export function utf8ToBase64(str) {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function(match, p1) {
        return String.fromCharCode('0x' + p1);
    }));
}

/* ==========================================
CONVERSÃO BASE64 -> UTF-8
========================================== */
export function base64ToUtf8(base64) {
    return decodeURIComponent(Array.prototype.map.call(atob(base64.replace(/\s/g, '')), function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
}

/* ==========================================
FORMATA ARRAY PARA CÓDIGO
========================================== */
export function formatarArrayParaCodigo(array) {
    const itensFormatados = array.map(
        item => `  { title: "${item.title.replace(/"/g, '\\"')}", youtubeld: "${item.youtubeld || item.youtubeId}" }`
    );
    return `const listaVideos = [\n${itensFormatados.join(',\n')}\n];`;
}

/* ==========================================
SALVA LISTA NO GITHUB
========================================== */
export async function salvarListaNoGitHub(token, novaLista, mensagemCommit, novaSenhaUser = null, novaSenhaAdmin = null) {
    if (!token) {
        throw new Error('Informe o Token do GitHub.');
    }
    
    const apiUrl = `https://api.github.com/repos/${CONFIG.GITHUB_OWNER}/${CONFIG.GITHUB_REPO}/contents/${CONFIG.GITHUB_FILE}`;
    
    const resGet = await fetch(apiUrl, {
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github.v3+json'
        }
    });
    
    if (!resGet.ok) {
        if (resGet.status === 401) {
            throw new Error('Token do GitHub inválido.');
        }
        if (resGet.status === 404) {
            throw new Error('Repositório ou arquivo index.html não encontrado.');
        }
        throw new Error(`Erro na busca (${resGet.status})`);
    }
    
    const fileData = await resGet.json();
    let contentDecoded = base64ToUtf8(fileData.content);
    
    const regexLista = /const listaVideos = \[\s*[\s\S]*?\s*\];/;
    if (!regexLista.test(contentDecoded)) {
        throw new Error('A estrutura listaVideos não foi encontrada no arquivo.');
    }
    
    const novoCodigoArray = formatarArrayParaCodigo(novaLista);
    contentDecoded = contentDecoded.replace(regexLista, novoCodigoArray);
    
    if (novaSenhaUser) {
        const regexUser = /let SENHA_USUARIO\s*=\s*".*?";/;
        contentDecoded = contentDecoded.replace(regexUser, `let SENHA_USUARIO = "${novaSenhaUser}";`);
    }
    
    if (novaSenhaAdmin) {
        const regexAdmin = /let SENHA_ADMIN\s*=\s*".*?";/;
        contentDecoded = contentDecoded.replace(regexAdmin, `let SENHA_ADMIN = "${novaSenhaAdmin}";`);
    }
    
    const contentEncoded = utf8ToBase64(contentDecoded);
    
    const resPut = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            message: mensagemCommit,
            content: contentEncoded,
            sha: fileData.sha
        })
    });
    
    if (!resPut.ok) {
        const errData = await resPut.json();
        throw new Error(errData.message || 'Erro ao salvar no GitHub.');
    }
}