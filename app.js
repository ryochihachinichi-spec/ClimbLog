const startButton =
    document.getElementById("startButton");

const historyButton =
    document.getElementById("historyButton");

const backHomeButton =
    document.getElementById("backHomeButton");

const backHomeFromRecordButton =
    document.getElementById(
        "backHomeFromRecordButton"
    );

const backHistoryButton =
    document.getElementById("backHistoryButton");


const editRecordButton =
    document.getElementById("editRecordButton");


const home =
    document.getElementById("home");

const record =
    document.getElementById("record");

const history =
    document.getElementById("history");

const detail =
    document.getElementById("detail");


const historyList =
    document.getElementById("historyList");


const photoInput =
    document.getElementById("photoInput");


const wallImage =
    document.getElementById("wallImage");

const markers =
    document.getElementById("markers");


const markerTools =
    document.querySelectorAll(".markerTool");

const sizeTools =
    document.querySelectorAll(".sizeTool");

const completionButtons =
    document.querySelectorAll(".completionButton");


const saveButton =
    document.getElementById("saveButton");


const backupButton =
    document.getElementById("backupButton");

const restoreButton =
    document.getElementById("restoreButton");

const restoreFileInput =
    document.getElementById("restoreFileInput");


// ========================================
// 詳細画面
// ========================================

const detailDate =
    document.getElementById("detailDate");

const detailGym =
    document.getElementById("detailGym");

const detailPhoto =
    document.getElementById("detailPhoto");

const detailMarkers =
    document.getElementById("detailMarkers");

const detailGrade =
    document.getElementById("detailGrade");

const detailAttempts =
    document.getElementById("detailAttempts");

const detailCompleted =
    document.getElementById("detailCompleted");

const detailMemo =
    document.getElementById("detailMemo");


// ========================================
// 現在の設定
// ========================================

let currentMarkerType = "start";

let currentMarkerSize = "medium";

let currentCompleted = true;


// ========================================
// マーカーデータ
// ========================================

let markerData = [];


// ========================================
// 現在の写真
// ========================================

let currentPhoto = null;


// ========================================
// 記録画面の写真URL
// ========================================


let currentPhotoUrl = null;
// ========================================
// 詳細画面の写真URL
// ========================================

let currentDetailPhotoUrl = null;


let editingRecordId = null;
let currentDetailRecordId = null;


// ========================================
// IndexedDB
// ========================================

let db;


const dbRequest =
    indexedDB.open(
        "ClimbLogDB",
        1
    );


// ========================================
// データベース初回作成
// ========================================

dbRequest.onupgradeneeded =
    function (event) {

        db = event.target.result;


        if (
            !db.objectStoreNames.contains(
                "records"
            )
        ) {

            db.createObjectStore(
                "records",
                {
                    keyPath: "id"
                }
            );

        }

    };


// ========================================
// データベース接続成功
// ========================================

dbRequest.onsuccess =
    function (event) {

        db = event.target.result;

        console.log(
            "IndexedDBに接続しました"
        );

    };


// ========================================
// データベースエラー
// ========================================

dbRequest.onerror =
    function (event) {

        console.error(
            "IndexedDBエラー:",
            event.target.error
        );

    };


// ========================================
// 記録開始
// ========================================

startButton.addEventListener(
    "click",
    function () {

        // 新しい記録としてフォームをリセット
        resetRecordForm();


        home.style.display = "none";

        history.style.display = "none";

        detail.style.display = "none";

        record.style.display = "block";

    }
);


editRecordButton.addEventListener(
    "click",
    function () {

        if (currentDetailRecordId === null) {
            return;
        }

        startEditingRecord(currentDetailRecordId);
    }
);


// ========================================
// 履歴を見る
// ========================================

historyButton.addEventListener(
    "click",
    function () {

        home.style.display = "none";

        record.style.display = "none";

        detail.style.display = "none";

        history.style.display = "block";


        loadHistory();

    }
);


// ========================================
// ホームに戻る
// ========================================

