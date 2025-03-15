import { recipes } from "./recipes.mjs";

function getRandomListEntry(arr) {
    const randomIndex = Math.floor(Math.random() * arr.length);
    return arr[randomIndex];
}

function recipeTemplate(recipe) {
    return `
    <figure class="recipe">
        <img src="${recipe.image}" alt="image of ${recipe.name}" />
        <figcaption>
            <ul class="recipe__tags">
                ${tagsTemplate(recipe.tags)}
            </ul>
            <h2><a href="#">${recipe.name}</a></h2>
            ${ratingTemplate(recipe.rating)}
            <p class="recipe__description">${recipe.description}</p>
        </figcaption>
    </figure>`;
}

function tagsTemplate(tags) {
    return tags.map(tag => `<li>${tag}</li>`).join('');
}

function ratingTemplate(rating) {
    let html = `<span class="rating" role="img" aria-label="Rating: ${rating} out of 5 stars">`;
    for (let i = 1; i <= 5; i++) {
        html += i <= rating ? `<span aria-hidden="true" class="icon-star">⭐</span>`
                            : `<span aria-hidden="true" class="icon-star-empty">☆</span>`;
    }
    html += `</span>`;
    return html;
}

function renderRecipes(recipeList) {
    const mainContainer = document.querySelector("main");

    const recipesHTML = recipeList.map(recipe => recipeTemplate(recipe)).join('');
    mainContainer.innerHTML = `<div class="recipes-container">${recipesHTML}</div>`;
}


function init() {
    const recipe = getRandomListEntry(recipes);
    renderRecipes([recipe]);
}
init();

function filterRecipes(query) {
    return recipes.filter(recipe => {
        const lowerQuery = query.toLowerCase();
        return (
            recipe.name.toLowerCase().includes(lowerQuery) ||
            recipe.description.toLowerCase().includes(lowerQuery) ||
            recipe.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
            recipe.recipeIngredient.some(ingredient => ingredient.toLowerCase().includes(lowerQuery))
        );
    }).sort((a, b) => a.name.localeCompare(b.name));
}

const searchForm = document.querySelector(".search-form");
searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const query = document.querySelector("#search").value;
    const filteredRecipes = filterRecipes(query);
    renderRecipes(filteredRecipes);
});

