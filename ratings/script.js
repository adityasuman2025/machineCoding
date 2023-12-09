const ratingTextEle = document.getElementById("ratingText");

const ratingsEle = document.getElementById("ratings");
ratingsEle.addEventListener("click", handleRatingsClick);

function handleRatingsClick({ target }) {
    const { id } = target.dataset || {};
    if (id) {
        const rating = 5 - id + 1;
        ratingTextEle.innerText = `You rated ${rating}`;

        for (let i = 5; i >= 0; i--) {
            const starEle = document.getElementById("start_" + i);
            if (i >= id) {
                starEle.classList.add("selected")
            } else {
                starEle.classList.remove("selected")
            }
        }
    }
}