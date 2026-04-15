import React, { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from '../../../api/axios';
import Swal from "sweetalert2";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  CircularProgress,
  InputAdornment,
  Stack,
} from "@mui/material";
import {
  Email as EnvelopeIcon,
  Lock as LockClosedIcon,
  ArrowBack as ArrowLeftIcon,
} from "@mui/icons-material";

const OTP_LENGTH = 6;

export function ResetPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [otp, setOtp] = useState(new Array(OTP_LENGTH).fill(""));
  const [isOtpSubmited, setIsOtpSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef([]);

  const currentStep = !isEmailSent ? 1 : !isOtpSubmited ? 2 : 3;

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!email) return Swal.fire({ icon: "error", title: "Gagal", text: "Masukkan email Anda" });
    setLoading(true);
    try {
      await api.post("/api/auth/send-reset-otp", { email });
      Swal.fire({ icon: "success", title: "Berhasil", text: "Kode OTP telah dikirim ke email Anda" });
      setIsEmailSent(true);
    } catch (err) {
      Swal.fire({ icon: "error", title: "Gagal", text: err.response?.data?.message || "Gagal mengirim kode OTP" });
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (element, index) => {
    if (isNaN(element.value)) return;
    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);
    if (element.value !== "" && index < OTP_LENGTH - 1) inputRefs.current[index + 1].focus();
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === "Backspace" && otp[index] === "" && index > 0) inputRefs.current[index - 1].focus();
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").slice(0, OTP_LENGTH);
    if (!/^\d+$/.test(pasted)) return;
    const newOtp = [...otp];
    pasted.split("").forEach((char, i) => { if (i < OTP_LENGTH) newOtp[i] = char; });
    setOtp(newOtp);
    inputRefs.current[Math.min(pasted.length - 1, OTP_LENGTH - 1)].focus();
  };


