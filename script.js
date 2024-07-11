document.getElementById('myForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the default form submission

    const formData = new FormData(this); // Create a FormData object from the form

    fetch('https://n8n.spliert.myds.me/webhook/contact-optera-form', { // Your actual n8n webhook endpoint
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json(); // Assuming the n8n response is in JSON format
    })
    .then(data => {
        console.log('Success:', data); // Log the response JSON if needed
        window.location.href = 'verzonden.html'; // Redirect to index.html
    })
    .catch((error) => {
        console.error('Error:', error);
    });
});
