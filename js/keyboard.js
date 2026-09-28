/* ==========================================
GERENCIAMENTO DE TECLADO / CONTROLES
========================================== */
import { state } from './state.js';

let colunas = 4; // Quantidade padrão de colunas na grade de vídeos

export function calcularColunas() {
    const grid = document.getElementById('playlist');
    if (!grid) return;
    const gridWidth = grid.clientWidth;
    const card = grid.querySelector('.video-card-item');
    if (card) {
        const cardWidth = card.offsetWidth + parseInt(window.getComputedStyle(card).marginRight || 15);
        if (cardWidth > 0) {
            colunas = Math.max(1, Math.floor(gridWidth / cardWidth));
        }
    }
}

export function focarCartaoVideo(index) {
    const cards = document.querySelectorAll('.video-card-item');
    if (cards.length === 0) return;
    
    if (index < 0) index = 0;
    if (index >= cards.length) index = cards.length - 1;
    
    state.kbPlaylistIndex = index;
    
    cards.forEach((c, idx) => {
        if (idx === index) {
            c.classList.add('kb-focused');
            c.focus();
            c.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else {
            c.classList.remove('kb-focused');
        }
    });
}

export function focarAdminMenu() {
    const adminElement = document.getElementById('admin-menu') || document.querySelector('.admin-section');
    if (adminElement) {
        adminElement.focus();
        adminElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

export function initKeyboardNavigation() {
    window.addEventListener('resize', () => {
        calcularColunas();
    });

    document.addEventListener('keydown', (e) => {
        calcularColunas();
        const searchBox = document.getElementById('search-input');
        const btnRandom = document.getElementById('btn-random-videos');

        if (document.activeElement === searchBox) {
            if (e.key === "ArrowDown") {
                e.preventDefault();
                state.kbPlaylistIndex = 0;
                focarCartaoVideo(state.kbPlaylistIndex);
            } else if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
                return;
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                return;
            }
            return;
        }

        const cards = document.querySelectorAll('.video-card-item');
        if (cards.length > 0 && (Array.from(cards).includes(document.activeElement) || document.activeElement === btnRandom)) {
            
            if (e.key === "ArrowRight") {
                e.preventDefault();
                if (document.activeElement === btnRandom) {
                    focarCartaoVideo(0);
                } else {
                    if (cards.length > 0) {
                        state.kbPlaylistIndex = (state.kbPlaylistIndex + 1) % cards.length;
                        focarCartaoVideo(state.kbPlaylistIndex);
                    }
                }
            } else if (e.key === "ArrowLeft") {
                e.preventDefault();
                if (document.activeElement === btnRandom) {
                    return;
                } else {
                    state.kbPlaylistIndex = (state.kbPlaylistIndex - 1 + cards.length) % cards.length;
                    focarCartaoVideo(state.kbPlaylistIndex);
                }
            } else if (e.key === "ArrowDown") {
                e.preventDefault();
                if (document.activeElement === btnRandom) {
                    state.kbPlaylistIndex = 0;
                    focarCartaoVideo(state.kbPlaylistIndex);
                } else {
                    let novoIndex = state.kbPlaylistIndex + colunas; 
                    if (novoIndex >= cards.length) novoIndex = cards.length - 1;
                    state.kbPlaylistIndex = novoIndex;
                    focarCartaoVideo(state.kbPlaylistIndex);
                }
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                if (document.activeElement === btnRandom) {
                    if (searchBox) searchBox.focus();
                } else {
                    let novoIndex = state.kbPlaylistIndex - colunas;
                    if (novoIndex < 0) {
                        if (btnRandom) {
                            btnRandom.focus();
                        }
                    } else {
                        state.kbPlaylistIndex = novoIndex;
                        focarCartaoVideo(state.kbPlaylistIndex);
                    }
                }
            }
        }
    });
}