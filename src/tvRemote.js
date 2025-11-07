// tvRemote.js — universal Tizen remote navigation handler

export function registerKeyEvents() {
    if (window.tizen && tizen.tvinputdevice) {
        tizen.tvinputdevice.registerKey("ArrowUp");
        tizen.tvinputdevice.registerKey("ArrowDown");
        tizen.tvinputdevice.registerKey("ArrowLeft");
        tizen.tvinputdevice.registerKey("ArrowRight");
        tizen.tvinputdevice.registerKey("Enter");
        tizen.tvinputdevice.registerKey("Return");
    }
}

export function initRemoteNavigation(focusableElements) {
    let index = 0;

    const setFocus = (i) => {
        index = i;
        focusableElements.forEach((el, idx) => {
            if (!el) return;

            if (idx === index) {
                el.classList.add("tv-focused");
                el.focus();
            } else {
                el.classList.remove("tv-focused");
            }
        });
    };

    setFocus(0);

    document.addEventListener("keydown", (e) => {
        switch (e.key) {
            case "ArrowDown":
                if (index < focusableElements.length - 1) {
                    setFocus(index + 1);
                }
                break;

            case "ArrowUp":
                if (index > 0) {
                    setFocus(index - 1);
                }
                break;

            case "Enter":
                focusableElements[index]?.click();
                break;

            case "Return":
                tizen.application.getCurrentApplication().exit();
                break;
        }
    });
}
