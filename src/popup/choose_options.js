var status = "";

function handleResponse(message) {
    console.log("We got : " + message.response);
}

function handleResponseStatus(message) {
    console.log("Status is : " + message.response);
    status = message.response;
    document.getElementById("status").innerText = status;
}

function handleError(error) {
    console.log(`Error: ${error}`);
    document.getElementById("status").innerText = "ERROR";
    status = "ERROR";
}

function start() {
    console.log("START CLICK");
    let sending = browser.runtime.sendMessage({content: "#start"})
    sending.then(handleResponse, handleError);
    document.getElementById("status").innerText = "STARTED";
    status = "STARTED";
}

function stop() {
    console.log("STOP CLICK");
    let sending = browser.runtime.sendMessage({content: "#stop"})
    sending.then(handleResponse, handleError);
    document.getElementById("status").innerText = "STOPPED";
    status = "STOPPED";
}

function download() {
    console.log("DOWNLOAD CLICK");
    let sending = browser.runtime.sendMessage({content: "#download"})
    sending.then(handleResponse, handleError);
}

function init() {
    document.getElementById("start").addEventListener("click", start);
    document.getElementById("stop").addEventListener("click", stop);
    document.getElementById("download").addEventListener("click", download);
}


window.onload = (event) => {
    console.log('page is fully loaded - do the right thing :)');
    init();

    let sending = browser.runtime.sendMessage({content: "#status"})
    sending.then(handleResponseStatus, handleError);
    document.getElementById("status").innerText = status;
};
