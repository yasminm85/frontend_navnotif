import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import MainCard from 'ui-component/cards/MainCard';
import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import './appDisplay.css';
import alarmSound from './alarm-sound.mp3';
import logo from '../../assets/images/image.png';
import api from '../../api/axios';
import Pusher from 'pusher-js';

const pusher = new Pusher(import.meta.env.VITE_PUSHER_KEY, {
  cluster: import.meta.env.VITE_PUSHER_CLUSTER,
});

export default function KelolaDisplay() {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const playedRemindersRef = useRef([]);
  const [loading, setLoading] = useState(true);
  const [showDisposisi, setShowDisposisi] = useState([]);
  const [pageTitle, setPageTitle] = useState('AGENDA KEGIATAN');

  const rows = 5;
  const scrollSpeed = 3000;
  const MODE = {
    TODAY: 'TODAY',
    KEGIATAN: 'KEGIATAN',
    SELESAI: 'SELESAI',
    MEDIA: 'MEDIA'
  };

  const [mode, setMode] = useState(MODE.KEGIATAN);
  const [agendaKegiatan, setAgendaKegiatan] = useState([]);
  const [agendaSelesai, setAgendaSelesai] = useState([]);
  const [hasActiveReminder, setHasActiveReminder] = useState(false);
  const [agendaSelesaiFilter, setAgendaSelesaiFilter] = useState({
    startDate: null,
    endDate: null
  });
  const [mediaList, setMediaList] = useState([]);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const mediaTimerRef = useRef(null);
  const mediaListLengthRef = useRef(0);
  const [orientation, setOrientation] = useState('landscape');
  const [panMode, setPanMode] = useState('pan-right-zoom-in');

  const getMediaType = (mimetype) => {
    if (!mimetype) return 'unknown';
    if (mimetype.startsWith('image/')) return 'image';
    if (mimetype.startsWith('video/')) return 'video';
    return 'unknown';
  };

  const goToNextMedia = () => {
    if (mediaTimerRef.current) {
      clearTimeout(mediaTimerRef.current);
      mediaTimerRef.current = null;
    }

    setIsTransitioning(true);

    setTimeout(() => {
      setCurrentMediaIndex((prev) => {
        const nextIndex = prev + 1;
        if (nextIndex < mediaList.length) {
          return nextIndex;
        } else {
          setTimeout(() => setMode(MODE.KEGIATAN), 100);
          return 0;
        }
      });

      setIsTransitioning(false);
    }, 800);
  };

  const detectOrientation = (e) => {
    const img = e.target;
    const next = img.naturalWidth > img.naturalHeight ? 'landscape' : 'portrait';

    setOrientation((prev) => (prev === next ? prev : next));
  };

  useEffect(() => {
    setPanMode((prev) => (prev === 'pan-right-zoom-in' ? 'pan-left-zoom-out' : 'pan-right-zoom-in'));
  }, [currentMediaIndex]);

  const checkReminderActive = (items) => {
    const now = new Date();
    const activeReminders = [];

    items.forEach((item) => {
      const start = new Date(item.jam_mulai);
      if (isNaN(start.getTime())) return;

      const reminderStart = new Date(start);
      reminderStart.setMinutes(reminderStart.getMinutes() - 30);

      const reminderEnd = new Date(start);
      reminderEnd.setMinutes(reminderEnd.getMinutes() - 25);

      if (now >= reminderStart && now < reminderEnd) {
        activeReminders.push(item);
      }
    });

    return activeReminders;
  };

  const filterValidItems = (data) => {
    const now = new Date();

    return data.map((item) => {
      if (!item.tanggal) return { ...item, isSelesai: false };

      const agendaDate = new Date(item.tanggal);
      agendaDate.setHours(0, 0, 0, 0);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (agendaDate < today) {
        return { ...item, isSelesai: true };
      }

      if (agendaDate.getTime() === today.getTime()) {
        const endOfDay = new Date(agendaDate);
        endOfDay.setHours(23, 59, 59, 999);

        let endTime = null;

        if (item.jam_selesai && item.jam_selesai !== '-' && item.jam_selesai.toLowerCase() !== 'selesai') {
          const d = new Date(item.jam_selesai);
          if (!isNaN(d.getTime())) {
            endTime = d;
          }
        }

        const finalEndTime = endTime ?? endOfDay;

        const isSelesai = now > finalEndTime;

        return { ...item, isSelesai };
      }

      return { ...item, isSelesai: false };
    });
  };

  const isOngoing = (item) => {
    if (!item.tanggal || !item.jam_mulai) return false;
    const now = new Date();

    const getValidDate = (val, baseDate, takeFirst = true) => {
      if (!val || val === '-' || val.toLowerCase() === 'selesai') return null;
      const d = new Date(val);
      if (!isNaN(d.getTime())) return d;

      try {
        const partsStr = val.split('-');
        const timePart = takeFirst ? partsStr[0].trim() : partsStr[partsStr.length - 1].trim();
        const parts = timePart.replace(/\./g, ':').split(':');
        const finalDate = new Date(baseDate);
        finalDate.setHours(parseInt(parts[0]), parseInt(parts[1]), 0, 0);
        return finalDate;
      } catch (e) {
        return null;
      }
    };

    const start = getValidDate(item.jam_mulai, item.tanggal, true);

    let end;
    if (!item.jam_selesai || item.jam_selesai === '-' || item.jam_selesai.toLowerCase() === 'selesai') {
      end = new Date(item.tanggal);
      end.setHours(23, 59, 59, 999);
    } else {
      end = getValidDate(item.jam_selesai, item.tanggal, false) || getValidDate(item.jam_mulai, item.tanggal, false);
    }

    if (!start || !end) return false;

    return now >= start && now <= end;
  };

  const [playedReminders, setPlayedReminders] = useState([]);
  const audioRef = useRef(new Audio(alarmSound));

  const playAlarmSound = () => {
    const audio = audioRef.current;

    audio.currentTime = 0;

    audio.play().catch((err) => {
      console.error('Autoplay diblokir.', err);
    });

    setTimeout(() => {
      audio.pause();
    }, 10000);
  };

  const triggerAlarm = (item) => {
    if (playedRemindersRef.current.includes(item._id)) {
      return;
    }

    playedRemindersRef.current.push(item._id);
    playAlarmSound();
    setPlayedReminders((prev) => {
      const updated = [...prev, item._id];
      localStorage.setItem('playedReminders', JSON.stringify(updated));
      return updated;
    });
  };

  const getDataDisposisi = async () => {
    try {
      const response = await api.get('/api/task/disposisi');
      const items = filterValidItems(response.data);
      const reminders = checkReminderActive(items);

      const kegiatan = items.filter((item) => {
        if (item.isSelesai) return false;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const threeDaysLater = new Date(today);
        threeDaysLater.setDate(today.getDate() + 3);

        const tanggal = new Date(item.tanggal);
        tanggal.setHours(0, 0, 0, 0);

        return tanggal >= today && tanggal <= threeDaysLater;
      });

      const selesai = items.filter((item) => {
        if (!item.isSelesai) return false;
        if (!agendaSelesaiFilter.startDate || !agendaSelesaiFilter.endDate) {
          return false;
        }

        const tgl = new Date(item.tanggal);
        tgl.setHours(0, 0, 0, 0);

        const isInRange = tgl >= agendaSelesaiFilter.startDate && tgl <= agendaSelesaiFilter.endDate;

        return isInRange;
      });

      setAgendaKegiatan(sortNormal(kegiatan));
      setAgendaSelesai(sortNormal(selesai));

      if (reminders.length > 0) {
        if (mediaTimerRef.current) {
          clearTimeout(mediaTimerRef.current);
          mediaTimerRef.current = null;
        }

        setMode(MODE.TODAY);
        setPageTitle('AGENDA KEGIATAN HARI INI');
        setShowDisposisi(sortNormal(reminders));
        setHasActiveReminder(true);

        const newReminders = reminders.filter((r) => !playedReminders.includes(r._id));
        newReminders.forEach((item) => triggerAlarm(item));
      } else {
        setHasActiveReminder(false);

        setMode((prevMode) => {
          if (prevMode === MODE.TODAY) {
            setPageTitle('AGENDA KEGIATAN');
            setShowDisposisi(sortNormal(kegiatan));
            return MODE.KEGIATAN;
          }
          return prevMode;
        });
      }
    } catch (err) {
      console.error('Error mengambil data disposisi', err);
    } finally {
      setLoading(false);
    }
  };

  const getDisplayDuration = async () => {
    try {
      const res = await api.get('/api/media/get-duration');

      if (!res.data?.agenda_selesai_start || !res.data?.agenda_selesai_end) {
        return;
      }

      const parseDate = (dateStr, setTime = 'start') => {
        if (!dateStr) return null;

        let d = new Date(dateStr);

        if (isNaN(d.getTime())) {
          const parts = dateStr.split('-');
          if (parts.length === 3) {
            d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
          }
        }

        if (!isNaN(d.getTime())) {
          if (setTime === 'start') {
            d.setHours(0, 0, 0, 0);
          } else {
            d.setHours(23, 59, 59, 999);
          }
        }

        return d;
      };

      const start = parseDate(res.data.agenda_selesai_start, 'start');
      const end = parseDate(res.data.agenda_selesai_end, 'end');

      if (start && end && !isNaN(start.getTime()) && !isNaN(end.getTime())) {
        setAgendaSelesaiFilter({ startDate: start, endDate: end });
      } else {
        console.error('Failed to parse dates:', { start, end });
      }
    } catch (err) {
      console.error('Gagal ambil filter agenda selesai', err);
    }
  };

  // Get All Media
  const getMedia = async () => {
    try {
      const res = await api.get('/api/media/getAll-media');
      const newMediaList = res.data || [];

      if (newMediaList.length !== mediaListLengthRef.current) {
        mediaListLengthRef.current = newMediaList.length;

        if (mode === MODE.MEDIA && currentMediaIndex >= newMediaList.length) {
          setCurrentMediaIndex(0);
          if (mediaTimerRef.current) {
            clearTimeout(mediaTimerRef.current);
            mediaTimerRef.current = null;
          }
        }
      }

      setMediaList(newMediaList);
    } catch (err) {
      console.error('Gagal ambil media', err);
    }
  };

  useEffect(() => {
    getDisplayDuration();
    getMedia();

    const intervalDuration = setInterval(getDisplayDuration, 10000);
    const intervalMedia = setInterval(getMedia, 10000);

    return () => {
      clearInterval(intervalDuration);
      clearInterval(intervalMedia);
    };
  }, []);

  useEffect(() => {
    if (!agendaSelesaiFilter.startDate || !agendaSelesaiFilter.endDate) {
      return;
    }

    getDataDisposisi();

    const channel = pusher.subscribe('agenda-channel');

    channel.bind('dis', () => {
      console.log('Menerima data baru dari Pusher...');
      getDataDisposisi(true); 
    });

    return () => {
      channel.unbind('dis'); 
      pusher.unsubscribe('agenda-channel'); 
    };
  }, [agendaSelesaiFilter]);

  useEffect(() => {
    if (mode === MODE.TODAY) {
      return;
    }

    if (mode === MODE.MEDIA) return;

    const duration = 2 * 60 * 1000;

    const timer = setTimeout(() => {
      setMode((prev) => {
        if (prev === MODE.KEGIATAN) {
          return MODE.SELESAI;
        }
        if (prev === MODE.SELESAI) {
          setCurrentMediaIndex(0);
          return MODE.MEDIA;
        }
        return prev;
      });
    }, duration);

    return () => clearTimeout(timer);
  }, [mode]);

  useEffect(() => {
    if (mode !== MODE.MEDIA || mediaList.length === 0) return;

    const currentMedia = mediaList[currentMediaIndex];

    if (!currentMedia) {
      setCurrentMediaIndex(0);
      return;
    }

    const mediaType = getMediaType(currentMedia.mimetype);

    if (mediaType === 'image') {
      const durationInMs = currentMedia.duration * 1000;

      mediaTimerRef.current = setTimeout(() => {
        goToNextMedia();
      }, durationInMs);

      return () => {
        if (mediaTimerRef.current) {
          clearTimeout(mediaTimerRef.current);
          mediaTimerRef.current = null;
        }
      };
    }
  }, [mode, currentMediaIndex, mediaList.length]);

  useEffect(() => {
    if (mode === MODE.TODAY) {
      setPageTitle('AGENDA KEGIATAN HARI INI');
      return;
    }

    if (mode === MODE.KEGIATAN) {
      setPageTitle('AGENDA KEGIATAN');
      setShowDisposisi(agendaKegiatan);
    }

    if (mode === MODE.SELESAI) {
      setPageTitle('AGENDA SELESAI');
      setShowDisposisi(agendaSelesai);
    }
  }, [mode, agendaKegiatan, agendaSelesai]);

  useEffect(() => {
    if (showDisposisi.length <= rows) return;

    const interval = setInterval(() => {
      setShowDisposisi((prev) => {
        const list = [...prev];
        list.push(list.shift());
        return list;
      });
    }, scrollSpeed);

    return () => clearInterval(interval);
  }, [showDisposisi]);

  useEffect(() => {
    return () => {
      if (mediaTimerRef.current) {
        clearTimeout(mediaTimerRef.current);
      }
    };
  }, []);

  const formDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formTime = (date) => {
    if (!date) return 'Selesai';
    return new Date(date).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const sortNormal = (items) => {
    return items.sort((a, b) => new Date(a.jam_mulai) - new Date(b.jam_mulai));
  };

  const [panDirection, setPanDirection] = useState('pan-right');

  useEffect(() => {
    setPanDirection(Math.random() > 0.5 ? 'pan-right' : 'pan-left');
  }, [currentMediaIndex]);

  if (mode === MODE.MEDIA) {
    if (mediaList.length === 0) {
      setTimeout(() => setMode(MODE.KEGIATAN), 100);
      return null;
    }

    const currentMedia = mediaList[currentMediaIndex];

    if (!currentMedia) {
      setTimeout(() => {
        setMode(MODE.KEGIATAN);
        setCurrentMediaIndex(0);
      }, 100);
      return null;
    }

    const mediaType = getMediaType(currentMedia.mimetype);
    const mediaUrl = `${api.defaults.baseURL}/api/task/file/${currentMedia.displayFileId}`;

    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: '#000',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {mediaType === 'image' && (
          <div className={`media-wrapper ${isTransitioning ? 'fade-out' : 'fade-in'}`}>
            <img
              key={currentMediaIndex}
              src={mediaUrl}
              className={`kenburns ${panMode} ${orientation}`}
              style={{ '--pan-duration': `${currentMedia.duration * 60}s` }}
              onLoad={detectOrientation}
              onError={goToNextMedia}
            />
          </div>
        )}

        {mediaType === 'video' && (
          <div className="media-wrapper">
            <video
              key={currentMedia._id}
              src={mediaUrl}
              autoPlay
              playsInline
              preload="auto"
              onEnded={goToNextMedia}
              onError={goToNextMedia}
            />
          </div>
        )}

        {mediaType !== 'image' && mediaType !== 'video' && <div style={{ color: 'white' }}>Format media tidak didukung</div>}
      </div>
    );
  }

  return (
    <div className="card">
      <MainCard
        title={
          <div style={{ position: 'relative', textAlign: 'center' }}>
            <img
              src={logo}
              alt="Logo"
              style={{
                position: 'absolute',
                left: '0',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '160px',
                height: '80px'
              }}
            />
            <span
              style={{
                fontSize: '24px',
                fontWeight: 'bold'
              }}
            >
              {pageTitle}
            </span>
          </div>
        }
      >
        <DataTable
          value={showDisposisi}
          loading={loading}
          rows={rows}
          paginator={false}
          dataKey="_id"
          className="datatable-besar"
          rowClassName={(row) => {
            if (mode === MODE.SELESAI) {
              return row.laporan_status === 'SUDAH' ? 'row-laporan-sudah' : 'row-laporan-belum';
            }

            const now = new Date();
            const agendaDate = new Date(row.tanggal);

            if (agendaDate.toDateString() !== now.toDateString()) {
              return '';
            }

            const startTimeStr = row.jam_mulai?.split('-')[0].trim().replace(/\./g, ':');
            if (startTimeStr) {
              try {
                const start = new Date(row.jam_mulai);

                const fiveMinutesBefore = new Date(start.getTime());
                fiveMinutesBefore.setMinutes(fiveMinutesBefore.getMinutes() - 25);

                if (now >= fiveMinutesBefore && now < start) {
                  return 'row-upcoming-blink';
                }

                const reminderStart = new Date(start.getTime());
                reminderStart.setMinutes(reminderStart.getMinutes() - 30);
                const reminderEnd = new Date(reminderStart);
                reminderEnd.setMinutes(reminderEnd.getMinutes() + 5);

                if (now >= reminderStart && now < reminderEnd) {
                  return 'row-reminder';
                }
              } catch (e) {}
            }

            if (isOngoing(row)) return 'row-ongoing';

            return '';
          }}
        >
          <Column field="nama_kegiatan" header="Nama Kegiatan" />
          <Column
            header="Pegawai  Yang Ditugaskan"
            body={(row) =>
              row.nama_yang_dituju && row.nama_yang_dituju.length > 0 ? row.nama_yang_dituju.map((p) => p.name).join(', ') : '-'
            }
          />
          <Column field="tanggal" header="Tanggal" body={(row) => formDate(row.tanggal)} />
          <Column header="Jam" body={(row) => `${formTime(row.jam_mulai)} - ${formTime(row.jam_selesai)}`} />
          <Column
            header="Tempat"
            body={(rowData) => {
              const ruangan = rowData.ruangan?.replace(/"/g, '').trim();
              const tempat = rowData.tempat?.trim();

              if (ruangan) return ruangan;
              if (tempat) return tempat;
              return '-';
            }}
            style={{ minWidth: '8rem' }}
          />
        </DataTable>
      </MainCard>
    </div>
  );
}
