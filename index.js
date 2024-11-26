import refreshIcon from "./public/refresh.svg";
import roundedIcon from "./public/rounded-x.svg";
import pencilIcon from "./public/pencil.svg";
import dotsIcon from "./public/dots.svg";
import trashIcon from "./public/trash.svg";
import deviceFloppy from "./public/device-floppy.svg";
import "./public/sw.js";

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
      <img class="icon" src="${roundedIcon}" />
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
          <input class="form__password-input" id="password-input"
            name="password" value="${password ?? ""}"/>
          <div style="position: relative; width: 100%:">
            <button type="button"  class="form__password-button" id="menu-trigger">
              <img class="icon" src="${dotsIcon}" />
            </button>
            <div id="password-menu" class="menu">
              <div class="menu__container">
                <div style="">
                <label for="length">Длина</label> 
                  <input id="length" name="length" value="15" />
                </div>
                <div style="">
                  <input checked="true" id="uppercase" type="checkbox" name="uppercase" />
                  <label for="uppercase">Прописные б.</label> 
                </div>
                <div style="">
                  <input checked="true" id="lowercase" type="checkbox" name="lowercase" />
                  <label for="lowercase">Строчные б.</label> 
                </div>
                <div style="">
                  <input checked="true" id="symbol" type="checkbox" name="symbol" />
                  <label for="symbol">Символы</label> 
                </div>
                <button
                  type="button"
                  class="password-input__submit"
                  id="generate-password"
                >
                  Сгенерировать
                  <img class="icon" src="${refreshIcon}" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <button class="password-input__submit" type="submit">
        Сохранить
        <img src="${deviceFloppy}" alt="save"/>
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
    <div style="position: relative;">
      <button class="password-item__button" id="menu-trigger-${number}">
        <img class="icon" src="${dotsIcon}" />
      </button>
      <div id="menu-element-${number}" class="menu">
        <div class="menu__container" id="dots-menu">
          <button
            type="button"
            id="password-item-button-${number}" class="password-input__submit"
          >
            Редактировать
            <img class="icon" src="${pencilIcon}" />
          </button>
          <button
            type="button"
            class="password-input__submit"
            id="delete-password-${number}"
          >
            Удалить
            <img class="icon" src="${trashIcon}" />
          </button>
        </div>
      </div>
    </div>
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
  const symbolChars = "!@#$%^&*()_+[]{}|;:,.?";

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
    const length = document.querySelector("#length").value;
    const includeUppercase = document.querySelector("#uppercase").checked;
    const includeLowercase = document.querySelector("#lowercase").checked;
    const includeSymbols = document.querySelector("#symbol").checked;

    passwordInput.value = generatePassword(length, {
      includeUppercase,
      includeLowercase,
      includeNumbers: true,
      includeSymbols,
    });
  });

  const menuButton = document.querySelector("#menu-trigger");
  const menu = document.querySelector("#password-menu");
  let statusMenuButton = false;

  menuButton.addEventListener("click", (event) => {
    menu.style.display = statusMenuButton ? "none" : "flex";
    statusMenuButton = !statusMenuButton;
  });

  const passwordForm = document.querySelector(".password-form");
  passwordForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const passwords = JSON.parse(localStorage.getItem("passwords")) ?? [];

    const newPassword = INPUT_IDS.reduce((newPassword, id) => {
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
    passwordList.insertAdjacentHTML(
      "beforeend",
      setCardPasswordTemplate(
        index + 1,
        ...INPUT_IDS.map((id) => password[id].value)
      )
    );

    const menuTrigger = document.querySelector(`#menu-trigger-${index + 1}`);
    const menu = document.querySelector(`#menu-element-${index + 1}`);
    let statusMenuButton = false;

    menuTrigger.addEventListener("click", (e) => {
      menu.style.display = statusMenuButton ? "none" : "flex";
      statusMenuButton = !statusMenuButton;
    });

    const deletePassword = document.querySelector(
      `#delete-password-${index + 1}`
    );
    deletePassword.addEventListener("click", (e) => {
      let passwords = JSON.parse(localStorage.getItem("passwords")) ?? [];

      passwords.splice(index, 1);

      localStorage.setItem("passwords", JSON.stringify(passwords));

      renderPasswords();
    });

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

const addNewPassword1 = document.querySelector("#add-password-button-1");
addNewPassword1.addEventListener("click", (e) => {
  openModal("Добавить новый пароль");
});

const addNewPassword2 = document.querySelector("#add-password-button-2");
addNewPassword2.addEventListener("click", (e) => {
  openModal("Добавить новый пароль");
});
