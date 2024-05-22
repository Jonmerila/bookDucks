const registerUsername = document.querySelector("#identifier");
const registerPassword = document.querySelector("#password");
const registerMail = document.querySelector("#userEmail");

const loginID = document.querySelector("#loginID");
const loginPassword = document.querySelector("#loginPassword");

const registerBtn = document.querySelector("#registerUserBtn");
const loginBtn = document.querySelector("#loginUser");

const getPageTheme = async () => {
  try {
    let theme = await axios.get(`http://localhost:1330/api/theme`);
    let selTheme = theme.data.data.attributes.selectedTheme;
    primaryColor = theme.data.data.attributes.theme[selTheme].primary;
    secondaryColor = theme.data.data.attributes.theme[selTheme].secondary;
    textColor = theme.data.data.attributes.theme[selTheme].fontColor;

    document.body.style.backgroundColor = primaryColor;
    let registerbox = document.querySelector(".registerBox");
    registerbox.style.backgroundColor = secondaryColor;
    let text = document.querySelectorAll("label, h3");
    let book1 = document.querySelector(".book1 > path");
    let book2 = document.querySelector(".book2 > path");

    console.log(book1);
    book1.style.fill = secondaryColor;
    book2.style.fill = secondaryColor;
    text.forEach((text) => {
      text.style.color = textColor;
    });
    console.log(text);
    secondaryColor;
    console.log(theme);
    console.log(selTheme, primaryColor, secondaryColor);
  } catch (e) {
    console.error("Error: ", e);
  }
};
// Lägg till färg styling >::::::::::::::::::::::::::::::::::::::::::

const register = async () => {
  try {
    let response = await axios.post(
      "http://localhost:1330/api/auth/local/register",
      {
        username: registerUsername.value,
        email: registerMail.value,
        password: registerPassword.value,
      }
    );
    console.log(response);
    console.log(response.data.jwt);
    console.log(response.data.user.id);
    let updatedReadListResponse = await axios.post(
      `http://localhost:1330/api/read-lists`,
      {
        data: {
          user: response.data.user.id,
          title: "Booklist",
          books: [],
        },
      },
      {
        headers: {
          Authorization: `Bearer ${response.data.jwt}`,
        },
      }
    );

    let createRatingList = await axios.post(
      `http://localhost:1330/api/rating-lists`,
      {
        data: {
          user: response.data.user.id,
          title: "Ratings",
        },
      },
      {
        headers: {
          Authorization: `Bearer ${response.data.jwt}`,
        },
      }
    );

    console.log(updatedReadListResponse);
    alert("Registration successful!");
  } catch (e) {
    console.error("Error registering a user: ", e);
  }
};

const login = async () => {
  console.log("Logging in...");
  try {
    let response = await axios.post("http://localhost:1330/api/auth/local", {
      identifier: loginID.value,
      password: loginPassword.value,
    });
    sessionStorage.setItem("token", response.data.jwt);
    sessionStorage.setItem("user", JSON.stringify(response.data.user));
    if (sessionStorage.getItem("token")) {
      setTimeout(() => {
        console.log("Logged in!");
        window.location.href = "home.html";
      }, 1000);
    }
    console.log(response);
  } catch (e) {
    console.error("Error: ", e);
  }
};
getPageTheme();
registerBtn.addEventListener("click", register);
loginBtn.addEventListener("click", login);
