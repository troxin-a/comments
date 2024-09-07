import { loginUser } from "./api.js";

// Рендерит комментарии
export const commentsInnerHTML = (array, element, token) => {
  
  element.innerHTML = array
    .map((comment) => {
      let activeLike = comment.is_liked ? " -active-like" : "";
      comment.isLikeLoading ? activeLike += " -loading-like" : activeLike;

      let commentBody = comment.text;

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
            ${token ? `<button class="delete-button" id="delete-button" data-id="${comment.id}">Удалить</button>` : ""}
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

// Рендерит все приложение
export const appInnerHTML = (isLoginProcess, containerEl, token) => {
  let html = ""

  if (!isLoginProcess) {
    html = `
      <ul class="comments" id="comments">
        <img src="loader.gif" alt="загрузка">
      </ul>
      <div id="form">
      ${!token ? `<button class="add-form-button" id="login-btn">Войти</button>` : ""}
      `;
  } else {
    html = `
      <div id="form">
        <div class="add-form">
          <input type="text" class="add-form-name-login" placeholder="Введите логин" id="login-input"/>
          <input type="password" class="add-form-name-login" placeholder="Введите пароль" id="password-input"/>
          <div class="add-form-row-login">
            <button class="add-form-button" id="login">Войти</button>
          </div>
        </div>
      </div>`;
  }

  containerEl.innerHTML = html;

}