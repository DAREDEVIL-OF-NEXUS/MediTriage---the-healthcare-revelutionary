function revealBoxes() {
    const boxes = document.querySelectorAll(
        '.about-mediTriage, .goal, .how-it-works'
    );

    const trigger = window.innerHeight * 0.85;

    boxes.forEach((box) => {
        const top = box.getBoundingClientRect().top;

        if (top < trigger) {
            box.classList.add('show-box');
        }
    });
}

window.addEventListener("scroll", function () {
    const button = document.querySelector(".btn");
    if (button) {
        if (window.scrollY > 500) {
            button.classList.add("stuck");
        } else {
            button.classList.remove("stuck");
        }
    }

    revealBoxes();
});

window.addEventListener("load", revealBoxes);
