"use strict";
let nameInputEl = document.getElementById('name-input');
let textInputEl = document.getElementById('text-input');
let textErrorEl = document.getElementById('text-error');
let nameErrorEl = document.getElementById('name-error');
let sendButtonEl = document.getElementById('send-button');
const commentsEl = document.getElementById('comments');
const addFormEl = document.getElementById('form');
const deleteButtonEl = document.getElementById('delete-button');
const optionsDate = ["ru-RU", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" }];

let isLoadComment = false;
let comments = [];

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
        button.setAttribute("disabled", "");
    } else {
        button.removeAttribute("disabled");
    };
};

// Удаление последнего комментария
deleteButtonEl.addEventListener("click", () => {
    comments.pop();
    console.log(comments);
    renderComments();
});

// Получает данные с API, преобразует в нужный формат
const getComments = () => {
    return fetch("https://wedev-api.sky.pro/api/v1/anton-pashinoffv/comments", { method: "GET" })
        .then((response) => {
            return response.json();
        })
        .then((responseData) => {
            comments = responseData.comments.map((item) => {
                item["name"] = item["author"]["name"];
                item["date"] = new Date(Date.parse(item["date"])).toLocaleDateString(...optionsDate);
                item["is_liked"] = item["isLiked"];
                item["editing"] = false;
                item["isLikeLoading"] = false;
                delete item["author"];
                delete item["isLiked"];

                return item;
            });
        });
};

const renderForm = () => {
    if (isLoadComment) {
        addFormEl.innerHTML = `<img src="loader.gif" alt="загрузка">`;
    } else {
        addFormEl.innerHTML = `<div class="add-form">
  <div class="add-form-error add-form-error__hide" id="name-error"></div>
  <input type="text" class="add-form-name" placeholder="Введите ваше имя" id="name-input" />
  <div class="add-form-error add-form-error__hide" id="text-error"></div>
  <textarea type="textarea" class="add-form-text" placeholder="Введите ваш коментарий" rows="4"
  id="text-input"></textarea>
  <div class="add-form-row">
    <button disabled class="add-form-button" id="send-button">Написать</button>
  </div>
</div>`;
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

            const date = new Date().toLocaleString(...optionsDate);
            const name = nameInputEl.value
                .replaceAll("&", "&amp;")
                .replaceAll("<", "&lt;")
                .replaceAll(">", "&gt;");
            let text = textScreen(textInputEl.value);

            fetch("https://wedev-api.sky.pro/api/v1/anton-pashinoffv/comments",
                {
                    method: "POST",
                    body: JSON.stringify({
                        text: text,
                        name: name,
                    }),
                })
                .then(() => {
                    isLoadComment = false;
                    return getComments();
                })
                .then(() => {
                    return renderComments();
                })
                .then(() => {
                    renderForm();
                    sendButtonEl.setAttribute("disabled", "");
                })
        });
    };
};

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

// Рендерит комментарии
const renderComments = () => {
    const commentsHtml = comments
        .map((comment) => {
            let activeLike = comment.is_liked ? " -active-like" : "";            
            comment.isLikeLoading ? activeLike += " -loading-like" : activeLike;

            let commentBody = comment.text;
            let button = `<button class="edit-button" data-id="${comment.id}">Редактировать</button>`;

            if (comment["editing"]) {
                const commentTextScreen = commentBody
                    .replaceAll(`<div class="quote">`, `[quote]`)
                    .replaceAll(`</div>`, `[/quote]`);
                commentBody =
                    `<div class="add-form-error add-form-error__hide" id="text-error-${comment.id}"></div>
            <textarea type="textarea" class="add-form-text edit-field" placeholder="Введите ваш коментарий" rows="4"
          id="text-input-${comment.id}">${commentTextScreen}</textarea>`;
                button = `<button class="edit-button save-button" data-id="${comment.id}">Сохранить</button>`;
            };

            return `<li class="comment" data-id="${comment.id}">
            <div class="comment-header">
              <div>${comment.name}</div>
              <div>${comment.date}</div>
            </div>
            <div class="comment-body">
              <div class="comment-text">
                ${commentBody}
              </div>       
            </div>
            <div class="comment-footer">
              <div class="likes">
                <span class="likes-counter">${comment.likes}</span>
                <button class="like-button${activeLike}" data-id="${comment.id}"></button>
              </div>
            </div>
            ${button}
          </li>`
        })
        .join("");
    commentsEl.innerHTML = commentsHtml;

    likeEventListeners();
    editFieldEventListener();
    editBtnEventListeners();
    commentEventListeners();
}


getComments()
    .then(() => {
        renderComments();        
    })
    .then(() => {
        renderForm();
    })