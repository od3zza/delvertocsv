## What is this?
This project is a simple web tool for converting `.dlens` (SQLite) database files to `.csv` (comma-separated values) files.

### Features
- Minimalist web interface for uploading `.dlens` files.
- Automatic conversion of data to `.csv` format using a custom SQL query.
- Fast download of the result in CSV.

### How to use
1. Download the backup in your Delver Lens app > `Create Backup File`.
2. Click on `Find File` and `Convert to CSV`.
3. Please wait, the download will start automatically.

### Notes
- The `.dlens` file must be a valid SQLite database, compatible with the SQL query used in the project.
- The code uses the [sql.js](https://github.com/sql-js/sql.js) library to manipulate the database in the browser.
