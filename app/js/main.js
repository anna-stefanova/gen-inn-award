try {
    const swiper = new Swiper(".footerSwiper", {
        slidesPerView: 3,
        grid: {
            rows: 2,
        },
        speed: 2500,
        spaceBetween: 20,
        autoplay: {
            delay: 1500,
            disableOnInteraction: false,
        },
        slidesPerGroupSkip: 1,
    });
} catch (err) {
    console.log(err);
}

try {
    const Keyboard = window.SimpleKeyboard.default;
    const KeyboardLayouts = window.SimpleKeyboardLayouts.default;

    /**
     * Available layouts
     * https://github.com/hodgef/simple-keyboard-layouts/tree/master/src/lib/layouts
     */
    const layout = new KeyboardLayouts().get("russian");

    const myKeyboard = new Keyboard({
        onChange: input => onChange(input),
        onKeyPress: button => onKeyPress(button),
        ...layout
    });

    function onChange(input) {
        document.querySelector(".search-page__input").value = input;
        console.log("Input changed", input);
    }

    function onKeyPress(button) {
        console.log("Button pressed", button);
        if (button === "{shift}" || button === "{lock}") handleShift();
    }

    function handleShift() {
        let currentLayout = myKeyboard.options.layoutName;
        let shiftToggle = currentLayout === "default" ? "shift" : "default";

        myKeyboard.setOptions({
            layoutName: shiftToggle
        });
    }
} catch (e) {
    console.log(e);
}