backHomeButton.addEventListener(
    "click",
    function () {

        history.style.display = "none";

        record.style.display = "none";

        detail.style.display = "none";

        home.style.display = "block";

    }
);


// ========================================
// 記録画面からホームに戻る
// ========================================

backHomeFromRecordButton.addEventListener(
    "click",
    function () {

        record.style.display = "none";

        history.style.display = "none";

        detail.style.display = "none";

        home.style.display = "block";

    }
);


// ========================================
// 履歴に戻る
// ========================================

backHistoryButton.addEventListener(
    "click",
    function () {

        revokeDetailPhotoUrl();

        detail.style.display = "none";

        record.style.display = "none";

        home.style.display = "none";

        history.style.display = "block";

        loadHistory();

    }
);


// ========================================
// バックアップ・復元
// ========================================

backupButton.addEventListener(
    "click",
    function () {

        backupRecords();

    }
);


restoreButton.addEventListener(
    "click",
    function () {

        restoreFileInput.click();

    }
);


restoreFileInput.addEventListener(
    "change",
    function () {

        const file = this.files[0];

        if (!file) {
            return;
        }

        restoreRecords(file);

        this.value = "";

    }
);


// ========================================
// マーカー種類
// ========================================

markerTools.forEach(
    function (button) {

        button.addEventListener(
            "click",
            function () {

                currentMarkerType =
                    button.dataset.type;


                markerTools.forEach(
                    function (b) {

                        b.classList.remove(
                            "active"
                        );

                    }
                );


                button.classList.add(
                    "active"
                );

            }
        );

    }
);


// ========================================
// マーカーサイズ
// ========================================

sizeTools.forEach(
    function (button) {

        button.addEventListener(
            "click",
            function () {

                currentMarkerSize =
                    button.dataset.size;


                sizeTools.forEach(
                    function (b) {

                        b.classList.remove(
                            "active"
                        );

                    }
                );


                button.classList.add(
                    "active"
                );

            }
        );

    }
);


// ========================================
// 完登・未完登
// ========================================

completionButtons.forEach(
    function (button) {

        button.addEventListener(
            "click",
            function () {

                currentCompleted =
                    button.dataset.completed
                    === "true";


                completionButtons.forEach(
                    function (b) {

                        b.classList.remove(
                            "active"
                        );

                    }
                );


                button.classList.add(
                    "active"
                );

            }
        );

    }
);


// ========================================
// 写真を選択
// ========================================

photoInput.addEventListener(
    "change",
    function () {

        const file =
            this.files[0];


        if (!file) {
            return;
        }


        currentPhoto = file;


        if (currentPhotoUrl) {

            URL.revokeObjectURL(
                currentPhotoUrl
            );

        }


        currentPhotoUrl =
            URL.createObjectURL(file);


        wallImage.src =
            currentPhotoUrl;


        wallImage.onload =
            function () {

                wallImage.style.display =
                    "block";


                markerData = [];

                markers.innerHTML = "";

            };

    }
);


// ========================================
// 写真をクリック
// ========================================

wallImage.addEventListener(
    "click",
    function (event) {

        const rect =
            wallImage.getBoundingClientRect();


        const x =
            event.clientX - rect.left;

        const y =
            event.clientY - rect.top;


        const xPercent =
            (x / rect.width) * 100;

        const yPercent =
            (y / rect.height) * 100;


        // ====================================
        // 消去
        // ====================================

        if (
            currentMarkerType === "erase"
        ) {

            let nearestIndex = -1;

            let nearestDistance =
                Infinity;


            markerData.forEach(
                function (marker, index) {

                    const dx =
                        marker.x -
                        xPercent;

                    const dy =
                        marker.y -
                        yPercent;


                    const distance =
                        Math.sqrt(
                            dx * dx +
                            dy * dy
                        );


                    if (
                        distance <
                        nearestDistance
                    ) {

                        nearestDistance =
                            distance;

                        nearestIndex =
                            index;

                    }

                }
            );


            if (
                nearestIndex !== -1 &&
                nearestDistance <= 5
            ) {

                markerData.splice(
                    nearestIndex,
                    1
                );


                renderMarkers();

            }


            return;

        }


        // ====================================
        // マーカー追加
        // ====================================

        markerData.push({

            type:
                currentMarkerType,

            size:
                currentMarkerSize,

            x:
                xPercent,

            y:
                yPercent

        });


        renderMarkers();

    }
);


