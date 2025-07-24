document.getElementById('signupForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const firstName = document.getElementById('firstName').value;
    const middleName = document.getElementById('middleName').value;
    const lastName = document.getElementById('lastName').value;
    const dob = document.getElementById('dob').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const name = `${firstName} ${middleName} ${lastName}`.trim();

    try {
        const response = await fetch('/api/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, dob, email, password })
        });
        const data = await response.json();
        if (response.ok) {
            const loginResponse = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const loginData = await loginResponse.json();
            if (loginResponse.ok) {
                localStorage.setItem('token', loginData.token);
                window.location.href = '/dashboard.html';
            } else {
                Toastify({
                    text: loginData.error || 'Login failed after signup',
                    duration: 3000,
                    gravity: 'top',
                    position: 'right',
                    backgroundColor: '#EF4444',
                }).showToast();
            }
        } else {
            Toastify({
                text: data.error || 'Signup failed',
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