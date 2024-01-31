const objMain = document.querySelector(".ws-qsearch-s-main");
const objList = objMain.querySelector(".ws-qsearch-s-list");
const objInput = objMain.querySelector(".ws-qsearch-s-input");
const objBtn = objMain.querySelector(".ws-qsearch-s-btn");
const objBox = objMain.querySelector(".ws-qsearch-s-box");
const objTips = objMain.querySelector(".ws-qsearch-s-tips");


objBtn.addEventListener("click", function () {
    objList.innerHTML = "";
    if (!objInput.value) {
        const li = document.createElement("li");
        li.textContent = "请输入关键词再进行检索";
        li.style.color = "red";
        objList.appendChild(li);
        objList.style.display = "flex";
        return;
    }
    qSearch(objInput.value)
    objList.style.display = "flex";
});

objInput.addEventListener("input", function () {
    if (!objInput.value) {
        objTips.innerHTML = "";
        objList.style.display = "none";
        return;
    }
});

function isBoxHide() {
    return objBox.style.display === "none";
}

function showMain() {
    objBox.style.display = "flex";
    objMain.classList.remove("ws-qsearch-s-main-hide");
}

document.addEventListener("keyup", function (e) {
    if (e.key === "/") {
        if (objBox.style.display === "none") {
            showMain();
        }
        objInput.focus();
        return;
    }
    if (e.key === "Enter") {
        isBoxHide() || objBtn.click();
        return;
    }
});

function getBookmarks(name) {
    return chrome.runtime.sendMessage({
        op: 'getBookmarks',
        query: name
    })
}

function getTabs(name) {
    return chrome.runtime.sendMessage({
        op: 'getTabs',
        query: name
    })
}

function fuseSearch(arr, name) {
    return chrome.runtime.sendMessage({
        op: 'fuseSearch',
        arr: arr,
        query: name
    })
}

function updateList(arr) {
    objTips.innerHTML = `已检索到: ${arr.length}条内容`
    arr.forEach((el, i) => {
        el = el.item
        const li = document.createElement('li');
        li.setAttribute('qsearch-index', i)
        li.setAttribute('qsearch-tag', el.tag.name)
        li.innerHTML = `<div>${el.title}</div>`;
        switch (el.tag.id) {
            case 'bqy':
                li.onclick = () => {
                    activeTab(el)
                }
                break;
            case 'sq':
                li.onclick = () => {
                    window.open(el.url, '_blank');
                }
                break;
        }
        objList.appendChild(li);
    });
}

function activeTab(tab) {
    return chrome.runtime.sendMessage({
        op: 'activeTab',
        tab: tab,
    })
}

function qSearch(name) {
    Promise.all([
        getBookmarks(name),
        getTabs(name)
    ]).then(arr => {
        objList.innerHTML = '';
        res = arr.flat();
        if (res.length === 0) {
            const li = document.createElement('li');
            li.textContent = "未检索到匹配的内容";
            objList.appendChild(li);
            return;
        }
        fuseSearch(res, name).then(res => {
            updateList(res)
        })
    })
}
