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
        return;
    }
    qSearch(objInput.value)
});

const debounceCreateDefaultSearchList = debounce(createDefaultSearchList, 200)

objInput.addEventListener("input", function () {
    const qSearchContent = objInput.value;
    debounceCreateDefaultSearchList(qSearchContent);
});

function debounce(fn, delay = 1000) {
    let timer = null;
    return function () {
        let _this = this;
        let args = arguments;
        if (timer) {
            clearTimeout(timer);
            timer = null;
        }
        timer = setTimeout(function () {
            fn.apply(_this, args);
        }, delay);
    };
}

function createDefaultSearchList(qSearchContent) {
    if (!qSearchContent) {
        objTips.innerHTML = "";
        objList.innerHTML = "";
        return;
    }
    objList.innerHTML = '';
    const liGoogle = createSearchItem({
        name: "谷歌",
        qSearchContent: qSearchContent,
        url: `https://www.google.com/search?q=`,
        id: "google",
        tag: "新建"
    })
    const liBing = createSearchItem({
        name: "必应",
        qSearchContent: qSearchContent,
        url: `https://cn.bing.com/search?q=`,
        id: "bing",
        tag: "新建"
    })
    const liBaiDu = createSearchItem({
        name: "百度",
        qSearchContent: qSearchContent,
        url: `https://www.baidu.com/s?wd=`,
        id: "baidu",
        tag: "新建"
    })
    objList.append(liGoogle, liBaiDu, liBing)
}

function createSearchItem(obj) {
    const li = document.createElement("li");
    li.setAttribute('qsearch-index', `${obj.name}搜索`);
    li.setAttribute('qsearch-tag', obj.tag);
    li.innerHTML = `<div>${obj.qSearchContent}</div>`;
    li.onclick = () => {
        window.open(`${obj.url}${obj.qSearchContent}`, '_blank');
    }
    return li;
}

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

function getHistory(name) {
    return chrome.runtime.sendMessage({
        op: 'getHistory',
        query: {
            text: name,
            startTime: new Date() - 1000 * 60 * 60 * 24 * 7,
            maxResults: 100
        }
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
        li.title = `标题:${el.title}\n地址:${el.url}`;
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
            case 'lsjl':
                li.title += `\n上次访问时间: ${new Date(el.time).toLocaleString()}`
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
        getTabs(name),
        getHistory(name)
    ]).then(arr => {
        objList.innerHTML = '';
        res = arr.flat();
        if (res.length === 0) {
            const li = document.createElement('li');
            li.textContent = "未检索到匹配的内容";
            objList.appendChild(li);
            return;
        }
        const uniqueItems = res.filter((item, index, self) => self.findIndex(t => t.title === item.title) === index);
        fuseSearch(uniqueItems, name).then(res => {
            updateList(res)
        })
    })
}
