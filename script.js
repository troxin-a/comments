"use strict";

import { getComments, sendComment, toggleLike, deleteComment, loginUser, registerUser } from "./api.js";
import { commentsInnerHTML, formInnerHTML, appInnerHTML } from "./render.js";

let isLoginProcess = false;
let isRegisterProcess = false;
let token = localStorage.getItem("token");
let userName = localStorage.getItem("userName");

const containerEl = document.getElementById('container');

function renderApp(token) {
    appInnerHTML(isLoginProcess, isRegisterProcess, containerEl, token);

    const loginBtnEl = document.getElementById("login-btn");
    if (loginBtnEl) {
        loginBtnEl.addEventListener("click", () => {
            isLoginProcess = !isLoginProcess;
            renderApp(token);
            const nameEl = document.getElementById('login-input');
            nameEl.focus();
        })
    }

    const loginEl = document.getElementById("login");
    if (loginEl) {
        const errorNameEl = document.getElementById("error-name");
        const errorPassEl = document.getElementById("error-pass");
        const nameEl = document.getElementById('login-input');
        const passEl = document.getElementById('password-input');

        let fields = [
            { "input": nameEl, "err": errorNameEl, "message": "Заполните логин" },
            { "input": passEl, "err": errorPassEl, "message": "Заполните пароль" }
        ];

        loginEl.addEventListener("click", () => {
            if (!formValidate(...fields)) return;

            nameEl.disabled = true;
            passEl.disabled = true;
            loginEl.disabled = true;
            errorNameEl.classList.add('add-form-error__hide');

            loginUser(nameEl.value, passEl.value)
                .then((responseData) => {
                    token = `bearer ${responseData.user.token}`;
                    userName = responseData.user.name;
                    localStorage.setItem("token", token);
                    localStorage.setItem("userName", userName);
                    isLoginProcess = !isLoginProcess;
                    renderApp(token);
                })
                .then(() => {
                    return getComments(token);
                })
                .then((data) => {
                    comments = data;
                    renderComments(document.getElementById('comments'), token);
                })
                .then(() => {
                    if (token) {
                        renderForm(document.getElementById('form'), token, userName);
                    }
                })
                .catch((error) => {
                    errorNameEl.classList.remove('add-form-error__hide');
                    errorNameEl.innerHTML = error.message;
                    nameEl.disabled = false;
                    passEl.disabled = false;
                    loginEl.disabled = false;
                })
        })

        passEl.addEventListener("keypress", (event) => {
            if (event.keyCode === 13) {
                loginEl.click();
            }
        })
    }

    const logoutEl = document.getElementById("logout-btn");
    if (logoutEl) {
        logoutEl.addEventListener("click", () => {
            token = null;
            userName = null;
            localStorage.clear();
            renderApp(token);
            getComments(token)
                .then((data) => {
                    comments = data;
                    renderComments(document.getElementById("comments"), token);
                });
        });
    }

    const toRegisterBtnEl = document.getElementById("to-register-btn");
    if (toRegisterBtnEl) {
        toRegisterBtnEl.addEventListener("click", () => {
            isRegisterProcess = !isRegisterProcess;
            renderApp(token);
            const loginFieldEl = document.getElementById('login-input');
            loginFieldEl.focus();
        });
    }

    const registerBtnEl = document.getElementById("register-btn");
    if (registerBtnEl) {
        const errorLoginEl = document.getElementById("error-login");
        const errorNameEl = document.getElementById("error-name");
        const errorPassEl = document.getElementById("error-pass");
        const loginFieldEl = document.getElementById('login-input');
        const nameFieldEl = document.getElementById('name-input');
        const passFieldEl = document.getElementById('password-input');

        let fields = [
            { "input": loginFieldEl, "err": errorLoginEl, "message": "Заполните логин" },
            { "input": nameFieldEl, "err": errorNameEl, "message": "Заполните имя" },
            { "input": passFieldEl, "err": errorPassEl, "message": "Заполните пароль" }
        ];

        registerBtnEl.addEventListener("click", () => {
            if (!formValidate(...fields)) return;

            loginFieldEl.disabled = true;
            nameFieldEl.disabled = true;
            passFieldEl.disabled = true;
            errorLoginEl.classList.add('add-form-error__hide');

            registerUser(loginFieldEl.value, nameFieldEl.value, passFieldEl.value)
                .then((responseData) => {
                    token = `bearer ${responseData.user.token}`;
                    userName = responseData.user.name;
                    localStorage.setItem("token", token);
                    localStorage.setItem("userName", userName);
                    isRegisterProcess = !isRegisterProcess;
                    renderApp(token);
                })
                .then(() => {
                    return getComments(token);
                })
                .then((data) => {
                    comments = data;
                    renderComments(document.getElementById('comments'), token);
                })
                .then(() => {
                    if (token) {
                        renderForm(document.getElementById('form'), token, userName);
                    }
                })
                .catch((error) => {
                    errorLoginEl.classList.remove('add-form-error__hide');
                    errorLoginEl.innerHTML = error.message;
                    loginFieldEl.disabled = false;
                    nameFieldEl.disabled = false;
                    passFieldEl.disabled = false;
                })
        });

        passFieldEl.addEventListener("keypress", (event) => {
            if (event.keyCode === 13) {
                registerBtnEl.click();
            }
        })
    }
}

