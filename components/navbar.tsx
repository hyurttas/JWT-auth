'use client'

import axios from "axios";

export default function Navbar() {
    const handleLogout = async () => {
        try {
            await axios.post('/api/auth/logout');
            window.location.href = '/login';
        } catch (error) {
            console.error('Logout failed', error);
        }
    }
    return (
        <nav>
            <button onClick={handleLogout}>
                Logout
            </button>
        </nav>
    );
}