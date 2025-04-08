// const messageForm = document.querySelector(".prompt__form");
// const chatHistoryContainer = document.querySelector(".chats");
// const suggestionItems = document.querySelectorAll(".suggests__item");

// const themeToggleButton = document.getElementById("themeToggler");
// const clearChatButton = document.getElementById("deleteButton");

// let currentUserMessage = null;
// let isGeneratingResponse = false;

// const TOGETHER_API_KEY = "2ed5f1d608123953630eb438725d34f2f00c06862d00aba97278251ebf640a75"; // Замени на свой токен от Together AI
// const API_REQUEST_URL = "https://api.together.xyz/v1/chat/completions";
// const MODEL_NAME = "meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8"; // Llama 4 Maverick

// // IndexedDB: Открытие базы данных
// const openDatabase = () => {
//     const request = indexedDB.open("ChatDatabase", 1);

//     request.onupgradeneeded = (event) => {
//         const db = event.target.result;
//         if (!db.objectStoreNames.contains("chats")) {
//             db.createObjectStore("chats", { keyPath: "id", autoIncrement: true });
//         }
//         console.log("База данных создана или обновлена");
//     };

//     request.onsuccess = (event) => {
//         console.log("База данных успешно открыта");
//         loadSavedChatHistory(event.target.result);
//     };

//     request.onerror = (event) => {
//         console.error("Ошибка при открытии базы данных:", event.target.error);
//     };

//     return request;
// };

// // IndexedDB: Сохранение чата
// const saveChatToDatabase = (db, userMessage, apiResponse) => {
//     const transaction = db.transaction("chats", "readwrite");
//     const store = transaction.objectStore("chats");

//     store.add({
//         userMessage,
//         apiResponse,
//         timestamp: new Date().toISOString(),
//     });

//     transaction.oncomplete = () => {
//         console.log("Чат успешно сохранен в IndexedDB");
//     };

//     transaction.onerror = (error) => {
//         console.error("Ошибка при сохранении чата:", error);
//     };
// };

// // IndexedDB: Загрузка истории чатов
// const loadSavedChatHistory = (db) => {
//     const transaction = db.transaction("chats", "readonly");
//     const store = transaction.objectStore("chats");

//     const request = store.getAll();

//     request.onsuccess = () => {
//         const savedConversations = request.result;
//         chatHistoryContainer.innerHTML = '';

//         savedConversations.forEach((conversation) => {
//             const userMessageHtml = `
//                 <div class="message__content">
//                     <img class="message__avatar" src="assets/profile.png" alt="User avatar">
//                     <p class="message__text">${conversation.userMessage}</p>
//                 </div>
//             `;
//             const outgoingMessageElement = createChatMessageElement(userMessageHtml, "message--outgoing");
//             chatHistoryContainer.appendChild(outgoingMessageElement);

//             const responseHtml = `
//                 <div class="message__content">
//                     <img class="message__avatar" src="assets/gemini.svg" alt="Model avatar">
//                     <p class="message__text">${conversation.apiResponse}</p>
//                 </div>
//             `;
//             const incomingMessageElement = createChatMessageElement(responseHtml, "message--incoming");
//             chatHistoryContainer.appendChild(incomingMessageElement);
//         });

//         document.body.classList.toggle("hide-header", savedConversations.length > 0);
//     };

//     request.onerror = () => {
//         console.error("Ошибка при загрузке истории чатов");
//     };
// };

// // Создание элемента сообщения
// const createChatMessageElement = (htmlContent, ...cssClasses) => {
//     const messageElement = document.createElement("div");
//     messageElement.classList.add("message", ...cssClasses);
//     messageElement.innerHTML = htmlContent;
//     return messageElement;
// };

// // Отправка запроса к API
// const requestApiResponse = async (incomingMessageElement, db) => {
//     const messageTextElement = incomingMessageElement.querySelector(".message__text");

//     try {
//         const response = await fetch(API_REQUEST_URL, {
//             method: "POST",
//             headers: {
//                 "Authorization": `Bearer ${TOGETHER_API_KEY}`,
//                 "Content-Type": "application/json"
//             },
//             body: JSON.stringify({
//                 model: MODEL_NAME,
//                 messages: [{ role: "user", content: currentUserMessage }],
//                 max_tokens: 500,
//                 temperature: 0.7
//             }),
//         });

//         const data = await response.json();
//         if (!response.ok) throw new Error(data.error || "API request failed");

//         const responseText = data.choices?.[0]?.message?.content || "No response";

//         messageTextElement.innerText = responseText;
//         saveChatToDatabase(db, currentUserMessage, responseText);
//     } catch (error) {
//         isGeneratingResponse = false;
//         messageTextElement.innerText = error.message;
//         messageTextElement.closest(".message").classList.add("message--error");
//     } finally {
//         incomingMessageElement.classList.remove("message--loading");
//     }
// };

// // Отправка сообщения
// const handleOutgoingMessage = (db) => {
//     currentUserMessage = messageForm.querySelector(".prompt__form-input").value.trim() || currentUserMessage;
//     if (!currentUserMessage || isGeneratingResponse) return;

