document.addEventListener("DOMContentLoaded", function() {
    const sortSelect = document.getElementById("sort");
    const ageSelect = document.getElementById("age");
    const genreSelect = document.getElementById("genre");
    const ratingSelect = document.getElementById("rating");

    // Selection options
    const sortOptions = ["Newest", "Oldest", "Highest Rated"];
    const ageOptions = ["All", "0-5", "6-9", "10-14", "15+"];
    const genreOptions = ["All", "Fantasy", "Mystery", "Science Fiction", "Non-Fiction"];
    const ratingOptions = ["All", "★★★★★", "★★★★", "★★★", "★★", "★"];

    function populateSelect(select, options) {
        options.forEach(option => {
            const opt = document.createElement("option");
            opt.value = option;
            opt.textContent = option;
            select.appendChild(opt);
        });
    }

    populateSelect(sortSelect, sortOptions);
    populateSelect(ageSelect, ageOptions);
    populateSelect(genreSelect, genreOptions);
    populateSelect(ratingSelect, ratingOptions);

    // Event listener for filtering
    document.querySelector(".filters").addEventListener("change", function() {
        console.log("Filter changed!");
    });
});

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
		stars: '****'
	},
	{
		id: 2,
		title: 'Magnus Chase Book One: Sword of Summer',
		date: 'December 12, 2021',
		description:
			'The anticipated new novel by Rick Riordan. After Greek mythology (Percy Jackson), Greek/Roman (Heroes of Olympus), and Egyptian (Kane Chronicles), Rick decides to try his hand with Norse Mythology, and the end result is good.',
		imgSrc:
			'https://books.google.com/books/content/images/frontcover/xWuyBAAAQBAJ?fife=w300',
		imgAlt: 'Book cover for Magnus Chase 1',
		ages: '12-16',
		genre: 'Fantasy',
		stars: '⭐⭐⭐⭐'
	}
]