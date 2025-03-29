document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('peripheralForm');
    const peripheralSelect = document.getElementById('peripheral');
    const addButton = document.getElementById('addPeripheral');
    const peripheralList = document.getElementById('peripheralList');
    const selectedPeripheralsInput = document.getElementById('selectedPeripherals');
    const cancelButton = document.getElementById('cancelButton');
    const messageScreen = document.getElementById('messageScreen');
    const messageContent = document.getElementById('messageContent');
    const backToForm = document.getElementById('backToForm');
    const errorModal = document.getElementById('errorModal');
    const errorMessage = document.getElementById('errorMessage');
    const errorCode = document.getElementById('errorCode');
    const retryButton = document.getElementById('retryButton');
    const closeErrorButton = document.getElementById('closeErrorButton');

    
    // Array to store selected peripherals
    let selectedPeripherals = [];
    // Store form data for retry functionality
    let lastFormData = null;
    // device Id if device is added to database
    let deviceId = null ;
    
    // Add peripheral to the list
    addButton.addEventListener('click', function() {
        const peripheral = peripheralSelect.value;
        
        if (peripheral && !selectedPeripherals.includes(peripheral)) {
            // Add to array
            selectedPeripherals.push(peripheral);
            
            // Create list item
            const li = document.createElement('li');
            li.className = 'peripheral-item';
            li.innerHTML = `
                <span>${peripheral}</span>
                <button type="button" class="btn-delete" data-peripheral="${peripheral}">×</button>
            `;
            
            // Add to list
            peripheralList.appendChild(li);
            
            // Update hidden input
            selectedPeripheralsInput.value = JSON.stringify(selectedPeripherals);
            
            // Reset select
            peripheralSelect.value = '';
        }
    });
    
    // Remove peripheral from the list
    peripheralList.addEventListener('click', function(e) {
        if (e.target.classList.contains('btn-delete')) {
            const button = e.target;
            const peripheral = button.getAttribute('data-peripheral');
            
            // Remove from array
            selectedPeripherals = selectedPeripherals.filter(p => p !== peripheral);
            
            // Remove list item
            button.parentElement.remove();
            
            // Update hidden input
            selectedPeripheralsInput.value = JSON.stringify(selectedPeripherals);
        }
    });
    
    // Cancel button
    cancelButton.addEventListener('click', function() {
        // Reset form
        form.reset();
        
        // Clear peripheral list
        peripheralList.innerHTML = '';
        selectedPeripherals = [];
        selectedPeripheralsInput.value = '';

        window.location.href = '/devices'; 

    });
    
    // Back to form button
    backToForm.addEventListener('click', function() {
        form.style.display = 'block';
        messageScreen.style.display = 'none';
    });
    
    // Close error modal
    closeErrorButton.addEventListener('click', function() {
        errorModal.style.display = 'none';
    });
    
    // Retry button in error modal
    retryButton.addEventListener('click', function() {
        errorModal.style.display = 'none';
        
        form.style.display = 'block';
        messageScreen.style.display = 'none';
    });
    
    // Helper function to add a message to the message screen
    function addMessage(text, type = 'info', errorDetails = null, isFinal = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        
        // Add special class for final message
        if (isFinal) {
            messageDiv.classList.add('final-message');
        }
        
        const now = new Date();
        const timeString = now.toLocaleTimeString();
        
        let messageHTML = `${text}<div class="message-time">${timeString}</div>`;
        
        // Add error details if provided
        if (errorDetails && type === 'error') {
            messageHTML += `<div class="error-details">Error: ${errorDetails.code}</div>`;
            
            // Add action button based on error type
            if (errorDetails.actionable) {
                messageHTML += `<button class="error-action-btn" data-action="${errorDetails.action}" data-error-id="${errorDetails.id}">
                    ${errorDetails.actionText}
                </button>`;
            }
        }
        
        messageDiv.innerHTML = messageHTML;
        messageContent.appendChild(messageDiv);
        messageDiv.scrollIntoView({ behavior: 'smooth' });
        
        // Add event listener to error action button if it exists
        if (errorDetails && errorDetails.actionable) {
            const actionButton = messageDiv.querySelector('.error-action-btn');
            if (actionButton) {
                actionButton.addEventListener('click', function() {
                    const action = this.getAttribute('data-action');
                    const errorId = this.getAttribute('data-error-id');
                    
                    handleErrorAction(action, errorId);
                });
            }
        }
        
        // Add continue button if this is the final message
        if (isFinal) {
            // Check if a continue button container already exists
            let continueContainer = document.querySelector('.continue-button-container');
            
            if (!continueContainer) {
                // Create container for continue button
                continueContainer = document.createElement('div');
                continueContainer.className = 'continue-button-container';
                
                // Create continue button
                const continueButton = document.createElement('button');
                continueButton.className = 'btn-continue';
                continueButton.textContent = 'Continue to Dashboard';
                continueButton.addEventListener('click', function() {
                    // Navigate to another page
                    window.location.href = '/devices'; // Change this to your desired URL
                });
                
                // Add button to container
                continueContainer.appendChild(continueButton);
                
                // Add container after the message content
                messageContent.parentNode.insertBefore(continueContainer, backToForm);
            }
        }
    }
    
    // Handle error action
    function handleErrorAction(action, errorId) {
        switch(action) {
            case 'retry':
                addMessage('Retrying request...', 'info');
                // Simulate retry logic
                setTimeout(() => {
                    const random = Math.random();
                    if (random > 0.5) {
                        addMessage('Retry successful!', 'success');
                    } else {
                        addMessage('Retry failed. Please try again later.', 'error', {
                            code: 'RETRY_FAILED',
                            id: 'retry-' + Date.now(),
                            actionable: true,
                            action: 'contact_support',
                            actionText: 'Contact Support'
                        });
                    }
                }, 1500);
                break;
            case 'contact_support':
                addMessage('Opening support ticket...', 'info');
                // Simulate opening support ticket
                setTimeout(() => {
                    addMessage('Support ticket #ST-' + Math.floor(Math.random() * 10000) + ' created. Our team will contact you shortly.', 'success');
                }, 1000);
                break;
            case 'check_status':
                addMessage('Checking request status...', 'info');
                // Simulate checking status
                setTimeout(() => {
                    addMessage('Your request is still being processed. Please wait.', 'info');
                }, 1000);
                break;
            default:
                addMessage('Unknown action', 'error');
        }
    }
    
    // Show error modal
    function showErrorModal(message, code) {
        errorMessage.textContent = message || 'An unexpected error occurred while processing your request.';
        errorCode.textContent = 'Error Code: ' + (code || 'UNKNOWN');
        errorModal.style.display = 'flex';
    }
    
    // Process form submission
    function processFormSubmission(formData) {
        // Store form data for retry functionality
        lastFormData = formData;
        
        
        // Show message screen
        form.style.display = 'none';
        messageScreen.style.display = 'block';
        
        // Clear previous messages
        messageContent.innerHTML = '';
        
        // Remove any existing continue button container
        const existingContinueContainer = document.querySelector('.continue-button-container');
        if (existingContinueContainer) {
            existingContinueContainer.remove();
        }
        
        // Add initial message
        addMessage('Form submitted successfully! Connecting to server...', 'success');

        const socket = io();
        socket.on('connect', async ()=>{
            addMessage('Connected to the server', 'success');
            addMessage('Sending Data to the server', 'success');
            deviceId = await socket.emitWithAck('addDevice', formData)
            addMessage(`The device is added to the database, setup the device...`, 'success');
            socket.emit('setupDevice', deviceId)
        })
        
        socket.on('processSetup', res => {
            addMessage(res.data, 'success');
            if(res.status === 'finished')
                addMessage(`the esp32 setup is finished successfully!`, 'success', null, true);

        })

        socket.on('errorSetup', res => {
            addMessage(res.data, 'success');
            const errorDetails = {
                code: 'err.message',
                id: 'server-' + Date.now(),
                actionable: true,
                action: 'retry',
                actionText: res.data
            };
    
            addMessage('Error: Server encountered an internal error while processing your request.', 'error', errorDetails);
    
            // Show error modal
            showErrorModal(
                'The server encountered an internal error while processing your request. Please try again later or contact support if the issue persists.',
                'SERVER_ERROR_500'
            );
        })
                

    }
    
    // Form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = {
            name: document.getElementById('name').value,
            location: document.getElementById('location').value,
            peripherals: selectedPeripherals
        };
        
        console.log('Form submitted:', formData);
        
        // Process the form submission
        processFormSubmission(formData);
    });
    
    // Event delegation for message content actions
    messageContent.addEventListener('click', function(e) {
        if (e.target.classList.contains('error-action-btn')) {
            const action = e.target.getAttribute('data-action');
            const errorId = e.target.getAttribute('data-error-id');
            
            handleErrorAction(action, errorId);
        }
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === errorModal) {
            errorModal.style.display = 'none';
        }
    });
    
    // Escape key to close modal
    window.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && errorModal.style.display === 'flex') {
            errorModal.style.display = 'none';
        }
    });
});
