import MainCard from 'ui-component/cards/MainCard';
import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Editor } from 'primereact/editor';

import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import './app.css';
import CountUp from 'react-countup';
import api from '../../api/axios';

export default function DaftarTindakLanjut() {
    const token = localStorage.getItem('token');
    const [loading, setLoading] = useState(true);
    const [filename, setFilename] = useState('');
    const [tasks, setTasks] = useState([]);
    const [showDialog, setShowDialog] = useState(false);
    const [currentTask, setCurrentTask] = useState(null);
    const [filterStatus, setFilterStatus] = useState('ALL');

    const [form, setForm] = useState({
        judulTindakLanjut: '',
        isiTindakLanjut: '',
        file: null
    });

    const fetchTindakLanjut = async () => {
        try {
            setLoading(true);
            const res = await api.get('/api/tindaklanjut/get-arahan', {
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
        fetchTindakLanjut();
    }, []);

    const handleSubmitTindakLanjut = async () => {
        if (!currentTask) return;

        const formData = new FormData();

        if (form.file) formData.append("file_tindaklanjut", form.file);
        formData.append("judul_tindaklanjut", form.judulTindakLanjut);
        formData.append("isi_tindaklanjut", form.isiTindakLanjut);

        try {
            const res = await api.patch(
                `/api/tindaklanjut/update/${currentTask._id}/tindaklanjut`,
                formData,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            setTasks(prev =>
                prev.map(t =>
                    t._id === currentTask._id
                        ? {
                            ...t,
                            judul_tindak_lanjut: form.judulTindakLanjut,
                            isi_tindak_lanjut: form.isiTindakLanjut
                        }
                        : t
                )
            );

            setShowDialog(false);
            setCurrentTask(null);
            setForm({ judulTindakLanjut: '', isiTindakLanjut: '', file: null });
        } catch (error) {

        }
    };

    const totalArahan = tasks.length;

    const sudahTindakLanjut = tasks.filter(
        (t) => t.isTindakLanjut === true
    ).length;

    const belumTindakLanjut = tasks.filter(
        (t) => !t.isTindakLanjut
    ).length;

    const filteredTasks = tasks.filter((t) => {
        if (filterStatus === 'DONE') return t.isTindakLanjut === true;
        if (filterStatus === 'PENDING') return !t.isTindakLanjut;
        return true;
    });

    const aksiTemplate = (row) => (
        <Button
            label={row.judul_tindaklanjut ? 'Sudah Ditindaklanjuti' : 'Isi Tindak Lanjut'}
            severity={row.judul_tindaklanjut ? 'success' : 'primary'}
            onClick={() => {
                setCurrentTask(row);
                setForm({
                    judulTindakLanjut: row.judul_tindaklanjut || '',
                    isiTindakLanjut: row.isi_tindaklanjut || '',
                    file: null
                });
                setShowDialog(true);
            }}
        />
    );

    const handleOpenFileArahan = async () => {
        console.log(currentTask)
        try {
            const res = await api.get(
                `/api/tindaklanjut/file_tindak/${currentTask.file_arahan}`,
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

    const getFileName = async () => {
        try {
            const response = await axios.get(`http://localhost:3000/api/tindaklanjut/file_meta/${currentTask.file_arahan}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setFilename(response.data.filename);
        } catch (error) {
            console.error("Error mengambil filename", error)
        }
    };

    useEffect(() => {
        if (currentTask?.file_arahan) {
            getFileName(currentTask.file_arahan);
        }
    }, [currentTask?.file_arahan]);

    return (
        <div className="card h-full flex">
            <MainCard
                title="Daftar Tindak Lanjut"
                className="h-full w-full flex flex-column"
            >

                <div className="flex gap-3 mb-3">
                    <div
                        className={`summary-card done ${filterStatus === 'DONE' ? 'active' : ''}`}
                        onClick={() => setFilterStatus('DONE')}
                    >
                        <i className="pi pi-check-circle" />
                        <div>
                            <span className="summary-value">
                                <CountUp end={sudahTindakLanjut} />
                            </span>
                            <span className="summary-label">Sudah Ditindaklanjuti</span>
                        </div>
                    </div>

                    <div
                        className={`summary-card pending ${filterStatus === 'PENDING' ? 'active' : ''}`}
                        onClick={() => setFilterStatus('PENDING')}
                    >
                        <i className="pi pi-clock" />
                        <div>
                            <span className="summary-value">
                                <CountUp end={belumTindakLanjut} />
                            </span>
                            <span className="summary-label">Belum Ditindaklanjuti</span>
                        </div>
                    </div>

                    <div
                        className={`summary-card total ${filterStatus === 'ALL' ? 'active' : ''}`}
                        onClick={() => setFilterStatus('ALL')}
                    >
                        <i className="pi pi-list" />
                        <div>
                            <span className="summary-value">
                                <CountUp end={tasks.length} />
                            </span>
                            <span className="summary-label">Total Arahan</span>
                        </div>
                    </div>
                </div>


                <div className="flex-1">
                    <DataTable
                        value={filteredTasks}
                        paginator
                        rows={5}
                        stripedRows
                        rowHover
                        showGridlines
                        className="h-full border-round-lg custom-datatable"
                        emptyMessage={
                            <div className="empty-center">
                                <i className="pi pi-inbox mb-2 text-400" />
                                <span className="font-medium block">
                                    Belum ada arahan
                                </span>
                            </div>
                        }
                    >
                        <Column
                            header="Arahan"
                            body={(row) => (
                                <div className="arahan-title">
                                    {row.judul_arahan}
                                </div>
                            )}
                            style={{ width: '22%' }}
                        />

                        <Column
                            header="Isi Arahan"
                            body={(row) => (
                                <div
                                    className="isi-arahan"
                                    dangerouslySetInnerHTML={{ __html: row.isi_arahan }}
                                />
                            )}
                        />

                        <Column
                            header="Aksi"
                            body={aksiTemplate}
                            style={{ textAlign: 'center', width: '16%' }}
                        />
                    </DataTable>

                </div>

                <Dialog
                    visible={showDialog}
                    modal
                    className="detail-dialog"
                    style={{ width: '42rem' }}
                    onHide={() => setShowDialog(false)}
                    header={
                        <div className="dialog-header">
                            <i className="pi pi-clipboard mr-2" />
                            Tindak Lanjut Arahan

                        </div>
                    }
                >
                    {currentTask && (
                        <div className="flex flex-column gap-4">

                            <div className="arahan-box">
                                <span className="font-medium">Arahan Admin</span>
                                <h4 className="mt-2">{currentTask.judul_arahan}</h4>
                                <div
                                    dangerouslySetInnerHTML={{
                                        __html: currentTask.isi_arahan
                                    }}
                                />
                            </div>

                            <div>
                                <label className="font-medium block mb-2">
                                    Dokumen Arahan
                                </label>

                                {currentTask.file_arahan ? (
                                    <div
                                        className="file-card"
                                        onClick={handleOpenFileArahan}
                                    >
                                        <i className="pi pi-file-pdf file-icon" />
                                        <div className="file-info">
                                            <span className="file-name">
                                                {filename}
                                            </span>

                                        </div>
                                    </div>
                                ) : (
                                    <small className="text-500 italic">
                                        Tidak ada dokumen arahan yang dilampirkan
                                    </small>
                                )}
                            </div>


                            <div>
                                <label className="font-medium block mb-2">
                                    Judul Tindak Lanjut
                                </label>
                                <input
                                    className="p-inputtext w-full"
                                    value={form.judulTindakLanjut}
                                    onChange={(e) =>
                                        setForm({ ...form, judulTindakLanjut: e.target.value })
                                    }
                                />
                            </div>

                            <div>
                                <label className="font-medium block mb-2">
                                    Isi Tindak Lanjut
                                </label>
                                <Editor
                                    value={form.isiTindakLanjut}
                                    onTextChange={(e) =>
                                        setForm({ ...form, isiTindakLanjut: e.htmlValue })
                                    }
                                    style={{ height: '200px' }}
                                />
                            </div>

                            <div>
                                <label className="font-medium block mb-2">
                                    File Pendukung
                                </label>
                                <input
                                    type="file"
                                    className="file-input"
                                    onChange={(e) =>
                                        setForm({ ...form, file: e.target.files[0] })
                                    }
                                />
                            </div>

                            <div className="flex justify-end">
                                {currentTask.isTindakLanjut == true ? (
                                    <Button
                                        label="Kembali"
                                        icon="pi pi-arrow-left"
                                        className="p-button-danger"
                                        onClick={() => setShowDialog(false)}
                                    />
                                ) : (
                                    <Button
                                        label="Simpan Tindak Lanjut"
                                        type='submit'
                                        icon="pi pi-check"
                                        className="p-button-success"
                                        onClick={handleSubmitTindakLanjut}
                                    />
                                )}
                            </div>
                        </div>
                    )}
                </Dialog>
            </MainCard>
        </div>
    );
}

