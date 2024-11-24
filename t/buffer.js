function calculateBuffer(rainfall, area, pumpCapacity, timeMinutes) {
    const rainfallMeters = rainfall / 1000; // mm to m
    const timeHours = timeMinutes / 60;
    const bufferSize = (rainfallMeters * area) - (pumpCapacity * timeHours);
    return Math.max(bufferSize, 0);
}

function getRainData(time) {
    const timeData = [10, 30, 60, 120, 240, 480, 720, 1440, 2880, 5760, 11520];
    const rainData = [18, 27, 33, 39, 45, 52, 56, 66, 79, 96, 122];

    // If the time is out of range, return the closest value
    if (time <= timeData[0]) return rainData[0];
    if (time >= timeData[timeData.length - 1]) return rainData[rainData.length - 1];

    // Find the interval containing the time
    for (let i = 0; i < timeData.length - 1; i++) {
        if (time >= timeData[i] && time <= timeData[i + 1]) {
            // Perform linear interpolation
            const t1 = timeData[i];
            const t2 = timeData[i + 1];
            const r1 = rainData[i];
            const r2 = rainData[i + 1];

            const slope = (r2 - r1) / (t2 - t1);
            return r1 + slope * (time - t1);
        }
    }
    return null; // Should not reach here
}

function getMaxBuffer(pumpCapacity, numberOfPumps, effectiefOppervlak) {
    const timeData = [10, 30, 60, 120, 240, 480, 720, 1440, 2880, 5760, 11520];
    const rainData = [18, 27, 33, 39, 45, 52, 56, 66, 79, 96, 122];
    let maximum = 0;
    for (let i = 0; i < timeData.length - 1; i++) {
        maximum = Math.max(calculateBuffer(rainData[i], effectiefOppervlak, pumpCapacity * numberOfPumps, timeData[i]),maximum)
    }
    return maximum
}
function getBufferEmpty(pumpCapacity, numberOfPumps, effectiefOppervlak) {
    for (let i = 10; i < 11520; i++) {
        let buffer = calculateBuffer(getRainData(i), effectiefOppervlak, pumpCapacity * numberOfPumps, i)
        if (buffer <= 0){
            return i/60;
        }
    }
    return Infinity
}