renderApp(token);

let addFormEl = document.getElementById('form');
let nameInputEl = document.getElementById('name-input');
let textInputEl = document.getElementById('text-input');
let textErrorEl = document.getElementById('text-error');
let nameErrorEl = document.getElementById('name-error');
let sendButtonEl = document.getElementById('send-button');
let commentsEl = document.getElementById('comments');

let isLoadComment = false;
let comments = [];
let userNameInput = "";
let userTextInput = "";

let fields = [
    { "input": nameInputEl, "err": nameErrorEl, "message": "Заполните имя" },
    { "input": textInputEl, "err": textErrorEl, "message": "Напишите текст" }
];

// Экранирование текста
const textScreen = (text) => {
    let newText = text
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll("[quote]", `<div class="quote">`)
        .replaceAll("[/quote]", `</div>`)
        .trim();

    // Чистит от лишних переносов
    while (newText.includes("\n\n")) {
        newText = newText.replace("\n\n", "\n");
    }

    return newText;
};

// Валидация на пустые строки. Принимает список объектов вида:
// [ { "input": поле ввода, "err": div с ошибкой, "message": текст ошибки }, ...]
function formValidate(...fields) {
    let is_valid = true;

    for (const i in fields) {
        if (fields[i]["input"].value === "") {
            fields[i]["err"].classList.remove('add-form-error__hide');
            fields[i]["err"].textContent = fields[i]["message"];
            is_valid = false;
        }
        else {
            fields[i]["err"].classList.add('add-form-error__hide');
        };
    };

    return is_valid;
};

// Отключает кнопку Написать если хоть одно переданное поле пустое
function disableButton(button, ...fields) {
    // Если хотя бы одно поле пустое, отключаем кнопку
    const isInvalid = fields.some((field) => field.input.value.trim() === "");
    if (isInvalid) {
        button.disabled = true;
    } else {
        button.disabled = false;
    };
};

// Кнопки лайк
const likeEventListeners = (token) => {
    const commentsEl = document.getElementById("comments");
    const likeButtonElemets = document.querySelectorAll(".like-button");

    // События click для всех кнопок лайк
    for (const btn of likeButtonElemets) {
        btn.addEventListener('click', (event) => {
            event.stopPropagation();

            const index = comments.findIndex(item => item.id === btn.dataset.id);
            comments[index].isLikeLoading = true;
            renderComments(commentsEl, token);

            toggleLike(token, btn.dataset.id)
                .then((responseData) => {
                    comments[index].likes = responseData.result["likes"];
                    comments[index].is_liked = responseData.result["isLiked"];
                    comments[index].isLikeLoading = false;
                    renderComments(commentsEl, token);
                })
                .catch((error) => {
                    alert(error.message);
                    comments[index].isLikeLoading = false;
                    renderComments(commentsEl, token);
                });
        });
    };
};

