// ==============================
// ClimbLog app.js
// 完全版
// ==============================

// ------------------------------
// 画面要素
// ------------------------------

const startButton = document.getElementById("startButton");
const historyButton = document.getElementById("historyButton");

const backHomeButton = document.getElementById("backHomeButton");
const backHomeFromRecordButton = document.getElementById("backHomeFromRecordButton");
const backHistoryButton = document.getElementById("backHistoryButton");

const editRecordButton = document.getElementById("editRecordButton");

const homeSection = document.getElementById("home");
const recordSection = document.getElementById("record");
const historySection = document.getElementById("history");
const detailSection = document.getElementById("detail");
const historyList = document.getElementById("historyList");

const photoInput = document.getElementById("photoInput");
const wallImage = document.getElementById("wallImage");
const markers = document.getElementById("markers");

const markerTools = document.getElementById("markerTools");
const sizeTools = document.getElementById("sizeTools");

const gymSelect = document.getElementById("gymSelect");
const gymOther = document.getElementById("gymOther");
const gymOtherContainer = document.getElementById("gymOtherContainer");

const wallType = document.getElementById("wallType");

const attemptButtons = document.querySelectorAll(".attemptButton");
const autoCompleted = document.getElementById("autoCompleted");
const completionAttempt = document.getElementById("completionAttempt");

const saveButton = document.getElementById("saveButton");

const backupButton = document.getElementById("backupButton");
const restoreButton = document.getElementById("restoreButton");
const restoreInput = document.getElementById("restoreFileInput");

const detailGym = document.getElementById("detailGym");
const detailDateTime = document.getElementById("detailDate");
const detailGrade = document.getElementById("detailGrade");
const detailAttempts = document.getElementById("detailAttempts");
const detailCompleted = document.getElementById("detailCompleted");
const detailMemo = document.getElementById("detailMemo");
const detailWallType = document.getElementById("detailWallType");

const detailPhoto = document.getElementById("detailPhoto");
const detailMarkers = document.getElementById("detailMarkers");

const detailAttemptBody = document.getElementById("detailAttemptBody");
const detailCompletionAttempt = document.getElementById("detailCompletionAttempt");


// ------------------------------
// 状態
// ------------------------------

let currentMarkerType = "start";
let currentMarkerSize = "medium";

let currentCompleted = false;

let markerData = [];

let currentPhoto = null;
let currentPhotoUrl = null;
let currentDetailPhotoUrl = null;

let editingRecordId = null;
let currentDetailRecordId = null;


// ------------------------------
// IndexedDB
// ------------------------------

const DB_NAME = "ClimbLogDB";
const DB_VERSION = 1;
const STORE_NAME = "records";

let db = null;


// ------------------------------
// IndexedDB 初期化
// ------------------------------

function openDatabase() {
    return new Promise((resolve, reject) => {

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = function (event) {

            const database = event.target.result;

            if (!database.objectStoreNames.contains(STORE_NAME)) {

                database.createObjectStore(STORE_NAME, {
                    keyPath: "id"
                });

            }
        };

        request.onsuccess = function (event) {

            db = event.target.result;

            resolve(db);
        };

        request.onerror = function () {

            reject(request.error);
        };
    });
}


// ------------------------------
// 画面切り替え
// ------------------------------

function showSection(section) {

    homeSection.style.display = "none";
    recordSection.style.display = "none";
    historySection.style.display = "none";
    detailSection.style.display = "none";

    section.style.display = "block";
}


// ------------------------------
// ホーム
// ------------------------------

startButton.addEventListener("click", function () {

    editingRecordId = null;

    resetRecordForm();

    showSection(recordSection);
});


historyButton.addEventListener("click", function () {

    loadHistory();

    showSection(historySection);
});


// ------------------------------
// 戻る
// ------------------------------

backHomeButton.addEventListener("click", function () {

    showSection(homeSection);
});


backHomeFromRecordButton.addEventListener("click", function () {

    showSection(homeSection);
});


backHistoryButton.addEventListener("click", function () {

    showSection(historySection);
});


// ------------------------------
// ジム名
// ------------------------------

