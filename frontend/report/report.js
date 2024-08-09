
const statusOptions = [
    { status: "Injured", class: "warning" },
    { status: "Rescued", class: "success" },
    { status: "Found", class: "success" },
    { status: "Stranded", class: "warning" },
    { status: "Healthy", class: "success" },
    { status: "Deceased", class: "danger" },
    { status: "Hospitalized", class: "warning" },
    { status: "Returned to Home", class: "success" }
];
statusOptions.map(status => { status.status })
let data = [];
var currUpdatingEntry;
// Global variable to hold the grid options
let gridApi;



const columnDefs = [
    {
        title: "Name", field: "name", width: 200
    },

    {
        title: "Nickname", field: "nickname", width: 150
    },

    {
        title: "Family Name", field: "familyName", width: 250
    },

    {
        title: "Age", field: "age", width: 80,
        valueParser: numberParser
    },

    {
        title: "Sex", field: "sex", width: 80,
        cellEditor: 'agSelectCellEditor',
        cellEditorParams: {
            values: ["Male", "Female", "Other"]
        },
    },

    {
        title: "Place", field: "place"
    },

    {
        title: "Status", field: "status", cellEditor: 'agSelectCellEditor', width: 150, editable: true,
        headerTooltip: "Status Change",
        tooltipValueGetter: () => "Double click to update current status",
        cellEditorParams: {
            values: statusOptions.map(option => option.status)
        },

        cellClass: params => {
            return "cell-" + getCellStyle(params.data.status);
        },

    },

    {
        title: "Prev Status", field: "prev_status",
        cellClass: params => {
            return "cell-" + getCellStyle(params.data.prev_status);
        },

    },

    {
        title: "I Agree", field: "up_vote", width: 100,
        cellRenderer: voteRenderer, filter: false
    },

    {
        title: "I don't Agree", field: "down_vote", width: 100,
        cellRenderer: voteRenderer, filter: false
    },

    // { title: "Prev Counters", field: "prev_counter" },

    {
        title: "Date & Time", field: "updated_time", cellRenderer: dateRenderer
    }
];

const gridOptions = {
    columnDefs: columnDefs,
    rowData: [],
    rowHeight: 50,
    tooltipShowDelay: 0,
    tooltipHideDelay: 2000,
    defaultColDef: {
        sortable: true,
        filter: true,
        editable: false,
        resizable: true,
        cellStyle: { textAlign: 'center' }
    },
    onCellValueChanged: onCellValueChanged,
    onGridReady: function (params) {
        params.api.applyColumnState({
            state: [{ colId: "updated_time", sort: "desc" }],
            defaultState: { sort: null },
        });
    }
};




// Function to initialize the grid with data
async function initializeGrid() {

    // Fetch data and update the grid
    const data = await fetchReportData();
    if (data) {
        gridApi.setGridOption('rowData', data);
    } else {
        console.log("Data loading failed ", data)
    }
}

async function fetchReportData(searchQuery) {
    showLoadingIcon(); // Show loading screen before the request    
    try {
        let apiUrl = 'https://fie5mxoea4.execute-api.ap-south-1.amazonaws.com/prod?persons=true';
        if (searchQuery) {
            apiUrl += '&search=' + searchQuery;
        }
        const apiKey = 'iRhRWA3DDk2nnFBVfMQjC5wKEZ1F875s7HBCP9pc';
        const api_response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'x-api-key': apiKey,
                'Content-Type': 'application/json'
            }
        })
        data = await api_response.json();
        return data; // Return the fetched data
    } catch (error) {
        console.error('Error fetching report data:', error);
        return null;
    } finally {
        hideLoadingIcon(); // Hide loading screen after the request completes
    }
}

