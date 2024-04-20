let currentPrio = ['medium'];
let tasks = [];
let taskCategory = [];
let subTasks = [];
let checkedUsers = [];
let priorities = [
    {
        'text': 'Urgent',
        'iconWhite': '/img/urgent_white.png',
        'iconColor': '/img/urgent_red.png',
        'bgColorTrue': 'highlight-color-urgent',
        'bgColorFalse': 'bg-color-priority',
        'isPriority': false,
    },
    {
        'text': 'Medium',
        'iconWhite': '/img/medium_white.png',
        'iconColor': '/img/medium_orange.png',
        'bgColorTrue': 'highlight-color-medium',
        'bgColorFalse': 'bg-color-priority',
        'isPriority': true,
    },
    {
        'text': 'Low',
        'iconWhite': '/img/low_white.png',
        'iconColor': '/img/low_green.png',
        'bgColorTrue': 'highlight-color-low',
        'bgColorFalse': 'bg-color-priority',
        'isPriority': false,
    }
]
let checkChangeIcons = false;
let expanded = false;
let inputBorderError = false;

async function init() {
    includeHTML();
    loadTasks();
    loadContacts();
    whichPriority();
    await loadUsers();
    currentDate();
}

function currentDate() {
    let inputDateField = document.getElementById('dueDate');
    let todayDate = new Date();
    let year = todayDate.getFullYear();
    let month = todayDate.getMonth() + 1;
    let day = todayDate.getDate();

    if(month < 10) {
        month = '0' + month;
    }
    if(day < 10) {
        day = '0' + day;
    }
    let currentDate = year + '-' + month + '-' + day
    inputDateField.value = currentDate;
}

function changePrio(i) {
    currentPrio = priorities[i]['text'];
    priorities[i]['isPriority'] = true;
    whichPriority();
}

function whichPriority() {
    let prioSelection = document.getElementById('prioSelection');
    prioSelection.innerHTML = '';

    for(i = 0; i < priorities.length; i++) {
        priority = priorities[i];
        checkBooleanForPriority(priority);
    }
}

function checkBooleanForPriority(priority) {
    if(priority['isPriority'] == false) {
        prioSelection.innerHTML += prioNormal(priority);
    } else {
        prioSelection.innerHTML += prioActive(priority);
        priority['isPriority'] = false;
    }
}

async function loadTasks() {
    tasks = JSON.parse(await getItem('tasks'));
    subTasks = JSON.parse(await getItem('subTasks'));
}

async function addTask() {
    let title = document.getElementById('title');
    let description = document.getElementById('description');
    let dueDate = document.getElementById('dueDate');
    let category = document.getElementById('category');
    let subTaskForTask = subTasks;
    let checkedUsersForTask = checkedUsers;

    let task = {
        "title": title.value,
        "description": description.value,
        "assignedTo": checkedUsers,
        "dueDate": dueDate.value,
        "prio": currentPrio,
        "category": taskCategory,
        "subTasks": subTaskForTask,
        "checkedUsers": checkedUsersForTask,
        "statement": "toDo",
        }
    tasks.push(task);
    // addedToBoard();
    await setItem('tasks', tasks);
    resetInputFields();
    window.location.href = "board.html";
}

function addedToBoard() {
    let bgDialog = document.getElementById('bgDialog');

    bgDialog.classList.remove('vs-hidden');
    bgDialog.classList.add('align-center');
}

function resetInputFields() {
    let subTasks =  document.getElementById('subTasks');
    let initialArea = document.getElementById('initialArea');
    let newSubTaskField = document.getElementById('newSubTaskField');
    // let containerCategory = document.getElementById('containerCategory');

    title.value = '';
    description.value = '';
    initialArea.innerHTML = '';
    // containerCategory.innerHTML = 'Select task category';
    subTasks.value = '';
    newSubTaskField.innerHTML = '';
    currentDate();
    changeCategory('Select task category');
    setItem('subTasks', []);

    checkChangeIcons = true;
    changeIconsSubtask();
}

function resetAddNewSubtask() {
    let subTasks =  document.getElementById('subTasks');
    subTasks.value = '';
    checkChangeIcons = true;
    changeIconsSubtask();
}

function addNewSubTask() {
    let singleNewTask = document.getElementById('subTasks');
    let singleNewTaskValue = singleNewTask.value;

    if(singleNewTaskValue.length >= 3){
        subTasks.push(singleNewTaskValue);
    }
    renderSubTasks('newSubtask');
}

