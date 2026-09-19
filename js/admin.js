import { listaVideos } from "../data/videos.js";

import { state } from "./state.js";

import {
  salvarListaNoGitHub
} from "./github.js";


export function abrirGerenciadorVideos() {

  fecharModaisAdmin();


  document.getElementById(
    "admin-form-overlay"
  ).style.display = "flex";


  renderizarListaAdmin();


  setTimeout(() => {

    document.getElementById(
      "gh-token-videos"
    ).focus();

  }, 50);

}


export function abrirModalSenhas() {

  fecharModaisAdmin();


  document.getElementById(
    "admin-passwords-overlay"
  ).style.display = "flex";


  document.getElementById(
    "new-user-pass"
  ).value = "";


  document.getElementById(
    "new-admin-pass"
  ).value = "";


  document.getElementById(
    "pass-msg"
  ).innerText = "";


  setTimeout(() => {

    document.getElementById(
      "gh-token-pass"
    ).focus();

  }, 50);

}


function fecharModaisAdmin() {

  document.getElementById(
    "admin-form-overlay"
  ).style.display = "none";


  document.getElementById(
    "admin-passwords-overlay"
  ).style.display = "none";

}


export function renderizarListaAdmin() {

  const adminList =
    document.getElementById(
      "admin-video-list"
    );


  adminList.innerHTML = "";


  if (listaVideos.length === 0) {

    adminList.innerHTML =
      `<li class="admin-video-item">
        Nenhum vídeo cadastrado
      </li>`;

    return;

  }


  listaVideos.forEach(
    (video, index) => {

      const li =
        document.createElement("li");


      li.className =
        "admin-video-item";


      const titleSpan =
        document.createElement("span");


      titleSpan.innerText =
        video.title;


      titleSpan.title =
        video.title;


      const delBtn =
        document.createElement("button");


      delBtn.className =
        "btn-delete-item";


      delBtn.type =
        "button";


      delBtn.innerText =
        "Excluir";


      delBtn.addEventListener(
        "click",
        () => excluirVideoDoGitHub(index)
      );


      li.appendChild(
        titleSpan
      );


      li.appendChild(
        delBtn
      );


      adminList.appendChild(
        li
      );

    }
  );

}


export function extrairYoutubeId(
  entrada
) {

  const regex =
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;


  const match =
    entrada.match(regex);


  return match
    ? match[1]
    : entrada.trim();

}


export async function adicionarVideoNoGitHub() {

  const token =
    document.getElementById(
      "gh-token-videos"
    ).value.trim();


  const title =
    document.getElementById(
      "new-video-title"
    ).value.trim();


  const rawUrl =
    document.getElementById(
      "new-video-url"
    ).value.trim();


  const msg =
    document.getElementById(
      "admin-msg"
    );


  const btn =
    document.getElementById(
      "btn-save-gh"
    );


  if (!token) {

    msg.style.color = "red";

    msg.innerText =
      "Preencha o Token do GitHub!";

    return;

  }


  if (!title || !rawUrl) {

    msg.style.color = "red";

    msg.innerText =
      "Preencha o título e a URL/ID do vídeo!";

    return;

  }


  const youtubeId =
    extrairYoutubeId(
      rawUrl
    );


  btn.disabled = true;


  msg.style.color =
    "#0b2545";


  msg.innerText =
    "Enviando alterações...";


  try {

    const novaLista = [
      ...listaVideos,
      {
        title,
        youtubeId
      }
    ];


    await salvarListaNoGitHub(
      token,
      novaLista,
      `Adicionado vídeo: ${title}`
    );


    listaVideos.push({
      title,
      youtubeId
    });


    renderizarListaAdmin();


    msg.style.color =
      "green";


    msg.innerText =
      "Vídeo salvo com sucesso!";


    document.getElementById(
      "new-video-title"
    ).value = "";


    document.getElementById(
      "new-video-url"
    ).value = "";


  } catch (err) {

    msg.style.color =
      "red";


    msg.innerText =
      "Erro: " + err.message;


  } finally {

    btn.disabled =
      false;

  }

}


export async function excluirVideoDoGitHub(
  index
) {

  const token =
    document.getElementById(
      "gh-token-videos"
    ).value.trim();


  const msg =
    document.getElementById(
      "admin-msg"
    );


  if (!token) {

    msg.style.color =
      "red";

    msg.innerText =
      "Digite o Token do GitHub antes de excluir!";

    return;

  }


  const videoRemover =
    listaVideos[index];


  if (!videoRemover) {
    return;
  }


  if (
    !confirm(
      `Excluir o vídeo:\n"${videoRemover.title}"?`
    )
  ) {

    return;

  }


  msg.style.color =
    "#0b2545";


  msg.innerText =
    "Removendo vídeo...";


  try {

    const novaLista =
      listaVideos.filter(
        (_, i) => i !== index
      );


    await salvarListaNoGitHub(
      token,
      novaLista,
      `Removido vídeo: ${videoRemover.title}`
    );


    listaVideos.splice(
      index,
      1
    );


    renderizarListaAdmin();


    msg.style.color =
      "green";


    msg.innerText =
      "Vídeo removido com sucesso!";


  } catch (err) {

    msg.style.color =
      "red";


    msg.innerText =
      "Erro ao excluir: " +
      err.message;

  }

}


export async function atualizarSenhas() {

  const token =
    document.getElementById(
      "gh-token-pass"
    ).value.trim();


  const newPassUser =
    document.getElementById(
      "new-user-pass"
    ).value.trim();


  const newPassAdmin =
    document.getElementById(
      "new-admin-pass"
    ).value.trim();


  const msg =
    document.getElementById(
      "pass-msg"
    );


  const btn =
    document.getElementById(
      "btn-save-pass"
    );


  if (!token) {

    msg.style.color =
      "red";

    msg.innerText =
      "Informe o Token do GitHub!";

    return;

  }


  if (
    !newPassUser &&
    !newPassAdmin
  ) {

    msg.style.color =
      "red";

    msg.innerText =
      "Preencha ao menos uma das senhas!";

    return;

  }


  btn.disabled =
    true;


  msg.style.color =
    "#0b2545";


  msg.innerText =
    "Salvando senhas no GitHub...";


  try {

    await salvarListaNoGitHub(
      token,
      listaVideos,
      "Atualização de Senhas de Acesso",
      newPassUser || null,
      newPassAdmin || null
    );


    if (newPassUser) {

      state.SENHA_USUARIO =
        newPassUser;

    }


    if (newPassAdmin) {

      state.SENHA_ADMIN =
        newPassAdmin;

    }


    msg.style.color =
      "green";


    msg.innerText =
      "Senhas atualizadas com sucesso!";


    document.getElementById(
      "new-user-pass"
    ).value = "";


    document.getElementById(
      "new-admin-pass"
    ).value = "";


  } catch (err) {

    msg.style.color =
      "red";


    msg.innerText =
      "Erro ao atualizar senhas: " +
      err.message;


  } finally {

    btn.disabled =
      false;

  }

}