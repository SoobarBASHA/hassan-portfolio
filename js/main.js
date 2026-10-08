document.addEventListener("DOMContentLoaded", () => {
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
});