const SHEET_API_URL = 'https://script.google.com/macros/s/AKfycbzDIRyN308ulRindO4HfDv5uCiNuK9O6SxNtA4HNj0Raqrctw9Kby4ci6cK_6xLUOK4/exec'; // Replace with the Web App URL from Apps Script

let attendanceData = {}; // Global variable to store fetched data
let selectedSubject = "DC"; // Default subject for student portal

// Fetch data from Google Sheets API
async function fetchSheetData() {
    try {
        const response = await fetch(SHEET_API_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Fetched Data:', data); // Log the data for debugging
        attendanceData = data; // Store data globally
        displayStudentRecords(); // Display the initial records for the student portal
    } catch (error) {
        console.error('Error fetching data:', error); // Log any errors
        alert('There was an error fetching the attendance data. Please try again later.');
    }
}

// Display Student Records based on selected subject
function displayStudentRecords() {
    const tbody = document.getElementById("attendanceRecords");
    tbody.innerHTML = ""; // Clear existing rows

    if (!attendanceData[selectedSubject] || attendanceData[selectedSubject].length === 0) {
        tbody.innerHTML = `<tr><td colspan="4">No records found for ${selectedSubject}</td></tr>`;
        return;
    }

    attendanceData[selectedSubject].forEach(record => {
        const row = document.createElement("tr");
        const attendancePercentage = `${(record['Attendance (%)'] * 100).toFixed(0)}%`; // Convert 1 format to 100%
        row.innerHTML = `
            <td>${selectedSubject}</td>
            <td>${record.Date || 'N/A'}</td>
            <td>${record.Time || 'N/A'}</td>
            <td>${attendancePercentage}</td>
        `;
        tbody.appendChild(row);
    });
}

// Function to handle the search button click
function searchSubject() {
    selectedSubject = document.getElementById("studentSubjectSelect").value; // Get selected subject
    displayStudentRecords(); // Display the records for the selected subject
}

// Fetch data on page load
window.onload = fetchSheetData;
