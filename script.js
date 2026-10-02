// State Management
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let chartInstance = null;

// DOM Elements
const transactionForm = document.getElementById('transactionForm');
const descriptionInput = document.getElementById('description');
const amountInput = document.getElementById('amount');
const typeInput = document.getElementById('type');
const categoryInput = document.getElementById('category');

const totalBalanceEl = document.getElementById('totalBalance');
const totalIncomeEl = document.getElementById('totalIncome');
const totalExpenseEl = document.getElementById('totalExpense');

const transactionListEl = document.getElementById('transactionList');
const filterCategorySelect = document.getElementById('filterCategory');
const exportBtn = document.getElementById('exportBtn');

// Initialize App
function init() {
    updateSummary();
    renderList();
    renderChart();
}

// Add Transaction
transactionForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const newTransaction = {
        id: Date.now(),
        description: descriptionInput.value,
        amount: parseFloat(amountInput.value),
        type: typeInput.value,
        category: categoryInput.value,
        date: new Date().toLocaleDateString()
    };

    transactions.push(newTransaction);
    saveData();
    init();

    // Reset Form
    descriptionInput.value = '';
    amountInput.value = '';
});

// Save to LocalStorage
function saveData() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

// Update Totals
function updateSummary() {
    const income = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

    const expense = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

    const balance = income - expense;

    totalBalanceEl.textContent = `₹${balance.toFixed(2)}`;
    totalIncomeEl.textContent = `₹${income.toFixed(2)}`;
    totalExpenseEl.textContent = `₹${expense.toFixed(2)}`;
}

// Render Transactions List
function renderList() {
    transactionListEl.innerHTML = '';
    const selectedCategory = filterCategorySelect.value;

    const filtered = selectedCategory === 'all' 
        ? transactions 
        : transactions.filter(t => t.category === selectedCategory);

    if (filtered.length === 0) {
        transactionListEl.innerHTML = '<li style="text-align: center; color: #94a3b8; padding: 10px;">No transactions found</li>';
        return;
    }

    filtered.forEach(t => {
        const li = document.createElement('li');
        li.className = `transaction-item ${t.type}`;
        li.innerHTML = `
            <div class="item-info">
                <h4>${t.description}</h4>
                <span>${t.category} • ${t.date}</span>
            </div>
            <div class="item-amount">
                <strong>${t.type === 'income' ? '+' : '-'}₹${t.amount.toFixed(2)}</strong>
                <button class="delete-btn" onclick="deleteTransaction(${t.id})">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        `;
        transactionListEl.appendChild(li);
    });
}

// Delete Item
function deleteTransaction(id) {
    transactions = transactions.filter(t => t.id !== id);
    saveData();
    init();
}

// Filter Event Listener
filterCategorySelect.addEventListener('change', renderList);

// Render Category Chart
function renderChart() {
    const ctx = document.getElementById('expenseChart').getContext('2d');

    // Group Expenses by Category
    const categoryTotals = {};
    transactions
        .filter(t => t.type === 'expense')
        .forEach(t => {
            categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
        });

    const labels = Object.keys(categoryTotals);
    const data = Object.values(categoryTotals);

    if (chartInstance) {
        chartInstance.destroy();
    }

    chartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels.length ? labels : ['No Expenses'],
            datasets: [{
                data: data.length ? data : [1],
                backgroundColor: [
                    '#ef4444', '#f97316', '#eab308', 
                    '#38bdf8', '#a855f7', '#ec4899'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: '#f8fafc', font: { size: 10 } }
                }
            }
        }
    });
}

// Export CSV Function
exportBtn.addEventListener('click', () => {
    if (!transactions.length) return alert('No data to export!');

    let csv = 'Description,Amount,Type,Category,Date\n';
    transactions.forEach(t => {
        csv += `"${t.description}",${t.amount},${t.type},${t.category},${t.date}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'expenses.csv';
    a.click();
});

// Run App
init();