document.addEventListener('DOMContentLoaded', () => {
    const oppervlakC10Input = document.getElementById('oppervlakC10');
    const oppervlakC09Input = document.getElementById('oppervlakC09');
    const oppervlakC05Input = document.getElementById('oppervlakC05');
    const oppervlakC03Input = document.getElementById('oppervlakC03');
    const pumpCapacityInput = document.getElementById('pumpCapacity');
    const numberOfPumpsInput = document.getElementById('numberOfPumps');
    const calculationsDiv = document.getElementById('calculations');
    const bufferChartCanvas = document.getElementById('bufferChart');
    const waterLevelChartCanvas = document.getElementById('waterLevelChart');
    let bufferChart, waterLevelChart;
    const alertHeader = document.querySelector('.alert-header');
    const alert = document.querySelector('.alert');

    alertHeader.addEventListener('click', toggleReference);

    function toggleReference() {
        console.log("Toggling reference...");
        alert.classList.toggle('show');
    }

    function calculateResults() {
        const oppervlakC10 = parseFloat(oppervlakC10Input.value);
        const oppervlakC09 = parseFloat(oppervlakC09Input.value);
        const oppervlakC05 = parseFloat(oppervlakC05Input.value);
        const oppervlakC03 = parseFloat(oppervlakC03Input.value);
        const pumpCapacity = parseFloat(pumpCapacityInput.value);
        const numberOfPumps = parseInt(numberOfPumpsInput.value, 10);

        const effectiefOppervlak = oppervlakC10 + oppervlakC09 * 0.9 + oppervlakC05 * 0.5 + oppervlakC03 * 0.3
        const totaalOppervlak = oppervlakC10 + oppervlakC09 + oppervlakC05 + oppervlakC03

        const maximumBuffer = getMaxBuffer(pumpCapacity,numberOfPumps,effectiefOppervlak)
        const bufferEmptyTime = getBufferEmpty(pumpCapacity, numberOfPumps, effectiefOppervlak)
        displayResults(effectiefOppervlak, pumpCapacity, numberOfPumps,maximumBuffer,totaalOppervlak,bufferEmptyTime);
        updateCharts(effectiefOppervlak, pumpCapacity, numberOfPumps,maximumBuffer);
    }

    function displayResults(effectiefOppervlak, pumpCapacity, numberOfPumps,maximumBuffer,totaalOppervlak,bufferEmptyTime) {
        calculationsDiv.innerHTML = `
            <p><strong>Totaal Oppervlak:</strong> ${totaalOppervlak.toFixed(2)} m²</p>
            <p><strong>Effectief Oppervlak:</strong> ${effectiefOppervlak.toFixed(2)} m²</p>
            <p><strong>Pomp Capaciteit:</strong> ${numberOfPumps.toFixed(0)} * ${pumpCapacity.toFixed(2)} m³/uur = ${pumpCapacity.toFixed(2) * numberOfPumps.toFixed(2)} m³/uur</p>
            <p><strong>Benodigde Buffer:</strong> ${maximumBuffer.toFixed(2)} m³</p>
            <p><strong>Tijd tot buffer leeg:</strong> ${bufferEmptyTime.toFixed(2)} uur</p>
            <p><strong>Systeemtoereikendheid:</strong> ${bufferEmptyTime <= 24 ? '<span style="color: green;">Voldoende</span>' : '<span style="color: red;">Onvoldoende</span>'}</p>        `;
    }

    function updateCharts(effectiefOppervlak, pumpCapacity, numberOfPumps,maximumBuffer) {
        // Water Level Over Time Chart
        const timeSteps = [10, 30, 60, 120, 240, 480, 720, 1440, 2880, 5760, 11520];

        // Calculate the water level at each time step
        const waterLevels = timeSteps.map(time => {
            return calculateBuffer(getRainData(time), effectiefOppervlak, pumpCapacity * numberOfPumps, time);
        });

        const waterLevelData = {
            labels: timeSteps.map(t => `${t < 60 ? `${(t)} min` : `${(t/60)} uur`}`),
            datasets: [
                {
                    label: 'Water Level (m³)',
                    data: waterLevels,
                    backgroundColor: 'rgba(0, 123, 255, 0.5)',
                    borderColor: '#007bff',
                    fill: true,
                },
            ],
        };

        const waterLevelConfig = {
            type: 'line',
            data: waterLevelData,
            options: {
                responsive: true,
                plugins: {
                    annotation: {
                        annotations: {
                            designLine2: {
                                type: 'line',
                                yMin: maximumBuffer,
                                yMax: maximumBuffer,
                                borderColor: 'black',
                                borderWidth: 2,
                                label: {
                                    content: 'Design Volume',
                                    enabled: true,
                                    position: 'top',
                                },
                            },
                        },
                    },
                },
                scales: {
                    x: {
                        title: {
                            display: false,
                            text: 'Tijd (min)',
                        },
                    },
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Water Level (m³)',
                        },
                    },
                },
            },
        };

        if (waterLevelChart) {
            waterLevelChart.destroy();
        }
        waterLevelChart = new Chart(waterLevelChartCanvas, waterLevelConfig);
    }

    const inputs = document.querySelectorAll('.input-group input');
    inputs.forEach(input => input.addEventListener('input', calculateResults));

    calculateResults();
});
document.addEventListener("DOMContentLoaded", () => {
    const buttons = document.querySelectorAll(".btn-minus, .btn-plus");

    // Add event listeners for buttons
    buttons.forEach((button) => {
        button.addEventListener("click", (e) => {
            const input = e.target.parentElement.querySelector("input");
            const step = parseFloat(button.getAttribute("data-step"));
            const value = parseFloat(input.value) || 0;

            let newValue = button.classList.contains("btn-plus")
                ? value + step
                : value - step;

            newValue = parseFloat(newValue.toFixed(5)); // Avoid floating-point issues
            input.value = newValue > 0 ? newValue : 0; // Ensure no negative values
            input.dispatchEvent(new Event("input")); // Trigger 'input' event for calculations
        });
    });
});
