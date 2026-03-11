import ExcelJS from 'exceljs';

async function main() {
  const workbook = new ExcelJS.Workbook();
  try {
    await workbook.xlsx.readFile('uploads/c6ca585bf5fc3dbd7df5d693b507c1d5');
    console.log('Worksheets:', workbook.worksheets.map(w => w.name));

    const ws = workbook.worksheets[0];
    if (!ws) { console.log('No worksheet found!'); return; }

    console.log('Row count:', ws.rowCount);
    console.log('');

    const headers: string[] = [];
    const rows: string[][] = [];

    ws.eachRow((row, rowNumber) => {
      const values = row.values as (string | number | null)[];
      const cells = values.slice(1).map(v => v?.toString() || '');

      if (rowNumber === 1) {
        headers.push(...cells);
        console.log('Headers:', cells);
      } else {
        rows.push(cells);
        if (rowNumber <= 4) console.log(`Row ${rowNumber}:`, cells);
      }
    });

    console.log('');
    console.log('Total data rows:', rows.length);
  } catch (err) {
    console.error('PARSE ERROR:', err);
  }
}

main();