gymSelect.addEventListener("change", function () {

    if (gymSelect.value === "その他") {

        gymOtherContainer.style.display = "block";

        gymOther.focus();

    } else {

        gymOtherContainer.style.display = "none";

        gymOther.value = "";
    }
});


// ------------------------------
// マーカー種類
// ------------------------------

markerTools.addEventListener("click", function (event) {

    const button = event.target.closest(".markerTool");

    if (!button) {
        return;
    }

    currentMarkerType = button.dataset.type;

    document.querySelectorAll(".markerTool").forEach(function (tool) {

        tool.classList.remove("active");
    });

    button.classList.add("active");
});


// ------------------------------
// マーカーサイズ
// ------------------------------

sizeTools.addEventListener("click", function (event) {

    const button = event.target.closest(".sizeTool");

    if (!button) {
        return;
    }

    currentMarkerSize = button.dataset.size;

    document.querySelectorAll(".sizeTool").forEach(function (tool) {

        tool.classList.remove("active");
    });

    button.classList.add("active");
});


// ------------------------------
// 写真選択
// ------------------------------

photoInput.addEventListener("change", function (event) {

    const file = event.target.files[0];

    if (!file) {
        return;
    }

    currentPhoto = file;

    if (currentPhotoUrl) {

        URL.revokeObjectURL(currentPhotoUrl);
    }

    currentPhotoUrl = URL.createObjectURL(file);

    wallImage.src = currentPhotoUrl;

    wallImage.style.display = "block";

    markers.innerHTML = "";

    markerData = [];
});


// ------------------------------
// 写真クリックでマーカー追加
// ------------------------------

wallImage.addEventListener("click", function (event) {

    if (!currentPhotoUrl) {
        return;
    }

    const rect = wallImage.getBoundingClientRect();

    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    addMarker(
        x,
        y,
        currentMarkerType,
        currentMarkerSize
    );
});


// ------------------------------
// マーカー追加
// ------------------------------

function addMarker(x, y, type, size) {

    if (type === "erase") {

        removeNearestMarker(x, y);

        return;
    }

    const marker = {
        x: x,
        y: y,
        type: type,
        size: size
    };

    markerData.push(marker);

    renderMarkers();
}


// ------------------------------
// 一番近いマーカーを削除
// ------------------------------

function removeNearestMarker(x, y) {

    if (markerData.length === 0) {
        return;
    }

    let nearestIndex = -1;
    let nearestDistance = Infinity;

    markerData.forEach(function (marker, index) {

        const dx = marker.x - x;
        const dy = marker.y - y;

        const distance = Math.sqrt(
            dx * dx + dy * dy
        );

        if (distance < nearestDistance) {

            nearestDistance = distance;
            nearestIndex = index;
        }
    });

    if (nearestIndex >= 0) {

        markerData.splice(nearestIndex, 1);

        renderMarkers();
    }
}


// ------------------------------
// マーカー表示
// ------------------------------

function renderMarkers() {

    markers.innerHTML = "";

    markerData.forEach(function (marker) {

        const element = document.createElement("div");

        element.classList.add(
            "marker",
            marker.size,
            marker.type
        );

        element.style.left = marker.x + "%";
        element.style.top = marker.y + "%";

        // マーカー文字
        if (marker.type === "start") {

            element.textContent = "S";

        } else if (marker.type === "zone") {

            element.textContent = "Z";

        } else if (marker.type === "goal") {

            element.textContent = "T";

        } else if (marker.type === "core") {

            element.textContent = "◎";

        } else if (marker.type === "hold") {

            element.textContent = "";

        } else {

            element.textContent = "";
        }

        markers.appendChild(element);
    });
}


// ------------------------------
// トライ結果
// ------------------------------

// attemptData
//
// [
//     {
//         attempt: "1",
//         Z: false,
//         T: false
//     },
//     ...
// ]

