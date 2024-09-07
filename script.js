"use strict";

import { getComments, sendComment, toggleLike, deleteComment, loginUser } from "./api.js";
import { commentsInnerHTML, formInnerHTML, appInnerHTML } from "./render.js";

let isLoginProcess = false;
let token = "bearer asb4c4boc86gasb4c4boc86g37w3cc3bo3b83k4g37k3bk3cg3c03ck4k";
token = null;

const containerEl = document.getElementById('container');

function renderApp(token) {
    appInnerHTML(isLoginProcess, containerEl, token);

    const loginBtnEl = document.getElementById("login-btn");
    if (loginBtnEl) {
        loginBtnEl.addEventListener("click", () => {
            isLoginProcess = !isLoginProcess;
            // appInnerHTML(isLoginProcess, containerEl, token);
            renderApp(token)
        })
    }

    const loginEl = document.getElementById("login");
    if (loginEl) {
        const nameEl = document.getElementById('login-input');
        const passEl = document.getElementById('password-input');

        loginEl.addEventListener("click", () => {
            loginUser(nameEl.value, passEl.value)
                .then((responseData) => {
                    token = `bearer ${responseData.user.token}`;
                    isLoginProcess = !isLoginProcess;
                    renderApp(token);
                })
                .then(() => {
                    return getComments(token)
                })
                .then((data) => {
                    comments = data;
                    renderComments(document.getElementById('comments'), token);
                })
                .then(() => {
                    if (token) {
                        renderForm(document.getElementById('form'), token);
                    }
                })
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
                .catch(() => {
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

            const index = comments.findIndex(item => item.id === btn.dataset.id);

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
                .catch(() => {
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
const renderForm = (addFormEl, token) => {

    formInnerHTML(isLoadComment, addFormEl, userNameInput, userTextInput);

    if (!isLoadComment) {
        nameInputEl = document.getElementById('name-input');
        textInputEl = document.getElementById('text-input');
        textErrorEl = document.getElementById('text-error');
        nameErrorEl = document.getElementById('name-error');
        sendButtonEl = document.getElementById('send-button');

        fields = [
            { "input": nameInputEl, "err": nameErrorEl, "message": "Заполните имя" },
            { "input": textInputEl, "err": textErrorEl, "message": "Напишите текст" }
        ];

        nameInputEl.addEventListener('input', () => disableButton(sendButtonEl, ...fields));
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
            renderForm(addFormEl, token);

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
                    renderForm(addFormEl, token);
                })
                .catch((error) => {
                    if (error.message === "Ошибка сервера") {
                        sendButtonEl.click();
                    } else {
                        alert(error.message);
                        isLoadComment = false;
                        renderForm(addFormEl, token);
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
            renderForm(addFormEl, token);
        }
    })