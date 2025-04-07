<script setup>
import AppLayout from '@/Layouts/AppLayout.vue';
import NavigationButton from '@/Shared/NavigationButton.vue';
import Format from '@/Utils/Format.js';
import Santander from '@/Accounts/SANT';
import Banamex from '@/Accounts/BMX.js';
import BBVA from '@/Accounts/BBVA.js';
import Banks from '@/Accounts/Bank';

// XLSX
import { read, utils, writeFileXLSX } from 'xlsx';
import { ref, onMounted } from "vue";
// ChartJS
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Doughnut } from 'vue-chartjs'
ChartJS.register(ArcElement, Tooltip, Legend)
// Props
const props = defineProps({
    products: Object,
    params: Object | Array
});
const Workbook = ref({
    SheetNames: [],
    Sheets: {},
});
const CurrentExcelFile = ref({
    name: '',
    activeSheet: {
        name: '',
        rows: [],
        groupedRows: [],
        data: [],
        resume: {
            CargoTotal: 0,
            AbonoTotal: 0,
            SaldoTotal: 0,
            SaldoTotalString: '',
            AbonoTotalString: '',
            CargoTotalString: ''
        }
    },
});
const CurrentExcelFileBanamex = ref({
    name: '',
    activeSheet: {
        name: '',
        rows: [],
        groupedRows: [],
        data: [],
        resume: {
            CargoTotal: 0,
            AbonoTotal: 0,
            SaldoTotal: 0,
            SaldoTotalString: '',
            AbonoTotalString: '',
            CargoTotalString: ''
        }
    },
});
const CurrentExcelFileSantander = ref({
    name: '',
    activeSheet: {
        name: '',
        rows: [],
        groupedRows: [],
        data: [],
        resume: {
            CargoTotal: 0,
            AbonoTotal: 0,
            SaldoTotal: 0,
            SaldoTotalString: '',
            AbonoTotalString: '',
            CargoTotalString: ''
        }
    },
});
/* the component state is an array of objects */
const HasFilter = ref(false);
const HasFilterBanamex = ref(false);
const HasFilterSantander = ref(false);
/* get state data and export to XLSX */
function exportFile() {
    let table = document.getElementById("excelTable");
    let sheetData = [];

    // Recorrer filas de la tabla
    table.querySelectorAll("tr").forEach((row) => {
        let rowData = [];
        row.querySelectorAll("td").forEach((cell) => {
            rowData.push(cell.textContent.trim()); // Obtener texto de cada celda
        });
        sheetData.push(rowData);
    });

    // Crear un nuevo libro de Excel
    let workbook = utils.book_new();
    let worksheet = utils.aoa_to_sheet(sheetData); // Convertir la tabla a formato Excel
    utils.book_append_sheet(workbook, worksheet, "Sheet1");

    // Guardar archivo Excel
    writeFileXLSX(workbook, "archivo_modificado.xlsx");
}
// ================
const ResumeChartData = ref({
        labels: ['Abonos', 'Cargos', 'Saldo'],
        datasets: [
                    {
                    backgroundColor: ['#22c55e', '#ea580c', '#00D8FF'],
                    data: [
                        0,
                        0,
                        100
                    ]
                    }
                ]
    });
const ResumeChartDataBanamex = ref({
        labels: ['Abonos', 'Cargos', 'Saldo'],
        datasets: [
                    {
                    backgroundColor: ['#22c55e', '#ea580c', '#00D8FF'],
                    data: [
                        0,
                        0,
                        100
                    ]
                    }
                ]
    });
const ResumeChartDataSantander = ref({
        labels: ['Abonos', 'Cargos', 'Saldo'],
        datasets: [
                    {
                    backgroundColor: ['#22c55e', '#ea580c', '#00D8FF'],
                    data: [
                        0,
                        0,
                        100
                    ]
                    }
                ]
    });
// ================
/**
 * Handle Excel file change
 */
const HandleBBVAFile = (file, sheetName, sheetData) => {
    CurrentExcelFile.value.name = file.name;
    CurrentExcelFile.value.activeSheet.name = sheetName;
    CurrentExcelFile.value.activeSheet.rows = sheetData;

    const resume = BBVA.HandleExcelSheet(sheetData);
    // Merge data to Workbook
    Workbook.value.SheetNames.push({
        FileName: file.name,
        Spreadsheets: resume,
    });
    // Sumar Totales en caso de que existan
    if(Workbook.value.SheetNames.length > 1) {

        // Recalcular resume sumando los totales de todos los archivos
        let totalAbono = 0;
        let totalCargo = 0;
        let totalSaldo = 0;
        Workbook.value.SheetNames.forEach(sheet => {
            totalAbono += parseFloat(sheet.Spreadsheets.AbonoTotal);
            totalCargo += parseFloat(sheet.Spreadsheets.CargoTotal);
            totalSaldo += parseFloat(sheet.Spreadsheets.SaldoTotal);
        });

        // Merge data to CurrentExcelFile
        CurrentExcelFile.value.activeSheet.data = {
            rows: sheetData,
            resume: {
                AbonoTotal: Format.Round(totalAbono),
                CargoTotal: Format.Round(totalCargo),
                SaldoTotal: Format.Round(totalSaldo),
                SaldoTotalString: Format.Currency((totalSaldo)),
                AbonoTotalString: Format.Currency(Format.Round(totalAbono)),
                CargoTotalString: Format.Currency(totalCargo)
            },
        };

    } else {
        // Merge data to CurrentExcelFile
        CurrentExcelFile.value.activeSheet.data = {
            rows: sheetData,
            resume: resume,
        };
    }
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
}
const HandleBanamexFile = (file, sheetName, sheetData) => {
    CurrentExcelFileBanamex.value.name = file.name;
    CurrentExcelFileBanamex.value.activeSheet.name = sheetName;
    CurrentExcelFileBanamex.value.activeSheet.rows = sheetData;

    const resume = Banamex.HandleExcelSheet(sheetData);
    console.log('Banamex Resume');
    console.log(resume);
    // Merge data to Workbook
    Workbook.value.SheetNames.push({
        FileName: file.name,
        Spreadsheets: resume,
    });
    // Sumar Totales en caso de que existan
    if(Workbook.value.SheetNames.length > 1) {

        // Recalcular resume sumando los totales de todos los archivos
        let totalAbono = 0;
        let totalCargo = 0;
        let totalSaldo = 0;
        Workbook.value.SheetNames.forEach(sheet => {
            totalAbono += parseFloat(sheet.Spreadsheets.AbonoTotal);
            totalCargo += parseFloat(sheet.Spreadsheets.CargoTotal);
            totalSaldo += parseFloat(sheet.Spreadsheets.SaldoTotal);
        });

        // Merge data to CurrentExcelFile
        CurrentExcelFileBanamex.value.activeSheet.data = {
            rows: sheetData,
            resume: {
                AbonoTotal: Format.Round(totalAbono),
                CargoTotal: Format.Round(totalCargo),
                SaldoTotal: Format.Round(totalSaldo),
                SaldoTotalString: Format.Currency((totalSaldo)),
                AbonoTotalString: Format.Currency(Format.Round(totalAbono)),
                CargoTotalString: Format.Currency(totalCargo)
            },
        };

    } else {
        // Merge data to CurrentExcelFile
        CurrentExcelFileBanamex.value.activeSheet.data = {
            rows: sheetData,
            resume: resume,
        };
    }
    console.log(CurrentExcelFileBanamex.value.activeSheet);
        // Updating Chart Data
    ResumeChartDataBanamex.value = {
    labels: ['Abonos', 'Cargos', 'Saldo'],
    datasets: [
                {
                backgroundColor: ['#22c55e', '#ea580c', '#00D8FF'],
                data: [
                    CurrentExcelFileBanamex.value.activeSheet.data.resume.AbonoTotal,
                    CurrentExcelFileBanamex.value.activeSheet.data.resume.CargoTotal,
                    CurrentExcelFileBanamex.value.activeSheet.data.resume.SaldoTotal
                ]
                }
            ]
    };
};
const HandleSantanderFile = (file, sheetName, sheetData) => {
    CurrentExcelFileSantander.value.name = file.name;
    CurrentExcelFileSantander.value.activeSheet.name = sheetName;
    CurrentExcelFileSantander.value.activeSheet.rows = sheetData;
    return console.log(CurrentExcelFileSantander.value);
    const resume = Santander.HandleExcelSheet(sheetData);
    // Merge data to Workbook
    Workbook.value.SheetNames.push({
        FileName: file.name,
        Spreadsheets: resume,
    });
    // Sumar Totales en caso de que existan
    if(Workbook.value.SheetNames.length > 1) {

        // Recalcular resume sumando los totales de todos los archivos
        let totalAbono = 0;
        let totalCargo = 0;
        let totalSaldo = 0;
        Workbook.value.SheetNames.forEach(sheet => {
            totalAbono += parseFloat(sheet.Spreadsheets.AbonoTotal);
            totalCargo += parseFloat(sheet.Spreadsheets.CargoTotal);
            totalSaldo += parseFloat(sheet.Spreadsheets.SaldoTotal);
        });

        // Merge data to CurrentExcelFile
        CurrentExcelFileSantander.value.activeSheet.data = {
            rows: sheetData,
            resume: {
                AbonoTotal: Format.Round(totalAbono),
                CargoTotal: Format.Round(totalCargo),
                SaldoTotal: Format.Round(totalSaldo),
                SaldoTotalString: Format.Currency((totalSaldo)),
                AbonoTotalString: Format.Currency(Format.Round(totalAbono)),
                CargoTotalString: Format.Currency(totalCargo)
            },
        };

    } else {
        // Merge data to CurrentExcelFile
        CurrentExcelFileSantander.value.activeSheet.data = {
            rows: sheetData,
            resume: resume,
        };
    }
    console.log(CurrentExcelFileSantander.value.activeSheet);
    // Updating Chart Data
    ResumeChartDataSantander.value = {
    labels: ['Abonos', 'Cargos', 'Saldo'],
    datasets: [
                {
                backgroundColor: ['#22c55e', '#ea580c', '#00D8FF'],
                data: [
                    CurrentExcelFileSantander.value.activeSheet.data.resume.AbonoTotal,
                    CurrentExcelFileSantander.value.activeSheet.data.resume.CargoTotal,
                    CurrentExcelFileSantander.value.activeSheet.data.resume.SaldoTotal
                ]
                }
            ]
    };
}
/**
 * Handle Excel file change
 */