// ========================================
// マーカー描画
// ========================================

function renderMarkers() {

    markers.innerHTML = "";


    markerData.forEach(
        function (data) {

            const marker =
                document.createElement(
                    "div"
                );


            marker.className =
                "marker " +
                data.type +
                " " +
                data.size;


            marker.style.left =
                data.x + "%";


            marker.style.top =
                data.y + "%";


            if (
                data.type === "start"
            ) {

                marker.textContent =
                    "S";

            }

            else if (
                data.type === "hold"
            ) {

                marker.textContent =
                    "";

            }

            else if (
                data.type === "goal"
            ) {

                marker.textContent =
                    "G";

            }

            else if (
                data.type === "zone"
            ) {

                marker.textContent =
                    "Z";

            }


            markers.appendChild(
                marker
            );

        }
    );

}


// ========================================
// 記録保存
// ========================================

saveButton.addEventListener(
    "click",
    async function () {

        const gymName =
            document
                .getElementById("gymName")
                .value
                .trim();


        const grade =
            document
                .getElementById("grade")
                .value;


        const attempts =
            document
                .getElementById("attempts")
                .value;


        const memo =
            document
                .getElementById("memo")
                .value
                .trim();


        // ====================================
        // 入力チェック
        // ====================================

        if (!gymName) {

            alert(
                "ジム名を入力してください。"
            );

            return;

        }


        if (!currentPhoto) {

            alert(
                "壁の写真を撮影してください。"
            );

            return;

        }


        if (!grade) {

            alert(
                "グレードを選択してください。"
            );

            return;

        }


        if (
            !attempts ||
            attempts < 1
        ) {

            alert(
                "トライ回数を入力してください。"
            );

            return;

        }


        if (!db) {

            alert(
                "データベースの準備ができていません。"
            );

            return;

        }


        let recordData;

        if (editingRecordId !== null) {

            // 編集の場合
            const readTransaction = db.transaction(
                ["records"],
                "readonly"
            );

            const readStore =
                readTransaction.objectStore("records");

            const request =
                readStore.get(editingRecordId);

            request.onsuccess = function () {

                const oldRecord = request.result;

                if (!oldRecord) {
                    alert("元の記録が見つかりません。");
                    return;
                }

                recordData = {
                    id: oldRecord.id,

                    // 記録日時は元の日時を維持
                    dateTime: oldRecord.dateTime,

                    gymName: gymName,
                    grade: grade,
                    attempts: Number(attempts),
                    completed: currentCompleted,
                    memo: memo,
                    markers: markerData,
                    photo: currentPhoto
                };

                saveRecordToDatabase(recordData);
            };

        } else {

            // 新規記録の場合
            recordData = {
                id: Date.now(),
                gymName: gymName,
                dateTime: new Date().toISOString(),
                grade: grade,
                attempts: Number(attempts),
                completed: currentCompleted,
                memo: memo,
                markers: markerData,
                photo: currentPhoto
            };

            saveRecordToDatabase(recordData);
        }


        function saveRecordToDatabase(recordData) {

            // ====================================
            // IndexedDB保存
            // ====================================

            const transaction =
                db.transaction(
                    ["records"],
                    "readwrite"
                );

            const store =
                transaction.objectStore(
                    "records"
                );

            store.put(recordData);

            transaction.oncomplete =
                function () {

                    if (editingRecordId !== null) {

                        alert(
                            "記録を変更しました！"
                        );

                    } else {

                        alert(
                            "記録を保存しました！"
                        );

                    }

                    console.log(
                        "保存した記録:",
                        recordData
                    );

                    // 編集状態を解除
                    editingRecordId = null;

                    // 保存ボタンを元に戻す
                    saveButton.textContent =
                        "💾 この記録を保存";

                    // 履歴を更新
                    loadHistory();

                    // 保存した記録の詳細を表示
                    showDetail(recordData.id);
                };

            transaction.onerror =
                function (event) {

                    console.error(
                        "保存エラー:",
                        event.target.error
                    );

                    alert(
                        "記録の保存に失敗しました。"
                    );

                };
        }
    }
);


