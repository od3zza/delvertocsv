const uploadElement = document.getElementById('db-upload');
const convertBtn = document.getElementById('convert-btn');
const statusElement = document.getElementById('status');
let dbFile = null;

// Enable the convert button when a file is selected
uploadElement.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        dbFile = e.target.files[0];
        convertBtn.disabled = false;
        statusElement.textContent = `Selected file: ${dbFile.name}`;
    } else {
        dbFile = null;
        convertBtn.disabled = true;
        statusElement.textContent = 'Please select a .dlens file';
    }
});

// Ação principal ao clicar no botão
convertBtn.addEventListener('click', async () => {
    if (!dbFile) {
        alert("No file selected!");
        return;
    }

    statusElement.textContent = 'Initializing database...';

    try {
        // Configura o sql.js para encontrar o arquivo .wasm
        const SQL = await initSqlJs({
            locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/${file}`
        });

        const reader = new FileReader();
        reader.onload = function() {
            statusElement.textContent = 'Reading file and running query...';
            const Uints = new Uint8Array(reader.result);
            
            // Carrega o banco de dados
            const db = new SQL.Database(Uints);

            // A sua query SQL
            const sqlQuery = `
                SELECT  DISTINCT 
                        quantity AS 'Count',
                        quantity AS 'Tradelist Count',
                        data_names.name AS 'Name',
                        data_editions.tl_abb AS 'Edition'
                  FROM cards, data_cards, data_names, data_editions
                  WHERE cards.card == data_cards._id
                  AND data_cards.name = data_names._id
                  AND data_cards.edition = data_editions._id;
            `;

            // Executa a query
            const results = db.exec(sqlQuery);

            if (results.length === 0) {
                statusElement.textContent = 'The query returned no results.';
                return;
            }
            
            statusElement.textContent = 'Converting to CSV...';
            // Convert the results to CSV format
            const csvContent = convertToCSV(results[0]);

            statusElement.textContent = 'Creating file for download...';
            // Start the CSV file download
            downloadCSV(csvContent, 'query_result.csv');

            statusElement.textContent = 'Conversion complete! Download should have started.';
        }
        reader.onerror = function() {
            statusElement.textContent = 'Error reading file.';
            console.error("FileReader error:", reader.error);
        };
        reader.readAsArrayBuffer(dbFile);

    } catch (err) {
        statusElement.textContent = 'An error occurred.';
        console.error(err);
        alert("An error occurred while processing the file. Please ensure it's a valid SQLite database.");
    }
});

/**
 * Convert an sql.js result object to a CSV string.
 */
function convertToCSV(data) {
    const columns = data.columns;
    const rows = data.values;
    let csv = columns.join(',') + '\n';

    rows.forEach(row => {
        const processedRow = row.map(item => {
            // Handle values that may contain commas or quotes
            let cell = item === null ? '' : String(item);
            if (cell.includes(',')) {
                cell = `"${cell.replace(/"/g, '""')}"`;
            }
            return cell;
        });
        csv += processedRow.join(',') + '\n';
    });

    return csv;
}

/**
 * Create a download link and click it programmatically.
 */
function downloadCSV(csvContent, fileName) {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

document.addEventListener('DOMContentLoaded', (event) => {

    // --- FILE CONVERTER LOGIC (PLACE YOURS HERE) ---
    // Example:
    const uploadElement = document.getElementById('db-upload');
    const convertBtn = document.getElementById('convert-btn');
    // ... rest of your conversion logic

    uploadElement.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            convertBtn.disabled = false;
        } else {
            convertBtn.disabled = true;
        }
    });

    // --- DONATION POPUP LOGIC ---

    const donationPopup = document.getElementById('donation-popup');
    const closePopupButton = document.getElementById('close-popup-btn');

    // Function to show the popup
    const showPopup = () => {
        donationPopup.classList.remove('popup-hidden');
        donationPopup.classList.add('popup-visible');
    };

    // Function to hide the popup
    const hidePopup = () => {
        donationPopup.classList.remove('popup-visible');
        donationPopup.classList.add('popup-hidden');
    };

    // Show the popup after 3 seconds
    setTimeout(showPopup, 3000);

    // Add click event to close the popup
    closePopupButton.addEventListener('click', hidePopup);
});