// Iniitialize other methods and triggers
document.addEventListener('DOMContentLoaded', function () {

    var gridDiv = document.querySelector("#myGrid");
    gridApi = agGrid.createGrid(gridDiv, gridOptions);
    // gridApi.setGridOption('rowData', sampleData);

    initializeGrid();

    const saveButton = document.getElementById('saveButton');
    saveButton.addEventListener('click', function () {
        const editedEntries = getEditedEntries();
        if (editedEntries.length > 0) {
            const whoisModal = new bootstrap.Modal(document.getElementById('whoisModal'));
            whoisModal.show();
        } else {
            console.log('No edited entries to save.');
            alert("No entries to save!")
        }
    });

    // Initialize Who Is Form
    const whoisForm = document.getElementById('whoisForm');
    const maxLength = 50; // Example max length
    var storedVal = JSON.parse(localStorage.getItem('whoami'));
    if (storedVal && storedVal.name) {
        whoisForm.elements['name'].value = storedVal.name;
        whoisForm.elements['place'].value = storedVal.place ? storedVal.place : "";
        whoisForm.elements['phone'].value = storedVal.phone ? storedVal.phone : "";
    }

    whoisForm.addEventListener('submit', function (event) {
        let isValid = true;
        const name = whoisForm.elements['name'];
        const place = whoisForm.elements['place'];
        const phone = whoisForm.elements['phone'];
        const notes = whoisForm.elements['notes'];

        // Clear previous error messages
        document.querySelectorAll('.invalid-feedback').forEach(el => el.textContent = '');

        // Validate name
        if (!name.value || name.value.length > maxLength) {
            isValid = false;
            name.classList.add('is-invalid');
            document.getElementById('nameError').textContent = `Name is required and must be less than ${maxLength} characters.`;
        } else {
            name.classList.remove('is-invalid');
        }

        // Validate place
        if (!place.value || place.value.length > maxLength) {
            isValid = false;
            place.classList.add('is-invalid');
            document.getElementById('placeError').textContent = `Place is required and must be less than ${maxLength} characters.`;
        } else {
            place.classList.remove('is-invalid');
        }

        // Validate phone
        const contactPattern = /^(\+\d{1,3}[- ]?)?\d{10}$/;
        if (!phone.value || phone.value.length > maxLength || !contactPattern.test(phone.value)) {
            isValid = false;
            phone.classList.add('is-invalid');
            document.getElementById('contactError').textContent = `Please enter a valid phone number (Country code accepted).`;
        } else {
            phone.classList.remove('is-invalid');
        }

        // Validate notes
        if (notes.value && notes.value.length > maxLength) {
            isValid = false;
            notes.classList.add('is-invalid');
            document.getElementById('notesError').textContent = `Note must be less than ${maxLength} characters.`;
        } else {
            place.classList.remove('is-invalid');
        }


        if (!isValid) {
            event.preventDefault(); // Prevent form submission
        } else {
            // Read form values
            const formData = {
                name: name.value,
                place: place.value,
                phone: phone.value,
                notes: notes.value
            };
            const editedEntries = getEditedEntries();
            editedEntries.forEach(entry => {
                entry.updated_by = formData;
                prepareDataForUpdate(entry)
            })

            localStorage.setItem('whoami', JSON.stringify(formData));
            // Submit to API
            saveData(editedEntries);
        }
    });

});


function numberParser(params) {
    const newValue = params.newValue;
    const parsedValue = parseInt(newValue);
    return isNaN(parsedValue) ? null : parsedValue;
}


function dateRenderer(params) {
    const date = new Date(params.value);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const timezone = date.toTimeString().split(' ')[1];
    return `${day}/${month}/${year} ${hours}:${minutes}`;
}

// Function to handle cell value changes
function onCellValueChanged(event) {
    event.data.edited = true;
}


// Function to get edited entries
function getEditedEntries() {
    const editedEntries = [];
    gridApi.forEachNode(function (node) {
        if (node.data.edited) {
            editedEntries.push(node.data);
        }
    });
    return editedEntries;
}


function getCellStyle(status) {
    switch (status) {
        case "Injured":
        case "Stranded":
        case "Hospitalized":
            return "warning";
        case "Rescued":
        case "Found":
        case "Healthy":
        case "Returned to Home":
            return "success";
        case "Deceased":
            return "danger";
        default:
            return "";
    }
}


