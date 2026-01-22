import { useEffect, useState } from 'react';

// material-ui
import Grid from '@mui/material/Grid2';

// project imports
import TotalDispo from './TotalDispo';
import TotalBarChart from './TotalBarChart';
import TableReport from '../TableReport';
import { gridSpacing } from 'store/constant';
import { getUserDetail } from '../../../features/authSlice';
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'

// ==============================|| DEFAULT DASHBOARD ||============================== //

export default function Dashboard() {
  const [isLoading, setLoading] = useState(true);
  const dispatch = useDispatch();
    const navigate = useNavigate();
    const {isError} = useSelector((state => state.auth));

  useEffect(() => {
    dispatch(getUserDetail());
    setLoading(false);
    if(isError){
            navigate("/pages/login");
        }
  }, [dispatch,isError, navigate]);

  return (
    <Grid container spacing={gridSpacing}>
      <Grid size={12}>
        <Grid container spacing={gridSpacing}>
          <Grid size={{ lg: 12, md: 6, sm: 6, xs: 12 }}>
            <TotalDispo isLoading={isLoading} />
          </Grid>
          <Grid size={{ lg: 4, md: 12, sm: 12, xs: 12 }}>
          </Grid>
        </Grid>
      </Grid>
      <Grid size={12}>
        <Grid container spacing={gridSpacing}>
          <Grid size={{ xs: 12, md: 12 }}>
            <TotalBarChart isLoading={isLoading} />
          </Grid>
        </Grid>
      </Grid>
      <Grid size={12}>
        <Grid container spacing={gridSpacing}>
          <Grid size={{ xs: 12, md: 12 }}>
            <TableReport isLoading={isLoading} />
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}