const handleOtpSubmit = async (e) => {
  e.preventDefault();
  
  const otpString = otp.join(""); 

  if (otpString.length !== OTP_LENGTH) {
    return Swal.fire({ 
      icon: "error", 
      title: "Gagal", 
      text: "Masukkan kode OTP 6 digit" 
    });
  }

  setLoading(true);

  try {
    const response = await api.post("/api/auth/check-otp", {
      email: email,
      otp: otpString
    });

    Swal.fire({ 
      icon: "success", 
      title: "Berhasil", 
      text: "Kode OTP berhasil diverifikasi" 
    });
    
    setIsOtpSubmitted(true); 

  } catch (err) {
    Swal.fire({ 
      icon: "error", 
      title: "Gagal", 
      text: err.response?.data?.message || "Kode OTP tidak valid" 
    });
    
    setOtp(new Array(OTP_LENGTH).fill(""));
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  } finally {
    setLoading(false);
  }
};

  const handleResendOtp = async () => {
    setLoading(true);
    try {
      const { data } = await api.post("/api/auth/send-reset-otp", { email });
      if (data.success) {
        Swal.fire({ icon: "success", title: "Berhasil", text: "Kode OTP telah dikirim ulang" });
        setOtp(new Array(OTP_LENGTH).fill(""));
        inputRefs.current[0].focus();
      }
    } catch {
      Swal.fire({ icon: "error", title: "Gagal", text: "Gagal mengirim kode OTP" });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) return Swal.fire({ icon: "error", title: "Gagal", text: "Masukkan password baru" });
    if (newPassword !== confirmPassword) return Swal.fire({ icon: "error", title: "Gagal", text: "Password tidak sama" });
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Password harus minimal 8 karakter, termasuk huruf besar, huruf kecil, angka, dan simbol"
      });
    }

    setLoading(true);

    try {
      const response  = await api.post("/api/auth/reset-password", {
        email, otp: otp.join(""), newPassword,
      });
        Swal.fire({ icon: "success", title: "Berhasil", text: "Password berhasil diubah!", timer: 2000, showConfirmButton: false });
        setTimeout(() => navigate("/pages/login"), 1000);
    } catch (err) {
      Swal.fire({ icon: "error", title: "Gagal", text: err.response?.data?.message || "Gagal mengubah password" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(to bottom right, #eff6ff, #f3f4f6)",
        p: 2,
      }}
    >
      <Card
        sx={{
          width: "100%",
          maxWidth: 420,
          borderRadius: 4,
          boxShadow: "0 15px 40px rgba(0,0,0,0.1)",
        }}
      >
        <CardContent sx={{ p: 4 }}>

          <Box sx={{ textAlign: "center", mb: 3 }}>
            <Typography variant="h5" fontWeight="bold">
              Reset Password
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {currentStep === 1 && "Masukkan email untuk OTP"}
              {currentStep === 2 && "Masukkan kode OTP"}
              {currentStep === 3 && "Buat password baru"}
            </Typography>
          </Box>

          {!isEmailSent && (
            <Box component="form" onSubmit={handleEmailSubmit}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EnvelopeIcon fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{ py: 1.2, borderRadius: 2 }}
              >
                {loading ? <CircularProgress size={20} color="inherit" /> : "Kirim OTP"}
              </Button>
              <Typography align="center" variant="body2" sx={{ mt: 3 }}>
                Sudah ingat password?{" "}
                <Link to="/pages/login" style={{ color: "#1976d2", textDecoration: "none", fontWeight: 500 }}>
                  Login
                </Link>
              </Typography>
            </Box>
          )}

          {isEmailSent && !isOtpSubmited && (
            <Box component="form" onSubmit={handleOtpSubmit}>
              <Stack direction="row" justifyContent="center" spacing={1.5} sx={{ mb: 3 }} onPaste={handleOtpPaste}>
                {otp.map((d, i) => (
                  <Box
                    key={i}
                    component="input"
                    maxLength={1}
                    value={d}
                    onChange={(e) => handleOtpChange(e.target, i)}
                    onKeyDown={(e) => handleOtpKeyDown(e, i)}
                    ref={(ref) => (inputRefs.current[i] = ref)}
                    sx={{
                      width: 44,
                      height: 48,
                      textAlign: "center",
                      fontSize: 18,
                      fontWeight: 600,
                      border: "1px solid",
                      borderColor: d ? "primary.main" : "grey.300",
                      borderRadius: 2,
                      outline: "none",
                      bgcolor: "background.paper",
                      color: "text.primary",
                      transition: "border-color 0.2s",
                      "&:focus": {
                        borderColor: "primary.main",
                        boxShadow: "0 0 0 2px rgba(25,118,210,0.2)",
                      },
                    }}
                  />
                ))}
              </Stack>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{ py: 1.2, borderRadius: 2, mb: 1.5 }}
              >
                {loading ? <CircularProgress size={20} color="inherit" /> : "Verifikasi OTP"}
              </Button>

              <Button
                fullWidth
                variant="outlined"
                startIcon={<ArrowLeftIcon />}
                onClick={() => setIsEmailSent(false)}
                sx={{ py: 1.2, borderRadius: 2 }}
              >
                Kembali
              </Button>

              <Typography align="center" variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Tidak menerima kode?{" "}
                <Box
                  component="span"
                  onClick={handleResendOtp}
                  sx={{ color: "primary.main", fontWeight: 500, cursor: "pointer" }}
                >
                  Kirim ulang
                </Box>
              </Typography>
            </Box>
          )}

          {isEmailSent && isOtpSubmited && (
            <Box component="form" onSubmit={handlePasswordSubmit}>
              <TextField
                fullWidth
                type="password"
                label="Password Baru"
                sx={{ mb: 2 }}
                onChange={(e) => setNewPassword(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockClosedIcon fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                fullWidth
                type="password"
                label="Konfirmasi Password"
                sx={{ mb: 3 }}
                onChange={(e) => setConfirmPassword(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockClosedIcon fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{ py: 1.2, borderRadius: 2 }}
              >
                {loading ? <CircularProgress size={20} color="inherit" /> : "Reset Password"}
              </Button>
            </Box>
          )}

          <Stack direction="row" justifyContent="center" spacing={1} sx={{ mt: 4 }}>
            {[1, 2, 3].map((s) => (
              <Box
                key={s}
                sx={{
                  height: 10,
                  width: s === currentStep ? 24 : 10,
                  borderRadius: 99,
                  bgcolor:
                    s === currentStep ? "primary.main" : s < currentStep ? "success.main" : "grey.300",
                  transition: "all 0.3s ease",
                }}
              />
            ))}
          </Stack>

        </CardContent>
      </Card>
    </Box>
  );
}

export default ResetPassword;