import "./index.css";

import {
  settings,
  enableValidation,
  resetValidation,
  disableButton,
} from "../scripts/validation.js";

import Api from "../utlis/Api.js";

const api = new Api({
  baseUrl: "https://around-api.en.tripleten-services.com/v1",
  headers: {
    authorization: "4020d21f-7b48-4697-a4d3-1f13208ab8d6",
    "Content-Type": "application/json",
  },
});

api
  .getAppInfo()
  .then(([cards, userInfo]) => {
    profileNameEl.textContent = userInfo.name;
    profileDescriptionEl.textContent = userInfo.about;
    const profileAvatarEl = document.querySelector(".profile__avatar");

    if (profileAvatarEl) {
      profileAvatarEl.src = userInfo.avatar;
      profileAvatarEl.alt = userInfo.name;
    }

    cards.forEach(function (item) {
      const cardElement = getCardElement(item);
      cardList.append(cardElement);
    });
  })
  .catch((error) => {
    console.error("Error fetching initial cards:", error);
  });

const profileNameEl = document.querySelector(".profile__name");
const profileDescriptionEl = document.querySelector(".profile__description");
const editProfileBtn = document.querySelector(".profile__edit-btn");
const editProfileModal = document.querySelector("#edit-profile-modal");
const editProfileClosebtn = editProfileModal.querySelector(".modal__close-btn");
const editProfileForm = editProfileModal.querySelector(".modal__form");
const editProfileNameInput = editProfileModal.querySelector(
  "#profile-name-input"
);
const editProfileDescriptionInput = editProfileModal.querySelector(
  "#profile-description-input"
);

const editAvatarBtn = document.querySelector(".profile__avatar-btn");
const editAvatarModal = document.querySelector("#edit-avatar-modal");
const editAvatarCloseBtn = editAvatarModal.querySelector(".modal__close-btn");
const editAvatarForm = editAvatarModal.querySelector(".modal__form");
const avatarInput = editAvatarForm.querySelector("#avatar-input");
const avatarSubmitButton = editAvatarModal.querySelector(".modal__submit-btn");

const newPostBtn = document.querySelector(".profile__add-btn");
const newPostModal = document.querySelector("#new-post-modal");
const newPostCloseBtn = newPostModal.querySelector(".modal__close-btn");
const newPostForm = newPostModal.querySelector(".modal__form");
const cardSubmitButton = newPostModal.querySelector(".modal__submit-btn");
const editImageLinkInput = newPostForm.querySelector("#card-image");
const editCaptionInput = newPostForm.querySelector("#card-caption");

const cardTemplate = document
  .querySelector("#card-template")
  .content.querySelector(".card");
const cardList = document.querySelector(".cards__list");

const previewModal = document.querySelector("#preview-modal");
const previewModalCloseBtn = previewModal.querySelector(".modal__close-btn");
const previewImageEl = previewModal.querySelector(".modal__image");
const previewNameEl = previewModal.querySelector(".modal__caption");

const deleteModal = document.querySelector("#delete-confirmation-modal");
const confirmDeleteBtn = deleteModal.querySelector("#confirm-delete-btn");
const cancelDeleteBtn = deleteModal.querySelector(".modal__cancel-image");
const deleteModalCloseBtn = deleteModal.querySelector(".modal__close-btn");

let cardToDelete = null;
let cardToDeleteId = null;

function getCardElement(data) {
  const cardElement = cardTemplate.cloneNode(true);
  const cardTitleEl = cardElement.querySelector(".card__title");
  const cardImageEl = cardElement.querySelector(".card__image");

  cardImageEl.src = data.link;
  cardImageEl.alt = data.name;
  cardTitleEl.textContent = data.name;

  const cardLikeBtnEl = cardElement.querySelector(".card__like-button");

  if (data.isLiked) {
    cardLikeBtnEl.classList.add("card__like-button_active");
  }
  cardLikeBtnEl.addEventListener("click", () => {
    const isLiked = cardLikeBtnEl.classList.contains(
      "card__like-button_active"
    );
    const likeAction = isLiked
      ? api.unlikeCard(data._id)
      : api.likeCard(data._id);

    likeAction
      .then((updatedCard) => {
        if (updatedCard.isLiked) {
          cardLikeBtnEl.classList.add("card__like-button_active");
        } else {
          cardLikeBtnEl.classList.remove("card__like-button_active");
        }
      })
      .catch((error) => {
        console.error("Error updating like status:", error);
      });
  });

  const cardDeleteBtnEl = cardElement.querySelector(".card__delete-button");
  cardDeleteBtnEl.addEventListener("click", () => {
    cardToDelete = cardElement;
    cardToDeleteId = data._id;
    openModal(deleteModal);
  });

  cardImageEl.addEventListener("click", () => {
    previewImageEl.src = data.link;
    previewImageEl.alt = data.name;
    previewNameEl.textContent = data.name;
    openModal(previewModal);
  });

  return cardElement;
}

function handleEscapeKey(evt) {
  if (evt.key === "Escape") {
    const openModal = document.querySelector(".modal.modal_is-opened");
    if (openModal) {
      closeModal(openModal);
    }
  }
}

function openModal(modal) {
  modal.classList.add("modal_is-opened");
  document.addEventListener("keydown", handleEscapeKey);
}

