const getOtherDetails = async (userName) => {
    try {
        const url = `https://alfa-leetcode-api.onrender.com/${userName}/solved`;
        const res = await fetch(url);
       
        const data = await res.json();
        
        
        // Check for specific error conditions in the response data
        if (data.errors && data.errors.length > 0) {
            // Handle specific error condition (e.g., invalid LeetCode ID)
            throw new Error(data.errors[0]);
        }
        return data; 

    } catch (error) {
        console.log(`Failed to fetch ooooooooooother details for ${userName}:`, error);
        const errorElement = document.querySelector('#error_message');
        errorElement.innerText = `Error: ${error}`;

        return null;
    }
};


const getQuestionsSubmittedInLast24Hours = async (userName) => {
    try {
        const url = `https://alfa-leetcode-api.onrender.com/${userName}/calendar`;
        const res = await fetch(url);
        // if (!res.ok) {
        //     const errorMessage = await res.text();
        //     return { error: errorMessage };
        // }
        // else{
        const data = await res.json();
        const submissionCalendar = JSON.parse(data.submissionCalendar);
        const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
        const oneDayAgo = currentTime - (24 * 60 * 60); // Time 24 hours ago
        let questionsSubmitted = 0;
        for (const timestamp in submissionCalendar) {
            const submissionTime = parseInt(timestamp);
            if (submissionTime >= oneDayAgo && submissionTime <= currentTime) {
                questionsSubmitted += submissionCalendar[timestamp];
            }
        }
        return questionsSubmitted;
        // }
        
    } catch (error) {
        console.log(`Failed to fetch today's submissions for ${userName}:`, error);
        return null;
    }
};

// Function to fetch details for a single LeetCode ID
const getDetails = async (userName) => {
    try {
        const data = await getOtherDetails(userName);
        // console.log("ggggggg");
        console.log(data);
        // if (data.errors) {
        //     // Handle specific error returned by the API
        //     return { userName, error: data.errors[0] };
        // }
        if(data==null){
            const errorElement = document.querySelector('#error_message');
            errorElement.innerText = `Failed to fetch details for ${username}. Please check your LeetCode ID and try again.`;
            return;
        }
        const questionsSubmitted = await getQuestionsSubmittedInLast24Hours(userName);
        console.log(questionsSubmitted);
        
        const userDetails = {
            userName: userName,
            solvedProblem: data.solvedProblem,
            easySolved: data.easySolved,
            mediumSolved: data.mediumSolved,
            hardSolved: data.hardSolved,
            questionsSubmitted: questionsSubmitted !== null ? questionsSubmitted : "Data unavailable"
        };
        localStorage.setItem(userName, JSON.stringify(userDetails));
        return userDetails;
    } catch (error) {
        console.log(`gDts---Failed to fetch details for ${userName}:`, error.message);
        const errorElement = document.querySelector('#error_message');
        errorElement.innerText = `Error: ${error.message} OR Too many requests from this IP (Revisit after an hour)`;
        return null;
    }
};

// Function to fetch details for all stored LeetCode IDs
const getAllDetails = async (userNames) => {


    

    const details = [];
    for (const userName of userNames) {
        // Check if details are stored in local storage
        const storedDetails = JSON.parse(localStorage.getItem(userName));
        if (storedDetails) {
            details.push(storedDetails);
        } 
        else {
            // Fetch details from API if not found in local storage
            const detail = await getDetails(userName);
            
            if (detail) {
                details.push(detail);
            }
        }
    }
    return details;
};
const getAllRefreshedDetails = async (userNames) => {



    


    const details = [];
    for (const userName of userNames) {
        // Check if details are stored in local storage
        const storedDetails = JSON.parse(localStorage.getItem(userName));
        
        // Fetch details from API if not found in local storage
        const detail = await getDetails(userName);
            
        if (detail) {
            details.push(detail);
        }
    
    }
    return details;
};



// Function to display LeetCode details
const displayDetails = (details) => {
    const detailsElement = document.querySelector('#leet_details');

   
    let detailsHTML = '';
    const userNames = [];
    const submissions = [];
    details.forEach(detail => {
        if (detail.error) {
            // Display the specific error message returned by the API
            detailsHTML += `<p>${detail.error}</p>`;
        } else {
            detailsHTML += `<div> <div class="name_del"><h5>${detail.userName}</h5> <button class="deleteBtn" data-user="${detail.userName}">Delete</button> </div><p>Problems solved: ${detail.solvedProblem}<br> Easy: ${detail.easySolved}, Medium: ${detail.mediumSolved}, Hard: ${detail.hardSolved}<br> Today's submissions: ${detail.questionsSubmitted}<br></p></div>`;
            userNames.push(detail.userName);
            submissions.push(detail.questionsSubmitted);
        }
    });
    detailsElement.innerHTML = detailsHTML;

    const deleteButtons = document.querySelectorAll('.deleteBtn');
    deleteButtons.forEach(button => {
        button.addEventListener('click', async () => {
            const userNameToDelete = button.dataset.user;
            await deleteLeetCodeID(userNameToDelete);
            refreshDetails();
        });
    });
   

};




