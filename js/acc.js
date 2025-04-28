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

function setupFee(event) {
    event.preventDefault();
    const feeCategory = document.getElementById('feeCategory').value;
    const feeAmount = document.getElementById('feeAmount').value;
    const feeStructure = document.getElementById('feeStructure').value;
    alert(`Fee category "${feeCategory}" of $${feeAmount} added with ${feeStructure} structure.`);
}

function collectFees(event) {
    event.preventDefault();
    const invoiceNumber = document.getElementById('invoiceNumber').value;
    const paymentMethod = document.getElementById('paymentMethod').value;
    const paymentAmount = document.getElementById('paymentAmount').value;
    alert(`Payment of $${paymentAmount} recorded for Invoice #${invoiceNumber} using ${paymentMethod}.`);
}

function generateReport(event) {
    event.preventDefault();
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    alert(`Generating financial report from ${startDate} to ${endDate}.`);
}
