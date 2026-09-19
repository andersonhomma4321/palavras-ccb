import { state } from "./state.js";
import { abrirAuthAdmin } from "./auth.js";
import { carregarPlaylist } from "./player.js";


export function navegarPara(opcao) {

  document.getElementById(
    "menu-overlay"
  ).style.display = "none";


  if (opcao === "palavras") {

    document.getElementById(
      "app-container"
    ).style.display = "block";

    carregarPlaylist();

    document.getElementById(
      "playlist"
    ).focus();

  }


  else if (opcao === "configuracao") {

    abrirAuthAdmin();

  }


  else if (opcao === "biblia") {

    abrirPlaceholder(
      "📖 Bíblia",
      "A Bíblia Sagrada estará disponível em breve."
    );

  }


  else if (opcao === "hinos") {

    abrirPlaceholder(
      "🎵 Hinos",
      "O hinário com as letras dos hinos estará disponível em breve."
    );

  }

}


export function abrirPlaceholder(
  titulo,
  descricao
) {

  document.getElementById(
    "placeholder-title"
  ).innerText = titulo;

  document.getElementById(
    "placeholder-desc"
  ).innerText = descricao;

  document.getElementById(
    "placeholder-overlay"
  ).style.display = "flex";

  document.getElementById(
    "btn-placeholder-back"
  ).focus();

}


export function voltarParaMenu() {

  fecharModais();

  document.getElementById(
    "app-container"
  ).style.display = "none";

  document.getElementById(
    "menu-overlay"
  ).style.display = "flex";

}


export function voltarParaAdminMenu() {

  fecharModais();

  document.getElementById(
    "admin-menu-overlay"
  ).style.display = "flex";

}


export function fecharModais() {

  document.getElementById(
    "admin-auth-overlay"
  ).style.display = "none";

  document.getElementById(
    "admin-menu-overlay"
  ).style.display = "none";

  document.getElementById(
    "admin-form-overlay"
  ).style.display = "none";

  document.getElementById(
    "admin-passwords-overlay"
  ).style.display = "none";

  document.getElementById(
    "placeholder-overlay"
  ).style.display = "none";

}
