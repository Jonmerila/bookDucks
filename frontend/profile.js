const ratelistResult = document.querySelector(".ratelistResult");
const readlistResult = document.querySelector(".readlistResult");

const logoutBtn = document.querySelector("#logoutUser");

const nameContainer = document.querySelector(".usernameContainer");
const profileName = document.querySelector(".profileName");
const activeUser = document.querySelector(".activeProfileName");
const listTitle = document.querySelector(".profList");
const labels = document.querySelectorAll("label");

const readlistBookSort = document.querySelector("#titleAuthorSort");
const ratedBookSort = document.querySelector("#ratedAuthorTitle");
let primaryColor;
let secondaryColor;
let textColor;

const getPageTheme = async () => {
  try {
    let theme = await axios.get(`http://localhost:1330/api/theme`);
    let selTheme = theme.data.data.attributes.selectedTheme;
    primaryColor = theme.data.data.attributes.theme[selTheme].primary;
    secondaryColor = theme.data.data.attributes.theme[selTheme].secondary;
    textColor = theme.data.data.attributes.theme[selTheme].fontColor;

    console.log(theme);
    console.log(selTheme, primaryColor, secondaryColor);

    readlistResult.style.backgroundColor = primaryColor;
    document.querySelector("a").style.color = textColor;
    document.body.style.backgroundColor = primaryColor;
    document.querySelector("#logoutSection > p").style.color = textColor;
    document.querySelector(".ratedListTitle").style.color = textColor;
  } catch (e) {
    console.error("Error: ", e);
  }
};

if (!sessionStorage.getItem("token")) {
  alert("You have been signed out, returning to home page.");
  window.location.href = "./home.html";
}

const getUserinfo = async () => {
  try {
    let user = await axios.get(
      "http://localhost:1330/api/users/me?populate=deep,3",
      {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      }
    );
    console.log(user);
    return user;
  } catch (e) {
    console.error("Error: ", e);
  }
};

const logout = () => {
  console.log("Logging out...");
  sessionStorage.clear();
  location.reload();
};