// ========================================
// 履歴を読み込む
// ========================================

function loadHistory() {

    historyList.innerHTML = "";


    if (!db) {

        historyList.innerHTML =
            '<div class="noHistory">' +
            'データベースを準備しています…' +
            '</div>';

        return;

    }


    const transaction =
        db.transaction(
            ["records"],
            "readonly"
        );


    const store =
        transaction.objectStore(
            "records"
        );


    const request =
        store.getAll();


    request.onsuccess =
        function () {

            const records =
                request.result;


            records.sort(
                function (a, b) {

                    return b.id - a.id;

                }
            );


            if (records.length === 0) {

                historyList.innerHTML =
                    '<div class="noHistory">' +
                    'まだ記録がありません。' +
                    '</div>';

                return;

            }


            records.forEach(
                function (recordData) {

                    createHistoryItem(
                        recordData
                    );

                }
            );

        };


    request.onerror =
        function (event) {

            console.error(
                "履歴読み込みエラー:",
                event.target.error
            );

        };

}


// ========================================
// 履歴1件を作る
// ========================================

function createHistoryItem(
    recordData
) {

    const item =
        document.createElement("div");


    item.className =
        "historyItem";


    const date =
        new Date(
            recordData.dateTime
        );


    const dateText =
        date.toLocaleString(
            "ja-JP"
        );


    let completedText;

    let completedClass;


    if (recordData.completed) {

        completedText =
            "○ 完登";

        completedClass =
            "completed";

    }

    else {

        completedText =
            "× 未完登";

        completedClass =
            "notCompleted";

    }


    // ====================================
    // 履歴の内容
    // ====================================

    item.innerHTML =

        '<div class="historyDate">' +
        dateText +
        '</div>' +

        '<div class="historyGym">' +
        escapeHtml(
            recordData.gymName
        ) +
        '</div>' +

        '<div class="historyInfo">' +

        escapeHtml(
            recordData.grade
        ) +

        '　' +

        recordData.attempts +
        'トライ　' +

        '<span class="' +
        completedClass +
        '">' +
        completedText +
        '</span>' +

        '</div>';


    // ====================================
    // ボタンエリア
    // ====================================

    const buttonArea =
        document.createElement("div");


    buttonArea.className =
        "historyButtonArea";


    // ====================================
    // 詳細ボタン
    // ====================================

    const detailButton =
        document.createElement("button");


    detailButton.type =
        "button";


    detailButton.className =
        "historyDetailButton";


    detailButton.textContent =
        "📖 詳細を見る";


    detailButton.addEventListener(
        "click",
        function (event) {

            // 履歴カード自体のクリックを止める
            event.stopPropagation();


            showDetail(
                recordData.id
            );

        }
    );


    // ====================================
    // 削除ボタン
    // ====================================

    const deleteButton =
        document.createElement("button");


    deleteButton.type =
        "button";


    deleteButton.className =
        "historyDeleteButton";


    deleteButton.textContent =
        "🗑️ 削除";


    deleteButton.addEventListener(
        "click",
        function (event) {

            // 履歴カード自体のクリックを止める
            event.stopPropagation();


            deleteRecord(
                recordData.id
            );

        }
    );


    buttonArea.appendChild(
        detailButton
    );


    buttonArea.appendChild(
        deleteButton
    );


    item.appendChild(
        buttonArea
    );


    // ====================================
    // カードをクリックして詳細表示
    // ====================================

    item.addEventListener(
        "click",
        function () {

            showDetail(
                recordData.id
            );

        }
    );


    historyList.appendChild(
        item
    );

}


// ========================================
// 詳細画面を表示
// ========================================

