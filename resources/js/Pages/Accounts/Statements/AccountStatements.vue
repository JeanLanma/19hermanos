<script setup>
import AppLayout from '@/Layouts/AppLayout.vue';
import NavigationButton from '@/Shared/NavigationButton.vue';
import { read, utils, writeFileXLSX } from 'xlsx';
import { ref, onMounted } from "vue";
// ChartJS
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Doughnut } from 'vue-chartjs'
ChartJS.register(ArcElement, Tooltip, Legend)

const CurrentSheet = ref(null);
/* the component state is an array of objects */
const props = defineProps({
    products: Object,
    params: Object | Array
});

/* the component state is an array of objects */
const rows = ref([]);
const AccountStatements = ref({
    XLS: {
        BBVA: {
            headers: ["Fecha Operación", "Concepto", "Referencia", "Referencia Ampliada", "Cargo", "Abono", "Saldo"],
            rows: []
        },
    }
});

/* Fetch and update the state once */
//  onMounted(async() => {
//    const f = await fetch("https://docs.sheetjs.com/pres.numbers");
//    const ab = await f.arrayBuffer();
//    /* parse */
//    const wb = read(ab);
//    /* generate array of objects from first worksheet */
//    const ws = wb.Sheets[wb.SheetNames[0]]; // get the first worksheet
//    const data = utils.sheet_to_json(ws); // generate objects
//    /* update state */
//     rows.value = data;
//     console.log(rows.value);
//  });
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
const ParseJsonSheetToTable = (sheet) => {
    const JsonTable = {
        headers: [],
        rows: []
    };
    rows.value = [];
    sheet.forEach((row, index) => {
        if (index === 0) {
            JsonTable.headers = row;
        } else {
            JsonTable.rows.push(row);
        }
    });
    JsonTable.headers = Array.from(new Set(JsonTable.headers));
    rows.value = JsonTable.rows;
    console.log(JsonTable);
    
    return JsonTable;
}
const ParseJsonSheetToBBVATable = (sheet) => {
    //Remove first row
    sheet.shift();
    //Sort by Concepto
    const SortedSheet = sheet.sort((a, b) => a["Concepto"].localeCompare(b["Concepto"]));
    //Get total of Cargo and Abono
    const Total = SortedSheet.reduce((acc, row) => {
        //Ignore NAN and empty values
        if (isNaN(row["Cargo"]) || isNaN(row["Abono"])) {
            return acc;
        }
        acc.Cargo += row["Cargo"];
        acc.Abono += row["Abono"];
        return acc;
    }, { Cargo: 0, Abono: 0 });
    // Group by Similar Concepto
    const GroupedSheet = SortedSheet.reduce((acc, row) => {
        const key = row["Concepto"];
        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(row);
        return acc;
    }, {});

    console.log(Total);
    return SortedSheet;
}
// ================
/**
 * Handle Excel file change
 */
const handleExcelFileChange = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const sheetData = utils.sheet_to_json(sheet, { header: 1 });

        console.log(sheetData);
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

const data = {
  labels: ['VueJs', 'EmberJs', 'ReactJs', 'AngularJs'],
  datasets: [
    {
      backgroundColor: ['#41B883', '#E46651', '#00D8FF', '#DD1B16'],
      data: [40, 20, 80, 10]
    }
  ]
}
const options = {
  responsive: true,
}

const excelTable = ref(null);
</script>

