
let visitorLog = [];
let applicationStatus = [];

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

function addVisitor(event) {
    event.preventDefault();
    const name = document.getElementById('visitorName').value;
    const contact = document.getElementById('visitorContact').value;
    const purpose = document.getElementById('visitorPurpose').value;
    const personVisited = document.getElementById('personVisited').value;
    const timeIn = document.getElementById('timeIn').value;
    const timeOut = document.getElementById('timeOut').value;

    const visitorEntry = { name, contact, purpose, personVisited, timeIn, timeOut };
    visitorLog.push(visitorEntry);
    displayVisitorLog();
    alert(`Visitor "${name}" added successfully!`);
    event.target.reset(); // Reset the form
}

function displayVisitorLog() {
    const logTable = document.getElementById('visitorLog').getElementsByTagName('tbody')[0];
    logTable.innerHTML = ''; // Clear existing entries
    visitorLog.forEach(visitor => {
        const row = logTable.insertRow();
        Object.values(visitor).forEach(text => {
            const cell = row.insertCell();
            cell.appendChild(document.createTextNode(text));
        });
    });
}

function submitAdmission(event) {
    event.preventDefault();
    const studentName = document.getElementById('studentName').value;
    const studentId = document.getElementById('studentId').value;
    const studentEmail = document.getElementById('studentEmail').value;
    const documents = document.getElementById('documents').files[0].name;

    const applicationEntry = { studentName, studentId, studentEmail, documents, status: 'Pending' };
    applicationStatus.push(applicationEntry);
    displayApplicationStatus();
    alert(`Application for "${studentName}" submitted for approval!`);
    event.target.reset(); // Reset the form
}

function displayApplicationStatus() {
    const statusList = document.getElementById('applicationStatus');
    statusList.innerHTML = ''; // Clear existing statuses
    applicationStatus.forEach(application => {
        const li = document.createElement('li');
        li.textContent = `${application.studentName} (${application.status})`;
        statusList.appendChild(li);
    });
}
