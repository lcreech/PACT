// Load saved habits when the page loads
window.onload = () => {
    loadHabits();
};

// Function to add a new habit to a specific category
function addHabit(category) {
    const habitName = prompt(`Enter a new habit for ${category}:`);

    if (habitName && habitName.trim()) {
        const habit = {
            name: habitName,
            completed: false,
        };

        // Save the new habit to LocalStorage
        const categoryLog = getCategoryLog(category);
        categoryLog.push(habit);
        localStorage.setItem(category, JSON.stringify(categoryLog));

        // Re-load the habit list to update the UI
        loadHabits();
    } else {
        alert("Habit name cannot be empty!");
    }
}

// Load and display all habits for each category
function loadHabits() {
    const categories = ['physical', 'academic', 'creative', 'tiered'];
    categories.forEach(category => {
        const categoryLog = getCategoryLog(category);
        displayHabits(category, categoryLog);
    });
}

// Get the habit log for a specific category from LocalStorage
function getCategoryLog(category) {
    const log = localStorage.getItem(category);
    return log ? JSON.parse(log) : [];
}

// Display the habits for a given category
function displayHabits(category, habits) {
    const habitLogElement = document.getElementById(`${category}-log`);
    habitLogElement.innerHTML = ''; // Clear the existing list

    habits.forEach((habit, index) => {
        const habitItem = document.createElement('li');
        habitItem.innerHTML = `
            <label>
                <input type="checkbox" ${habit.completed ? 'checked' : ''} onchange="toggleHabitCompletion('${category}', ${index})">
                ${habit.name}
            </label>
            <button onclick="deleteHabit('${category}', ${index})">Delete</button>
        `;
        habitLogElement.appendChild(habitItem);
    });
}

// Toggle the completion status of a habit
function toggleHabitCompletion(category, index) {
    const categoryLog = getCategoryLog(category);
    categoryLog[index].completed = !categoryLog[index].completed;
    localStorage.setItem(category, JSON.stringify(categoryLog));

    loadHabits(); // Refresh the habit list
}

// Delete a habit from a category
function deleteHabit(category, index) {
    const categoryLog = getCategoryLog(category);
    categoryLog.splice(index, 1); // Remove the habit from the array
    localStorage.setItem(category, JSON.stringify(categoryLog));

    loadHabits(); // Refresh the habit list
}
