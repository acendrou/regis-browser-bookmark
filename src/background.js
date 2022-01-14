var list = [];

var status = "";

function startBrowsingCapture() {
    statusCreation = false;
    statusRemoval = false;
    statusChanged = false;
    statusMoved = false;

    // CREATION
    if (!browser.bookmarks.onCreated.hasListener(captureCreation)) {
        browser.bookmarks.onCreated.addListener(captureCreation);
        statusCreation = true;
        console.log(Date().toLocaleString() + " starting: created log");
    }

    // REMOVAL
    if (!browser.bookmarks.onRemoved.hasListener(captureRemoval)) {
        browser.bookmarks.onRemoved.addListener(captureRemoval);
        statusRemoval = true;
        console.log(Date().toLocaleString() + " starting: removal log");
    }

    // CHANGED
    if (!browser.bookmarks.onChanged.hasListener(captureChanged)) {
        browser.bookmarks.onChanged.addListener(captureChanged);
        statusChanged = true;
        console.log(Date().toLocaleString() + " starting: changed log");
    }

    // MOVED
    if (!browser.bookmarks.onMoved.hasListener(captureMoved)) {
        browser.bookmarks.onMoved.addListener(captureMoved);
        statusMoved = true;
        console.log(Date().toLocaleString() + " starting: changed log");
    }


    if (statusCreation == true && statusRemoval == true && statusChanged == true && statusMoved == true)
    {
        status = "STARTED";
    }else
    {
        stopBrowsingCapture();
    }

}

function stopBrowsingCapture() {

    // CREATION
    if (browser.bookmarks.onCreated.hasListener(captureCreation)) {
        browser.bookmarks.onCreated.removeListener(captureCreation);
        status = "STOPPED";
        console.log(Date().toLocaleString() + " stopping: created log");
    }

    // REMOVAL
    if (browser.bookmarks.onRemoved.hasListener(captureRemoval)) {
        browser.bookmarks.onRemoved.removeListener(captureRemoval);
        status = "STOPPED";
        console.log(Date().toLocaleString() + " stopping: removal log");
    }

    // CHANGED
    if (browser.bookmarks.onChanged.hasListener(captureChanged)) {
        browser.bookmarks.onChanged.removeListener(captureChanged);
        status = "STOPPED";
        console.log(Date().toLocaleString() + " stopping: changed log");
    }

    // MOVED
    if (browser.bookmarks.onMoved.hasListener(captureMoved)) {
        browser.bookmarks.onMoved.removeListener(captureMoved);
        status = "STOPPED";
        console.log(Date().toLocaleString() + " stopping: moved log");
    }


    downloadBrowsingBookmark();
}

function downloadBrowsingBookmark() {

    if (list.length === 0) {
        console.log("empty browsing list - not saving anything !");

    } else {
        saveData(list);
        console.log("browsing list saved");
    }
}


function captureCreation(id, bookmarkInfo) {
    console.log("Bookmark created");

    if (bookmarkInfo.type === "bookmark")
    {
        logInfo(bookmarkInfo, id, "creation");

    }else if (bookmarkInfo.type === "folder") {
        // don't log when a folder is created because on Firefox, it is weird behavior :
        // the folder is always called " new folder" and not by the name the user choose

       /* const  temp = writeInfo(bookmarkInfo, id, "creation");
        list.push(temp); */
        console.log("FOLDER: DO NOTHING");
    }else
    {
        console.log("SEPARATOR: DO NOTHING");
    }
}

function captureRemoval(id, removeInfo){
    console.log("Bookmark removed");

    if (removeInfo.node.type === "bookmark")
    {
        logInfo(removeInfo.node, id, "removal");

    }else if (removeInfo.node.type === "folder") {

        logInfo(removeInfo.node, id,"removal");
    }else
    {
        console.log("SEPARATOR: DO NOTHING");
    }
}


function captureChanged (id, changeInfo){
    console.log("Bookmark changed");

    logMoreInfo(id,"change");

    // const  temp = writeInfo(changeInfo,id, "change");
    // list.push(temp);
}