async function renderSubTasks(operator) {
    let newTaskField = document.getElementById('newSubTaskField');
    let singleNewTask = document.getElementById('subTasks');
    singleNewTask.value = '';
    newTaskField.innerHTML = '';

    for(i = 0; i < subTasks.length; i++) {
        let newSubTask = subTasks[i];
        newTaskField.innerHTML += returnHtmlNewSubtasks(newSubTask);
    }

    if(operator == 'newSubtask') {
        checkChangeIcons = true;
        changeIconsSubtask();
        await setItem('subTasks', subTasks);
    }
}

function changeIconsSubtask() {
    let addIconSubtasks = document.getElementById('addIconSubtasks');
    let subTask = document.getElementById('inputFieldSubtasks');

    addIconSubtasks.innerHTML = '';

    if(checkChangeIcons == false) {
        addIconSubtasks.innerHTML = returnHtmlCheckAndClear();
        subTask.classList.add('fill-border');
        checkChangeIcons = false;
        renderSubTasks();
    } else {
        addIconSubtasks.innerHTML = returnHtmlAdd();
        subTask.classList.remove('fill-border');
        checkChangeIcons = false;
    }
    renderSubTasks();
}

function preventFocusLoss(event) {
    event.preventDefault();
}

function showCheckboxes(event) {
    preventFocusLoss(event);
    let checkboxes = document.getElementById("checkboxes");
    let assignedBtn = document.getElementById('inputToSearchContact');

    if (!expanded) {
        checkboxes.classList.remove('vs-hidden');
        assignedBtn.placeholder = 'Search Contact';
        assignedBtn.classList.toggle('fill-border');
        renderAssignedToField();
        expanded = true;
    } else {
        assignedBtn.classList.remove('fill-border');
        toggleUserListInitials(assignedBtn) 
        expanded = false;
        showInitials();
        event.target.blur();
    }
}

function toggleUserListInitials(assigned) {
    let checkboxes = document.getElementById("checkboxes");

    checkboxes.classList.toggle('user-list');
    checkboxes.classList.toggle('d-flex-initials');
}

function renderAssignedToField() {
    let userCheckBox = document.getElementById('checkboxes');
    userCheckBox.innerHTML = '';

    if(!userCheckBox.classList.contains('user-list')) {
        toggleUserListInitials();
    }

    for(i = 0; i < contactsInit.length; i++){;
        user = contactsInit[i];
        userCheckBox.innerHTML += 
            returnHtmlSingleContact(user);
            backgroundColorInitials(i, 'none');
    }

    if(checkedUsers.length > 0) {
        for(i = 0; i < contactsInit.length; i++){;
            examineUser(i);   
        }
    }
}

function examineUser(i) {
    // let currentLabel = document.getElementById(`checkBox${i}`);
    let currentName = contactsInit[i]['name'];
    let checkBox = document.getElementById(`checkBox${i}`);
    let userField = document.getElementById(`userField${i}`);
    let paddingForChecked = document.getElementById(`paddingForChecked${i}`);
    let index = checkedUsers.findIndex(item => JSON.stringify(item['name']) === JSON.stringify(currentName));
        
    if(index != -1) {
        checkBox.classList.remove('box-unchecked');
        paddingForChecked.classList.add('pd-right-16');
        userField.classList.add('bg-checked');
        userField.classList.remove('hover-user-field');
        paddingForChecked.classList.add('hover-assigned')
    }
}

function backgroundColorInitials(i, whichArea) {
    if(whichArea == 'showInitial') {
        let checkedUserColor = checkedUsers[i]['color'];
        let bgColorCheckedUser = contactColor[checkedUserColor];
        let bgInitials = document.getElementById(`initialArea${i}`);
        bgInitials.style.backgroundColor = bgColorCheckedUser;
    } else {
        let currentColor = contactsInit[i]['color'];
        let bgColorContacts = contactColor[currentColor];
        let bgInitials = document.getElementById(`bgInitials${i}`)
        bgInitials.style.backgroundColor = bgColorContacts;
    }
}

function selectedUser(i) {
    let singleUser = contactsInit[i];
    let currentIndex = checkedUsers.indexOf(singleUser);

    if(!checkedUsers.includes(singleUser, 0)) {
        checkedUsers.push(singleUser);
        toggleForCheckedUser(i);
    } else {
        checkedUsers.splice(currentIndex, 1);
        toggleForCheckedUser(i);
    }
}

function toggleForCheckedUser(i) {
    let checkBox = document.getElementById(`checkBox${i}`);
    let userField = document.getElementById(`userField${i}`);
    let paddingForChecked = document.getElementById(`paddingForChecked${i}`);

    checkBox.classList.toggle('box-unchecked');
    userField.classList.toggle('hover-user-field');
    paddingForChecked.classList.toggle('pd-right-16');
    userField.classList.toggle('bg-checked');
    paddingForChecked.classList.toggle('hover-assigned');
}

