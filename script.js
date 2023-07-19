const books = [];
const RENDER_EVENT = 'render-book';
const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'BOOK_APPS';

function generateId() {
  return +new Date();
}

function generateInputBook(id, title, author, year, isCompleted) {
  return {
    id,
    title,
    author,
    year,
    isCompleted
  }
}

function addBook() {
  const title = document.getElementById('inputBookTitle').value;
  const author = document.getElementById('inputBookAuthor').value;
  const year = document.getElementById('inputBookYear').value;
  const isCompleted = document.getElementById('inputBookIsComplete').checked;
  const generatedID = generateId();
  const inputBook = generateInputBook(generatedID, title, author, year, isCompleted, false);
  books.push(inputBook);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function addTaskToCompleted(bookId) {
  const bookTarget = findBook(bookId);
  if (bookTarget == null) return;
  bookTarget.isCompleted = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function findBook(bookId) {
  for (const bookItem of books) {
    if (bookItem.id === bookId) {
      return bookItem;
    }
  }
  return null;
}

function removeTaskFromCompleted(bookId) {
  const bookTarget = findBookIndex(bookId);
  if (bookTarget === -1) return;
  const confirmation = confirm("Apakah Anda yakin ingin menghapus buku ini?");
  if (confirmation) {
    books.splice(bookTarget, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
    alert("Buku berhasil dihapus.");
  }
}

function undoTaskFromCompleted(bookId) {
  const bookTarget = findBook(bookId);
  if (bookTarget == null) return;
  bookTarget.isCompleted = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function makeBook(inputBook) {
  const textTitle = document.createElement('h2');
  textTitle.innerText = inputBook.title;
  const textAuthor = document.createElement('p');
  textAuthor.innerText = "Penulis: " + inputBook.author;
  const textYear = document.createElement('p');
  textYear.innerText = "Tahun: " + inputBook.year;
  const buttonBookShelf = document.createElement('div');
  buttonBookShelf.classList.add('action');
  const bookShelf = document.createElement('article');
  bookShelf.classList.add('book_item');
  bookShelf.append(textTitle, textAuthor, textYear, buttonBookShelf);
  bookShelf.setAttribute('id', `book-${inputBook.id}`);
  if (inputBook.isCompleted) {
    const undoButton = document.createElement('button');
    undoButton.innerText = "Belum Selesai Dibaca";
    undoButton.classList.add('green');
    undoButton.addEventListener('click', function () {
      undoTaskFromCompleted(inputBook.id);
    });
    const trashButton = document.createElement('button');
    trashButton.innerText = "Hapus Buku";
    trashButton.classList.add('red');
    trashButton.addEventListener('click', function () {
      removeTaskFromCompleted(inputBook.id);
    });
    buttonBookShelf.append(undoButton, trashButton);
  } else {
    const checkButton = document.createElement('button');
    checkButton.innerText = "Selesai Dibaca";
    checkButton.classList.add('green');
    checkButton.addEventListener('click', function () {
      addTaskToCompleted(inputBook.id);
    });
    const trashButton = document.createElement('button');
    trashButton.innerText = "Hapus Buku";
    trashButton.classList.add('red');
    trashButton.addEventListener('click', function () {
      removeTaskFromCompleted(inputBook.id);
    });
    buttonBookShelf.append(checkButton, trashButton);
  }
  return bookShelf;
}

function findBookIndex(bookId) {
  for (const index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }

  return -1;
}

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

function isStorageExist() {
  if (typeof (Storage) === undefined) {
    alert('Browser kamu tidak mendukung local storage');
    return false;
  }
  return true;
}

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }
  document.dispatchEvent(new Event(RENDER_EVENT));
}

document.addEventListener(RENDER_EVENT, function () {
  const incompleteBookshelfList = document.getElementById('incompleteBookshelfList');
  incompleteBookshelfList.innerHTML = '';
  const completeBookshelfList = document.getElementById('completeBookshelfList');
  completeBookshelfList.innerHTML = '';
  for (const bookItem of books) {
    const bookElement = makeBook(bookItem);
    if (!bookItem.isCompleted)
      incompleteBookshelfList.append(bookElement);
    else
      completeBookshelfList.append(bookElement);
  }
});

document.addEventListener(SAVED_EVENT, function () {
  console.log(localStorage.getItem(STORAGE_KEY));
});

document.getElementById('searchBook').addEventListener("submit", function (event) {
  event.preventDefault();
  const searchBook = document.getElementById('searchBookTitle').value.toLowerCase();
  const bookList = document.querySelectorAll('.book_item > h2');
  for (const book of bookList) {
    if (book.innerText.toLowerCase().includes(searchBook)) {
      book.parentElement.style.display = "block";
    } else {
      book.parentElement.style.display = "none";
    }
  }
})

document.addEventListener('DOMContentLoaded', function () {
  const input_Book = document.getElementById('inputBook');
  input_Book.addEventListener('submit', function (event) {
    event.preventDefault();
    addBook();
  });
  if (isStorageExist()) {
    loadDataFromStorage();
  }
});