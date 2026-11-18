document.addEventListener("DOMContentLoaded", function () {
    let participantCount = 1;
    
    document.getElementById("form").addEventListener("submit", function (event) {
        event.preventDefault(); // Prevent actual form submission
        
        // Find all fee inputs and sum their values
        let totalFees = 0;
        document.querySelectorAll("input.fee").forEach(input => {
            totalFees += parseFloat(input.value) || 0;
        });
        
        // Get the adult name from the form
        let adultName = document.getElementById("adultName").value;
        
        // Hide the form and show the summary
        document.getElementById("form").style.display = "none";
        let summaryElement = document.getElementById("summary");
        summaryElement.style.display = "block";
        
        // Insert summary message
        summaryElement.innerHTML = `Thank you ${adultName} for registering. You have registered ${participantCount} participants and owe $${totalFees.toFixed(2)} in Fees.`;
    });
    
    document.getElementById("addParticipant").addEventListener("click", function () {
        participantCount++;
        
        let participantSection = document.querySelector(".participant1");
        if (participantSection) {
            let newSection = participantSection.cloneNode(true);
            newSection.className = `participant${participantCount}`;
            newSection.id = `participant${participantCount}`;
            
            // Update IDs of cloned elements
            newSection.querySelectorAll("[id]").forEach(el => {
                let baseId = el.id.split("_")[0]; // Get the base ID without any suffix
                let newId = `${baseId}_${participantCount}`;
                el.id = newId;
                if (el.hasAttribute("for")) {
                    el.setAttribute("for", newId);
                }
                if (el.name) {
                    el.name = `${baseId}_${participantCount}`;
                }
            });
            
            document.getElementById("participants").appendChild(newSection);
        }
    });
});