function showInitials() {
    let initialsArea = document.getElementById('checkboxes');
    initialsArea.innerHTML = '';

    for(i = 0; i < checkedUsers.length; i++) {
        let singleUser = checkedUsers[i]['name'];
        let nameParts = singleUser.split(" ");
        let firstLetter = nameParts[0].substring(0, 1);
        if(nameParts.length == 2) {
            let secondLetter = nameParts[1].substring(0, 1);
            let nameInitial = firstLetter + secondLetter;
            initial = nameInitial;
        } else {
            initial = firstLetter;
        }
        initialsArea.innerHTML += `<div id="initialArea${i}" class="initial-area initials">${initial}</div>`
        backgroundColorInitials(i, 'showInitial');
    }
}

// function searchContact() {
//     let inputSearchContact = document.getElementById('inputToSearchContact').value;
//     let userList = document.getElementById('checkboxes');

//     searchContact.splice(0, searchContact.length);
//     if(inputSearchContact.length >= 3) {
//         for(i = 0; i < currentPokemons.length; i++) {
//             checkIncludesSearch(i, inputSearchContact);
//         }
//         inputSearchContact = inputSearchContact.toLowerCase();
//         userList.innerHTML = '';
//         filterContact()
//         userList.innerHTML = 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Tenetur vero, obcaecati autem ullam inventore, doloribus eaque voluptates voluptatibus deleniti, amet architecto. Quae delectus nulla, est illum debitis veritatis expedita consequatur?';
//     } else {
//         renderAssignedToField();
//     }
// }

function editSubtask(i) {
    let subTaskField = document.getElementById(`subTaskElement${i}`);
    let subTask = subTasks[i];
    let subTaskElement = document.getElementById(`subTaskElement${i}`);
    let ulSubtasks = document.getElementById(`ulSubtasks(${i})`);

    subTaskField.classList.add('fill-border-bottom');

    if(ulSubtasks) {
        subTaskElement.classList.add('li-edit');
        subTaskElement.classList.add('pd-inline-start');
        ulSubtasks.classList.add('pd-inline-start');

        subTaskField.innerHTML = '';
        subTaskField.innerHTML = editSubtaskHtml(i, subTask);
        inputFocus(i);
    }
}

function deleteSubtask(i) {
    subTasks.splice(i, 1);
    setItem('subTasks', subTasks);
    renderSubTasks();
}

async function changeSubtask(i) {
    let changedSubTask = document.getElementById(`inputField${i}`).value;
    subTasks[i] = changedSubTask;
    await setItem('subTasks', subTasks);
    renderSubTasks();
}

function inputFocus(i) {
    let inputField = document.getElementById(`inputField${i}`);
    inputField.focus();
    inputField.setSelectionRange(inputField.value.length, inputField.value.length);
}

function showCategories() {
    let categoriesField = document.getElementById('categories');

    categoriesField.classList.toggle('vs-hidden');

    if(!categoriesField.classList.contains('vs-hidden')) {
        categoriesField.focus();
    }
}

function changeCategory(category) {
    let clickedCategory = category;
    let categoryDropdown = document.getElementById('categoryDropdown');

    categoryDropdown.innerHTML = '';
    categoryDropdown.innerHTML = clickedCategory;

    taskCategory.push(clickedCategory);
}

// <--------------------- html templates ---------------------------->

function returnHtmlSingleContact(user) {
    return `
    <div class="" id="paddingForChecked${i}" onclick="selectedUser(${i})">
        <div class="user-field hover-user-field" id="userField${i}">
            <div class="single-user">
                <div class="initials-assigned initials" id="bgInitials${i}">
                    ${user['nameInitials']}
                </div>
                <span class="typography-contacts-assigned">${user['name']}</span>
            </div>
            <label class="custom-checkbox" for="box${i}">
            <input type="checkbox" />
            <div id="checkBox${i}" class="box-unchecked">
                <span></span>
            </div>
        </div>
    </div>`
}
function returnHtmlCheckAndClear() {
    return `
    <div id="activeInputSubtask" class="active-input-subtasks">
        <a class="hover" onclick="resetAddNewSubtask()"><img src="/img/close.png"></a>
        <span class="height-24">|</span>
        <a class="hover" onclick="addNewSubTask()"><img src="/img/Property 1=check.png"></a>
    </div>`
}

function returnHtmlAdd() {
    return `
    <a id="addIconSubtasks" onclick="addNewSubTask()" class="icon-subtask-field hover"><img src="/img/add.png"></a>`
}

function prioNormal(priority) {
    return `
    <div id="prioUrgent" onclick="changePrio(${i})" class="selection-field ${priority['bgColorFalse']}">
        <span class="fz-20">${priority['text']}</span>
        <img id="imgUrgent" src="${priority['iconColor']}">
    </div>`
}

