// Main Application Logic

function showTab(tabName) {
    // Hide all tabs
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => {
        tab.classList.remove('active');
    });

    // Show selected tab
    const selectedTab = document.getElementById(tabName + '-tab');
    if (selectedTab) {
        selectedTab.classList.add('active');
    }

    // Reload data if needed
    if (tabName === 'shop') {
        loadShopItems();
    } else if (tabName === 'inventory') {
        loadInventory();
    }
}

// Close modals when clicking outside
window.onclick = function (event) {
    const modModal = document.getElementById('mod-menu-modal');
    const gameModal = document.getElementById('game-modal');

    if (event.target === modModal) {
        closeModMenu();
    }
    if (event.target === gameModal) {
        closeGame();
    }
}

// Initialize on page load
window.addEventListener('load', () => {
    console.log('PugHaven loaded! 🐶');
});