let attemptData = [
    {
        attempt: "1",
        Z: "",
        T: ""
    },
    {
        attempt: "2",
        Z: "",
        T: ""
    },
    {
        attempt: "3",
        Z: "",
        T: ""
    },
    {
        attempt: "4",
        Z: "",
        T: ""
    },
    {
        attempt: "5",
        Z: "",
        T: ""
    },
    {
        attempt: "6",
        Z: "",
        T: ""
    },
    {
        attempt: "7+",
        Z: "",
        T: ""
    }
];

// ------------------------------
// トライ結果ボタン
// ------------------------------

attemptButtons.forEach(function (button) {

    button.addEventListener("click", function () {

        const attempt = button.dataset.attempt;
        const result = button.dataset.result;

        const target = attemptData.find(function (item) {

            return item.attempt === attempt;
        });

        if (!target) {
            return;
        }

        if (target[result] === "") {
    　　　　target[result] = "○";
　　　　} else if (target[result] === "○") {
    　　　　target[result] = "×";
　　　　} else {
    　　　　target[result] = "";
　　　　}

        renderAttemptButtons();

        updateCompletion();
    });
});


// ------------------------------
// トライ結果表示
// ------------------------------

function renderAttemptButtons() {

    attemptButtons.forEach(function (button) {

        const attempt = button.dataset.attempt;
        const result = button.dataset.result;

        const target = attemptData.find(function (item) {

            return item.attempt === attempt;
        });

        if (!target) {
            return;
        }

        const resultValue = target[result];

        button.textContent = resultValue;

        if (resultValue === "○") {

            button.classList.add("active");

        } else {

            button.classList.remove("active");
        }
    });
}

// ------------------------------
// 完登判定
// ------------------------------

function getCompletionAttempt() {

    for (let i = 0; i < attemptData.length; i++) {

        const item = attemptData[i];

        if (item.T === "○") {

            return item.attempt;
        }
    }

    return null;
}


function updateCompletion() {

    const completionAttemptValue = getCompletionAttempt();

    if (completionAttemptValue !== null) {

        currentCompleted = true;

        autoCompleted.style.display = "block";

        completionAttempt.style.display = "block";

        if (completionAttemptValue === "7+") {

            completionAttempt.textContent =
                "完登トライ：7回以上";

        } else {

            completionAttempt.textContent =
                "完登トライ：" + completionAttemptValue + "回";
        }

    } else {

        currentCompleted = false;

        autoCompleted.style.display = "none";

        completionAttempt.style.display = "none";

        completionAttempt.textContent = "";
    }
}


// ------------------------------
// トライ回数表示用
// ------------------------------

function getAttemptCountText(data) {

    if (!data || data.length === 0) {

        return "未記録";
    }

    let lastAttempt = null;

    data.forEach(function (item) {

        if (item.Z !== "" || item.T !== "") {

            lastAttempt = item.attempt;
        }
    });

    if (lastAttempt === null) {

        return "未記録";
    }

    if (lastAttempt === "7+") {

        return "7回以上";
    }

    return lastAttempt + "回";
}


// ------------------------------
// 日時表示
// ------------------------------