// Кнопки удалить комментарий
const deleteEventListeners = (token) => {
    const commentsEl = document.getElementById("comments");
    const deleteButtonElemets = document.querySelectorAll(".delete-button");

    // События click для всех кнопок лайк
    for (const btn of deleteButtonElemets) {
        btn.addEventListener('click', (event) => {
            event.stopPropagation();

            btn.textContent = "Удаление...";
            btn.disabled = true;

            deleteComment(token, btn.dataset.id)
                .then(() => {
                    getComments(token)
                        .then((data) => {
                            comments = data;
                            renderComments(commentsEl, token);
                        });
                })
                .catch((error) => {
                    alert(error.message);
                    btn.textContent = "Удалить";
                    btn.disabled = false;
                });
        });
    };
};

// Карты коментария
const commentEventListeners = () => {
    const commentElements = document.querySelectorAll(".comment");

    // События click для всех комментариев (цитируем в новый коммент)
    for (const comment of commentElements) {
        comment.addEventListener('click', function (event) {
            const index = comments.findIndex(item => item.id === comment.dataset.id)
            const quoteText = comments[index]["text"];
            const quoteName = comments[index]["name"];
            const text = `[quote]${quoteName}:\n${quoteText}\n[/quote]\n\n`
                .replaceAll(`<div class="quote">`, `[quote]`)
                .replaceAll(`</div>`, `[/quote]`);
            textInputEl.value = text;
            textInputEl.focus();
        });
    };
};

const renderComments = (commentsEl, token) => {
    commentsInnerHTML(comments, commentsEl, token);
    if (token) {
        likeEventListeners(token);
        deleteEventListeners(token);
        commentEventListeners();
    }
}


// Рендер формы и добавление обработчиков для ее элементов
const renderForm = (addFormEl, token, userName) => {

    formInnerHTML(isLoadComment, addFormEl, userNameInput, userTextInput);

    if (!isLoadComment) {
        nameInputEl = document.getElementById('name-input');
        textInputEl = document.getElementById('text-input');
        textErrorEl = document.getElementById('text-error');
        sendButtonEl = document.getElementById('send-button');

        fields = [
            { "input": textInputEl, "err": textErrorEl, "message": "Напишите текст" }
        ];

        nameInputEl.value = userName;
        nameInputEl.disabled = true;
        textInputEl.addEventListener('input', () => disableButton(sendButtonEl, ...fields));

        textInputEl.addEventListener('keyup', (event) => {
            if (event.keyCode === 13 && event.ctrlKey) {
                sendButtonEl.click();
            }
        });

        // Обработка события Click для кнопки отправки нового комментария
        sendButtonEl.addEventListener('click', () => {
            if (!formValidate(...fields)) return;

            isLoadComment = true;
            renderForm(addFormEl, token, userName);

            userTextInput = textScreen(textInputEl.value);

            sendComment(token, userNameInput, userTextInput)
                .then(() => {
                    return getComments(token);
                })
                .then((data) => {
                    comments = data;
                    return renderComments(document.getElementById("comments"), token);
                })
                .then(() => {
                    isLoadComment = false;
                    userTextInput = "";
                    renderForm(addFormEl, token, userName);
                })
                .catch((error) => {
                    if (error.message === "Ошибка сервера") {
                        sendButtonEl.click();
                    }
                    if (error.message === "Ошибка авторизации") {
                        alert("Вы не авторзованы")
                    } else {
                        alert(error.message);
                        isLoadComment = false;
                        renderForm(addFormEl, token, userName);
                    }
                })
        });
    };
};

getComments(token)
    .then((data) => {
        comments = data;
        renderComments(commentsEl, token);
    })
    .then(() => {
        if (token) {
            renderForm(addFormEl, token, userName);
        }
    })