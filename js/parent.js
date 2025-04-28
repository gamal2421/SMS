
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

function sendMessage(event) {
    event.preventDefault();
    const teacher = document.getElementById('teacherName').value;
    const message = document.getElementById('messageContent').value;
    alert(`Message sent to ${teacher}: "${message}"`);
}

function requestMeeting(event) {
    event.preventDefault();
    const subject = document.getElementById('meetingSubject').value;
    const dateTime = document.getElementById('meetingDateTime').value;
    const reason = document.getElementById('meetingReason').value;
    alert(`Meeting requested on ${dateTime} for "${subject}" due to "${reason}"`);
}

function payFees(event) {
    event.preventDefault();
    const feeType = document.getElementById('feeType').value;
    const amount = document.getElementById('feeAmount').value;
    alert(`Payment of $${amount} for ${feeType} processed successfully!`);
}
