
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
var data;
// Function to display fetched JSON data
function displayData(apiData) {
    data = [...apiData];
    // Populate the table headers
    const columnDef = [
        { index: 1, title: "Date & Time", variable: "updated_time" },
        { index: 2, title: "True I Agree", variable: "up_vote", cellgenerator: "voteGenerator" },
        { index: 3, title: "False I don't Agree", variable: "down_vote", cellgenerator: "voteGenerator" },
        { index: 4, title: "Name", variable: "name" },
        { index: 5, title: "Nickname", variable: "nickname" },
        { index: 6, title: "Family Name", variable: "family_name" },
        { index: 7, title: "Age", variable: "age" },
        { index: 8, title: "Sex", variable: "sex" },
        { index: 9, title: "Place", variable: "place" },
        { index: 10, title: "Status", variable: "status", cellgenerator: "statusGenerator" },
        { index: 11, title: "Prev Status", variable: "prev_status" },
        { index: 12, title: "Prev Counters", variable: "prev_counter" }
    ];
    const headerRow = document.createElement('tr');
    for (i = 0; i < columnDef.length; i++) {
        const th = document.createElement('th');
        th.textContent = columnDef[i].title;
        th.setAttribute("scope", "col");
        headerRow.appendChild(th);
    }
    document.querySelector('#dataTable thead').appendChild(headerRow);
    // Populate the table rows
    const tableBody = document.querySelector('#dataTable tbody');
    data.forEach(item => {
        const row = document.createElement('tr');
        for (i = 0; i < columnDef.length; i++) {
            const column = columnDef[i];
            const cell = document.createElement('td');
            if (column.cellgenerator) {
                const cellData = {
                    data: item,
                    column: column,
                    colIndex: i,
                    isUpVote: column.variable == "up_vote"
                }
                cell.innerHTML = window[column.cellgenerator].apply(null, [cellData]);
            } else {
                value = item[column.variable];
                cell.textContent = value ? value : "NA";
            }
            row.appendChild(cell);
        };
        tableBody.appendChild(row);
    });

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

    // Check down vote btn behaviour 

    const downBtn = document.querySelector('#downVote_' + id);
    if (downBtn.classList.contains("btn-danger")) {
        decrementVote(id);
    } else {
        updateDataList(val);
    }
    /**
     * 
     * TODO:  API Call to correct Downvote entry 
     * 
     */
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
    /**
     * 
     * TODO:  API Call to upvote the entry 
     * 
     */

    const upBtn = document.querySelector('#upVote_' + id);
    if (upBtn.classList.contains("btn-success")) {
        incrementVote(id);
        /**
        * 
        * TODO:  API Call to correct Downvote entry 
        * 
        */
    } else {
        updateDataList(val);
    }
}