const handleExcelFileChange = (_Bank, event) => {
    const file = event.target.files[0];
    if (!file) return;
    // verificar que el archivo sea un archivo de Excel
    if (!file.name.endsWith('.xls') && !file.name.endsWith('.xlsx')) {
        alert('El archivo seleccionado no es un archivo de Excel');
        return;
    }
    // Verificar si existe el archivo en el Workbook
    if(Workbook.value.SheetNames.some(sheet => sheet.FileName === file.name)) {
        alert('El archivo ya ha sido cargado');
        return;
    }
    const reader = new FileReader();

    reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const sheetData = utils.sheet_to_json(sheet, { header: 1 });

        switch(_Bank) {
            case Banks.BBVA:
                HandleBBVAFile(file, sheetName, sheetData);
                break;
            case Banks.Banamex:
                HandleBanamexFile(file, sheetName, sheetData);
                break;
            case Banks.Santander:
                HandleSantanderFile(file, sheetName, sheetData);
                break;
            default:
                alert('El banco no es soportado');
                return;
        }
        
    };

    reader.readAsArrayBuffer(file);
}
onMounted( () => {    

    const saveChanges = () => {
        let table = document.getElementById('excelTable');
        let workbook = utils.table_to_book(table);
        let excelData = write(workbook, { bookType: 'xlsx', type: 'binary' });

        fetch('/guardar-excel', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ excel: btoa(excelData) })
        }).then(response => response.json())
        .then(data => alert(data.message));
    }
});
const options = {
  responsive: true,
}

const excelData = ref(null);
const excelDataBanamex = ref(null);
const excelDataSantander = ref(null);

const GroupByConcept = () => {
    const grouped = CurrentExcelFile.value.activeSheet.rows.reduce((acc, row) => {
        const concept = row[1];
        if (!acc[concept]) {
            acc[concept] = {
                Abono: 0,
                Cargo: 0,
                Concepto: concept,
            };
        }
        acc[concept].Abono += row[4] ? parseFloat(row[4]) : 0;
        acc[concept].Cargo += row[5] ? parseFloat(row[5]) : 0;
        return acc;
    }, {});
    CurrentExcelFile.value.activeSheet.groupedRows = grouped;
    HasFilter.value = true;
    console.log(CurrentExcelFile.value.activeSheet.groupedRows);
    
}
const GroupByConceptBanamex = () => {
    // Saltar hasta la fila 16
    const startRow = 17;
    const endRow = CurrentExcelFileBanamex.value.activeSheet.rows.length - 1;
    const rows = CurrentExcelFileBanamex.value.activeSheet.rows.slice(startRow, endRow);
    CurrentExcelFileBanamex.value.activeSheet.rows = rows;
    const grouped = CurrentExcelFileBanamex.value.activeSheet.rows.reduce((acc, row) => {
        const concept = row[1];
        if (!acc[concept]) {
            acc[concept] = {
                Abono: 0,
                Cargo: 0,
                Concepto: concept,
            };
        }
        acc[concept].Abono += row[2] ? parseFloat(row[2]) : 0;
        acc[concept].Cargo += row[3] ? parseFloat(row[3]) : 0;
        return acc;
    }, {});
    CurrentExcelFileBanamex.value.activeSheet.groupedRows = grouped;
    HasFilterBanamex.value = true;
    console.log(CurrentExcelFileBanamex.value.activeSheet.groupedRows);
    
}
const GroupByConceptSantander = () => {
    const grouped = CurrentExcelFile.value.activeSheet.rows.reduce((acc, row) => {
        const concept = row[9];
        if (!acc[concept]) {
            acc[concept] = {
                Abono: 0,
                Cargo: 0,
                Concepto: concept,
            };
        }
        acc[concept].Abono += row[4] ? parseFloat(row[6]) : 0;
        acc[concept].Cargo += row[5] ? parseFloat(row[6]) : 0;
        return acc;
    }, {});
    CurrentExcelFileSantander.value.activeSheet.groupedRows = grouped;
    HasFilterSantander.value = true;
    console.log(CurrentExcelFileSantander.value.activeSheet.groupedRows);
    
}
// Sorting banks
const SortBank = ref({
    BBVA: 'order-1',
    Banamex: 'order-2',
    Santander: 'order-3',
    Scotia: 'order-4',
});

const switchBankOrder = (bank) => {
    switch(bank) {
        case Banks.BBVA:
            SortBank.value.BBVA = 'order-1';
            SortBank.value.Banamex = 'order-2';
            SortBank.value.Santander = 'order-3';
            SortBank.value.Scotia = 'order-4';
            break;
        case Banks.Banamex:
            SortBank.value.BBVA = 'order-2';
            SortBank.value.Banamex = 'order-1';
            SortBank.value.Santander = 'order-3';
            SortBank.value.Scotia = 'order-4';
            break;
        case Banks.Santander:
            SortBank.value.BBVA = 'order-3';
            SortBank.value.Banamex = 'order-2';
            SortBank.value.Santander = 'order-1';
            SortBank.value.Scotia = 'order-4';
            break;
        default:
            break;
    }
}

// Exportar archivo excel de groupByConcept
const ExportGrupedByFiles = () => {
    let table = document.getElementById("excelTableBBVA");
    let sheetData = [];

    // Establecer cabecera de la tabla
    let headerRow = [];
    table.querySelectorAll("th").forEach((header) => {
        headerRow.push(header.textContent.trim()); // Obtener texto de cada celda
    });
    // Recorrer filas de la tabla
    table.querySelectorAll("tr").forEach((row) => {
        let rowData = [];
        row.querySelectorAll("td").forEach((cell) => {
            rowData.push(cell.textContent.trim()); // Obtener texto de cada celda
        });
        sheetData.push(rowData);
    });

    // Agregar la cabecera al inicio de la tabla
    sheetData.unshift(headerRow);


    // Crear un nuevo libro de Excel
    let workbook = utils.book_new();
    let worksheet = utils.aoa_to_sheet(sheetData); // Convertir la tabla a formato Excel
    utils.book_append_sheet(workbook, worksheet, "Concentrado");

    // Fecha de hoy
    let today = new Date();
    let day = String(today.getDate()).padStart(2, '0');
    let month = String(today.getMonth() + 1).padStart(2, '0'); // Enero es 0
    let year = today.getFullYear();
    let formattedDate = `${year}-${month}-${day}`;

    // Guardar archivo Excel
    writeFileXLSX(workbook, "Concentrado_BBVA_"+ formattedDate +".xlsx");
}

const ExportGroupedByFilesBanamex = () => {
    let table = document.getElementById("excelTableBanamex");
    let sheetData = [];

    // Establecer cabecera de la tabla
    let headerRow = [];
    table.querySelectorAll("th").forEach((header) => {
        headerRow.push(header.textContent.trim()); // Obtener texto de cada celda
    });
    // Recorrer filas de la tabla
    table.querySelectorAll("tr").forEach((row) => {
        let rowData = [];
        row.querySelectorAll("td").forEach((cell) => {
            rowData.push(cell.textContent.trim()); // Obtener texto de cada celda
        });
        sheetData.push(rowData);
    });

    // Agregar la cabecera al inicio de la tabla
    sheetData.unshift(headerRow);


    // Crear un nuevo libro de Excel
    let workbook = utils.book_new();
    let worksheet = utils.aoa_to_sheet(sheetData); // Convertir la tabla a formato Excel
    utils.book_append_sheet(workbook, worksheet, "Concentrado");

    // Fecha de hoy
    let today = new Date();
    let day = String(today.getDate()).padStart(2, '0');
    let month = String(today.getMonth() + 1).padStart(2, '0'); // Enero es 0
    let year = today.getFullYear();
    let formattedDate = `${year}-${month}-${day}`;

    // Guardar archivo Excel
    writeFileXLSX(workbook, "Concentrado_Banamex_"+ formattedDate +".xlsx");
}

</script>