function formatDateTime(value) {

    if (!value) {
        return "";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {

        return value;
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hour = String(date.getHours()).padStart(2, "0");
    const minute = String(date.getMinutes()).padStart(2, "0");

    return (
        year +
        "/" +
        month +
        "/" +
        day +
        " " +
        hour +
        ":" +
        minute
    );
}


// ------------------------------
// ジム名取得
// ------------------------------

function getSelectedGymName() {

    if (gymSelect.value === "その他") {

        return gymOther.value.trim();
    }

    return gymSelect.value;
}


// ------------------------------
// 保存
// ------------------------------

saveButton.addEventListener("click", function () {

    saveRecordToDatabase();
});


function saveRecordToDatabase() {

    const gymName = getSelectedGymName();

    const gradeElement = document.getElementById("grade");
    const memoElement = document.getElementById("memo");

    const grade = gradeElement
        ? gradeElement.value
        : "";

    const memo = memoElement
        ? memoElement.value
        : "";

    const wallTypeValue = wallType
        ? wallType.value
        : "";

    // ジム名チェック
    if (!gymName) {

        alert("ジム名を選択してください。");

        return;
    }

    // 壁の種類チェック
    if (!wallTypeValue) {

        alert("壁の種類を選択してください。");

        return;
    }

    // 写真チェック
    if (!currentPhoto && !editingRecordId) {

        alert("写真を撮影してください。");

        return;
    }

    const recordId = editingRecordId || Date.now();

    const record = {

        id: recordId,

        gymName: gymName,

        dateTime: new Date().toISOString(),

        grade: grade,

        wallType: wallTypeValue,

        completed: currentCompleted,

        completionAttempt: getCompletionAttempt(),

        attemptData: JSON.parse(
            JSON.stringify(attemptData)
        ),

        memo: memo,

        markers: JSON.parse(
            JSON.stringify(markerData)
        ),

        photo: currentPhoto
    };


    const transaction = db.transaction(
        [STORE_NAME],
        "readwrite"
    );

    const store = transaction.objectStore(
        STORE_NAME
    );

    const request = store.put(record);

    request.onsuccess = function () {

        console.log(
            "Record saved:",
            record
        );
    };

    request.onerror = function () {

        console.error(
            "保存エラー:",
            request.error
        );

        alert("保存に失敗しました。");

        return;
    };

    transaction.oncomplete = function () {

        alert("記録を保存しました。");

        editingRecordId = null;

        loadHistory();

        resetRecordForm();

        showSection(historySection);
    };
}


// ------------------------------
// 記録フォーム初期化
// ------------------------------

function resetRecordForm() {

    gymSelect.value = "";

    gymOther.value = "";

    gymOtherContainer.style.display = "none";

    if (wallType) {

        wallType.value = "";
    }

    const gradeElement = document.getElementById("grade");

    if (gradeElement) {

        gradeElement.value = "";
    }

    const memoElement = document.getElementById("memo");

    if (memoElement) {

        memoElement.value = "";
    }

    photoInput.value = "";

    if (currentPhotoUrl) {

        URL.revokeObjectURL(currentPhotoUrl);

        currentPhotoUrl = null;
    }

    currentPhoto = null;

    wallImage.src = "";

    wallImage.style.display = "none";

    markers.innerHTML = "";

    markerData = [];

    attemptData = [
    {
        attempt: "1",
        Z: "",
        T: ""
    },
    {
        attempt: "2",
        Z: "",
        T: ""
    },
    {
        attempt: "3",
        Z: "",
        T: ""
    },
    {
        attempt: "4",
        Z: "",
        T: ""
    },
    {
        attempt: "5",
        Z: "",
        T: ""
    },
    {
        attempt: "6",
        Z: "",
        T: ""
    },
    {
        attempt: "7+",
        Z: "",
        T: ""
    }
];
    currentCompleted = false;

    renderAttemptButtons();

    updateCompletion();

    currentMarkerType = "start";
    currentMarkerSize = "medium";

    document.querySelectorAll(".markerTool").forEach(function (tool) {

        tool.classList.remove("active");
    });

    const startTool = document.querySelector(
        '.markerTool[data-type="start"]'
    );

    if (startTool) {

        startTool.classList.add("active");
    }

    document.querySelectorAll(".sizeTool").forEach(function (tool) {

        tool.classList.remove("active");
    });

    const mediumTool = document.querySelector(
        '.sizeTool[data-size="medium"]'
    );

    if (mediumTool) {

        mediumTool.classList.add("active");
    }
}


// ------------------------------
// 履歴読み込み
// ------------------------------

function loadHistory() {

    historyList.innerHTML = "";

    const transaction = db.transaction(
        [STORE_NAME],
        "readonly"
    );

    const store = transaction.objectStore(
        STORE_NAME
    );

    const request = store.getAll();

    request.onsuccess = function () {

        const records = request.result || [];

        records.sort(function (a, b) {

            return new Date(b.dateTime) -
                new Date(a.dateTime);
        });

        if (records.length === 0) {

            historyList.innerHTML =
                "<p>まだ記録がありません。</p>";

            return;
        }

        records.forEach(function (record) {

            const item = document.createElement("div");

            item.className = "historyItem";

            const completionText =
                record.completed
                    ? "完登"
                    : "未完登";

            const wallText =
                record.wallType
                    ? " / " + record.wallType
                    : "";

            const attemptDataForHistory =
                record.attemptData || [];

            const attemptText =
                getAttemptCountText(
                    attemptDataForHistory
                );

            item.innerHTML = `
                <div class="historyGym">
                    ${escapeHtml(record.gymName || "")}
                </div>

                <div class="historyDate">
                    ${escapeHtml(
                        formatDateTime(record.dateTime)
                    )}
                </div>

                <div class="historyInfo">
                    ${escapeHtml(record.grade || "")}
                    ${escapeHtml(wallText)}
                    / ${escapeHtml(attemptText)}
                    / ${escapeHtml(completionText)}
                </div>
            `;

const deleteButton = document.createElement("button");
deleteButton.type = "button";
deleteButton.className = "historyDeleteButton";
deleteButton.textContent = "🗑️ 削除";

deleteButton.addEventListener("click", function (event) {
    event.stopPropagation();

    const confirmed = confirm(
        "この記録を削除しますか？"
    );

    if (!confirmed) {
        return;
    }

    const transaction = db.transaction(
        [STORE_NAME],
        "readwrite"
    );

    const store = transaction.objectStore(
        STORE_NAME
    );

    const request = store.delete(record.id);

    request.onsuccess = function () {
        loadHistory();
    };

    request.onerror = function () {
        console.error(
            "削除エラー:",
            request.error
        );

        alert("削除に失敗しました。");
    };
});
            
            item.addEventListener("click", function () {

                showDetail(record.id);
            });

            historyList.appendChild(item);
        });
    };

    request.onerror = function () {

        console.error(
            "履歴読み込みエラー:",
            request.error
        );
    };
}


// ------------------------------
// HTMLエスケープ
// ------------------------------

function escapeHtml(value) {

    if (value === null || value === undefined) {

        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// ------------------------------
// 履歴詳細表示
// ------------------------------

function showDetail(recordId) {

    const transaction = db.transaction(
        [STORE_NAME],
        "readonly"
    );

    const store = transaction.objectStore(
        STORE_NAME
    );

    const request = store.get(recordId);

    request.onsuccess = function () {

        const record = request.result;

        if (!record) {

            alert("記録が見つかりません。");

            return;
        }

        currentDetailRecordId = record.id;

        detailGym.textContent =
            record.gymName || "";

        detailDateTime.textContent =
            formatDateTime(record.dateTime);

        detailGrade.textContent =
            record.grade || "";

        detailWallType.textContent =
            record.wallType || "";

        const detailAttemptData =
            record.attemptData || [];

        detailAttempts.textContent =
            getAttemptCountText(
                detailAttemptData
            );

        detailCompleted.textContent =
            record.completed
                ? "完登"
                : "未完登";

        detailMemo.textContent =
            record.memo || "";

        renderDetailAttempts(
            detailAttemptData,
            record.completionAttempt
        );

        renderDetailMarkers(
            record.markers || []
        );

        // 写真
        if (currentDetailPhotoUrl) {

            URL.revokeObjectURL(
                currentDetailPhotoUrl
            );

            currentDetailPhotoUrl = null;
        }

        if (record.photo) {

            currentDetailPhotoUrl =
                URL.createObjectURL(record.photo);

            detailPhoto.src =
                currentDetailPhotoUrl;

            detailPhoto.style.display =
                "block";

        } else {

            detailPhoto.src = "";

            detailPhoto.style.display =
                "none";
        }

        showSection(detailSection);
    };

    request.onerror = function () {

        console.error(
            "詳細読み込みエラー:",
            request.error
        );

        alert("記録の読み込みに失敗しました。");
    };
}


// ------------------------------
// 詳細画面のトライ結果表示
// ------------------------------

function renderDetailAttempts(
    data,
    completionAttemptValue
) {

    detailAttemptBody.innerHTML = "";

    const attempts = [
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7+"
    ];

    attempts.forEach(function (attempt) {

        const item = data.find(function (entry) {

            return entry.attempt === attempt;
        });

        const zResult =
            item ? item.Z : "";

        const tResult =
            item ? item.T : "";

        const zClass =
            zResult === "○"
                ? "result-ok"
                : zResult === "×"
                    ? "result-ng"
                    : "";

        const tClass =
            tResult === "○"
                ? "result-ok"
                : tResult === "×"
                    ? "result-ng"
                    : "";

        const row =
            document.createElement("tr");

        row.innerHTML = `
            <td>${escapeHtml(attempt)}</td>
            <td class="${zClass}">
                ${zResult}
            </td>
            <td class="${tClass}">
                ${tResult}
            </td>
        `;

        detailAttemptBody.appendChild(row);
    });

    if (completionAttemptValue !== null &&
        completionAttemptValue !== undefined) {

        detailCompletionAttempt.textContent =
            completionAttemptValue === "7+"
                ? "完登トライ：7回以上"
                : "完登トライ：" +
                  completionAttemptValue +
                  "回";

    } else {

        detailCompletionAttempt.textContent =
            "";
    }
}

// ------------------------------
// 詳細画面のマーカー表示
// ------------------------------

function renderDetailMarkers(data) {

    detailMarkers.innerHTML = "";

    data.forEach(function (marker) {

        const element =
            document.createElement("div");

        element.classList.add(
            "marker",
            marker.size,
            marker.type
        );

        element.style.left =
            marker.x + "%";

        element.style.top =
            marker.y + "%";

        if (marker.type === "start") {

            element.textContent = "S";

        } else if (marker.type === "zone") {

            element.textContent = "Z";

        } else if (marker.type === "goal") {

            element.textContent = "T";

        } else if (marker.type === "core") {

            element.textContent = "◎";

        } else if (marker.type === "hold") {

            element.textContent = "";
        }

        detailMarkers.appendChild(element);
    });
}


// ------------------------------
// 編集
// ------------------------------

editRecordButton.addEventListener(
    "click",
    function () {

        if (!currentDetailRecordId) {

            return;
        }

        startEditingRecord(
            currentDetailRecordId
        );
    }
);


function startEditingRecord(recordId) {

    const transaction = db.transaction(
        [STORE_NAME],
        "readonly"
    );

    const store = transaction.objectStore(
        STORE_NAME
    );

    const request = store.get(recordId);

    request.onsuccess = function () {

        const record = request.result;

        if (!record) {

            alert("記録が見つかりません。");

            return;
        }

        editingRecordId = record.id;

        // --------------------------
        // ジム
        // --------------------------

        const gymName =
            record.gymName || "";

        let gymFound = false;

        Array.from(
            gymSelect.options
        ).forEach(function (option) {

            if (
                option.value === gymName &&
                option.value !== "その他"
            ) {

                gymFound = true;
            }
        });

        if (gymFound) {

            gymSelect.value = gymName;

            gymOther.value = "";

            gymOtherContainer.style.display =
                "none";

        } else {

            gymSelect.value = "その他";

            gymOther.value = gymName;

            gymOtherContainer.style.display =
                "block";
        }


        // --------------------------
        // 壁の種類
        // --------------------------

        if (wallType) {

            wallType.value =
                record.wallType || "";
        }


        // --------------------------
        // グレード
        // --------------------------

        const gradeElement =
            document.getElementById("grade");

        if (gradeElement) {

            gradeElement.value =
                record.grade || "";
        }


        // --------------------------
        // メモ
        // --------------------------

        const memoElement =
            document.getElementById("memo");

        if (memoElement) {

            memoElement.value =
                record.memo || "";
        }


        // --------------------------
        // マーカー
        // --------------------------

        markerData = JSON.parse(
            JSON.stringify(
                record.markers || []
            )
        );


        // --------------------------
        // トライ結果
        // --------------------------

        if (
            Array.isArray(record.attemptData)
        ) {

            attemptData = JSON.parse(
                JSON.stringify(
                    record.attemptData
                )
            );

        } else {

            attemptData = [
                {
                    attempt: "1",
                    Z: "",
                    T: ""
                },
                {
                    attempt: "2",
                    Z: "",
                    T: ""
                },
                {
                    attempt: "3",
                    Z: "",
                    T: ""
                },
                {
                    attempt: "4",
                    Z: "",
                    T: ""
                },
                {
                    attempt: "5",
                    Z: "",
                    T: ""
                },
                {
                    attempt: "6",
                    Z: "",
                    T: ""
                },
                {
                    attempt: "7+",
                    Z: "",
                    T: ""
                }
            ];
        }

        // --------------------------
        // 完登状態
        // --------------------------

        currentCompleted =
            record.completed === true;


        // --------------------------
        // 写真
        // --------------------------

        if (currentPhotoUrl) {

            URL.revokeObjectURL(
                currentPhotoUrl
            );

            currentPhotoUrl = null;
        }

        if (record.photo) {

            currentPhoto =
                record.photo;

            currentPhotoUrl =
                URL.createObjectURL(
                    record.photo
                );

            wallImage.src =
                currentPhotoUrl;

            wallImage.style.display =
                "block";

        } else {

            currentPhoto = null;

            wallImage.src = "";

            wallImage.style.display =
                "none";
        }


        // --------------------------
        // マーカー・トライ再表示
        // --------------------------

        renderMarkers();

        renderAttemptButtons();

        updateCompletion();

        showSection(recordSection);
    };

    request.onerror = function () {

        console.error(
            "編集データ読み込みエラー:",
            request.error
        );

        alert(
            "編集データの読み込みに失敗しました。"
        );
    };
}


// ------------------------------
// バックアップ
// ------------------------------

backupButton.addEventListener(
    "click",
    function () {

        createBackup();
    }
);

async function createBackup() {
    const transaction = db.transaction(["records"], "readonly");
    const store = transaction.objectStore("records");

    const request = store.getAll();

    request.onsuccess = async () => {
        try {
            const records = request.result;

            const backupRecords = [];

            for (const record of records) {
                const backupRecord = {
                    ...record,
                    photo: null
                };

                // 写真がある場合はBase64に変換
                if (record.photo) {
                    backupRecord.photo = await blobToBase64(record.photo);
                }

                backupRecords.push(backupRecord);
            }

            const backupData = {
                appName: "ClimbLog",
                version: 3,
                createdAt: new Date().toISOString(),
                records: backupRecords
            };

            const json = JSON.stringify(backupData, null, 2);
            const blob = new Blob([json], {
                type: "application/json"
            });

            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");

            a.href = url;
            a.download =
                `ClimbLog_backup_${new Date().toISOString().slice(0, 10)}.json`;

            document.body.appendChild(a);
            a.click();
            a.remove();

            URL.revokeObjectURL(url);

            alert("バックアップを作成しました。");
        } catch (error) {
            console.error("バックアップエラー:", error);
            alert("バックアップの作成に失敗しました。");
        }
    };

    request.onerror = () => {
        console.error("バックアップ読み込みエラー:", request.error);
        alert("データの読み込みに失敗しました。");
    };
}

function blobToBase64(blob) {
    return new Promise((resolve, reject) => {

        const reader = new FileReader();

        reader.onloadend = function () {
            resolve(reader.result);
        };

        reader.onerror = function () {
            reject(reader.error);
        };

        reader.readAsDataURL(blob);
    });
}

// ------------------------------
// 復元
// ------------------------------

restoreButton.addEventListener(
    "click",
    function () {

        restoreInput.click();
    }
);


restoreInput.addEventListener(
    "change",
    function (event) {

        const file =
            event.target.files[0];

        if (!file) {

            return;
        }

        const reader =
            new FileReader();

        reader.onload = function () {

            try {

                const backupData =
                    JSON.parse(
                        reader.result
                    );

                restoreBackup(
                    backupData
                );

            } catch (error) {

                console.error(error);

                alert(
                    "バックアップファイルを読み込めませんでした。"
                );
            }
        };

        reader.readAsText(file);
    }
);


function restoreBackup(backupData) {

    if (
        !backupData ||
        backupData.appName !== "ClimbLog" ||
        !Array.isArray(backupData.records)
    ) {

        alert(
            "正しいClimbLogバックアップではありません。"
        );

        return;
    }

    const records = backupData.records;

    if (records.length === 0) {

        alert(
            "バックアップに記録がありません。"
        );

        return;
    }

    const confirmed =
        confirm(
            records.length +
            "件の記録を復元します。\n\n" +
            "同じIDの記録は上書きされません。\n" +
            "よろしいですか？"
        );

    if (!confirmed) {

        return;
    }

    const transaction =
        db.transaction(
            [STORE_NAME],
            "readwrite"
        );

    const store =
        transaction.objectStore(
            STORE_NAME
        );

    let restoreIndex = 0;

    function restoreNext() {

        if (
            restoreIndex >=
            records.length
        ) {

            return;
        }

        const backupRecord =
            records[restoreIndex];

        restoreIndex++;

        const getRequest =
            store.get(backupRecord.id);

        getRequest.onsuccess =
            function () {

                // 同じIDが存在する場合はスキップ
                if (getRequest.result) {

                    restoreNext();

                    return;
                }

                const record = {
                    ...backupRecord
                };

                // Base64 → Blob
                if (
                    typeof record.photo === "string" &&
                    record.photo.startsWith("data:")
                ) {

                    try {

                        record.photo =
                            base64ToBlob(
                                record.photo
                            );

                    } catch (error) {

                        console.error(
                            "写真の復元に失敗:",
                            error
                        );

                        record.photo = null;
                    }

                } else {

                    record.photo = null;
                }

                try {

                    store.add(record);

                } catch (error) {

                    console.error(
                        "復元エラー:",
                        error
                    );
                }

                restoreNext();
            };

        getRequest.onerror =
            function () {

                console.error(
                    "復元確認エラー:",
                    getRequest.error
                );

                restoreNext();
            };
    }

    transaction.oncomplete =
        function () {

            alert(
                "バックアップの復元が完了しました。"
            );

            loadHistory();
        };

    transaction.onerror =
        function () {

            console.error(
                "復元トランザクションエラー:",
                transaction.error
            );

            alert(
                "バックアップの復元中にエラーが発生しました。"
            );
        };

    restoreNext();
}

function base64ToBlob(dataUrl) {

    const parts =
        dataUrl.split(",");

    const mimeMatch =
        parts[0].match(
            /data:(.*?);base64/
        );

    const mime =
        mimeMatch
            ? mimeMatch[1]
            : "image/jpeg";

    const binary =
        atob(parts[1]);

    const bytes =
        new Uint8Array(
            binary.length
        );

    for (
        let i = 0;
        i < binary.length;
        i++
    ) {

        bytes[i] =
            binary.charCodeAt(i);
    }

    return new Blob(
        [bytes],
        {
            type: mime
        }
    );
}

// ------------------------------
// ページを離れる前の後始末
// ------------------------------

window.addEventListener(
    "beforeunload",
    function () {

        if (currentPhotoUrl) {

            URL.revokeObjectURL(
                currentPhotoUrl
            );

            currentPhotoUrl = null;
        }

        if (currentDetailPhotoUrl) {

            URL.revokeObjectURL(
                currentDetailPhotoUrl
            );

            currentDetailPhotoUrl = null;
        }
    }
);


// ------------------------------
// Service Worker
// ------------------------------

if ("serviceWorker" in navigator) {

    window.addEventListener(
        "load",
        function () {

            navigator.serviceWorker
                .register("./service-worker.js")
                .then(function (registration) {

                    console.log(
                        "Service Worker registered:",
                        registration.scope
                    );

                })
                .catch(function (error) {

                    console.error(
                        "Service Worker registration failed:",
                        error
                    );
                });
        }
    );
}


// ------------------------------
// 初期化
// ------------------------------

async function initializeApp() {

    try {

        await openDatabase();

        renderAttemptButtons();

        updateCompletion();

        showSection(homeSection);

        console.log(
            "ClimbLog initialized."
        );

    } catch (error) {

        console.error(
            "ClimbLog initialization failed:",
            error
        );

        alert(
            "ClimbLogの初期化に失敗しました。"
        );
    }
}


// ------------------------------
// アプリ起動
// ------------------------------

initializeApp();
