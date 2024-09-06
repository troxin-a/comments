// Получает данные с API, преобразует в нужный формат.
// Возвращает промис, по завершению которого на выходе получится массив комментариев
const getComments = () => {
    const optionsDate = ["ru-RU", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" }];

    return fetch("https://wedev-api.sky.pro/api/v1/anton-pashinov/comments", { method: "GET" })
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
const sendComment = (name, text) => {
    return fetch("https://wedev-api.sky.pro/api/v1/anton-pashinov/comments",
        {
            method: "POST",
            body: JSON.stringify({
                text: text,
                name: name,
                forceError: true,
            }),
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

export { getComments, sendComment }