function voteGenerator(cellData) {
    if (cellData.isUpVote) {
        thumpsUpSVG = "M6.956 1.745C7.021.81 7.908.087 8.864.325l.261.066c.463.116.874.456 1.012.965.22.816.533 2.511.062 4.51a10 10 0 0 1 .443-.051c.713-.065 1.669-.072 2.516.21.518.173.994.681 1.2 1.273.184.532.16 1.162-.234 1.733q.086.18.138.363c.077.27.113.567.113.856s-.036.586-.113.856c-.039.135-.09.273-.16.404.169.387.107.819-.003 1.148a3.2 3.2 0 0 1-.488.901c.054.152.076.312.076.465 0 .305-.089.625-.253.912C13.1 15.522 12.437 16 11.5 16H8c-.605 0-1.07-.081-1.466-.218a4.8 4.8 0 0 1-.97-.484l-.048-.03c-.504-.307-.999-.609-2.068-.722C2.682 14.464 2 13.846 2 13V9c0-.85.685-1.432 1.357-1.615.849-.232 1.574-.787 2.132-1.41.56-.627.914-1.28 1.039-1.639.199-.575.356-1.539.428-2.59z";
        return '<button type="button" class="btn btn-sm btn-outline-success vote" id="upVote_' + cellData.data.id + '" onclick="incrementVote(' + cellData.data.id + ')">' +
            '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-hand-thumbs-up-fill" viewBox="0 0 16 16">' +
            '<path d="' + thumpsUpSVG + '"></path>' +
            '</svg> <span>' + cellData.data.up_vote + '</span></button>';
    } else {
        thumpsDownSVG = "M6.956 14.534c.065.936.952 1.659 1.908 1.42l.261-.065a1.38 1.38 0 0 0 1.012-.965c.22-.816.533-2.512.062-4.51q.205.03.443.051c.713.065 1.669.071 2.516-.211.518-.173.994-.68 1.2-1.272a1.9 1.9 0 0 0-.234-1.734c.058-.118.103-.242.138-.362.077-.27.113-.568.113-.856 0-.29-.036-.586-.113-.857a2 2 0 0 0-.16-.403c.169-.387.107-.82-.003-1.149a3.2 3.2 0 0 0-.488-.9c.054-.153.076-.313.076-.465a1.86 1.86 0 0 0-.253-.912C13.1.757 12.437.28 11.5.28H8c-.605 0-1.07.08-1.466.217a4.8 4.8 0 0 0-.97.485l-.048.029c-.504.308-.999.61-2.068.723C2.682 1.815 2 2.434 2 3.279v4c0 .851.685 1.433 1.357 1.616.849.232 1.574.787 2.132 1.41.56.626.914 1.28 1.039 1.638.199.575.356 1.54.428 2.591";
        return '<button type="button" class="btn btn-sm btn-outline-danger vote" id="downVote_' + cellData.data.id + '" onclick="decrementVote(' + cellData.data.id + ')">' +
            '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-hand-thumbs-up-fill" viewBox="0 0 16 16">' +
            '<path d="' + thumpsDownSVG + '"></path>' +
            '</svg> <span>' + cellData.data.down_vote + '</span></button>';

    }
}

function statusGenerator(cellData) {
    const status = cellData.data.status;
    var availableOptions =  [...statusOptions];
    var index = availableOptions.findIndex(item => item.status === status );
    if(index < 0 ){
        return "INVALID STATUS";
    }
    var currStatus = availableOptions[index];
    availableOptions.splice(index,1);
    var dd = '<div class="dropdown">' +
        '<button class="btn btn-'+currStatus.class+' dropdown-toggle" type="button" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false">' +
        currStatus.status +
        '</button>' +
        '<ul class="dropdown-menu" aria-labelledby="dropdownMenuButton">';
    availableOptions.forEach(option => {
        dd += '<li><a class="dropdown-item" href="#">' + option.status + '</a></li>';
    });
    dd += '</ul>' +
        '</div>';
        console.log(dd)
    return dd;
}


function updateDataList(data) {
    const index = updateList.findIndex(entry => entry.id === data.id);
    // Remove the entry if it exists
    if (index !== -1) {
        updateList.splice(index, 1);
    }
    updateList.push(data);
}

async function fetchReportData() {
    try {
      const apiUrl = 'https://fie5mxoea4.execute-api.ap-south-1.amazonaws.com/prod';
      const apiKey = process.env.API_KEY || 'iRhRWA3DDk2nnFBVfMQjC5wKEZ1F875s7HBCP9pc';
  
      const response = await fetch(apiUrl, {
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json'
        }
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
  
      const data = await response.json();
      displayData(data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
}

const updateList = [];
sampleData = [{
    "id": 1,
    "updated_time": "2024-08-01T12:34:56Z",
    "up_vote": 2,
    "down_vote": 3,
    "name": "John Doe",
    "nickname": "Johnny",
    "family_name": "Doe",
    "age": 28,
    "sex": "Male",
    "place": "New York",
    "status": "Injured",
    "prev_status": "Inactive",
    "prev_counter": 10
}, {
    "id": 2,
    "updated_time": "2024-08-01T12:34:56Z",
    "up_vote": 25,
    "down_vote": 10,
    "name": "John Doe",
    "nickname": "Johnny",
    "family_name": "Doe",
    "age": 28,
    "sex": "Male",
    "place": "New York",
    "status": "Rescued",
    "prev_status": "Inactive",
    "prev_counter": 10
}, {
    "id": 3,
    "updated_time": "2024-08-01T12:34:56Z",
    "up_vote": 2533,
    "down_vote": 0,
    "name": "John Doe",
    "nickname": "Johnny",
    "family_name": "Doe",
    "age": 28,
    "sex": "Male",
    "place": "New York",
    "status": "Deceased",
    "prev_status": "Inactive",
    "prev_counter": 10
}]
window.onload = fetchReportData();
