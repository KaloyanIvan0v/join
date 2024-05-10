let currentEditingContactId;
async function initContacts() {
  includeHTML();
  await loadContacts();
  renderContacts(contacts);
  addClickListener();
}

/**
 * Opens the contact form and loads the corresponding template based on the given form type.
 *
 * @param {string} form - The type of form ("addContact" for adding, otherwise assumed to be editing).
 * @returns {void}
 */
function openContactForm(form) {
  addShadowLayer();
  let contactForm = document.getElementById("id-contact-form");
  if (form === "addContact") {
    loadAddContactTemplate(contactForm);
  } else {
    loadEditContactTemplate(contactForm);
  }
  includeHTML();
  setTimeout(function () {
    toggleContactForm();
  }, 100);
}

function loadAddContactTemplate(element) {
  handleHoverButtonChangeImgDelayed();
  element.innerHTML = `<div class="contact-form" w3-include-html="/templates/add-contact.html"></div>`;
  setTimeout(function () {
    document.getElementById("id-contact-form-cancel").classList.add("d-none-mobile-1300");
    handleInputOnFocusChangeParentElementBorderColor();
  }, 50);
}

function loadEditContactTemplate(element) {
  element.innerHTML = `<div class="contact-form" w3-include-html="/templates/edit-contact.html"></div>`;
  setTimeout(function () {
    editContactFillForm();
    handleInputOnFocusChangeParentElementBorderColor();
  }, 50);
}

function handleHoverButtonChangeImgDelayed() {
  setTimeout(function () {
    handleHoverButtonChangeImg(
      ".contact-form-cancel-btn",
      ".img-close-contact-form",
      'url("/img/close.png")',
      'url("/img/close-blue.png")'
    );
  }, 50);
}

function exitContactForm(event) {
  event?.preventDefault();
  toggleContactForm();
  setTimeout(function () {
    closeContactForm();
  }, 500);
}

function closeContactForm(event) {
  event?.preventDefault();
  clearElement("id-contact-form");
  removeShadowLayer();
}

async function deleteContact(event) {
  closeContactForm();
  HideFullViewShowContactList();
  if (contactExistsByEmail(getActualContactEmail())) {
    contacts.splice(getContactIndex(getActualContactEmail(), 1));
    clearElement("id-contact-full-mode");
    renderContacts(contacts);
    safeContacts();
    toggleContactFullMode();
  }
}

function contactExistsByEmail(email) {
  let contactsIds = [];
  contacts.forEach((contact) => {
    contactsIds.push(contact.email);
  });
  return contactsIds.includes(email);
}

function deleteContactFromForm(event) {
  event?.preventDefault();
  toggleContactForm();
  setTimeout(function () {
    deleteContact();
  }, 500);
}

function safeContacts() {
  setItem("contacts", contacts);
  setSessionStorage("contacts", contacts);
}

function getActualContactEmail() {
  let email = document.getElementById("id-contact-full-mode-data-email").textContent;
  return email;
}

function getContactIndex(email) {
  for (let i = 0; i < contacts.length; i++) {
    if (contacts[i].email == email) {
      return i;
    }
  }
}

function editContactFillForm() {
  const contactIndex = getContactIndex(getActualContactEmail());
  if (contactIndex !== undefined) {
    const { name, email, phone, nameInitials: badge, color } = contacts[contactIndex];
    document.getElementById("id-edit-contact-input-name").value = name;
    document.getElementById("id-edit-contact-input-email").value = email;
    document.getElementById("id-edit-contact-input-phone").value = phone;
    setBadge(badge, color);
    currentEditingContactId = contactIndex;
  }
}

function setBadge(badge, colorId) {
  let badgeDiv = document.getElementById("id-mask-contact-img-div");
  badgeDiv.innerHTML = badge;
  badgeDiv.style.backgroundColor = contactColor[colorId];
}

function SaveEditedContact() {
  getEditFormInputValues();
  toggleContactForm();
  setTimeout(function () {
    safeContacts();
    closeContactForm();
    renderContacts(contacts);
    renderContactFullMode(contacts[currentEditingContactId]);
  }, 500);
}

function getEditFormInputValues() {
  const contact = contacts[currentEditingContactId];
  contact.name = document.getElementById("id-edit-contact-input-name").value;
  contact.email = document.getElementById("id-edit-contact-input-email").value;
  contact.phone = document.getElementById("id-edit-contact-input-phone").value;
}

function createContactAndCloseForm() {
  addNewContact();
  toggleContactForm();
  setTimeout(function () {
    closeContactForm();
    renderContacts(contacts);
  }, 500);
}
async function addNewContact() {
  const { name, email, phone } = getAndNewContactInputValues();
  const color = generateContactColor();
  const nameInitials = generateBadge(name);
  const author = "Günter";
  const id = increaseId(contacts);
  const contact = { id, name, email, phone, color, nameInitials, author, checkbox: false };
  contacts.push(contact);
  safeContacts();
}

function getAndNewContactInputValues() {
  const name = document.getElementById("id-add-contact-name").value;
  const email = document.getElementById("id-add-contact-email").value;
  const phone = document.getElementById("id-add-contact-phone").value;
  return { name, email, phone };
}

function generateContactColor() {
  const color = Math.floor(Math.random() * 14) + 1;
  return color;
}

function generateBadge(name) {
  const nameParts = name.split(" ");
  let badge = nameParts[0][0].toUpperCase();
  if (nameParts.length > 1) {
    badge += nameParts[nameParts.length - 1][0].toUpperCase();
  }
  return badge;
}

