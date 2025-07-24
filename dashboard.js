// Profile Form Submission
document.getElementById('profileForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const age = document.getElementById('age').value;
    const gender = document.getElementById('gender').value;
    const weight = document.getElementById('weight').value;
    const height = document.getElementById('height').value;
    const disease = document.getElementById('disease').value;

    const token = localStorage.getItem('token');

    try {
        const response = await fetch('/api/user/details', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ name, age, gender, weight, height, disease })
        });
        const data = await response.json();
        if (response.ok) {
            Toastify({
                text: 'Profile updated successfully',
                duration: 3000,
                gravity: 'top',
                position: 'right',
                backgroundColor: '#10B981',
            }).showToast();
        } else {
            Toastify({
                text: data.error || 'Failed to update profile',
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

// Blood Group Detection Form Submission
document.getElementById('uploadForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('anti-a', document.getElementById('anti-a').files[0]);
    formData.append('anti-b', document.getElementById('anti-b').files[0]);
    formData.append('anti-d', document.getElementById('anti-d').files[0]);
    formData.append('control', document.getElementById('control').files[0]);

    const token = localStorage.getItem('token');

    document.getElementById('result').innerHTML = 'Processing...';

    try {
        const response = await fetch('/api/detect', {
            method: 'POST',
            body: formData,
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();
        if (response.ok) {
            document.getElementById('result').innerHTML = `Blood Group: ${result.bloodGroup}`;
        } else {
            document.getElementById('result').innerHTML = `Error: ${result.error}`;
        }
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('result').innerHTML = 'An error occurred during detection.';
    }
});
    document.getElementById('download-pdf').addEventListener('click', function () {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Add content to PDF
        doc.text("BloodMap Result", 20, 20);
        
        // For Profile Section (example)
        const name = document.getElementById('name').value;
        const age = document.getElementById('age').value;
        const gender = document.getElementById('gender').value;
        const weight = document.getElementById('weight').value;
        const height = document.getElementById('height').value;
        const disease = document.getElementById('disease').value;

        doc.text("Profile Information", 20, 30);
        doc.text(`Name: ${name}`, 20, 40);
        doc.text(`Age: ${age}`, 20, 50);
        doc.text(`Gender: ${gender}`, 20, 60);
        doc.text(`Weight: ${weight}`, 20, 70);
        doc.text(`Height: ${height}`, 20, 80);
        doc.text(`Medical Conditions: ${disease}`, 20, 90);

        // Add Blood Detection Section (if any result exists)
        const resultText = document.getElementById('result').textContent;
        if (resultText) {
            doc.text("Blood Group Detection Result:", 20, 110);
            doc.text(resultText, 20, 120);
        }

        // Download PDF
        doc.save('BloodMap_Dashboard.pdf');
    });
