importScripts('Fuse.js')

const sqUrl = chrome.runtime.getURL('img/SQ.png')
const bqyUrl = chrome.runtime.getURL('img/BQY.png')

function getBookmarks(sendResponse) {
    chrome.bookmarks.getTree((tree) => {
        let bookmarks = []
        const root = tree[0].children
        scanBookmarks(root, bookmarks)
        sendResponse(bookmarks)
    });
}

function getTabs(sendResponse) {
    chrome.tabs.query({}, (tabs) => {
        tabs = tabs.map((tab) => {
            return {
                id: tab.id,
                url: tab.url,
                title: tab.title,
                icon: bqyUrl,
                tag: { id: 'bqy', name: '标签页' }
            }
        })
        sendResponse(tabs)
    })
}

function activeTab(tab) {
    chrome.tabs.update(tab.id, { active: true })
}

function searchBookmarks(query, sendResponse) {
    chrome.bookmarks.search(query, (res) => {
        sendResponse(res)
    })
}

function scanBookmarks(nodes, bookmarks) {
    for (const node of nodes) {
        if (node.url) {
            bookmarks.push({
                url: node.url,
                title: node.title,
                icon: sqUrl,
                tag: { id: 'sq', name: '书签' }
            })
        }
        if (node.children) {
            scanBookmarks(node.children, bookmarks)
        }
    }
}

function fuseSearch(arr, query, sendResponse) {
    const fuse = new Fuse(arr, {
        keys: ['title', 'url']
    })
    const result = fuse.search(query)
    sendResponse(result)
}

chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
    switch (req.op) {
        case 'getBookmarks':
            getBookmarks(sendResponse)
            return true
        case 'getTabs':
            getTabs(sendResponse)
            return true
        case 'fuseSearch':
            fuseSearch(req.arr, req.query, sendResponse)
            return true
        case 'searchBookmarks':
            searchBookmarks(req.query, sendResponse)
            return true
        case 'activeTab':
            activeTab(req.tab)
            return true
        default:
            sendResponse({ op: 'error', message: 'Unknown operation' })
    }
})