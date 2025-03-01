<script setup>
import AppLayout from '@/Layouts/AppLayout.vue';
import NavigationButton from '@/Shared/NavigationButton.vue';
import Format from '@/Utils/Format.js';
// XLSX
import { read, utils, writeFileXLSX } from 'xlsx';
import { ref, onMounted, reactive } from "vue";
// ChartJS
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Doughnut } from 'vue-chartjs'
ChartJS.register(ArcElement, Tooltip, Legend)

const CurrentExcelFile = ref({
    name: '',
    activeSheet: {
        name: '',
        rows: [],
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
const props = defineProps({
    products: Object,
    params: Object | Array
});

/* the component state is an array of objects */
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
const GetExcelResumeFromJson = (sheet) => {
    const Resume = {
        CargoTotal: 0,
        AbonoTotal: 0,
        SaldoTotal: 0,
        SaldoTotalString: '',
        AbonoTotalString: '',
        CargoTotalString: ''
    };
    // Remover la primera fila (encabezados)
    sheet.shift();
    sheet.shift();
    // Preparar el aoa para calcular los totales
    const _sheet = sheet.map(row => {
        return row.map(cell => {
            return cell ? cell.toString().replace(/,/g, '') : cell;
        });
    });
    _sheet.forEach((row, index) => {
        if (index > 0) {
            Resume.CargoTotal += row[4] ? parseFloat(row[4]) : 0;
            Resume.AbonoTotal += row[5] ? parseFloat(row[5]) : 0;
            Resume.SaldoTotal = row[6] ? parseFloat(row[6]) : 0;
        }
    });
    
    // Redondear a dos decimales
    Resume.CargoTotal = Resume.CargoTotal.toFixed(2);
    Resume.AbonoTotal = Resume.AbonoTotal.toFixed(2);
    Resume.SaldoTotal = Resume.SaldoTotal.toFixed(2);
    // Formatear a moneda
    Resume.CargoTotalString = Format.Currency(Resume.CargoTotal);
    Resume.AbonoTotalString = Format.Currency(Resume.AbonoTotal);
    Resume.SaldoTotalString = Format.Currency(Resume.SaldoTotal);
    return Resume;
}
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

        CurrentExcelFile.value.name = file.name;
        CurrentExcelFile.value.activeSheet.name = sheetName;
        CurrentExcelFile.value.activeSheet.rows = sheetData;

        const resume = GetExcelResumeFromJson(sheetData);
        
        CurrentExcelFile.value.activeSheet.data = {
            rows: sheetData,
            resume: resume,
        };

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

        console.log(CurrentExcelFile.value.activeSheet.data);
        
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
</script>

<template>
    <AppLayout title="Estados de Cuenta">
        <template #header>
            <h2 class="font-semibold text-xl text-gray-800 leading-tight">
                Estado de Cuenta
            </h2>
        </template>

        <div class="py-12">
            <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
                <!-- Contenedor Principal -->
                <div class="lg:flex gap-4 items-stretch">
                    <!-- Caja Grande -->
                    <div class="bg-white md:p-2 p-4 rounded-lg border border-gray-200 mb-4 lg:mb-0 shadow-md lg:w-[35%]">
                        <div class="flex items-center space-x-5 h-full">
                            <div>
                                <input ref="excelData" type="file" class="hidden" @change="handleExcelFileChange" />
                            </div>
                            <button @click="excelData.click()" class="border-2 border-gray-200 hover:border-sky-500 rounded-lg hover:bg-gray-50 hover:shadow-md active:border-gray-50 transition-all duration-150 p-3">
                                <svg xmlns="http://www.w3.org/2000/svg" width="64px" height="64px" viewBox="0 0 782.04441 701.88002" xmlns:xlink="http://www.w3.org/1999/xlink" role="img" artist="Katerina Limpitsouni" source="https://undraw.co/"><path d="M609.48783,100.59015l-25.44631,6.56209L270.53735,187.9987,245.091,194.56079A48.17927,48.17927,0,0,0,210.508,253.17865L320.849,681.05606a48.17924,48.17924,0,0,0,58.61776,34.58317l.06572-.01695,364.26536-93.93675.06572-.01695a48.17923,48.17923,0,0,0,34.58309-58.6178l-110.341-427.87741A48.17928,48.17928,0,0,0,609.48783,100.59015Z" transform="translate(-208.9778 -99.05999)" fill="#f2f2f2"/><path d="M612.94784,114.00532l-30.13945,7.77236L278.68955,200.20385l-30.139,7.77223a34.30949,34.30949,0,0,0-24.6275,41.74308l110.341,427.87741a34.30946,34.30946,0,0,0,41.7431,24.62736l.06572-.01695,364.26536-93.93674.06619-.01707a34.30935,34.30935,0,0,0,24.627-41.7429l-110.341-427.87741A34.30938,34.30938,0,0,0,612.94784,114.00532Z" transform="translate(-208.9778 -99.05999)" fill="#fff"/><path d="M590.19,252.56327,405.917,300.08359a8.01411,8.01411,0,0,1-4.00241-15.52046l184.273-47.52033A8.01412,8.01412,0,0,1,590.19,252.56327Z" transform="translate(-208.9778 -99.05999)" fill="#f2f2f2"/><path d="M628.955,270.49906,412.671,326.27437a8.01411,8.01411,0,1,1-4.00241-15.52046l216.284-55.77531a8.01411,8.01411,0,0,1,4.00242,15.52046Z" transform="translate(-208.9778 -99.05999)" fill="#f2f2f2"/><path d="M620.45825,369.93676l-184.273,47.52032a8.01411,8.01411,0,1,1-4.00242-15.52046l184.273-47.52032a8.01411,8.01411,0,1,1,4.00241,15.52046Z" transform="translate(-208.9778 -99.05999)" fill="#f2f2f2"/><path d="M659.22329,387.87255l-216.284,55.77531a8.01411,8.01411,0,1,1-4.00242-15.52046l216.284-55.77531a8.01411,8.01411,0,0,1,4.00242,15.52046Z" transform="translate(-208.9778 -99.05999)" fill="#f2f2f2"/><path d="M650.72653,487.31025l-184.273,47.52033a8.01412,8.01412,0,0,1-4.00242-15.52047l184.273-47.52032a8.01411,8.01411,0,0,1,4.00242,15.52046Z" transform="translate(-208.9778 -99.05999)" fill="#f2f2f2"/><path d="M689.49156,505.246l-216.284,55.77532a8.01412,8.01412,0,1,1-4.00241-15.52047l216.284-55.77531a8.01411,8.01411,0,0,1,4.00242,15.52046Z" transform="translate(-208.9778 -99.05999)" fill="#f2f2f2"/><path d="M374.45884,348.80871l-65.21246,16.817a3.847,3.847,0,0,1-4.68062-2.76146L289.5963,304.81607a3.847,3.847,0,0,1,2.76145-4.68061l65.21247-16.817a3.847,3.847,0,0,1,4.68061,2.76145l14.96947,58.04817A3.847,3.847,0,0,1,374.45884,348.80871Z" transform="translate(-208.9778 -99.05999)" fill="#e6e6e6"/><path d="M404.72712,466.1822l-65.21247,16.817a3.847,3.847,0,0,1-4.68062-2.76146l-14.96946-58.04816A3.847,3.847,0,0,1,322.626,417.509l65.21246-16.817a3.847,3.847,0,0,1,4.68062,2.76145l14.96946,58.04817A3.847,3.847,0,0,1,404.72712,466.1822Z" transform="translate(-208.9778 -99.05999)" fill="#e6e6e6"/><path d="M434.99539,583.55569l-65.21246,16.817a3.847,3.847,0,0,1-4.68062-2.76145l-14.96946-58.04817a3.847,3.847,0,0,1,2.76145-4.68062l65.21247-16.817a3.847,3.847,0,0,1,4.68061,2.76146l14.96947,58.04816A3.847,3.847,0,0,1,434.99539,583.55569Z" transform="translate(-208.9778 -99.05999)" fill="#e6e6e6"/><path d="M863.63647,209.0517H487.31811a48.17928,48.17928,0,0,0-48.125,48.12512V699.05261a48.17924,48.17924,0,0,0,48.125,48.12507H863.63647a48.17924,48.17924,0,0,0,48.125-48.12507V257.17682A48.17928,48.17928,0,0,0,863.63647,209.0517Z" transform="translate(-208.9778 -99.05999)" fill="#e6e6e6"/><path d="M863.637,222.90589H487.31811a34.30948,34.30948,0,0,0-34.271,34.27093V699.05261a34.30947,34.30947,0,0,0,34.271,34.27088H863.637a34.30936,34.30936,0,0,0,34.27051-34.27088V257.17682A34.30937,34.30937,0,0,0,863.637,222.90589Z" transform="translate(-208.9778 -99.05999)" fill="#fff"/><circle cx="694.19401" cy="614.02963" r="87.85039" fill="#0ea5e9"/><path d="M945.18722,701.63087H914.63056V671.07421a11.45875,11.45875,0,0,0-22.9175,0v30.55666H861.1564a11.45875,11.45875,0,0,0,0,22.9175h30.55666V755.105a11.45875,11.45875,0,1,0,22.9175,0V724.54837h30.55666a11.45875,11.45875,0,0,0,0-22.9175Z" transform="translate(-208.9778 -99.05999)" fill="#fff"/><path d="M807.00068,465.71551H616.699a8.01412,8.01412,0,1,1,0-16.02823H807.00068a8.01412,8.01412,0,0,1,0,16.02823Z" transform="translate(-208.9778 -99.05999)" fill="#e6e6e6"/><path d="M840.05889,492.76314H616.699a8.01412,8.01412,0,1,1,0-16.02823H840.05889a8.01411,8.01411,0,1,1,0,16.02823Z" transform="translate(-208.9778 -99.05999)" fill="#e6e6e6"/><path d="M807.00068,586.929H616.699a8.01412,8.01412,0,1,1,0-16.02823H807.00068a8.01411,8.01411,0,0,1,0,16.02823Z" transform="translate(-208.9778 -99.05999)" fill="#e6e6e6"/><path d="M840.05889,613.97661H616.699a8.01412,8.01412,0,1,1,0-16.02823H840.05889a8.01412,8.01412,0,1,1,0,16.02823Z" transform="translate(-208.9778 -99.05999)" fill="#e6e6e6"/><path d="M574.07028,505.04162H506.72434a3.847,3.847,0,0,1-3.84278-3.84278V441.25158a3.847,3.847,0,0,1,3.84278-3.84278h67.34594a3.847,3.847,0,0,1,3.84278,3.84278v59.94726A3.847,3.847,0,0,1,574.07028,505.04162Z" transform="translate(-208.9778 -99.05999)" fill="#e6e6e6"/><path d="M574.07028,626.25509H506.72434a3.847,3.847,0,0,1-3.84278-3.84278V562.46505a3.847,3.847,0,0,1,3.84278-3.84278h67.34594a3.847,3.847,0,0,1,3.84278,3.84278v59.94726A3.847,3.847,0,0,1,574.07028,626.25509Z" transform="translate(-208.9778 -99.05999)" fill="#e6e6e6"/><path d="M807.21185,330.781H666.91017a8.01411,8.01411,0,0,1,0-16.02823H807.21185a8.01411,8.01411,0,0,1,0,16.02823Z" transform="translate(-208.9778 -99.05999)" fill="#ccc"/><path d="M840.27007,357.82862H666.91017a8.01411,8.01411,0,1,1,0-16.02822h173.3599a8.01411,8.01411,0,0,1,0,16.02822Z" transform="translate(-208.9778 -99.05999)" fill="#ccc"/><path d="M635.85911,390.6071H506.51316a3.847,3.847,0,0,1-3.84277-3.84277V285.81706a3.847,3.847,0,0,1,3.84277-3.84277H635.85911a3.847,3.847,0,0,1,3.84277,3.84277V386.76433A3.847,3.847,0,0,1,635.85911,390.6071Z" transform="translate(-208.9778 -99.05999)" fill="#0ea5e9"/></svg>
                            </button>
                            <div>
                                <p>{{ CurrentExcelFile.name != '' ? Format.TruncateText(CurrentExcelFile.name, 18) : 'Cargar archivo' }}</p>
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
                            <div class="dropdown">
                                <button type="button" class="dropdown-toggle text-gray-400 hover:text-gray-600"><i class="ri-more-fill"></i></button>
                                <ul class="dropdown-menu shadow-md shadow-black/5 z-30 py-1.5 rounded-md bg-white border border-gray-100 w-full max-w-[140px] hidden" data-popper-id="popper-10" style="position: absolute; inset: 0px 0px auto auto; margin: 0px; transform: translate3d(-48.8px, 688.8px, 0px);" data-popper-placement="bottom-end">
                                    <li>
                                        <a href="#" class="flex items-center text-[13px] py-1.5 px-4 text-gray-600 hover:text-blue-500 hover:bg-gray-50">Profile</a>
                                    </li>
                                    <li>
                                        <a href="#" class="flex items-center text-[13px] py-1.5 px-4 text-gray-600 hover:text-blue-500 hover:bg-gray-50">Settings</a>
                                    </li>
                                    <li>
                                        <a href="#" class="flex items-center text-[13px] py-1.5 px-4 text-gray-600 hover:text-blue-500 hover:bg-gray-50">Logout</a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div class="overflow-x-auto">
                            <table v-if="CurrentExcelFile.activeSheet.rows.length > 0" class="w-full min-w-[460px]">
                                <thead>
                                    <tr>
                                        <th class="text-[12px] uppercase tracking-wide font-medium text-gray-400 py-2 px-4 bg-gray-50 text-left rounded-tl-md rounded-bl-md">Concepto</th>
                                        <th class="text-[12px] uppercase tracking-wide font-medium text-gray-400 py-2 px-4 bg-gray-50 text-left">Abono</th>
                                        <th class="text-[12px] uppercase tracking-wide font-medium text-gray-400 py-2 px-4 bg-gray-50 text-left rounded-tr-md rounded-br-md">Cargo</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="(row, index) in CurrentExcelFile.activeSheet.rows" :key="index">
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
                                    <tr class="hidden">
                                        <td class="py-2 px-4 border-b border-b-gray-50">
                                            <div class="flex items-center">
                                                <img src="https://placehold.co/32x32" alt="" class="w-8 h-8 rounded object-cover block">
                                                <a href="#" class="text-gray-600 text-sm font-medium hover:text-blue-500 ml-2 truncate">Create landing page</a>
                                            </div>
                                        </td>
                                        <td class="py-2 px-4 border-b border-b-gray-50">
                                            <span class="text-[13px] font-medium text-rose-500">-$235</span>
                                        </td>
                                        <td class="py-2 px-4 border-b border-b-gray-50">
                                            <span class="inline-block p-1 rounded bg-rose-500/10 text-rose-500 font-medium text-[12px] leading-none">Withdrawn</span>
                                        </td>
                                    </tr>
                                    </tbody>
                            </table>
                        </div>
                    </div>
                    <!-- /Movimientos por Concepto -->
                </section>

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