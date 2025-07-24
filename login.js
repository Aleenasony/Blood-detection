document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();
        if (response.ok) {
            localStorage.setItem('token', data.token);
            window.location.href = '/dashboard.html';
        } else {
            Toastify({
                text: data.error || 'Login failed',
                duration: 3000,
                gravity: 'top',
                position: 'right',
                backgroundColor: '#EF4444',
            }).showToast();
        }
    } catch (error) {
        console.error('Error:', error);
        Toastify({
            text: 'An error occurred',
            duration: 3000,
            gravity: 'top',
            position: 'right',
            backgroundColor: '#EF4444',
        }).showToast();
    }
});