<template>
    <AppLayout title="Estados de Cuenta">
        <template #header>
            <h2 class="font-semibold text-xl text-gray-800 leading-tight">
                Estados de Cuenta
            </h2>
        </template>

        <div class="py-12">
            <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">

                <!-- ChartJS -->
                <div class="bg-white overflow-hidden shadow-xl sm:rounded-lg px-4 py-8">
                    <div class="flex">
                        <div>
                            <!-- Dropdown Zone -->
                            <div class="inline-flex items-center justify-center bg-grey-lighter">
                                <label @click="excelTable.click()" @dragover="excelTable.click()" @dragenter="excelTable.click()" @dragend="excelTable.click()" class="w-64 flex flex-col items-center px-4 py-6 bg-white text-sky-500 rounded-lg shadow-lg tracking-wide uppercase border border-sky-500 cursor-pointer hover:bg-sky-500 hover:text-white">
                                    <svg class="w-8 h-8" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                        <path d="M16.88 9.1A4 4 0 0 1 16 17H5a5 5 0 0 1-1-9.9V7a3 3 0 0 1 4.52-2.59A4.98 4.98 0 0 1 17 8c0 .38-.04.74-.12 1.1zM11 11h3l-4-4-4 4h3v3h2v-3z" />
                                    </svg>
                                    <span class="mt-2 text-base leading-normal">Select a file</span>
                                </label>
                            </div>
                            <!-- /Dropdown Zone -->
                            <input type="file" id="excelTable" ref="excelTable" @change="handleExcelFileChange"/>
                        </div>
                        <NavigationButton @click="exportFile" class="ml-24 max-w-20 w-14 flex justify-center border-[#45B058]">
                            <svg width="32px" height="32px" viewBox="-4 0 64 64" xmlns="http://www.w3.org/2000/svg" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M5.112.006c-2.802 0-5.073 2.273-5.073 5.074v53.841c0 2.803 2.271 5.074 5.073 5.074h45.774c2.801 0 5.074-2.271 5.074-5.074v-38.605l-18.902-20.31h-31.946z" fill-rule="evenodd" clip-rule="evenodd" fill="#45B058"></path><path d="M19.429 53.938c-.216 0-.415-.09-.54-.27l-3.728-4.97-3.745 4.97c-.126.18-.324.27-.54.27-.396 0-.72-.306-.72-.72 0-.144.035-.306.144-.432l3.89-5.131-3.619-4.826c-.09-.126-.145-.27-.145-.414 0-.342.288-.72.721-.72.216 0 .432.108.576.288l3.438 4.628 3.438-4.646c.127-.18.324-.27.541-.27.378 0 .738.306.738.72 0 .144-.036.288-.127.414l-3.619 4.808 3.891 5.149c.09.126.125.27.125.414 0 .396-.324.738-.719.738zm9.989-.126h-5.455c-.595 0-1.081-.486-1.081-1.08v-10.317c0-.396.324-.72.774-.72.396 0 .721.324.721.72v10.065h5.041c.359 0 .648.288.648.648 0 .396-.289.684-.648.684zm6.982.216c-1.782 0-3.188-.594-4.213-1.495-.162-.144-.234-.342-.234-.54 0-.36.27-.756.702-.756.144 0 .306.036.433.144.828.738 1.98 1.314 3.367 1.314 2.143 0 2.826-1.152 2.826-2.071 0-3.097-7.111-1.386-7.111-5.672 0-1.98 1.764-3.331 4.123-3.331 1.548 0 2.881.468 3.853 1.278.162.144.253.342.253.54 0 .36-.307.72-.703.72-.145 0-.307-.054-.432-.162-.883-.72-1.98-1.044-3.079-1.044-1.44 0-2.467.774-2.467 1.909 0 2.701 7.112 1.152 7.112 5.636 0 1.748-1.188 3.53-4.43 3.53z" fill="#ffffff"></path><path d="M55.953 20.352v1h-12.801s-6.312-1.26-6.127-6.707c0 0 .207 5.707 6.002 5.707h12.926z" fill-rule="evenodd" clip-rule="evenodd" fill="#349C42"></path><path d="M37.049 0v14.561c0 1.656 1.104 5.791 6.104 5.791h12.801l-18.905-20.352z" opacity=".5" fill-rule="evenodd" clip-rule="evenodd" fill="#ffffff"></path></g></svg>
                        </NavigationButton>
                    </div>
                    <table id="excelTable" border="1"></table>
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