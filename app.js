const dropdownOptions = document.querySelector(".dropdown-options ul");
const dropdown = document.querySelector(".dropdown");
let focusedSymptomField;
//Setup event listener for the first input field
SetupEvtForSymptomField(dropdown)

let symptomsData;
let symptoms = new Map();
let token;
//get Token
async function getToken() {
    var myHeaders = new Headers();
    myHeaders.append("Authorization", "Bearer " + username + ":" + encodedPassword);

    var raw = "";

    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
    };
    await fetch("https://authservice.priaid.ch/login", requestOptions)
        .then(response => response.json())
        .then((result) => { token = result.Token })
        .catch(error => console.log('error', error));
}
// Fetch data from API
async function getSymptoms() {
    await getToken();
    const fetchData = await fetchDataFromAPI(`https://healthservice.priaid.ch/symptoms?token=${token}&format=json&language=en-gb`);
    symptomsData = await fetchData.json();

    symptomsData.forEach(symptomData => {
        let name = symptomData.Name.toLowerCase();
        symptoms[name] = symptomData.ID
    })
    symptomsData.forEach(symptomData => {
        let listDiv = document.createElement("li");
        listDiv.innerText = symptomData.Name
        dropdownOptions.appendChild(listDiv);
    })
    const dropdownListOptions = document.querySelectorAll(".dropdown-options ul li");

    dropdownListOptions.forEach(list => {
        list.addEventListener("click", setSymptomOnClick);
    })
}
getSymptoms();
async function fetchDataFromAPI(url) {
    const data = await fetch(url, {
        method: 'GET',
    })
    return data;
}

document.body.addEventListener("click", (e) => {
    if (!e.target.classList.contains("dropdown")) {
        dropdownOptions.style.display = "none"
    }
})

document.querySelector(".button-see-results").addEventListener("click", OnGetResults);

// Autogenerate new symptom 
let nameIndex = 0;
const addSymptomsButton = document.querySelector(".add-symptoms");
const autoGenerateSymptoms = document.querySelector(".all-symptoms-autogenerate")

addSymptomsButton.addEventListener("click", () => {
    nameIndex++;
    let div = document.createElement("div");
    div.classList.add("dropdown-container");
    const strHtmlCode = `<div class="searchInput"> \
    <input class="dropdown" type="text" name="Symptoms-${nameIndex}" required> \
    <label for="Symptoms-${nameIndex}" class="label-name"> <span class="content-name"> \
            Symptoms \
        </span></label>\
</div> `;
    div.innerHTML = strHtmlCode;
    autoGenerateSymptoms.appendChild(div)

    const element = div.querySelector(".dropdown");
    SetupEvtForSymptomField(element);

    // const list = autoGenerateSymptoms.querySelectorAll(".dropdown");

    // list.forEach((element) => {
    //     SetupEvtForSymptomField(element);
    // });
})

// Calculate position of element
function offset(el) {
    var rect = el.getBoundingClientRect(),
        scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
        scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    return { top: rect.top + scrollTop, left: rect.left + scrollLeft }
}

function SetupEvtForSymptomField(element) {
    element.addEventListener("click", (evt) => {
        let dropdownPosition = offset(element)

        document.querySelector(".dropdown-options").style.top = `${dropdownPosition.top + 60}px`
        dropdownOptions.style.display = "flex";
        ResetDropdownOptions();

        focusedSymptomField = evt.target;
    })

    element.addEventListener("input", (e) => {
        CalculateDropdownOptions(e)

        //Dropdown
        let dropdownPosition = offset(element)
        document.querySelector(".dropdown-options").style.top = `${dropdownPosition.top + 60}px`
        dropdownOptions.style.display = "flex";
        focusedSymptomField = evt.target;
    })
}


//Dropdown related functions
function RemoveDropdownChildren() {
    let children = dropdownOptions.querySelectorAll("li");
    children.forEach(child => {
        dropdownOptions.removeChild(child);
    });
}
function ResetDropdownOptions() {
    RemoveDropdownChildren();
    symptomsData.forEach(symptom => {
        let listDiv = document.createElement("li");
        listDiv.innerText = symptom.Name;
        dropdownOptions.appendChild(listDiv);
        listDiv.addEventListener("click", setSymptomOnClick);
    })
}
function CalculateDropdownOptions(selectedInputTag) {
    let targetName = selectedInputTag.target.value
    targetName = targetName.toLowerCase();

    if (!targetName) {
        ResetDropdownOptions();
    }
    else {
        RemoveDropdownChildren();
        symptomsData.forEach(symptom => {
            let name = symptom.Name;
            name = name.toLowerCase();
            if (name.includes(targetName)) {
                let listDiv = document.createElement("li");
                listDiv.innerText = symptom.Name;
                dropdownOptions.appendChild(listDiv);
                listDiv.addEventListener("click", setSymptomOnClick);
            }
        })
    }
}

//Set sympton name field on click 
function setSymptomOnClick(e) {
    focusedSymptomField.value = e.target.innerText
}

function OnGetResults() {
    let isValid = true;

    yob = document.querySelector("input[name = year-of-birth]").value.toLowerCase();
    gender = document.querySelector("input[name = gender]").value.toLowerCase();

    if (gender == "m") { gender = "male" }
    else if (gender == "f") { gender = "female" }

    if (!yob || !gender) { isValid = false; }
    else if (!(gender == "male" || gender == "female")) { isValid = false; }

    let yobNum = parseInt(yob);
    if (yobNum == NaN || yobNum <= 1900 || yobNum >= 2022) { isValid = false; }

    let symptomIsFilled = false;
    const selectedSymptoms = autoGenerateSymptoms.querySelectorAll(".dropdown");
    let symptomIds = [];
    selectedSymptoms.forEach(symptom => {
        let name = symptom.value.toLowerCase();
        let id = symptoms[name]
        if (name != "" && id == undefined) {
            isValid = false;
        }

        if (name) {
            symptomIsFilled = true;
        }

        if (id != undefined) {
            symptomIds.push(id);
        }
    })

    if (!symptomIsFilled) { isValid = false; }  //Checks to see if all symptoms were empty

    //Validation over.....
    //yobNum, gender, symptomIds
    if (isValid) {
        document.querySelector(".error").style.display = "none";
        localStorage.setItem('yob', JSON.stringify(yob))
        localStorage.setItem('gender', JSON.stringify(gender))
        localStorage.setItem('symptomIds', JSON.stringify(symptomIds))
        window.location.href = "./results.html";

    }
    else {
        document.querySelector(".error").style.display = "flex";
    }


}
