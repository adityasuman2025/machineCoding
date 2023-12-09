const content = document.getElementById("content"); // target element

const incrementBy = 20;
let counter = 20; // intially there were only 20 cards

const intersectionObserver = new IntersectionObserver(function(enteries) {
    const lastChild = enteries[0];

    if (!lastChild.isIntersecting) return; // if last child is not intersecting i.e still not in view port // then do nothing

    // if last child is intersecting i.e has come on view port
    loadMore(); // render more cards

    intersectionObserver.unobserve(lastChild.target); // removing observer from this/current last child 
}, {
    root: content, // target element i.e scrollable element (where we want infinite scrolling)
    rootMargin: "10px" // will load next content before 10px of the last element
});

function loadMore() {
    counter += incrementBy;

    renderCards(incrementBy);
}

function renderCards(n) { // append more cards in the target element
    for (let i = 1; i <= n; i++) {
        const card = document.createElement("div");
        card.classList.add("card");
        card.innerText = "card " + ((counter - n) + i);
        card.dataset.key = (counter - n) + i;

        content.append(card);
    }

    intersectionObserver.observe(document.querySelector(".card:last-child")); // adding observer to the new last child (new last child which comes after rendering cards
}
renderCards(counter);