function voteRenderer(params) {
    isUpVote = params.column.colId == "up_vote";
    cellValue = params.data;
    if (isUpVote) {
        const up_vote = cellValue.up_vote ? cellValue.up_vote : 0;
        cellValue.up_vote = up_vote;
        thumpsUpSVG = "M6.956 1.745C7.021.81 7.908.087 8.864.325l.261.066c.463.116.874.456 1.012.965.22.816.533 2.511.062 4.51a10 10 0 0 1 .443-.051c.713-.065 1.669-.072 2.516.21.518.173.994.681 1.2 1.273.184.532.16 1.162-.234 1.733q.086.18.138.363c.077.27.113.567.113.856s-.036.586-.113.856c-.039.135-.09.273-.16.404.169.387.107.819-.003 1.148a3.2 3.2 0 0 1-.488.901c.054.152.076.312.076.465 0 .305-.089.625-.253.912C13.1 15.522 12.437 16 11.5 16H8c-.605 0-1.07-.081-1.466-.218a4.8 4.8 0 0 1-.97-.484l-.048-.03c-.504-.307-.999-.609-2.068-.722C2.682 14.464 2 13.846 2 13V9c0-.85.685-1.432 1.357-1.615.849-.232 1.574-.787 2.132-1.41.56-.627.914-1.28 1.039-1.639.199-.575.356-1.539.428-2.59z";
        return '<button type="button" class="btn btn-sm btn-outline-success vote" id="upVote_' + cellValue.id + '" onclick="incrementVote(\'' + cellValue.id + '\')">' +
            '<svg class="vote-svg" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-hand-thumbs-up-fill" viewBox="0 0 16 16">' +
            '<path d="' + thumpsUpSVG + '"></path>' +
            '</svg> <span>' + up_vote + '</span></button>';
    } else {
        down_vote = cellValue.down_vote ? cellValue.down_vote : 0;
        cellValue.down_vote = down_vote;
        thumpsDownSVG = "M6.956 14.534c.065.936.952 1.659 1.908 1.42l.261-.065a1.38 1.38 0 0 0 1.012-.965c.22-.816.533-2.512.062-4.51q.205.03.443.051c.713.065 1.669.071 2.516-.211.518-.173.994-.68 1.2-1.272a1.9 1.9 0 0 0-.234-1.734c.058-.118.103-.242.138-.362.077-.27.113-.568.113-.856 0-.29-.036-.586-.113-.857a2 2 0 0 0-.16-.403c.169-.387.107-.82-.003-1.149a3.2 3.2 0 0 0-.488-.9c.054-.153.076-.313.076-.465a1.86 1.86 0 0 0-.253-.912C13.1.757 12.437.28 11.5.28H8c-.605 0-1.07.08-1.466.217a4.8 4.8 0 0 0-.97.485l-.048.029c-.504.308-.999.61-2.068.723C2.682 1.815 2 2.434 2 3.279v4c0 .851.685 1.433 1.357 1.616.849.232 1.574.787 2.132 1.41.56.626.914 1.28 1.039 1.638.199.575.356 1.54.428 2.591";
        return '<button type="button" class="btn btn-sm btn-outline-danger vote" id="downVote_' + cellValue.id + '" onclick="decrementVote(\'' + cellValue.id + '\')">' +
            '<svg class="vote-svg" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-hand-thumbs-up-fill" viewBox="0 0 16 16">' +
            '<path d="' + thumpsDownSVG + '"></path>' +
            '</svg> <span>' + down_vote + '</span></button>';

    }
}


// UpVote listner
function incrementVote(id) {
    const val = data.find(value => value.id == id);
    currVote = val.up_vote;
    const btn = document.querySelector('#upVote_' + id);
    if (btn.classList.contains("btn-success")) {
        // Remove the upvote
        btn.classList.add('btn-outline-success');
        btn.classList.remove('btn-success');
        currVote--;
    } else {
        // Upvoting
        btn.classList.remove('btn-outline-success');
        btn.classList.add('btn-success');
        currVote++;
    }
    countElement = btn.querySelector('span');
    countElement.textContent = currVote;
    val.up_vote = currVote;
    val.edited = true;

    // Check down vote btn behaviour 

    const downBtn = document.querySelector('#downVote_' + id);
    if (downBtn.classList.contains("btn-danger")) {
        decrementVote(id);
    }
    saveVote(val);
}

// DownVote listner
function decrementVote(id) {
    const val = data.find(value => value.id == id);
    currVote = val.down_vote;
    const btn = document.querySelector('#downVote_' + id);
    if (btn.classList.contains("btn-danger")) {
        // Remove the upvote
        btn.classList.add('btn-outline-danger');
        btn.classList.remove('btn-danger');
        currVote--;
    } else {
        // Upvoting
        btn.classList.remove('btn-outline-danger');
        btn.classList.add('btn-danger');
        currVote++;
    }
    countElement = btn.querySelector('span');
    countElement.textContent = currVote;
    val.down_vote = currVote;
    val.edited = true;
    /**
     * 
     * TODO:  API Call to upvote the entry 
     * 
     */

    const upBtn = document.querySelector('#upVote_' + id);
    if (upBtn.classList.contains("btn-success")) {
        incrementVote(id);
    }

    saveVote(val);
}

