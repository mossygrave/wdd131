import { services } from "./services.mjs";


function serviceTemplate(service) {
    return `
    <figure class="service">
        <img src="${service.image}" alt="image of ${service.name}" />
        <figcaption>
            <h2><a href="#">${service.name}</a></h2>
            <p class="service__description">${service.description}</p>
        </figcaption>
    </figure>`;
}

function renderServices(serviceList) {
    const mainContainer = document.querySelector("#service_cards");

    const servicesHTML = serviceList.map(service => serviceTemplate(service)).join('');
    mainContainer.innerHTML = `<div class="services-container">${servicesHTML}</div>`;
}


/*

function tagsTemplate(tags) {
    return tags.map(tag => `<li>${tag}</li>`).join('');
}

<ul class="service__tags">
                ${tagsTemplate(service.tags)}
            </ul>

function filterServices(query) {
    return services.filter(service => {
        const lowerQuery = query.toLowerCase();
        return (
            service.name.toLowerCase().includes(lowerQuery) ||
            service.description.toLowerCase().includes(lowerQuery) ||
            service.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
            service.serviceIngredient.some(ingredient => ingredient.toLowerCase().includes(lowerQuery))
        );
    }).sort((a, b) => a.name.localeCompare(b.name));
}

 const searchForm = document.querySelector(".search-form");
 searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const query = document.querySelector("#search").value;
    const filteredservices = filterServices(query);
    renderServices(filteredservices);
}); */


renderServices(services);