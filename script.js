"use strict";

import { getComments, sendComment } from "./api.js";
import { commentsInnerHTML, formInnerHTML } from "./render.js";

let nameInputEl = document.getElementById('name-input');
let textInputEl = document.getElementById('text-input');
let textErrorEl = document.getElementById('text-error');
let nameErrorEl = document.getElementById('name-error');
let sendButtonEl = document.getElementById('send-button');
const commentsEl = document.getElementById('comments');
const addFormEl = document.getElementById('form');
const deleteButtonEl = document.getElementById('delete-button');

let isLoadComment = false;
let comments = [];
let userNameInput = "";
let userTextInput = "";

let fields = [
    { "input": nameInputEl, "err": nameErrorEl, "message": "Заполните имя" },
    { "input": textInputEl, "err": textErrorEl, "message": "Напишите текст" }
];


// Функция для имитации запросов в API
function delay(interval = 300) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, interval);
    });
}

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

// Удаление последнего комментария
deleteButtonEl.addEventListener("click", () => {
    comments.pop();
    // renderComments();
});

// Кнопки лайк
const likeEventListeners = () => {
    const likeButtonElemets = document.querySelectorAll(".like-button");

    // События click для всех кнопок лайк
    for (const btn of likeButtonElemets) {
        btn.addEventListener('click', (event) => {
            event.stopPropagation();
            const index = comments.findIndex(item => item.id === Number(btn.dataset.id));

            comments[index].isLikeLoading = true;
            renderComments();

            delay(2000).then(() => {
                comments[index].likes = comments[index].is_liked
                    ? comments[index].likes - 1
                    : comments[index].likes + 1;
                comments[index].is_liked = !comments[index].is_liked;
                comments[index].isLikeLoading = false;
                renderComments();
            });
        });
    };
};

// Поле ввода редактирования комментария
const editFieldEventListener = () => {
    const editFieldEl = document.querySelector(".edit-field");
    const saveButtonEl = document.querySelector(".save-button");

    if (!editFieldEl) {
        return;
    };

    editFieldEl.addEventListener('click', (event) => {
        event.stopPropagation();
    });

    editFieldEl.addEventListener('keyup', (event) => {
        if (event.keyCode === 13 && event.ctrlKey) {
            saveButtonEl.click();
        }
    });
};

// Кнопка редактировать/сохранить комментарий
const editBtnEventListeners = () => {
    const editButtonElemets = document.querySelectorAll(".edit-button");

    for (const btn of editButtonElemets) {
        btn.addEventListener('click', (event) => {
            event.stopPropagation();
            const index = btn.dataset.index;

            // Если идет редактирование
            if (comments[index]["editing"]) {
                const textInputIndex = document.getElementById(`text-input-${index}`);
                const textErrorElIndex = document.getElementById(`text-error-${index}`);
                const field = [{ "input": textInputIndex, "err": textErrorElIndex, "message": "Заполните текст" }]

                // Проверка на пустую строку
                if (!formValidate(...field)) return;

                comments[index]["text"] = textScreen(textInputIndex.value); // чистим строку от лишниъ тегов
                comments[index]["editing"] = false;
            } else { // Если не идет редактирование, включаем редактирование (отключая другие)
                for (const comment of comments) {
                    comment["editing"] = false;
                }
                comments[index]["editing"] = true;
            }

            renderComments();
        });
    };
};

// Карты коментария
const commentEventListeners = () => {
    const commentElements = document.querySelectorAll(".comment");

    // События click для всех комментариев (цитируем в новый коммент)
    for (const comment of commentElements) {
        comment.addEventListener('click', function (event) {
            const index = comments.findIndex(item => item.id === Number(comment.dataset.id))
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

const renderComments = () => {
    commentsInnerHTML(comments, commentsEl);    
    likeEventListeners();
    editFieldEventListener();
    editBtnEventListeners();
    commentEventListeners();
}


// Рендер формы и добавление обработчиков для ее элементов
const renderForm = () => {
    formInnerHTML(isLoadComment, addFormEl, userNameInput, userTextInput)
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
            renderForm();

            userNameInput = nameInputEl.value
                .replaceAll("&", "&amp;")
                .replaceAll("<", "&lt;")
                .replaceAll(">", "&gt;");
            userTextInput = textScreen(textInputEl.value);

            sendComment(userNameInput, userTextInput)
                .then(() => {
                    return getComments();
                })
                .then((data) => {
                    comments = data;
                    return renderComments();
                })
                .then(() => {
                    isLoadComment = false;
                    userNameInput = "";
                    userTextInput = "";
                    renderForm();
                })
                .catch((error) => {
                    if (error.message === "Ошибка сервера") {
                        sendButtonEl.click();
                    } else {
                        alert(error.message);
                        isLoadComment = false;
                        renderForm();
                    }
                })
        });
    };
};


getComments()
    .then((data) => {
        comments = data;
        renderComments();
    })
    .then(() => {
        renderForm();
    })