const deleteLeetCodeID = (userName) => {
    // Remove the user from localStorage
    localStorage.removeItem(userName);
    
    // Remove the user from the list of stored userNames
    const userNames = JSON.parse(localStorage.getItem('userNames')) || [];
    const updatedUserNames = userNames.filter(name => name !== userName);
    localStorage.setItem('userNames', JSON.stringify(updatedUserNames));
};





//Function to add a new LeetCode ID to the array and update localStorage
const addLeetCodeID = async (userName) => {


    const errorElement = document.querySelector('#error_message');
    errorElement.innerText = ''; // Clear previous error message


    const userNames = JSON.parse(localStorage.getItem('userNames')) || [];
    if (userNames.length < 6) {
        try {
            // Fetch details from API
            const detail = await getDetails(userName);
            console.log(detail);

            if(detail==null){
                const errorElement = document.querySelector('#error_message');
                errorElement.innerText = detail && detail.error ? detail.error : 'Error: Incorrect LeetCode ID OR Too many request from this IP (revist in one hour)';
            }
            
                // Store the username and its details together
            localStorage.setItem(userName, JSON.stringify(detail));
            userNames.push(userName);
            localStorage.setItem('userNames', JSON.stringify(userNames));
            
        } catch (error) {
            console.log(`An error occurred while adding LeetCode ID ${userName}:`, error);
            const errorElement = document.querySelector('#error_message');
            errorElement.innerText = 'An error occurred. Please try again later.';
        }
    } else {
        alert('You have reached the maximum limit of 6 LeetCode IDs.');
    }
};






// Function to handle form submission
const handleFormSubmit = async (event) => {
    event.preventDefault(); // Prevent the traditional form submission
    const userName = document.querySelector('#nameInput').value.trim();
    if (userName) { // Only proceed if username is not empty
        await addLeetCodeID(userName);
        document.querySelector('#nameInput').value = ''; // Clear input after submission
        const userNames = JSON.parse(localStorage.getItem('userNames')) || [];
        if (userNames.length === 6) {
            document.querySelector('#nameForm').style.display = 'none'; // Hide form if 6 IDs are stored
        }
        const details = await getAllDetails(userNames);
        displayDetails(details); // Display details for all stored IDs
    }
};
// Event listener for the form submission
document.querySelector('#nameForm').addEventListener('submit', handleFormSubmit);





// Function to delete all stored LeetCode IDs from localStorage
const deleteAllIDs = () => {


    const errorElement = document.querySelector('#error_message');
    errorElement.innerText = ''; // Clear previous error message

    // Clear all stored details from local storage
    const userNames = JSON.parse(localStorage.getItem('userNames')) || [];
    userNames.forEach(userName => {
        localStorage.removeItem(userName);
    });

    // Remove the userNames key as well
    localStorage.removeItem('userNames');

    // After deleting, refresh the page to clear the displayed details
    location.reload();
};
// Event listener for the delete button
document.querySelector('#deleteAllBtn').addEventListener('click', deleteAllIDs);




// Function to refresh details for all stored LeetCode IDs
const refreshDetails = async () => {


    const errorElement = document.querySelector('#error_message');
    errorElement.innerText = ''; // Clear previous error message


    const userNames = JSON.parse(localStorage.getItem('userNames')) || [];
    const details = await getAllRefreshedDetails(userNames);
    displayDetails(details);
};
// Event listener for the refresh button
document.querySelector('#refreshBtn').addEventListener('click', refreshDetails);



// Initial setup
document.addEventListener("DOMContentLoaded", async () => {
    
    const userNames = JSON.parse(localStorage.getItem('userNames')) || [];
    if (userNames.length === 0) {
        const detailsElement = document.querySelector('#leet_details');
        detailsElement.innerHTML = '<p>Enter at least one LeetCode ID</p>';
    } else {
        const details = await getAllDetails(userNames);
        displayDetails(details); // Display details for all stored IDs
    }

    if (userNames.length === 6) {
        document.querySelector('#nameForm').style.display = 'none'; // Hide form if 6 IDs are stored
    }
});
