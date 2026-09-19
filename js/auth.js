import { state } from "./state.js";

export function autenticar(event) {

  if (event) {
    event.preventDefault();
  }

  const inputField =
    document.getElementById("password-input");

  const input =
    inputField.value.trim();

  const errorMsg =
    document.getElementById("login-error");


  if (
    input.toLowerCase() ===
    state.SENHA_USUARIO.toLowerCase()
  ) {

    document.getElementById(
      "login-overlay"
    ).style.display = "none";

    document.getElementById(
      "menu-overlay"
    ).style.display = "flex";

    errorMsg.style.display = "none";

  } else {

    errorMsg.innerText =
      "Senha incorreta!";

    errorMsg.style.display =
      "block";
  }

}


export function verificarSenhaAdmin(event) {

  if (event) {
    event.preventDefault();
  }

  const input =
    document.getElementById(
      "admin-password-input"
    ).value.trim();

  const errorMsg =
    document.getElementById(
      "admin-auth-error"
    );


  if (
    input.toLowerCase() ===
    state.SENHA_ADMIN.toLowerCase()
  ) {

    document.getElementById(
      "admin-auth-overlay"
    ).style.display = "none";

    document.getElementById(
      "admin-menu-overlay"
    ).style.display = "flex";

    errorMsg.style.display =
      "none";

  } else {

    errorMsg.style.display =
      "block";
  }

}


export function abrirAuthAdmin() {

  document.getElementById(
    "admin-password-input"
  ).value = "";

  document.getElementById(
    "admin-auth-error"
  ).style.display = "none";

  document.getElementById(
    "admin-auth-overlay"
  ).style.display = "flex";

  setTimeout(() => {

    document.getElementById(
      "admin-password-input"
    ).focus();

  }, 50);
}