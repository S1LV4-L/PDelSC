import { useState, useEffect } from 'react';

export function NightDayButton() {
    const [tema, setTema] = useState('light');

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', tema);
    }, [tema]);

    const toggleTema = () => {
        setTema(prev => (prev === 'dark' ? 'light' : 'dark'));
    };

    const esOscuro = tema === 'dark';

    return (
        <button className="btn-tema" onClick={toggleTema}>
            <span>{esOscuro ? '🌙' : '☀️'}</span>
            <span>{esOscuro ? 'Modo claro' : 'Modo oscuro'}</span>
        </button>
    );
}