function showDetail(id) {

    if (!db) {

        alert(
            "データベースの準備ができていません。"
        );

        return;

    }


    const transaction =
        db.transaction(
            ["records"],
            "readonly"
        );


    const store =
        transaction.objectStore(
            "records"
        );


    const request =
        store.get(id);


    request.onsuccess =
        function () {

            const recordData =
                request.result;

            currentDetailRecordId = recordData.id;


            if (!recordData) {

                alert(
                    "記録が見つかりません。"
                );

                return;

            }


            // ====================================
            // 画面切り替え
            // ====================================

            home.style.display = "none";

            record.style.display = "none";

            history.style.display = "none";

            detail.style.display = "block";


            // ====================================
            // 基本情報
            // ====================================

            const date =
                new Date(
                    recordData.dateTime
                );


            detailDate.textContent =
                date.toLocaleString(
                    "ja-JP"
                );


            detailGym.textContent =
                recordData.gymName;


            detailGrade.textContent =
                recordData.grade;


            detailAttempts.textContent =
                recordData.attempts +
                "回";


            if (recordData.completed) {

                detailCompleted.textContent =
                    "○ 完登";

                detailCompleted.className =
                    "completed";

            }

            else {

                detailCompleted.textContent =
                    "× 未完登";

                detailCompleted.className =
                    "notCompleted";

            }


            detailMemo.textContent =
                recordData.memo ||
                "メモはありません。";


            // ====================================
            // 写真
            // ====================================

            revokeDetailPhotoUrl();


            if (recordData.photo) {

                currentDetailPhotoUrl =
                    URL.createObjectURL(
                        recordData.photo
                    );


                detailPhoto.src =
                    currentDetailPhotoUrl;


                detailPhoto.onload =
                    function () {

                        renderDetailMarkers(
                            recordData.markers || []
                        );

                    };

            }

            else {

                detailPhoto.removeAttribute(
                    "src"
                );

                detailMarkers.innerHTML = "";

            }

        };


    request.onerror =
        function (event) {

            console.error(
                "詳細読み込みエラー:",
                event.target.error
            );

            alert(
                "記録の読み込みに失敗しました。"
            );

        };

}


// ========================================
// 詳細画面のマーカー描画
// ========================================

function renderDetailMarkers(
    savedMarkers
) {

    detailMarkers.innerHTML = "";


    savedMarkers.forEach(
        function (data) {

            const marker =
                document.createElement(
                    "div"
                );


            marker.className =
                "marker " +
                data.type +
                " " +
                data.size;


            marker.style.left =
                data.x + "%";


            marker.style.top =
                data.y + "%";


            if (
                data.type === "start"
            ) {

                marker.textContent =
                    "S";

            }

            else if (
                data.type === "hold"
            ) {

                marker.textContent =
                    "";

            }

            else if (
                data.type === "goal"
            ) {

                marker.textContent =
                    "G";

            }

            else if (
                data.type === "zone"
            ) {

                marker.textContent =
                    "Z";

            }


            detailMarkers.appendChild(
                marker
            );

        }
    );

}


// ========================================
// 詳細画面の写真URLを解放
// ========================================

function revokeDetailPhotoUrl() {

    if (currentDetailPhotoUrl) {

        URL.revokeObjectURL(
            currentDetailPhotoUrl
        );

        currentDetailPhotoUrl = null;

    }


    detailPhoto.removeAttribute(
        "src"
    );

    detailMarkers.innerHTML = "";

}


// ========================================
// HTML特殊文字対策
// ========================================

function escapeHtml(text) {

    const div =
        document.createElement("div");


    div.textContent =
        text;


    return div.innerHTML;

}

// ========================================
// 新しい記録を開始するときのリセット
// ========================================

