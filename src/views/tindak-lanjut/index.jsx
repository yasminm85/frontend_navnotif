// 03feb2026
import MainCard from 'ui-component/cards/MainCard';
import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { MultiSelect } from 'primereact/multiselect';
import { Divider } from 'primereact/divider';
import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import './app.css';
import Swal from 'sweetalert2';
import api from '../../api/axios';


export default function TindakLanjut() {
    const token = localStorage.getItem('token');
    const [loading, setLoading] = useState(true);
    const [pegawaisel, setPegawai] = useState([]);
    const [selectedpegawai, setSelectedpegawai] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [showArahan, setShowArahan] = useState([]);
    const [errors, setErrors] = useState({});
    const [form, setForm] = useState({

        personilyangdituju: "",
        judulArahan: "",
        isiArahan: "",
        file: null,
    });
    const validateForm = () => {
        let newErrors = {};
        if (!selectedpegawai || selectedpegawai.length === 0)
            newErrors.namayangdituju = "Personil wajib dipilih";
        if (!form.judulArahan)
            newErrors.judulArahan = "Judul arahan wajib diisi";
        if (!form.isiArahan)
            newErrors.isiArahan = "Isi arahan wajib diisi";
        return newErrors;
    };

    // get data pegawai
    const fetchPegawai = async () => {
        try {
            const res = await api.get('/api/auth/getEmp', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setPegawai(res.data);
        } catch (err) {
            console.error('Gagal ambil data pegawai:', err);
        } finally {
            setLoading(false);
        }
    };

    //get all data tindak lanjut
    const getTindakLanjut = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/tindaklanjut/get-tindaklanjut', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setShowArahan(response.data);
        } catch (error) {
            console.error("Error mengambil data tindak lanjut", error)
        }
        setLoading(false)

    };



    useEffect(() => {
        fetchPegawai();
        getTindakLanjut();
    }, []);

    const handleChange = (field, value) => {

        setForm({ ...form, [field]: value });
        setErrors({ ...errors, [field]: "" });
    };

    const handleFileChange = (field, e) => {
        const file = e.target.files[0];
        if (file && file.type !== "application/pdf") {
            Swal.fire("Error", "File harus PDF", "error");
            return;
        }
        setForm(prev => ({ ...prev, [field]: file }));
    };

    // handle submit form
    const handleSubmit = async (e) => {
        e.preventDefault();

        const validation = validateForm();
        setErrors(validation);
        if (Object.keys(validation).length > 0) return;

        const pegawaiIds = selectedpegawai.map((p) => p._id);
        const formData = new FormData();
        console.log(pegawaiIds);

        formData.append("personil_yang_dituju", JSON.stringify(pegawaiIds));
        formData.append("judul_arahan", form.judulArahan);
        formData.append("isi_arahan", form.isiArahan);

        if (form.file) formData.append("file_arahan", form.file);

        try {
            let response;
            response = await api.post(
                '/api/tindaklanjut/create-tindaklanjut',
                formData,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            setShowArahan(prev => [...prev, response.data]);


            setShowForm(false);
            setForm({
                personilyangdituju: "",
                judulArahan: "",
                isiArahan: "",
                file: null,

            });
            setSelectedpegawai([]);
            setErrors({});

        } catch (error) {
            console.error("Error disposisi:", error.response?.data || error.message);
        }
    };

    const nomorBodyTemplate = (rowData, options) => {
        return options.rowIndex + 1;
    };

    const personilBodyTemplate = (rowData) => {
        if (!rowData.personil_yang_dituju || rowData.personil_yang_dituju.length === 0) {
            return <span>-</span>;
        }

        if (typeof rowData.personil_yang_dituju[0] === "object") {
            return rowData.personil_yang_dituju.map(p => p.name).join(", ");
        }

        const names = pegawaisel
            .filter(p => rowData.personil_yang_dituju.includes(p._id))
            .map(p => p.name);

        return names.join(", ");
    };

    const arahanBodyTemplate = (rowData) => {
        return (
            <span className="font-medium">
                {rowData.judul_arahan || "-"}
            </span>
        );
    };

    const tindakLanjutBodyTemplate = (rowData) => {
        return (
            <span className="text-600">
                {rowData.judul_tindaklanjut || "-"}
            </span>
        );
    };

    

    return (
        <>
            <div className="card h-full">
                <MainCard title="Tindak Lanjut" className="h-full">
                    <div className="flex justify-content-between align-items-center mb-3">
                        <span className="text-lg font-semibold">
                            Daftar Tindak Lanjut
                        </span>

                        <Button
                            label="Buat Tindak Lanjut"
                            icon="pi pi-plus"
                            className="p-button-primary"
                            onClick={() => {
                                setErrors({});
                                setForm({
                                    judulArahan: "",
                                    isiArahan: "",
                                    file: null,
                                });
                                setSelectedpegawai([]);
                                setShowForm(true);
                            }}
                        />
                    </div>

                    <div style={{ minHeight: "400px" }}>
                        <DataTable
                            value={showArahan}
                            paginator
                            rows={10}
                            loading={loading}
                            dataKey="_id"
                            responsiveLayout="scroll"
                            stripedRows
                            showGridlines
                            className="h-full border-round-lg"
                            emptyMessage={
                                <div className="empty-center">
                                    <span className="font-medium">
                                        Belum ada arahan
                                    </span>
                                </div>
                            }
                        >
                            <Column header="No" body={nomorBodyTemplate} style={{ width: "4rem" }} />
                            <Column header="Personil yang Dituju" body={personilBodyTemplate} />
                            <Column header="Arahan" body={arahanBodyTemplate} />
                            <Column header="Tindak Lanjut" body={tindakLanjutBodyTemplate} />
                        </DataTable>
                    </div>
                </MainCard>
            </div>

            <Dialog
                visible={showForm}
                modal
                className="detail-dialog"
                style={{ width: "52rem" }}
                appendTo={document.body}
                onHide={() => setShowForm(false)}
                header={
                    <div className="dialog-header">
                        <i className="pi pi-clipboard mr-2" />
                        Buat Tindak Lanjut
                    </div>
                }
            >


                <div className="p-fluid">

                    <div className="mb-4">
                        <label className="font-medium mb-2 block">
                            Personil yang dituju <span className="text-red-500">*</span>
                        </label>
                        <MultiSelect
                            value={selectedpegawai}
                            options={pegawaisel}
                            optionLabel="name"
                            display="chip"
                            placeholder="Pilih personil"
                            className="w-full"
                            onChange={(e) => setSelectedpegawai(e.value)}
                        />
                        {errors.personilyangdituju && (
                            <small className="p-error">{errors.personilyangdituju}</small>
                        )}
                    </div>

                    <Divider />

                    <div className="mb-3">
                        <label className="font-medium mb-2 block">
                            Judul Arahan <span className="text-red-500">*</span>
                        </label>
                        <InputText
                            value={form.judulArahan || ''}
                            onChange={(e) => handleChange("judulArahan", e.target.value)}
                            placeholder="Contoh: Tindak lanjut laporan"
                        />
                        {errors.judulArahan && (
                            <small className="p-error">{errors.judulArahan}</small>
                        )}
                    </div>

                    <div className="mb-3">
                        <label className="font-medium mb-2 block">
                            Isi Arahan <span className="text-red-500">*</span>
                        </label>
                        <InputTextarea
                            rows={6}
                            autoResize
                            value={form.isiArahan || ''}
                            onChange={(e) => handleChange("isiArahan", e.target.value)}
                            placeholder="Tuliskan arahan secara jelas..."
                        />
                        {errors.isiArahan && (
                            <small className="p-error">{errors.isiArahan}</small>
                        )}
                    </div>

                    <Divider />

                    <div className="grid">
                        <div className="col-12 md:col-6">
                            <input type="file" accept="application/pdf" onChange={(e) => handleFileChange("file", e)} />
                        </div>
                    </div>

                    <Button
                        label="Submit"
                        className="w-full mt-4"
                        onClick={handleSubmit}
                    />
                </div>
            </Dialog>
        </>
    );

}

// 03feb2026
