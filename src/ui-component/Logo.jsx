import { useTheme } from '@mui/material/styles';
import  logo  from '../assets/images/logo-navnotif.png';


export default function Logo() {
  const theme = useTheme();

  return (
    <img src={logo} width="80" height="80"/>
  );
}
