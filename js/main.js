document.addEventListener('DOMContentLoaded', function() {
  // Configure your API base URL here
  const API_BASE_URL = 'https://cutom-reports-be.vercel.app';  
  
  // DOM Elements
  const createReportSection = document.getElementById('create-report-section');
  const viewReportsSection = document.getElementById('view-reports-section');
  const reportDetailsSection = document.getElementById('report-details-section');
  
  const navCreate = document.getElementById('nav-create');
  const navView = document.getElementById('nav-view');
  
  const reportForm = document.getElementById('report-form');
  const reportsTableBody = document.getElementById('reports-table-body');
  const refreshReportsBtn = document.getElementById('refresh-reports');
  const backToReportsBtn = document.getElementById('back-to-reports');
  
  // Report detail elements
  const reportDetailTitle = document.getElementById('report-detail-title');
  const detailReportName = document.getElementById('detail-report-name');
  const detailUserName = document.getElementById('detail-user-name');
  const detailCreatedAt = document.getElementById('detail-created-at');
  const detailMetrics = document.getElementById('detail-metrics');
  
  const generateDataBtn = document.getElementById('generate-data-btn');
  const emailReportBtn = document.getElementById('email-report-btn');
  const downloadCsvBtn = document.getElementById('download-csv-btn');
  const reportDataContainer = document.getElementById('report-data-container');
  
  // Email modal elements
  const emailModal = new bootstrap.Modal(document.getElementById('emailModal'));
  const emailInput = document.getElementById('email-input');
  const sendEmailBtn = document.getElementById('send-email-btn');
  
  // Navigation handlers
  navCreate.addEventListener('click', function(e) {
    e.preventDefault();
    showSection(createReportSection);
    navCreate.classList.add('active');
    navView.classList.remove('active');
  });
  
  navView.addEventListener('click', function(e) {
    e.preventDefault();
    showSection(viewReportsSection);
    loadReports();
    navView.classList.add('active');
    navCreate.classList.remove('active');
  });
  
  backToReportsBtn.addEventListener('click', function() {
    showSection(viewReportsSection);
  });
  
  // Show specific section and hide others
  function showSection(section) {
    createReportSection.classList.add('d-none');
    viewReportsSection.classList.add('d-none');
    reportDetailsSection.classList.add('d-none');
    
    section.classList.remove('d-none');
  }
  
  // Form submission handler
  reportForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const reportName = document.getElementById('report-name').value;
    const userId = document.getElementById('user-select').value;
    const metrics = [];
    
    // Get all checked metrics
    const metricCheckboxes = document.querySelectorAll('.form-check-input:checked');
    metricCheckboxes.forEach(checkbox => {
      metrics.push(checkbox.value);
    });
    
    if (metrics.length === 0) {
      alert('Please select at least one metric');
      return;
    }
    
    createReport(reportName, userId, metrics);
  });
  
  // Refresh reports button
  refreshReportsBtn.addEventListener('click', loadReports);
  
  // API Functions
  
  // Create a new report
  async function createReport(name, userId, metrics) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: name,
          userId: userId || null,
          metrics: metrics
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert('Report created successfully!');
        reportForm.reset();
        
        // Navigate to report details - Updated to handle MongoDB's _id format
        const reportId = data.id || data._id; // Handle both formats
        loadReportDetails(reportId);
        showSection(reportDetailsSection);
        navView.classList.add('active');
        navCreate.classList.remove('active');
      } else {
        alert('Error: ' + data.message);
      }
    } catch (error) {
      console.error('Error creating report:', error);
      alert('Failed to create report. Please try again.');
    }
  }
  
  // Load all reports
  async function loadReports() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/reports`);
      const reports = await response.json();
      
      reportsTableBody.innerHTML = '';
      
      if (reports.length === 0) {
        reportsTableBody.innerHTML = `
          <tr>
            <td colspan="4" class="text-center">No reports found. Create your first report!</td>
          </tr>
        `;
        return;
      }
      
      reports.forEach(report => {
        const row = document.createElement('tr');
        // MongoDB uses ISO dates which should parse correctly, but we'll ensure it's handled
        const createdDate = new Date(report.created_at).toLocaleString();
        
        // Updated to use MongoDB's _id property
        row.innerHTML = `
          <td>${report.name}</td>
          <td>${report.user_name || 'System'}</td>
          <td>${createdDate}</td>
          <td>
            <button class="btn btn-sm btn-primary action-btn view-report" data-id="${report._id}">
              <i class="bi bi-eye"></i> View
            </button>
          </td>
        `;
        
        reportsTableBody.appendChild(row);
      });
      
      // Add event listeners to view buttons
      document.querySelectorAll('.view-report').forEach(button => {
        button.addEventListener('click', function() {
          const reportId = this.getAttribute('data-id');
          loadReportDetails(reportId);
        });
      });
    } catch (error) {
      console.error('Error loading reports:', error);
      alert('Failed to load reports. Please try again.');
    }
  }
  
  // Load report details
  async function loadReportDetails(reportId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/reports/${reportId}`);
      const report = await response.json();
      
      // Update UI with report details
      reportDetailTitle.textContent = `Report: ${report.name}`;
      detailReportName.textContent = report.name;
      detailUserName.textContent = report.user_name || 'System';
      detailCreatedAt.textContent = new Date(report.created_at).toLocaleString();
      detailMetrics.textContent = report.metrics.join(', ');
      
      // Store report ID for actions - Using MongoDB's _id
      const id = report._id;
      generateDataBtn.setAttribute('data-id', id);
      emailReportBtn.setAttribute('data-id', id);
      downloadCsvBtn.setAttribute('data-id', id);
      
      // Check if report data exists
      checkReportData(id);
      
      // Show report details section
      showSection(reportDetailsSection);
    } catch (error) {
      console.error('Error loading report details:', error);
      alert('Failed to load report details. Please try again.');
    }
  }
  
  // Check if report data exists
  async function checkReportData(reportId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/reports/${reportId}/data`);
      
      if (response.ok) {
        const data = await response.json();
        displayReportData(data);
        createCharts(data);
      } else {
        // No data exists yet
        reportDataContainer.innerHTML = `
          <div class="alert alert-info">
            <i class="bi bi-info-circle"></i> No data generated yet. Click "Generate Data" to create report data.
          </div>
        `;
        
        // Clear charts
        clearCharts();
      }
    } catch (error) {
      console.error('Error checking report data:', error);
      // Assume no data exists
      reportDataContainer.innerHTML = `
        <div class="alert alert-info">
          <i class="bi bi-info-circle"></i> No data generated yet. Click "Generate Data" to create report data.
        </div>
      `;
      
      // Clear charts
      clearCharts();
    }
  }
  
  // Generate report data
  generateDataBtn.addEventListener('click', async function() {
    const reportId = this.getAttribute('data-id');
    
    try {
      reportDataContainer.innerHTML = `
        <div class="alert alert-info">
          <i class="bi bi-hourglass-split"></i> Generating report data...
        </div>
      `;
      
      const response = await fetch(`${API_BASE_URL}/api/reports/${reportId}/generate`, {
        method: 'POST'
      });
      
      const result = await response.json();
      
      if (response.ok) {
        // Load the complete data
        const dataResponse = await fetch(`${API_BASE_URL}/api/reports/${reportId}/data`);
        const data = await dataResponse.json();
        
        displayReportData(data);
        createCharts(data);
      } else {
        reportDataContainer.innerHTML = `
          <div class="alert alert-danger">
            <i class="bi bi-exclamation-circle"></i> ${result.message}
          </div>
        `;
      }
    } catch (error) {
      console.error('Error generating report data:', error);
      reportDataContainer.innerHTML = `
        <div class="alert alert-danger">
          <i class="bi bi-exclamation-circle"></i> Failed to generate report data. Please try again.
        </div>
      `;
    }
  });
  
  // Display report data
  function displayReportData(data) {
    if (!data || data.length === 0) {
      reportDataContainer.innerHTML = `
        <div class="alert alert-warning">
          <i class="bi bi-exclamation-circle"></i> No data available for this report.
        </div>
      `;
      return;
    }
    
    // Get table headers from first data item
    const headers = Object.keys(data[0]);
    
    // Create table
    let tableHtml = `
      <div class="table-responsive">
        <table class="table table-striped table-bordered report-data-table">
          <thead>
            <tr>
              ${headers.map(header => `<th>${header}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
    `;
    
    // Add rows (limit to first 10 for display)
    data.slice(0, 10).forEach(row => {
      tableHtml += '<tr>';
      headers.forEach(header => {
        tableHtml += `<td>${row[header] || ''}</td>`;
      });
      tableHtml += '</tr>';
    });
    
    tableHtml += `
          </tbody>
        </table>
      </div>
      <div class="text-muted mt-2">Showing 10 of ${data.length} records</div>
    `;
    
    reportDataContainer.innerHTML = tableHtml;
  }
  
  // Create charts based on report data
  function createCharts(data) {
    if (!data || data.length === 0) {
      clearCharts();
      return;
    }
    
    // Clear previous charts
    clearCharts();
    
    // Determine which charts to create based on available metrics
    const metrics = Object.keys(data[0]);
    
    // Chart 1: Completion Status (if available)
    if (metrics.includes('Completion Status')) {
      createCompletionStatusChart(data);
    } else if (metrics.includes('Score')) {
      // Fallback to Score Distribution
      createScoreDistributionChart(data);
    }
    
    // Chart 2: Based on available time-related metrics
    if (metrics.includes('Time Spent')) {
      createTimeSpentChart(data);
    } else if (metrics.includes('Microskill Name')) {
      createMicroskillChart(data);
    } else if (metrics.includes('Login Status')) {
      createLoginStatusChart(data);
    }
  }
  
  // Create Completion Status Chart
  function createCompletionStatusChart(data) {
    const statusCounts = {};
    
    data.forEach(item => {
      const status = item['Completion Status'] || 'Unknown';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });
    
    const labels = Object.keys(statusCounts);
    const counts = Object.values(statusCounts);
    
    const ctx = document.getElementById('chart1').getContext('2d');
    new Chart(ctx, {
      type: 'pie',
      data: {
        labels: labels,
        datasets: [{
          data: counts,
          backgroundColor: [
            'rgba(54, 162, 235, 0.7)',
            'rgba(255, 99, 132, 0.7)',
            'rgba(255, 206, 86, 0.7)',
            'rgba(75, 192, 192, 0.7)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Completion Status Distribution'
          },
          legend: {
            position: 'right'
          }
        }
      }
    });
  }
  
  // Create Score Distribution Chart
  function createScoreDistributionChart(data) {
    // Group scores into ranges
    const ranges = {
      '0-20': 0,
      '21-40': 0,
      '41-60': 0,
      '61-80': 0,
      '81-100': 0
    };
    
    data.forEach(item => {
      const score = parseInt(item['Score'] || 0);
      
      if (score <= 20) ranges['0-20']++;
      else if (score <= 40) ranges['21-40']++;
      else if (score <= 60) ranges['41-60']++;
      else if (score <= 80) ranges['61-80']++;
      else ranges['81-100']++;
    });
    
    const labels = Object.keys(ranges);
    const counts = Object.values(ranges);
    
    const ctx = document.getElementById('chart1').getContext('2d');
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Number of Students',
          data: counts,
          backgroundColor: 'rgba(54, 162, 235, 0.7)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Score Distribution'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Number of Students'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Score Range'
            }
          }
        }
      }
    });
  }
  
  // Create Time Spent Chart
  function createTimeSpentChart(data) {
    // Extract time values (convert from "X minutes" to numbers)
    const timeValues = data.map(item => {
      const timeStr = item['Time Spent'] || '0 minutes';
      return parseInt(timeStr.split(' ')[0]);
    });
    
    // Group into ranges
    const ranges = {
      '0-30 min': 0,
      '31-60 min': 0,
      '61-90 min': 0,
      '91-120 min': 0,
      '120+ min': 0
    };
    
    timeValues.forEach(time => {
      if (time <= 30) ranges['0-30 min']++;
      else if (time <= 60) ranges['31-60 min']++;
      else if (time <= 90) ranges['61-90 min']++;
      else if (time <= 120) ranges['91-120 min']++;
      else ranges['120+ min']++;
    });
    
    const labels = Object.keys(ranges);
    const counts = Object.values(ranges);
    
    const ctx = document.getElementById('chart2').getContext('2d');
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Number of Students',
          data: counts,
          backgroundColor: 'rgba(75, 192, 192, 0.7)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Time Spent Distribution'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Number of Students'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Time Range'
            }
          }
        }
      }
    });
  }
  
  // Create Microskill Chart
  function createMicroskillChart(data) {
    const skillCounts = {};
    
    data.forEach(item => {
      const skill = item['Microskill Name'] || 'Unknown';
      skillCounts[skill] = (skillCounts[skill] || 0) + 1;
    });
    
    const labels = Object.keys(skillCounts);
    const counts = Object.values(skillCounts);
    
    const ctx = document.getElementById('chart2').getContext('2d');
    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: counts,
          backgroundColor: [
            'rgba(255, 99, 132, 0.7)',
            'rgba(54, 162, 235, 0.7)',
            'rgba(255, 206, 86, 0.7)',
            'rgba(75, 192, 192, 0.7)',
            'rgba(153, 102, 255, 0.7)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Microskill Distribution'
          },
          legend: {
            position: 'right'
          }
        }
      }
    });
  }
  
  // Create Login Status Chart
  function createLoginStatusChart(data) {
    const statusCounts = {};
    
    data.forEach(item => {
      const status = item['Login Status'] || 'Unknown';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });
    
    const labels = Object.keys(statusCounts);
    const counts = Object.values(statusCounts);
    
    const ctx = document.getElementById('chart2').getContext('2d');
    new Chart(ctx, {
      type: 'pie',
      data: {
        labels: labels,
        datasets: [{
          data: counts,
          backgroundColor: [
            'rgba(54, 162, 235, 0.7)',
            'rgba(255, 99, 132, 0.7)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Login Status Distribution'
          },
          legend: {
            position: 'right'
          }
        }
      }
    });
  }
  
  // Clear charts
  function clearCharts() {
    const chart1 = Chart.getChart('chart1');
    if (chart1) chart1.destroy();
    
    const chart2 = Chart.getChart('chart2');
    if (chart2) chart2.destroy();
  }
  
  // Email report
  emailReportBtn.addEventListener('click', function() {
    // Set the report ID for the email action
    sendEmailBtn.setAttribute('data-id', this.getAttribute('data-id'));
    
    // Show the email modal
    emailModal.show();
  });
  
  // Send email
  sendEmailBtn.addEventListener('click', async function() {
    const reportId = this.getAttribute('data-id');
    const email = emailInput.value;
    
    if (!email) {
      alert('Please enter an email address');
      return;
    }
    
    try {
      sendEmailBtn.disabled = true;
      sendEmailBtn.innerHTML = '<i class="bi bi-hourglass-split"></i> Sending...';
      
      const response = await fetch(`${API_BASE_URL}/api/reports/${reportId}/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: email })
      });
      
      const result = await response.json();
      
      if (response.ok) {
        alert('Report sent successfully to ' + email);
        emailModal.hide();
        emailInput.value = '';
      } else {
        alert('Error: ' + result.message);
      }
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Failed to send email. Please try again.');
    } finally {
      sendEmailBtn.disabled = false;
      sendEmailBtn.innerHTML = 'Send';
    }
  });
  
  // Download CSV
  downloadCsvBtn.addEventListener('click', function() {
    const reportId = this.getAttribute('data-id');
    window.location.href = `${API_BASE_URL}/api/reports/download/${reportId}`;
  });
  
  // Initial load
  loadReports();
});