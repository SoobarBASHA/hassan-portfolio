document.addEventListener("DOMContentLoaded", () => {
  initializeProjectFilters();
  initializeProjectGalleries();
});


/* =========================================
   PROJECT FILTERS
   ========================================= */

function initializeProjectFilters() {
  const filterButtons = document.querySelectorAll(".project-filter");
  const projectCards = document.querySelectorAll("[data-category]");

  if (filterButtons.length === 0 || projectCards.length === 0) {
    return;
  }

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const selectedFilter = button.dataset.filter;

      filterButtons.forEach((filterButton) => {
        filterButton.classList.remove("active-filter");
      });

      button.classList.add("active-filter");

      projectCards.forEach((card) => {
        const categories = card.dataset.category
          .split(" ")
          .map((category) => category.trim());

        const shouldShow =
          selectedFilter === "all" ||
          categories.includes(selectedFilter);

        if (shouldShow) {
          card.classList.remove("project-hidden");
        } else {
          card.classList.add("project-hidden");
        }
      });
    });
  });
}


/* =========================================
   PROJECT GALLERIES
   ========================================= */

function initializeProjectGalleries() {
  const galleries = document.querySelectorAll(".development-gallery");

  if (galleries.length === 0) {
    return;
  }

  const lightbox = createLightbox();

  let activeLightboxItems = [];
  let activeLightboxIndex = 0;


  /* -----------------------------------------
     LIGHTBOX
     ----------------------------------------- */

  function updateLightbox() {
    if (activeLightboxItems.length === 0) {
      return;
    }

    const item = activeLightboxItems[activeLightboxIndex];

    lightbox.image.src = item.src;
    lightbox.image.alt = item.alt;
    lightbox.caption.textContent = item.caption;

    lightbox.counter.textContent =
      `${activeLightboxIndex + 1} / ${activeLightboxItems.length}`;
  }


  function openLightbox(items, index) {
    activeLightboxItems = items;
    activeLightboxIndex = index;

    updateLightbox();

    lightbox.container.classList.add("lightbox-open");
    lightbox.container.setAttribute("aria-hidden", "false");

    document.body.classList.add("lightbox-body-lock");

    lightbox.closeButton.focus();
  }


  function closeLightbox() {
    lightbox.container.classList.remove("lightbox-open");
    lightbox.container.setAttribute("aria-hidden", "true");

    document.body.classList.remove("lightbox-body-lock");
  }


  function previousLightboxImage() {
    activeLightboxIndex =
      (activeLightboxIndex - 1 + activeLightboxItems.length) %
      activeLightboxItems.length;

    updateLightbox();
  }


  function nextLightboxImage() {
    activeLightboxIndex =
      (activeLightboxIndex + 1) %
      activeLightboxItems.length;

    updateLightbox();
  }


  lightbox.closeButton.addEventListener("click", closeLightbox);

  lightbox.previousButton.addEventListener(
    "click",
    previousLightboxImage
  );

  lightbox.nextButton.addEventListener(
    "click",
    nextLightboxImage
  );


  lightbox.container.addEventListener("click", (event) => {
    if (event.target === lightbox.container) {
      closeLightbox();
    }
  });


  document.addEventListener("keydown", (event) => {
    const isOpen =
      lightbox.container.classList.contains("lightbox-open");

    if (!isOpen) {
      return;
    }

    if (event.key === "Escape") {
      closeLightbox();
    }

    if (event.key === "ArrowLeft") {
      previousLightboxImage();
    }

    if (event.key === "ArrowRight") {
      nextLightboxImage();
    }
  });


  /* -----------------------------------------
     BUILD EACH PROJECT GALLERY
     ----------------------------------------- */

  galleries.forEach((gallery) => {
    const originalFigures = Array.from(
      gallery.querySelectorAll(".gallery-item")
    );

    const items = originalFigures
      .map((figure) => {
        const image = figure.querySelector("img");

        if (!image) {
          return null;
        }

        const captionElement =
          figure.querySelector("figcaption");

        return {
          src: image.getAttribute("src"),
          alt:
            image.getAttribute("alt") ||
            "Project gallery image",
          caption:
            captionElement?.textContent.trim() ||
            ""
        };
      })
      .filter(Boolean);


    /*
      Ignore galleries that contain no actual images.
    */

    if (items.length === 0) {
      return;
    }


    /*
      Remove the original grid contents.
      We already saved the image information above.
    */

    gallery.innerHTML = "";

    gallery.classList.add("interactive-gallery");


    let currentIndex = 0;


    /* -----------------------------------------
       LARGE IMAGE AREA
       ----------------------------------------- */

    const stage = document.createElement("div");
    stage.className = "interactive-gallery-stage";


    const previousButton = document.createElement("button");

    previousButton.type = "button";
    previousButton.className =
      "interactive-gallery-arrow interactive-gallery-prev";

    previousButton.setAttribute(
      "aria-label",
      "Previous gallery image"
    );

    previousButton.innerHTML = "&#10094;";


    const nextButton = document.createElement("button");

    nextButton.type = "button";
    nextButton.className =
      "interactive-gallery-arrow interactive-gallery-next";

    nextButton.setAttribute(
      "aria-label",
      "Next gallery image"
    );

    nextButton.innerHTML = "&#10095;";


    const imageButton = document.createElement("button");

    imageButton.type = "button";
    imageButton.className = "interactive-gallery-image-button";

    imageButton.setAttribute(
      "aria-label",
      "Open image in full-screen viewer"
    );


    const mainImage = document.createElement("img");

    mainImage.className = "interactive-gallery-main-image";


    const zoomHint = document.createElement("span");

    zoomHint.className = "interactive-gallery-zoom-hint";
    zoomHint.textContent = "Click image to zoom";


    imageButton.appendChild(mainImage);
    imageButton.appendChild(zoomHint);


    stage.appendChild(previousButton);
    stage.appendChild(imageButton);
    stage.appendChild(nextButton);


    /* -----------------------------------------
       IMAGE INFORMATION
       ----------------------------------------- */

    const information = document.createElement("div");
    information.className = "interactive-gallery-info";


    const counter = document.createElement("span");
    counter.className = "interactive-gallery-counter";


    const caption = document.createElement("p");
    caption.className = "interactive-gallery-caption";


    information.appendChild(counter);
    information.appendChild(caption);


    /* -----------------------------------------
       THUMBNAILS
       ----------------------------------------- */

    const thumbnailTrack = document.createElement("div");

    thumbnailTrack.className =
      "interactive-gallery-thumbnails";

    thumbnailTrack.setAttribute(
      "aria-label",
      "Gallery thumbnails"
    );


    const thumbnailButtons = [];


    items.forEach((item, index) => {
      const thumbnailButton =
        document.createElement("button");

      thumbnailButton.type = "button";

      thumbnailButton.className =
        "interactive-gallery-thumbnail";

      thumbnailButton.setAttribute(
        "aria-label",
        `View image ${index + 1}`
      );


      const thumbnailImage =
        document.createElement("img");

      thumbnailImage.src = item.src;
      thumbnailImage.alt = "";

      thumbnailButton.appendChild(thumbnailImage);


      thumbnailButton.addEventListener("click", () => {
        currentIndex = index;

        updateGallery();

        thumbnailButton.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center"
        });
      });


      thumbnailButtons.push(thumbnailButton);

      thumbnailTrack.appendChild(thumbnailButton);
    });


    /* -----------------------------------------
       UPDATE GALLERY
       ----------------------------------------- */

    function updateGallery() {
      const item = items[currentIndex];

      mainImage.src = item.src;
      mainImage.alt = item.alt;

      caption.textContent = item.caption;

      counter.textContent =
        `${currentIndex + 1} / ${items.length}`;


      thumbnailButtons.forEach(
        (thumbnailButton, index) => {
          thumbnailButton.classList.toggle(
            "active-gallery-thumbnail",
            index === currentIndex
          );
        }
      );
    }


    /* -----------------------------------------
       PREVIOUS / NEXT
       ----------------------------------------- */

    previousButton.addEventListener("click", () => {
      currentIndex =
        (currentIndex - 1 + items.length) %
        items.length;

      updateGallery();
    });


    nextButton.addEventListener("click", () => {
      currentIndex =
        (currentIndex + 1) %
        items.length;

      updateGallery();
    });


    /* -----------------------------------------
       OPEN LIGHTBOX
       ----------------------------------------- */

    imageButton.addEventListener("click", () => {
      openLightbox(items, currentIndex);
    });


    /* -----------------------------------------
       ADD EVERYTHING TO PAGE
       ----------------------------------------- */

    gallery.appendChild(stage);
    gallery.appendChild(information);
    gallery.appendChild(thumbnailTrack);


    updateGallery();
  });
}


