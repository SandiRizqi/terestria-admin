import React, { useState } from 'react';
import { useRedirect, useNotify } from 'react-admin';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import RoomIcon from '@material-ui/icons/Room';
import BusinessIcon from '@material-ui/icons/Business';
import PersonIcon from '@material-ui/icons/Person';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import Alert from '@material-ui/lab/Alert';
import { makeStyles } from '@material-ui/core/styles';

const REGISTER_URL = '/api/mobile/register/';

const useStyles = makeStyles({
    root: {
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: '#f6faf6',
    },
    leftPanel: {
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
    },
    rightPanel: {
        flex: 1,
        background: 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#ffffff',
        padding: 60,
        '@media (max-width: 960px)': { display: 'none' },
    },
    formContainer: {
        width: '100%',
        maxWidth: 440,
    },
    logoRow: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        marginBottom: 32,
    },
    logoIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: '#388e3c',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoText: {
        fontSize: 24,
        fontWeight: 800,
        color: '#1b5e20',
        letterSpacing: '-0.02em',
    },
    logoDot: { color: '#66bb6a' },
    title: { fontSize: 26, fontWeight: 800, color: '#1b5e20', marginBottom: 4 },
    subtitle: { fontSize: 14, color: '#6b8f6b', marginBottom: 28 },
    // Stepper
    stepper: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: 28,
        gap: 0,
    },
    stepItem: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
        flex: 1,
    },
    stepCircle: {
        width: 36,
        height: 36,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 15,
        fontWeight: 700,
        transition: 'all 0.2s',
    },
    stepCircleActive: {
        backgroundColor: '#388e3c',
        color: '#ffffff',
    },
    stepCircleDone: {
        backgroundColor: '#66bb6a',
        color: '#ffffff',
    },
    stepCircleInactive: {
        backgroundColor: '#e0e0e0',
        color: '#888',
    },
    stepLabel: {
        fontSize: 11,
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
    },
    stepLabelActive: { color: '#388e3c' },
    stepLabelInactive: { color: '#aaa' },
    stepLine: {
        flex: 1,
        height: 2,
        backgroundColor: '#e0e0e0',
        margin: '0 4px',
        marginBottom: 20,
    },
    stepLineDone: { backgroundColor: '#66bb6a' },
    // Fields
    textField: {
        marginBottom: 18,
        '& .MuiOutlinedInput-root': {
            borderRadius: 10,
            '&:hover fieldset': { borderColor: '#66bb6a' },
            '&.Mui-focused fieldset': { borderColor: '#388e3c' },
        },
        '& .MuiInputLabel-root.Mui-focused': { color: '#388e3c' },
    },
    buttonRow: {
        display: 'flex',
        gap: 12,
        marginTop: 8,
    },
    primaryBtn: {
        flex: 1,
        padding: '11px 0',
        borderRadius: 10,
        fontSize: 15,
        fontWeight: 700,
        textTransform: 'none',
        backgroundColor: '#388e3c',
        color: '#ffffff',
        '&:hover': { backgroundColor: '#2e7d32' },
    },
    secondaryBtn: {
        flex: 1,
        padding: '11px 0',
        borderRadius: 10,
        fontSize: 15,
        fontWeight: 700,
        textTransform: 'none',
        borderColor: '#388e3c',
        color: '#388e3c',
    },
    // Review card
    reviewCard: {
        borderRadius: 12,
        border: '1px solid #c8e6c9',
        backgroundColor: '#f1f8f1',
        padding: '16px 20px',
        marginBottom: 20,
    },
    reviewRow: {
        display: 'flex',
        gap: 12,
        alignItems: 'flex-start',
        marginBottom: 14,
    },
    reviewIcon: { color: '#388e3c', marginTop: 2 },
    reviewLabel: { fontSize: 12, color: '#888', marginBottom: 2 },
    reviewValue: { fontSize: 15, fontWeight: 600, color: '#1b5e20' },
    loginLink: {
        marginTop: 20,
        textAlign: 'center',
        fontSize: 14,
        color: '#6b8f6b',
    },
    loginAnchor: {
        color: '#388e3c',
        fontWeight: 700,
        cursor: 'pointer',
        textDecoration: 'none',
        '&:hover': { textDecoration: 'underline' },
    },
    heroTitle: { fontSize: 34, fontWeight: 800, marginBottom: 16, textAlign: 'center' },
    heroSub: { fontSize: 14, color: 'rgba(255,255,255,0.7)', marginBottom: 40, textAlign: 'center' },
    featureList: { listStyle: 'none', padding: 0, margin: 0 },
    featureItem: {
        display: 'flex', alignItems: 'center', gap: 12,
        marginBottom: 16, fontSize: 15, color: 'rgba(255,255,255,0.9)',
    },
    featureDot: { width: 8, height: 8, borderRadius: '50%', backgroundColor: '#66bb6a', flexShrink: 0 },
});

