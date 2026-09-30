import { state } from './state.js';
import { listaVideos } from '../data/videos.js';

let modoAleatorioContinuoAtivo = false;
let ytPlayerInstance = null;
let youtubeApiPromise = null;

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
  });

  const scriptExistente = document.querySelector('script[src="https://www.youtube.com/iframe_api"]');
  if (!scriptExistente) {
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    tag.async = true;
    document.head.appendChild(tag);
  }

  return youtubeApiPromise;
}

export function initPlayer() {
  carregarYouTubeAPI().catch(error => {
    console.error('Erro ao carregar a API do YouTube:', error);
  });
}

window.onYouTubeIframeAPIReady = function () {
  // Callback global do iframe API
};

export function renderizarLista(videos) {
  const playlistEl = document.getElementById('playlist');
  if (!playlistEl) return;
  
  playlistEl.innerHTML = '';
  
  videos.forEach((video, index) => {
    const videoId = video.youtubeId || video.youtubeld;
    
    const card = document.createElement('div');
    card.className = 'video-card-item';
    card.setAttribute('tabindex', '0');
    card.setAttribute('data-index', index);
    
    const thumbUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;  
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
    
    card.addEventListener('click', (e) => {
      e.preventDefault();
      state.kbPlaylistIndex = index;
      pararModoAleatorio();
      tocarVideo(index);
    });
    playlistEl.appendChild(card);
  });
}

export function carregarPlaylist() {
  renderizarLista(listaVideos);
  if (listaVideos.length > 0) {
    if (state.currentVideoIndex < 0) {
      state.currentVideoIndex = 0;
    }
    state.kbPlaylistIndex = 0;
    
    const playlistElement = document.getElementById('playlist');
    if (playlistElement) {
      playlistElement.setAttribute('tabindex', '0');
      playlistElement.focus();
      focarCartaoVideo(0);
    }
  }
}

export function focarCartaoVideo(index) {
  const cards = document.querySelectorAll('.video-card-item');
  cards.forEach((card, i) => {
    if (i === index) {
      card.classList.add('kb-focus');
      card.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    } else {
      card.classList.remove('kb-focus');
    }
  });
}

// ... (mantenha as funções anteriores de carregamento da API)

export async function tocarVideo(index) {
  if (!listaVideos || listaVideos.length === 0) return;
  if (index < 0 || index >= listaVideos.length) return;
  
  state.currentVideoIndex = index;
  const video = listaVideos[index];
  const videoId = video.youtubeId || video.youtubeld;
  
  if (!videoId) {
    console.error('Vídeo sem ID do YouTube:', video);
    return;
  }
  
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
      z-index: 9999;
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
          top: 40px;
          right: 25px;
          background: rgba(0,0,0,0.6);
          color: #fff;
          border: 2px solid #c5a059;
          font-size: 1.2rem;
          padding: 2px 9px;
          border-radius: 6px;
          cursor: pointer;
          z-index: 10000;
        "
      >
        ✕
      </button>
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
  
  // Solicita tela cheia nativa do navegador imediatamente
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
    // Carrega o vídeo explicitamente solicitando a melhor qualidade disponível ('highres' ou 'hd1080')
    ytPlayerInstance.loadVideoById({
      videoId: videoId,
      suggestedQuality: 'highres'
    });
    return;
  }

  ytPlayerInstance = new window.YT.Player('youtube-player-div', {
    height: '100%',
    width: '100%',
    videoId: videoId,
    playerVars: {
      autoplay: 1,
      enablejsapi: 1,
      vq: 'highres', // Força a preferência por alta resolução inicial
      hd: 1,
      playsinline: 0,
      rel: 0
    },
    events: {
      onReady: (event) => {
        event.target.setPlaybackQuality('highres');
        event.target.playVideo();
      },
      onStateChange: (event) => {
        // Dispara ao iniciar o buffer/reprodução para garantir que a qualidade máxima seja aplicada
        if (event.data === window.YT.PlayerState.BUFFERING || event.data === window.YT.PlayerState.PLAYING) {
          if (typeof event.target.setPlaybackQuality === 'function') {
            event.target.setPlaybackQuality('highres');
          }
        }
        if (event.data === window.YT.PlayerState.ENDED) {
          verificarFimDeVideoNoModoContinuo();
        }
      },
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
    // Sincroniza a borda visual com o índice correto salvo no estado
    if (typeof state.kbPlaylistIndex === 'number') {
      focarCartaoVideo(state.kbPlaylistIndex);
    }
  }
}

export function iniciarVideosAleatoriosContinuos() {
  if (!listaVideos || listaVideos.length === 0) return;
  
  modoAleatorioContinuoAtivo = true;
  if (typeof state !== 'undefined') {
    state.modoAleatorioAtivo = true;
  }
  
  const randomIndex = Math.floor(Math.random() * listaVideos.length);
  tocarVideo(randomIndex);
}

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
        ? termoBruto
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .split(/\s+/)
        : [];

    const cards = document.querySelectorAll('.video-card-item');

    cards.forEach(card => {
        const tituloEl = card.querySelector('.video-card-title');
        if (!tituloEl) return;

        const titulo = tituloEl.textContent
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase();

        const atendeTodos = termos.every((t, index) => {
            /*
               Trata números de 1 ou 2 dígitos (ex: Mês ou Dia).
               Se houver um termo numérico anterior de 4 dígitos (Ano), 
               garantimos que este número de 2 dígitos seja tratado como MÊS 
               (logo após o ano, ex: '2026 09' não pega '2026 ... 09').
            */
            if (/^\d{1,2}$/.test(t)) {
                // Se o termo anterior na busca foi um ano de 4 dígitos, este número é o mês
                const termoAnterior = index > 0 ? termos[index - 1] : null;
                if (termoAnterior && /^\d{4}$/.test(termoAnterior)) {
                    // Regex para garantir que o número venha logo após o ano (Ano Mês)
                    const regexAnoMes = new RegExp(`${termoAnterior}\\s+0?${parseInt(t, 10)}\\b`);
                    return regexAnoMes.test(titulo);
                }

                if (index === termos.length - 1 && termos.length >= 3) {
                    const regex = new RegExp(`\\b${t}\\b(?!\\s*\\d{2})`);
                    return regex.test(titulo);
                }
                const regex = new RegExp(`\\b${t}\\b`);
                return regex.test(titulo);
            }

            /*
               Trata números de quatro dígitos (Ano).
            */
            if (/^\d{4}$/.test(t)) {
                if (index === termos.length - 1 && termos.length >= 3) {
                    const regex = new RegExp(`\\b${t}\\b(?!\\s*\\d{2})`);
                    return regex.test(titulo);
                }
                const regex = new RegExp(`\\b${t}\\b`);
                return regex.test(titulo);
            }

            /*
               Para palavras normais, procura em qualquer parte do título.
            */
            return titulo.includes(t);
        });

        if (atendeTodos || termos.length === 0) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });
}