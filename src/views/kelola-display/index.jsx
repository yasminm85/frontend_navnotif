
import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputNumber } from 'primereact/inputnumber';
import { Card } from 'primereact/card';
import { TabView, TabPanel } from 'primereact/tabview';
import { FileUpload } from 'primereact/fileupload';
import { Chip } from 'primereact/chip';
import { Box, Typography, Paper } from '@mui/material';
import { Calendar } from 'primereact/calendar';
import MainCard from 'ui-component/cards/MainCard';
import Grid from '@mui/material/Grid';
import axios from 'axios';
import Swal from 'sweetalert2';
import api from '../../api/axios';

// primereact
import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';

export default function KelolaDisplay() {
    const token = localStorage.getItem('token');
    const [activeIndex, setActiveIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [media, setMedia] = useState([]);
    const [previewCount, setPreviewCount] = useState(0);
    const [agendaSelesaiList, setAgendaSelesaiList] = useState([]);


    
    const [showMediaDialog, setShowMediaDialog] = useState(false);
    const [form, setForm] = useState({
        duration: "",
        file: null
    });

    const fetchMedia = async () => {
        try {
            setLoading(true);
            const res = await api.get('/api/media/getAll-media', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMedia(res.data);
        } catch (err) {
            console.error('Error get media:', err.response?.data || err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMedia();
    }, []);

    const [agendaSelesaiFilter, setAgendaSelesaiFilter] = useState({
        startDate: null,
        endDate: null
    });

    // setting agenda
    const [agendaSettings, setAgendaSettings] = useState({
        enableRotation: true,
        modes: [
            {
                id: 'kegiatan',
                name: 'Agenda Kegiatan',
                enabled: true,
                duration: 120,
                description: 'Menampilkan agenda kegiatan 3 hari ke depan',
                icon: 'pi-calendar',
                color: '#2196F3'
            },
            {
                id: 'hari_ini',
                name: 'Agenda Hari Ini',
                enabled: true,
                duration: 120,
                description: 'Menampilkan agenda kegiatan hari ini',
                icon: 'pi-bell',
                color: '#FF9800'
            },
            {
                id: 'selesai',
                name: 'Agenda Selesai',
                enabled: true,
                duration: 120,
                description: 'Menampilkan agenda yang sudah selesai',
                icon: 'pi-check-circle',
                color: '#4CAF50'
            }
        ],
        alarmBeforeMinutes: 30
    });

    const fetchAgendaSelesai = async () => {
        try {
            const res = await api.get(
                '/api/task/disposisi',
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const now = new Date();

            const parseTime = (timeRangeStr, baseDate, takeEnd = false) => {
                if (!timeRangeStr) return null;

                
                const d = new Date(timeRangeStr);
                if (!isNaN(d.getTime())) return d;

                // format jam
                try {
                    const parts = timeRangeStr.split("-");
                    const timeStr = takeEnd ? parts[1].trim() : parts[0].trim();
                    const [h, m] = timeStr.replace(".", ":").split(":");

                    const result = new Date(baseDate);
                    result.setHours(parseInt(h), parseInt(m), 0, 0);
                    return result;
                } catch {
                    return null;
                }
            };

            const selesai = res.data.filter(item => {
                if (!item.tanggal) return false;

                const now = new Date();
                const agendaDate = new Date(item.tanggal);
                agendaDate.setHours(0, 0, 0, 0);

                const today = new Date(now);
                today.setHours(0, 0, 0, 0);

                if (agendaDate < today) return true;

                if (agendaDate.getTime() === today.getTime()) {

                    let endTime = null;

                    if (
                        item.jam_selesai &&
                        item.jam_selesai !== "-" &&
                        item.jam_selesai.toLowerCase() !== "selesai"
                    ) {
                        const d = new Date(item.jam_selesai);
                        if (!isNaN(d.getTime())) {
                            endTime = d;
                        }
                    }

                    if (!endTime) {
                        endTime = new Date(item.tanggal);
                        endTime.setHours(23, 59, 59, 999);
                    }

                    return now > endTime;
                }

                return false;
            });

            setAgendaSelesaiList(selesai);
        } catch (err) {
            console.error('Gagal ambil agenda selesai', err);
        }
    };


    useEffect(() => {
        fetchAgendaSelesai();
    }, []);

    useEffect(() => {
        if (!agendaSelesaiFilter.startDate || !agendaSelesaiFilter.endDate) {
            setPreviewCount(0);
            return;
        }

        const start = new Date(agendaSelesaiFilter.startDate);
        const end = new Date(agendaSelesaiFilter.endDate);

        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);

        const total = agendaSelesaiList.filter(item => {
            if (!item.tanggal) return false;

            const tgl = new Date(item.tanggal);
            tgl.setHours(0, 0, 0, 0);

            return tgl >= start && tgl <= end;
        }).length;

        setPreviewCount(total);
    }, [agendaSelesaiFilter, agendaSelesaiList]);

    // fetch data agenda
    const fetchAgendaSelesaiFilter = async () => {
        try {
            const res = await api.get(
                '/api/media/get-duration',
            );

            if (!res.data?.agenda_selesai_start || !res.data?.agenda_selesai_end) return;

            setAgendaSelesaiFilter({
                startDate: new Date(res.data.agenda_selesai_start),
                endDate: new Date(res.data.agenda_selesai_end)
            });
        } catch (err) {
            console.error('Gagal ambil filter agenda selesai', err);
        }
    };

    // Media Handlers
    const handleAddMedia = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append("display_path", form.file);
        formData.append("duration", form.duration);
        // console.log(form.file);
        // console.log(form.duration);
        let response = await api.post(
            "/api/media/create-media",
            formData,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
        setMedia(prev => [...prev, response.data.display]);
        setShowMediaDialog(false);
    };

    const handleDeleteMedia = (id) => {
        Swal.fire({
            title: 'Apakah Yakin Dihapus?',
            text: "Tidak bisa akses data lagi!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Ya, Hapus!'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await api.delete(`/api/media/delete-media/${id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    Swal.fire(
                        'Deleted!',
                        'Data Media berhasil dihapus.',
                        'success'
                    );
                    setMedia((prev) => prev.filter((item) => item._id != id));
                } catch (error) {
                    Swal.fire(
                        'Error!',
                        'Gagal Mengahapus Media.',
                        'error'
                    );
                }
            }
        });
    };

    const handleChange = (field, value) => {
        setForm(prev => ({
            ...prev,
            [field]: value
        }));
    };


    const handleFileSelect = (e) => {
        const file = e.files[0];
        handleChange("file", file);
    };


    // simpan agenda setting
    const handleSaveAgendaSettings = async () => {
        const { startDate, endDate } = agendaSelesaiFilter;

        if (!startDate || !endDate) {
            Swal.fire({
                icon: 'warning',
                title: 'Tanggal belum lengkap',
                text: 'Pilih tanggal mulai dan tanggal akhir terlebih dahulu'
            });
            return;
        }

        
        const start = startDate.toISOString().split('T')[0];
        const end = endDate.toISOString().split('T')[0];

        try {
            await axios.post(
                'http://localhost:3000/api/media/create-duration',
                {
                    agenda_selesai_start: start,
                    agenda_selesai_end: end
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            Swal.fire({
                icon: 'success',
                title: 'Berhasil',
                text: 'Pengaturan agenda selesai berhasil disimpan'
            });

            fetchAgendaSelesaiFilter();
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Gagal menyimpan',
                text: 'Terjadi kesalahan saat menyimpan data'
            });
        }
    };

   
    useEffect(() => {
        fetchMedia();
        fetchAgendaSelesaiFilter();
    }, []);

    // Template Function
    const typeBodyTemplate = (rowData) => {
        const isImage = rowData.mimetype?.startsWith('image/');
        const isVideo = rowData.mimetype?.startsWith('video/');

        return (
            <Chip
                label={isImage ? 'Gambar' : 'Video'}
                icon={isImage ? 'pi pi-image' : 'pi pi-video'}
                style={{
                    backgroundColor: isImage ? '#E3F2FD' : '#FFF3E0',
                    color: isImage ? '#1976D2' : '#F57C00'
                }}
            />
        );
    };


    const durationBodyTemplate = (rowData) => {
        return (
            <span>
                <i className="pi pi-clock mr-2"></i>
                {rowData.duration} menit
            </span>
        );
    };



    const actionBodyTemplate = (rowData) => {
        // console.log(rowData._id);
        return (
            <div className="flex gap-2">
                <Button
                    icon="pi pi-trash"
                    className="p-button-sm p-button-danger p-button-text"
                    onClick={() => handleDeleteMedia(rowData._id)}
                    tooltip="Hapus"
                    tooltipOptions={{ position: 'top' }}
                />
            </div>
        );
    };

    const totalDuration = media.reduce((sum, item) => sum + item.duration, 0);
    const activeModes = agendaSettings.modes.filter(m => m.enabled);
    // const totalAgendaDuration = activeModes.reduce((sum, mode) => sum + mode.duration, 0);

    return (
        <Box sx={{ p: 3 }}>
            <MainCard title={
                <Typography variant="h3" component="div">
                    Kelola TV Display
                </Typography>
            }>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Kelola konten yang ditampilkan di layar TV
                </Typography>

                <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
                    {/* Kelola Media */}
                    <TabPanel header="Kelola Media" leftIcon="pi pi-image mr-2">
                        {/* Summary Cards */}
                        <Grid container spacing={2} sx={{ mb: 3 }}>
                            <Grid item xs={12} md={4}>
                                <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#e3f2fd' }}>
                                    <Typography variant="h6" color="text.secondary">
                                        <i className="pi pi-image mr-2"></i>
                                        Total Media
                                    </Typography>
                                    <Typography variant="h3" sx={{ mt: 1, color: '#1976D2' }}>
                                        {media.length}
                                    </Typography>
                                </Paper>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#e8f5e9' }}>
                                    <Typography variant="h6" color="text.secondary">
                                        <i className="pi pi-clock mr-2"></i>
                                        Total Durasi
                                    </Typography>
                                    <Typography variant="h3" sx={{ mt: 1, color: '#388E3C' }}>
                                        {totalDuration} Menit
                                    </Typography>
                                </Paper>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#f3e5f5' }}>
                                    <Typography variant="h6" color="text.secondary">
                                        <i className="pi pi-replay mr-2"></i>
                                        1 Siklus
                                    </Typography>
                                    <Typography variant="h3" sx={{ mt: 1, color: '#7B1FA2' }}>
                                        {Math.floor(totalDuration / 60)}:{(totalDuration % 60).toString().padStart(2, '0')}
                                    </Typography>
                                </Paper>
                            </Grid>
                        </Grid>

                        {/* Kelola Media Table */}
                        <Card>
                            <div className="flex justify-content-between align-items-center mb-3">
                                <h3 className="m-0">Daftar Media</h3>
                                <Button
                                    label="Tambah Media"
                                    icon="pi pi-plus"
                                    onClick={() => {
                                        setShowMediaDialog(true);
                                    }}
                                    className="p-button-success"
                                />
                            </div>

                            <DataTable
                                value={media}
                                paginator
                                rows={5}
                                dataKey="_id"
                                emptyMessage="Belum ada media yang ditambahkan"
                                stripedRows
                                showGridlines
                            >
                                <Column
                                    header="No"
                                    body={(data, options) => options.rowIndex + 1}
                                    style={{ width: '60px' }}
                                />
                                <Column field="filename" header="Nama File" />
                                <Column
                                    field="mimetype"
                                    header="Tipe"
                                    body={typeBodyTemplate}
                                    style={{ width: '150px' }}
                                />
                                <Column
                                    field="duration"
                                    header="Durasi"
                                    body={durationBodyTemplate}
                                    style={{ width: '150px' }}
                                />
                                <Column
                                    header="Action"
                                    body={actionBodyTemplate}
                                    style={{ width: '220px' }}
                                />
                            </DataTable>
                        </Card>
                    </TabPanel>

                    {/* Pengaturan agenda */}
                    <TabPanel header="Pengaturan Agenda" leftIcon="pi pi-calendar mr-2">

                        <Card className="mb-3">
                            <Typography variant="h4" sx={{ mb: 1 }}>
                                Filter Agenda Selesai untuk TV
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Tentukan agenda selesai yang akan ditampilkan di layar TV berdasarkan rentang tanggal
                            </Typography>
                        </Card>

                        <Card className="mb-3">
                            <div className="p-fluid grid">
                                <div className="field col-12 md:col-6">
                                    <label>Tanggal Mulai</label>
                                    <Calendar
                                        value={agendaSelesaiFilter.startDate}
                                        onChange={(e) => {
                                            const d = new Date(e.value);
                                            d.setHours(12, 0, 0, 0);
                                            setAgendaSelesaiFilter(prev => ({
                                                ...prev,
                                                startDate: d
                                            }));
                                        }}
                                        dateFormat="dd/mm/yy"
                                        showIcon
                                        placeholder="Pilih tanggal mulai"
                                    />

                                </div>

                                <div className="field col-12 md:col-6">
                                    <label>Tanggal Akhir</label>
                                    <Calendar
                                        value={agendaSelesaiFilter.endDate}
                                        onChange={(e) => {
                                            const d = new Date(e.value);
                                            d.setHours(12, 0, 0, 0);
                                            setAgendaSelesaiFilter(prev => ({
                                                ...prev,
                                                endDate: d
                                            }));
                                        }}
                                        dateFormat="dd/mm/yy"
                                        showIcon
                                        minDate={agendaSelesaiFilter.startDate}
                                        placeholder="Pilih tanggal akhir"
                                    />
                                </div>
                                <small className="text-secondary"> * Hanya agenda selesai dalam rentang ini yang akan ditampilkan di TV </small>
                            </div>


                        </Card>

                        <Card className="mb-3" style={{ background: '#f0fdf4', border: '1px solid #86efac' }}>
                            <div className="flex align-items-center justify-content-between">
                                <div>
                                    <Typography variant="h3" sx={{ color: '#42a267ff' }}>
                                        Preview Agenda Selesai
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Jumlah agenda selesai yang akan ditampilkan di TV
                                    </Typography>

                                    {previewCount === 0 && (
                                        <small style={{ color: 'red' }}>
                                            ⚠ Tidak ada agenda selesai dalam rentang tanggal ini
                                        </small>
                                    )}
                                </div>

                                <div style={{ textAlign: 'center' }}>
                                    <Typography variant="h2" sx={{ color: '#16a34a', fontWeight: 'bold' }}>
                                        {previewCount}
                                    </Typography>
                                    <small>Agenda</small>
                                </div>
                            </div>
                        </Card>


                        <Button
                            label="Simpan Pengaturan"
                            icon="pi pi-save"
                            className="p-button-success p-button-lg"
                            onClick={handleSaveAgendaSettings}
                        />
                    </TabPanel>

                </TabView>
            </MainCard>

            {/* Dialog atau Pop Up Tambah Media */}
            <Dialog
                header='Tambah Media Baru'
                visible={showMediaDialog}
                style={{ width: '500px' }}
                onHide={() => {
                    setShowMediaDialog(false);
                }}
                footer={
                    <div>
                        <Button
                            label="Batal"
                            icon="pi pi-times"
                            onClick={() => {
                                setShowMediaDialog(false);
                            }}
                            className="p-button-text"
                        />
                        <Button
                            label='Tambah'
                            icon="pi pi-check"
                            onClick={handleAddMedia}
                        />
                    </div>
                }
            >
                <div className="p-fluid">
                    <div className="field">
                        <label htmlFor="duration">Durasi Tampilan (menit)</label>
                        <InputNumber
                            id="duration"
                            value={form.duration}
                            onChange={(e) => handleChange("duration", e.value)}
                            min={1}
                            placeholder="Contoh: 10"
                        />
                        <small className="text-secondary">Berapa lama media ini akan ditampilkan</small>
                    </div>


                    <div className="field">
                        <label>Upload File</label>
                        <FileUpload
                            mode="basic"
                            accept="image/*,video/*"
                            maxFileSize={50000000}
                            chooseLabel="Pilih File"
                            onSelect={(e) => handleFileSelect(e)}
                            auto={false}
                        />
                        <small className="text-secondary">Maksimal ukuran file: 50MB</small>
                    </div>
                </div>
            </Dialog>
            {/* End Dialog Tambah Media */}
        </Box>
    );
}