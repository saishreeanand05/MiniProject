document.querySelectorAll('.action-btn').forEach(button => {
    button.addEventListener('click', function() {
        // Clear active state from all buttons
        document.querySelectorAll('.action-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Add active state to clicked button
        this.classList.add('active');
        
        // Here you would handle the specific SQL operation logic
        console.log(`${this.textContent.trim()} operation selected`);
    });
});

// Hide screen share notice
document.querySelector('.hide-btn').addEventListener('click', function() {
    document.querySelector('.screen-share-notice').style.display = 'none';
});

// Stop screen sharing
document.querySelector('.stop-btn').addEventListener('click', function() {
    document.querySelector('.screen-share-notice').style.display = 'none';
    console.log('Screen sharing stopped');
});