//     isGeneratingResponse = true;

//     const outgoingMessageHtml = `
//         <div class="message__content">
//             <img class="message__avatar" src="assets/profile.png" alt="User avatar">
//             <p class="message__text"></p>
//         </div>
//     `;
//     const outgoingMessageElement = createChatMessageElement(outgoingMessageHtml, "message--outgoing");
//     outgoingMessageElement.querySelector(".message__text").innerText = currentUserMessage;
//     chatHistoryContainer.appendChild(outgoingMessageElement);

//     messageForm.reset();
//     document.body.classList.add("hide-header");

//     const loadingHtml = `
//         <div class="message__content">
//             <img class="message__avatar" src="assets/gemini.svg" alt="Model avatar">
//             <p class="message__text"></p>
//             <div class="message__loading-indicator">
//                 <div class="message__loading-bar"></div>
//                 <div class="message__loading-bar"></div>
//                 <div class="message__loading-bar"></div>
//             </div>
//         </div>
//     `;
//     const loadingMessageElement = createChatMessageElement(loadingHtml, "message--incoming", "message--loading");
//     chatHistoryContainer.appendChild(loadingMessageElement);

//     requestApiResponse(loadingMessageElement, db);
// };

// // События
// themeToggleButton.addEventListener('click', () => {
//     const isLightTheme = document.body.classList.toggle("light_mode");
//     localStorage.setItem("themeColor", isLightTheme ? "light_mode" : "dark_mode");
//     const newIconClass = isLightTheme ? "bx bx-moon" : "bx bx-sun";
//     themeToggleButton.querySelector("i").className = newIconClass;
// });

// clearChatButton.addEventListener('click', () => {
//     if (confirm("Are you sure you want to delete all chat history?")) {
//         const dbRequest = indexedDB.open("ChatDatabase", 1);
//         dbRequest.onsuccess = (event) => {
//             const db = event.target.result;
//             const transaction = db.transaction("chats", "readwrite");
//             const store = transaction.objectStore("chats");
//             store.clear();
//             console.log("История чатов очищена");
//         };
//         chatHistoryContainer.innerHTML = '';
//     }
// });

// suggestionItems.forEach(suggestion => {
//     suggestion.addEventListener('click', () => {
//         currentUserMessage = suggestion.querySelector(".suggests__item-text").innerText;
//         const dbRequest = indexedDB.open("ChatDatabase", 1);
//         dbRequest.onsuccess = (event) => handleOutgoingMessage(event.target.result);
//     });
// });

// messageForm.addEventListener('submit', (e) => {
//     e.preventDefault();
//     const dbRequest = indexedDB.open("ChatDatabase", 1);
//     dbRequest.onsuccess = (event) => handleOutgoingMessage(event.target.result);
// });

// // Инициализация базы данных
// openDatabase();

// // Register the service worker
// if ("serviceWorker" in navigator) {
//   navigator.serviceWorker
//     .register("./service-worker.js")
//     .then(() => console.log("Service Worker registered successfully"))
//     .catch((error) => console.error("Service Worker registration failed:", error));
// }



/////Version 2

const messageForm = document.querySelector(".prompt__form");
const chatHistoryContainer = document.querySelector(".chats");
const suggestionItems = document.querySelectorAll(".suggests__item");

const themeToggleButton = document.getElementById("themeToggler");
const clearChatButton = document.getElementById("deleteButton");

let currentUserMessage = null;
let isGeneratingResponse = false;

const GEMINI_API_KEY = "AIzaSyAVbf5dGAGn0sMSOo4TYae4giY_9E8TXyM"; // Замени на свой ключ Google Gemini API
const API_REQUEST_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

const openDatabase = () => {
    const request = indexedDB.open("ChatDatabase", 1);

    request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains("chats")) {
            db.createObjectStore("chats", { keyPath: "id", autoIncrement: true });
        }
        console.log("База данных создана или обновлена");
    };

    request.onsuccess = (event) => {
        console.log("База данных успешно открыта");
        loadSavedChatHistory(event.target.result);
    };

    request.onerror = (event) => {
        console.error("Ошибка при открытии базы данных:", event.target.error);
    };

    return request;
};

const saveChatToDatabase = (db, userMessage, apiResponse) => {
    const transaction = db.transaction("chats", "readwrite");
    const store = transaction.objectStore("chats");

    store.add({
        userMessage,
        apiResponse,
        timestamp: new Date().toISOString(),
    });

    transaction.oncomplete = () => {
        console.log("Чат успешно сохранен в IndexedDB");
    };

    transaction.onerror = (error) => {
        console.error("Ошибка при сохранении чата:", error);
    };
};

