import { read, utils } from 'xlsx';

/**
 * Read the Excel File and handle the data
 * @param {File} ExcelFile 
 * @returns {void}
 */
const HandleInputFile = (ExcelFile) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const sheetData = utils.sheet_to_json(sheet, { header: 1 });

        CurrentExcelFile.value.name = file.name;
        CurrentExcelFile.value.activeSheet.name = sheetName;
        CurrentExcelFile.value.activeSheet.rows = sheetData;

        const resume = BBVA.HandleExcelSheet(sheetData);
        
        CurrentExcelFile.value.activeSheet.data = {
            rows: sheetData,
            resume: resume,
        };

        console.log(CurrentExcelFile.value.activeSheet);
        
        // Updating Chart Data
        ResumeChartData.value = {
        labels: ['Abonos', 'Cargos', 'Saldo'],
        datasets: [
                    {
                    backgroundColor: ['#22c55e', '#ea580c', '#00D8FF'],
                    data: [
                        CurrentExcelFile.value.activeSheet.data.resume.AbonoTotal,
                        CurrentExcelFile.value.activeSheet.data.resume.CargoTotal,
                        CurrentExcelFile.value.activeSheet.data.resume.SaldoTotal
                    ]
                    }
                ]
        };
        
    };

    reader.readAsArrayBuffer(file);
};