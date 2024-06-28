let username = prompt("Seu lindo nome: ");
const ID = "a44902e5-f0cd-4290-bc24-94d8685aa299";

const urlParticipantes = `https://mock-api.driven.com.br/api/v6/uol/participants/${ID}`;
const urlStatus = `https://mock-api.driven.com.br/api/v6/uol/status/${ID}`;
const urlMensagens = `https://mock-api.driven.com.br/api/v6/uol/messages/${ID}`;

let destinatario = "Todos"; 
let tipo = "message"; // message, status, private_message

function abrirMenu() {
    const menu = document.getElementById("menuLateral");
    const overlay = document.getElementById("overlay");

    menu.classList.remove("escondido");
    menu.classList.add("aberto");
    overlay.classList.remove("escondido");
    overlay.classList.add("visivel");
}

function fecharMenu() {
    const menu = document.getElementById("menuLateral");
    const overlay = document.getElementById("overlay");

    menu.classList.remove("aberto");
    menu.classList.add("escondido");
    overlay.classList.remove("visivel");
    overlay.classList.add("escondido");
}

function entrarNaSala(username) {
    const url = `https://mock-api.driven.com.br/api/v6/uol/participants/${ID}`;
    const novoUsuario = { name: username };

    axios.post(url, novoUsuario)
        .then(response => {
            console.log('Entrou na sala com sucesso!', response);
        })
        .catch(error => {
            if (error.response && error.response.status === 400) {
                console.log('Nome já em uso, escolha outro nome.');
                pedirNovoNome();
            } else {
                console.error('Erro ao tentar entrar na sala:', error);
            }
        });
}

function pedirNovoNome() {
    const novoNome = prompt("Nome já em uso. Por favor, escolha outro nome:");
    if (novoNome) {
        username = novoNome;
        entrarNaSala(novoNome);
    }
}
entrarNaSala(username);

function verificarStatusConexao() {
    const data = { name: username };

    axios.post(urlStatus, data)
        .then(response => {
            console.log('Status online enviado com sucesso!', response);
        })
        .catch(error => {
            console.log('Erro ao enviar status online', 'desconectando usuário...', error);
            alert("Conexão perdida. Por favor, entre novamente.");
            window.location.reload();
        });
}
setInterval(verificarStatusConexao, 5000);

function formatarHora() {
    const agora = new Date();
    const horas = agora.getHours().toString().padStart(2, "0");
    const minutos = agora.getMinutes().toString().padStart(2, "0");
    const segundos = agora.getSeconds().toString().padStart(2, "0");
    return `${horas}:${minutos}:${segundos}`;
}

function enviarMensagem() {
    const input = document.querySelector(".enviar-mensagem");
    const msg = input.value;

    const novaMensagem = {
        from: username,
        to: destinatario,
        text: msg,
        type: tipo
    };

    axios.post(urlMensagens, novaMensagem)
        .then(response => {
            console.log("Mensagem enviada com sucesso!", response);
            renderizarMensagem(novaMensagem.from, novaMensagem.to, novaMensagem.text, novaMensagem.type, formatarHora());
        })
        .catch(error => {
            console.log("Erro ao enviar mensagem:", error);
        });


    input.value = "";
}

function renderizarMensagem(from, to, text, type, time) {
    const ul = document.querySelector(".mensagem");
    const li = document.createElement("li");

    if (type === "status") {
        li.style.backgroundColor = "rgba(220, 220, 220, 1)";
        li.textContent = `${from} ${text}`;
    } else if (type === "private_message") {
        if ((from === username && to === destinatario) || (from === destinatario && to === username)) {
            li.style.backgroundColor = "rgba(255, 222, 222, 1)";
            li.textContent = `(${time}) ${from} reservadamente para ${to}: ${text}`;
        } else {
            return; // Não renderiza a mensagem se não for para o remetente ou destinatário
        }
    } else {
        li.style.backgroundColor = "rgba(255, 255, 255, 1)";
        li.textContent = `(${time}) ${from} para ${to}: ${text}`;
    }

    ul.appendChild(li);
    const elementosQueQueroQueApareca = document.querySelectorAll('li');
    elementosQueQueroQueApareca.forEach(elemento => {
    elemento.scrollIntoView();
});
}

document.querySelector(".icon-aviao").addEventListener("click", enviarMensagem);

function buscarMensagensAnteriores() {
    axios.get(urlMensagens)
        .then(response => {
            console.log("Mensagens anteriores carregadas com sucesso!", response);
            const mensagens = response.data;
            mensagens.forEach(mensagem => {
                renderizarMensagem(mensagem.from, mensagem.to, mensagem.text, mensagem.type, mensagem.time);
            });
        })
        .catch(error => {
            console.log("Erro ao carregar mensagens anteriores:", error);
        });
}

function buscarParticipantes() {
    const listaUsers = document.querySelector(".lista-usuarios");

    axios.get(urlParticipantes)
        .then(response => {
            console.log("Lista de usuários adquirida com sucesso!", response);
            const participantes = response.data;
            
            listaUsers.innerHTML = `<li class="usuario-item" id="opcaoTodos" onclick="marcarUsuario(this)">
                <ion-icon name="people"></ion-icon>
                Todos
                <ion-icon name="checkmark-sharp" class="check escondido"></ion-icon>
            </li>`;

            participantes.forEach(participante => {
                const li = document.createElement("li");
                li.classList.add("usuario-item");
                li.innerHTML = `
                    <ion-icon name="person-circle-sharp"></ion-icon>
                    ${participante.name}
                    <ion-icon name="checkmark-sharp" class="check escondido"></ion-icon>
                `;
                li.addEventListener('click', function() {
                    marcarUsuario(this);
                });
                listaUsers.appendChild(li);
            });
        })
        .catch(error => {
            console.log("Erro ao adquirir lista de participantes:", error);
        });
}
buscarParticipantes();
setInterval(buscarParticipantes, 10000);

function marcarOpcao(idElementoClicado) {
    const elementosOpcoes = document.querySelectorAll('.span-publico, .span-priv');
    elementosOpcoes.forEach(elemento => {
        const checkIcon = elemento.querySelector('.check');
        if (elemento.id === idElementoClicado) {
            checkIcon.classList.remove('escondido');
            tipo = idElementoClicado === "opcaoPrivado" ? "private_message" : "message";
        } else {
            checkIcon.classList.add('escondido');
        }
    });
}

function marcarUsuario(elementoClicado) {
    const usuarios = document.querySelectorAll('.usuario-item');
    usuarios.forEach(usuario => {
        const checkIcon = usuario.querySelector('.check');
        if (usuario === elementoClicado) {
            checkIcon.classList.remove('escondido');
            destinatario = usuario.textContent.trim();
        } else {
            checkIcon.classList.add('escondido');
        }
    });
}

const listaUsuarios = document.querySelector('.lista-usuarios');

// Adicionar usuário na lista
function adicionarUsuario(nomeUsuario) {
    const li = document.createElement('li');
    li.classList.add('usuario-item');
    li.innerHTML = `
        <ion-icon name="person-circle-sharp"></ion-icon>
        ${nomeUsuario}
        <ion-icon name="checkmark-sharp" class="check escondido"></ion-icon>
    `;
    li.addEventListener('click', function() {
        marcarUsuario(this);
    });
    listaUsuarios.appendChild(li);
}
buscarMensagensAnteriores();
setInterval(buscarMensagensAnteriores, 3000);
