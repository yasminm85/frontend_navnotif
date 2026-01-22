import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { LoginUser, reset } from '../../../features/authSlice';
import useMediaQuery from '@mui/material/useMediaQuery';

// MUI Components
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid2';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import AuthWrapper1 from './AuthWrapper1';
import AuthCardWrapper from './AuthCardWrapper';
import AuthLogin from '../auth-forms/AuthLogin';
import Logo from 'ui-component/Logo';

export default function Login() {
  const downMD = useMediaQuery((theme) => theme.breakpoints.down('md'));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isError, isSuccess, isLoading, message } = useSelector(
    (state) => state.auth
  );

  // Redirect after login
  useEffect(() => {
    if (user || isSuccess) {
      if (user.role === "admin") {
        navigate("/dashboard/default");
      } else if (user.role === "pegawai") {
        navigate("/dashboard-pegawai");
      } else if (user.role === "EVP") {
        navigate("/dashboard-evp");
      }
    }
  }, [user, isSuccess]);


  const handleLogin = (e) => {
    e.preventDefault();
    dispatch(LoginUser({ email, password }));
  };

  return (
    <AuthWrapper1>
      <Grid
        container
        direction="column"
        sx={{ justifyContent: 'flex-end', minHeight: '100vh' }}
      >
        <Grid size={12}>
          <Grid
            container
            sx={{ justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 68px)' }}
          >
            <Grid sx={{ m: { xs: 1, sm: 3 }, mb: 0 }}>
              <AuthCardWrapper>
                <Grid container spacing={2} sx={{ alignItems: 'center', justifyContent: 'center' }}>

                  {/* Logo + Title */}
                  <Grid container alignItems="center" spacing={1}>
                    <Grid><Logo /></Grid>
                    <Grid>
                      <Typography gutterBottom variant={downMD ? 'h3' : 'h2'}>
                        NavNotif
                      </Typography>
                    </Grid>
                  </Grid>

                  {/* Title */}
                  <Grid size={12}>
                    <Grid container sx={{ alignItems: 'center', justifyContent: 'center' }}>
                      <Stack spacing={1} sx={{ alignItems: 'center' }}>
                        <Typography
                          gutterBottom
                          variant={downMD ? 'h3' : 'h2'}
                          sx={{ color: 'primary.800' }}
                        >
                          Hi, Welcome Back!
                        </Typography>

                        {isError && (
                          <Typography sx={{ color: 'red' }}>
                            {message}
                          </Typography>
                        )}
                      </Stack>
                    </Grid>
                  </Grid>

                  {/* Login Form */}
                  <Grid size={12}>
                    <form onSubmit={handleLogin}>
                      <AuthLogin
                        email={email}
                        password={password}
                        setEmail={setEmail}
                        setPassword={setPassword}
                        isLoading={isLoading}
                      />
                    </form>
                  </Grid>


                  <Grid size={12}><Divider /></Grid>

                </Grid>
              </AuthCardWrapper>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </AuthWrapper1>
  );
}
