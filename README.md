# Workplace-Dynamics

# README: Exploring Workplace Dynamics

## Project Overview

This project explores the dynamics of workplace stress, work-life balance, and mental health resources using interactive visualizations created with D3.js. The aim is to uncover insights into factors such as mental health stigma, resource accessibility, and demographic disparities to propose actionable solutions for fostering inclusive work environments.

### Key Features:

1. **Grouped Bar Chart**: Visualizes response distributions across workplace topics (e.g., benefits, wellness programs).
2. **Radial Chart**: Displays comparative perceptions of mental health and related workplace factors.
3. **Geo Map**: Highlights global disparities in mental health treatment accessibility.

---

## Dataset

The dataset is sourced from Open Sourcing Mental Illness (OSMI Health) and spans 2017-2022, covering:

- **Demographics**: Age, gender, country.
- **Workplace Characteristics**: Organization size, tech sector participation.
- **Mental Health**: Factors like treatment access, mental health stigma, wellness programs, and workplace policies.

### Preprocessing Steps:

- Standardized column names (e.g., "What is your gender?" to "Gender").
- Unified data entries (e.g., consolidating "Male" variations).
- Harmonized country names for geospatial mapping.

---

## Visualizations

### 1. Grouped Bar Chart

- **Purpose**: Compare response distributions for workplace benefits, care options, wellness programs, and mental health resources.
- **Interaction**: Filter by gender (Male/Female/All) to observe disparities.

### 2. Radial Chart

- **Purpose**: Highlight multivariate comparisons across mental health dimensions such as comfort with coworkers and perceived consequences of disclosing mental health concerns.
- **Features**: Interactive tooltips for detailed data insights.

### 3. Geo Map

- **Purpose**: Display global treatment disparities.
- **Visualization Elements**: Color-coded markers for treatment levels, tooltip details, and proportional marker sizes for response volume.

---

## How to Run

1. Clone the repository:

   ```bash
   git clone https://github.com/<your-username>/workplace-mental-health-visualizations.git
   cd workplace-mental-health-visualizations
   ```

2. Install dependencies:
   Ensure you have a local web server to serve static files. For example:

   ```bash
   npx http-server
   ```

3. Access the application in your browser:

   ```
   http://localhost:127.0.0.1:8000/final.html
   ```

4. Ensure the dataset `Datasetedit.csv` is placed in the project directory.

---

## Project Structure

```
workplace-mental-health-visualizations/
|-- index.html         # Main HTML file
|-- styles.css         # CSS for styling
|-- app.js             # JavaScript file with D3.js visualizations
|-- Datasetedit.csv    # Dataset
|-- assets/            # Additional assets (images, icons, etc.)
```

---

## Key Insights

- Significant gender-based disparities in accessing wellness programs and mental health support.
- Global analysis reveals treatment access is concentrated in developed regions, with underserved areas facing substantial barriers.
- Societal and workplace stigma persists, reducing comfort in acknowledging mental health concerns.

---

## Future Work

- Enhance interactivity with additional filters (e.g., age groups, job roles).
- Expand geospatial analysis with detailed regional data.
- Integrate machine learning for predictive insights on workplace trends.

---

### Supervisor

Dr. Kalpathi Subramanian

---

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.

---

## References

- [Mental Health America Workplace Survey](https://mhanational.org/sites/default/files/Mind%20the%20Workplace%20-%20MHA%20Workplace%20Health%20Survey%202021%202.12.21.pdf)
- [Open Sourcing Mental Illness Report](https://osmi.typeform.com/report/Fja7Jb9K/t5F4sKEyeGhGgU7V)
- [D3.js Documentation](https://d3js.org/getting-started)