function captureMoved(id, moveInfo){
    console.log("Bookmark moved");

    // logMoreInfo(id,"move");

    getBookmarkMoveInfos(id, moveInfo.parentId, moveInfo.oldParentId)
        .then((bookmarks) => {
            let temp = {
                move: bookmarks[0],
                from: bookmarks[1],
                to: bookmarks[2]
            }

            list.push(temp);
        });

}

async function getBookmarkMoveInfos(id, parentId, oldParentId) {
    let bookmarkInfo;
    bookmarkInfo = await getMoreInfo(id);
    let bookmarkMoved = writeInfo(bookmarkInfo, id, "move");

    bookmarkInfo = await getMoreInfo(oldParentId);
    let bookmarkOldParentMoved = writeInfo(bookmarkInfo, oldParentId, "move");

    bookmarkInfo = await getMoreInfo(parentId);
    let bookmarkParentMoved = writeInfo(bookmarkInfo, parentId, "move");

    return [bookmarkMoved, bookmarkOldParentMoved, bookmarkParentMoved];
}

function logMoreInfo(id, action) {
    let bookmarkInfo;
    console.log("More info for: " + id);
    let gettingBookmarks = browser.bookmarks.get(id);
    gettingBookmarks.then(onFulfilledGetBookmark, error => (console.log("error get bookmark: " + error)))
        .then(bookmarkInfo => {logInfo(bookmarkInfo[0], id, action);});
}

function getMoreInfo(id) {
    let bookmarkInfo;
    console.log("More info for: " + id);
    let gettingBookmarks = browser.bookmarks.get(id);
    gettingBookmarks.then(onFulfilledGetBookmark, error => (console.log("error get bookmark: " + error)));

    return gettingBookmarks.then( (results) => {return results[0];});
}

function logInfo(bookmarkInfo, id, action) {
    const temp = writeInfo(bookmarkInfo,id, action);
    list.push(temp);
}


function onFulfilledGetBookmark(bookmark){
    console.log(bookmark);
    return bookmark;
}


function writeInfo(bookmarkInfo, id, action)
{
    let dateISO = new Date();
    console.log(dateISO.toISOString());

    console.log(bookmarkInfo.title);
    console.log(bookmarkInfo.url);

    return {
        date: dateISO.toISOString(),
        action: action,
        type: bookmarkInfo.type,
        url: bookmarkInfo.url,
        title: bookmarkInfo.title,
        id: id,
        dateAdded: bookmarkInfo.dateAdded,
        dateGroupModified: bookmarkInfo.dateGroupModified
    };
}


function getMessage() {
    if (!browser.runtime.onMessage.hasListener(processMessage)) {
        browser.runtime.onMessage.addListener(processMessage);
    }
}

function stopMessage() {
    if (browser.runtime.onMessage.hasListener(processMessage)) {
        browser.runtime.onMessage.removeListener(processMessage);
    }
}

function processMessage(data, sender) {
    console.log("MSG Copy " + data.content);

    if (data.content === '#start') {
        startBrowsingCapture();
        return Promise.resolve({response: "done"});
    }

    if (data.content === '#stop') {
        stopBrowsingCapture();

        return Promise.resolve({response: "done"});
    }

    if (data.content === '#status') {
        return Promise.resolve({response: status});
    }

    if (data.content === '#download') {
        downloadBrowsingBookmark();
        return Promise.resolve({response: "done"});
    }

    return Promise.resolve({response: "error"});
}

function dateFile() {
    let dateUTC = new Date();
    let dateString = dateUTC.getUTCFullYear() + "-" + (dateUTC.getUTCMonth() + 1) + "-" + dateUTC.getUTCDate() + "_" +
        dateUTC.getUTCHours() + "-" + dateUTC.getUTCMinutes() + "-" + dateUTC.getUTCSeconds();
    return dateString;
}


function saveData(data) {
    let blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
    let url = URL.createObjectURL(blob);
    let dateString = "regis-browser-bookmark/" + dateFile() + ".txt";
    let download = browser.downloads.download({url: url, filename: dateString, saveAs: false});
    download.then(() => {
        list = []
    }).catch(error => console.log(error));
}


function init() {
    startBrowsingCapture();
    getMessage();

    browser.windows.onRemoved.addListener(() => {
        downloadBrowsingBookmark()
    });

    setInterval(downloadBrowsingBookmark,1200000); // every 20 minutes

}


init();