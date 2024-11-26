if (typeof navigator.serviceWorker !== "undefined") {
  navigator.serviceWorker
    .register("/sw.js")
    .then(() => console.log("service Worker Registered"));
}

const INPUT_IDS = ["#url-input", "#login-input", "#password-input"];

const setPasswordModalContent = (header, url, login, password) => `
  <div class="modal__header">
    <h1 class="modal__title">${header}</h1>
    <button id="close-modal" class="password-item__button">
      <img src="public/rounded-x.svg" alt="close" />
    </button>
  </div>
  <div>
    <form class="form password-form" name="password-form">
      <div class="form__text-field">
        <label for="url">url</label>
        <input id="url-input" name="url" value="${url ?? ""}"/>
      </div>
      <div class="form__text-field">
        <label for="login">login</label>
        <input id="login-input" name="login" value="${login ?? ""}"/>
      </div>
      <div class="form__text-field">
        <label for="password">password</label>
        <div class="row">
          <input id="password-input" name="password" value="${password ?? ""}"/>
          <button type="button" class="header__button_desktop password_button" id="generate-password">
            <img src="public/refresh.svg" alt="edit password" />
          </button>
        </div>
      </div>
      <button class="header__button_desktop" type="submit">
        Сохранить
      </button>
    </form>
  </div>`;

const setCardPasswordTemplate = (number, link, login, password) => `
  <div class="password-item">
    <p class="password-item__element">${number}</p>
    <a class="password-item__element password-item__link" href="${link}"
      >${link}</a
    >
    <p class="password-item__element">${login}</p>
    <p class="password-item__element">${password}</p>
    <button id="password-item-button-${number}" class="password-item__button">
      <img src="public/pencil.svg" alt="edit password" />
    </button>
  </div>`;

function generatePassword(length = 12, options = {}) {
  const {
    includeUppercase = true,
    includeLowercase = true,
    includeNumbers = true,
    includeSymbols = true,
  } = options;

  const uppercaseChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowercaseChars = "abcdefghijklmnopqrstuvwxyz";
  const numberChars = "0123456789";
  const symbolChars = "!@#$%^&*()_+[]{}|;:,.<>?";

  let characters = "";
  if (includeUppercase) characters += uppercaseChars;
  if (includeLowercase) characters += lowercaseChars;
  if (includeNumbers) characters += numberChars;
  if (includeSymbols) characters += symbolChars;

  if (characters.length === 0) {
    throw new Error("At least one character type must be included!");
  }

  let password = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    password += characters[randomIndex];
  }

  return password;
}

const openModal = (title, url, login, password, index) => {
  const passwordModal = document.querySelector("#password-modal");
  const passwordModalContent = document.querySelector(
    "#password-modal-content"
  );

  passwordModal.style.display = "flex";
  passwordModalContent.insertAdjacentHTML(
    "beforeend",
    setPasswordModalContent(title, url, login, password)
  );

  const closeModal = document.querySelector("#close-modal");
  closeModal.addEventListener("click", (_) => {
    passwordModal.style.display = "none";
    passwordModalContent.innerHTML = "";
  });

  const generatePasswordButton = document.querySelector("#generate-password");
  const passwordInput = document.querySelector("#password-input");
  generatePasswordButton.addEventListener("click", (_) => {
    passwordInput.value = generatePassword();
  });

  const passwordForm = document.querySelector(".password-form");
  passwordForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const passwords = JSON.parse(localStorage.getItem("passwords")) ?? [];

    const newPassword = INPUT_IDS.reduce((newPassword, id) => {
      console.log(document.querySelector(id));
      const value = document.querySelector(id).value;

      return { ...newPassword, [id]: { id, value } };
    }, {});

    typeof index === "number" && passwords.splice(index, 1, newPassword);

    localStorage.setItem(
      "passwords",
      JSON.stringify(
        typeof index === "number" ? passwords : [...passwords, newPassword]
      )
    );

    closeModal.click();

    renderPasswords();
  });
};

const renderPasswords = () => {
  const passwordList = document.querySelector(".password-list");
  const passwords = JSON.parse(localStorage.getItem("passwords")) ?? [];

  passwordList.innerHTML = "";
  passwords.map((password, index) => {
    console.log(password);
    INPUT_IDS.map((id) => console.log(password[id]));
    passwordList.insertAdjacentHTML(
      "beforeend",
      setCardPasswordTemplate(
        index + 1,
        ...INPUT_IDS.map((id) => password[id].value)
      )
    );
    const editPassword = document.querySelector(
      `#password-item-button-${index + 1}`
    );
    editPassword.addEventListener("click", (e) => {
      openModal(
        "Обновить данные",
        ...INPUT_IDS.map((id) => password[id].value),
        index
      );
    });
  });
};

renderPasswords();

let deferredPrompt;
const addBtn = document.querySelector("#add-button");
console.log(addBtn);

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();

  console.log(addBtn);

  deferredPrompt = e;
  addBtn.style.display = "block";

  addBtn.addEventListener("click", () => {
    addBtn.style.display = "none";

    deferredPrompt.prompt();

    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === "accepted") {
        console.log("User accepted the PassMan prompt");
      } else {
        console.log("User dismissed the PassMan prompt");
      }
      deferredPrompt = null;
    });
  });
});

const addNewPassword = document.querySelector("#add-passwor-button");

addNewPassword.addEventListener("click", (e) => {
  openModal("Добавить новый пароль");
});
