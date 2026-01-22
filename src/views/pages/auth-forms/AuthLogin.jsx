import { useState } from 'react';
import { useTheme } from '@mui/material/styles';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Box from '@mui/material/Box';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import AnimateButton from 'ui-component/extended/AnimateButton';

export default function AuthLogin({
  email,
  password,
  setEmail,
  setPassword,
  handleSubmit,
  isLoading
}) {
  const theme = useTheme();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <>
      {/* Email */}
      <FormControl fullWidth sx={{ ...theme.typography.customInput }}>
        <InputLabel>Email</InputLabel>
        <OutlinedInput
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          label="Email"
        />
      </FormControl>

      {/* Password */}
      <FormControl fullWidth sx={{ ...theme.typography.customInput }}>
        <InputLabel>Password</InputLabel>
        <OutlinedInput
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          endAdornment={
            <InputAdornment position="end">
              <IconButton
                onClick={() => setShowPassword(!showPassword)}
                edge="end"
              >
                {showPassword ? <Visibility /> : <VisibilityOff />}
              </IconButton>
            </InputAdornment>
          }
          label="Password"
        />
      </FormControl>

      {/* Login button */}
      <Box sx={{ mt: 2 }}>
        <AnimateButton>
          <Button
            color="primary"
            fullWidth
            size="large"
            variant="contained"
            onClick={handleSubmit}
            type='submit'
          >
            {isLoading ? "Loading..." : "Login"}
          </Button>
        </AnimateButton>
      </Box>
    </>
  );
}
