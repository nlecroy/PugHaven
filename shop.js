// Shop System

const shopItems = [
    {
        id: 'rainbow_name',
        name: '🌈 Rainbow Name',
        description: 'Your name appears in rainbow colors throughout the site!',
        price: 500,
        effect: 'rainbow_name'
    },
    {
        id: 'pug_emoji',
        name: '🐶 Custom Pug Emoji',
        description: 'Unlock exclusive pug emojis in chat!',
        price: 300,
        effect: 'pug_emoji'
    },
    {
        id: 'double_skittles',
        name: '💰 Double Skittles Boost',
        description: 'Earn 2x Skittles from games for 24 hours!',
        price: 1000,
        effect: 'double_skittles'
    },
    {
        id: 'golden_frame',
        name: '⭐ Golden Frame',
        description: 'Your messages get a golden border in chat!',
        price: 750,
        effect: 'golden_frame'
    },
    {
        id: 'vip_badge',
        name: '👑 VIP Badge',
        description: 'Display a VIP badge next to your name!',
        price: 2000,
        effect: 'vip_badge'
    },
    {
        id: 'confetti_effect',
        name: '🎉 Confetti Effect',
        description: 'Confetti appears when you send messages!',
        price: 600,
        effect: 'confetti_effect'
    }
];

function loadShopItems() {
    const shopContainer = document.getElementById('shop-items');
    shopContainer.innerHTML = '';

    shopItems.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'shop-item';

        // Check if user already owns this item
        const owned = currentUser.items && currentUser.items[item.id];

        itemDiv.innerHTML = `
            <h3>${item.name}</h3>
            <p>${item.description}</p>
            <p class="price">💰 ${item.price} Skittles</p>
            ${owned
                ? '<button class="owned-btn" disabled>✓ Owned</button>'
                : `<button onclick="purchaseItem('${item.id}')">Buy Now</button>`
            }
        `;

        shopContainer.appendChild(itemDiv);
    });
}

async function purchaseItem(itemId) {
    if (accountSuspended) {
        alert('Your account is suspended. You cannot make purchases.');
        return;
    }

    const item = shopItems.find(i => i.id === itemId);
    if (!item) return;

    if (currentUser.skittles < item.price) {
        alert('Not enough Skittles! You need ' + item.price + ' Skittles.');
        return;
    }

    try {
        // Deduct skittles and add item
        const newSkittles = currentUser.skittles - item.price;
        const updates = {};
        updates['skittles'] = newSkittles;
        updates['items/' + itemId] = {
            name: item.name,
            price: item.price,
            purchasedAt: Date.now(),
            effect: item.effect
        };

        await database.ref('users/' + currentUser.uid).update(updates);

        currentUser.skittles = newSkittles;
        if (!currentUser.items) currentUser.items = {};
        currentUser.items[itemId] = updates['items/' + itemId];

        updateSkittlesDisplay();
        loadShopItems();
        loadInventory();

        alert('✅ Purchase successful! You bought ' + item.name);
    } catch (error) {
        console.error('Purchase error:', error);
        alert('Failed to complete purchase');
    }
}

function loadInventory() {
    const inventoryContainer = document.getElementById('inventory-items');
    const noItemsMsg = document.getElementById('no-items-msg');

    inventoryContainer.innerHTML = '';

    if (!currentUser.items || Object.keys(currentUser.items).length === 0) {
        noItemsMsg.classList.remove('hidden');
        return;
    }

    noItemsMsg.classList.add('hidden');

    Object.entries(currentUser.items).forEach(([itemId, itemData]) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'inventory-item';

        const purchaseDate = new Date(itemData.purchasedAt).toLocaleDateString();

        itemDiv.innerHTML = `
            <h3>${itemData.name}</h3>
            <p class="purchased-date">Purchased: ${purchaseDate}</p>
            <p class="refund-value">Refund: 💰 ${itemData.price} Skittles</p>
            <button onclick="refundItem('${itemId}', ${itemData.price})">Refund Item</button>
        `;

        inventoryContainer.appendChild(itemDiv);
    });
}

async function refundItem(itemId, price) {
    if (accountSuspended) {
        alert('Your account is suspended. You cannot refund items.');
        return;
    }

    const confirmRefund = confirm(`Refund this item for ${price} Skittles?`);
    if (!confirmRefund) return;

    try {
        const newSkittles = currentUser.skittles + price;

        await database.ref('users/' + currentUser.uid).update({
            skittles: newSkittles,
            ['items/' + itemId]: null // Remove the item
        });

        currentUser.skittles = newSkittles;
        delete currentUser.items[itemId];

        updateSkittlesDisplay();
        loadShopItems();
        loadInventory();

        alert('✅ Item refunded! You received ' + price + ' Skittles back.');
    } catch (error) {
        console.error('Refund error:', error);
        alert('Failed to refund item');
    }
}