const loadSavedChatHistory = (db) => {
    const transaction = db.transaction("chats", "readonly");
    const store = transaction.objectStore("chats");

    const request = store.getAll();

    request.onsuccess = () => {
        const savedConversations = request.result;
        chatHistoryContainer.innerHTML = '';

        savedConversations.forEach((conversation) => {
            const userMessageHtml = `
                <div class="message__content">
                    <img class="message__avatar" src="assets/profile.png" alt="User avatar">
                    <p class="message__text">${conversation.userMessage}</p>
                </div>
            `;
            const outgoingMessageElement = createChatMessageElement(userMessageHtml, "message--outgoing");
            chatHistoryContainer.appendChild(outgoingMessageElement);

            const responseHtml = `
                <div class="message__content">
                    <img class="message__avatar" src="assets/gemini.svg" alt="Model avatar">
                    <p class="message__text">${conversation.apiResponse}</p>
                </div>
            `;
            const incomingMessageElement = createChatMessageElement(responseHtml, "message--incoming");
            chatHistoryContainer.appendChild(incomingMessageElement);
        });

        document.body.classList.toggle("hide-header", savedConversations.length > 0);
    };

    request.onerror = () => {
        console.error("Ошибка при загрузке истории чатов");
    };
};

const createChatMessageElement = (htmlContent, ...cssClasses) => {
    const messageElement = document.createElement("div");
    messageElement.classList.add("message", ...cssClasses);
    messageElement.innerHTML = htmlContent;
    return messageElement;
};

const requestApiResponse = async (incomingMessageElement, db) => {
    const messageTextElement = incomingMessageElement.querySelector(".message__text");

    try {
        const response = await fetch(`${API_REQUEST_URL}?key=${GEMINI_API_KEY}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: currentUserMessage
                    }]
                }],
                generationConfig: {
                    maxOutputTokens: 500,
                    temperature: 0.7
                }
            }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error?.message || "API request failed");

        const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response";

        messageTextElement.innerText = responseText;
        saveChatToDatabase(db, currentUserMessage, responseText);
    } catch (error) {
        isGeneratingResponse = false;
        messageTextElement.innerText = `Ошибка: ${error.message}. Проверь сеть или токен.`;
        messageTextElement.closest(".message").classList.add("message--error");
    } finally {
        incomingMessageElement.classList.remove("message--loading");
    }
};

const handleOutgoingMessage = (db) => {
    currentUserMessage = messageForm.querySelector(".prompt__form-input").value.trim() || currentUserMessage;
    if (!currentUserMessage || isGeneratingResponse) return;

    isGeneratingResponse = true;

    const outgoingMessageHtml = `
        <div class="message__content">
            <img class="message__avatar" src="assets/profile.png" alt="User avatar">
            <p class="message__text"></p>
        </div>
    `;
    const outgoingMessageElement = createChatMessageElement(outgoingMessageHtml, "message--outgoing");
    outgoingMessageElement.querySelector(".message__text").innerText = currentUserMessage;
    chatHistoryContainer.appendChild(outgoingMessageElement);

    messageForm.reset();
    document.body.classList.add("hide-header");

    const loadingHtml = `
        <div class="message__content">
            <img class="message__avatar" src="assets/gemini.svg" alt="Model avatar">
            <p class="message__text"></p>
            <div class="message__loading-indicator">
                <div class="message__loading-bar"></div>
                <div class="message__loading-bar"></div>
                <div class="message__loading-bar"></div>
            </div>
        </div>
    `;
    const loadingMessageElement = createChatMessageElement(loadingHtml, "message--incoming", "message--loading");
    chatHistoryContainer.appendChild(loadingMessageElement);

    requestApiResponse(loadingMessageElement, db);
};

themeToggleButton.addEventListener('click', () => {
    const isLightTheme = document.body.classList.toggle("light_mode");
    localStorage.setItem("themeColor", isLightTheme ? "light_mode" : "dark_mode");
    const newIconClass = isLightTheme ? "bx bx-moon" : "bx bx-sun";
    themeToggleButton.querySelector("i").className = newIconClass;
});

clearChatButton.addEventListener('click', () => {
    if (confirm("Are you sure you want to delete all chat history?")) {
        const dbRequest = indexedDB.open("ChatDatabase", 1);
        dbRequest.onsuccess = (event) => {
            const db = event.target.result;
            const transaction = db.transaction("chats", "readwrite");
            const store = transaction.objectStore("chats");
            store.clear();
            console.log("История чатов очищена");
            chatHistoryContainer.innerHTML = '';
            document.body.classList.remove("hide-header");
        };
    }
});

suggestionItems.forEach(suggestion => {
    suggestion.addEventListener('click', () => {
        currentUserMessage = suggestion.querySelector(".suggests__item-text").innerText;
        const dbRequest = indexedDB.open("ChatDatabase", 1);
        dbRequest.onsuccess = (event) => handleOutgoingMessage(event.target.result);
    });
});

messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const dbRequest = indexedDB.open("ChatDatabase", 1);
    dbRequest.onsuccess = (event) => handleOutgoingMessage(event.target.result);
});

openDatabase();

if ("serviceWorker" in navigator) {
    navigator.serviceWorker
        .register("./service-worker.js")
        .then(() => console.log("Service Worker registered successfully"))
        .catch((error) => console.error("Service Worker registration failed:", error));
}