function voteGenerator(cellData) {
    if (cellData.isUpVote) {
        const up_vote = cellData.data.up_vote ? cellData.data.up_vote : 0;
        cellData.data.up_vote = up_vote;
        thumpsUpSVG = "M6.956 1.745C7.021.81 7.908.087 8.864.325l.261.066c.463.116.874.456 1.012.965.22.816.533 2.511.062 4.51a10 10 0 0 1 .443-.051c.713-.065 1.669-.072 2.516.21.518.173.994.681 1.2 1.273.184.532.16 1.162-.234 1.733q.086.18.138.363c.077.27.113.567.113.856s-.036.586-.113.856c-.039.135-.09.273-.16.404.169.387.107.819-.003 1.148a3.2 3.2 0 0 1-.488.901c.054.152.076.312.076.465 0 .305-.089.625-.253.912C13.1 15.522 12.437 16 11.5 16H8c-.605 0-1.07-.081-1.466-.218a4.8 4.8 0 0 1-.97-.484l-.048-.03c-.504-.307-.999-.609-2.068-.722C2.682 14.464 2 13.846 2 13V9c0-.85.685-1.432 1.357-1.615.849-.232 1.574-.787 2.132-1.41.56-.627.914-1.28 1.039-1.639.199-.575.356-1.539.428-2.59z";
        return '<button type="button" class="btn btn-sm btn-outline-success vote" id="upVote_' + cellData.data.id + '" onclick="incrementVote(\'' + cellData.data.id + '\')">' +
            '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-hand-thumbs-up-fill" viewBox="0 0 16 16">' +
            '<path d="' + thumpsUpSVG + '"></path>' +
            '</svg> <span>' + up_vote + '</span></button>';
    } else {
        down_vote = cellData.data.down_vote ? cellData.data.down_vote : 0;
        cellData.data.down_vote = down_vote;
        thumpsDownSVG = "M6.956 14.534c.065.936.952 1.659 1.908 1.42l.261-.065a1.38 1.38 0 0 0 1.012-.965c.22-.816.533-2.512.062-4.51q.205.03.443.051c.713.065 1.669.071 2.516-.211.518-.173.994-.68 1.2-1.272a1.9 1.9 0 0 0-.234-1.734c.058-.118.103-.242.138-.362.077-.27.113-.568.113-.856 0-.29-.036-.586-.113-.857a2 2 0 0 0-.16-.403c.169-.387.107-.82-.003-1.149a3.2 3.2 0 0 0-.488-.9c.054-.153.076-.313.076-.465a1.86 1.86 0 0 0-.253-.912C13.1.757 12.437.28 11.5.28H8c-.605 0-1.07.08-1.466.217a4.8 4.8 0 0 0-.97.485l-.048.029c-.504.308-.999.61-2.068.723C2.682 1.815 2 2.434 2 3.279v4c0 .851.685 1.433 1.357 1.616.849.232 1.574.787 2.132 1.41.56.626.914 1.28 1.039 1.638.199.575.356 1.54.428 2.591";
        return '<button type="button" class="btn btn-sm btn-outline-danger vote" id="downVote_' + cellData.data.id + '" onclick="decrementVote(\'' + cellData.data.id + '\')">' +
            '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-hand-thumbs-up-fill" viewBox="0 0 16 16">' +
            '<path d="' + thumpsDownSVG + '"></path>' +
            '</svg> <span>' + down_vote + '</span></button>';

    }
}

function statusGenerator(cellData) {
    const status = cellData.data.status;
    var availableOptions = [...statusOptions];
    var index = availableOptions.findIndex(item => item.status === status);
    if (index < 0) {
        return "INVALID STATUS";
    }
    var currStatus = availableOptions[index];
    availableOptions.splice(index, 1);
    var dd = '<div class="dropdown">' +
        '<button class="btn btn-' + currStatus.class + ' dropdown-toggle" type="button" id="dropdownMenuButton_"' + cellData.data.id + ' data-bs-toggle="dropdown" aria-expanded="false">' +
        currStatus.status +
        '</button>' +
        '<ul class="dropdown-menu" aria-labelledby="dropdownMenuButton">';
    availableOptions.forEach(option => {
        dd += '<li><a class="dropdown-item" href="#" onClick=onStatusChange(\'' + cellData.data.id + '\',\'' + option.status + '\')>' + option.status + '</a></li>';
    });
    dd += '</ul>' +
        '</div>';
    return dd;
}

