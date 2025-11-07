export function openTizenKeyboard(inputElement, callback) {
    if (!window.webapis || !webapis.tvinputdevice) {
        console.warn("Tizen IME not available");
        return;
    }

    try {
        const ime = webapis.tvinputdevice.getKeyboard();

        ime.setInputBox(inputElement);
        ime.show();

        ime.setOnCompleteCallback(function (value) {
            callback(value);   // send typed text back
        });
    } catch (err) {
        console.error("IME Error:", err);
    }
}
