export default function carousel(images, element) {
    const WIDTH = 800;

    (function renderSlider() {
        const slider = document.createElement("div");
        slider.classList.add("slider");
        slider.id = "slider";

        //rendering images
        images.forEach((item, index) => {
            const slide = document.createElement("div");
            slide.classList.add("slide");

            const imgHtml = document.createElement("img");
            imgHtml.src = item.img;
            imgHtml.alt = "image_" + index;
            imgHtml.loading = "lazy";
            slide.append(imgHtml);

            const imgTitle = document.createElement("div");
            imgTitle.innerText = item.title;
            imgTitle.classList.add("imgTitle");
            slide.style.left = index * WIDTH + "px"
            slide.append(imgTitle);

            slider.append(slide);
        });

        //rendering control buttons
        const buttonNext = document.createElement("button");
        buttonNext.classList.add("btn");
        buttonNext.classList.add("btn-next");
        buttonNext.id = "btn-next";
        buttonNext.innerText = ">";

        const buttonPrev = document.createElement("button");
        buttonPrev.classList.add("btn");
        buttonPrev.classList.add("btn-prev");
        buttonPrev.id = "btn-prev";
        buttonPrev.innerText = "<";

        slider.append(buttonNext);
        slider.append(buttonPrev);
        element.append(slider);
    })();


    //carousel logic
    const slides = document.getElementsByClassName("slide");
    const totalSlides = slides.length;

    document.getElementById("btn-prev").addEventListener("click", movePrev);
    document.getElementById("btn-next").addEventListener("click", moveNext);

    let active = 0;
    function moveNext() {
        active = (active == totalSlides - 1) ? 0 : active + 1;
        moveSlides()
    }

    function movePrev() {
        active = (active == 0) ? totalSlides - 1 : active - 1;
        moveSlides()
    }

    function moveSlides() {
        for (let i = 0; i < totalSlides; i++) {
            slides[i].style.left = (i - active) * WIDTH + "px";
        }
    }

    let interval = setInterval(moveNext, 2000);


    //stopping slider on mouseover and resuming on mouseleave
    const slider = document.getElementById("slider");
    slider.addEventListener("mouseover", function() {
        clearInterval(interval);
    });
    slider.addEventListener("mouseleave", function() {
        interval = setInterval(moveNext, 2000);
    });
}
