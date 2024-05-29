// local storage data
gender = localStorage.getItem('gender');
yob = localStorage.getItem('yob');
ids = localStorage.getItem('symptomIds');
gender = gender.substr(1, gender.length - 2)
yob = yob.substr(1, yob.length - 2);
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
const table = document.querySelector("table");
async function fetchDataFromAPI(url) {
    const data = await fetch(url, {
        method: 'GET',
    })
    return data;
}
getResults();
async function getResults() {
    await getToken();
    const fetchData = await fetchDataFromAPI(`https://healthservice.priaid.ch/diagnosis?symptoms=${ids}&gender=${gender}&year_of_birth=${yob}&token=${token}&format=json&language=en-gb`);
    const results = await fetchData.json();
    console.log(results.length);
    if (results.length == 0) {
        document.querySelector(".pop-up-bg").style.display = "flex"
    }
    else {
        results.forEach(result => {

            console.log(result.Issue.Name);
            let tableRow = document.createElement("tr");
            let diseaseTd = document.createElement("td");
            let accuracyTd = document.createElement("td");
            let doctorSpecialization = document.createElement("td");
            tableRow.appendChild(diseaseTd);
            tableRow.appendChild(accuracyTd);
            tableRow.appendChild(doctorSpecialization);
            diseaseTd.innerText = result.Issue.Name;
            accuracyTd.innerText = result.Issue.Accuracy + "%";


            const docsList = result.Specialisation;
            doctorSpecialization.innerText += `${docsList[0].Name} `
            for (var i = 1; i < docsList.length; i++) {
                doctorSpecialization.innerText += `, ${docsList[i].Name}`
            }
            // result.Specialisation.forEach(doctorType => {
            //     console.log(doctorType.Name)
            //     doctorSpecialization.innerText += `${doctorType.Name} `
            // })
            table.appendChild(tableRow)
        });
    }
}

