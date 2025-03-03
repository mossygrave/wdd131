document.addEventListener("DOMContentLoaded", function () {
    let participantCount = 1;
    
    document.getElementById("form").addEventListener("submit", function (event) {
        event.preventDefault(); // Prevent actual form submission
        participantCount++;
        
        let participantSection = document.querySelector(".participant1");
        if (participantSection) {
            let newSection = participantSection.cloneNode(true);
            newSection.classList.remove(`participant1${participantCount}`);
            newSection.classList.add(`participant${participantCount}`);
            
            // Update IDs of cloned elements
            newSection.querySelectorAll("[id]").forEach(el => {
                let newId = el.id + "_" + participantCount;
                el.id = newId;
            });
            
            document.getElementById("participants").appendChild(newSection);
        }
    });
});