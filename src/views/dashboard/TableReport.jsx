import React, { useState, useEffect, useMemo } from 'react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { Dropdown } from 'primereact/dropdown';
import { Dialog } from 'primereact/dialog';
import * as XLSX from "xlsx-js-style";
import { saveAs } from "file-saver";
import api from '../../api/axios';

import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';

const API_URL = '/api/task/disposisi/report-table';

const TableReport = () => {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const [showExportDialog, setShowExportDialog] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const months = [
    { label: 'Semua Bulan', value: null },
    { label: 'Januari', value: 1 },
    { label: 'Februari', value: 2 },
    { label: 'Maret', value: 3 },
    { label: 'April', value: 4 },
    { label: 'Mei', value: 5 },
    { label: 'Juni', value: 6 },
    { label: 'Juli', value: 7 },
    { label: 'Agustus', value: 8 },
    { label: 'September', value: 9 },
    { label: 'Oktober', value: 10 },
    { label: 'November', value: 11 },
    { label: 'Desember', value: 12 }
  ];

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const yearList = [];
    for (let i = currentYear - 5; i <= currentYear + 5; i++) {
      yearList.push({ label: i.toString(), value: i });
    }
    return yearList;
  }, []);

  const fetchReportData = async (month = null, year = null) => {
    let url = API_URL;
    const params = new URLSearchParams();

    if (month !== null && month !== undefined) params.append('month', month);
    if (year !== null && year !== undefined) params.append('year', year);

    if (params.toString()) url += `?${params.toString()}`;

    const res = await api.get(url);
    return res.data.data || [];
  };

  const fetchReport = async () => {
    try {
      const allData = await fetchReportData(null, null);
      setData(allData);
    } catch (err) {
      console.error('Error fetch report table:', err);
      setData([]);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const toggleDirektorat = (dirId) => {
    setData(prev =>
      prev.map(d => (d.id === dirId ? { ...d, expanded: !d.expanded } : d))
    );
  };

  const handleExportClick = () => {
    setShowExportDialog(true);
  };

  const handleConfirmExport = async () => {
    try {
      const exportData = await fetchReportData(selectedMonth, selectedYear);
      handleExportExcel(exportData);
      setShowExportDialog(false);
    } catch (err) {
      console.error('Error export:', err);
    }
  };

  const handleExportExcel = (exportData) => {
    const wb = XLSX.utils.book_new();

    let periodText = '';
    if (selectedMonth) {
      const monthName = months.find(m => m.value === selectedMonth)?.label;
      periodText = `Periode: ${monthName} ${selectedYear}`;
    } else if (selectedYear) {
      periodText = `Periode: Tahun ${selectedYear}`;
    } else {
      periodText = 'Periode: Semua Data';
    }

    const wsData = [
      ["LAPORAN KEGIATAN"],
      [periodText],
      [],
      ["No", "Direktorat / Divisi", "Total Kegiatan", "Mengikuti", "", "Belum Mengikuti"],
      ["", "", "", "Sudah Melaporkan", "Belum Melaporkan", ""]
    ];

    exportData.forEach((dir, i) => {
      const dirTotal = dir.divisi.reduce((s, d) => s + d.totalKegiatan, 0);
      const dirSudah = dir.divisi.reduce((s, d) => s + d.sudahMelaporkan, 0);
      const dirBelum = dir.divisi.reduce((s, d) => s + d.belumMelaporkan, 0);
      const dirBelumIkut = dir.divisi.reduce((s, d) => s + d.belumMengikuti, 0);

      wsData.push([i + 1, dir.direktorat, dirTotal, dirSudah, dirBelum, dirBelumIkut]);

      dir.divisi.forEach(div => {
        wsData.push(["", `   ${div.nama}`, div.totalKegiatan, div.sudahMelaporkan, div.belumMelaporkan, div.belumMengikuti]);
      });
    });

    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // merge cells
    ws["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } }, // Title
      { s: { r: 1, c: 0 }, e: { r: 1, c: 5 } }, // Period
      { s: { r: 3, c: 0 }, e: { r: 4, c: 0 } }, // No
      { s: { r: 3, c: 1 }, e: { r: 4, c: 1 } }, // Direktorat/Divisi
      { s: { r: 3, c: 2 }, e: { r: 4, c: 2 } }, // Total
      { s: { r: 3, c: 3 }, e: { r: 3, c: 4 } }, // Mengikuti
      { s: { r: 3, c: 5 }, e: { r: 4, c: 5 } }  // Belum Mengikuti
    ];

    // styles
    const titleStyle = {
      font: { bold: true, sz: 14 },
      alignment: { horizontal: "center", vertical: "center" },
      fill: { fgColor: { rgb: "DBEAFE" } }
    };

    const periodStyle = {
      font: { italic: true },
      alignment: { horizontal: "center", vertical: "center" }
    };

    const headerStyle = {
      font: { bold: true, color: { rgb: "FFFFFF" } },
      alignment: { horizontal: "center", vertical: "center" },
      fill: { fgColor: { rgb: "374151" } },
      border: {
        top: { style: "thin" },
        bottom: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" }
      }
    };

    if (ws["A1"]) ws["A1"].s = titleStyle;
    if (ws["A2"]) ws["A2"].s = periodStyle;

    ["A4", "B4", "C4", "D4", "F4", "D5", "E5"].forEach(cell => {
      if (ws[cell]) ws[cell].s = headerStyle;
    });

    ws["!cols"] = [
      { wch: 5 },
      { wch: 35 },
      { wch: 18 },
      { wch: 20 },
      { wch: 20 },
      { wch: 20 }
    ];

    ws["!rows"] = [
      { hpt: 25 },
      { hpt: 20 }
    ];

    XLSX.utils.book_append_sheet(wb, ws, "Laporan Kegiatan");

    const buf = XLSX.write(wb, { type: "array", bookType: "xlsx" });

    const fileName = selectedMonth
      ? `laporan-kegiatan-${months.find(m => m.value === selectedMonth)?.label}-${selectedYear}.xlsx`
      : `laporan-kegiatan-${selectedYear}.xlsx`;

    saveAs(new Blob([buf], { type: "application/octet-stream" }), fileName);
  };

  const filteredData = useMemo(() => {
    if (!searchTerm) return data;

    return data
      .map(dir => ({
        ...dir,
        divisi: dir.divisi.filter(div =>
          dir.direktorat.toLowerCase().includes(searchTerm.toLowerCase()) ||
          div.nama.toLowerCase().includes(searchTerm.toLowerCase())
        )
      }))
      .filter(dir =>
        dir.direktorat.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dir.divisi.length > 0
      );
  }, [data, searchTerm]);

  const getTotalStats = () => {
    let totalKegiatan = 0;
    let totalSudahMelaporkan = 0;
    let totalBelumMelaporkan = 0;
    let totalBelumMengikuti = 0;

    data.forEach(dir => {
      dir.divisi.forEach(div => {
        totalKegiatan += div.totalKegiatan;
        totalSudahMelaporkan += div.sudahMelaporkan;
        totalBelumMelaporkan += div.belumMelaporkan;
        totalBelumMengikuti += div.belumMengikuti;
      });
    });

    return { totalKegiatan, totalSudahMelaporkan, totalBelumMelaporkan, totalBelumMengikuti };
  };

  const stats = getTotalStats();

  return (
    <div className="card" style={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f9fafb' }}>
      <style>{`
        .excel-table {
          width: 100%;
          border-collapse: collapse;
          background: white;
        }
        .excel-table th,
        .excel-table td {
          border: 1px solid #d1d5db;
          padding: 12px 16px;
        }
        .excel-table thead th {
          background-color: #374151;
          color: white;
          font-weight: 600;
          text-align: center;
        }
        .direktorat-row {
          background-color: #dbeafe;
          font-weight: 600;
        }
        .direktorat-row:hover {
          background-color: #bfdbfe;
        }
        .divisi-row:hover {
          background-color: #f9fafb;
        }
      `}</style>

      {/* Export Dialog */}
      <Dialog
        header="Export ke Excel"
        visible={showExportDialog}
        style={{ width: '400px' }}
        onHide={() => setShowExportDialog(false)}
        footer={
          <div>
            <Button
              label="Batal"
              icon="pi pi-times"
              onClick={() => setShowExportDialog(false)}
              className="p-button-text"
            />
            <Button
              label="Export"
              icon="pi pi-download"
              onClick={handleConfirmExport}
              severity="success"
            />
          </div>
        }
      >
        <div className="flex flex-column gap-3">
          <div className="flex flex-column gap-2">
            <label htmlFor="year">Tahun</label>
            <Dropdown
              id="year"
              value={selectedYear}
              options={years}
              onChange={(e) => setSelectedYear(e.value)}
              placeholder="Pilih Tahun"
            />
          </div>

          <div className="flex flex-column gap-2">
            <label htmlFor="month">Bulan (Opsional)</label>
            <Dropdown
              id="month"
              value={selectedMonth}
              options={months}
              onChange={(e) => setSelectedMonth(e.value)}
              placeholder="Pilih Bulan"
            />
          </div>

          <div className="text-sm" style={{ color: '#6b7280', fontStyle: 'italic' }}>
            * Kosongkan bulan untuk export seluruh tahun
          </div>
        </div>
      </Dialog>

      {/* Toolbar */}
      <div className="card" style={{ padding: '12px', marginBottom: '0', borderBottom: '1px solid #d1d5db' }}>
        <div className="flex justify-content-between align-items-center">
          <div className="flex gap-2">
            <Button
              label="Export Excel"
              icon="pi pi-download"
              onClick={handleExportClick}
              severity="success"
              size="small"
            />
          </div>

          <div className="flex align-items-center gap-4">
            <div className="flex gap-3" style={{ fontSize: '14px' }}>
              <div className="flex gap-2 align-items-center">
                <span style={{ color: '#6b7280' }}>Total Kegiatan:</span>
                <strong>{stats.totalKegiatan}</strong>
              </div>
              <div className="flex gap-2 align-items-center">
                <span style={{ color: '#6b7280' }}>Sudah Melaporkan:</span>
                <strong style={{ color: '#15803d' }}>{stats.totalSudahMelaporkan}</strong>
              </div>
              <div className="flex gap-2 align-items-center">
                <span style={{ color: '#6b7280' }}>Belum Melaporkan:</span>
                <strong style={{ color: '#ca8a04' }}>{stats.totalBelumMelaporkan}</strong>
              </div>
              <div className="flex gap-2 align-items-center">
                <span style={{ color: '#6b7280' }}>Belum Mengikuti:</span>
                <strong style={{ color: '#dc2626' }}>{stats.totalBelumMengikuti}</strong>
              </div>
            </div>

            <IconField iconPosition="left">
              <InputIcon className="pi pi-search" />
              <InputText
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari direktorat atau divisi..."
                style={{ width: '320px' }}
              />
            </IconField>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        <table className="excel-table">
          <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
            <tr>
              <th rowSpan="2" style={{ width: '64px' }}>No</th>
              <th rowSpan="2">Direktorat</th>
              <th rowSpan="2" style={{ width: '128px' }}>Total Kegiatan</th>
              <th colSpan="2">Mengikuti</th>
              <th rowSpan="2" style={{ width: '128px' }}>Belum Mengikuti</th>
            </tr>
            <tr>
              <th style={{ width: '128px' }}>Sudah Melaporkan</th>
              <th style={{ width: '128px' }}>Belum Melaporkan</th>
            </tr>
          </thead>

          <tbody>
            {filteredData.map((dir, dirIndex) => {
              const dirTotal = dir.divisi.reduce((sum, div) => sum + div.totalKegiatan, 0);
              const dirSudahMelaporkan = dir.divisi.reduce((sum, div) => sum + div.sudahMelaporkan, 0);
              const dirBelumMelaporkan = dir.divisi.reduce((sum, div) => sum + div.belumMelaporkan, 0);
              const dirBelumMengikuti = dir.divisi.reduce((sum, div) => sum + div.belumMengikuti, 0);

              return (
                <React.Fragment key={dir.id}>
                  <tr className="direktorat-row">
                    <td style={{ textAlign: 'center' }}>{dirIndex + 1}</td>
                    <td>
                      <div className="flex align-items-center gap-2">
                        <Button
                          icon={dir.expanded ? 'pi pi-chevron-down' : 'pi pi-chevron-right'}
                          className="p-button-text p-button-sm"
                          onClick={() => toggleDirektorat(dir.id)}
                          style={{ padding: '4px' }}
                        />
                        <span style={{ color: '#1e40af' }}>{dir.direktorat}</span>
                      </div>
                    </td>
                    <td style={{ textAlign: 'center', backgroundColor: '#f3f4f6' }}>
                      <strong>{dirTotal}</strong>
                    </td>
                    <td style={{ textAlign: 'center', backgroundColor: '#dcfce7', color: '#15803d' }}>
                      <strong>{dirSudahMelaporkan}</strong>
                    </td>
                    <td style={{ textAlign: 'center', backgroundColor: '#fef3c7', color: '#ca8a04' }}>
                      <strong>{dirBelumMelaporkan}</strong>
                    </td>
                    <td style={{ textAlign: 'center', backgroundColor: '#fee2e2', color: '#dc2626' }}>
                      <strong>{dirBelumMengikuti}</strong>
                    </td>
                  </tr>

                  {dir.expanded && dir.divisi.map((div) => (
                    <tr key={div.id} className="divisi-row">
                      <td style={{ textAlign: 'center', fontSize: '14px', color: '#6b7280' }}></td>
                      <td><span>{div.nama}</span></td>
                      <td style={{ textAlign: 'center' }}>
                        <span style={{ fontWeight: 500 }}>{div.totalKegiatan}</span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span style={{ color: '#15803d', fontWeight: 500 }}>{div.sudahMelaporkan}</span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span style={{ color: '#ca8a04', fontWeight: 500 }}>{div.belumMelaporkan}</span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span style={{ color: '#dc2626', fontWeight: 500 }}>{div.belumMengikuti}</span>
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="card" style={{ padding: '8px 16px', marginTop: '0', borderTop: '1px solid #d1d5db', fontSize: '14px', color: '#6b7280' }}>
        <div className="flex justify-content-between align-items-center">
          <span>
            Total: {filteredData.length} Direktorat, {filteredData.reduce((sum, d) => sum + d.divisi.length, 0)} Divisi
          </span>
        </div>
      </div>
    </div>
  );
};

export default TableReport;
