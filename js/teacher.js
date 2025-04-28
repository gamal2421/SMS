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

function markAttendance(status) {
    const className = document.getElementById("classSelect").value;
    const date = document.getElementById("attendanceDate").value;
    alert(`Attendance marked as ${status} for ${className} on ${date}`);
}

function submitGrade() {
    const subject = document.getElementById("subjectSelect").value;
    const student = document.getElementById("studentSelect").value;
    const grade = document.getElementById("studentGrade").value;
    alert(`Grade ${grade} submitted for ${student} in ${subject}`);
}

function submitHomework() {
    const description = document.getElementById("homeworkDescription").value;
    const dueDate = document.getElementById("dueDate").value;
    alert(`Homework assigned: ${description} with due date ${dueDate}`);
}

function submitRemarks() {
    const student = document.getElementById("studentSelectRemarks").value;
    const remarks = document.getElementById("remarksText").value;
    alert(`Remarks for ${student}: ${remarks}`);
}
