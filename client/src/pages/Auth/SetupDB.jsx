import React, { useState } from 'react';
import Button from '../../components/Buttons/Button';
import Input from '../../components/Inputs/Inputs';
import './SetupDB.css';

const SetupDB = ({ onSetupComplete, onGoToLogin }) => {
    const [dbString, setDbString] = useState('');
    const[dbPassword, setDbPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleConnect = async () => {
        if (!dbString || !dbPassword) {
            alert("Пожалуйста, заполните все поля.");
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch('/api/setup/init', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    connectionString: dbString, // Например: Host=localhost;Port=5432;Database=splitflow_v2;Username=postgres
                    password: dbPassword
                })
            });

            const data = await response.json();

            if (response.ok) {
                alert("База данных успешно создана и инициализирована!");
                if (onSetupComplete) onSetupComplete();
            } else {
                alert("Ошибка: " + data.message);
            }
        } catch (error) {
            console.error("Ошибка подключения:", error);
            alert("Не удалось связаться с сервером бэкенда.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="setup-page">
            <img src="/setup-bg.webp" alt="Background Blur" className="setup-bg-image" />

            <div className="setup-content">
                <h1 className="setup-title">
                    Инициализация Локальной<br/>Базы Данных
                </h1>
                
                <div className="setup-card">
                    <p className="setup-subtitle">
                        На данный момент поддерживаются локальные<br/>базы данных на базе PostgreSQL
                    </p>
                    
                    <div className="setup-divider-thin" />

                    <div className="setup-input-group">
                        <span className="setup-input-label">Строчка подключения</span>
                        <Input
                            placeholder="Host=localhost;Port=5432..."
                            value={dbString}
                            onChange={(e) => setDbString(e.target.value)}
                        />
                    </div>
                    
                    <div className="setup-input-group">
                        <span className="setup-input-label">Пароль от БД</span>
                        <Input
                            type="password"
                            placeholder="•••••••••••••"
                            value={dbPassword}
                            onChange={(e) => setDbPassword(e.target.value)}
                        />
                    </div>

                    <Button 
                        variant="primary" 
                        onClick={handleConnect}
                        disabled={isLoading}
                    >
                        {isLoading ? "Подключение..." : "Подключить БД"}
                    </Button>
                    
                    <p className="setup-subtitle">
                        Будет создана базовая структура Splitflow
                    </p>

                    <div className="setup-divider">
                        <span>или</span>
                    </div>
                    
                    <Button variant="full-unfocused" onClick={onGoToLogin}>
                        Войти через подключенную БД
                    </Button>
                </div>
            </div>

            <div className="setup-footer">
                <div className="setup-footer-left">
                    <img src="/logo-main-metallic.png" alt="Splitflow" className="setup-logo-splitflow" />
                </div>
                <div className="setup-footer-right">
                    <img src="/logo-visk.png" alt="VISK" className="setup-logo-visk" />
                    <img src="/logo-razirtech.png" alt="Razirtech" className="setup-logo-razirtech" />
                </div>
            </div>
        </div>
    );
};

export default SetupDB;