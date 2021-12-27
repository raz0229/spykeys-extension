/*
** file: js/main.js
** author: @raz0229
*/
let SPYKEYS_SUBSCRIBED_CLICKED;
let apiKey;

chrome.storage.sync.get(["SPYKEYS_SUBSCRIBED_X-API-KEY"], function (items) {
    if (items['SPYKEYS_SUBSCRIBED_X-API-KEY']) {
        apiKey = items['SPYKEYS_SUBSCRIBED_X-API-KEY']
        chrome.storage.sync.get(["SPYKEYS_SUBSCRIBED_CLICKED"], function (items) {
            if (items["SPYKEYS_SUBSCRIBED_CLICKED"]) {
                SPYKEYS_SUBSCRIBED_CLICKED = items["SPYKEYS_SUBSCRIBED_CLICKED"];
                togglePower();
                $('#buttonColl').slideDown()
            } else {
                SPYKEYS_SUBSCRIBED_CLICKED = false
                $('#buttonColl').slideUp()
            }
        })
    }
    else {
        $('#buttonColl').slideUp()
    }
});

function init_main() {
    $('html').hide().fadeIn(1000);
}

//bind events to dom elements
document.addEventListener('DOMContentLoaded', init_main);

document.querySelector('.power_button').addEventListener('click', () => {
    SPYKEYS_SUBSCRIBED_CLICKED = !SPYKEYS_SUBSCRIBED_CLICKED;
    $('.center > span').css('pointer-events', 'none'); // disabling click on power button

    togglePower();
    if (SPYKEYS_SUBSCRIBED_CLICKED) {
        chrome.storage.sync.set({ "SPYKEYS_SUBSCRIBED_CLICKED": SPYKEYS_SUBSCRIBED_CLICKED }, function () {
        });
        chrome.storage.sync.get(["SPYKEYS_SUBSCRIBED_X-API-KEY"], function (items) {
            if (items['SPYKEYS_SUBSCRIBED_X-API-KEY']) {
                apiKey = items['SPYKEYS_SUBSCRIBED_X-API-KEY']
                $('#buttonColl').slideDown()

                $('.center > span').css('pointer-events', 'all'); // enabling click on power button
            } else {
                $('.center > span').css('pointer-events', 'none'); // disabling click on power button
                M.toast({ html: '🐱 Catcalling the server...' })
                fetch('https://api-spykeys.herokuapp.com/gennew').then(res =>
                    res.text()
                ).catch(err => M.toast({ html: '😵‍💫 Internet Connection Error' })).then(r => {
                    console.log(r)
                    chrome.storage.sync.set({ "SPYKEYS_SUBSCRIBED_X-API-KEY": r }, function () {
                        M.toast({ html: '😗 New API Key generated' })
                        chrome.storage.sync.set({ "SPYKEYS_SUBSCRIBED_CLICKED": true }, function () {
                        })
                        $('.center > span').css('pointer-events', 'all'); // enabling click on power button
                        $('#buttonColl').slideDown()

                        $('.center > span').css('pointer-events', 'all'); // enabling click on power button
                    });
                })
            }

        });
    } else {
        chrome.storage.sync.set({ "SPYKEYS_SUBSCRIBED_CLICKED": SPYKEYS_SUBSCRIBED_CLICKED }, function () {
            $('#buttonColl').slideUp()
            // togglePower();
            $('.center > span').css('pointer-events', 'all'); // disabling click on power button
        });
    }

})

document.querySelector('#copy-button').addEventListener('click', () => {
    chrome.storage.sync.get(["SPYKEYS_SUBSCRIBED_X-API-KEY"], function (items) {
        if (items['SPYKEYS_SUBSCRIBED_X-API-KEY']) {
            M.toast({ html: '📎 Copied API Key to Clipboard' })
            navigator.clipboard.writeText(items['SPYKEYS_SUBSCRIBED_X-API-KEY']);
        }
    })
})

document.querySelector('#view-button').addEventListener('click', () => {
    chrome.storage.sync.get(["SPYKEYS_SUBSCRIBED_X-API-KEY"], function (items) {
        let url = `https://spykeys.herokuapp.com?apiKey=${items['SPYKEYS_SUBSCRIBED_X-API-KEY']}`;
        window.open(url, '_blank').focus();
    })
})

document.querySelector('#delete-button').addEventListener('click', () => {
    $('#delete-button').css('pointer-events', 'none'); // disabling click on delete button
    $('.center > span').css('pointer-events', 'none'); // disabling click on power button
    M.toast({ html: '📦 Packing up stuff...' })
    chrome.storage.sync.get(["SPYKEYS_SUBSCRIBED_X-API-KEY"], function (items) {
        if (items['SPYKEYS_SUBSCRIBED_X-API-KEY']) apiKey = items['SPYKEYS_SUBSCRIBED_X-API-KEY']
    })
    $('#buttonColl').slideUp()

    chrome.storage.sync.set({ "SPYKEYS_SUBSCRIBED_CLICKED": false }, function () {
        SPYKEYS_SUBSCRIBED_CLICKED = false;
        togglePower()
    });

    if (apiKey) {
        removeKey(apiKey)
            .then(response => {
                chrome.storage.sync.clear();
                M.toast({ html: '😿 Success: Deleted all user data' })
                $('.center > span').css('pointer-events', 'all'); // enabling click on power button
                $('#delete-button').css('pointer-events', 'all'); // enabling click on delete button
                return
            });
    } else {
        $('.center > span').css('pointer-events', 'all'); // enabling click on power button
        $('#delete-button').css('pointer-events', 'all'); // enabling click on delete button
        $('#buttonColl').slideDown()

        chrome.storage.sync.set({ "SPYKEYS_SUBSCRIBED_CLICKED": true }, function () {
            SPYKEYS_SUBSCRIBED_CLICKED = true
            togglePower()
        });
    }
})

function togglePower() {

    $("#cf img.top").toggleClass("transparent");
    $("#cf img.bottom").toggleClass("transparent")
    $(".center > span").toggleClass("neon-green")

    let x = document.querySelector('.power_button');
    if (SPYKEYS_SUBSCRIBED_CLICKED) {
        chrome.browserAction.setIcon({
            path: {
                "19": "/images/icon_19.png",
                "38": "/images/icon_38.png", "128": "/images/icon_128.png"
            }
        });
        chrome.browserAction.setBadgeText({ text: 'ON' });
        x.classList.remove('cc-gray')
        x.classList.add('cc-green')
    } else {
        chrome.browserAction.setBadgeText({ text: 'OFF' });
        chrome.browserAction.setIcon({
            path: {
                "19": "/images/icon_19_disabled.png",
                "38": "/images/icon_38_disabled.png", "128": "/images/icon_128_disabled.png"
            }
        });
        x.classList.remove('cc-green')
        x.classList.add('cc-gray')
    }
}

async function removeKey(api = 'xxx') {

    const response = await fetch('https://api-spykeys.herokuapp.com/removeKey', {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        headers: {
            'x-api-key': `${api}`
        },
        referrerPolicy: 'no-referrer'
    });
    return response.text();
}