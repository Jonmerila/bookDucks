const welcomeUser = document.querySelector(".welcomeUser");
const logoutBtn = document.querySelector("#logoutHomeUser");
const allBooks = document.querySelector(".allbooks");

const addbook = document.querySelector("#addtoReadList");

let user = JSON.parse(sessionStorage.getItem("user"));

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

    allBooks.style.backgroundColor = primaryColor;
    allBooks.style.color = textColor;
    welcomeUser.style.color = textColor;
    document.querySelector("a").style.color = textColor;
    document.body.style.backgroundColor = primaryColor;
    document.querySelector("#logoutHomeSection > p").style.color = textColor;
    document
      .querySelectorAll(".book-card")
      .forEach((book) => (book.style.backgroundColor = secondaryColor));
  } catch (e) {
    console.error("Error: ", e);
  }
};

const redirectLogin = () => {
  window.location.href = "index.html";
};

const logout = () => {
  console.log("Logging out...");
  sessionStorage.clear();
  location.reload();
};

const getUserinfo = async () => {
  try {
    let userFetch = await axios.get(
      "http://localhost:1330/api/users/me?populate=deep,3",
      {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      }
    );
    console.log(userFetch);
    return userFetch;
  } catch (e) {
    console.error("Error: ", e);
  }
};

const addRatingToBook = async (book, rating) => {
  let user = await getUserinfo();
  let ratingsID = user.data.rating_list.id;
  let allRatings = await axios.get(
    `http://localhost:1330/api/rating-lists/${ratingsID}?populate=deep,3`,
    {
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
    }
  );

  console.log(allRatings);
  let userRatings = allRatings.data.data.attributes.books.data || [];

  let ratings = Array.isArray(allRatings.data.data.attributes.Ratings)
    ? allRatings.data.data.attributes.Ratings
    : [allRatings.data.data.attributes.Ratings];
  if (ratings.length > 1) {
    console.log("RATINGS: " + ratings + " " + ratings[0].book);
    console.log("ALL RATINGS: " + userRatings);
  }
  console.log(ratings);

  if (!Array.isArray(userRatings)) {
    userRatings = [];
  }
  console.log(
    "Ratings data from API:",
    allRatings.data.data.attributes.Ratings
  );
  console.log("BOOK ID: " + book.id);

  let existingRatings = allRatings.data.data.attributes.Ratings;

  if (!existingRatings) {
    existingRatings = [];
  } else if (!Array.isArray(existingRatings)) {
    existingRatings = [existingRatings];
  }
  console.log(existingRatings);

  let existingRatingIndex = existingRatings.findIndex(
    (r) => r.book === book.id
  );

  console.log(existingRatingIndex);
  if (existingRatingIndex === -1) {
    // Book is not rated yet, add new rating
    console.log("Book is not rated yet, add new rating");
    existingRatings.push({ book: book.id, rating: rating });
    // userRatings.push(book);
  } else {
    // Book is already rated, update rating
    existingRatings[existingRatingIndex].rating = rating;
  }

  console.log("User ratings variable: " + userRatings);

  if (userRatings.length < 1) {
    console.log("No books in list, adding first book..");
    userRatings = [book];
  } else {
    console.log("Books exist, adding book..");
    userRatings.push(book);
  }
  console.log(userRatings, "New book rating list");

  let res2 = await axios.put(
    `http://localhost:1330/api/rating-lists/${ratingsID}?populate=deep,3`,
    {
      data: {
        books: userRatings,
        Ratings: existingRatings,
      },
    },
    {
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
    }
  );
  //   console.log(res2);

  let bookRating = book.attributes.averageGrade;
  let newRate = rating;
  let numOfRatings = book.attributes.numRatings;
  //   console.log(book);
  //   console.log(book.attributes.numOfRatings);
  let averageRating;
  //   console.log("Num of ratings: " + numOfRatings);
  if (bookRating === undefined || numOfRatings === 0) {
    bookRating = newRate;
    numOfRatings = 1;
  } else {
    //Add mathematical things to make average score
    numOfRatings++;

    let totalScore = bookRating * (numOfRatings - 1);
    totalScore += +rating;
    console.log("Total score: " + totalScore);
    console.log("New added Rating: " + rating);

    averageRating = totalScore / numOfRatings;

    // if (averageRating < 0) {
    //   averageRating = 0;
    // } else if (averageRating > 10) {
    //   averageRating = 10;
    // }

    bookRating = parseFloat(averageRating);
  }
  console.log("Book rating " + bookRating);
  console.log("Average Rating ", averageRating);

  let newRating = await axios.put(
    `http://localhost:1330/api/books/${book.id}?populate=deep,3`,
    {
      data: {
        averageGrade: bookRating,
        numRatings: numOfRatings,
      },
    },
    {
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
    }
  );
  alert("Rating added!");
  location.reload();
  // console.log(bookRating);
  //   location.reload();
};