function resetRecordForm() {

    // ====================================
    // テキスト入力
    // ====================================

    document.getElementById("gymName").value = "";

    document.getElementById("grade").value = "";

    document.getElementById("attempts").value = "1";

    document.getElementById("memo").value = "";


    // ====================================
    // 写真
    // ====================================

    currentPhoto = null;


    if (currentPhotoUrl) {

        URL.revokeObjectURL(
            currentPhotoUrl
        );

        currentPhotoUrl = null;

    }


    wallImage.removeAttribute(
        "src"
    );

    wallImage.style.display =
        "none";


    photoInput.value = "";


    // ====================================
    // マーカー
    // ====================================

    markerData = [];

    markers.innerHTML = "";


    // ====================================
    // マーカー種類
    // デフォルト：S スタート
    // ====================================

    currentMarkerType =
        "start";


    markerTools.forEach(
        function (button) {

            button.classList.remove(
                "active"
            );


            if (
                button.dataset.type ===
                "start"
            ) {

                button.classList.add(
                    "active"
                );

            }

        }
    );


    // ====================================
    // マーカーサイズ
    // デフォルト：中
    // ====================================

    currentMarkerSize =
        "medium";


    sizeTools.forEach(
        function (button) {

            button.classList.remove(
                "active"
            );


            if (
                button.dataset.size ===
                "medium"
            ) {

                button.classList.add(
                    "active"
                );

            }

        }
    );


    // ====================================
    // 完登状態
    // デフォルト：完登
    // ====================================

    currentCompleted =
        true;


    completionButtons.forEach(
        function (button) {

            button.classList.remove(
                "active"
            );


            if (
                button.dataset.completed ===
                "true"
            ) {

                button.classList.add(
                    "active"
                );

            }

        }
    );

}

// ========================================
// 記録を削除
// ========================================

function deleteRecord(id) {

    if (!db) {

        alert(
            "データベースの準備ができていません。"
        );

        return;

    }


    // ====================================
    // 対象の記録を取得
    // ====================================

    const transaction =
        db.transaction(
            ["records"],
            "readonly"
        );


    const store =
        transaction.objectStore(
            "records"
        );


    const request =
        store.get(id);


    request.onsuccess =
        function () {

            const recordData =
                request.result;


            if (!recordData) {

                alert(
                    "削除する記録が見つかりません。"
                );

                return;

            }


            // ====================================
            // 削除確認
            // ====================================

            const message =
                "この記録を削除しますか？\n\n" +
                "ジム：" +
                recordData.gymName +
                "\n" +
                "グレード：" +
                recordData.grade +
                "\n\n" +
                "この操作は元に戻せません。";


            const confirmed =
                window.confirm(
                    message
                );


            if (!confirmed) {

                return;

            }


            // ====================================
            // 削除
            // ====================================

            const deleteTransaction =
                db.transaction(
                    ["records"],
                    "readwrite"
                );


            const deleteStore =
                deleteTransaction.objectStore(
                    "records"
                );


            deleteStore.delete(
                id
            );


            deleteTransaction.oncomplete =
                function () {

                    alert(
                        "記録を削除しました。"
                    );


                    // 履歴を再表示
                    loadHistory();

                };


            deleteTransaction.onerror =
                function (event) {

                    console.error(
                        "削除エラー:",
                        event.target.error
                    );


                    alert(
                        "記録の削除に失敗しました。"
                    );

                };

        };


    request.onerror =
        function (event) {

            console.error(
                "削除対象の読み込みエラー:",
                event.target.error
            );


            alert(
                "記録の読み込みに失敗しました。"
            );

        };

}

