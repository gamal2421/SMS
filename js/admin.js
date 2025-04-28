
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
}

function manageUser(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const role = document.getElementById('role').value;
    alert(`User ${username} with role ${role} created/updated successfully!`);
}

function manageClass(event) {
    event.preventDefault();
    const className = document.getElementById('className').value;
    const section = document.getElementById('section').value;
    alert(`Class ${className} with section ${section} added/edited successfully!`);
}

function manageSubject(event) {
    event.preventDefault();
    const subjectName = document.getElementById('subjectName').value;
    const classAssign = document.getElementById('classAssign').value;
    alert(`Subject ${subjectName} assigned to ${classAssign} successfully!`);
}

function manageSchedule(event) {
    event.preventDefault();
    const scheduleDetails = document.getElementById('scheduleDetails').value;
    alert(`Schedule generated with details: ${scheduleDetails}`);
}

function manageEvent(event) {
    event.preventDefault();
    const eventTitle = document.getElementById('eventTitle').value;
    const eventDate = document.getElementById('eventDate').value;
    const eventDescription = document.getElementById('eventDescription').value;
    alert(`Event '${eventTitle}' on ${eventDate} added successfully!`);
}
