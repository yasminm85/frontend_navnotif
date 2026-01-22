import PropTypes from 'prop-types';
import React from 'react';
import api from '../../../api/axios';


// material-ui
import { useTheme } from '@mui/material/styles';
import Grid from '@mui/material/Grid2';
import Typography from '@mui/material/Typography';

// third party
import ApexCharts from 'apexcharts';
import Chart from 'react-apexcharts';
import axios from 'axios';

// project imports
import useConfig from 'hooks/useConfig';
import SkeletonTotalBarChart from 'ui-component/cards/Skeleton/TotalBarChart';
import MainCard from 'ui-component/cards/MainCard';
import { gridSpacing } from 'store/constant';

// chart data (baseline config)
import chartData from './chart-data/total-bar-chart';

export default function TotalBarChart({ isLoading }) {
  const theme = useTheme();
  const { mode } = useConfig();

  const { primary } = theme.palette.text;
  const divider = theme.palette.divider;
  const grey500 = theme.palette.grey[500];

  const SecondaryMain = theme.palette.secondary.main;
  const successDark = theme.palette.success.dark;

  const [totalKegiatan, setTotalKegiatan] = React.useState(0);

  React.useEffect(() => {
    const newChartOptions = {
      ...chartData.options,
      colors: [SecondaryMain, successDark],
      xaxis: {
        ...chartData.options.xaxis,
        labels: {
          formatter: (val) => val,
          style: {
            colors: primary
          }
        }
      },
      yaxis: {
        stepSize: 1,
        labels: {
          formatter: (val) => Math.round(val),
          style: {
            colors: primary
          }
        }
      },
      grid: { borderColor: divider },
      tooltip: {
      theme: mode
    },
      legend: { ...chartData.options.legend, labels: { colors: grey500 } }
    };

    if (!isLoading) {
      ApexCharts.exec('bar-chart', 'updateOptions', newChartOptions, false, true);
    }
  }, [mode, SecondaryMain, successDark, primary, divider, isLoading, grey500]);

  React.useEffect(() => {
    const fetchBarChart = async () => {
      try {
        const token = localStorage.getItem('token');

        const res = await api.get('/api/task/disposisi/barchart', {
          headers: { Authorization: `Bearer ${token}` }
        });

        const categories = res.data?.categories || [];
        const series = res.data?.series || [];

        ApexCharts.exec('bar-chart', 'updateOptions', {
          xaxis: { type: 'category', categories: res.data.categories  }
        });

        ApexCharts.exec('bar-chart', 'updateSeries', series);

        const total = Array.isArray(series)
          ? series.reduce((sum, s) => {
              const part = Array.isArray(s?.data) ? s.data.reduce((a, b) => a + (Number(b) || 0), 0) : 0;
              return sum + part;
            }, 0)
          : 0;

        setTotalKegiatan(total);
      } catch (err) {
        console.error('Fetch barchar error:', err);
        setTotalKegiatan(0);
      }
    };

    if (!isLoading) fetchBarChart();
  }, [isLoading]);

  return (
    <>
      {isLoading ? (
        <SkeletonTotalBarChart />
      ) : (
        <MainCard>
          <Grid container spacing={gridSpacing}>
            <Grid size={12}>
              <Grid container sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                <Grid>
                  <Grid container direction="column" spacing={1}>
                    <Grid>
                      <Typography variant="subtitle2">Total Kegiatan</Typography>
                    </Grid>
                    <Grid>
                      <Typography variant="h3">{totalKegiatan}</Typography>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid />
              </Grid>
            </Grid>

            <Grid
              size={12}
              sx={{
                ...theme.applyStyles('light', {
                  '& .apexcharts-series:nth-of-type(4) path:hover': {
                    filter: `brightness(0.95)`,
                    transition: 'all 0.3s ease'
                  }
                }),
                '& .apexcharts-menu': {
                  bgcolor: 'background.paper'
                },
                '.apexcharts-theme-light .apexcharts-menu-item:hover': {
                  bgcolor: 'dark.main'
                },
                '& .apexcharts-theme-light .apexcharts-menu-icon:hover svg, .apexcharts-theme-light .apexcharts-reset-icon:hover svg, .apexcharts-theme-light .apexcharts-selection-icon:not(.apexcharts-selected):hover svg, .apexcharts-theme-light .apexcharts-zoom-icon:not(.apexcharts-selected):hover svg, .apexcharts-theme-light .apexcharts-zoomin-icon:hover svg, .apexcharts-theme-light .apexcharts-zoomout-icon:hover svg':
                  {
                    fill: theme.palette.grey[400]
                  }
              }}
            >
              <Chart {...chartData} />
            </Grid>
          </Grid>
        </MainCard>
      )}
    </>
  );
}

TotalBarChart.propTypes = { isLoading: PropTypes.bool };