function renderContacts(contacts) {
  const contactList = document.getElementById("id-contact-inner-list");
  const sortedContacts = sortListAlphabetically(contacts);
  clearElement("id-contact-inner-list");
  let currentLetter = null;
  sortedContacts.forEach((contact, i) => {
    const { name, color } = contact;
    handleLetterSection(name, currentLetter, contactList);
    renderContact(contact, contactList, i);
    setElementBackgroundColor(`id-contact-list-badges${i}`, color);
  });
  renderMobileAddContactButton();
}

function handleLetterSection(name, currentLetter, contactList) {
  const firstLetter = name.charAt(0).toUpperCase();
  if (firstLetter !== currentLetter) {
    contactList.innerHTML += renderLetterSectionHTML(firstLetter);
    currentLetter = firstLetter;
  }
}

function sortListAlphabetically(list) {
  const sortedList = list.sort((a, b) => a.name.localeCompare(b.name));
  return sortedList;
}

function renderContact(contact, divId, i) {
  const contactBadges = contact.nameInitials;
  const contactName = contact.name;
  const contactEmail = contact.email;
  divId.innerHTML += renderContactHtml(contactBadges, contactName, contactEmail, i);
}

function setElementBackgroundColor(elementId, colorId) {
  let div = document.getElementById(elementId);
  div.style.backgroundColor = contactColor[colorId];
}

function openContact(contactEmail, divId) {
  selectContact(divId);
  HideContactsListShowFullView();
  const contactDiv = document.getElementById("id-contact-full-mode-badges");
  let timeout = 0;
  if (contactDiv) {
    timeout = 500;
    toggleContactFullMode();
  }
  setTimeout(function () {
    renderContactFullMode(getContactData(contactEmail));
    toggleContactFullMode();
  }, timeout);
}

function getContactData(contactEmail) {
  for (let i = 0; i < contacts.length; i++) {
    if (contacts[i].email == contactEmail) {
      return contacts[i];
    }
  }
}

function renderContactFullMode(contact) {
  const div = document.getElementById("id-contact-full-mode");
  const { name, email, phone, nameInitials, color } = contact;
  div.innerHTML = renderContactFullModeHtml(name, email, phone, nameInitials);
  setElementBackgroundColor("id-contact-full-mode-badges", color);
  setTimeout(setListenerForEditDeleteBtn, 25);
  div.innerHTML += renderContactEditMenuMobile();
}

function setListenerForEditDeleteBtn() {
  handleHoverButtonChangeImg(
    ".contact-full-mode-edit-contact",
    ".edit-btn-img",
    'url("/img/edit-pencil.png")',
    'url("/img/edit-pencil-light-blue.png")'
  );
  handleHoverButtonChangeImg(
    ".contact-full-mode-delete-contact",
    ".delete-btn-img",
    'url("/img/trash-blue.png")',
    'url("/img/trash-light-blue.png")'
  );
}

function HideContactsListShowFullView() {
  let contactList = document.getElementById("id-contacts-list");
  let contactSingleView = document.getElementById("id-contacts-single-view");
  contactList.classList.add("d-none-mobile");
  contactSingleView.classList.remove("d-none-mobile");
}

function HideFullViewShowContactList() {
  let contactList = document.getElementById("id-contacts-list");
  let contactSingleView = document.getElementById("id-contacts-single-view");
  contactList.classList.remove("d-none-mobile");
  contactSingleView.classList.add("d-none-mobile");
}

function renderMobileAddContactButton() {
  document.getElementById("id-contacts-list").innerHTML += /*html*/ `
<div id="id-mobile-add-contact" class="mobile-add-contact join-button" onclick="openContactForm('addContact')">
    <img src="/img/person_add.png" alt="">
</div>
`;
}

function addShadowLayer() {
  let shadowLayer = document.getElementById("id-shadow-layer");
  shadowLayer.classList.remove("hide");
}

function removeShadowLayer() {
  let shadowLayer = document.getElementById("id-shadow-layer");
  shadowLayer.classList.add("hide");
}

function openContactEditMenu() {
  var element = document.getElementById("id-contact-full-mode-edit-mobile");
  element.classList.remove("hide");
}

function closeContactEditMenu() {
  if (window.width < 1080) {
    var element = document.getElementById("id-contact-full-mode-edit-mobile");
    element.classList.add("hide");
  }
}

function addClickListener() {
  var element = document.getElementById("id-contacts-single-view");
  element.addEventListener("click", function (event) {
    if (event.target.id !== "id-mobile-dot-menu" && event.target.id !== "dot-menu-img") {
      closeContactEditMenu();
    }
  });
}

function selectContact(selectedDiv) {
  const element = document.getElementById(`id-contact-list-item${selectedDiv}`);
  const contacts = document.querySelectorAll(".contact-list-item");
  contacts.forEach((contact) => {
    contact.classList.remove("selected");
  });
  element.classList.add("selected");
}

/**
 * Toggles the visibility of the contact form between visible and hidden.
 *
 * @return {void} No return value.
 */
function toggleContactForm() {
  const form = document.querySelector(".contact-form");
  if (form.classList.contains("contact-form-visible")) {
    form.classList.remove("contact-form-visible");
    form.classList.add("contact-form-hidden");
  } else {
    form.classList.remove("contact-form-hidden");
    form.classList.add("contact-form-visible");
  }
}

function toggleContactFullMode() {
  var element = document.getElementById("id-contact-full-mode");
  element.classList.toggle("contact-full-mode-right-0");
}
