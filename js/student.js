function openTab(tabName) {
    const tabContents = document.getElementsByClassName("tab-content");
    for (let i = 0; i < tabContents.length; i++) {
        tabContents[i].classList.remove("active");
    }

    const tabButtons = document.getElementsByClassName("tab-btn");
    for (let i = 0; i < tabButtons.length; i++) {
        tabButtons[i].classList.remove("active");
    }

    document.getElementById(tabName).classList.add("active");
    event.currentTarget.classList.add("active");

    updateTabFunElements(tabName);
}

function updateTabFunElements(tabName) {
    const gradeReaction = document.querySelector('.grade-reaction');
    const gradeComment = document.querySelector('.grade-comment');

    if (tabName === 'grades') {
        gradeReaction.textContent = '😊';
        gradeComment.textContent = 'Great job! You\'re doing better than 85% of your class!';
    } else if (tabName === 'homework') {
        // Custom behavior for homework
    } else if (tabName === 'exams') {
        // Custom behavior for exams
    }
}

// Placeholder functions for future backend integration
function startExam() {
    alert("Starting the exam... (integration needed)");
}

function viewResults() {
    alert("Viewing your exam results... (integration needed)");
}

function editProfile() {
    alert("Edit profile functionality (integration needed)");
}

function registerForEvent() {
    alert("Registering for event... (integration needed)");
}
