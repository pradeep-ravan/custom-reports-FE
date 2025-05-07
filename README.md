# Custom Reports - Frontend Documentation

## Overview

The Custom Reports frontend provides a user-friendly interface for creating, viewing, and managing custom reports with a variety of metrics. The application allows users to select various metrics, generate reports, visualize data with charts, and export reports in CSV format or via email.

## Features

- Create custom reports with selectable metrics
- Generate dummy data based on selected metrics
- View reports in interactive dashboard
- Visualize report data with charts
- Download reports as CSV files
- Send reports via email
- View aggregated data in a central dashboard
- Power BI integration for advanced analytics

## Setup and Installation

1. Ensure you have the backend server set up and running
2. No build steps are required for the frontend
3. The application is designed to work with the backend running on port 4000

## Usage

### Creating a Report

1. Navigate to the home page
2. Fill in the "Report Name" field
3. Select a user from the dropdown (optional)
4. Check the metrics you want to include in your report
5. Click "Create Report"

### Viewing Reports

1. Click on "View Reports" in the navigation bar
2. Click "View" next to any report to see its details

### Working with Report Data

1. From the report details page, click "Generate Data" to create sample data
2. Once data is generated, you can:
   - View data in tabular format
   - See visualizations in auto-generated charts
   - Download the data as a CSV file
   - Email the report to specified recipients

### Viewing the Dashboard

1. Click "View Dashboard" to see aggregated metrics across all reports
2. The dashboard provides a high-level overview of all report data

## Technical Details

### Components

- **Create Report Form**: Allows selection of metrics and report configuration
- **Reports List**: Displays all available reports with options to view details
- **Report Details View**: Shows report data with visualization options
- **Dashboard**: Provides aggregated metrics and visualizations

### Libraries Used

- **Bootstrap 5**: For responsive UI components and layout
- **Chart.js**: For data visualization and charting
- **JavaScript (ES6+)**: For frontend interactivity and API communication

### API Endpoints

The frontend communicates with the backend using the following API endpoints:

- `GET /api/reports`: Fetch all reports
- `POST /api/reports`: Create a new report
- `GET /api/reports/:id`: Get details for a specific report
- `POST /api/reports/:id/generate`: Generate data for a report
- `GET /api/reports/:id/data`: Get data for a specific report
- `POST /api/reports/:id/email`: Email a report
- `GET /api/reports/download/:id`: Download report as CSV

## Power BI Integration

The application includes a placeholder for Power BI integration. In a production environment, this would be replaced with actual Power BI embedding code to display interactive dashboards.

To implement actual Power BI integration:

1. Create a Power BI workspace and report
2. Register your application with Azure AD
3. Configure the Power BI Embed API
4. Replace the placeholder in the Power BI view with actual embedding code

## Customization

### Adding New Metrics

To add new metrics to the report creation form:

1. Add new checkbox elements to the metrics container in `index.html`
2. Update the controller logic in the backend to handle the new metrics

### Changing Chart Types

To modify chart visualizations:

1. Locate the chart creation functions in `main.js`
2. Modify the chart type and configuration options as needed
3. Chart.js provides multiple chart types (bar, line, pie, doughnut, etc.)

## Troubleshooting

### Common Issues

1. **Unable to view reports**: Ensure the backend server is running on port 4000
2. **Charts not displaying**: Check browser console for JavaScript errors
3. **Download not working**: Verify that report data has been generated

### Browser Compatibility

The application is designed to work with modern browsers (Chrome, Firefox, Safari, Edge). IE11 is not supported.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
