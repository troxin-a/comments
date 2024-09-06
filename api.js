// Получает данные с API, преобразует в нужный формат.
// Возвращает промис, по завершению которого на выходе получится массив комментариев
const getComments = (token) => {
    const optionsDate = ["ru-RU", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" }];

    return fetch("https://wedev-api.sky.pro/api/v2/anton-pashinov1/comments", {
        method: "GET",
        headers: {
            Authorization: token,
        }
    })
        .then((response) => {
            return response.json();
        })
        .then((responseData) => {
            return responseData.comments.map((item) => {
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

// Отправляет комментарий на API
const sendComment = (token, name, text) => {
    return fetch("https://wedev-api.sky.pro/api/v2/anton-pashinov1/comments",
        {
            method: "POST",
            body: JSON.stringify({
                text: text,
                name: name,
                forceError: false,
            }),
            headers: {
                Authorization: token,
            }
        })
        .then((response) => {
            if (response.status === 400) {
                throw new Error("Текст должен быть не короче трех символов");
            };
            if (response.status === 500) {
                throw new Error("Ошибка сервера");
            };
        })
}


// Переключает лайк
const toggleLike = (token, id) => {
    return fetch(`https://wedev-api.sky.pro/api/v2/anton-pashinov1/comments/${id}/toggle-like`,
        {
            method: "POST",
            body: JSON.stringify({
                forceError: false,
            }),
            headers: {
                Authorization: token,
            }
        })
        .then((response) => {
            return response.json()
            // if (response.status === 400) {
            //     throw new Error("Текст должен быть не короче трех символов");
            // };
            // if (response.status === 500) {
            //     throw new Error("Ошибка сервера");
            // };
        })
}

// Удаляет комментарий
const deleteComment = (token, id) => {
    return fetch(`https://wedev-api.sky.pro/api/v2/anton-pashinov1/comments/${id}`,
        {
            method: "DELETE",
            body: JSON.stringify({
                forceError: false,
            }),
            headers: {
                Authorization: token,
            }
        })
        .then((response) => {            
            return response.json()
        })
}


export { getComments, sendComment, toggleLike, deleteComment }