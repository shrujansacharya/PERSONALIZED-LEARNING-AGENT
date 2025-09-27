const key = 'AIzaSyAn7T-Z1weqVC1NYi1Y-5UcA-NSUpmPasg';
const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models';

fetch(apiUrl, {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': key
    }
})
.then(response => {
    if (response.ok) {
        console.log('API key is valid!');
        return response.json();
    } else {
        return response.json().then(errorData => {
            throw new Error(`API Key is invalid. Status: ${response.status}, Error: ${JSON.stringify(errorData)}`);
        });
    }
})
.then(data => console.log('Available models:', data))
.catch(error => console.error(error.message));