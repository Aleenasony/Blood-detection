document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (token) {
        try {
            const response = await fetch('/user', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const user = await response.json();
                if (!user.personalDetails || !user.personalDetails.age || !user.personalDetails.gender) {
                    showSection('details-section');
                } else {
                    showSection('dashboard-section');
                }
            } else {
                localStorage.removeItem('token');
                showSection('auth-section');
            }
        } catch (error) {
            console.error(error);
            localStorage.removeItem('token');
            showSection('auth-section');
        }
    } else {
        showSection('auth-section');
    }
});

function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.style.display = 'none';
    });
    document.getElementById(sectionId).style.display = 'block';
}

// Signup
document.getElementById('signup-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    try {
        const response = await fetch('/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });
        const data = await response.json();
        if (response.ok) {
            const loginResponse = await fetch('/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const loginData = await loginResponse.json();
            if (loginResponse.ok) {
                localStorage.setItem('token', loginData.token);
                const userResponse = await fetch('/user', {
                    headers: { 'Authorization': `Bearer ${loginData.token}` }
                });
                const user = await userResponse.json();
                if (!user.personalDetails || !user.personalDetails.age || !user.personalDetails.gender) {
                    showSection('details-section');
                } else {
                    showSection('dashboard-section');
                }
            } else {
                alert(loginData.error);
            }
        } else {
            alert(data.error);
        }
    } catch (error) {
        console.error(error);
        alert('Error occurred');
    }
});

// Login
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();
        if (response.ok) {
            localStorage.setItem('token', data.token);
            const userResponse = await fetch('/user', {
                headers: { 'Authorization': `Bearer ${data.token}` }
            });
            const user = await userResponse.json();
            if (!user.personalDetails || !user.personalDetails.age || !user.personalDetails.gender) {
                showSection('details-section');
            } else {
                showSection('dashboard-section');
            }
        } else {
            alert(data.error);
        }
    } catch (error) {
        console.error(error);
        alert('Error occurred');
    }
});

// Personal details
document.getElementById('details-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const age = document.getElementById('details-age').value;
    const gender = document.getElementById('details-gender').value;
    const token = localStorage.getItem('token');
    try {
        const response = await fetch('/user/details', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ age, gender })
        });
        const data = await response.json();
        if (response.ok) {
            showSection('dashboard-section');
        } else {
            alert(data.error);
        }
    } catch (error) {
        console.error(error);
        alert('Error occurred');
    }
});

// Image upload and detection
document.getElementById('upload-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('anti-a', document.getElementById('anti-a').files[0]);
    formData.append('anti-b', document.getElementById('anti-b').files[0]);
    formData.append('anti-d', document.getElementById('anti-d').files[0]);
    formData.append('control', document.getElementById('control').files[0]);
    const token = localStorage.getItem('token');
    document.getElementById('result').innerHTML = 'Processing...';
    try {
        const response = await fetch('/detect', {
            method: 'POST',
            body: formData,
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.status === 401) {
            localStorage.removeItem('token');
            showSection('auth-section');
            alert('Session expired, please log in again');
            return;
        }
        const result = await response.json();
        if (result.error) {
            document.getElementById('result').innerHTML = `Error: ${result.error}`;
        } else {
            document.getElementById('result').innerHTML = `Blood Group: ${result.bloodGroup}`;
        }
    } catch (error) {
        document.getElementById('result').innerHTML = 'Error occurred during detection.';
        console.error(error);
    }
});

// Download report
document.getElementById('download-report').addEventListener('click', async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Please log in first');
        return;
    }
    try {
        const response = await fetch('/report', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.status === 401) {
            localStorage.removeItem('token');
            showSection('auth-section');
            alert('Session expired, please log in again');
            return;
        }
        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'report.pdf';
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } else {
            alert('Failed to download report');
        }
    } catch (error) {
        console.error(error);
        alert('Error occurred');
    }
});

// Logout
document.getElementById('logout').addEventListener('click', () => {
    localStorage.removeItem('token');
    showSection('auth-section');
});