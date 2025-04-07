import Format from '@/Utils/Format.js';

const AccountStatementsHeaders = ({
    XLS: {
        Banemex: {
            headers: ["Fecha", "Descripcion", "Depositos", "Retiros", "Saldo"],
            rows: []
        },
    }
});

/**
 * Funcion para manejar la hoja de excel
 * @param {Array} ExcelSheet
 * @returns {Object}
 * @property {Number} CargoTotal
 * @property {Number} AbonoTotal
 * @property {Number} SaldoTotal
 * @property {String} SaldoTotalString
 * @property {String} AbonoTotalString
 * @property {String} CargoTotalString
*/
const HandleExcelSheet = (ExcelSheet) => {
    // Objeto para almacenar los totales
    const Resume = {
        CargoTotal: 0,
        AbonoTotal: 0,
        SaldoTotal: 0,
        SaldoTotalString: '',
        AbonoTotalString: '',
        CargoTotalString: ''
    };
    // Filas donde esta la informacion
    const Rows = {
        Cargo: 3,
        Abono: 2
    };
    // Saltar hasta la fila 16
    ExcelSheet = ExcelSheet.slice(16);
    // Preparar el aoa para calcular los totales
    const _sheet = ExcelSheet.map(row => {
        return row.map(cell => {
            return cell ? cell.toString().replace(/,/g, '') : cell;
        });
    });
    // Remover la primera fila (encabezados)
    _sheet.shift();
    // Sumamos los cargos y abonos
    _sheet.forEach((row, index) => {
        if (index > 0) {
            Resume.CargoTotal += row[Rows.Cargo] ? parseFloat(row[Rows.Cargo]) : 0;
            Resume.AbonoTotal += row[Rows.Abono] ? parseFloat(row[Rows.Abono]) : 0;
        }
    });
    
    // Redondear a dos decimales
    Resume.CargoTotal = Format.Round(Resume.CargoTotal);
    Resume.AbonoTotal = Format.Round(Resume.AbonoTotal);
    Resume.SaldoTotal = Format.Round(Resume.SaldoTotal);
    // Calcular el saldo total
    Resume.SaldoTotal = Format.Round(Resume.AbonoTotal - Resume.CargoTotal);
    // Formatear a moneda
    Resume.CargoTotalString = Format.Currency(Resume.CargoTotal);
    Resume.AbonoTotalString = Format.Currency(Resume.AbonoTotal);
    Resume.SaldoTotalString = Format.Currency(Resume.SaldoTotal);
    return Resume;
}

export default {
    HandleExcelSheet
}