document.addEventListener("DOMContentLoaded", () => {
  initializeProjectFilters();
  initializeProjectGalleries();
  initializePageAnimations();
  initializePageTransitions();
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
          card.classList.remove("filter-enter");

          requestAnimationFrame(() => {
            card.classList.add("filter-enter");
          });
        } else {
          card.classList.remove("filter-enter");
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


  lightbox.closeButton.addEventListener(
    "click",
    closeLightbox
  );


  lightbox.previousButton.addEventListener(
    "click",
    previousLightboxImage
  );


  lightbox.nextButton.addEventListener(
    "click",
    nextLightboxImage
  );


  lightbox.container.addEventListener(
    "click",
    (event) => {
      if (event.target === lightbox.container) {
        closeLightbox();
      }
    }
  );


  document.addEventListener(
    "keydown",
    (event) => {
      const isOpen =
        lightbox.container.classList.contains(
          "lightbox-open"
        );

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
    }
  );


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

    stage.className =
      "interactive-gallery-stage";


    const previousButton =
      document.createElement("button");

    previousButton.type = "button";

    previousButton.className =
      "interactive-gallery-arrow interactive-gallery-prev";

    previousButton.setAttribute(
      "aria-label",
      "Previous gallery image"
    );

    previousButton.innerHTML = "&#10094;";


    const nextButton =
      document.createElement("button");

    nextButton.type = "button";

    nextButton.className =
      "interactive-gallery-arrow interactive-gallery-next";

    nextButton.setAttribute(
      "aria-label",
      "Next gallery image"
    );

    nextButton.innerHTML = "&#10095;";


    const imageButton =
      document.createElement("button");

    imageButton.type = "button";

    imageButton.className =
      "interactive-gallery-image-button";

    imageButton.setAttribute(
      "aria-label",
      "Open image in full-screen viewer"
    );


    const mainImage =
      document.createElement("img");

    mainImage.className =
      "interactive-gallery-main-image";


    const zoomHint =
      document.createElement("span");

    zoomHint.className =
      "interactive-gallery-zoom-hint";

    zoomHint.textContent =
      "Click image to zoom";


    imageButton.appendChild(mainImage);
    imageButton.appendChild(zoomHint);

    stage.appendChild(previousButton);
    stage.appendChild(imageButton);
    stage.appendChild(nextButton);


    /* -----------------------------------------
       IMAGE INFORMATION
       ----------------------------------------- */

    const information =
      document.createElement("div");

    information.className =
      "interactive-gallery-info";


    const counter =
      document.createElement("span");

    counter.className =
      "interactive-gallery-counter";


    const caption =
      document.createElement("p");

    caption.className =
      "interactive-gallery-caption";


    information.appendChild(counter);
    information.appendChild(caption);


    /* -----------------------------------------
       THUMBNAILS
       ----------------------------------------- */

    const thumbnailTrack =
      document.createElement("div");

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

      thumbnailButton.appendChild(
        thumbnailImage
      );


      thumbnailButton.addEventListener(
        "click",
        () => {
          currentIndex = index;

          updateGallery();

          thumbnailButton.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
            inline: "center"
          });
        }
      );


      thumbnailButtons.push(
        thumbnailButton
      );

      thumbnailTrack.appendChild(
        thumbnailButton
      );
    });


    /* -----------------------------------------
       UPDATE GALLERY
       ----------------------------------------- */

    function updateGallery() {
      const item = items[currentIndex];

      mainImage.src = item.src;
      mainImage.alt = item.alt;

      caption.textContent =
        item.caption;

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

    previousButton.addEventListener(
      "click",
      () => {
        currentIndex =
          (currentIndex - 1 + items.length) %
          items.length;

        updateGallery();
      }
    );


    nextButton.addEventListener(
      "click",
      () => {
        currentIndex =
          (currentIndex + 1) %
          items.length;

        updateGallery();
      }
    );


    /* -----------------------------------------
       OPEN LIGHTBOX
       ----------------------------------------- */

    imageButton.addEventListener(
      "click",
      () => {
        openLightbox(
          items,
          currentIndex
        );
      }
    );


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
  const container =
    document.createElement("div");

  container.className =
    "project-lightbox";

  container.setAttribute(
    "aria-hidden",
    "true"
  );

  container.setAttribute(
    "aria-label",
    "Full-screen project image viewer"
  );


  const closeButton =
    document.createElement("button");

  closeButton.type = "button";

  closeButton.className =
    "project-lightbox-close";

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


  const content =
    document.createElement("div");

  content.className =
    "project-lightbox-content";


  const image =
    document.createElement("img");

  image.className =
    "project-lightbox-image";


  const bottom =
    document.createElement("div");

  bottom.className =
    "project-lightbox-bottom";


  const counter =
    document.createElement("span");

  counter.className =
    "project-lightbox-counter";


  const caption =
    document.createElement("p");

  caption.className =
    "project-lightbox-caption";


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


/* =========================================
   PAGE ANIMATIONS
   ========================================= */

function initializePageAnimations() {
  const body = document.body;

  if (!body) {
    return;
  }

  const prefersReducedMotion =
    window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

  const pageType =
    getCurrentPageType();

  body.classList.add(
    "animations-ready",
    `page-${pageType}`
  );

  if (prefersReducedMotion) {
    body.classList.add(
      "reduced-motion"
    );

    return;
  }

  const registeredElements =
    new Set();


  /* -----------------------------------------
     REGISTER ANIMATED ELEMENTS
     ----------------------------------------- */

  function registerElements(
    selector,
    options = {}
  ) {
    const {
      direction = "up",
      stagger = 0,
      immediate = false
    } = options;

    const elements =
      Array.from(
        document.querySelectorAll(
          selector
        )
      );

    elements.forEach(
      (element, index) => {
        if (
          registeredElements.has(
            element
          )
        ) {
          return;
        }

        registeredElements.add(
          element
        );

        element.classList.add(
          "reveal-item",
          `reveal-${direction}`
        );


        if (stagger > 0) {
          const delay =
            Math.min(
              index * stagger,
              420
            );

          element.style.setProperty(
            "--reveal-delay",
            `${delay}ms`
          );
        }


        if (immediate) {
          requestAnimationFrame(
            () => {
              element.classList.add(
                "is-visible"
              );
            }
          );
        }
      }
    );
  }


  /* =========================================
     HOME PAGE
     ========================================= */

  if (pageType === "home") {
    registerElements(
      ".hero-kicker",
      {
        direction: "up",
        immediate: true
      }
    );

    registerElements(
      ".hero h1",
      {
        direction: "up",
        immediate: true
      }
    );

    registerElements(
      ".hero-description",
      {
        direction: "up",
        stagger: 70,
        immediate: true
      }
    );

    registerElements(
      ".hero-buttons",
      {
        direction: "up",
        immediate: true
      }
    );

    registerElements(
      ".focus-card",
      {
        direction: "up",
        stagger: 90
      }
    );

    registerElements(
      ".featured-project .section-container > *",
      {
        direction: "up",
        stagger: 80
      }
    );

    registerElements(
      ".home-about .section-container > *",
      {
        direction: "up",
        stagger: 70
      }
    );
  }


  /* =========================================
     ABOUT PAGE
     ========================================= */

  if (pageType === "about") {
    registerElements(
      ".about-hero .section-label",
      {
        direction: "up",
        immediate: true
      }
    );

    registerElements(
      ".about-hero-title span",
      {
        direction: "left",
        stagger: 90,
        immediate: true
      }
    );

    registerElements(
      ".about-hero-description",
      {
        direction: "up",
        immediate: true
      }
    );

    registerElements(
      ".education-card",
      {
        direction: "scale"
      }
    );

    registerElements(
      ".interest-item:nth-child(odd)",
      {
        direction: "left"
      }
    );

    registerElements(
      ".interest-item:nth-child(even)",
      {
        direction: "right"
      }
    );

    registerElements(
      ".goal-card",
      {
        direction: "up",
        stagger: 90
      }
    );

    registerElements(
      ".skill-category",
      {
        direction: "left"
      }
    );

    registerElements(
      ".learning-item",
      {
        direction: "up",
        stagger: 65
      }
    );

    registerElements(
      ".strength-card",
      {
        direction: "up",
        stagger: 90
      }
    );

    registerElements(
      ".next-page-card",
      {
        direction: "up",
        stagger: 80
      }
    );
  }


  /* =========================================
     PROJECTS PAGE
     ========================================= */

  if (pageType === "projects") {
    registerElements(
      ".projects-hero .section-label",
      {
        direction: "up",
        immediate: true
      }
    );

    registerElements(
      ".projects-hero h1",
      {
        direction: "up",
        immediate: true
      }
    );

    registerElements(
      ".projects-hero-description",
      {
        direction: "up",
        immediate: true
      }
    );

    registerElements(
      ".project-filters",
      {
        direction: "up"
      }
    );

    registerElements(
      ".projects-section-heading",
      {
        direction: "up"
      }
    );

    registerElements(
      ".project-card",
      {
        direction: "up",
        stagger: 85
      }
    );

    registerElements(
      ".projects-next-section .section-container > *",
      {
        direction: "up",
        stagger: 70
      }
    );
  }


  /* =========================================
     INDIVIDUAL PROJECT PAGES
     ========================================= */

  if (
    pageType ===
    "project-detail"
  ) {
    registerElements(
      ".back-link",
      {
        direction: "left",
        immediate: true
      }
    );

    registerElements(
      ".project-detail-heading",
      {
        direction: "up",
        immediate: true
      }
    );

    registerElements(
      ".project-detail-intro",
      {
        direction: "up",
        immediate: true
      }
    );

    registerElements(
      ".project-detail-meta > div",
      {
        direction: "up",
        stagger: 70,
        immediate: true
      }
    );

    registerElements(
      ".project-two-column > :first-child",
      {
        direction: "left"
      }
    );

    registerElements(
      ".project-two-column > :last-child",
      {
        direction: "right"
      }
    );

    registerElements(
      ".project-image",
      {
        direction: "scale"
      }
    );

    registerElements(
      ".status-card",
      {
        direction: "up",
        stagger: 75
      }
    );

    registerElements(
      ".planned-feature-grid > div",
      {
        direction: "up",
        stagger: 70
      }
    );

    registerElements(
      ".system-row",
      {
        direction: "left",
        stagger: 45
      }
    );

    registerElements(
      ".project-note",
      {
        direction: "left"
      }
    );

    registerElements(
      ".development-gallery",
      {
        direction: "scale"
      }
    );

    registerElements(
      ".project-navigation-card",
      {
        direction: "up",
        stagger: 100
      }
    );
  }


  /* =========================================
     EXPERIENCE PAGE
     ========================================= */

  if (
    pageType ===
    "experience"
  ) {
    registerElements(
      ".project-detail-heading",
      {
        direction: "up",
        immediate: true
      }
    );

    registerElements(
      ".project-detail-hero .project-detail-text",
      {
        direction: "up",
        immediate: true
      }
    );

    registerElements(
      ".project-two-column > :first-child",
      {
        direction: "left"
      }
    );

    registerElements(
      ".project-two-column > :last-child",
      {
        direction: "right"
      }
    );

    registerElements(
      ".project-visual-section .project-image",
      {
        direction: "up",
        stagger: 110
      }
    );

    registerElements(
      ".status-card",
      {
        direction: "up",
        stagger: 85
      }
    );
  }


  /* =========================================
     RESUME PAGE
     ========================================= */

  if (
    pageType ===
    "resume"
  ) {
    registerElements(
      ".project-detail-heading",
      {
        direction: "up",
        immediate: true
      }
    );

    registerElements(
      ".project-detail-hero .project-detail-text",
      {
        direction: "up",
        immediate: true
      }
    );

    registerElements(
      ".resume-actions",
      {
        direction: "up",
        immediate: true
      }
    );

    registerElements(
      ".resume-document",
      {
        direction: "scale"
      }
    );

    registerElements(
      ".resume-section",
      {
        direction: "up",
        stagger: 55
      }
    );

    registerElements(
      ".resume-pdf-frame",
      {
        direction: "scale"
      }
    );
  }


  /* =========================================
     CONTACT PAGE
     ========================================= */

  if (
    pageType ===
    "contact"
  ) {
    registerElements(
      ".project-detail-heading",
      {
        direction: "up",
        immediate: true
      }
    );

    registerElements(
      ".contact-intro",
      {
        direction: "up",
        immediate: true
      }
    );

    registerElements(
      ".contact-card",
      {
        direction: "up",
        stagger: 90
      }
    );

    registerElements(
      ".project-two-column > :first-child",
      {
        direction: "left"
      }
    );

    registerElements(
      ".contact-opportunities",
      {
        direction: "right"
      }
    );

    registerElements(
      ".contact-tag",
      {
        direction: "up",
        stagger: 45
      }
    );

    registerElements(
      ".direct-contact-box",
      {
        direction: "scale"
      }
    );
  }


  /* =========================================
     GENERIC FOOTER
     ========================================= */

  registerElements(
    ".site-footer",
    {
      direction: "up"
    }
  );


  /* =========================================
     SCROLL REVEAL OBSERVER
     ========================================= */

  const pendingElements =
    Array.from(
      document.querySelectorAll(
        ".reveal-item:not(.is-visible)"
      )
    );

  if (
    pendingElements.length === 0
  ) {
    return;
  }


  /*
    Fallback for browsers that do not
    support IntersectionObserver.
  */

  if (
    !(
      "IntersectionObserver"
      in window
    )
  ) {
    pendingElements.forEach(
      (element) => {
        element.classList.add(
          "is-visible"
        );
      }
    );

    return;
  }


  const observer =
    new IntersectionObserver(
      (entries) => {
        entries.forEach(
          (entry) => {
            if (
              !entry.isIntersecting
            ) {
              return;
            }

            entry.target.classList.add(
              "is-visible"
            );

            observer.unobserve(
              entry.target
            );
          }
        );
      },
      {
        threshold: 0.12,
        rootMargin:
          "0px 0px -8% 0px"
      }
    );


  pendingElements.forEach(
    (element) => {
      observer.observe(
        element
      );
    }
  );
}


/* =========================================
   PAGE TYPE DETECTION
   ========================================= */

function getCurrentPageType() {
  const pathname =
    window.location.pathname.toLowerCase();

  const filename =
    pathname.split("/").pop() ||
    "index.html";


  /*
    Anything inside /projects/
    is treated as an individual
    project detail page.
  */

  if (
    pathname.includes(
      "/projects/"
    ) &&
    filename !==
      "projects.html"
  ) {
    return "project-detail";
  }


  if (
    filename === "" ||
    filename === "index.html"
  ) {
    return "home";
  }


  if (
    filename === "about.html"
  ) {
    return "about";
  }


  if (
    filename ===
      "projects.html" ||
    filename ===
      "projects-current.html" ||
    filename ===
      "projects-early.html" ||
    filename ===
      "projects-future.html"
  ) {
    return "projects";
  }


  if (
    filename ===
    "experience.html"
  ) {
    return "experience";
  }


  if (
    filename ===
    "resume.html"
  ) {
    return "resume";
  }


  if (
    filename ===
    "contact.html"
  ) {
    return "contact";
  }


  return "general";
}


/* =========================================
   INTERNAL PAGE TRANSITIONS
   ========================================= */

function initializePageTransitions() {
  const body =
    document.body;

  if (!body) {
    return;
  }


  const prefersReducedMotion =
    window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;


  if (
    prefersReducedMotion
  ) {
    return;
  }


  const links =
    document.querySelectorAll(
      "a[href]"
    );


  links.forEach(
    (link) => {
      link.addEventListener(
        "click",
        (event) => {
          /*
            Do not interrupt:
            - right clicks
            - new tab shortcuts
            - downloads
            - external links
            - phone links
            - email links
            - anchor jumps
          */

          if (
            event.defaultPrevented ||
            event.button !== 0 ||
            event.metaKey ||
            event.ctrlKey ||
            event.shiftKey ||
            event.altKey
          ) {
            return;
          }


          const href =
            link.getAttribute(
              "href"
            );


          if (
            !href ||
            href.startsWith("#") ||
            href.startsWith(
              "mailto:"
            ) ||
            href.startsWith(
              "tel:"
            ) ||
            link.hasAttribute(
              "download"
            ) ||
            link.target ===
              "_blank"
          ) {
            return;
          }


          let destination;


          try {
            destination =
              new URL(
                link.href,
                window.location.href
              );
          } catch {
            return;
          }


          /*
            Ignore external websites.
          */

          if (
            destination.origin !==
            window.location.origin
          ) {
            return;
          }


          /*
            If it is only jumping to
            another anchor on the same
            page, keep normal behavior.
          */

          if (
            destination.pathname ===
              window.location.pathname &&
            destination.search ===
              window.location.search &&
            destination.hash
          ) {
            return;
          }


          event.preventDefault();


          /*
            Trigger the CSS page-exit
            animation.
          */

          body.classList.add(
            "page-exit"
          );


          /*
            Wait for the short animation
            before loading the next page.
          */

          window.setTimeout(
            () => {
              window.location.href =
                destination.href;
            },
            220
          );
        }
      );
    }
  );


  /*
    This matters when the browser
    restores a page using its back/forward
    cache.
  */

  window.addEventListener(
    "pageshow",
    () => {
      body.classList.remove(
        "page-exit"
      );
    }
  );
}