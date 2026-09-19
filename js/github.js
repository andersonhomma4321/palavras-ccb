import { CONFIG } from "./config.js";


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


export function base64ToUtf8(base64) {

  return decodeURIComponent(
    Array.prototype.map.call(
      atob(
        base64.replace(/\s/g, "")
      ),
      function(c) {

        return "%" +
          ("00" +
            c.charCodeAt(0)
              .toString(16)
          ).slice(-2);

      }
    ).join("")
  );

}


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
    await fetch(apiUrl, {

      headers: {

        "Authorization":
          `Bearer ${token}`,

        "Accept":
          "application/vnd.github.v3+json"

      }

    });


  if (!resGet.ok) {

    if (resGet.status === 401) {

      throw new Error(
        "Token do GitHub inválido."
      );

    }

    if (resGet.status === 404) {

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
    await fetch(apiUrl, {

      method: "PUT",

      headers: {

        "Authorization":
          `Bearer ${token}`,

        "Accept":
          "application/vnd.github.v3+json",

        "Content-Type":
          "application/json"

      },

      body: JSON.stringify({

        message: mensagemCommit,

        content: contentEncoded,

        sha: fileData.sha

      })

    });


  if (!resPut.ok) {

    const errData =
      await resPut.json();


    throw new Error(
      errData.message ||
      "Erro ao salvar no GitHub."
    );

  }

}