<template>
    <AppLayout title="Estados de Cuenta">
        <template #header>
            <div class="flex items-center space-x-3">
                <h2 class="font-semibold text-xl text-gray-800 leading-tight md:mr-2">
                    Estado de Cuenta
                </h2>
                <!-- Lista de bancos -->
                <button @click="switchBankOrder('bbva')" class="flex items-center w-16 h-16 p-1 rounded bg-white hover:bg-sky-200 hover:border-sky-500 active:bg-sky-400 shadow-md border border-gray-200 overflow-hidden transition-colors duration-150 ease-in-out">
                    <img class="rounded" src="https://play-lh.googleusercontent.com/oraD6oZpIkoQ3ZAv3uOM-yggF5_8RIHB5QFcx__WccT2vr8uA9ffQmX95ExdMZuBzf8" alt="Santander Logo">
                </button>
                <button @click="switchBankOrder('banamex')" class="flex items-center w-16 h-16 p-1 rounded bg-white hover:bg-sky-200 hover:border-sky-500 active:bg-sky-400 shadow-md border border-gray-200 overflow-hidden transition-colors duration-150 ease-in-out">
                    <img class="rounded" src="https://www.banamex.com/assets/img/home/banamexLogo.jpg" alt="Banamex Logo">
                </button>
                <button class="hidden items-center w-16 h-16 p-1 rounded bg-white hover:bg-sky-200 hover:border-sky-500 active:bg-sky-400 shadow-md border border-gray-200 overflow-hidden transition-colors duration-150 ease-in-out">
                    <img class="rounded" src="https://centrosantafe.com.mx/cdn/shop/files/376.png?v=9702320089011248641" alt="Santander Logo">
                </button>
                <button class="hidden items-center w-16 h-16 p-1 rounded bg-white hover:bg-sky-200 hover:border-sky-500 active:bg-sky-400 shadow-md border border-gray-200 overflow-hidden transition-colors duration-150 ease-in-out">
                    <img class="rounded" src="https://facturaelectronica.scotiabank.com.mx/consultaFacElecWeb/static/media/Scotia.53b03a880a8729527280.png" alt="Scotia Bank Logo">
                </button>
            </div>
        </template>

        <div class="py-12">
            <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
                <div class="w-full flex flex-col space-y-4 gap-y-4">
                    <!-- BBVA SECTION -->
                    <section :class="SortBank.BBVA">
                        <!-- Contenedor Principal -->
                        <div class="lg:flex gap-4 items-stretch">
                            <!-- Caja Grande -->
                            <div class="bg-white md:p-2 p-4 rounded-lg border border-gray-200 mb-4 lg:mb-0 shadow-md lg:w-[35%]">
                                <div class="flex items-center space-x-5 h-full">
                                    <div>
                                        <input ref="excelData" type="file" class="hidden" @change="(event) => handleExcelFileChange(Banks.BBVA, event)" />
                                    </div>
                                    <button @click="excelData.click()" class="border-2 border-gray-200 hover:border-sky-500 rounded-lg hover:bg-gray-50 hover:shadow-md active:border-gray-50 transition-all duration-150 p-3">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="64px" height="64px" viewBox="0 0 782.04441 701.88002" xmlns:xlink="http://www.w3.org/1999/xlink" role="img" artist="Katerina Limpitsouni" source="https://undraw.co/"><path d="M609.48783,100.59015l-25.44631,6.56209L270.53735,187.9987,245.091,194.56079A48.17927,48.17927,0,0,0,210.508,253.17865L320.849,681.05606a48.17924,48.17924,0,0,0,58.61776,34.58317l.06572-.01695,364.26536-93.93675.06572-.01695a48.17923,48.17923,0,0,0,34.58309-58.6178l-110.341-427.87741A48.17928,48.17928,0,0,0,609.48783,100.59015Z" transform="translate(-208.9778 -99.05999)" fill="#f2f2f2"/><path d="M612.94784,114.00532l-30.13945,7.77236L278.68955,200.20385l-30.139,7.77223a34.30949,34.30949,0,0,0-24.6275,41.74308l110.341,427.87741a34.30946,34.30946,0,0,0,41.7431,24.62736l.06572-.01695,364.26536-93.93674.06619-.01707a34.30935,34.30935,0,0,0,24.627-41.7429l-110.341-427.87741A34.30938,34.30938,0,0,0,612.94784,114.00532Z" transform="translate(-208.9778 -99.05999)" fill="#fff"/><path d="M590.19,252.56327,405.917,300.08359a8.01411,8.01411,0,0,1-4.00241-15.52046l184.273-47.52033A8.01412,8.01412,0,0,1,590.19,252.56327Z" transform="translate(-208.9778 -99.05999)" fill="#f2f2f2"/><path d="M628.955,270.49906,412.671,326.27437a8.01411,8.01411,0,1,1-4.00241-15.52046l216.284-55.77531a8.01411,8.01411,0,0,1,4.00242,15.52046Z" transform="translate(-208.9778 -99.05999)" fill="#f2f2f2"/><path d="M620.45825,369.93676l-184.273,47.52032a8.01411,8.01411,0,1,1-4.00242-15.52046l184.273-47.52032a8.01411,8.01411,0,1,1,4.00241,15.52046Z" transform="translate(-208.9778 -99.05999)" fill="#f2f2f2"/><path d="M659.22329,387.87255l-216.284,55.77531a8.01411,8.01411,0,1,1-4.00242-15.52046l216.284-55.77531a8.01411,8.01411,0,0,1,4.00242,15.52046Z" transform="translate(-208.9778 -99.05999)" fill="#f2f2f2"/><path d="M650.72653,487.31025l-184.273,47.52033a8.01412,8.01412,0,0,1-4.00242-15.52047l184.273-47.52032a8.01411,8.01411,0,0,1,4.00242,15.52046Z" transform="translate(-208.9778 -99.05999)" fill="#f2f2f2"/><path d="M689.49156,505.246l-216.284,55.77532a8.01412,8.01412,0,1,1-4.00241-15.52047l216.284-55.77531a8.01411,8.01411,0,0,1,4.00242,15.52046Z" transform="translate(-208.9778 -99.05999)" fill="#f2f2f2"/><path d="M374.45884,348.80871l-65.21246,16.817a3.847,3.847,0,0,1-4.68062-2.76146L289.5963,304.81607a3.847,3.847,0,0,1,2.76145-4.68061l65.21247-16.817a3.847,3.847,0,0,1,4.68061,2.76145l14.96947,58.04817A3.847,3.847,0,0,1,374.45884,348.80871Z" transform="translate(-208.9778 -99.05999)" fill="#e6e6e6"/><path d="M404.72712,466.1822l-65.21247,16.817a3.847,3.847,0,0,1-4.68062-2.76146l-14.96946-58.04816A3.847,3.847,0,0,1,322.626,417.509l65.21246-16.817a3.847,3.847,0,0,1,4.68062,2.76145l14.96946,58.04817A3.847,3.847,0,0,1,404.72712,466.1822Z" transform="translate(-208.9778 -99.05999)" fill="#e6e6e6"/><path d="M434.99539,583.55569l-65.21246,16.817a3.847,3.847,0,0,1-4.68062-2.76145l-14.96946-58.04817a3.847,3.847,0,0,1,2.76145-4.68062l65.21247-16.817a3.847,3.847,0,0,1,4.68061,2.76146l14.96947,58.04816A3.847,3.847,0,0,1,434.99539,583.55569Z" transform="translate(-208.9778 -99.05999)" fill="#e6e6e6"/><path d="M863.63647,209.0517H487.31811a48.17928,48.17928,0,0,0-48.125,48.12512V699.05261a48.17924,48.17924,0,0,0,48.125,48.12507H863.63647a48.17924,48.17924,0,0,0,48.125-48.12507V257.17682A48.17928,48.17928,0,0,0,863.63647,209.0517Z" transform="translate(-208.9778 -99.05999)" fill="#e6e6e6"/><path d="M863.637,222.90589H487.31811a34.30948,34.30948,0,0,0-34.271,34.27093V699.05261a34.30947,34.30947,0,0,0,34.271,34.27088H863.637a34.30936,34.30936,0,0,0,34.27051-34.27088V257.17682A34.30937,34.30937,0,0,0,863.637,222.90589Z" transform="translate(-208.9778 -99.05999)" fill="#fff"/><circle cx="694.19401" cy="614.02963" r="87.85039" fill="#0ea5e9"/><path d="M945.18722,701.63087H914.63056V671.07421a11.45875,11.45875,0,0,0-22.9175,0v30.55666H861.1564a11.45875,11.45875,0,0,0,0,22.9175h30.55666V755.105a11.45875,11.45875,0,1,0,22.9175,0V724.54837h30.55666a11.45875,11.45875,0,0,0,0-22.9175Z" transform="translate(-208.9778 -99.05999)" fill="#fff"/><path d="M807.00068,465.71551H616.699a8.01412,8.01412,0,1,1,0-16.02823H807.00068a8.01412,8.01412,0,0,1,0,16.02823Z" transform="translate(-208.9778 -99.05999)" fill="#e6e6e6"/><path d="M840.05889,492.76314H616.699a8.01412,8.01412,0,1,1,0-16.02823H840.05889a8.01411,8.01411,0,1,1,0,16.02823Z" transform="translate(-208.9778 -99.05999)" fill="#e6e6e6"/><path d="M807.00068,586.929H616.699a8.01412,8.01412,0,1,1,0-16.02823H807.00068a8.01411,8.01411,0,0,1,0,16.02823Z" transform="translate(-208.9778 -99.05999)" fill="#e6e6e6"/><path d="M840.05889,613.97661H616.699a8.01412,8.01412,0,1,1,0-16.02823H840.05889a8.01412,8.01412,0,1,1,0,16.02823Z" transform="translate(-208.9778 -99.05999)" fill="#e6e6e6"/><path d="M574.07028,505.04162H506.72434a3.847,3.847,0,0,1-3.84278-3.84278V441.25158a3.847,3.847,0,0,1,3.84278-3.84278h67.34594a3.847,3.847,0,0,1,3.84278,3.84278v59.94726A3.847,3.847,0,0,1,574.07028,505.04162Z" transform="translate(-208.9778 -99.05999)" fill="#e6e6e6"/><path d="M574.07028,626.25509H506.72434a3.847,3.847,0,0,1-3.84278-3.84278V562.46505a3.847,3.847,0,0,1,3.84278-3.84278h67.34594a3.847,3.847,0,0,1,3.84278,3.84278v59.94726A3.847,3.847,0,0,1,574.07028,626.25509Z" transform="translate(-208.9778 -99.05999)" fill="#e6e6e6"/><path d="M807.21185,330.781H666.91017a8.01411,8.01411,0,0,1,0-16.02823H807.21185a8.01411,8.01411,0,0,1,0,16.02823Z" transform="translate(-208.9778 -99.05999)" fill="#ccc"/><path d="M840.27007,357.82862H666.91017a8.01411,8.01411,0,1,1,0-16.02822h173.3599a8.01411,8.01411,0,0,1,0,16.02822Z" transform="translate(-208.9778 -99.05999)" fill="#ccc"/><path d="M635.85911,390.6071H506.51316a3.847,3.847,0,0,1-3.84277-3.84277V285.81706a3.847,3.847,0,0,1,3.84277-3.84277H635.85911a3.847,3.847,0,0,1,3.84277,3.84277V386.76433A3.847,3.847,0,0,1,635.85911,390.6071Z" transform="translate(-208.9778 -99.05999)" fill="#0ea5e9"/></svg>
                                    </button>
                                    <div>
                                        <p>{{ CurrentExcelFile.name != '' ? Format.TruncateText(CurrentExcelFile.name, 18) : 'Cargar archivo BBVA' }}</p>
                                        <div v-if="Workbook.SheetNames.length > 0" class="flex">
                                            <li v-for="Spreadsheet in Workbook.SheetNames" class="flex cursor-pointer items-center font-sans text-sm font-normal leading-normal text-blue-gray-900 antialiased transition-colors duration-300 hover:text-pink-500">
                                                <a class="opacity-60" href="#">
                                                <span>{{ Format.TruncateText(Spreadsheet.FileName) }}</span>
                                                </a>
                                                <span class="pointer-events-none mx-2 select-none font-sans text-sm font-normal leading-normal text-blue-gray-500 antialiased">
                                                    
                                                </span>
                                            </li>
                                        </div>
                                        <h2 class="hidden text-4xl font-bold text-gray-600">50.365</h2>
                                        <p :title="CurrentExcelFile.name">{{ Format.TruncateText(CurrentExcelFile.activeSheet.name, 18) }}</p>
                                    </div>
                                </div>
                            </div>

                            <!-- Caja Blanca -->
                            <div class="bg-white p-4 rounded-lg xs:mb-4 max-w-full shadow-md lg:w-[65%]">
                                <!-- Cajas pequeñas -->
                                <div class="flex flex-wrap justify-between h-full">
                                    <!-- Caja pequeña 1 -->
                                    <div
                                        class="flex-1 bg-gradient-to-r from-cyan-400 to-cyan-500 rounded-lg flex flex-col items-center justify-center p-4 space-y-2 border border-gray-200 m-2">
                                        <p class="text-white">Abonos <span v-if="CurrentExcelFile.activeSheet.data.resume?.AbonoTotalString" class="font-bold"> {{ CurrentExcelFile.activeSheet.data.resume.AbonoTotalString ?? '' }} </span></p>
                                    </div>

                                    <!-- Caja pequeña 2 -->
                                    <div
                                        class="flex-1 bg-gradient-to-r from-cyan-400 to-cyan-600 rounded-lg flex flex-col items-center justify-center p-4 space-y-2 border border-gray-200 m-2">
                                        <p class="text-white">Cargos <span v-if="CurrentExcelFile.activeSheet.data.resume?.CargoTotalString" class="font-bold"> {{ CurrentExcelFile.activeSheet.data.resume.CargoTotalString ?? '' }} </span></p>
                                    </div>

                                    <!-- Caja pequeña 3 -->
                                    <div
                                        class="flex-1 bg-gradient-to-r from-cyan-400 to-cyan-600 rounded-lg flex flex-col items-center justify-center p-4 space-y-2 border border-gray-200 m-2">
                                        <p class="text-white">Saldo <span v-if="CurrentExcelFile.activeSheet.data.resume?.SaldoTotalString" class="font-bold"> {{ CurrentExcelFile.activeSheet.data.resume.SaldoTotalString ?? '' }} </span></p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <section class="flex space-x-4 mt-4">
                            <!-- ChartJS -->
                            <div class="bg-white md:w-1/2 overflow-hidden shadow-xl sm:rounded-lg px-4 py-8">
                                <div class="flex justify-center">
                                    <div>
                                        <Doughnut :data="ResumeChartData" :options="options" />
                                    </div>
                                    <!-- <NavigationButton @click="exportFile" class="hidden ml-24 max-w-20 w-14 flex justify-centner border-[#45B058]">
                                        <svg width="32px" height="32px" viewBox="-4 0 64 64" xmlns="http://www.w3.org/2000/svg" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M5.112.006c-2.802 0-5.073 2.273-5.073 5.074v53.841c0 2.803 2.271 5.074 5.073 5.074h45.774c2.801 0 5.074-2.271 5.074-5.074v-38.605l-18.902-20.31h-31.946z" fill-rule="evenodd" clip-rule="evenodd" fill="#45B058"></path><path d="M19.429 53.938c-.216 0-.415-.09-.54-.27l-3.728-4.97-3.745 4.97c-.126.18-.324.27-.54.27-.396 0-.72-.306-.72-.72 0-.144.035-.306.144-.432l3.89-5.131-3.619-4.826c-.09-.126-.145-.27-.145-.414 0-.342.288-.72.721-.72.216 0 .432.108.576.288l3.438 4.628 3.438-4.646c.127-.18.324-.27.541-.27.378 0 .738.306.738.72 0 .144-.036.288-.127.414l-3.619 4.808 3.891 5.149c.09.126.125.27.125.414 0 .396-.324.738-.719.738zm9.989-.126h-5.455c-.595 0-1.081-.486-1.081-1.08v-10.317c0-.396.324-.72.774-.72.396 0 .721.324.721.72v10.065h5.041c.359 0 .648.288.648.648 0 .396-.289.684-.648.684zm6.982.216c-1.782 0-3.188-.594-4.213-1.495-.162-.144-.234-.342-.234-.54 0-.36.27-.756.702-.756.144 0 .306.036.433.144.828.738 1.98 1.314 3.367 1.314 2.143 0 2.826-1.152 2.826-2.071 0-3.097-7.111-1.386-7.111-5.672 0-1.98 1.764-3.331 4.123-3.331 1.548 0 2.881.468 3.853 1.278.162.144.253.342.253.54 0 .36-.307.72-.703.72-.145 0-.307-.054-.432-.162-.883-.72-1.98-1.044-3.079-1.044-1.44 0-2.467.774-2.467 1.909 0 2.701 7.112 1.152 7.112 5.636 0 1.748-1.188 3.53-4.43 3.53z" fill="#ffffff"></path><path d="M55.953 20.352v1h-12.801s-6.312-1.26-6.127-6.707c0 0 .207 5.707 6.002 5.707h12.926z" fill-rule="evenodd" clip-rule="evenodd" fill="#349C42"></path><path d="M37.049 0v14.561c0 1.656 1.104 5.791 6.104 5.791h12.801l-18.905-20.352z" opacity=".5" fill-rule="evenodd" clip-rule="evenodd" fill="#ffffff"></path></g></svg>
                                    </NavigationButton> -->
                                </div>
                                <table id="excelTable" border="1"></table>
                            </div>
                            <!-- ChartJS -->
                            <!-- Movimientos por Concepto -->
                            <div class="md:w-1/2 max-h-96 overflow-y-auto bg-white border border-gray-100 shadow-md shadow-black/5 p-6 rounded-md">
                                <div class="flex justify-between mb-0 items-start">
                                    <div class="font-medium">Movimientos</div>
                                    <div class="flex items-center space-x-2">
                                    <NavigationButton v-show="HasFilter" @click.native="ExportGrupedByFiles" class="ml-24 max-w-20 w-14 flex justify-center">
                                        <p class="font-medium text-sky-500">
                                            Exportar
                                        </p>
                                    </NavigationButton>
                                    <NavigationButton @click.native="GroupByConcept" class="ml-24 max-w-20 w-14 flex justify-center">
                                        <p class="font-medium text-sky-500">
                                            Agrupar
                                        </p>
                                    </NavigationButton>
                                    </div>
                                </div>
                                <div class="overflow-x-auto">
                                    <table v-if="CurrentExcelFile.activeSheet.rows.length > 0" class="w-full min-w-[460px]" id="excelTableBBVA">
                                        <thead>
                                            <tr>
                                                <th class="text-[12px] uppercase tracking-wide font-medium text-gray-400 py-2 px-4 bg-gray-50 text-left rounded-tl-md rounded-bl-md">Concepto</th>
                                                <th class="text-[12px] uppercase tracking-wide font-medium text-gray-400 py-2 px-4 bg-gray-50 text-left">Abono</th>
                                                <th class="text-[12px] uppercase tracking-wide font-medium text-gray-400 py-2 px-4 bg-gray-50 text-left rounded-tr-md rounded-br-md">Cargo</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr v-if="HasFilter" v-for="(row, idx) in CurrentExcelFile.activeSheet.groupedRows" :key="idx">
                                                <td class="py-2 px-4 border-b border-b-gray-50">
                                                    <div class="flex items-center">
                                                        <a href="#" class="text-gray-600 text-sm font-medium hover:text-blue-500 ml-2 truncate">{{ (row.Concepto) }}</a>
                                                    </div>
                                                </td>
                                                <td class="py-2 px-4 border-b border-b-gray-50">
                                                    <span class="text-[13px] font-medium text-emerald-500">{{ Format.Currency(row.Abono) }}</span>
                                                </td>
                                                <td class="py-2 px-4 border-b border-b-gray-50">
                                                    <span class="inline-block p-1 rounded bg-rose-500/10 text-rose-500 font-medium text-[12px] leading-none">- {{ Format.Currency(row.Cargo) }}</span>
                                                </td>
                                            </tr>
                                            <tr v-else v-for="(row, index) in CurrentExcelFile.activeSheet.rows" :key="index">
                                                <td class="py-2 px-4 border-b border-b-gray-50">
                                                    <div class="flex items-center">
                                                        <img src="https://placehold.co/32x32" alt="" class="w-8 h-8 rounded object-cover block">
                                                        <a href="#" class="text-gray-600 text-sm font-medium hover:text-blue-500 ml-2 truncate">{{ (row[1]) }}</a>
                                                    </div>
                                                </td>
                                                <td class="py-2 px-4 border-b border-b-gray-50">
                                                    <span class="text-[13px] font-medium text-emerald-500">{{ Format.Currency(row[4]) }}</span>
                                                </td>
                                                <td class="py-2 px-4 border-b border-b-gray-50">
                                                    <span class="inline-block p-1 rounded bg-rose-500/10 text-rose-500 font-medium text-[12px] leading-none">- {{ Format.Currency(row[5]) }}</span>
                                                </td>
                                            </tr>
                                            </tbody>
                                    </table>
                                </div>
                            </div>
                            <!-- /Movimientos por Concepto -->
                        </section>
                    </section>
                    <!-- BANAMEX SECTION -->
                    <section :class="SortBank.Banamex">
                        <!-- Contenedor Principal -->
                        <div class="lg:flex gap-4 items-stretch">
                            <!-- Caja Grande -->
                            <div class="bg-white md:p-2 p-4 rounded-lg border border-gray-200 mb-4 lg:mb-0 shadow-md lg:w-[35%]">
                                <div class="flex items-center space-x-5 h-full">
                                    <div>
                                        <input ref="excelDataBanamex" type="file" class="hidden" @change="(event) => handleExcelFileChange(Banks.Banamex, event)" />
                                    </div>
                                    <button @click="excelDataBanamex.click()" class="border-2 border-gray-200 hover:border-sky-500 rounded-lg hover:bg-gray-50 hover:shadow-md active:border-gray-50 transition-all duration-150 p-3">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="64px" height="64px" viewBox="0 0 782.04441 701.88002" xmlns:xlink="http://www.w3.org/1999/xlink" role="img" artist="Katerina Limpitsouni" source="https://undraw.co/"><path d="M609.48783,100.59015l-25.44631,6.56209L270.53735,187.9987,245.091,194.56079A48.17927,48.17927,0,0,0,210.508,253.17865L320.849,681.05606a48.17924,48.17924,0,0,0,58.61776,34.58317l.06572-.01695,364.26536-93.93675.06572-.01695a48.17923,48.17923,0,0,0,34.58309-58.6178l-110.341-427.87741A48.17928,48.17928,0,0,0,609.48783,100.59015Z" transform="translate(-208.9778 -99.05999)" fill="#f2f2f2"/><path d="M612.94784,114.00532l-30.13945,7.77236L278.68955,200.20385l-30.139,7.77223a34.30949,34.30949,0,0,0-24.6275,41.74308l110.341,427.87741a34.30946,34.30946,0,0,0,41.7431,24.62736l.06572-.01695,364.26536-93.93674.06619-.01707a34.30935,34.30935,0,0,0,24.627-41.7429l-110.341-427.87741A34.30938,34.30938,0,0,0,612.94784,114.00532Z" transform="translate(-208.9778 -99.05999)" fill="#fff"/><path d="M590.19,252.56327,405.917,300.08359a8.01411,8.01411,0,0,1-4.00241-15.52046l184.273-47.52033A8.01412,8.01412,0,0,1,590.19,252.56327Z" transform="translate(-208.9778 -99.05999)" fill="#f2f2f2"/><path d="M628.955,270.49906,412.671,326.27437a8.01411,8.01411,0,1,1-4.00241-15.52046l216.284-55.77531a8.01411,8.01411,0,0,1,4.00242,15.52046Z" transform="translate(-208.9778 -99.05999)" fill="#f2f2f2"/><path d="M620.45825,369.93676l-184.273,47.52032a8.01411,8.01411,0,1,1-4.00242-15.52046l184.273-47.52032a8.01411,8.01411,0,1,1,4.00241,15.52046Z" transform="translate(-208.9778 -99.05999)" fill="#f2f2f2"/><path d="M659.22329,387.87255l-216.284,55.77531a8.01411,8.01411,0,1,1-4.00242-15.52046l216.284-55.77531a8.01411,8.01411,0,0,1,4.00242,15.52046Z" transform="translate(-208.9778 -99.05999)" fill="#f2f2f2"/><path d="M650.72653,487.31025l-184.273,47.52033a8.01412,8.01412,0,0,1-4.00242-15.52047l184.273-47.52032a8.01411,8.01411,0,0,1,4.00242,15.52046Z" transform="translate(-208.9778 -99.05999)" fill="#f2f2f2"/><path d="M689.49156,505.246l-216.284,55.77532a8.01412,8.01412,0,1,1-4.00241-15.52047l216.284-55.77531a8.01411,8.01411,0,0,1,4.00242,15.52046Z" transform="translate(-208.9778 -99.05999)" fill="#f2f2f2"/><path d="M374.45884,348.80871l-65.21246,16.817a3.847,3.847,0,0,1-4.68062-2.76146L289.5963,304.81607a3.847,3.847,0,0,1,2.76145-4.68061l65.21247-16.817a3.847,3.847,0,0,1,4.68061,2.76145l14.96947,58.04817A3.847,3.847,0,0,1,374.45884,348.80871Z" transform="translate(-208.9778 -99.05999)" fill="#e6e6e6"/><path d="M404.72712,466.1822l-65.21247,16.817a3.847,3.847,0,0,1-4.68062-2.76146l-14.96946-58.04816A3.847,3.847,0,0,1,322.626,417.509l65.21246-16.817a3.847,3.847,0,0,1,4.68062,2.76145l14.96946,58.04817A3.847,3.847,0,0,1,404.72712,466.1822Z" transform="translate(-208.9778 -99.05999)" fill="#e6e6e6"/><path d="M434.99539,583.55569l-65.21246,16.817a3.847,3.847,0,0,1-4.68062-2.76145l-14.96946-58.04817a3.847,3.847,0,0,1,2.76145-4.68062l65.21247-16.817a3.847,3.847,0,0,1,4.68061,2.76146l14.96947,58.04816A3.847,3.847,0,0,1,434.99539,583.55569Z" transform="translate(-208.9778 -99.05999)" fill="#e6e6e6"/><path d="M863.63647,209.0517H487.31811a48.17928,48.17928,0,0,0-48.125,48.12512V699.05261a48.17924,48.17924,0,0,0,48.125,48.12507H863.63647a48.17924,48.17924,0,0,0,48.125-48.12507V257.17682A48.17928,48.17928,0,0,0,863.63647,209.0517Z" transform="translate(-208.9778 -99.05999)" fill="#e6e6e6"/><path d="M863.637,222.90589H487.31811a34.30948,34.30948,0,0,0-34.271,34.27093V699.05261a34.30947,34.30947,0,0,0,34.271,34.27088H863.637a34.30936,34.30936,0,0,0,34.27051-34.27088V257.17682A34.30937,34.30937,0,0,0,863.637,222.90589Z" transform="translate(-208.9778 -99.05999)" fill="#fff"/><circle cx="694.19401" cy="614.02963" r="87.85039" fill="#0ea5e9"/><path d="M945.18722,701.63087H914.63056V671.07421a11.45875,11.45875,0,0,0-22.9175,0v30.55666H861.1564a11.45875,11.45875,0,0,0,0,22.9175h30.55666V755.105a11.45875,11.45875,0,1,0,22.9175,0V724.54837h30.55666a11.45875,11.45875,0,0,0,0-22.9175Z" transform="translate(-208.9778 -99.05999)" fill="#fff"/><path d="M807.00068,465.71551H616.699a8.01412,8.01412,0,1,1,0-16.02823H807.00068a8.01412,8.01412,0,0,1,0,16.02823Z" transform="translate(-208.9778 -99.05999)" fill="#e6e6e6"/><path d="M840.05889,492.76314H616.699a8.01412,8.01412,0,1,1,0-16.02823H840.05889a8.01411,8.01411,0,1,1,0,16.02823Z" transform="translate(-208.9778 -99.05999)" fill="#e6e6e6"/><path d="M807.00068,586.929H616.699a8.01412,8.01412,0,1,1,0-16.02823H807.00068a8.01411,8.01411,0,0,1,0,16.02823Z" transform="translate(-208.9778 -99.05999)" fill="#e6e6e6"/><path d="M840.05889,613.97661H616.699a8.01412,8.01412,0,1,1,0-16.02823H840.05889a8.01412,8.01412,0,1,1,0,16.02823Z" transform="translate(-208.9778 -99.05999)" fill="#e6e6e6"/><path d="M574.07028,505.04162H506.72434a3.847,3.847,0,0,1-3.84278-3.84278V441.25158a3.847,3.847,0,0,1,3.84278-3.84278h67.34594a3.847,3.847,0,0,1,3.84278,3.84278v59.94726A3.847,3.847,0,0,1,574.07028,505.04162Z" transform="translate(-208.9778 -99.05999)" fill="#e6e6e6"/><path d="M574.07028,626.25509H506.72434a3.847,3.847,0,0,1-3.84278-3.84278V562.46505a3.847,3.847,0,0,1,3.84278-3.84278h67.34594a3.847,3.847,0,0,1,3.84278,3.84278v59.94726A3.847,3.847,0,0,1,574.07028,626.25509Z" transform="translate(-208.9778 -99.05999)" fill="#e6e6e6"/><path d="M807.21185,330.781H666.91017a8.01411,8.01411,0,0,1,0-16.02823H807.21185a8.01411,8.01411,0,0,1,0,16.02823Z" transform="translate(-208.9778 -99.05999)" fill="#ccc"/><path d="M840.27007,357.82862H666.91017a8.01411,8.01411,0,1,1,0-16.02822h173.3599a8.01411,8.01411,0,0,1,0,16.02822Z" transform="translate(-208.9778 -99.05999)" fill="#ccc"/><path d="M635.85911,390.6071H506.51316a3.847,3.847,0,0,1-3.84277-3.84277V285.81706a3.847,3.847,0,0,1,3.84277-3.84277H635.85911a3.847,3.847,0,0,1,3.84277,3.84277V386.76433A3.847,3.847,0,0,1,635.85911,390.6071Z" transform="translate(-208.9778 -99.05999)" fill="#0ea5e9"/></svg>
                                    </button>
                                    <div>
                                        <p>{{ CurrentExcelFileBanamex.name != '' ? Format.TruncateText(CurrentExcelFileBanamex.name, 18) : 'Cargar archivo Banamex' }}</p>
                                        <div v-if="Workbook.SheetNames.length > 0" class="flex">
                                            <li v-for="Spreadsheet in Workbook.SheetNames" class="flex cursor-pointer items-center font-sans text-sm font-normal leading-normal text-blue-gray-900 antialiased transition-colors duration-300 hover:text-pink-500">
                                                <a class="opacity-60" href="#">
                                                <span>{{ Format.TruncateText(Spreadsheet.FileName) }}</span>
                                                </a>
                                                <span class="pointer-events-none mx-2 select-none font-sans text-sm font-normal leading-normal text-blue-gray-500 antialiased">
                                                    
                                                </span>
                                            </li>
                                        </div>
                                        <h2 class="hidden text-4xl font-bold text-gray-600">50.365</h2>
                                        <p :title="CurrentExcelFileBanamex.name">{{ Format.TruncateText(CurrentExcelFileBanamex.activeSheet.name, 18) }}</p>
                                    </div>
                                </div>
                            </div>

                            <!-- Caja Blanca -->
                            <div class="bg-white p-4 rounded-lg xs:mb-4 max-w-full shadow-md lg:w-[65%]">
                                <!-- Cajas pequeñas -->
                                <div class="flex flex-wrap justify-between h-full">
                                    <!-- Caja pequeña 1 -->
                                    <div
                                        class="flex-1 bg-gradient-to-r from-cyan-400 to-cyan-500 rounded-lg flex flex-col items-center justify-center p-4 space-y-2 border border-gray-200 m-2">
                                        <p class="text-white">Abonos <span v-if="CurrentExcelFileBanamex.activeSheet.data.resume?.AbonoTotalString" class="font-bold"> {{ CurrentExcelFileBanamex.activeSheet.data.resume.AbonoTotalString ?? '' }} </span></p>
                                    </div>

                                    <!-- Caja pequeña 2 -->
                                    <div
                                        class="flex-1 bg-gradient-to-r from-cyan-400 to-cyan-600 rounded-lg flex flex-col items-center justify-center p-4 space-y-2 border border-gray-200 m-2">
                                        <p class="text-white">Cargos <span v-if="CurrentExcelFileBanamex.activeSheet.data.resume?.CargoTotalString" class="font-bold"> {{ CurrentExcelFileBanamex.activeSheet.data.resume.CargoTotalString ?? '' }} </span></p>
                                    </div>

                                    <!-- Caja pequeña 3 -->
                                    <div
                                        class="flex-1 bg-gradient-to-r from-cyan-400 to-cyan-600 rounded-lg flex flex-col items-center justify-center p-4 space-y-2 border border-gray-200 m-2">
                                        <p class="text-white">Saldo <span v-if="CurrentExcelFileBanamex.activeSheet.data.resume?.SaldoTotalString" class="font-bold"> {{ CurrentExcelFileBanamex.activeSheet.data.resume.SaldoTotalString ?? '' }} </span></p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <section class="flex space-x-4 mt-4">
                            <!-- ChartJS -->
                            <div class="bg-white md:w-1/2 overflow-hidden shadow-xl sm:rounded-lg px-4 py-8">
                                <div class="flex justify-center">
                                    <div>
                                        <Doughnut :data="ResumeChartDataBanamex" :options="options" />
                                    </div>
                                    <!-- <NavigationButton @click="exportFile" class="hidden ml-24 max-w-20 w-14 flex justify-centner border-[#45B058]">
                                        <svg width="32px" height="32px" viewBox="-4 0 64 64" xmlns="http://www.w3.org/2000/svg" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M5.112.006c-2.802 0-5.073 2.273-5.073 5.074v53.841c0 2.803 2.271 5.074 5.073 5.074h45.774c2.801 0 5.074-2.271 5.074-5.074v-38.605l-18.902-20.31h-31.946z" fill-rule="evenodd" clip-rule="evenodd" fill="#45B058"></path><path d="M19.429 53.938c-.216 0-.415-.09-.54-.27l-3.728-4.97-3.745 4.97c-.126.18-.324.27-.54.27-.396 0-.72-.306-.72-.72 0-.144.035-.306.144-.432l3.89-5.131-3.619-4.826c-.09-.126-.145-.27-.145-.414 0-.342.288-.72.721-.72.216 0 .432.108.576.288l3.438 4.628 3.438-4.646c.127-.18.324-.27.541-.27.378 0 .738.306.738.72 0 .144-.036.288-.127.414l-3.619 4.808 3.891 5.149c.09.126.125.27.125.414 0 .396-.324.738-.719.738zm9.989-.126h-5.455c-.595 0-1.081-.486-1.081-1.08v-10.317c0-.396.324-.72.774-.72.396 0 .721.324.721.72v10.065h5.041c.359 0 .648.288.648.648 0 .396-.289.684-.648.684zm6.982.216c-1.782 0-3.188-.594-4.213-1.495-.162-.144-.234-.342-.234-.54 0-.36.27-.756.702-.756.144 0 .306.036.433.144.828.738 1.98 1.314 3.367 1.314 2.143 0 2.826-1.152 2.826-2.071 0-3.097-7.111-1.386-7.111-5.672 0-1.98 1.764-3.331 4.123-3.331 1.548 0 2.881.468 3.853 1.278.162.144.253.342.253.54 0 .36-.307.72-.703.72-.145 0-.307-.054-.432-.162-.883-.72-1.98-1.044-3.079-1.044-1.44 0-2.467.774-2.467 1.909 0 2.701 7.112 1.152 7.112 5.636 0 1.748-1.188 3.53-4.43 3.53z" fill="#ffffff"></path><path d="M55.953 20.352v1h-12.801s-6.312-1.26-6.127-6.707c0 0 .207 5.707 6.002 5.707h12.926z" fill-rule="evenodd" clip-rule="evenodd" fill="#349C42"></path><path d="M37.049 0v14.561c0 1.656 1.104 5.791 6.104 5.791h12.801l-18.905-20.352z" opacity=".5" fill-rule="evenodd" clip-rule="evenodd" fill="#ffffff"></path></g></svg>
                                    </NavigationButton> -->
                                </div>
                                <table id="excelTable" border="1"></table>
                            </div>
                            <!-- ChartJS -->
                            <!-- Movimientos por Concepto -->
                            <div class="md:w-1/2 max-h-96 overflow-y-auto bg-white border border-gray-100 shadow-md shadow-black/5 p-6 rounded-md">
                                <div class="flex justify-between mb-0 items-start">
                                    <div class="font-medium">Movimientos</div>
                                    <div class="flex items-center space-x-2">
                                    <NavigationButton v-show="HasFilterBanamex" @click.native="ExportGroupedByFilesBanamex" class="ml-24 max-w-20 w-14 flex justify-center">
                                        <p class="font-medium text-sky-500">
                                            Exportar
                                        </p>
                                    </NavigationButton>
                                    <NavigationButton @click.native="GroupByConceptBanamex" class="ml-24 max-w-20 w-14 flex justify-center">
                                        <p class="font-medium text-sky-500">
                                            Agrupar
                                        </p>
                                    </NavigationButton>
                                    </div>
                                </div>
                                <div class="overflow-x-auto">
                                    <table v-if="CurrentExcelFileBanamex.activeSheet.rows.length > 0" class="w-full min-w-[460px]" id="excelTableBanamex">
                                        <thead>
                                            <tr>
                                                <th class="text-[12px] uppercase tracking-wide font-medium text-gray-400 py-2 px-4 bg-gray-50 text-left rounded-tl-md rounded-bl-md">Concepto</th>
                                                <th class="text-[12px] uppercase tracking-wide font-medium text-gray-400 py-2 px-4 bg-gray-50 text-left">Abono</th>
                                                <th class="text-[12px] uppercase tracking-wide font-medium text-gray-400 py-2 px-4 bg-gray-50 text-left rounded-tr-md rounded-br-md">Cargo</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr v-if="HasFilterBanamex" v-for="(row, idx) in CurrentExcelFileBanamex.activeSheet.groupedRows" :key="idx">
                                                <td class="py-2 px-4 border-b border-b-gray-50">
                                                    <div class="flex items-center">
                                                        <a href="#" class="text-gray-600 text-sm font-medium hover:text-blue-500 ml-2 truncate">{{ (row.Concepto) }}</a>
                                                    </div>
                                                </td>
                                                <td class="py-2 px-4 border-b border-b-gray-50">
                                                    <span class="text-[13px] font-medium text-emerald-500">{{ Format.Currency(row.Abono) }}</span>
                                                </td>
                                                <td class="py-2 px-4 border-b border-b-gray-50">
                                                    <span class="inline-block p-1 rounded bg-rose-500/10 text-rose-500 font-medium text-[12px] leading-none">- {{ Format.Currency(row.Cargo) }}</span>
                                                </td>
                                            </tr>
                                            <tr v-else v-for="(row, index) in CurrentExcelFileBanamex.activeSheet.rows" :key="index">
                                                <td class="py-2 px-4 border-b border-b-gray-50">
                                                    <div class="flex items-center">
                                                        <img src="https://placehold.co/32x32" alt="" class="w-8 h-8 rounded object-cover block">
                                                        <a href="#" class="text-gray-600 text-sm font-medium hover:text-blue-500 ml-2 truncate">{{ (row[1]) }}</a>
                                                    </div>
                                                </td>
                                                <td class="py-2 px-4 border-b border-b-gray-50">
                                                    <span class="text-[13px] font-medium text-emerald-500">{{ Format.Currency(row[4]) }}</span>
                                                </td>
                                                <td class="py-2 px-4 border-b border-b-gray-50">
                                                    <span class="inline-block p-1 rounded bg-rose-500/10 text-rose-500 font-medium text-[12px] leading-none">- {{ Format.Currency(row[5]) }}</span>
                                                </td>
                                            </tr>
                                            </tbody>
                                    </table>
                                </div>
                            </div>
                            <!-- /Movimientos por Concepto -->
                        </section>
                    </section>
                    <!-- SANTANDER SECTION -->
                    <section :class="SortBank.Santander">
                        <!-- Contenedor Principal -->
                        <div class="lg:flex gap-4 items-stretch">
                            <!-- Caja Grande -->
                            <div class="bg-white md:p-2 p-4 rounded-lg border border-gray-200 mb-4 lg:mb-0 shadow-md lg:w-[35%]">
                                <div class="flex items-center space-x-5 h-full">
                                    <div>
                                        <input ref="excelDataSantander" type="file" class="hidden" @change="(event) => handleExcelFileChange(Banks.Santander, event)" />
                                    </div>
                                    <button @click="excelDataSantander.click()" class="border-2 border-gray-200 hover:border-sky-500 rounded-lg hover:bg-gray-50 hover:shadow-md active:border-gray-50 transition-all duration-150 p-3">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="64px" height="64px" viewBox="0 0 782.04441 701.88002" xmlns:xlink="http://www.w3.org/1999/xlink" role="img" artist="Katerina Limpitsouni" source="https://undraw.co/"><path d="M609.48783,100.59015l-25.44631,6.56209L270.53735,187.9987,245.091,194.56079A48.17927,48.17927,0,0,0,210.508,253.17865L320.849,681.05606a48.17924,48.17924,0,0,0,58.61776,34.58317l.06572-.01695,364.26536-93.93675.06572-.01695a48.17923,48.17923,0,0,0,34.58309-58.6178l-110.341-427.87741A48.17928,48.17928,0,0,0,609.48783,100.59015Z" transform="translate(-208.9778 -99.05999)" fill="#f2f2f2"/><path d="M612.94784,114.00532l-30.13945,7.77236L278.68955,200.20385l-30.139,7.77223a34.30949,34.30949,0,0,0-24.6275,41.74308l110.341,427.87741a34.30946,34.30946,0,0,0,41.7431,24.62736l.06572-.01695,364.26536-93.93674.06619-.01707a34.30935,34.30935,0,0,0,24.627-41.7429l-110.341-427.87741A34.30938,34.30938,0,0,0,612.94784,114.00532Z" transform="translate(-208.9778 -99.05999)" fill="#fff"/><path d="M590.19,252.56327,405.917,300.08359a8.01411,8.01411,0,0,1-4.00241-15.52046l184.273-47.52033A8.01412,8.01412,0,0,1,590.19,252.56327Z" transform="translate(-208.9778 -99.05999)" fill="#f2f2f2"/><path d="M628.955,270.49906,412.671,326.27437a8.01411,8.01411,0,1,1-4.00241-15.52046l216.284-55.77531a8.01411,8.01411,0,0,1,4.00242,15.52046Z" transform="translate(-208.9778 -99.05999)" fill="#f2f2f2"/><path d="M620.45825,369.93676l-184.273,47.52032a8.01411,8.01411,0,1,1-4.00242-15.52046l184.273-47.52032a8.01411,8.01411,0,1,1,4.00241,15.52046Z" transform="translate(-208.9778 -99.05999)" fill="#f2f2f2"/><path d="M659.22329,387.87255l-216.284,55.77531a8.01411,8.01411,0,1,1-4.00242-15.52046l216.284-55.77531a8.01411,8.01411,0,0,1,4.00242,15.52046Z" transform="translate(-208.9778 -99.05999)" fill="#f2f2f2"/><path d="M650.72653,487.31025l-184.273,47.52033a8.01412,8.01412,0,0,1-4.00242-15.52047l184.273-47.52032a8.01411,8.01411,0,0,1,4.00242,15.52046Z" transform="translate(-208.9778 -99.05999)" fill="#f2f2f2"/><path d="M689.49156,505.246l-216.284,55.77532a8.01412,8.01412,0,1,1-4.00241-15.52047l216.284-55.77531a8.01411,8.01411,0,0,1,4.00242,15.52046Z" transform="translate(-208.9778 -99.05999)" fill="#f2f2f2"/><path d="M374.45884,348.80871l-65.21246,16.817a3.847,3.847,0,0,1-4.68062-2.76146L289.5963,304.81607a3.847,3.847,0,0,1,2.76145-4.68061l65.21247-16.817a3.847,3.847,0,0,1,4.68061,2.76145l14.96947,58.04817A3.847,3.847,0,0,1,374.45884,348.80871Z" transform="translate(-208.9778 -99.05999)" fill="#e6e6e6"/><path d="M404.72712,466.1822l-65.21247,16.817a3.847,3.847,0,0,1-4.68062-2.76146l-14.96946-58.04816A3.847,3.847,0,0,1,322.626,417.509l65.21246-16.817a3.847,3.847,0,0,1,4.68062,2.76145l14.96946,58.04817A3.847,3.847,0,0,1,404.72712,466.1822Z" transform="translate(-208.9778 -99.05999)" fill="#e6e6e6"/><path d="M434.99539,583.55569l-65.21246,16.817a3.847,3.847,0,0,1-4.68062-2.76145l-14.96946-58.04817a3.847,3.847,0,0,1,2.76145-4.68062l65.21247-16.817a3.847,3.847,0,0,1,4.68061,2.76146l14.96947,58.04816A3.847,3.847,0,0,1,434.99539,583.55569Z" transform="translate(-208.9778 -99.05999)" fill="#e6e6e6"/><path d="M863.63647,209.0517H487.31811a48.17928,48.17928,0,0,0-48.125,48.12512V699.05261a48.17924,48.17924,0,0,0,48.125,48.12507H863.63647a48.17924,48.17924,0,0,0,48.125-48.12507V257.17682A48.17928,48.17928,0,0,0,863.63647,209.0517Z" transform="translate(-208.9778 -99.05999)" fill="#e6e6e6"/><path d="M863.637,222.90589H487.31811a34.30948,34.30948,0,0,0-34.271,34.27093V699.05261a34.30947,34.30947,0,0,0,34.271,34.27088H863.637a34.30936,34.30936,0,0,0,34.27051-34.27088V257.17682A34.30937,34.30937,0,0,0,863.637,222.90589Z" transform="translate(-208.9778 -99.05999)" fill="#fff"/><circle cx="694.19401" cy="614.02963" r="87.85039" fill="#0ea5e9"/><path d="M945.18722,701.63087H914.63056V671.07421a11.45875,11.45875,0,0,0-22.9175,0v30.55666H861.1564a11.45875,11.45875,0,0,0,0,22.9175h30.55666V755.105a11.45875,11.45875,0,1,0,22.9175,0V724.54837h30.55666a11.45875,11.45875,0,0,0,0-22.9175Z" transform="translate(-208.9778 -99.05999)" fill="#fff"/><path d="M807.00068,465.71551H616.699a8.01412,8.01412,0,1,1,0-16.02823H807.00068a8.01412,8.01412,0,0,1,0,16.02823Z" transform="translate(-208.9778 -99.05999)" fill="#e6e6e6"/><path d="M840.05889,492.76314H616.699a8.01412,8.01412,0,1,1,0-16.02823H840.05889a8.01411,8.01411,0,1,1,0,16.02823Z" transform="translate(-208.9778 -99.05999)" fill="#e6e6e6"/><path d="M807.00068,586.929H616.699a8.01412,8.01412,0,1,1,0-16.02823H807.00068a8.01411,8.01411,0,0,1,0,16.02823Z" transform="translate(-208.9778 -99.05999)" fill="#e6e6e6"/><path d="M840.05889,613.97661H616.699a8.01412,8.01412,0,1,1,0-16.02823H840.05889a8.01412,8.01412,0,1,1,0,16.02823Z" transform="translate(-208.9778 -99.05999)" fill="#e6e6e6"/><path d="M574.07028,505.04162H506.72434a3.847,3.847,0,0,1-3.84278-3.84278V441.25158a3.847,3.847,0,0,1,3.84278-3.84278h67.34594a3.847,3.847,0,0,1,3.84278,3.84278v59.94726A3.847,3.847,0,0,1,574.07028,505.04162Z" transform="translate(-208.9778 -99.05999)" fill="#e6e6e6"/><path d="M574.07028,626.25509H506.72434a3.847,3.847,0,0,1-3.84278-3.84278V562.46505a3.847,3.847,0,0,1,3.84278-3.84278h67.34594a3.847,3.847,0,0,1,3.84278,3.84278v59.94726A3.847,3.847,0,0,1,574.07028,626.25509Z" transform="translate(-208.9778 -99.05999)" fill="#e6e6e6"/><path d="M807.21185,330.781H666.91017a8.01411,8.01411,0,0,1,0-16.02823H807.21185a8.01411,8.01411,0,0,1,0,16.02823Z" transform="translate(-208.9778 -99.05999)" fill="#ccc"/><path d="M840.27007,357.82862H666.91017a8.01411,8.01411,0,1,1,0-16.02822h173.3599a8.01411,8.01411,0,0,1,0,16.02822Z" transform="translate(-208.9778 -99.05999)" fill="#ccc"/><path d="M635.85911,390.6071H506.51316a3.847,3.847,0,0,1-3.84277-3.84277V285.81706a3.847,3.847,0,0,1,3.84277-3.84277H635.85911a3.847,3.847,0,0,1,3.84277,3.84277V386.76433A3.847,3.847,0,0,1,635.85911,390.6071Z" transform="translate(-208.9778 -99.05999)" fill="#0ea5e9"/></svg>
                                    </button>
                                    <div>
                                        <p>{{ CurrentExcelFileSantander.name != '' ? Format.TruncateText(CurrentExcelFileSantander.name, 18) : 'Cargar archivo Santander' }}</p>
                                        <div v-if="Workbook.SheetNames.length > 0" class="flex">
                                            <li v-for="Spreadsheet in Workbook.SheetNames" class="flex cursor-pointer items-center font-sans text-sm font-normal leading-normal text-blue-gray-900 antialiased transition-colors duration-300 hover:text-pink-500">
                                                <a class="opacity-60" href="#">
                                                <span>{{ Format.TruncateText(Spreadsheet.FileName) }}</span>
                                                </a>
                                                <span class="pointer-events-none mx-2 select-none font-sans text-sm font-normal leading-normal text-blue-gray-500 antialiased">
                                                    
                                                </span>
                                            </li>
                                        </div>
                                        <h2 class="hidden text-4xl font-bold text-gray-600">50.365</h2>
                                        <p :title="CurrentExcelFileSantander.name">{{ Format.TruncateText(CurrentExcelFileSantander.activeSheet.name, 18) }}</p>
                                    </div>
                                </div>
                            </div>

                            <!-- Caja Blanca -->
                            <div class="bg-white p-4 rounded-lg xs:mb-4 max-w-full shadow-md lg:w-[65%]">
                                <!-- Cajas pequeñas -->
                                <div class="flex flex-wrap justify-between h-full">
                                    <!-- Caja pequeña 1 -->
                                    <div
                                        class="flex-1 bg-gradient-to-r from-cyan-400 to-cyan-500 rounded-lg flex flex-col items-center justify-center p-4 space-y-2 border border-gray-200 m-2">
                                        <p class="text-white">Abonos <span v-if="CurrentExcelFileBanamex.activeSheet.data.resume?.AbonoTotalString" class="font-bold"> {{ CurrentExcelFileBanamex.activeSheet.data.resume.AbonoTotalString ?? '' }} </span></p>
                                    </div>

                                    <!-- Caja pequeña 2 -->
                                    <div
                                        class="flex-1 bg-gradient-to-r from-cyan-400 to-cyan-600 rounded-lg flex flex-col items-center justify-center p-4 space-y-2 border border-gray-200 m-2">
                                        <p class="text-white">Cargos <span v-if="CurrentExcelFileBanamex.activeSheet.data.resume?.CargoTotalString" class="font-bold"> {{ CurrentExcelFileBanamex.activeSheet.data.resume.CargoTotalString ?? '' }} </span></p>
                                    </div>

                                    <!-- Caja pequeña 3 -->
                                    <div
                                        class="flex-1 bg-gradient-to-r from-cyan-400 to-cyan-600 rounded-lg flex flex-col items-center justify-center p-4 space-y-2 border border-gray-200 m-2">
                                        <p class="text-white">Saldo <span v-if="CurrentExcelFileBanamex.activeSheet.data.resume?.SaldoTotalString" class="font-bold"> {{ CurrentExcelFileBanamex.activeSheet.data.resume.SaldoTotalString ?? '' }} </span></p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <section class="flex space-x-4 mt-4">
                            <!-- ChartJS -->
                            <div class="bg-white md:w-1/2 overflow-hidden shadow-xl sm:rounded-lg px-4 py-8">
                                <div class="flex justify-center">
                                    <div>
                                        <Doughnut :data="ResumeChartDataBanamex" :options="options" />
                                    </div>
                                    <!-- <NavigationButton @click="exportFile" class="hidden ml-24 max-w-20 w-14 flex justify-centner border-[#45B058]">
                                        <svg width="32px" height="32px" viewBox="-4 0 64 64" xmlns="http://www.w3.org/2000/svg" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M5.112.006c-2.802 0-5.073 2.273-5.073 5.074v53.841c0 2.803 2.271 5.074 5.073 5.074h45.774c2.801 0 5.074-2.271 5.074-5.074v-38.605l-18.902-20.31h-31.946z" fill-rule="evenodd" clip-rule="evenodd" fill="#45B058"></path><path d="M19.429 53.938c-.216 0-.415-.09-.54-.27l-3.728-4.97-3.745 4.97c-.126.18-.324.27-.54.27-.396 0-.72-.306-.72-.72 0-.144.035-.306.144-.432l3.89-5.131-3.619-4.826c-.09-.126-.145-.27-.145-.414 0-.342.288-.72.721-.72.216 0 .432.108.576.288l3.438 4.628 3.438-4.646c.127-.18.324-.27.541-.27.378 0 .738.306.738.72 0 .144-.036.288-.127.414l-3.619 4.808 3.891 5.149c.09.126.125.27.125.414 0 .396-.324.738-.719.738zm9.989-.126h-5.455c-.595 0-1.081-.486-1.081-1.08v-10.317c0-.396.324-.72.774-.72.396 0 .721.324.721.72v10.065h5.041c.359 0 .648.288.648.648 0 .396-.289.684-.648.684zm6.982.216c-1.782 0-3.188-.594-4.213-1.495-.162-.144-.234-.342-.234-.54 0-.36.27-.756.702-.756.144 0 .306.036.433.144.828.738 1.98 1.314 3.367 1.314 2.143 0 2.826-1.152 2.826-2.071 0-3.097-7.111-1.386-7.111-5.672 0-1.98 1.764-3.331 4.123-3.331 1.548 0 2.881.468 3.853 1.278.162.144.253.342.253.54 0 .36-.307.72-.703.72-.145 0-.307-.054-.432-.162-.883-.72-1.98-1.044-3.079-1.044-1.44 0-2.467.774-2.467 1.909 0 2.701 7.112 1.152 7.112 5.636 0 1.748-1.188 3.53-4.43 3.53z" fill="#ffffff"></path><path d="M55.953 20.352v1h-12.801s-6.312-1.26-6.127-6.707c0 0 .207 5.707 6.002 5.707h12.926z" fill-rule="evenodd" clip-rule="evenodd" fill="#349C42"></path><path d="M37.049 0v14.561c0 1.656 1.104 5.791 6.104 5.791h12.801l-18.905-20.352z" opacity=".5" fill-rule="evenodd" clip-rule="evenodd" fill="#ffffff"></path></g></svg>
                                    </NavigationButton> -->
                                </div>
                                <table id="excelTable" border="1"></table>
                            </div>
                            <!-- ChartJS -->
                            <!-- Movimientos por Concepto -->
                            <div class="md:w-1/2 max-h-96 overflow-y-auto bg-white border border-gray-100 shadow-md shadow-black/5 p-6 rounded-md">
                                <div class="flex justify-between mb-0 items-start">
                                    <div class="font-medium">Movimientos</div>
                                    <div class="flex items-center space-x-2">
                                    <NavigationButton v-show="HasFilterSantander" @click.native="ExportGroupedByFilesBanamex" class="ml-24 max-w-20 w-14 flex justify-center">
                                        <p class="font-medium text-sky-500">
                                            Exportar
                                        </p>
                                    </NavigationButton>
                                    <NavigationButton @click.native="GroupByConceptBanamex" class="ml-24 max-w-20 w-14 flex justify-center">
                                        <p class="font-medium text-sky-500">
                                            Agrupar
                                        </p>
                                    </NavigationButton>
                                    </div>
                                </div>
                                <div class="overflow-x-auto">
                                    <table v-if="CurrentExcelFileBanamex.activeSheet.rows.length > 0" class="w-full min-w-[460px]" id="excelTableBanamex">
                                        <thead>
                                            <tr>
                                                <th class="text-[12px] uppercase tracking-wide font-medium text-gray-400 py-2 px-4 bg-gray-50 text-left rounded-tl-md rounded-bl-md">Concepto</th>
                                                <th class="text-[12px] uppercase tracking-wide font-medium text-gray-400 py-2 px-4 bg-gray-50 text-left">Abono</th>
                                                <th class="text-[12px] uppercase tracking-wide font-medium text-gray-400 py-2 px-4 bg-gray-50 text-left rounded-tr-md rounded-br-md">Cargo</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr v-if="HasFilterBanamex" v-for="(row, idx) in CurrentExcelFileBanamex.activeSheet.groupedRows" :key="idx">
                                                <td class="py-2 px-4 border-b border-b-gray-50">
                                                    <div class="flex items-center">
                                                        <a href="#" class="text-gray-600 text-sm font-medium hover:text-blue-500 ml-2 truncate">{{ (row.Concepto) }}</a>
                                                    </div>
                                                </td>
                                                <td class="py-2 px-4 border-b border-b-gray-50">
                                                    <span class="text-[13px] font-medium text-emerald-500">{{ Format.Currency(row.Abono) }}</span>
                                                </td>
                                                <td class="py-2 px-4 border-b border-b-gray-50">
                                                    <span class="inline-block p-1 rounded bg-rose-500/10 text-rose-500 font-medium text-[12px] leading-none">- {{ Format.Currency(row.Cargo) }}</span>
                                                </td>
                                            </tr>
                                            <tr v-else v-for="(row, index) in CurrentExcelFileBanamex.activeSheet.rows" :key="index">
                                                <td class="py-2 px-4 border-b border-b-gray-50">
                                                    <div class="flex items-center">
                                                        <img src="https://placehold.co/32x32" alt="" class="w-8 h-8 rounded object-cover block">
                                                        <a href="#" class="text-gray-600 text-sm font-medium hover:text-blue-500 ml-2 truncate">{{ (row[1]) }}</a>
                                                    </div>
                                                </td>
                                                <td class="py-2 px-4 border-b border-b-gray-50">
                                                    <span class="text-[13px] font-medium text-emerald-500">{{ Format.Currency(row[4]) }}</span>
                                                </td>
                                                <td class="py-2 px-4 border-b border-b-gray-50">
                                                    <span class="inline-block p-1 rounded bg-rose-500/10 text-rose-500 font-medium text-[12px] leading-none">- {{ Format.Currency(row[5]) }}</span>
                                                </td>
                                            </tr>
                                            </tbody>
                                    </table>
                                </div>
                            </div>
                            <!-- /Movimientos por Concepto -->
                        </section>
                    </section>
                </div>
            </div>
        </div>

    </AppLayout>
</template>

<style>
    table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 20px;
    }
    th, td {
        border: 1px solid black;
        padding: 8px;
        text-align: left;
    }
    td {
        cursor: pointer;
    }
    td:focus {
        outline: none;
        background-color: #f0f8ff;
    }
</style>