import Format from '@/Utils/Format.js';

const HandleExcelSheet = (ExcelSheet) => {
    const Resume = {
        CargoTotal: 0,
        AbonoTotal: 0,
        SaldoTotal: 0,
        SaldoTotalString: '',
        AbonoTotalString: '',
        CargoTotalString: ''
    };
    // Remover la primera fila (encabezados)
    ExcelSheet.shift();
    ExcelSheet.shift();
    // Preparar el aoa para calcular los totales
    const _sheet = ExcelSheet.map(row => {
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