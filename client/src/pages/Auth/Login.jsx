import React, { useState } from 'react';
import Button from '../../components/Buttons/Button';
import Input from '../../components/Inputs/Inputs';
import './Login.css';

const Login = ({ onLogin, onGoToSetup }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = () => {
        if (!email || !password) {
            alert("Заполните все поля");
            return;
        }
        onLogin(email, password);
    };

    return (
        <div className="login-page">
            
            <div className="login-sidebar">
                <img src="/logo-main.png" alt="Splitflow" className="login-logo-main" />
                
                <div className="login-form-card">
                    <div className="login-input-group">
                        <span className="login-input-label">E-mail</span>
                        <Input
                            placeholder="email@splitflow.anc"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    
                    <div className="login-input-group">
                        <span className="login-input-label">Пароль</span>
                        <Input
                            type="password"
                            placeholder="•••••••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <Button variant="primary" onClick={handleSubmit}>
                        Продолжить
                    </Button>

                    <p className="login-disclaimer">
                        Используйте только официально выданную ВИСК<br />
                        корпоративную почту или почту одобренную комитетом.
                        <br /><br />
                        Продолжая вы соглашаетесь с текущим уставом<br />
                        ВИСК Анкерлянда
                    </p>

                    <div className="login-divider">
                        <span>или</span>
                    </div>

                    <Button variant="full-unfocused" onClick={onGoToSetup}>
                        Открыть новую БД
                    </Button>
                </div>

                <img src="/logo-visk.png" alt="VISK" className="login-logo-footer" />
            </div>
            
            <div className="login-cover-section">
                <div className="login-cover-vector">
                    <img src="/cover-image.png" alt="Cover" className="login-cover-image" />
                </div>
            </div>

        </div>
    );
};

export default Login;