const removeFromReadlist = async (removedBook, list) => {
  try {
    if (list === "readinglist") {
      let user = await getUserinfo();
      let listID = user.data.read_list.id;
      let bookList = await renderListBooks();
      let updatedList = bookList.filter((book) => book.id !== removedBook);
      console.log(updatedList);
      await axios.put(
        `http://localhost:1330/api/read-lists/${listID}?populate=deep,3`,
        {
          data: {
            books: updatedList,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        }
      );
      renderListBooks();
    }
    if (list === "ratinglist") {
      console.log("Removing rated book...");
      let user = await getUserinfo();
      let listID = user.data.rating_list.id;
      let bookList = await renderRatingBooks();

      let updatedList = bookList.filter((book) => book.id !== removedBook);
      console.log(updatedList);
      await axios.put(
        `http://localhost:1330/api/rating-lists/${listID}?populate=deep,3`,
        {
          data: {
            books: updatedList,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        }
      );
      ratelistResult.innerHTML = "";
      renderRatingBooks();
    }
  } catch (e) {
    console.error("Error: ", e);
  }
};

const createBookCard = (book, list) => {
  let imgUrl = book.attributes.bookCover.data[0].attributes.url;
  let altText = book.attributes.bookCover.data[0].attributes.alternativeText;
  let { title, author, genre, pages, publishDate, averageGrade } =
    book.attributes;
  let bookCard = document.createElement("div");
  bookCard.classList.add("book-card");
  bookCard.style.backgroundColor = secondaryColor;
  bookCard.style.color = textColor;
  bookCard.innerHTML = `<img src=http://localhost:1330${imgUrl} alt=${altText}/>
          <h3>${title}</h3>
          <p>By ${author}</p>
          <p>Genre: ${genre}</p>
          <p>Pages: ${pages}</p>
          <p>Published Date: ${publishDate}</p>
          <p>Average grade: ${averageGrade}</p>`;

  let removeBook = document.createElement("button");
  removeBook.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M376.6 84.5c11.3-13.6 9.5-33.8-4.1-45.1s-33.8-9.5-45.1 4.1L192 206 56.6 43.5C45.3 29.9 25.1 28.1 11.5 39.4S-3.9 70.9 7.4 84.5L150.3 256 7.4 427.5c-11.3 13.6-9.5 33.8 4.1 45.1s33.8 9.5 45.1-4.1L192 306 327.4 468.5c11.3 13.6 31.5 15.4 45.1 4.1s15.4-31.5 4.1-45.1L233.7 256 376.6 84.5z"/></svg>`;
  //Id readlist, do this:
  if (list === "readinglist") {
    removeBook.addEventListener("click", () => {
      if (
        confirm("Are you sure you want to delete this book from your readlist?")
      ) {
        removeFromReadlist(book.id, "readinglist");
      }
    });
  }
  if (list === "ratinglist") {
    removeBook.addEventListener("click", () => {
      if (
        confirm(
          "Are you sure you want to delete this book from your ratings list? This will not remove your rating from the book."
        )
      ) {
        removeFromReadlist(book.id, "ratinglist");
      }
    });
  }
  //Otherwise, do this:
  bookCard.prepend(removeBook);
  return bookCard;
};

const renderListBooks = async () => {
  let token = sessionStorage.getItem("token");

  readlistResult.innerHTML = "";
  //GET and render out Readlist books.
  let user = await getUserinfo();
  console.log(user);
  let readListID = user.data.read_list.id;

  let getList = await axios.get(
    `http://localhost:1330/api/read-lists/${readListID}?populate=deep,3`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  profileName.textContent = `Username: ${user.data.username}`;
  profileName.style.color = textColor;
  activeUser.style.color = textColor;
  listTitle.style.color = textColor;
  labels.forEach((label) => {
    label.style.color = textColor;
  });
  console.log(getList);

  let allReadBooks = getList.data.data.attributes.books.data;

  allReadBooks.forEach((book) => {
    //Do something
    readlistResult.append(createBookCard(book, "readinglist"));
  });
  return allReadBooks;
  //Render out Rated books, use the same GET as readlist books.
};

const renderRatingBooks = async () => {
  let user = await getUserinfo();
  let ratingListID = user.data.rating_list.id;
  let getRatings = await axios.get(
    `http://localhost:1330/api/rating-lists/${ratingListID}?populate=deep,3`,
    {
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
    }
  );
  let allRatingBooks = getRatings.data.data.attributes.books.data;
  console.log(allRatingBooks);
  allRatingBooks.forEach((book) => {
    ratelistResult.append(createBookCard(book, "ratinglist"));
  });
  return allRatingBooks;
};

const sortReadBooks = async (sorter, container) => {
  let allReadList;
  container === "reading"
    ? (allReadList = await renderListBooks())
    : (allReadList = await renderRatingBooks());

  console.log(allReadList);
  const sortBy = sorter.value;

  if (sortBy === "title" || sortBy === "author") {
    allReadList.sort((a, b) => {
      const propA = a.attributes[sortBy].toUpperCase();
      const propB = b.attributes[sortBy].toUpperCase();
      if (propA < propB) {
        return -1;
      }
      if (propA > propB) {
        return 1;
      }
      return 0;
    });
  }
  if (sortBy === "rating") {
    let user = await getUserinfo();
    let ratingsID = user.data.rating_list.id;
    let getRatings = await axios.get(
      `http://localhost:1330/api/rating-lists/${ratingsID}?populate=deep,3`,
      {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      }
    );
    let userRatings = getRatings.data.data.attributes.Ratings;
    userRatings.forEach((rating) => {
      const book = allReadList.find((book) => book.id === rating.book);
      console.log(book);
    });
    allReadList.sort((a, b) => {
      const ratingA =
        userRatings.find((rating) => rating.book === a.id)?.rating || 0;
      const ratingB =
        userRatings.find((rating) => rating.book === b.id)?.rating || 0;
      return ratingB - ratingA;
    });
    console.log(allReadList);
    console.log(getRatings);
    console.log(userRatings);

    //Sort by given rating
    console.log("Sorting by given rating...");
  }

  if (container === "rating") {
    ratelistResult.innerHTML = "";
    allReadList.forEach((book) => {
      ratelistResult.append(createBookCard(book, "ratinglist"));
    });
  }

  if (container === "reading") {
    readlistResult.innerHTML = "";
    allReadList.forEach((book) => {
      readlistResult.append(createBookCard(book, "readinglist"));
    });
  }
  //   allReadList.forEach((book) => {
  //     ratelistResult.append(createBookCard(book, "ratinglist"));
  //   });
};

readlistBookSort.addEventListener("change", () => {
  sortReadBooks(readlistBookSort, "reading");
});

ratedBookSort.addEventListener("change", () => {
  sortReadBooks(ratedBookSort, "rating");
});

logoutUser.addEventListener("click", logout);
getPageTheme();
renderListBooks();
renderRatingBooks();
