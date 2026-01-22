// project imports
import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import MainCard from 'ui-component/cards/MainCard';
import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import Swal from 'sweetalert2';
import api from '../../api/axios';

export default function Disposisi() {
    const token = localStorage.getItem('token');
    const [pegawaisel, setPegawai] = useState([]);
    const [editMode, setEditMode] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [selectedData, setSelectedData] = useState(null);
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: ""
    });

    const [selectedRole, setSelectedRole] = useState("");
    const [errors, setErrors] = useState({});

    const roleOptions = [
        { label: 'Admin', value: 'admin' },
        { label: 'Pegawai', value: 'pegawai' },
    ];

    const handleChange = (field, value) => {
        setForm(prev => ({
            ...prev,
            [field]: value
        }));

        // Clear error when user types
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ""
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!form.name) newErrors.name = "Name is required";
        if (!form.email) newErrors.email = "Email is required";
        if (!form.password) newErrors.password = "Password is required";
        if (selectedRole.length === 0) newErrors.role = "Role is required";

        return newErrors;
    };


    // get data pegawai
    const fetchPegawai = async () => {
        try {
            const res = await api.get('/api/auth/getAll', {
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

    useEffect(() => {
        fetchPegawai();
    }, []);


    // handle submit form
    const handleSubmit = async (e) => {
        e.preventDefault();

        const validation = validateForm();
        setErrors(validation);

        if (Object.keys(validation).length > 0) {
            return;
        }

        try {
            let res;
            if (editMode && selectedData?._id) {
                res = await api.patch(`/api/auth/update/user/${selectedData._id}`, {
                    name: form.name,
                    email: form.email,
                    password: form.password,
                    role: selectedRole,
                }, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setShowForm(false);
                setPegawai(prev =>
                    prev.map(item =>
                        item._id === selectedData._id ? res.data : item
                    )
                );
                setForm({ name: "", email: "", password: "" });
                setSelectedRole("");

                Swal.fire({
                    title: 'Success!',
                    text: 'Data User Berhasil Diubah',
                    icon: 'success',
                    confirmButtonText: 'OK'
                });

            } else {
                res = await api.post('/api/auth/register', {
                    name: form.name,
                    email: form.email,
                    password: form.password,
                    role: selectedRole,
                }, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setShowForm(false);
                fetchPegawai();
                setForm({ name: "", email: "", password: "" });
                setSelectedRole("");

                Swal.fire({
                    title: 'Success!',
                    text: 'User berhasil ditambahkan',
                    icon: 'success',
                    confirmButtonText: 'OK'
                });

            }

        } catch (error) {
            console.error("Error:", error);
            console.error("Error response:", error.response?.data);

            if (error.response) {
                Swal.fire({
                    title: 'Error!',
                    text: error.response.data.msg || 'Something went wrong',
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
            } else {
                Swal.fire({
                    title: 'Error!',
                    text: 'Network error. Please try again.',
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
            }
        }
    };



    // handle delete button
    const handleDelete = async (id) => {

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
                    await api.delete(`/api/auth/delete/user/${id}`);
                    Swal.fire(
                        'Deleted!',
                        'User berhasil dihapus.',
                        'success'
                    );
                    fetchPegawai();
                } catch (error) {
                    Swal.fire(
                        'Error!',
                        'Gagal Mengahapus User.',
                        'error'
                    );
                }
            }
        });

    };

    // action view, edit, and delete
    const actionBodyTemplate = (rowData) => {
        return (
            <div className="flex gap-2">

                {/* VIEW */}
                {/* <Button
                    icon="pi pi-eye"
                    className="p-button-rounded p-button-info p-button-sm"
                    onClick={() => {
                        setSelectedData(rowData);
                        setShowView(true);
                    }}
                /> */}

                {/* EDIT */}
                <Button
                    icon="pi pi-pencil"
                    className="p-button-rounded p-button-warning p-button-sm"
                    onClick={() => {
                        setForm({
                            ...rowData,
                            name: rowData.name || "",
                            email: rowData.email || "",
                            password: rowData.password || "",
                        });

                        setSelectedData(rowData);
                        setSelectedRole(Array.isArray(rowData.role) ? rowData.role[0] : rowData.role);
                        setEditMode(true);
                        setShowForm(true);
                    }}
                />

                {/* DELETE */}
                <Button
                    icon="pi pi-trash"
                    className="p-button-rounded p-button-danger p-button-sm"
                    onClick={() => handleDelete(rowData._id)}
                />
            </div>
        );
    };

    const footer = (
        <Button label="Submit" className="w-full" onClick={handleSubmit} />
    );

    return (
        <div className="card">
            <MainCard title="Kelola Akun">
                <div className="flex justify-content-end mb-3">
                    <Button
                        label="Buat User"
                        onClick={() => {
                            setShowForm(true);
                            setEditMode(false);
                            setErrors({});

                            setForm({
                                name: "",
                                email: "",
                                password: ""
                            });

                            setSelectedRole("");
                        }}
                    />
                </div>

                {/* FORM */}
                <Dialog
                    header={editMode ? "Edit User" : "Form User"}
                    visible={showForm}
                    modal
                    style={{ width: "30rem" }}
                    onHide={() => setShowForm(false)}
                    footer={footer}
                >

                    {/* Nama */}
                    <div className="mb-3">
                        <InputText
                            placeholder="Nama *"
                            className={`w-full ${errors.name ? "p-invalid" : ""}`}
                            value={form.name}
                            onChange={(e) => handleChange("name", e.target.value)}
                        />
                        {errors.name && <small className="p-error">{errors.name}</small>}
                    </div>

                    {/* Email */}
                    <div className="mb-3">
                        <InputText
                            placeholder="Email *"
                            className={`w-full ${errors.email ? "p-invalid" : ""}`}
                            value={form.email}
                            onChange={(e) => handleChange("email", e.target.value)}
                        />
                        {errors.email && <small className="p-error">{errors.email}</small>}
                    </div>

                    {/* Passeord */}
                    <div className="mb-3">
                        <InputText
                            type='password'
                            placeholder="Password *"
                            className={`w-full ${errors.password ? "p-invalid" : ""}`}
                            value={form.password}
                            onChange={(e) => handleChange("password", e.target.value)}
                        />
                        {errors.password && <small className="p-error">{errors.password}</small>}
                    </div>

                    {/* Role */}
                    <div className="mb-3">
                        <Dropdown
                            placeholder="Pilih Role *"
                            className={`w-full ${errors.role ? "p-invalid" : ""}`}
                            value={selectedRole}
                            options={roleOptions}
                            onChange={(e) => {
                                setSelectedRole(e.value);
                                if (errors.role) {
                                    setErrors(prev => ({ ...prev, role: "" }));
                                }
                            }}
                        />
                        {errors.role && <small className="p-error">{errors.role}</small>}
                    </div>


                </Dialog>

                {/* TABLE */}
                <DataTable
                    value={pegawaisel}
                    paginator rows={5}
                    loading={loading}
                    dataKey="_id"
                >
                    <Column field="name" header="Nama" bodyClassName="text-center" style={{ minWidth: '5rem' }} headerStyle={{ textAlign: "center", justifyContent: "center", display: "flex" }} />
                    <Column field="email" header="Email" style={{ minWidth: '10rem' }} />
                    <Column field="role" header="Role" style={{ minWidth: '10rem' }} />
                    {/*  Action */}
                    <Column header="Action" body={actionBodyTemplate} headerStyle={{ textAlign: "center", justifyContent: "center", display: "flex" }} style={{ width: "10rem" }} />
                </DataTable>

            </MainCard>
        </div>
    );
}