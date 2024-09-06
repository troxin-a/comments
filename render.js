// Рендерит комментарии
export const commentsInnerHTML = (array, element) => {
    element.innerHTML = array
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
}

export const formInnerHTML = (isLoad, element, userNameInput, userTextInput) => {
    if (isLoad) {
        element.innerHTML = `<img src="loader.gif" alt="загрузка">`;
    } else {
        element.innerHTML = `<div class="add-form">
  <div class="add-form-error add-form-error__hide" id="name-error"></div>
  <input type="text" class="add-form-name" placeholder="Введите ваше имя" id="name-input" value="${userNameInput}"/>
  <div class="add-form-error add-form-error__hide" id="text-error"></div>
  <textarea type="textarea" class="add-form-text" placeholder="Введите ваш коментарий" rows="4"
  id="text-input">${userTextInput}</textarea>
  <div class="add-form-row">
    <button disabled class="add-form-button" id="send-button">Написать</button>
  </div>
</div>`;
    }
}