function startEditingRecord(id) {

    const transaction = db.transaction(
        ["records"],
        "readonly"
    );

    const store = transaction.objectStore("records");

    const request = store.get(id);

    request.onsuccess = function () {

        const recordData = request.result;

        if (!recordData) {
            alert("記録が見つかりません。");
            return;
        }

        // 編集中の記録IDを保存
        editingRecordId = recordData.id;

        // 基本情報をフォームへセット
        gymName.value = recordData.gymName || "";
        grade.value = recordData.grade || "";
        attempts.value = recordData.attempts || 1;
        memo.value = recordData.memo || "";

        // 完登状態を復元
        currentCompleted = recordData.completed;

        completionButtons.forEach(function (button) {

            if (
                button.dataset.completed ===
                String(currentCompleted)
            ) {
                button.classList.add("active");
            } else {
                button.classList.remove("active");
            }

        });

        // マーカーを復元
        markerData = recordData.markers || [];

        // 写真を復元
        currentPhoto = recordData.photo || null;

        if (currentPhotoUrl) {
            URL.revokeObjectURL(currentPhotoUrl);
            currentPhotoUrl = null;
        }

        if (currentPhoto) {

            currentPhotoUrl =
                URL.createObjectURL(currentPhoto);

            wallImage.src = currentPhotoUrl;
            wallImage.style.display = "block";

            wallImage.onload = function () {
                renderMarkers();
            };

        } else {

            wallImage.src = "";
            wallImage.style.display = "none";

            renderMarkers();
        }

        // マーカー種類を「S」に戻す
        currentMarkerType = "start";

        markerTools.forEach(function (button) {

            button.classList.toggle(
                "active",
                button.dataset.type === "start"
            );

        });

        // マーカーサイズを「中」に戻す
        currentMarkerSize = "medium";

        sizeTools.forEach(function (button) {

            button.classList.toggle(
                "active",
                button.dataset.size === "medium"
            );

        });

        // 保存ボタンの表示を変更
        saveButton.textContent = "💾 変更を保存";

        // 画面を記録画面に切り替える
        home.style.display = "none";
        history.style.display = "none";
        detail.style.display = "none";
        record.style.display = "block";
    };
}

// ========================================
// バックアップ処理
// ========================================

async function backupRecords() {

    if (!db) {

        alert(
            "データベースの準備ができていません。"
        );

        return;
    }


    const transaction =
        db.transaction(
            ["records"],
            "readonly"
        );


    const store =
        transaction.objectStore(
            "records"
        );


    const request =
        store.getAll();


    request.onsuccess =
        async function () {

            const records =
                request.result;


            if (records.length === 0) {

                alert(
                    "バックアップする記録がありません。"
                );

                return;
            }


            try {

                const backupRecords =
                    await Promise.all(
                        records.map(
                            async function (record) {

                                let photoData = null;


                                if (record.photo) {

                                    photoData =
                                        await blobToDataUrl(
                                            record.photo
                                        );

                                }


                                return {

                                    id:
                                        record.id,

                                    gymName:
                                        record.gymName,

                                    dateTime:
                                        record.dateTime,

                                    grade:
                                        record.grade,

                                    attempts:
                                        record.attempts,

                                    completed:
                                        record.completed,

                                    memo:
                                        record.memo,

                                    markers:
                                        record.markers || [],

                                    photo:
                                        photoData

                                };

                            }
                        )
                    );


                const backupData = {

                    appName:
                        "ClimbLog",

                    version:
                        1,

                    createdAt:
                        new Date().toISOString(),

                    records:
                        backupRecords

                };


                const json =
                    JSON.stringify(
                        backupData
                    );


                const blob =
                    new Blob(
                        [json],
                        {
                            type:
                                "application/json"
                        }
                    );


                const url =
                    URL.createObjectURL(
                        blob
                    );


                const link =
                    document.createElement(
                        "a"
                    );


                const date =
                    new Date();


                const dateText =
                    date.getFullYear() +
                    "-" +
                    String(
                        date.getMonth() + 1
                    ).padStart(2, "0") +
                    "-" +
                    String(
                        date.getDate()
                    ).padStart(2, "0");


                link.href =
                    url;


                link.download =
                    "ClimbLog_backup_" +
                    dateText +
                    ".json";


                link.click();


                URL.revokeObjectURL(
                    url
                );


                alert(
                    records.length +
                    "件の記録をバックアップしました。"
                );

            }
            catch (error) {

                console.error(
                    "バックアップエラー:",
                    error
                );


                alert(
                    "バックアップに失敗しました。"
                );

            }

        };


    request.onerror =
        function (event) {

            console.error(
                "バックアップ読み込みエラー:",
                event.target.error
            );


            alert(
                "記録の読み込みに失敗しました。"
            );

        };
}

// ========================================
// 写真をDataURLに変換
// ========================================