function prioActive(priority) {
    return `
    <div id="prioUrgent" onclick="changePrio(${i})" class="selection-field ${priority['bgColorTrue']}">
        <span class="fz-20">${priority['text']}</span>
        <img id="imgUrgent" src="${priority['iconWhite']}">
    </div>`
}

function returnHtmlNewSubtasks(newSubTask) {
    return `
    <ul id="ulSubtasks(${i})" class="list-element-subtasks" onclick="editSubtask(${i})">
        <li id="subTaskElement${i}">${newSubTask}</li>
    </ul>`
}

function editSubtaskHtml(i, subTask) {
    return `
    <form class="label-edit-subtask">
        <input id="inputField${i}" class="edit-subtask" type="text" value="${subTask}">
        <div class="single-edit-subtask">
            <img class="hover" src="/img/trashbin.png" onclick="deleteSubtask(${i})">
            <span>|</span>
            <img class="hover" src="/img/Property 1=check.png" onclick="changeSubtask(${i})">
        </div>
    </form>`
}

// <--------------Funktionen für EventListener----------------------->

// document.addEventListener('DOMContentLoaded', function() {
//     let dateInput = document.getElementById('dueDate');
//     let requiredDate = document.getElementById('requiredDate');
//     let taskArea = document.getElementById('description');
//     let assignedBtn = document.getElementById('inputToSearchContact');
//     let subTask = document.getElementById('subTasks');
//     let subTaskField = document.getElementById('inputFieldSubtasks')
//     let inputToSearchContact = document.getElementById("inputToSearchContact");
//     let containerCategory = document.getElementById("containerCategory");
//     // let checkbox = document.getElementById('checkboxes');
    

//     dateInput.addEventListener('change', changeBorder);
//     dateInput.addEventListener('keydown', changeBorder);
//     dateInput.addEventListener('blur', function() {
//         resetDateInput(dateInput, requiredDate);
//     })
    
//     function changeBorder() {
//         dateInput.classList.remove('fill-border');
//         let dateInputValue = dateInput.value;

//         if (inputBorderError == false && dateInputValue == '') {
//             requiredDate.classList.remove('vs-hidden');
//             dateInput.classList.add('error-border');
//             inputBorderError = true;
//         } else if(dateInputValue == '') {
//             requiredDate.classList.remove('vs-hidden');
//             dateInput.classList.add('error-border');
//             inputBorderError = true;
//         } else {
//             requiredDate.classList.add('vs-hidden');
//             dateInput.classList.remove('error-border');
//             dateInput.classList.add('fill-border');
//             inputBorderError = false;
//         }
//     }

//     function resetDateInput(dateInput, requiredDate) {
//         if(inputBorderError == false) {
//             requiredDate.classList.add('vs-hidden');
//             dateInput.classList.remove('error-border');
//             dateInput.classList.remove('fill-border');
//         }
//     }

//     taskArea.addEventListener('click', function() {
//         taskArea.classList.add('fill-border');
//     })

//     taskArea.addEventListener('blur', function() {
//         taskArea.classList.remove('fill-border');
//     })

//     inputToSearchContact.addEventListener('blur', function() {
//         inputToSearchContact.classList.remove('fill-border');
//         showCheckboxes();
//     })

//     // containerCategory.addEventListener('blur', function() {
//     //     showCategories();
//     // })

//     // subTask.addEventListener('blur', function() {
//     //     checkChangeIcons = true;
//     //     changeIconsSubtask();
//     // })
// });

// document.addEventListener('DOMContentLoaded', function() {
//     let title = document.getElementById('title');
//     let requiredTitle = document.getElementById('requiredTitle');

//     title.addEventListener('click', function() {
//         changeBorder(title, requiredTitle);
//     });

//     title.addEventListener('keydown', function() {
//         changeBorder(title, requiredTitle);
//     });

//     title.addEventListener('blur', function() {
//         resetInputTitle(title, requiredTitle);
//     })
    
//     function changeBorder(titleId, fieldId) {
//         titleId.classList.remove('fill-border');
//         let titleIdValue = titleId.value;

//         if (titleIdValue == 0) {
//             fieldId.classList.remove('vs-hidden');
//             titleId.classList.add('error-border');
//         } else if(titleIdValue.length < 2) {
//             fieldId.classList.remove('vs-hidden');
//             titleId.classList.add('error-border');
//         } else if(titleIdValue.length >= 0) {
//             fieldId.classList.add('vs-hidden');
//             titleId.classList.remove('error-border');
//             titleId.classList.add('fill-border');
//         }
//     }
// })