const STEPS = [
    { label: 'Akun', icon: <PersonIcon fontSize="small" /> },
    { label: 'Workspace', icon: <BusinessIcon fontSize="small" /> },
    { label: 'Konfirmasi', icon: <CheckCircleIcon fontSize="small" /> },
];

const RegisterPage = () => {
    const classes = useStyles();
    const redirect = useRedirect();
    const notify = useNotify();

    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [form, setForm] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        workspace_name: '',
        workspace_description: '',
    });

    const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

    const validateStep0 = () => {
        if (!form.username.trim()) return 'Username wajib diisi.';
        if (!form.email.trim()) return 'Email wajib diisi.';
        if (form.password.length < 8) return 'Password minimal 8 karakter.';
        if (form.password !== form.confirmPassword) return 'Password tidak cocok.';
        return null;
    };

    const validateStep1 = () => {
        if (!form.workspace_name.trim()) return 'Nama workspace wajib diisi.';
        return null;
    };

    const nextStep = () => {
        setError('');
        if (step === 0) {
            const err = validateStep0();
            if (err) { setError(err); return; }
        }
        if (step === 1) {
            const err = validateStep1();
            if (err) { setError(err); return; }
        }
        setStep((s) => s + 1);
    };

    const prevStep = () => {
        setError('');
        setStep((s) => s - 1);
    };

    const handleSubmit = async () => {
        setError('');
        setLoading(true);
        try {
            const res = await fetch(REGISTER_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: form.username,
                    email: form.email,
                    password: form.password,
                    workspace_name: form.workspace_name,
                    workspace_description: form.workspace_description,
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                const msg = Object.values(data).flat().join(' ');
                setError(msg || 'Registrasi gagal.');
                setLoading(false);
                return;
            }
            localStorage.setItem('token', data.token);
            localStorage.setItem('workspace_id', String(data.workspace.id));
            notify('Akun berhasil dibuat! Selamat datang di Terestria.');
            redirect('/');
        } catch (e) {
            setError('Terjadi kesalahan. Coba lagi.');
            setLoading(false);
        }
    };

    const StepperBar = () => (
        <div className={classes.stepper}>
            {STEPS.map((s, i) => (
                <React.Fragment key={i}>
                    {i > 0 && (
                        <div className={`${classes.stepLine} ${i <= step ? classes.stepLineDone : ''}`} />
                    )}
                    <div className={classes.stepItem}>
                        <div className={`${classes.stepCircle} ${
                            i < step ? classes.stepCircleDone :
                            i === step ? classes.stepCircleActive :
                            classes.stepCircleInactive
                        }`}>
                            {i < step ? <CheckCircleIcon fontSize="small" /> : i + 1}
                        </div>
                        <span className={`${classes.stepLabel} ${
                            i <= step ? classes.stepLabelActive : classes.stepLabelInactive
                        }`}>{s.label}</span>
                    </div>
                </React.Fragment>
            ))}
        </div>
    );

    return (
        <div className={classes.root}>
            <div className={classes.leftPanel}>
                <div className={classes.formContainer}>
                    <div className={classes.logoRow}>
                        <div className={classes.logoIcon}>
                            <RoomIcon style={{ color: '#ffffff', fontSize: 26 }} />
                        </div>
                        <span className={classes.logoText}>
                            Terestria<span className={classes.logoDot}>.</span>
                        </span>
                    </div>

                    <div className={classes.title}>Buat Akun Baru</div>
                    <div className={classes.subtitle}>Daftar dan mulai kelola data geospasial Anda</div>

                    <StepperBar />

                    {error && (
                        <Alert severity="error" onClose={() => setError('')} style={{ marginBottom: 16, borderRadius: 10 }}>
                            {error}
                        </Alert>
                    )}

                    {/* Step 0: Account */}
                    {step === 0 && (
                        <>
                            <TextField
                                className={classes.textField}
                                label="Username"
                                value={form.username}
                                onChange={set('username')}
                                variant="outlined"
                                fullWidth
                                autoFocus
                            />
                            <TextField
                                className={classes.textField}
                                label="Email"
                                type="email"
                                value={form.email}
                                onChange={set('email')}
                                variant="outlined"
                                fullWidth
                            />
                            <TextField
                                className={classes.textField}
                                label="Password"
                                type="password"
                                value={form.password}
                                onChange={set('password')}
                                variant="outlined"
                                fullWidth
                                helperText="Minimal 8 karakter"
                            />
                            <TextField
                                className={classes.textField}
                                label="Konfirmasi Password"
                                type="password"
                                value={form.confirmPassword}
                                onChange={set('confirmPassword')}
                                variant="outlined"
                                fullWidth
                            />
                            <div className={classes.buttonRow}>
                                <Button className={classes.primaryBtn} onClick={nextStep} variant="contained" disableElevation>
                                    Lanjut
                                </Button>
                            </div>
                        </>
                    )}

                    {/* Step 1: Workspace */}
                    {step === 1 && (
                        <>
                            <TextField
                                className={classes.textField}
                                label="Nama Workspace"
                                value={form.workspace_name}
                                onChange={set('workspace_name')}
                                variant="outlined"
                                fullWidth
                                autoFocus
                                helperText="Contoh: Tim Survei Kalimantan, PT Agri Data"
                            />
                            <TextField
                                className={classes.textField}
                                label="Deskripsi (opsional)"
                                value={form.workspace_description}
                                onChange={set('workspace_description')}
                                variant="outlined"
                                fullWidth
                                multiline
                                rows={3}
                            />
                            <div className={classes.buttonRow}>
                                <Button className={classes.secondaryBtn} onClick={prevStep} variant="outlined">
                                    Kembali
                                </Button>
                                <Button className={classes.primaryBtn} onClick={nextStep} variant="contained" disableElevation>
                                    Lanjut
                                </Button>
                            </div>
                        </>
                    )}

                    {/* Step 2: Review */}
                    {step === 2 && (
                        <>
                            <div className={classes.reviewCard}>
                                <div className={classes.reviewRow}>
                                    <PersonIcon className={classes.reviewIcon} />
                                    <div>
                                        <div className={classes.reviewLabel}>Akun</div>
                                        <div className={classes.reviewValue}>{form.username}</div>
                                        <div style={{ fontSize: 13, color: '#666' }}>{form.email}</div>
                                    </div>
                                </div>
                                <div className={classes.reviewRow}>
                                    <BusinessIcon className={classes.reviewIcon} />
                                    <div>
                                        <div className={classes.reviewLabel}>Workspace</div>
                                        <div className={classes.reviewValue}>{form.workspace_name}</div>
                                        {form.workspace_description && (
                                            <div style={{ fontSize: 13, color: '#666' }}>{form.workspace_description}</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className={classes.buttonRow}>
                                <Button className={classes.secondaryBtn} onClick={prevStep} variant="outlined" disabled={loading}>
                                    Kembali
                                </Button>
                                <Button className={classes.primaryBtn} onClick={handleSubmit} variant="contained" disableElevation disabled={loading}>
                                    {loading ? <CircularProgress size={22} color="inherit" /> : 'Buat Akun'}
                                </Button>
                            </div>
                        </>
                    )}

                    <div className={classes.loginLink}>
                        Sudah punya akun?{' '}
                        <a className={classes.loginAnchor} href="/#/login">
                            Masuk di sini
                        </a>
                    </div>
                </div>
            </div>

            <div className={classes.rightPanel}>
                <div className={classes.heroTitle}>Kelola Data GIS<br />Bersama Tim Anda</div>
                <div className={classes.heroSub}>// Workspace · Projects · GeoData · Real-time</div>
                <ul className={classes.featureList}>
                    <li className={classes.featureItem}><span className={classes.featureDot} />Buat workspace untuk tim Anda</li>
                    <li className={classes.featureItem}><span className={classes.featureDot} />Undang anggota dan atur role</li>
                    <li className={classes.featureItem}><span className={classes.featureDot} />Isolasi data per workspace</li>
                    <li className={classes.featureItem}><span className={classes.featureDot} />Kelola projects dan geodata bersama</li>
                    <li className={classes.featureItem}><span className={classes.featureDot} />Pantau aktivitas dengan audit log</li>
                </ul>
            </div>
        </div>
    );
};

export default RegisterPage;