function statusBtnGenerator(cellData) {
    const status = cellData.data.prev_status;
    var index = statusOptions.findIndex(item => item.status === status);
    if (index < 0) {
        return "INVALID STATUS";
    }
    var currStatus = statusOptions[index];
    var dd = '<button class="btn btn-' + currStatus.class + '" type="button">' +
        status + '</button>';
    return dd;
}

function onStatusChange(id, status) {
    const val = data.find(value => value.id == id);
    val.status = status;
    updateDataList(val);
}

function datePipe(date) {
    if (!(date instanceof Date)) {
        date = new Date(date);
    }

    const options = {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };

    return new Intl.DateTimeFormat('en-GB', options).format(date);
}


function prepareDataForUpdate(person) {
    delete person.place;
    delete person.prev_counter;
    delete person.prev_status;
    delete person.report_id;
    delete person.sex;
    delete person.age;
    delete person.updated_time;
    delete person.x_forwarded_for;
    delete person.edited;
    if (!person.contactNumber) {
        person.contactNumber = "";
    }

}

// Function to get nested values from an object using a string path
function getValueByPath(obj, path) {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
}
// Function to convert data object to CSV format
function downloadCSV(data) {
    const csvRows = [];
    // Choose the objects to be exported.
    const headers = [{ heading: "ID", variable: "id" },
    { heading: "Name", variable: "name" },
    { heading: "Nickname", variable: "nickname" },
    { heading: "Family Name", variable: "familyName" },
    { heading: "Age", variable: "age" },
    { heading: "Sex", variable: "sex" },
    { heading: "Place", variable: "place" },
    { heading: "Status", variable: "status" },
    { heading: "Date ", variable: "updated_time" },
    { heading: "Last Updated", variable: "updated_by.name" },
    { heading: "Up Vote", variable: "up_vote" },
    { heading: "Down Vote", variable: "down_vote" },
    { heading: "Prev Status", variable: "prev_status" },
    { heading: "Prev Counters", variable: "prev_counter" }
    ]
    csvRows.push(headers.map(header => header.heading).join(','));

    for (const row of data) {
        const values = headers.map(header => {
            const value = getValueByPath(row, header.variable);
            const escaped = ('' + value).replace(/"/g, '\\"');
            return `"${escaped}"`;
        });
        csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
}

// Function to trigger CSV download
function exportToCSV(data) {
    const csvData = downloadCSV(data);
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'data.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

// Add event listener to the button
document.getElementById('exportButton').addEventListener('click', () => {
    exportToCSV(data);
});

// Function to show loading icon and overlay
function showLoadingIcon() {
    document.getElementById('loadingOverlay').style.display = 'flex';
}

// Function to hide loading icon and overlay
function hideLoadingIcon() {
    document.getElementById('loadingOverlay').style.display = 'none';
}

function saveVote(entry) {
    var storedVal = JSON.parse(localStorage.getItem('whoami'));
    if (storedVal && storedVal.name && storedVal.phone && storedVal.place) {
        let person = {};
        person['name'] = storedVal.name;
        person['place'] = storedVal.place ? storedVal.place : "";
        person['phone'] = storedVal.phone ? storedVal.phone : "";
        person.notes = "Voted for the entry";

        entry.updated_by = person
        saveData([entry]);
    } else {
        // Open whoami modal
        var myModal = new bootstrap.Modal(document.getElementById('whoisModal'));
        myModal.show();
    }
}

function saveData(updatedEntries) {
    console.log("saving :", updatedEntries);
    try {

        const apiUrl = 'https://fie5mxoea4.execute-api.ap-south-1.amazonaws.com/prod?persons=true';
        const apiKey = 'iRhRWA3DDk2nnFBVfMQjC5wKEZ1F875s7HBCP9pc';
        showLoadingIcon();
        fetch(apiUrl, {
            method: 'PUT',
            headers: {
                'x-api-key': apiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedEntries)
        })
            .then(response => response.json())
            .then(data => {
                console.log('Success:', data);
                // Close Modal
                var myModal = bootstrap.Modal.getInstance(document.getElementById('whoisModal'));
                if (myModal)
                    myModal.hide();
                // Handle success (e.g., display a success message, redirect, etc.)
                initializeGrid();
            })
            .catch((error) => {
                console.error('Error:', error);
                alert("Error updating the data. Please try again later.");
                var myModal = bootstrap.Modal.getInstance(document.getElementById('whoisModal'));
                if (myModal)
                    myModal.hide();
            })
            .finally(() => {
                hideLoadingIcon();
            });

        event.preventDefault(); // Prevent default form submission
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

const updateList = [];
sampleData = [
    {
        "updated_time": "2024-08-06T18:29:30",
        "prev_status": "",
        "up_vote": "0",
        "contactNumber": "3243",
        "status": "Healthy",
        "familyName": "sdad",
        "name": "dsada",
        "prev_counter": "0",
        "nickname": "sada",
        "updated_by": {
            "name": "",
            "phone": "",
            "place": ""
        },
        "down_vote": "0",
        "id": "c75014e3-74c4-4493-b8d2-ed64d2018d32",
        "report_id": "0597c82b-8925-49f8-881e-790e7c887934"
    },
    {
        "updated_time": "2024-08-05T10:19:58",
        "prev_status": "",
        "up_vote": "0",
        "contactNumber": "",
        "status": "Healthy",
        "familyName": "",
        "name": "",
        "prev_counter": "0",
        "nickname": "",
        "updated_by": {
            "name": "",
            "phone": "",
            "place": ""
        },
        "down_vote": "0",
        "id": "4a0e778a-16bb-45d8-b5e7-96e813ba4d21",
        "report_id": "1040d848-cccb-42f6-a71c-79b8501b1336"
    },
    {
        "prev_status": "Healthy",
        "updated_time": "2024-08-09T23:20:17",
        "up_vote": "25",
        "contactNumber": "3456765432",
        "status": "Healthy",
        "sex": "male",
        "familyName": "hgfds",
        "name": "hgfds",
        "prev_counter": "21",
        "nickname": "gfd",
        "updated_by": {
            "name": "vijesh",
            "place": "tvm",
            "phone": "7543233233",
            "x_forwarded_for": "127.0.0.1, 127.0.0.2"
        },
        "down_vote": "4",
        "place": "tvm",
        "id": "9f88c330-8111-4599-919d-a160dd36bf73",
        "x_forwarded_for": "127.0.0.1, 127.0.0.2",
        "report_id": "48ac1916-3e9d-47b2-b961-484d388ab671",
        "age": "20"
    },
    {
        "updated_time": "2024-08-05T08:01:33",
        "prev_status": "",
        "up_vote": "0",
        "contactNumber": "6686866565",
        "status": "Injured",
        "familyName": "Yesdd",
        "name": "Gorir",
        "prev_counter": "0",
        "nickname": "Dbsjs",
        "updated_by": {
            "name": "",
            "phone": "",
            "place": ""
        },
        "down_vote": "0",
        "id": "ed4d03c3-4556-43d1-ac83-97c3235819b0",
        "report_id": "da26959b-5d23-4be2-a738-b78f81507c84"
    },
    {
        "updated_time": "2024-08-05T10:47:35",
        "prev_status": "",
        "up_vote": "0",
        "contactNumber": "Eby Kakkooran Kuriakose",
        "status": "Healthy",
        "familyName": "Eby Kakkooran Kuriakose",
        "name": "Eby Kakkooran Kuriakose",
        "prev_counter": "0",
        "nickname": "Eby Kakkooran Kuriakose",
        "updated_by": {
            "name": "",
            "phone": "",
            "place": ""
        },
        "down_vote": "0",
        "id": "34d03e9e-f7a4-4c58-bd42-40b862302389",
        "report_id": "bf42a7c8-4768-48d0-9ede-23353ef4905c"
    },
    {
        "updated_time": "2024-08-09T23:01:44",
        "prev_status": "",
        "up_vote": "0",
        "contactNumber": "3456765432",
        "status": "injured",
        "familyName": "hgfds",
        "name": "hgfds",
        "prev_counter": "0",
        "nickname": "gfd",
        "updated_by": {
            "name": "",
            "phone": "",
            "place": ""
        },
        "down_vote": "0",
        "id": "62846722-06a1-460e-b5dc-09838db6c186",
        "report_id": "85bafcea-d089-4764-8520-f6a1150c7255"
    },
    {
        "updated_time": "2024-08-05T10:19:58",
        "prev_status": "",
        "up_vote": "0",
        "contactNumber": "9886190240",
        "status": "Healthy",
        "familyName": "Kakkooran",
        "name": "Eby",
        "prev_counter": "0",
        "nickname": "Eby",
        "updated_by": {
            "name": "",
            "phone": "",
            "place": ""
        },
        "down_vote": "0",
        "id": "77611a13-9065-42a2-ad17-eef9da48f202",
        "report_id": "d6bb3b89-7b5b-440a-a0bd-355f72b4ad1c"
    },
    {
        "updated_time": "2024-08-04T00:00:31",
        "prev_status": "",
        "up_vote": "0",
        "contactNumber": "",
        "status": "\u0d06\u0d30\u0d4b\u0d17\u0d4d\u0d2f\u0d2e\u0d41\u0d33\u0d4d\u0d33",
        "familyName": "",
        "name": "",
        "prev_counter": "0",
        "nickname": "",
        "updated_by": {
            "name": "",
            "phone": "",
            "place": ""
        },
        "down_vote": "0",
        "id": "9ef24d4d-bc69-4901-b0d5-5d5c2a7fb1f4",
        "report_id": "d0ac7802-d15c-4e98-8f97-5c81f4d5a4c8"
    },
    {
        "updated_time": "2024-08-06T18:29:30",
        "prev_status": "",
        "up_vote": "0",
        "contactNumber": "234",
        "status": "Healthy",
        "familyName": "asda",
        "name": "TEST",
        "prev_counter": "0",
        "nickname": "sda",
        "updated_by": {
            "name": "",
            "phone": "",
            "place": ""
        },
        "down_vote": "0",
        "id": "6aeec631-b9de-4f1d-aaf5-92560fd4765b",
        "report_id": "f0fe292c-a929-4b1c-8ea2-63220478e365"
    },
    {
        "updated_time": "2024-08-05T18:25:37",
        "prev_status": "",
        "up_vote": "0",
        "contactNumber": "0909009090",
        "status": "Healthy",
        "familyName": "TEST",
        "name": "TEST",
        "prev_counter": "0",
        "nickname": "TEST",
        "updated_by": {
            "name": "",
            "phone": "",
            "place": ""
        },
        "down_vote": "0",
        "id": "613d54ae-7b2d-450f-8b15-9fd08ac46387",
        "report_id": "a091eb25-7bc4-458e-80b5-90427dbc6715"
    },
    {
        "updated_time": "2024-08-03T23:22:30",
        "prev_status": "",
        "up_vote": "0",
        "contactNumber": "3456765432",
        "status": "injured",
        "familyName": "hgfds",
        "name": "hgfds",
        "prev_counter": "0",
        "nickname": "gfd",
        "updated_by": {
            "name": "",
            "phone": "",
            "place": ""
        },
        "down_vote": "0",
        "id": "eba709c8-4cf1-44e2-b55e-1c658fb3d37b",
        "report_id": "afe0fb1e-2089-4f80-8eb3-d35d06e0babb"
    },
    {
        "updated_time": "2024-08-03T23:22:30",
        "prev_status": "",
        "up_vote": "0",
        "contactNumber": "3456765432",
        "status": "injured",
        "familyName": "hgfds",
        "name": "hgfds",
        "prev_counter": "0",
        "nickname": "gfd",
        "updated_by": {
            "name": "",
            "phone": "",
            "place": ""
        },
        "down_vote": "0",
        "id": "6b2270cf-9905-4c4f-a3bd-02b22e133852",
        "report_id": "516070e6-f609-4578-814a-3f16954ab5f3"
    },
    {
        "updated_time": "2024-08-05T10:12:06",
        "prev_status": "",
        "up_vote": "0",
        "contactNumber": "",
        "status": "Healthy",
        "familyName": "",
        "name": "",
        "prev_counter": "0",
        "nickname": "",
        "updated_by": {
            "name": "",
            "phone": "",
            "place": ""
        },
        "down_vote": "0",
        "id": "bb3ac89d-510f-46f7-9797-e1e35411cd00",
        "report_id": "1b28302f-84d1-4950-ad88-3c2ddb56d07c"
    }
];

// window.onload = initializeGrid();   