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

function exportAttendance(format) {
    alert(`Attendance report exported as ${format}!`);
    // You would integrate PDF/Excel export logic here.
}

function exportPerformance(format) {
    alert(`Performance report exported as ${format}!`);
    // You would integrate PDF/Excel export logic here.
}

// Mock data for attendance and performance
const attendanceData = [
    { studentName: 'John Doe', status: 'Present' },
    { studentName: 'Jane Smith', status: 'Absent' }
];

const performanceData = [
    { studentName: 'John Doe', subject: 'Math', score: 85 },
    { studentName: 'Jane Smith', subject: 'Science', score: 90 }
];

// Populate tables with mock data
function populateTables() {
    const attendanceTableBody = document.getElementById('attendanceTable').getElementsByTagName('tbody')[0];
    attendanceData.forEach(record => {
        const row = attendanceTableBody.insertRow();
        row.innerHTML = `<td>${record.studentName}</td><td>${record.status}</td>`;
    });

    const performanceTableBody = document.getElementById('performanceTable').getElementsByTagName('tbody')[0];
    performanceData.forEach(record => {
        const row = performanceTableBody.insertRow();
        row.innerHTML = `<td>${record.studentName}</td><td>${record.subject}</td><td>${record.score}</td>`;
    });
}

populateTables();
