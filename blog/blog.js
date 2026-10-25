const articles = [
    {
        id: 1,
        title: 'Septimus Heap Book One: Magyk',
        date: 'July 5, 2022',
        description:
            'If you enjoy stories about seventh sons of seventh sons and magyk this is the book for you.',
        imgSrc: 'https://upload.wikimedia.org/wikipedia/en/5/5f/Magkycover2.jpg',
        imgAlt: 'Book cover for Septimus Heap 1',
        ages: '10-14',
        genre: 'Fantasy',
        stars: '⭐⭐⭐⭐'
    },
    {
        id: 2,
        title: 'Magnus Chase Book One: Sword of Summer',
        date: 'December 12, 2021',
        description:
            'The anticipated new novel by Rick Riordan. After Greek mythology (Percy Jackson), Greek/Roman (Heroes of Olympus), and Egyptian (Kane Chronicles), Rick decides to try his hand with Norse Mythology, and the end result is good.',
        imgSrc: 'https://books.google.com/books/content/images/frontcover/xWuyBAAAQBAJ?fife=w300',
        imgAlt: 'Book cover for Magnus Chase 1',
        ages: '12-16',
        genre: 'Fantasy',
        stars: '⭐⭐⭐⭐'
    },
    {
        id: 3,
        title: 'Belgariad Book One: Pawn of Prophecy',
        date: 'Feb 12, 2022',
        description:
            "A fierce dispute among the Gods and the theft of a powerful Orb leaves the World divided into five kingdoms. Young Garion, with his 'Aunt Pol' and an elderly man calling himself Wolf --a father and daughter granted near-immortality by one of the Gods -- set out on a complex mission.",
        imgSrc: 'https://images-na.ssl-images-amazon.com/images/I/41ZxXA+nInL.jpg',
        imgAlt: 'Book cover for Pawn of Prophecy',
        ages: '12-16',
        genre: 'Fantasy',
        stars: '⭐⭐⭐⭐⭐'
    }
];

function getDateTime(dateString) {
    return new Date(dateString).toISOString().split('T')[0];
}

function renderArticles() {
    const articlesContainer = document.querySelector('#articles');

    if (!articlesContainer) return;

    articlesContainer.replaceChildren(
        ...articles.map((article) => {
            const entry = document.createElement('article');
            entry.className = 'book-entry';

            const meta = document.createElement('aside');
            meta.className = 'book-meta';
            meta.setAttribute('aria-label', 'Book details');
            meta.innerHTML = `
                <time datetime="${getDateTime(article.date)}">${article.date}</time>
                <p>${article.ages}</p>
                <p>${article.genre}</p>
                <p class="rating" aria-label="Rated ${[...article.stars].length} out of 5 stars">
                    <span aria-hidden="true">${article.stars}</span>
                </p>
            `;

            const review = document.createElement('div');
            review.className = 'book-review';
            review.innerHTML = `
                <h2>${article.title}</h2>
                <figure>
                    <img src="${article.imgSrc}" alt="${article.imgAlt}" width="150" height="225">
                </figure>
                <p>${article.description}</p>
            `;

            entry.append(meta, review);
            return entry;
        })
    );
}

document.addEventListener('DOMContentLoaded', renderArticles);