/* =========================================
   CREATE FULL-SCREEN LIGHTBOX
   ========================================= */

function createLightbox() {
  const container = document.createElement("div");

  container.className = "project-lightbox";

  container.setAttribute("aria-hidden", "true");

  container.setAttribute(
    "aria-label",
    "Full-screen project image viewer"
  );


  const closeButton = document.createElement("button");

  closeButton.type = "button";

  closeButton.className = "project-lightbox-close";

  closeButton.setAttribute(
    "aria-label",
    "Close full-screen image"
  );

  closeButton.innerHTML = "&times;";


  const previousButton =
    document.createElement("button");

  previousButton.type = "button";

  previousButton.className =
    "project-lightbox-arrow project-lightbox-prev";

  previousButton.setAttribute(
    "aria-label",
    "Previous image"
  );

  previousButton.innerHTML = "&#10094;";


  const nextButton =
    document.createElement("button");

  nextButton.type = "button";

  nextButton.className =
    "project-lightbox-arrow project-lightbox-next";

  nextButton.setAttribute(
    "aria-label",
    "Next image"
  );

  nextButton.innerHTML = "&#10095;";


  const content = document.createElement("div");

  content.className = "project-lightbox-content";


  const image = document.createElement("img");

  image.className = "project-lightbox-image";


  const bottom = document.createElement("div");

  bottom.className = "project-lightbox-bottom";


  const counter = document.createElement("span");

  counter.className = "project-lightbox-counter";


  const caption = document.createElement("p");

  caption.className = "project-lightbox-caption";


  bottom.appendChild(counter);
  bottom.appendChild(caption);


  content.appendChild(image);
  content.appendChild(bottom);


  container.appendChild(closeButton);
  container.appendChild(previousButton);
  container.appendChild(content);
  container.appendChild(nextButton);


  document.body.appendChild(container);


  return {
    container,
    closeButton,
    previousButton,
    nextButton,
    image,
    counter,
    caption
  };
}