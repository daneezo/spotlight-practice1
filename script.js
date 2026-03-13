const employees = [
  {
    id: 1,
    name: "Jane Smith",
    department: "Engineering",
    title: "Senior Developer",
    email: "jane.smith@company.com",
    phone: "(555) 123-4567",
    location: "New York",
    photo: "https://i.pravatar.cc/150?img=1"
  },
  {
    id: 2,
    name: "Michael Johnson",
    department: "Engineering",
    title: "Tech Lead",
    email: "michael.j@company.com",
    phone: "(555) 234-5678",
    location: "San Francisco",
    photo: "https://i.pravatar.cc/150?img=3"
  },
  {
    id: 3,
    name: "Emily Davis",
    department: "Marketing",
    title: "Marketing Manager",
    email: "emily.davis@company.com",
    phone: "(555) 345-6789",
    location: "Chicago",
    photo: "https://i.pravatar.cc/150?img=5"
  },
  {
    id: 4,
    name: "David Wilson",
    department: "Sales",
    title: "Account Executive",
    email: "david.wilson@company.com",
    phone: "(555) 456-7890",
    location: "Boston",
    photo: "https://i.pravatar.cc/150?img=8"
  },
  {
    id: 5,
    name: "Sarah Brown",
    department: "Human Resources",
    title: "HR Director",
    email: "sarah.brown@company.com",
    phone: "(555) 567-8901",
    location: "Austin",
    photo: "https://i.pravatar.cc/150?img=9"
  },
  {
    id: 6,
    name: "James Garcia",
    department: "Engineering",
    title: "DevOps Engineer",
    email: "james.garcia@company.com",
    phone: "(555) 678-9012",
    location: "Seattle",
    photo: "https://i.pravatar.cc/150?img=11"
  },
  {
    id: 7,
    name: "Lisa Martinez",
    department: "Finance",
    title: "Financial Analyst",
    email: "lisa.martinez@company.com",
    phone: "(555) 789-0123",
    location: "Denver",
    photo: "https://i.pravatar.cc/150?img=16"
  },
  {
    id: 8,
    name: "Robert Taylor",
    department: "Marketing",
    title: "Content Strategist",
    email: "robert.taylor@company.com",
    phone: "(555) 890-1234",
    location: "Miami",
    photo: "https://i.pravatar.cc/150?img=12"
  }
];

const employeeGrid = document.getElementById('employee-grid');
const searchInput = document.getElementById('search-input');
const noResults = document.getElementById('no-results');

function renderEmployees(employeeList) {
  if (employeeList.length === 0) {
    employeeGrid.innerHTML = '';
    noResults.hidden = false;
    return;
  }

  noResults.hidden = true;
  employeeGrid.innerHTML = employeeList.map(emp => `
    <div class="employee-card">
      <img src="${emp.photo}" alt="${emp.name}" class="employee-photo">
      <h2 class="employee-name">${emp.name}</h2>
      <p class="employee-title">${emp.title}</p>
      <span class="employee-department">${emp.department}</span>
      <div class="employee-contact">
        <p>${emp.email}</p>
        <p>${emp.phone}</p>
        <p>${emp.location}</p>
      </div>
    </div>
  `).join('');
}

function filterEmployees(searchTerm) {
  const term = searchTerm.toLowerCase().trim();

  if (!term) {
    return employees;
  }

  return employees.filter(emp =>
    emp.name.toLowerCase().includes(term) ||
    emp.department.toLowerCase().includes(term)
  );
}

searchInput.addEventListener('input', (e) => {
  const filtered = filterEmployees(e.target.value);
  renderEmployees(filtered);
});

// Initial render
renderEmployees(employees);