function closeModal(modal) {
  modal.classList.remove("modal_is-opened");
  document.removeEventListener("keydown", handleEscapeKey);
}

function setModalCloseListeners() {
  const modals = document.querySelectorAll(".modal");
  modals.forEach((modal) => {
    modal.addEventListener("click", (evt) => {
      if (evt.target.classList.contains("modal")) {
        closeModal(modal);
      }
    });
  });
}

confirmDeleteBtn.addEventListener("click", () => {
  if (cardToDelete && cardToDeleteId) {
    const originalText = confirmDeleteBtn.textContent;
    confirmDeleteBtn.textContent = "Deleting...";
    confirmDeleteBtn.disabled = true;

    api
      .deleteCard(cardToDeleteId)
      .then(() => {
        cardToDelete.remove();
        cardToDelete = null;
        cardToDeleteId = null;
        closeModal(deleteModal);
      })
      .catch((error) => {
        console.error("Error deleting card:", error);
      })
      .finally(() => {
        confirmDeleteBtn.textContent = originalText;
        confirmDeleteBtn.disabled = false;
      });
  }
});

cancelDeleteBtn.addEventListener("click", () => {
  closeModal(deleteModal);
});

deleteModalCloseBtn.addEventListener("click", () => {
  closeModal(deleteModal);
});

editProfileBtn.addEventListener("click", function () {
  editProfileNameInput.value = profileNameEl.textContent;
  editProfileDescriptionInput.value = profileDescriptionEl.textContent;
  resetValidation(
    editProfileForm,
    [editProfileNameInput, editProfileDescriptionInput],
    settings
  );
  openModal(editProfileModal);
});

editProfileClosebtn.addEventListener("click", function () {
  closeModal(editProfileModal);
});

editAvatarBtn.addEventListener("click", function () {
  openModal(editAvatarModal);
});

editAvatarCloseBtn.addEventListener("click", function () {
  closeModal(editAvatarModal);
});

newPostBtn.addEventListener("click", function () {
  openModal(newPostModal);
});

newPostCloseBtn.addEventListener("click", function () {
  closeModal(newPostModal);
});

previewModalCloseBtn.addEventListener("click", function () {
  closeModal(previewModal);
});

function handleEditProfileSubmit(evt) {
  evt.preventDefault();

  const profileSubmitButton =
    editProfileModal.querySelector(".modal__submit-btn");
  const originalText = profileSubmitButton.textContent;
  profileSubmitButton.textContent = "Saving...";
  profileSubmitButton.disabled = true;

  api
    .editUserInfo({
      name: editProfileNameInput.value,
      about: editProfileDescriptionInput.value,
    })
    .then((updatedUserInfo) => {
      profileNameEl.textContent = updatedUserInfo.name;
      profileDescriptionEl.textContent = updatedUserInfo.about;

      const profileAvatarEl = document.querySelector(".profile__avatar");
      if (profileAvatarEl && updatedUserInfo.avatar) {
        profileAvatarEl.src = updatedUserInfo.avatar;
        profileAvatarEl.alt = updatedUserInfo.name;
      }

      closeModal(editProfileModal);
    })
    .catch((error) => {
      console.error("Error updating user info:", error);
    })
    .finally(() => {
      profileSubmitButton.textContent = originalText;
      profileSubmitButton.disabled = false;
    });
}

function handleAddCardSubmit(evt) {
  evt.preventDefault();

  const originalText = cardSubmitButton.textContent;
  cardSubmitButton.textContent = "Saving...";
  cardSubmitButton.disabled = true;

  const cardData = {
    name: editCaptionInput.value,
    link: editImageLinkInput.value,
  };

  api
    .addCard(cardData)
    .then((newCard) => {
      const cardElement = getCardElement(newCard);
      cardList.prepend(cardElement);
      closeModal(newPostModal);
      evt.target.reset();
      disableButton(cardSubmitButton, settings);
    })
    .catch((error) => {
      console.error("Error adding card:", error);
    })
    .finally(() => {
      cardSubmitButton.textContent = originalText;
      cardSubmitButton.disabled = false;
    });
}

function handleAvatarSubmit(evt) {
  evt.preventDefault();

  const originalText = avatarSubmitButton.textContent;
  avatarSubmitButton.textContent = "Saving...";
  avatarSubmitButton.disabled = true;

  const avatarData = {
    avatar: avatarInput.value,
  };

  api
    .editAvatar(avatarData)
    .then((updatedUserInfo) => {
      const profileAvatarEl = document.querySelector(".profile__avatar");
      if (profileAvatarEl && updatedUserInfo.avatar) {
        profileAvatarEl.src = updatedUserInfo.avatar;
        profileAvatarEl.alt = updatedUserInfo.name;
      }
      closeModal(editAvatarModal);
      evt.target.reset();
      disableButton(avatarSubmitButton, settings);
    })
    .catch((error) => {
      console.error("Error updating avatar:", error);
    })
    .finally(() => {
      avatarSubmitButton.textContent = originalText;
      avatarSubmitButton.disabled = false;
    });
}

newPostForm.addEventListener("submit", handleAddCardSubmit);
editProfileForm.addEventListener("submit", handleEditProfileSubmit);
editAvatarForm.addEventListener("submit", handleAvatarSubmit);

setModalCloseListeners();
enableValidation(settings);
