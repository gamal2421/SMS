
let issuedBooks = [];
let overdueBooks = [];

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

function addBook(event) {
    event.preventDefault();
    const title = document.getElementById('bookTitle').value;
    const author = document.getElementById('bookAuthor').value;
    const isbn = document.getElementById('bookISBN').value;
    const category = document.getElementById('bookCategory').value;
    const quantity = parseInt(document.getElementById('bookQuantity').value);
    const type = document.getElementById('bookType').value;

    // Reset out of stock alert
    document.getElementById('outOfStockAlert').style.display = 'none';

    if (quantity <= 0) {
        document.getElementById('outOfStockAlert').style.display = 'block';
    }

    alert(`Book "${title}" added successfully!`);
    // Optionally, add to a book list or database
}

function issueBook(event) {
    event.preventDefault();
    const userId = document.getElementById('userId').value;
    const isbn = document.getElementById('isbn').value;

    const issueRecord = { userId, isbn, issuedOn: new Date().toLocaleDateString() };
    issuedBooks.push(issueRecord);
    displayIssuedBooks();
    alert(`Book with ISBN "${isbn}" issued to ${userId} successfully!`);
}

function returnBook(event) {
    event.preventDefault();
    const returnUserId = document.getElementById('returnUserId').value;
    const returnISBN = document.getElementById('returnISBN').value;

    const index = issuedBooks.findIndex(book => book.userId === returnUserId && book.isbn === returnISBN);
    if (index !== -1) {
        const returnedBook = issuedBooks[index];
        overdueBooks.push(returnedBook); // Add to the overdue log
        issuedBooks.splice(index, 1);
        displayIssuedBooks();
        alert(`Book with ISBN "${returnISBN}" returned by ${returnUserId} successfully!`);
    } else {
        alert(`No record of issued book with ISBN "${returnISBN}" for user ${returnUserId}.`);
    }
}

function displayIssuedBooks() {
    const log = document.getElementById('issuedBooksLog');
    log.innerHTML = '';
    issuedBooks.forEach(book => {
        log.innerHTML += `<li>${book.isbn} issued to ${book.userId} on ${book.issuedOn}</li>`;
    });
}

function sendAlerts() {
    const overdueList = document.getElementById('overdueList');
    overdueList.innerHTML = '';
    overdueBooks.forEach(book => {
        overdueList.innerHTML += `<tr>
          <td>${book.isbn}</td>
          <td>${book.userId}</td>
          <td>${(new Date() - new Date(book.issuedOn)) / (1000 * 3600 * 24)} days</td>
        </tr>`;
    });
    alert('Overdue notifications sent!');
}
