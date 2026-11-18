const selectElement = document.getElementById('theme-selector');

// Function to change the theme
function changeTheme(event) {
    const selectedTheme = event.target.value; // Get the selected value
    const logo = document.getElementById('logo'); // Select the logo element

    if (selectedTheme === 'dark') {
        document.body.classList.add('dark'); // Add the dark class to the body
        logo.src = 'byui-logo_white.png'; // Update to the white logo
    } else {
        document.body.classList.remove('dark'); // Remove the dark class
        logo.src = 'byui-logo_blue.webp'; // Update to the blue logo
    }
}

// Add event listener to the select element
selectElement.addEventListener('change', changeTheme);