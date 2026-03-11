import ExcelJS from 'exceljs';

async function main() {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Leads');
  ws.addRow(['Firmenname', 'Kontakt', 'Email', 'Telefon', 'Stadt']);
  ws.addRow(['Test GmbH', 'Max Müller', 'max@test.de', '0171-1234567', 'Hamburg']);
  ws.addRow(['Muster AG', 'Anna Schmidt', 'anna@muster.de', '0172-7654321', 'Berlin']);
  ws.addRow(['Digital Solutions', 'Peter Weber', 'peter@digital.de', '0173-9876543', 'München']);
  await wb.xlsx.writeFile('/tmp/test-leads.xlsx');
  console.log('Test Excel created at /tmp/test-leads.xlsx');
}

main();
