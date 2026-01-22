import React, { useEffect, useState, useRef, useCallback } from 'react';
import Grid from '@mui/material/Grid2';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import TotalNotifikasi from './TotalNotifikasi';
import TotalSelesai from './TotalSelesai';
import { gridSpacing } from 'store/constant';
import api from '../../../api/axios';

function NotifToast({ message, onOke }) {
  return (
    <div>
      <p className="mb-2">{message}</p>
      <button
        onClick={onOke}
        style={{
          padding: '5px 12px',
          background: '#4caf50',
          border: 'none',
          color: 'white',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Oke
      </button>
    </div>
  );
}

function usePolling(fn, delay, enabled = true) {
  const fnRef = useRef(fn);
  useEffect(() => {
    fnRef.current = fn;
  }, [fn]);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    const run = async () => {
      try {
        await fnRef.current();
      } catch (e) {
        console.error('Polling error:', e);
      }
    };

    run();

    const id = setInterval(() => {
      if (!cancelled) run();
    }, delay);

    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [delay, enabled]);
}

export default function DashboardPegawai() {
  const token = localStorage.getItem('token');

  const [notifications, setNotifications] = useState([]);
  const [countActive, setCountActive] = useState(0);
  const [countDone, setCountDone] = useState(0);

  const toastIdByNotifId = useRef(new Map());
  const shownToastIds = useRef(new Set());
  const shownReminderIds = useRef(new Set());

  const fetchNotifications = useCallback(async () => {
    if (!token) return;

    const res = await api.get('/api/notif/notification/my', {
      headers: { Authorization: `Bearer ${token}` }
    });

    const onCreate = Array.isArray(res.data?.notifications) ? res.data.notifications : [];
    const reminders = Array.isArray(res.data?.reminders) ? res.data.reminders : [];

    setNotifications([...onCreate, ...reminders]);

    setCountActive(res.data?.countActive || 0);
    setCountDone(res.data?.countDone || 0);
  }, [token]);

  usePolling(fetchNotifications, 3000, !!token);

  const handleOke = useCallback(
    async (notifId) => {
      const target = notifications.find((n) => n._id === notifId);
      if (!target) return;

      setNotifications((prev) => prev.map((n) => (n._id === notifId ? { ...n, isDone: true } : n)));

      if (target.notifType === 'ON_CREATE') {
        setCountActive((prev) => Math.max(0, prev - 1));
        setCountDone((prev) => prev + 1);
      }

      const toastId = toastIdByNotifId.current?.get(notifId);
      if (toastId) toast.dismiss(toastId);

      try {
        const res = await api.patch(
          `/api/notif/notifications/done/${notifId}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const updatedNotif = res.data?.notification;
        if (updatedNotif?._id) {
          setNotifications((prev) => prev.map((n) => (n._id === updatedNotif._id ? updatedNotif : n)));
        }
      } catch (err) {
        console.error('Error update notif:', err.response?.data || err.message);

        // rollback
        setNotifications((prev) => prev.map((n) => (n._id === notifId ? target : n)));

        if (target.notifType === 'ON_CREATE') {
          setCountActive((prev) => prev + 1);
          setCountDone((prev) => Math.max(0, prev - 1));
        }

        toast.error('Gagal menandai notifikasi');
      }
    },
    [notifications, token]
  );

  const formDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  const formTime = (date) => {
        console.log(date);
        if (!date) return "Selesai";

        return new Date(date).toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

  useEffect(() => {
    if (!Array.isArray(notifications)) return;

    notifications
      .filter((n) => !n.isDone && n.notifType === 'ON_CREATE')
      .forEach((n) => {
        if (shownToastIds.current.has(n._id)) return;
        shownToastIds.current.add(n._id);

        const kegiatan = n.disposisi?.nama_kegiatan || 'Disposisi';
        const tanggal = n.disposisi?.tanggal || 'Tanggal';
        const jamMulai = n.disposisi?.jam_mulai || 'Jam Mulai';
        const jamSelesai = n.disposisi?.jam_selesai;
        const toastId = toast.info(
          <NotifToast
            message={
              <>
                <div>Disposisi baru: {kegiatan}</div>
                <div>Tanggal: {formDate(tanggal)}</div>
                <div>Jam: {formTime(jamMulai)} - {formTime(jamSelesai)}</div>
              </>
            }
            onOke={() => handleOke(n._id)}
          />
          ,
          { autoClose: false }
        );

        toastIdByNotifId.current.set(n._id, toastId);
      });

    notifications
      .filter((n) => !n.isDone && ['REMINDER_1H', 'REMINDER_30M'].includes(n.notifType))
      .forEach((n) => {
        if (shownReminderIds.current.has(n._id)) return;
        shownReminderIds.current.add(n._id);

        const kegiatan = n.disposisi?.nama_kegiatan || 'Kegiatan';
        const label =
          n.notifType === 'REMINDER_1H'
            ? '1 jam'
            : n.notifType === 'REMINDER_30M'
              ? '30 menit'
              : '2 menit';

        const toastId = toast.info(
          <NotifToast message={`Reminder: ${kegiatan} dimulai ${label} lagi`} onOke={() => handleOke(n._id)} />,
          { autoClose: false }
        );

        toastIdByNotifId.current.set(n._id, toastId);
      });
  }, [notifications, handleOke]);

  return (
    <Grid container spacing={gridSpacing}>
      <ToastContainer position="top-right" />

      <Grid size={12}>
        <Grid container spacing={gridSpacing}>
          <Grid size={{ lg: 6, md: 6, sm: 6, xs: 12 }}>
            <TotalNotifikasi count={countActive} />
          </Grid>
          <Grid size={{ lg: 6, md: 6, sm: 6, xs: 12 }}>
            <TotalSelesai count={countDone} />
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}