function blobToDataUrl(blob) {

    return new Promise(
        function (resolve, reject) {

            const reader =
                new FileReader();


            reader.onload =
                function () {

                    resolve(
                        reader.result
                    );

                };


            reader.onerror =
                function () {

                    reject(
                        reader.error
                    );

                };


            reader.readAsDataURL(
                blob
            );

        }
    );
}

// ========================================
// バックアップから取り込み
// ========================================

async function restoreRecords(file) {

    if (!db) {
        alert(
            "データベースの準備ができていません。"
        );
        return;
    }

    try {

        const text =
            await file.text();

        const backupData =
            JSON.parse(text);

        // バックアップファイルか確認
        if (
            !backupData ||
            backupData.appName !== "ClimbLog" ||
            !Array.isArray(
                backupData.records
            )
        ) {
            alert(
                "ClimbLogのバックアップファイルではありません。"
            );
            return;
        }

        // 取り込み前の確認
        const confirmed =
            window.confirm(
                backupData.records.length +
                "件の記録を取り込みます。\n\n" +
                "現在の記録は削除されません。\n" +
                "よろしいですか？"
            );

        if (!confirmed) {
            return;
        }

        // 写真を復元
        const importRecords =
            await Promise.all(
                backupData.records.map(
                    async function (record) {

                        let photo = null;

                        if (record.photo) {
                            photo =
                                dataUrlToBlob(
                                    record.photo
                                );
                        }

                        return {
                            id: record.id,
                            gymName: record.gymName,
                            dateTime: record.dateTime,
                            grade: record.grade,
                            attempts: record.attempts,
                            completed: record.completed,
                            memo: record.memo,
                            markers: record.markers || [],
                            photo: photo
                        };
                    }
                )
            );

        // IndexedDBへ保存
        const transaction =
            db.transaction(
                ["records"],
                "readwrite"
            );

        const store =
            transaction.objectStore(
                "records"
            );

        let addedCount = 0;
        let skippedCount = 0;

        // 既存データを確認してから追加
        importRecords.forEach(
            function (record) {

                const request =
                    store.get(record.id);

                request.onsuccess =
                    function () {

                        const existingRecord =
                            request.result;

                        if (existingRecord) {

                            // 同じIDがあればスキップ
                            skippedCount++;

                        } else {

                            // 新しい記録だけ追加
                            store.add(record);
                            addedCount++;

                        }
                    };
            }
        );

        transaction.oncomplete =
            function () {

                let message =
                    addedCount +
                    "件の記録を取り込みました。";

                if (skippedCount > 0) {

                    message +=
                        "\n" +
                        skippedCount +
                        "件は既に存在するため、スキップしました。";
                }

                alert(message);

                loadHistory();
            };

        transaction.onerror =
            function (event) {

                console.error(
                    "取り込みエラー:",
                    event.target.error
                );

                alert(
                    "記録の取り込みに失敗しました。"
                );
            };

    } catch (error) {

        console.error(
            "取り込み処理エラー:",
            error
        );

        alert(
            "バックアップファイルの読み込みに失敗しました。"
        );
    }
}

// ========================================
// DataURLを画像データに戻す
// ========================================

function dataUrlToBlob(dataUrl) {

    const parts =
        dataUrl.split(",");


    const mime =
        parts[0]
            .match(/:(.*?);/)[1];


    const binary =
        atob(parts[1]);


    const length =
        binary.length;


    const bytes =
        new Uint8Array(
            length
        );


    for (
        let i = 0;
        i < length;
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

// ========================================
// Service Worker登録
// ========================================

if ("serviceWorker" in navigator) {

    window.addEventListener(
        "load",
        function () {

            navigator.serviceWorker.register(
                "/service-worker.js"
            )
                .then(
                    function (registration) {

                        console.log(
                            "Service Worker登録成功:",
                            registration.scope
                        );

                    }
                )
                .catch(
                    function (error) {

                        console.error(
                            "Service Worker登録失敗:",
                            error
                        );

                    }
                );

        }
    );

}