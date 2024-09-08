import { format } from "date-fns"

// Получает данные с API, преобразует в нужный формат.
// Возвращает промис, по завершению которого на выходе получится массив комментариев
const getComments = (token) => {
    const optionsDate = [
        "ru-RU",
        { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" },
    ]

    return fetch("https://wedev-api.sky.pro/api/v2/anton-pashinov1/comments", {
        method: "GET",
        headers: {
            Authorization: token,
        },
    })
        .then((response) => {
            return response.json()
        })
        .then((responseData) => {
            return responseData.comments.map((item) => {
                item["name"] = item["author"]["name"]
                // item["date"] = new Date(Date.parse(item["date"])).toLocaleDateString(...optionsDate);
                item["date"] = format(new Date(item["date"]), "yyyy-MM-dd hh.mm.ss")
                item["is_liked"] = item["isLiked"]
                item["editing"] = false
                item["isLikeLoading"] = false
                delete item["author"]
                delete item["isLiked"]

                return item
            })
        })
}

// Отправляет комментарий на API
const sendComment = (token, name, text) => {
    return fetch("https://wedev-api.sky.pro/api/v2/anton-pashinov1/comments", {
        method: "POST",
        body: JSON.stringify({
            text: text,
            name: name,
            forceError: false,
        }),
        headers: {
            Authorization: token,
        },
    }).then((response) => {
        if (response.status === 400) {
            throw new Error("Текст должен быть не короче трех символов")
        }
        if (response.status === 500) {
            throw new Error("Ошибка сервера")
        }
        if (response.status === 401) {
            throw new Error("Ошибка авторизации")
        }
    })
}

// Переключает лайк
const toggleLike = (token, id) => {
    return fetch(`https://wedev-api.sky.pro/api/v2/anton-pashinov1/comments/${id}/toggle-like`, {
        method: "POST",
        body: JSON.stringify({
            forceError: false,
        }),
        headers: {
            Authorization: token,
        },
    }).then((response) => {
        if (response.status === 401) {
            throw new Error("Ошибка авторизации")
        }
        return response.json()
    })
}

// Удаляет комментарий
const deleteComment = (token, id) => {
    return fetch(`https://wedev-api.sky.pro/api/v2/anton-pashinov1/comments/${id}`, {
        method: "DELETE",
        body: JSON.stringify({
            forceError: false,
        }),
        headers: {
            Authorization: token,
        },
    }).then((response) => {
        if (response.status === 401) {
            throw new Error("Ошибка авторизации")
        }
        return response.json()
    })
}

// Авторизация
const loginUser = (name, password) => {
    return fetch(`https://wedev-api.sky.pro/api/user/login`, {
        method: "POST",
        body: JSON.stringify({
            login: name,
            password: password,
            forceError: false,
        }),
    }).then((response) => {
        if (response.status === 400) {
            throw new Error("Неверный логин или пароль")
        }
        return response.json()
    })
}

// Регистрация
const registerUser = (login, name, password) => {
    return fetch(`https://wedev-api.sky.pro/api/user`, {
        method: "POST",
        body: JSON.stringify({
            login: login,
            name: name,
            password: password,
            forceError: false,
        }),
    }).then((response) => {
        if (response.status === 400) {
            throw new Error("Пользователь с таким логином уже существует")
        }
        return response.json()
    })
}

export { getComments, sendComment, toggleLike, deleteComment, loginUser, registerUser }
