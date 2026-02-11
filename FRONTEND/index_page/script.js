window.addEventListener("scroll", function () {
    const button = document.querySelector(".btn");
    if (!button) return;

    if (window.scrollY > 500) {
        button.classList.add("stuck");
    } else {
        button.classList.remove("stuck");
    }
});
