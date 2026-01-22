import MainCard from 'ui-component/cards/MainCard';
import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Editor } from 'primereact/editor';

// prime react
import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import './app.css';
import api from '../../api/axios';

export default function DaftarNotifikasi() {

    const [loading, setLoading] = useState(true);
    const [showDetail, setShowDetail] = useState(false);
    const [selectedNotif, setSelectedNotif] = useState("");
    const [form, setForm] = useState({
        laporan: "",
        file: null
    });
    const [errors, setErrors] = useState({});
    const [tasks, setTasks] = useState([]);
    const [currentTask, setCurrentTask] = useState(null);
    const [currentTaskTambahan, setCurrentTaskTambahan] = useState(null);
    const [showDialog, setShowDialog] = useState(false);
    const [showDialogTambahan, setShowDialogTambahan] = useState(false);
    const [laporanText, setLaporanText] = useState('');
    const [laporanTextTambahan, setLaporanTextTambahan] = useState('');
    const token = localStorage.getItem('token');

    // fetch data disposisi
    const fetchTasks = async () => {
        try {
            setLoading(true);
            const res = await api.get('/api/task/disposisi/my', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTasks(res.data);
        } catch (err) {
            console.error('Error get tasks:', err.response?.data || err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    //validate form kalau ada laporan yang kosong belum diisi pas ngisi di form
    const validateForm = () => {

        let newErrors = {};

        if (!laporanText || laporanText.trim() === "") {
            newErrors.laporan = "Laporan wajib diisi.";
        }


        return newErrors;
    };


    // template buat buka data detail dan ada di data table
    const detailBodyTemplate = (rowData) => {
        return (
            <Button
                type="button"
                icon="pi pi-search" severity='info' rounded
                style={{ cursor: 'pointer' }}
                onClick={() => {
                    setSelectedNotif(rowData);
                    setShowDetail(true);
                }}
            ></Button>
        );
    };

    const handleChange = (field, value) => {

        setForm({ ...form, [field]: value });
        setErrors({ ...errors, [field]: "" });
    };


    const handleFileChange = (e) => {
        const file = e.target.files[0];

        // Validasi PDF
        if (file && file.type !== "application/pdf") {
            alert("File harus berupa PDF!");
            e.target.value = "";
            return;
        }

        handleChange("file", file);
    };

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

    // set time dan tanggal
    const getLocalDateOnly = (isoString) => {
        const d = new Date(isoString);
        return new Date(d.getFullYear(), d.getMonth(), d.getDate());
    };

    // setting jam apakah laporan boleh di isi, soalnya kalau belum tanggalnya tombol isi laporan bakal disable
    const isLaporanAllowed = (row) => {
        const now = new Date();

        const localDate = getLocalDateOnly(row.tanggal);
        const startTime = new Date(row.jam_mulai);

        const start = new Date(
            localDate.getFullYear(),
            localDate.getMonth(),
            localDate.getDate(),
            startTime.getHours(),
            startTime.getMinutes(),
            startTime.getSeconds()
        );

        return now >= start;
    };

    // inih template buat kirim data pas pop up di data table
    const laporanActionTemplate = (row) => {
        const bolehLapor = isLaporanAllowed(row);
        return (
            <Button
                label={row.laporan ? 'Sudah Melaporkan' : 'Isi Laporan'}
                severity={row.laporan ? "success" : "primary"}
                onClick={() => {
                    setCurrentTask(row);
                    setLaporanText(row.laporan || '');
                    setShowDialog(true);
                }}
                disabled={!bolehLapor}
            />
        );
    };

    // action pada data table pas kalo tekan button
    const laporanTambahanActionTemplate = (row) => {
        const bolehLapor = isLaporanAllowed(row);

        const laporanUtamaSudahDiisi =
            row.laporan && row.laporan.trim() !== "";
        return (
            <Button
                label={row.laporan_tambahan ? 'Sudah Melaporkan' : 'Isi Laporan'}
                severity={row.laporan_tambahan ? "success" : "primary"}
                onClick={() => {
                    setCurrentTaskTambahan(row);
                    setLaporanTextTambahan(row.laporan_tambahan || '');
                    setShowDialogTambahan(true);
                }}
                disabled={!bolehLapor || !laporanUtamaSudahDiisi}
            />
        );
    };

    // simpan hasil laporan
    const handleSaveLaporan = async () => {
        if (!currentTask) return;

        const validation = validateForm();
        setErrors(validation);
        if (Object.keys(validation).length > 0) return;

        const formData = new FormData();
        if (form.file) formData.append("laporan_file_path", form.file);
        formData.append("laporan", laporanText);
        try {
            const res = await api.patch(
                `/api/task/disposisi/${currentTask._id}/laporan`,
                formData,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            const updated = res.data.disposisi;

            setTasks((prev) =>
                prev.map((t) => (t._id === updated._id ? updated : t))
            );

            setShowDialog(false);
            setCurrentTask(null);
            setLaporanText('');
        } catch (err) {
            console.error(
                'Error update laporan:',
                err.response?.data || err.message
            );
        }
    };

    //simpan hasil laporan tambahan
    const handleSaveLaporanTambahan = async () => {
        if (!currentTaskTambahan) return;

        const formData = new FormData();
        if (form.file) formData.append("laporan_tambahan_path", form.file);
        formData.append("laporan_tambahan", laporanTextTambahan);
        try {
            const res = await api.patch(
                `/api/task/disposisi/${currentTaskTambahan._id}/laporan-tambahan`,
                formData,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            const updated = res.data.disposisi;

            setTasks((prev) =>
                prev.map((t) => (t._id === updated._id ? updated : t))
            );



            setShowDialogTambahan(false);
            setCurrentTaskTambahan(null);
            setLaporanTextTambahan('');
        } catch (err) {
            console.error(
                'Error update laporan:',
                err.response?.data || err.message
            );
        }
    };

    // handle action file di data table saat tekan tombol lihat laporan disposisi
    const fileBodyTemplate = (fileId) => {
        if (!fileId) return <span>-</span>;

        const handleOpen = async () => {
            try {
                const res = await api.get(
                    `/api/task/file/${fileId}`,
                    {
                        responseType: 'blob'
                    }
                );

                const fileURL = URL.createObjectURL(res.data);
                window.open(fileURL);
            } catch (err) {
                console.error('Gagal buka file', err);
            }
        };

        return (
            <Button
                label="Lihat"
                icon="pi pi-file"
                className="p-button-text p-button-sm"
                onClick={handleOpen}
            />
        );
    };


    const handleOpenLaporan = async () => {
        try {
            const res = await api.get(
                `/api/task/file/${currentTask.laporanFileId}`,
                {
                    responseType: "blob"
                }
            );

            const fileURL = URL.createObjectURL(res.data);
            window.open(fileURL);
        } catch (err) {
            console.error("Gagal buka file laporan", err);
        }
    };

    const handleOpenLaporanTambahan = async () => {
        try {
            const res = await api.get(
                `/api/task/file/${currentTaskTambahan.laporanFileTambahanId}`,
                {
                    responseType: "blob"
                }
            );

            const fileURL = URL.createObjectURL(res.data);
            window.open(fileURL);
        } catch (err) {
            console.error("Gagal buka file laporan tambahan", err);
        }
    };


    return (
        <div className="card">
            <MainCard title="Daftar Notifikasi">

                {/* Dialog atau Pop Up untuk membuat laporan */}
                <Dialog
                    header="Laporan Tugas"
                    visible={showDialog}
                    style={{ width: '30rem' }}
                    modal
                    onHide={() => setShowDialog(false)}
                >
                    {currentTask && (
                        <div className="flex flex-column gap-3">
                            <div>
                                <p>
                                    <strong>Nama Kegiatan:</strong> {currentTask.nama_kegiatan}
                                </p>
                                <p>
                                    <strong>Agenda:</strong> {currentTask.agenda_kegiatan}
                                </p>
                            </div>

                            <div>
                                <label className="block mb-2 font-semibold">Isi Laporan</label>

                                <Editor
                                    value={laporanText}
                                    onTextChange={(e) => setLaporanText(e.htmlValue)}
                                    style={{ height: '200px' }}
                                    className={errors.laporan ? "p-invalid" : ""}
                                />

                                {errors.laporan && <small className="p-error">{errors.laporan}</small>}

                                {/* File */}
                                <div className="input_container">
                                    <input
                                        id="fileUpload"
                                        type="file"
                                        className="w-full mb-3"
                                        accept="application/pdf"
                                        onChange={(e) => handleFileChange(e)}
                                    />
                                </div>
                                {errors.file && <small className="p-error">{errors.file}</small>}
                            </div>

                            {currentTask.laporanFileId ? (
                                <Button
                                    label="Lihat File Laporan"
                                    icon="pi pi-file"
                                    className="p-button p-button-sm mb-2"
                                    onClick={handleOpenLaporan}
                                />
                            ) : (
                                <small className="text-gray-500 mb-2 block">Belum ada file laporan.</small>
                            )}

                            <p>
                                <strong>Komentar atau Feedback EVP:</strong> {currentTask.komentar}
                            </p>

                            <div className="flex justify-end gap-2 mt-3">
                                {currentTask.laporan_status === "SUDAH" ? (
                                    <Button
                                        label="Kembali"
                                        className="p-button-text"
                                        onClick={() => setShowDialog(false)}
                                    />
                                ) : (
                                    <Button label="Simpan" onClick={handleSaveLaporan} />
                                )}
                            </div>
                        </div>
                    )}
                </Dialog>
                {/* End */}

                {/* Dialog atau Pop Up untuk membuat laporan TAMBAHAN */}
                <Dialog
                    header="Laporan Tambahan"
                    visible={showDialogTambahan}
                    style={{ width: '30rem' }}
                    modal
                    onHide={() => setShowDialogTambahan(false)}
                >
                    {currentTaskTambahan && (
                        <div className="flex flex-column gap-3">
                            <div>
                                <p>
                                    <strong>Nama Kegiatan:</strong> {currentTaskTambahan.nama_kegiatan}
                                </p>
                                <p>
                                    <strong>Agenda:</strong> {currentTaskTambahan.agenda_kegiatan}
                                </p>
                            </div>

                            <div>
                                <label className="block mb-2 font-semibold">Isi Laporan</label>

                                <Editor
                                    value={laporanTextTambahan}
                                    onTextChange={(e) => setLaporanTextTambahan(e.htmlValue)}
                                    style={{ height: '200px' }}
                                    className={errors.laporan_tambahan ? "p-invalid" : ""}
                                />

                                {/* File */}
                                <div className="input_container">
                                    <input
                                        id="laporan_tambahan_path"
                                        type="file"
                                        className="w-full mb-3"
                                        accept="application/pdf"
                                        onChange={(e) => handleFileChange(e)}
                                    />
                                </div>
                                {errors.file && <small className="p-error">{errors.file}</small>}
                            </div>

                            {currentTaskTambahan.laporanFileTambahanId ? (
                                <Button
                                    label="Lihat File Laporan"
                                    icon="pi pi-file"
                                    className="p-button p-button-sm mb-2"
                                    onClick={handleOpenLaporanTambahan}
                                />
                            ) : (
                                <small className="text-gray-500 mb-2 block">Belum ada file laporan.</small>
                            )}


                            <div className="flex justify-end gap-2 mt-3">

                                {currentTaskTambahan?.laporan_tambahan ? (
                                    <Button
                                        label="Kembali"
                                        className="p-button-text"
                                        onClick={() => setShowDialogTambahan(false)}
                                    />
                                ) : (
                                    <Button
                                        label="Simpan"
                                        onClick={handleSaveLaporanTambahan}
                                    />
                                )}

                            </div>
                        </div>
                    )}
                </Dialog>
                {/* End */}

                <Dialog
                    header="Detail Notifikasi"
                    visible={showDetail}
                    modal
                    style={{ width: "25rem" }}
                    onHide={() => setShowDetail(false)}
                >
                    {selectedNotif && (
                        <div className="flex flex-column gap-2">

                            <p><strong>Nama Kegiatan:</strong> {selectedNotif.nama_kegiatan}</p>
                            <p><strong>Tanggal:</strong> {formDate(selectedNotif.tanggal)}</p>
                            <p><strong>Jam Mulai:</strong> {formTime(selectedNotif.jam_mulai)}</p>
                            <p><strong>Jam Selesai:</strong> {formTime(selectedNotif.jam_selesai)}</p>
                            <p><strong>Tempat:</strong> {selectedNotif.tempat}</p>
                            <p><strong>File:</strong>{fileBodyTemplate(selectedNotif.fileId)}</p>
                            <p><strong>Catatan:</strong> {selectedNotif.catatan || "-"}</p>
                        </div>
                    )}
                </Dialog>

                <DataTable
                    value={tasks}
                    paginator
                    rows={5}
                    loading={loading}
                    dataKey="_id"
                    emptyMessage="Tidak ada data."
                >
                    <Column field="nama_kegiatan" header="Nama Kegiatan" style={{ minWidth: '10rem' }} />
                    <Column field="tanggal" header="Tanggal" body={(row) => formDate(row.tanggal)} style={{ minWidth: '10rem' }} />
                    <Column header="Jam" body={(row) => `${formTime(row.jam_mulai)} - ${formTime(row.jam_selesai)}`} style={{ minWidth: '10rem' }} />
                    {/* <Column field="tempat" header="Tempat" style={{ minWidth: '12rem' }} /> */}
                    <Column
                        header="Tempat"
                        body={(rowData) => {
                            const ruangan = rowData.ruangan?.replace(/"/g, '').trim();
                            const tempat = rowData.tempat?.trim();

                            if (ruangan) return ruangan;
                            if (tempat) return tempat;
                            return "-";
                        }}
                        style={{ minWidth: '12rem' }}
                    />
                    <Column header="Detail" body={detailBodyTemplate} style={{ textAlign: 'left', width: '6rem' }} />
                    <Column header="Laporan" body={laporanActionTemplate} style={{ textAlign: 'center', width: '6rem' }} />
                    <Column header="Laporan Tambahan" body={laporanTambahanActionTemplate} style={{ textAlign: 'center', width: '6rem' }} />
                </DataTable>

            </MainCard>
        </div>
    );
}
