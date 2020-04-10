import React from 'react';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Link from '@material-ui/core/Link';
import Box from '@material-ui/core/Box';
import InputAdornment from '@material-ui/core/InputAdornment';
import Typography from '@material-ui/core/Typography';
import { makeStyles} from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import { Select, MenuItem } from '@material-ui/core';

const axios = require('axios');
const qs = require('querystring');

function getIds() {
  
  const jsonIds = require('./pkgids.json');

  let a = jsonIds[0]["result"];
  let data = [];
  
  a.forEach(function(m) {
    if(m.menu['@attributes']['pkgid']) {
        data.push(m.menu['@attributes'])
    }
  })
  return data;
} 



function Copyright() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {'Copyright © '}
      <Link color="inherit" href="https://web.facebook.com/adipati.aarya">
        Arya Studio
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    borderStyle:'groove',
    padding:'12px'
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor:'#ffffff',
    height:'100%',
    width:'20%',
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));




function App() {
  const classes = useStyles();
  const pkgIds = getIds();

  const [otp, setOtp] = React.useState('');
  const [msisdn, setMsisdn] = React.useState('');
  const [pkgid, setPkgid] = React.useState('');

  const [loading, setLoading] = React.useState(false);
  const [response, setResponse] = React.useState('');
  const [open, setOpen] = React.useState(false);
  const [auto, setAuto] = React.useState(true);


  const handleOtp = (e) => {
    setOtp(e.target.value);
  };
   
  const handleAuto = () => {
    setAuto(!auto);
  }
  const handleMsisdn = (e) => {
    setMsisdn(e.target.value);
  };
  const handlePkgid = (e) => {
    setPkgid(e.target.value)
  }
  //Request OTP
  const submitOtp = () => {
    const url = 'https://axisnets.herokuapp.com/newaxisnet/sso/signinv3/otp_request';
    const requestBody = {
      msisdn:msisdn
    } 
    const config = {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }
    setLoading(true);
    axios.post(url, qs.stringify(requestBody), config)
      .then((result) => {
        const {data} = result;
        if(data.code === '200') {
          setLoading(false);
          setOpen(true);
          setResponse(data.message);
        }
        else {
          setLoading(false);
          setResponse(data.message);
        }
      })
      .catch((err) => {
       // openInputOtp(false);
        alert (`Jaringan Error ${err}`);
        setLoading(false);
      })
  };

  // Request Buy Package
  const submitPackage =(e)=> {
    e.preventDefault();
    //Login Api
    const url = 'https://axisnets.herokuapp.com/newaxisnet/sso/signinv3/auth';
    const requestBody = {
      msisdn:msisdn,
      otp_code:otp
    } 
    const config = {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }
    setLoading(true);
    axios.post(url, qs.stringify(requestBody), config)
      .then((result) => {
        const {data} = result;
        if(data.code === '200') {
          const {msisdn, token} = data.data;
          const body = {
            msisdn,
            token,
            pkgid
          }
          //Buy
          axios.post('https://axisnets.herokuapp.com/newaxisnet/oasys/package/buy', qs.stringify(body), config)
            .then(response => {
              setLoading(false);

              let res = response.data;
              if(res.status === '1') {
                const {message} = res;
                setResponse(message);
              }
              else {
                const {err_code, err_desc} = res;
                setResponse(JSON.stringify({err_code, err_desc}));
              }
              
            })
            .catch(err => {
              setLoading(false);
              setResponse(JSON.stringify(err));
            })
          
        }
        else {
          setLoading(false);
          setResponse(JSON.stringify(result.data));
        }
      })
      .catch((err) => {
        setLoading(false);
        alert (`Jaringan Error ${err}`);
       
      })
  }
  const renderGetOtp = () => {

    let rendered = (
      <TextField
        variant="outlined"
        margin="normal"
        required
        fullWidth
        placeholder="0838xxxxxxxxx"
        onChange={handleMsisdn}
        value={msisdn}
        disabled={loading}
        label="No Telp"
        InputProps={{
          endAdornment: (
            <InputAdornment position='end'>
              <Button onClick={submitOtp} variant="contained" color="primary" disabled={loading}>GET OTP</Button>
            </InputAdornment>
              ),
            }}
          />
    )
    if (open) {
      rendered = (
        <TextField
          variant="outlined"
          margin="normal"
          required
          fullWidth
          placeholder="XGHLJ"
          label="OTP KODE"
          onChange={handleOtp}
          value={otp}
          name="otp"
         
        />
      )
    }

    return rendered;

  }

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
        <Avatar className={classes.avatar}>
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Axis_logo_2015.svg/82px-Axis_logo_2015.svg.png" alt=""/>
        </Avatar>
       
        <form className={classes.form} noValidate onSubmit={submitPackage}>
          {renderGetOtp()}
          
          <FormControlLabel
            control={<Checkbox disabled={loading} onChange={handleAuto} color="primary" checked={auto}/>}
            label="Manual Input"
          />
          <br/>
          {auto ? 
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="pkgid"
            label="Pkgid"
            placeholder="3212255"
            onChange={handlePkgid}
            value={pkgid}
            disabled={loading}
           
          />:
          <Select labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={pkgid}
            fullWidth
            displayEmpty
            onChange={handlePkgid}>
            <MenuItem value="">
            <em>Pilih Paket </em>
            
            </MenuItem>
          {pkgIds.map((pkg, i)=> <MenuItem key={i} value={pkg.pkgid}>{pkg.desc}</MenuItem>)}
            
          </Select>
          }
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
            disabled={loading}
          >
            BELI PAKET
          </Button>
        
        </form>
        <p>{loading?'Loading....':response}</p>

       
      </div>
      <Box mt={8}>
        <Copyright />
      </Box>
    </Container>
  );
}
export default App;
