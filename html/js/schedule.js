// Schedule data structure
const scheduleData = {
    timeSlots: [
        "8:00 AM - 9:30 AM",
        "9:45 AM - 11:15 AM",
        "11:30 AM - 1:00 PM"
    ],
    days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    classes: {
        "Monday": {
            "8:00 AM - 9:30 AM": {
                subject: "Mathematics",
                teacher: "Mr. Johnson"
            },
            "9:45 AM - 11:15 AM": {
                subject: "Physics",
             
                teacher: "Ms. Thompson"
            },
            "11:30 AM - 1:00 PM": {
                subject: "English",
                teacher: "Mrs. Davis"
            }
        },
        "Tuesday": {
            "8:00 AM - 9:30 AM": {
                subject: "Biology",
                teacher: "Dr. Miller"
            },
            "9:45 AM - 11:15 AM": {
                subject: "History",
                teacher: "Mr. Anderson"
            },
            "11:30 AM - 1:00 PM": {
                subject: "Physics",
                teacher: "Ms. Thompson"
            }
        },
        "Wednesday": {
            "8:00 AM - 9:30 AM": {
                subject: "Mathematics",
                teacher: "Mr. Johnson"
            },
            "9:45 AM - 11:15 AM": {
                subject: "English",
                teacher: "Mrs. Davis"
            },
            "11:30 AM - 1:00 PM": {
                subject: "History",
                teacher: "Mr. Anderson"
            }
        },
        "Thursday": {
            "8:00 AM - 9:30 AM": {
                subject: "Physics",
                teacher: "Ms. Thompson"
            },
            "9:45 AM - 11:15 AM": {
                subject: "Mathematics",
                teacher: "Mr. Johnson"
            },
            "11:30 AM - 1:00 PM": {
                subject: "Biology",
                teacher: "Dr. Miller"
            }
        },
        "Friday": {
            "8:00 AM - 9:30 AM": {
                subject: "Chemistry",
                teacher: "Mrs. Wilson"
            },
            "9:45 AM - 11:15 AM": {
                subject: "Physics",
                teacher: "Ms. Thompson"
            },
            "11:30 AM - 1:00 PM": {
                subject: "English",
                teacher: "Mrs. Davis"
            }
        }
    }
};

// Function to create a class block element
function createClassBlock(classInfo) {
    if (!classInfo) return '<div class="class-block empty">No Class</div>';

    return `
        <div class="class-block">
            <div class="subject-name subject-${classInfo.subject.toLowerCase()}">${classInfo.subject}</div>
            <div class="class-info">
                <div class="room-info">
                    <i class="fas fa-door-open"></i>
                    Room ${classInfo.room}
                </div>
                <div class="teacher-info">
                    <i class="fas fa-chalkboard-teacher"></i>
                    ${classInfo.teacher}
                </div>
            </div>
        </div>
    `;
}

// Function to render the schedule
function renderSchedule() {
    const tableBody = document.querySelector('.weekly-schedule tbody');
    tableBody.innerHTML = ''; // Clear existing content

    scheduleData.timeSlots.forEach(timeSlot => {
        const row = document.createElement('tr');
        
        // Add time slot cell
        row.innerHTML = `
            <td class="time-slot">
                <i class="far fa-clock"></i>
                ${timeSlot}
            </td>
        `;

        // Add class cells for each day
        scheduleData.days.forEach(day => {
            const classInfo = scheduleData.classes[day][timeSlot];
            row.innerHTML += `<td>${createClassBlock(classInfo)}</td>`;
        });

        tableBody.appendChild(row);
    });
}

// Function to fetch schedule data from API
async function fetchScheduleData() {
    try {
        // Replace this with your actual API endpoint
        // const response = await fetch('/api/schedule');
        // const data = await response.json();
        // scheduleData.classes = data;
        
        // For now, using the static data
        renderSchedule();
    } catch (error) {
        console.error('Error fetching schedule:', error);
        document.querySelector('.schedule-container').innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                Unable to load schedule. Please try again later.
            </div>
        `;
    }
}

// Initialize the schedule when the page loads
document.addEventListener('DOMContentLoaded', () => {
    fetchScheduleData();
}); 