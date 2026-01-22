import MainCard from 'ui-component/cards/MainCard';
import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Typography } from '@mui/material';
import { InputTextarea } from 'primereact/inputtextarea';
import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import './app.css';
import { Tag } from 'primereact/tag';
import api from '../../api/axios'

export default function DashboardEVP() {
    const token = localStorage.getItem('token');
    const [loading, setLoading] = useState(true);
    const [selectedLaporan, setSelectedLaporan] = useState("");
    const [selectedLaporanTambahan, setSelectedLaporanTambahan] = useState("");
    const [showLaporan, setShowLaporan] = useState(false);
    const [showLaporanTambahan, setShowLaporanTambahan] = useState(false);
    const [showDisposisi, setShowDisposisi] = useState([]);
    const [laporanPath, setLaporanPath] = useState(null);
    const [laporanPathTambahan, setLaporanPathTambahan] = useState(null);
    const [laporanby, setLaporanBy] = useState("");
    const [laporanbyTambahan, setLaporanByTambahan] = useState("");
    const [laporanat, setLaporanAt] = useState("");
    const [laporanatTambahan, setLaporatAtTambahan] = useState("");
    const [komentarText, setKomentar] = useState("");
    const [currentTask, setCurrentTask] = useState(null);
    const [visible, setVisible] = useState(false);
    const [visible2, setVisible2] = useState(false);
    const [errors, setErrors] = useState({});



    //get all data disposisi
    const getDataDisposisi = async () => {
        try {
            setLoading(true);
            // console.log(token);
            const response = await api.get('/api/task/disposisi', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setShowDisposisi(response.data);
        } catch (error) {
            console.error("Error mengambil data disposisi", error)
        }
        setLoading(false)

    };

    useEffect(() => {
        getDataDisposisi();
    }, []);

    // laporan body template buat data table
    const laporanBodyTemplate = (rowData) => {
        // console.log(rowData);
        return (
            <div className="flex gap-2">
                <Button
                    icon="pi pi-book"
                    className="p-button-rounded p-button-info p-button-sm"
                    onClick={() => {
                        setCurrentTask(rowData);
                        setSelectedLaporan(rowData.laporan);
                        setLaporanPath(rowData.laporan_file_path);
                        setLaporanBy(rowData.laporan_by);
                        setLaporanAt(rowData.laporan_at);
                        setKomentar(rowData.komentar);
                        setShowLaporan(true);
                    }}
                />
            </div>
        );
    };

    const laporanTambahanBodyTemplate = (rowData) => {
        // console.log(rowData);
        return (
            <div className="flex gap-2">
                <Button
                    icon="pi pi-folder"
                    className="p-button-rounded p-button-help p-button-sm"
                    onClick={() => {
                        setSelectedLaporanTambahan(rowData.laporan_tambahan);
                        setLaporanPathTambahan(rowData.laporan_tambahan_path);
                        setLaporanByTambahan(rowData.laporan_tambahan_by);
                        setLaporatAtTambahan(rowData.laporan_tambahan_at);
                        setShowLaporanTambahan(true);
                    }}
                />
            </div>
        );
    };

    const getSeverity = (status) => (status === 'SUDAH' ? 'success' : 'danger');
    const statusBodyTemplate = (rowData) => <Tag value={rowData.laporan_status} severity={getSeverity(rowData.laporan_status)} />;
    const hasKomentar = currentTask?.komentar && currentTask.komentar.trim() !== "";


    const namaPegawaiTemplate = (rowData) => {
        if (Array.isArray(rowData) && rowData.length) {
            return rowData.map(u => u?.name).filter(Boolean).join(", ");
        }
        return "-";

    }


    // setting date 
    const formDate = (date) => {
        if (!date) return "";

        return new Date(date).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    };

    // setting time
    const formTime = (date) => {
        if (!date) return "Selesai";

        return new Date(date).toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const formTimeLaporan = (date) => {
        if (!date) return "-";

        return new Date(date).toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const handleSendComment = async () => {
        try {
            const res = await api.patch(
                `/api/task/disposisi/${currentTask._id}/komentar`,
                { text: komentarText },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                }
            );


            const updated = res.data.disposisi;

            setShowDisposisi(prev =>
                prev.map(t => {
                    if (t._id !== updated._id) return t;
                    return {
                        ...t,
                        ...updated,
                    };
                })
            );

            setShowLaporan(false);
            setCurrentTask(null);
            setKomentar("");
        } catch (error) {
            console.error("Error Saat Mengirim Komentar", error)
        }
    }

    const htmlToPlainText = (html) => {
        if (!html) return '';

        let text = html;
        text = text.replace(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/gi, '\n$1\n');

        let counter = 1;
        text = text.replace(/<li[^>]*>(.*?)<\/li>/gi, (match, content) => {
            const cleanContent = content.replace(/<[^>]*>/g, '');
            return `\n${counter++}. ${cleanContent}`;
        });

        text = text.replace(/<p[^>]*>(.*?)<\/p>/gi, '\n$1\n');
        text = text.replace(/<br\s*\/?>/gi, '\n');
        text = text.replace(/<[^>]*>/g, '');
        text = text.replace(/&nbsp;/g, ' ');
        text = text.replace(/&amp;/g, '&');
        text = text.replace(/&lt;/g, '<');
        text = text.replace(/&gt;/g, '>');
        text = text.replace(/&quot;/g, '"');
        text = text.replace(/\n\s*\n/g, '\n\n');
        text = text.trim();

        return text;
    };



    return (
        <div className="card">
            <MainCard title="Dashboard">

                {/* Laporan */}
                <Dialog
                    header="Laporan Disposisi"
                    visible={showLaporan}
                    modal
                    style={{ width: "25rem" }}
                    onHide={() => {
                        setShowLaporan(false)
                        setSelectedLaporan(null)
                    }}
                >

                    {selectedLaporan ? (
                        <div className="mt-3">
                            <label className="block mb-2 font-semibold">Isi Laporan</label>
                            <div className="relative">
                                <InputTextarea
                                    value={htmlToPlainText(selectedLaporan)}
                                    disabled
                                    rows={5}
                                    cols={30}
                                    style={{ whiteSpace: 'pre-wrap' }}
                                />

                                <Button
                                    icon="pi pi-window-maximize"
                                    className="p-button-text p-button-sm absolute top-2 right-2"
                                    onClick={() => setVisible(true)}
                                    tooltip="Lihat fullscreen"
                                    tooltipOptions={{ position: 'left' }}
                                />
                            </div>
                        </div>
                    ) : (
                        <Typography color="error">Belum ada laporan yang ditulis.</Typography>
                    )}
                    {laporanPath ? (
                        <Button
                            label="Lihat File Laporan"
                            icon="pi pi-file"
                            className="p-button p-button-sm"
                            onClick={() => window.open(`${api}/${laporanPath}`, "_blank")}
                        />
                    ) : (
                        <Typography color="error">Belum ada file laporan.</Typography>
                    )}
                    <Typography className='mt-3'>Ditulis Oleh: {laporanby?.name ?? "-"}</Typography>
                    <Typography className='mt-3'>Ditulis Tanggal: {formDate(laporanat) ?? "-"} - Jam: {formTimeLaporan(laporanat) ?? "-"}</Typography>

                    <div className="mt-3">
                        <label className="block mb-2 font-semibold">
                            Berikan Komentar atau Feedback
                        </label>

                        <InputTextarea
                            rows={5}
                            className={`w-full ${errors.komentar ? "p-invalid" : ""} mb-3`}
                            value={komentarText || ""}
                            onChange={(e) => setKomentar(e.target.value)}
                            placeholder="Tuliskan komentar laporan di sini..."
                            disabled={hasKomentar}
                        />

                        <div className="flex justify-end mt-2">
                            {hasKomentar ? (
                                <Button
                                    label="Kembali"
                                    onClick={() => setShowLaporan(false)}
                                />
                            ) : (
                                <Button
                                    label="Kirim"
                                    onClick={handleSendComment}
                                />
                            )}
                        </div>

                    </div>


                </Dialog>


                {/* Laporan Tambahan*/}
                <Dialog
                    header="Laporan Disposisi"
                    visible={showLaporanTambahan}
                    modal
                    style={{ width: "25rem" }}
                    onHide={() => {
                        setShowLaporanTambahan(false)
                        setSelectedLaporanTambahan(null)
                    }}
                >
                    {selectedLaporanTambahan ? (
                        <div className="mt-3">
                            <label className="block mb-2 font-semibold">Isi Laporan</label>
                            <div className="relative">
                                <InputTextarea
                                    value={htmlToPlainText(selectedLaporanTambahan)}
                                    disabled
                                    rows={5}
                                    cols={30}
                                    style={{ whiteSpace: 'pre-wrap' }}
                                />
                                <Button
                                    icon="pi pi-window-maximize"
                                    className="p-button-text p-button-sm absolute top-2 right-2"
                                    onClick={() => setVisible2(true)}
                                    tooltip="Lihat fullscreen"
                                    tooltipOptions={{ position: 'left' }}
                                />
                            </div>
                        </div>
                    ) : (
                        <Typography color="error">Belum ada laporan yang ditulis.</Typography>
                    )}
                    {laporanPathTambahan ? (
                        <Button
                            label="Lihat File Laporan"
                            icon="pi pi-file"
                            className="p-button p-button-sm"
                            onClick={() => window.open(`${api}/${laporanPathTambahan}`, "_blank")}
                        />
                    ) : (
                        <Typography color="error">Belum ada file laporan.</Typography>
                    )}
                    <Typography className='mt-3'>Ditulis Oleh: {laporanbyTambahan?.name ?? "-"}</Typography>
                    <Typography className='mt-3'>Ditulis Tanggal: {formDate(laporanatTambahan) ?? "-"} - Jam: {formTimeLaporan(laporanatTambahan) ?? "-"}</Typography>
                </Dialog>

                <Dialog
                    header="Isi Laporan"
                    visible={visible}
                    maximizable
                    style={{ width: '50vw' }}
                    onHide={() => setVisible(false)}
                >
                    {/* Render HTML yang ada di laporan yaaks*/}
                    <div
                        className="ql-editor"
                        dangerouslySetInnerHTML={{ __html: selectedLaporan }}
                        style={{
                            minHeight: '300px',
                            padding: '12px 15px'
                        }}
                    />
                </Dialog>

                <Dialog
                    header="Isi Laporan Tambahan"
                    visible={visible2}
                    maximizable
                    style={{ width: '50vw' }}
                    onHide={() => setVisible2(false)}
                >
                    {/* Render HTML yang ada di laporan yaaks*/}
                    <div
                        className="ql-editor"
                        dangerouslySetInnerHTML={{ __html: selectedLaporanTambahan }}
                        style={{
                            minHeight: '300px',
                            padding: '12px 15px'
                        }}
                    />
                </Dialog>

                {/* TABLE */}
                <DataTable
                    value={showDisposisi}
                    paginator rows={5}
                    loading={loading}
                    dataKey="_id"
                >
                    <Column field="nama_kegiatan" header="Nama Kegiatan" style={{ minWidth: '10rem' }} />
                    <Column header="Nama Pegawai" body={(row) => namaPegawaiTemplate(row.nama_yang_dituju)} style={{ minWidth: '10rem' }} />
                    <Column field="tanggal" header="Tanggal" body={(row) => formDate(row.tanggal)} style={{ minWidth: '10rem' }} />
                    <Column header="Jam" body={(row) => `${formTime(row.jam_mulai)} - ${formTime(row.jam_selesai)}`} style={{ minWidth: '10rem' }} />
                    {/* <Column field="tempat" header="Tempat" style={{ minWidth: '8rem' }} /> */}
                     <Column
                                            header="Tempat"
                                            body={(rowData) => {
                                                const ruangan = rowData.ruangan?.replace(/"/g, '').trim();
                                                const tempat = rowData.tempat?.trim();
                    
                                                if (ruangan) return ruangan;
                                                if (tempat) return tempat;
                                                return "-";
                                            }}
                                            style={{ minWidth: '8rem' }}
                                        />
                    <Column field="laporan" header="Laporan" body={laporanBodyTemplate} style={{ minWidth: '8rem', textAlign: 'center' }} />
                    <Column header="Status Laporan" body={statusBodyTemplate} style={{ minWidth: '8rem' }} />
                    <Column field="laporan_tambahan" header="Laporan Tambahan" body={laporanTambahanBodyTemplate} style={{ minWidth: '8rem', textAlign: 'center' }} />
                    {/*  Action */}
                </DataTable>

            </MainCard>
        </div>
    );
}

