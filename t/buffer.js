document.addEventListener('DOMContentLoaded', () => {
    const parkingAreaInput = document.getElementById('parkingArea');
    const roofAreaInput = document.getElementById('roofArea');
    const parkingRainfallIntensityInput = document.getElementById('parkingRainfallIntensity'); // Rainfall intensity for parking area
    const roofRainfallIntensityInput = document.getElementById('roofRainfallIntensity'); // Rainfall intensity for roof area
    const designDurationInput = document.getElementById('designDuration');
    const bufferVolumeInput = document.getElementById('bufferVolume');
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
        const parkingArea = parseFloat(parkingAreaInput.value);
        const roofArea = parseFloat(roofAreaInput.value);
        const parkingRainfallIntensity = parseFloat(parkingRainfallIntensityInput.value);
        const roofRainfallIntensity = parseFloat(roofRainfallIntensityInput.value);
        const designDuration = parseFloat(designDurationInput.value);
        const bufferVolume = parseFloat(bufferVolumeInput.value);
        const pumpCapacity = parseFloat(pumpCapacityInput.value);
        const numberOfPumps = parseInt(numberOfPumpsInput.value, 10);

        // Calculate the rainwater flow volume (m³)
        const rainwaterFlowVolume = 
        (parkingArea * parkingRainfallIntensity) + 
        (roofArea * roofRainfallIntensity);
        // Calculate total rainfall volume based on separate intensities for parking and roof
        const totalRainfallVolume =
            (parkingArea * parkingRainfallIntensity * designDuration) +
            (roofArea * roofRainfallIntensity * designDuration);

        const totalPumpCapacity = pumpCapacity * numberOfPumps * designDuration;

        // Time to Fill Buffer calculation: Buffer Volume / (Rainfall Volume - Pump Capacity)
        const rainToPumpRatio = (totalRainfallVolume - totalPumpCapacity) / designDuration;
        const timeToFillBuffer = rainToPumpRatio > 0 ? bufferVolume / rainToPumpRatio : 0;

        // Check if the system is sufficient
        const requiredBufferVolume = Math.max(totalRainfallVolume - totalPumpCapacity, 0);
        const systemSufficient = bufferVolume >= requiredBufferVolume;

        displayResults(rainwaterFlowVolume,totalRainfallVolume, totalPumpCapacity, requiredBufferVolume, systemSufficient, timeToFillBuffer);
        updateCharts(rainwaterFlowVolume,totalRainfallVolume, totalPumpCapacity, bufferVolume, designDuration, parkingRainfallIntensity, roofRainfallIntensity, pumpCapacity, numberOfPumps);
    }

    function displayResults(rainwaterFlowVolume,totalRainfallVolume, totalPumpCapacity, requiredBufferVolume, systemSufficient, timeToFillBuffer) {
        calculationsDiv.innerHTML = `
            <p><strong>Volume Regenwaterstroom:</strong> ${rainwaterFlowVolume.toFixed(2)} m³/u</p>
            <p><strong>Totaal Volume Regenwater:</strong> ${totalRainfallVolume.toFixed(2)} m³</p>
            <p><strong>Totale Pomp Capaciteit:</strong> ${totalPumpCapacity.toFixed(2)} m³</p>
            <p><strong>Benodigde Volume Buffer:</strong> ${requiredBufferVolume.toFixed(2)} m³</p>
            <p><strong>Systeemtoereikendheid:</strong> ${systemSufficient ? '<span style="color: green;">Voldoende</span>' : '<span style="color: red;">Onvoldoende</span>'}</p>
            <p><strong>Tijd Tot Vullen Buffer:</strong> ${timeToFillBuffer > 0 ? timeToFillBuffer.toFixed(2) + ' uur' : 'Voldoende Buffer'}</p>
        `;
    }

    function updateCharts(rainwaterFlowVolume,totalRainfallVolume, totalPumpCapacity, bufferVolume, designDuration, parkingRainfallIntensity, roofRainfallIntensity, pumpCapacity, numberOfPumps) {
        // Buffer Volume Bar Chart
        const barData = {
            labels: ['Totaal Volume Regenwater', 'Totale Pomp Capaciteit', 'Buffer Volume'],
            datasets: [
                {
                    label: 'Volume (m³)',
                    data: [totalRainfallVolume, totalPumpCapacity, bufferVolume],
                    backgroundColor: ['#007bff', '#28a745', '#ffc107'],
                },
            ],
        };
    
        const barConfig = {
            type: 'bar',
            data: barData,
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false,
                    },
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Volume (m³)',
                        },
                    },
                },
            },
        };
    
        if (bufferChart) {
            bufferChart.destroy();
        }
        bufferChart = new Chart(bufferChartCanvas, barConfig);
    
        // Water Level Over Time Chart
        const timeSteps = Array.from({ length: designDuration + 3 }, (_, i) => i); // Time in hours
        const rainwaterPerHour = rainwaterFlowVolume;
        const pumpRatePerHour = pumpCapacity * numberOfPumps;
    
        // Calculate the water level at each time step
        const waterLevels = timeSteps.map(time => {
            const waterInput = rainwaterPerHour * time;  // Amount of water coming in at each hour
            const pumpOutput = pumpRatePerHour * time;  // Amount of water pumped out at each hour
            const netWater = Math.max(waterInput - pumpOutput, 0); // Ensure no negative water level
            return netWater;
        });
    
        const waterLevelData = {
            labels: timeSteps.map(t => `${t}u`),
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
                            designLine: {
                                type: 'line',
                                xMin: designDuration, // Show at designDuration
                                xMax: designDuration,
                                borderColor: 'red',
                                borderWidth: 2,
                                label: {
                                    content: 'Design Duration',
                                    enabled: true,
                                    position: 'top',
                                },
                            },
                            designLine2: {
                                type: 'line',
                                yMin: bufferVolume,
                                yMax: bufferVolume,
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
                            display: true,
                            text: 'Tijd (uur)',
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
