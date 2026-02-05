import MainCard from 'ui-component/cards/MainCard';
import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Divider } from 'primereact/divider';

import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import './app.css';
import api from '../../api/axios';

export default function DashboardTindakLanjutEVP() {
    const token = localStorage.getItem('token');
    const [showArahan, setShowArahan] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filename, setFilename] = useState('');
    const [filenametinjut, setFilenameTinjut] = useState('');
    const [selected, setSelected] = useState(null);
    const [showDetail, setShowDetail] = useState(false);
    const [showLegend, setShowLegend] = useState(true);

    const rowClassName = (row) => ({
        'row-done': row.isTindakLanjut == true,
        'row-pending': row.isTindakLanjut == false
    });


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
        getTindakLanjut();
    }, []);

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

    const handleOpenFileArahan = async () => {
        console.log(selected)
        try {
            const res = await api.get(
                `/api/tindaklanjut/file_tindak/${selected.file_arahan}`,
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

    const handleOpenFileTindakLanjut = async () => {
        console.log(selected)
        try {
            const res = await api.get(
                `/api/tindaklanjut/file_tindak/${selected.file_tindaklanjut}`,
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
            const response = await axios.get(`http://localhost:3000/api/tindaklanjut/file_meta/${selected.file_arahan}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setFilename(response.data.filename);
        } catch (error) {
            console.error("Error mengambil filename", error)
        }
    };

    const getFileNameTinjut = async () => {
        try {
            const response = await axios.get(`http://localhost:3000/api/tindaklanjut/file_meta/${selected.file_tindaklanjut}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setFilenameTinjut(response.data.filename);
        } catch (error) {
            console.error("Error mengambil filename", error)
        }
    };


    useEffect(() => {
        if (selected?.file_arahan) {
            getFileName(selected.file_arahan);
        } else if (selected?.file_tindaklanjut) {
            getFileNameTinjut(selected.file_tindaklanjut);
        }
    }, [selected?.file_arahan, selected?.file_tindaklanjut]);


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
        <div className="card h-full">
            <MainCard title="Dashboard Tindak Lanjut EVP"
                className="h-full flex flex-column"
            >
                <div className="flex justify-content-between align-items-center mb-2">
                    <span className="text-sm text-600 font-medium">
                        Status Tindak Lanjut
                    </span>

                    <Button
                        label={showLegend ? 'Sembunyikan' : 'Tampilkan'}
                        icon={showLegend ? 'pi pi-chevron-up' : 'pi pi-chevron-down'}
                        className="p-button-text p-button-sm"
                        onClick={() => setShowLegend(!showLegend)}
                    />
                </div>

                {showLegend && (
                    <div className="flex justify-content-end mb-2 gap-3 text-sm text-600">
                        <div className="flex align-items-center gap-2">
                            <span className="status-dot status-done"></span>
                            <span>Sudah ada tindak lanjut</span>
                        </div>

                        <div className="flex align-items-center gap-2">
                            <span className="status-dot status-pending"></span>
                            <span>Belum ada tindak lanjut</span>
                        </div>
                    </div>
                )}

                <div className="flex-1 overflow-hidden">
                    <DataTable
                        value={showArahan}
                        paginator
                        rows={5}
                        stripedRows
                        rowHover
                        rowClassName={rowClassName}
                        onRowClick={(e) => {
                            setSelected(e.data);
                            setShowDetail(true);
                        }}
                        scrollable
                        scrollHeight="flex"
                        emptyMessage="Belum ada tindak lanjut"
                    >

                        <Column
                            header="No"
                            body={(_, opt) => opt.rowIndex + 1}
                            style={{ width: '4rem' }}
                        />

                        <Column
                            header="Personil yang Ditugaskan"
                            body={personilBodyTemplate}
                            style={{ minWidth: '18rem' }}
                        />

                        <Column
                            header="Arahan"
                            field="judul_arahan"
                            style={{ minWidth: '22rem' }}
                        />

                        <Column
                            header="Judul Tindak Lanjut"
                            body={(row) =>
                                row.judul_tindaklanjut ? (
                                    <span className="judul-tindak-lanjut">
                                        {row.judul_tindaklanjut}
                                    </span>
                                ) : null
                            }
                            style={{ minWidth: '18rem' }}
                        />
                    </DataTable>
                </div>

                <Dialog
                    visible={showDetail}
                    modal
                    className="detail-dialog"
                    onHide={() => setShowDetail(false)}
                    header={
                        <div className="dialog-header">
                            <i className="pi pi-clipboard mr-2" />
                            Detail Tindak Lanjut
                        </div>
                    }
                >
                    {selected && (
                        <div className="detail-wrapper">

                            <div className="detail-section personil">
                                <div className="detail-card-title">
                                    <i className="pi pi-users mr-2" />
                                    Personil
                                </div>
                                <div className="detail-card-content">
                                    {Array.isArray(selected.personil_yang_dituju)
                                        ? selected.personil_yang_dituju.map((u) => u.name).join(", ")
                                        : "-"}
                                </div>
                            </div>

                            <div className="detail-section arahan">
                                <div className="detail-card-title">
                                    <i className="pi pi-directions mr-2" />
                                    Arahan EVP
                                </div>
                                <div className="detail-card-content">
                                    {selected.isi_arahan}
                                </div>
                            </div>

                            <div className="detail-section dokumen">
                                <div className="detail-card-title">
                                    <i className="pi pi-file mr-2" />
                                    
                                </div>

                                {selected.file_arahan ? (
                                    <div
                                        className="file-card"
                                        onClick={handleOpenFileArahan}
                                    >
                                        <i className="pi pi-file-pdf file-icon" />
                                        <div className="file-info">
                                            <span className="file-name">
                                                {filename}
                                            </span>
                                            <span className="file-action">
                                                Klik untuk membuka dokumen
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="detail-empty">
                                        Tidak ada dokumen arahan
                                    </div>
                                )}
                            </div>


                            <div className="detail-section tinjut">
                                <div className="detail-card-title">
                                    <i className="pi pi-check-circle mr-2" />
                                    Tindak Lanjut Pegawai
                                </div>

                                {selected.judul_tindaklanjut ? (
                                    <>
                                        <div className="tindaklanjut-title">
                                            {selected.judul_tindaklanjut}
                                        </div>

                                        {selected.isi_tindaklanjut ? (
                                            <div className="detail-card-content pre-line">
                                                {htmlToPlainText(selected.isi_tindaklanjut)}
                                            </div>
                                        ) : (
                                            <div className="detail-empty">
                                                Tidak ada keterangan tertulis
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="detail-empty">
                                        Belum ada tindak lanjut dari pegawai
                                    </div>
                                )}
                            </div>


                            {selected.file_tindaklanjut && (
                                <div className="detail-section dokumen tinjut">
                                    <div className="detail-card-title">
                                        <i className="pi pi-paperclip mr-2" />
                                        Dokumen Tindak Lanjut
                                    </div>

                                    {selected.file_tindaklanjut ? (
                                        <div
                                            className="file-card"
                                            onClick={handleOpenFileTindakLanjut}
                                        >
                                            <i className="pi pi-file-pdf file-icon" />
                                            <div className="file-info">
                                                <span className="file-name">
                                                    {filenametinjut}
                                                </span>
                                                <span className="file-action">
                                                    Klik untuk membuka
                                                </span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="detail-empty">
                                            Tidak ada dokumen tindak lanjut
                                        </div>
                                    )}
                                </div>

                            )}
                        </div>
                    )}
                </Dialog>


            </MainCard>
        </div>
    );
}
