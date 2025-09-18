const uploadElement = document.getElementById('db-upload');
const convertBtn = document.getElementById('convert-btn');
const statusElement = document.getElementById('status');
let dbFile = null;

// Habilita o botão de conversão quando um arquivo é selecionado
uploadElement.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        dbFile = e.target.files[0];
        convertBtn.disabled = false;
        statusElement.textContent = `Arquivo selecionado: ${dbFile.name}`;
    } else {
        dbFile = null;
        convertBtn.disabled = true;
        statusElement.textContent = 'Por favor, selecione um arquivo .dlens';
    }
});

// Ação principal ao clicar no botão
convertBtn.addEventListener('click', async () => {
    if (!dbFile) {
        alert("Nenhum arquivo selecionado!");
        return;
    }

    statusElement.textContent = 'Inicializando o banco de dados...';

    try {
        // Configura o sql.js para encontrar o arquivo .wasm
        const SQL = await initSqlJs({
            locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/${file}`
        });

        const reader = new FileReader();
        reader.onload = function() {
            statusElement.textContent = 'Lendo o arquivo e executando a query...';
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
                statusElement.textContent = 'A query não retornou resultados.';
                return;
            }
            
            statusElement.textContent = 'Convertendo para CSV...';
            // Converte os resultados para o formato CSV
            const csvContent = convertToCSV(results[0]);

            statusElement.textContent = 'Criando arquivo para download...';
            // Inicia o download do arquivo CSV
            downloadCSV(csvContent, 'query_result.csv');

            statusElement.textContent = 'Conversão concluída! O download deve ter iniciado.';
        }
        reader.onerror = function() {
            statusElement.textContent = 'Erro ao ler o arquivo.';
            console.error("Erro de FileReader:", reader.error);
        };
        reader.readAsArrayBuffer(dbFile);

    } catch (err) {
        statusElement.textContent = 'Ocorreu um erro.';
        console.error(err);
        alert("Ocorreu um erro ao processar o arquivo. Verifique se é um banco de dados SQLite válido.");
    }
});

/**
 * Converte um objeto de resultado do sql.js para uma string CSV.
 */
function convertToCSV(data) {
    const columns = data.columns;
    const rows = data.values;
    let csv = columns.join(',') + '\n';

    rows.forEach(row => {
        const processedRow = row.map(item => {
            // Trata valores que podem conter vírgulas ou aspas
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
 * Cria um link de download e o clica programaticamente.
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
