const SHEET_API_URL = 'https://script.google.com/macros/s/AKfycbxIPziqxPigZ2ptkqGsP8bgrpIV2LVGd0aqYILKpKMq_ciawhBxuFGqjoncWRYlozJM/exec';

let attendanceData = {}; // Global variable to store fetched data
let selectedSubject = "DC"; // Default subject for student portal
let studentSearchQuery = ""; // To store the current search query for student names

// Fetch data from Google Sheets API
async function fetchSheetData() {
    try {
        const response = await fetch(SHEET_API_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Fetched Data:', data);

        attendanceData = data; // Store data globally
        populateStudentDropdown(); // Populate student search dynamically
        displayStudentRecords(); // Display initial records
    } catch (error) {
        console.error('Error fetching data:', error);
        alert('Error fetching attendance data. Please try again later.');
    }
}

// Populate the student search suggestions dynamically
function populateStudentDropdown() {
    const students = new Set(); // To ensure unique student names

    // Loop through the attendance data to find unique student names
    for (const subject in attendanceData) {
        attendanceData[subject].forEach(record => {
            if (record['Student Name']) {
                students.add(record['Student Name']);
            }
        });
    }

    // Store the list of students for easy filtering
    window.studentList = Array.from(students);
}

// Filter records based on selected subject and student name search query
function displayStudentRecords() {
    const tbody = document.getElementById("attendanceRecords");
    tbody.innerHTML = ""; // Clear existing rows

    if (!attendanceData || Object.keys(attendanceData).length === 0 || !attendanceData[selectedSubject]) {
        tbody.innerHTML = `<tr><td colspan="5">No records found for ${selectedSubject}</td></tr>`;
        return;
    }

    // Filter the records based on search query for student names
    const filteredRecords = attendanceData[selectedSubject].filter(record => {
        const studentNameMatches = studentSearchQuery ? 
            record['Student Name'].toLowerCase().includes(studentSearchQuery.toLowerCase()) : 
            true;
        return studentNameMatches;
    });

    if (filteredRecords.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5">No records found for the selected student</td></tr>`;
        return;
    }

    filteredRecords.forEach(record => {
        const row = document.createElement("tr");

        // Format the Date
        let date = 'N/A';
        if (record.Date) {
            const parsedDate = new Date(record.Date);
            if (!isNaN(parsedDate)) {
                date = parsedDate.toLocaleDateString('en-US'); // Format the date as MM/DD/YYYY
            } else {
                date = record.Date; // Handle date as string from Google Sheets
            }
        }

        // Format the Time
        const time = record.Time ? formatTime(record.Time) : 'N/A';

        // Calculate Attendance Percentage (if applicable)
        const attendancePercentage = record['Attendance (%)']
            ? `${(record['Attendance (%)'] * 100).toFixed(0)}%`
            : 'N/A';

        // Ensure Student Name and Roll Number exist
        const studentName = record['Student Name'] || 'N/A';
        const rollNumber = record['Roll no'] || 'N/A';

        // Populate table row
        row.innerHTML = `
            <td>${studentName}</td>
            <td>${rollNumber}</td>
            <td>${date}</td>
            <td>${time}</td>
            <td>${attendancePercentage}</td>
        `;
        tbody.appendChild(row);
    });
}

// Update both subject and student search query selections
function updateSelection() {
    selectedSubject = document.getElementById("studentSubjectSelect").value; // Get selected subject
    studentSearchQuery = document.getElementById("studentSearchBox").value; // Get current student search query
    displayStudentRecords(); // Display updated records
}

// Format time from Google Sheets (handles AM/PM format)
function formatTime(rawTime) {
    try {
        const date = new Date(`1970-01-01T${rawTime}`);
        if (!isNaN(date)) {
            return date.toLocaleTimeString('en-US', { hour12: false }); // Convert to 24-hour format (HH:mm:ss)
        } else {
            const dateAlt = new Date(`1970-01-01 ${rawTime}`);
            if (!isNaN(dateAlt)) {
                return dateAlt.toLocaleTimeString('en-US', { hour12: false });
            }
        }
    } catch (e) {
        console.error('Time parsing error:', e);
    }
    return 'N/A'; // Return N/A if time format is invalid
}

// Fetch data when the page loads
window.onload = fetchSheetData;
