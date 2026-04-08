import { useContext, useMemo } from 'react';
import { AppContext } from '../../context/AppContext';
import { Card, Button } from '../../components/ui';

const downloadCsv = (fileName, rows) => {
  if (!rows.length) {
    return;
  }

  const headers = Object.keys(rows[0]);
  const csvLines = [headers.join(',')];

  rows.forEach((row) => {
    const line = headers
      .map((key) => {
        const value = row[key] ?? '';
        return `"${String(value).replace(/"/g, '""')}"`;
      })
      .join(',');
    csvLines.push(line);
  });

  const blob = new Blob([csvLines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const printAsPdf = (title, rows) => {
  const win = window.open('', '_blank');
  if (!win) {
    return;
  }

  const headers = rows.length ? Object.keys(rows[0]) : [];
  const table = rows.length
    ? `<table border="1" cellspacing="0" cellpadding="6" style="border-collapse: collapse; width: 100%;"><thead><tr>${headers
        .map((header) => `<th>${header}</th>`)
        .join('')}</tr></thead><tbody>${rows
        .map((row) => `<tr>${headers.map((header) => `<td>${row[header] ?? ''}</td>`).join('')}</tr>`)
        .join('')}</tbody></table>`
    : '<p>No data</p>';

  win.document.write(`<html><head><title>${title}</title></head><body><h1>${title}</h1>${table}</body></html>`);
  win.document.close();
  win.focus();
  win.print();
};

export default function Reports() {
  const { projects, financeRecords, purchaseOrders, attendanceRecords, materialIssues, vendors, inventory } = useContext(AppContext);

  const projectExpenseReport = useMemo(() => {
    return projects.map((project) => {
      const spent = financeRecords
        .filter((record) => record.projectId === project.id)
        .reduce((sum, record) => sum + Number(record.amount), 0);

      return {
        project: project.project_name,
        budget: project.budget,
        total_expense: spent,
        variance: project.budget - spent,
      };
    });
  }, [financeRecords, projects]);

  const vendorSpendingReport = useMemo(() => {
    return vendors.map((vendor) => {
      const related = purchaseOrders.filter((order) => order.vendorId === vendor.id);
      const total = related.reduce((sum, order) => sum + Number(order.quantity) * Number(order.unit_price), 0);
      return {
        vendor: vendor.vendor_name,
        orders: related.length,
        total_spending: total,
      };
    });
  }, [purchaseOrders, vendors]);

  const laborCostReport = useMemo(() => {
    const grouped = {};
    attendanceRecords.forEach((entry) => {
      grouped[entry.workerId] = (grouped[entry.workerId] || 0) + Number(entry.labor_cost || 0);
    });

    return Object.keys(grouped).map((workerId) => ({
      workerId,
      total_labor_cost: grouped[workerId],
    }));
  }, [attendanceRecords]);

  const materialUsageReport = useMemo(() => {
    const grouped = {};
    materialIssues.forEach((entry) => {
      grouped[entry.itemId] = (grouped[entry.itemId] || 0) + Number(entry.quantity);
    });

    return Object.keys(grouped).map((itemId) => ({
      item: inventory.find((entry) => entry.id === itemId)?.item_name || itemId,
      total_quantity_issued: grouped[itemId],
    }));
  }, [inventory, materialIssues]);

  const reportCards = [
    { title: 'Project Expense Report', rows: projectExpenseReport, key: 'project-expense' },
    { title: 'Vendor Spending Report', rows: vendorSpendingReport, key: 'vendor-spending' },
    { title: 'Labor Cost Report', rows: laborCostReport, key: 'labor-cost' },
    { title: 'Material Usage Report', rows: materialUsageReport, key: 'material-usage' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-50">Reports Module</h1>
        <p className="text-slate-400 mt-1">Analytics and export features for project, vendor, labor and materials</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {reportCards.map((report) => (
          <Card key={report.key} title={report.title}>
            <div className="space-y-3">
              <p className="text-slate-400 text-sm">Rows: {report.rows.length}</p>
              <div className="flex gap-3">
                <Button onClick={() => downloadCsv(`${report.key}.csv`, report.rows)}>Export Excel (CSV)</Button>
                <Button variant="secondary" onClick={() => printAsPdf(report.title, report.rows)}>Export PDF</Button>
              </div>
              <div className="max-h-64 overflow-auto border border-slate-800 rounded-lg p-3 bg-slate-900/60">
                <pre className="text-xs text-slate-300 whitespace-pre-wrap">{JSON.stringify(report.rows.slice(0, 5), null, 2)}</pre>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
