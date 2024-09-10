// Экранирование текста перед выводом
const textScreenFromBase = (text) => {
  let newText = text
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll("[quote]", `<div class="quote">`)
      .replaceAll("[/quote]", `</div>`)
      .trim()

  // Чистит от лишних переносов
  while (newText.includes("\n\n")) {
      newText = newText.replace("\n\n", "\n")
  }

  return newText
}

// Рендерит комментарии
export const commentsInnerHTML = (array, element, token) => {
    element.innerHTML = array
        .map((comment) => {
            let activeLike = comment.is_liked ? " -active-like" : ""
            comment.isLikeLoading ? (activeLike += " -loading-like") : activeLike

            return `<li class="comment" data-id="${comment.id}">
            <div class="comment-header">
              <div>${textScreenFromBase(comment.name)}</div>
              <div>${comment.date}</div>
            </div>
            <div class="comment-body">
              <div class="comment-text">
                ${textScreenFromBase(comment.text)}
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
        .join("")
}

export const formInnerHTML = (isLoad, element, userNameInput, userTextInput) => {
    if (isLoad) {
        element.innerHTML = `<img src="./src/img/loader.gif" alt="загрузка">`
    } else {
        element.innerHTML = `<div class="add-form">
  <input type="text" class="add-form-name" placeholder="Введите ваше имя" id="name-input" value="${textScreenFromBase(userNameInput)}"/>
  <div class="add-form-error add-form-error__hide" id="text-error"></div>
  <textarea type="textarea" class="add-form-text" placeholder="Введите ваш коментарий" rows="4"
  id="text-input">${userTextInput}</textarea>
  <div class="add-form-row">
    <button disabled class="add-form-button" id="send-button">Написать</button>
  </div>  
</div>
`
    }
}

// Рендерит все приложение
export const appInnerHTML = (isLoginProcess, isRegisterProcess, containerEl, token) => {
    let html = ""

    if (isLoginProcess) {
        html = `
      <div id="form">
        <div class="add-form">
          <div class="add-form-error add-form-error__hide" id="error-name"></div>
          <input type="text" class="add-form-name-login" placeholder="Введите логин" id="login-input"/>
          <div class="add-form-error add-form-error__hide" id="error-pass"></div>
          <input type="password" class="add-form-name-login" placeholder="Введите пароль" id="password-input"/>
          <div class="add-form-row-login">
            <button class="add-form-button" id="login">Вход</button>
          </div>
        </div>
      </div>`
    } else if (isRegisterProcess) {
        html = `
    <div id="form">
      <div class="add-form">
        <div class="add-form-error add-form-error__hide" id="error-login"></div>
        <input type="text" class="add-form-name-login" placeholder="Введите логин" id="login-input"/>
        <div class="add-form-error add-form-error__hide" id="error-name"></div>
        <input type="text" class="add-form-name-login" placeholder="Введите имя" id="name-input"/>
        <div class="add-form-error add-form-error__hide" id="error-pass"></div>
        <input type="password" class="add-form-name-login" placeholder="Введите пароль" id="password-input"/>
        <div class="add-form-row-login">
          <button class="add-form-button" id="register-btn">Зарегистрироваться</button>
        </div>
      </div>
    </div>`
    } else {
        html = `
            <ul class="comments" id="comments">
              <img src="./src/img/loader.gif" alt="загрузка">
            </ul>
            <div id="form"></div>
            <div class="add-form-row-login">
            ${
                !token
                    ? `
              <button class="add-form-button" id="login-btn">Войти</button>
              <button class="add-form-button" id="to-register-btn">Регистрация</button>`
                    : `<button class="add-form-button" id="logout-btn">Выход</button>`
            }
            </div>
      `
    }

    containerEl.innerHTML = html
}