const addToReadList = async (book) => {
  console.log(book);
  let token = sessionStorage.getItem("token");
  let user = await axios.get(
    "http://localhost:1330/api/users/me?populate=deep,3",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  console.log(user);
  let readListID = user.data.read_list.id;
  console.log(readListID);
  //   userReadList.push(book);
  let getList = await axios.get(
    `http://localhost:1330/api/read-lists/${readListID}?populate=deep,3`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  console.log(getList);
  let bookArray = getList.data.data.attributes.books.data;
  bookArray.push(book);
  console.log(bookArray);

  let res = await axios.put(
    `http://localhost:1330/api/read-lists/${readListID}`,
    {
      data: {
        books: bookArray,
      },
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  let test = await axios.get(
    `http://localhost:1330/api/read-lists/${readListID}?populate=deep,3`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  alert("Book added to your readlist.");
};

if (user) {
  logoutBtn.innerText = "Log out";
  logoutBtn.removeEventListener("click", redirectLogin);
  logoutBtn.addEventListener("click", logout);
  console.log(user.username);
  console.log("User logged in");
  welcomeUser.innerText = `Welcome, ${user.username}.`;
  // Lägg till färg styling >::::::::::::::::::::::::::::::::::::::::::
} else {
  logoutBtn.innerText = "Log in / Register";
  console.log("redirecting...");
  logoutBtn.removeEventListener("click", logout);
  logoutBtn.addEventListener("click", redirectLogin);
}

const getStars = (averageGrade) => {
  let stars;
  switch (averageGrade) {
    case 0:
      stars = 0;
      break;
    case 1:
      stars = 0.5;
      break;
    case 2:
      stars = 1;
      break;
    case 3:
      stars = 1.5;
      break;
    case 4:
      stars = 2;
      break;
    case 5:
      stars = 2.5;
      break;
    case 6:
      stars = 3;
      break;
    case 7:
      stars = 3.5;
      break;
    case 8:
      stars = 4;
      break;
    case 9:
      stars = 4.5;
      break;
    case 10:
      stars = 5;
      break;
    default:
      stars = -1;
      break;
  }
  return stars;
};

const generateStars = (averageGrade) => {
  const fullStarImage = "./svgs/full.svg";
  const halfStarImage = "./svgs/half.svg";
  const hollowStarImage = "./svgs/hollow.svg";
  let starContainer = document.createElement("div");
  starContainer.classList.add("star-container");
  //   starContainer.innerHTML = ""; // Clear any existing stars

  // Calculate number of full, half, and hollow stars
  let fullStars = Math.floor(averageGrade / 2);
  let remainingGrade = averageGrade - fullStars * 2;
  let halfStars = remainingGrade >= 1 ? 1 : 0;
  let hollowStars = 5 - fullStars - halfStars;

  // Add full stars
  for (let i = 0; i < fullStars; i++) {
    let img = document.createElement("img");
    img.src = fullStarImage;
    img.alt = "Full Star";
    starContainer.appendChild(img);
  }

  // Add half star if needed
  if (halfStars === 1) {
    let img = document.createElement("img");
    img.src = halfStarImage;
    img.alt = "Half Star";
    starContainer.appendChild(img);
  }

  // Add hollow stars
  for (let i = 0; i < hollowStars; i++) {
    let img = document.createElement("img");
    img.src = hollowStarImage;
    img.alt = "Hollow Star";
    starContainer.appendChild(img);
  }
  return starContainer;
};

const renderBooks = async () => {
  let response = await axios.get(
    "http://localhost:1330/api/books?populate=deep,3"
  );
  let bookData = response.data.data;

  bookData.forEach((book) => {
    let bookID = book.id;

    let imgUrl = book.attributes.bookCover.data[0].attributes.url;
    let altText = book.attributes.bookCover.data[0].attributes.alternativeText;
    let { title, author, genre, pages, publishDate, averageGrade } =
      book.attributes;
    if (averageGrade === null) {
      averageGrade = "None";
    }
    let bookCard = document.createElement("div");
    bookCard.classList.add("book-card");
    bookCard.style.backgroundColor = primaryColor;
    bookCard.style.color = textColor;
    bookCard.innerHTML = `<img src=http://localhost:1330${imgUrl} alt=${altText}/>
      <h3>${title}</h3>
      <p>By ${author}</p>
      <p>Genre: ${genre}</p>
      <p>Pages: ${pages}</p>
      <p>Published Date: ${publishDate}</p>
      <p>Average grade: ${averageGrade}</p>`;
    let averageStars = document.createElement("div");
    averageStars.classList.add("numStars");
    let stars = generateStars(averageGrade);
    console.log(stars);
    bookCard.append(stars);
    if (user) {
      let rateReadContainer = document.createElement("div");
      rateReadContainer.classList.add("card-buttons");
      let addRating = document.createElement("button");
      let ratingValue = document.createElement("select");
      ratingValue.innerHTML = `
      <option value="10">10</option>
      <option value="9">9</option>
      <option value="8">8</option>
      <option value="7">7</option>
      <option value="6">6</option>
      <option value="5">5</option>
      <option value="4">4</option>
      <option value="3">3</option>
      <option value="2">2</option>
      <option value="1">1</option>
      <option value="0">0</option>
      `;
      addRating.classList.add("addRatingBtn");
      addRating.innerText = "Add rating";

      let addReadList = document.createElement("button");
      addReadList.classList.add("addReadListBtn");
      addReadList.innerText = "Add to read list";
      addReadList.addEventListener("click", () => addToReadList(book));
      addRating.addEventListener("click", () =>
        addRatingToBook(book, ratingValue.value)
      );
      rateReadContainer.append(ratingValue, addRating, addReadList);
      bookCard.append(rateReadContainer);
    }

    allBooks.append(bookCard);
  });
};

renderBooks();
getPageTheme();
