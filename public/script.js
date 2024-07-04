const cryptoTable = document.getElementById('cryptoTable');
const timerElement = document.querySelector('.countdown-timer');
const themeToggle = document.getElementById('themeToggle');

let timer = 60;

function updateTimer() {
    timerElement.textContent = timer;
    timer--;
    if (timer < 0) {
        timer = 60;
        fetchData();
    }
}

async function fetchData() {
    try {
        console.log('Fetching data from /api/crypto...');
        const response = await fetch('/api/crypto');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        updateTable(data);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

function updateTable(data) {
    const tbody = cryptoTable.querySelector('tbody');
    tbody.innerHTML = '';

    data.forEach((crypto, index) => {
        const row = document.createElement('tr');
        const difference = ((crypto.last - crypto.buy) / crypto.buy * 100).toFixed(2);
        const savings = (crypto.last - crypto.buy).toFixed(2);
        
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${crypto.name}</td>
            <td>₹ ${crypto.last}</td>
            <td>₹ ${crypto.buy} / ₹ ${crypto.sell}</td>
            <td>${difference}%</td>
            <td>₹ ${savings}</td>
        `;
        tbody.appendChild(row);
    });
}

themeToggle.addEventListener('change', () => {
    document.body.classList.toggle('dark-theme');
});

// Initial fetch
fetchData();

// Update timer every second
setInterval(updateTimer, 1000);
