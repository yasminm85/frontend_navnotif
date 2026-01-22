import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import api from '../../../api/axios';

// material-ui
import { useTheme } from "@mui/material/styles";
import Avatar from "@mui/material/Avatar";
import Grid from "@mui/material/Grid2";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

// project imports
import MainCard from "ui-component/cards/MainCard";
import SkeletonTotalOrderCard from "ui-component/cards/Skeleton/EarningCard";

// assets
import AssignmentIcon from "@mui/icons-material/Assignment";
import axios from "axios";

export default function TotalDispo() {
  const theme = useTheme();
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token"); 

  const fetchTotalDispo = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/api/task/disposisi/count", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error("Gagal memuat total disposisi:", err.response?.data || err.message);
      setError("Gagal memuat total disposisi");
      setTotal(0);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTotalDispo();
    const interval = setInterval(fetchTotalDispo, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {loading ? (
        <SkeletonTotalOrderCard />
      ) : (
        <MainCard
          border={false}
          content={false}
          sx={{
            bgcolor: "primary.dark",
            color: "#fff",
            overflow: "hidden",
            position: "relative",
            "&>div": { position: "relative", zIndex: 5 },
            "&:after": {
              content: '""',
              position: "absolute",
              width: 210,
              height: 210,
              background: theme.palette.primary[800],
              borderRadius: "50%",
              top: { xs: -85 },
              right: { xs: -95 },
            },
            "&:before": {
              content: '""',
              position: "absolute",
              width: 210,
              height: 210,
              background: theme.palette.primary[800],
              borderRadius: "50%",
              top: { xs: -125 },
              right: { xs: -15 },
              opacity: 0.5,
            },
          }}
        >
          <Box sx={{ p: 2.25 }}>
            <Grid container direction="column">
              <Grid>
                <Grid container sx={{ justifyContent: "space-between" }}>
                  <Grid>
                    <Avatar
                      variant="rounded"
                      sx={{
                        ...theme.typography.commonAvatar,
                        ...theme.typography.largeAvatar,
                        bgcolor: "primary.800",
                        color: "#fff",
                        mt: 1,
                      }}
                    >
                      <AssignmentIcon fontSize="inherit" />
                    </Avatar>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
            <Grid container direction="column">
              <Grid>
                <Grid container sx={{ alignItems: "center" }}>
                  <Grid>
                    <Typography
                      sx={{
                        fontSize: "2.125rem",
                        fontWeight: 500,
                        mr: 1,
                        mt: 1.75,
                        mb: 0.75,
                      }}
                    >
                      {error ? "-" : `${total} Dispo Dibuat`}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid sx={{ mb: 1.25 }}>
                <Typography
                  sx={{
                    fontSize: "1rem",
                    fontWeight: 500,
                    color: "primary.200",
                  }}
                >
                  {error || "Total Dispo Yang Telah Dibuat"}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </MainCard>
      )}
    </>
  );
}

TotalDispo.propTypes = {
  isLoading: PropTypes.bool,
};
