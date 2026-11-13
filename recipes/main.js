const recipes = window.recipes;

function recipeTemplate(recipe) {
    return `
    <figure class="recipe">
        <img src="${recipe.image}" alt="image of ${recipe.name}" />
        <figcaption>
            <ul class="recipe__tags">${tagsTemplate(recipe.tags)}</ul>
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
        html += i <= rating
            ? `<span aria-hidden="true" class="icon-star">⭐</span>`
            : `<span aria-hidden="true" class="icon-star-empty">☆</span>`;
    }
    return `${html}</span>`;
}

function renderRecipes(recipeList) {
    const mainContainer = document.querySelector("main");
    if (!recipeList.length) {
        mainContainer.innerHTML = '<p class="empty-state">No recipes found. Try another search.</p>';
        return;
    }
    const recipesHTML = recipeList.map(recipe => recipeTemplate(recipe)).join('');
    mainContainer.innerHTML = `<div class="recipes-container">${recipesHTML}</div>`;
}

const appleCrisp = recipes.find(recipe => recipe.name === "Apple Crisp") || recipes[0];
renderRecipes([appleCrisp]);

function filterRecipes(query) {
    const lowerQuery = query.toLowerCase();
    return recipes.filter(recipe => recipe.name.toLowerCase().includes(lowerQuery)
        || recipe.description.toLowerCase().includes(lowerQuery)
        || recipe.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
        || recipe.recipeIngredient.some(ingredient => ingredient.toLowerCase().includes(lowerQuery)))
        .sort((a, b) => a.name.localeCompare(b.name));
}

document.querySelector(".search-form").addEventListener("submit", event => {
    event.preventDefault();
    const query = document.querySelector("#search").value.trim();
    renderRecipes(query ? filterRecipes(query) : [appleCrisp]);
});
