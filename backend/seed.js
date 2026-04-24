const { Pool } = require('pg');
require('dotenv').config({ path: '../.env' });
const bcrypt = require('bcryptjs');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'reshoring_advisor',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

async function seed() {
  const client = await pool.connect();
  try {
    // Drop and recreate tables
    await client.query(`
      DROP TABLE IF EXISTS budget_plans CASCADE;
      DROP TABLE IF EXISTS trade_agreements CASCADE;
      DROP TABLE IF EXISTS environmental_impacts CASCADE;
      DROP TABLE IF EXISTS quality_assessments CASCADE;
      DROP TABLE IF EXISTS demand_forecasts CASCADE;
      DROP TABLE IF EXISTS inventory_items CASCADE;
      DROP TABLE IF EXISTS site_selections CASCADE;
      DROP TABLE IF EXISTS workforce_plans CASCADE;
      DROP TABLE IF EXISTS transport_routes CASCADE;
      DROP TABLE IF EXISTS compliance_checks CASCADE;
      DROP TABLE IF EXISTS supply_chain_maps CASCADE;
      DROP TABLE IF EXISTS tariff_calculations CASCADE;
      DROP TABLE IF EXISTS cost_analyses CASCADE;
      DROP TABLE IF EXISTS risk_assessments CASCADE;
      DROP TABLE IF EXISTS suppliers CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
      DROP TABLE IF EXISTS ai_conversations CASCADE;
    `);

    // Create tables
    await client.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'analyst',
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE suppliers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        country VARCHAR(100) NOT NULL,
        region VARCHAR(100),
        industry VARCHAR(100),
        capability TEXT,
        reliability_score DECIMAL(3,1),
        cost_rating VARCHAR(20),
        lead_time_days INTEGER,
        certifications TEXT,
        contact_email VARCHAR(255),
        phone VARCHAR(50),
        status VARCHAR(50) DEFAULT 'active',
        ai_analysis TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE risk_assessments (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(100),
        current_supplier VARCHAR(255),
        current_country VARCHAR(100),
        target_country VARCHAR(100),
        risk_level VARCHAR(50),
        risk_score DECIMAL(4,1),
        description TEXT,
        mitigation_strategy TEXT,
        impact_area VARCHAR(100),
        probability VARCHAR(50),
        status VARCHAR(50) DEFAULT 'pending',
        ai_analysis TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE cost_analyses (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        product_category VARCHAR(100),
        current_location VARCHAR(100),
        target_location VARCHAR(100),
        current_annual_cost DECIMAL(15,2),
        projected_annual_cost DECIMAL(15,2),
        savings_percentage DECIMAL(5,2),
        labor_cost_diff DECIMAL(15,2),
        logistics_cost_diff DECIMAL(15,2),
        tariff_impact DECIMAL(15,2),
        roi_months INTEGER,
        recommendation VARCHAR(100),
        status VARCHAR(50) DEFAULT 'draft',
        ai_analysis TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE tariff_calculations (
        id SERIAL PRIMARY KEY,
        product_name VARCHAR(255) NOT NULL,
        hs_code VARCHAR(20),
        origin_country VARCHAR(100),
        destination_country VARCHAR(100),
        product_value DECIMAL(15,2),
        tariff_rate DECIMAL(5,2),
        tariff_amount DECIMAL(15,2),
        trade_agreement VARCHAR(100),
        effective_date DATE,
        exemptions TEXT,
        total_landed_cost DECIMAL(15,2),
        status VARCHAR(50) DEFAULT 'calculated',
        ai_analysis TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE supply_chain_maps (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        product_line VARCHAR(100),
        tier VARCHAR(20),
        node_type VARCHAR(50),
        location VARCHAR(100),
        country VARCHAR(100),
        supplier_name VARCHAR(255),
        lead_time_days INTEGER,
        risk_level VARCHAR(50),
        dependencies TEXT,
        alternatives TEXT,
        status VARCHAR(50) DEFAULT 'mapped',
        ai_analysis TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE compliance_checks (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        regulation_type VARCHAR(100),
        jurisdiction VARCHAR(100),
        product_category VARCHAR(100),
        compliance_status VARCHAR(50),
        requirements TEXT,
        gaps TEXT,
        deadline DATE,
        responsible_party VARCHAR(255),
        documentation_status VARCHAR(50),
        penalty_risk DECIMAL(15,2),
        status VARCHAR(50) DEFAULT 'in_review',
        ai_analysis TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE transport_routes (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        origin VARCHAR(255),
        destination VARCHAR(255),
        transport_mode VARCHAR(50),
        distance_km DECIMAL(10,1),
        transit_time_days INTEGER,
        cost_per_unit DECIMAL(10,2),
        carbon_footprint DECIMAL(10,2),
        reliability_score DECIMAL(3,1),
        carrier VARCHAR(255),
        frequency VARCHAR(50),
        status VARCHAR(50) DEFAULT 'active',
        ai_analysis TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE workforce_plans (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        facility_location VARCHAR(255),
        department VARCHAR(100),
        current_headcount INTEGER,
        required_headcount INTEGER,
        skill_requirements TEXT,
        training_needs TEXT,
        hiring_timeline VARCHAR(100),
        estimated_cost DECIMAL(15,2),
        labor_market_score DECIMAL(3,1),
        retention_risk VARCHAR(50),
        status VARCHAR(50) DEFAULT 'planning',
        ai_analysis TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE site_selections (
        id SERIAL PRIMARY KEY,
        site_name VARCHAR(255) NOT NULL,
        city VARCHAR(100),
        state VARCHAR(100),
        country VARCHAR(100),
        site_type VARCHAR(50),
        area_sqft INTEGER,
        monthly_cost DECIMAL(15,2),
        labor_availability_score DECIMAL(3,1),
        infrastructure_score DECIMAL(3,1),
        proximity_to_market DECIMAL(3,1),
        tax_incentives TEXT,
        utilities_cost DECIMAL(10,2),
        overall_score DECIMAL(3,1),
        status VARCHAR(50) DEFAULT 'evaluating',
        ai_analysis TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE inventory_items (
        id SERIAL PRIMARY KEY,
        item_name VARCHAR(255) NOT NULL,
        sku VARCHAR(50),
        category VARCHAR(100),
        current_stock INTEGER,
        reorder_point INTEGER,
        optimal_stock INTEGER,
        lead_time_days INTEGER,
        unit_cost DECIMAL(10,2),
        holding_cost_pct DECIMAL(5,2),
        stockout_risk VARCHAR(50),
        supplier_name VARCHAR(255),
        warehouse_location VARCHAR(255),
        status VARCHAR(50) DEFAULT 'in_stock',
        ai_analysis TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE demand_forecasts (
        id SERIAL PRIMARY KEY,
        product_name VARCHAR(255) NOT NULL,
        category VARCHAR(100),
        region VARCHAR(100),
        forecast_period VARCHAR(50),
        current_demand INTEGER,
        forecasted_demand INTEGER,
        growth_rate DECIMAL(5,2),
        confidence_level DECIMAL(5,2),
        seasonal_factor DECIMAL(5,2),
        market_trend VARCHAR(100),
        external_factors TEXT,
        status VARCHAR(50) DEFAULT 'active',
        ai_analysis TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE quality_assessments (
        id SERIAL PRIMARY KEY,
        product_name VARCHAR(255) NOT NULL,
        supplier_name VARCHAR(255),
        assessment_type VARCHAR(100),
        quality_score DECIMAL(3,1),
        defect_rate DECIMAL(5,2),
        inspection_date DATE,
        standards_met TEXT,
        issues_found TEXT,
        corrective_actions TEXT,
        auditor VARCHAR(255),
        next_review_date DATE,
        status VARCHAR(50) DEFAULT 'completed',
        ai_analysis TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE environmental_impacts (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(100),
        scope VARCHAR(50),
        current_emissions DECIMAL(10,2),
        projected_emissions DECIMAL(10,2),
        reduction_target DECIMAL(5,2),
        carbon_offset_cost DECIMAL(10,2),
        water_usage DECIMAL(10,2),
        waste_generated DECIMAL(10,2),
        sustainability_score DECIMAL(3,1),
        initiatives TEXT,
        status VARCHAR(50) DEFAULT 'assessed',
        ai_analysis TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE trade_agreements (
        id SERIAL PRIMARY KEY,
        agreement_name VARCHAR(255) NOT NULL,
        countries TEXT,
        agreement_type VARCHAR(100),
        effective_date DATE,
        expiry_date DATE,
        tariff_reduction DECIMAL(5,2),
        key_provisions TEXT,
        affected_industries TEXT,
        rules_of_origin TEXT,
        benefits TEXT,
        limitations TEXT,
        status VARCHAR(50) DEFAULT 'active',
        ai_analysis TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE budget_plans (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(100),
        fiscal_year VARCHAR(10),
        allocated_budget DECIMAL(15,2),
        spent_to_date DECIMAL(15,2),
        projected_total DECIMAL(15,2),
        variance DECIMAL(15,2),
        priority VARCHAR(50),
        department VARCHAR(100),
        description TEXT,
        milestones TEXT,
        roi_expected DECIMAL(5,2),
        status VARCHAR(50) DEFAULT 'active',
        ai_analysis TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE ai_conversations (
        id SERIAL PRIMARY KEY,
        feature VARCHAR(100) NOT NULL,
        user_prompt TEXT NOT NULL,
        ai_response TEXT,
        model_used VARCHAR(100),
        tokens_used INTEGER,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    console.log('Tables created successfully');

    // Seed users
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await client.query(`
      INSERT INTO users (email, password, name, role) VALUES
      ('admin@reshoring.ai', $1, 'Admin User', 'admin'),
      ('analyst@reshoring.ai', $1, 'Supply Chain Analyst', 'analyst')
    `, [hashedPassword]);

    // Seed suppliers (15+ items)
    await client.query(`
      INSERT INTO suppliers (name, country, region, industry, capability, reliability_score, cost_rating, lead_time_days, certifications, contact_email, phone, status) VALUES
      ('American Steel Works', 'United States', 'Midwest', 'Steel Manufacturing', 'Hot-rolled steel, Cold-rolled steel, Stainless steel', 9.2, 'Medium', 14, 'ISO 9001, IATF 16949', 'sales@amsteelworks.com', '+1-555-0101', 'active'),
      ('Pacific Rim Electronics', 'United States', 'West Coast', 'Electronics', 'PCB Assembly, Semiconductor packaging, SMT', 8.7, 'High', 21, 'ISO 9001, IPC-A-610', 'contact@pacificrimelec.com', '+1-555-0102', 'active'),
      ('Great Lakes Plastics', 'United States', 'Great Lakes', 'Plastics', 'Injection molding, Blow molding, Extrusion', 8.5, 'Medium', 10, 'ISO 9001, ISO 14001', 'info@greatlakesplastics.com', '+1-555-0103', 'active'),
      ('Southern Textiles Corp', 'United States', 'Southeast', 'Textiles', 'Woven fabrics, Technical textiles, Dye finishing', 7.8, 'Medium', 18, 'OEKO-TEX, GOTS', 'orders@southerntextiles.com', '+1-555-0104', 'active'),
      ('Heartland Auto Parts', 'United States', 'Midwest', 'Automotive', 'Precision machining, Stamping, Welding', 9.0, 'Medium-High', 12, 'IATF 16949, ISO 14001', 'sales@heartlandauto.com', '+1-555-0105', 'active'),
      ('New England Pharma Supply', 'United States', 'Northeast', 'Pharmaceutical', 'API manufacturing, Excipients, Packaging', 9.5, 'High', 30, 'FDA cGMP, ISO 13485', 'procurement@nepharm.com', '+1-555-0106', 'active'),
      ('Texas Chemical Solutions', 'United States', 'Gulf Coast', 'Chemicals', 'Specialty chemicals, Polymers, Catalysts', 8.3, 'Medium', 7, 'ISO 9001, REACH', 'sales@texaschem.com', '+1-555-0107', 'active'),
      ('Mountain West Mining Co', 'United States', 'Mountain West', 'Mining/Minerals', 'Rare earth processing, Lithium, Copper', 7.5, 'High', 45, 'ISO 14001, MSHA', 'info@mwmining.com', '+1-555-0108', 'active'),
      ('Carolina Furniture Craft', 'United States', 'Southeast', 'Furniture', 'Wood furniture, Upholstery, Custom millwork', 8.8, 'Medium', 21, 'FSC, BIFMA', 'orders@carolinafurniture.com', '+1-555-0109', 'active'),
      ('Maple Leaf Components', 'Canada', 'Ontario', 'Aerospace', 'Precision components, Composites, Assemblies', 9.1, 'High', 28, 'AS9100, NADCAP', 'sales@mapleleafcomp.ca', '+1-555-0110', 'active'),
      ('Silicon Prairie Tech', 'United States', 'Central', 'Technology', 'IoT devices, Sensors, Control systems', 8.4, 'Medium-High', 15, 'ISO 9001, UL', 'contact@siliconprairie.com', '+1-555-0111', 'active'),
      ('Gulf Coast Packaging', 'United States', 'Gulf Coast', 'Packaging', 'Corrugated boxes, Sustainable packaging, Labels', 7.9, 'Low', 5, 'FSC, SFI', 'orders@gulfpackaging.com', '+1-555-0112', 'active'),
      ('Northeast Precision Tools', 'United States', 'Northeast', 'Tool & Die', 'CNC machining, EDM, Tool & die making', 9.3, 'High', 20, 'ISO 9001, AS9100', 'sales@neprecision.com', '+1-555-0113', 'active'),
      ('Desert Sun Solar Components', 'United States', 'Southwest', 'Renewable Energy', 'Solar panels, Inverters, Mounting systems', 8.6, 'Medium', 25, 'UL, IEC 61215', 'info@desertsolar.com', '+1-555-0114', 'active'),
      ('Atlantic Medical Devices', 'United States', 'Mid-Atlantic', 'Medical Devices', 'Surgical instruments, Implants, Diagnostics', 9.4, 'High', 35, 'ISO 13485, FDA 21 CFR', 'procurement@atlanticmed.com', '+1-555-0115', 'active'),
      ('Midwest Grain Processing', 'United States', 'Midwest', 'Food Processing', 'Grain milling, Food additives, Packaging', 8.1, 'Low-Medium', 8, 'FDA, SQF, GFSI', 'sales@midwestgrain.com', '+1-555-0116', 'active')
    `);

    // Seed risk assessments (15+ items)
    await client.query(`
      INSERT INTO risk_assessments (title, category, current_supplier, current_country, target_country, risk_level, risk_score, description, mitigation_strategy, impact_area, probability, status) VALUES
      ('Semiconductor Supply Chain Disruption', 'Supply Disruption', 'Taiwan Semiconductor Co', 'Taiwan', 'United States', 'Critical', 9.5, 'High dependency on Taiwanese semiconductor fabs', 'Diversify to US-based foundries; invest in domestic fab capacity', 'Production', 'High', 'active'),
      ('Rare Earth Materials Dependency', 'Geopolitical', 'China Rare Earth Group', 'China', 'United States', 'High', 8.8, 'Over 80% of rare earth elements sourced from China', 'Partner with Mountain West Mining; stockpile critical materials', 'Raw Materials', 'Medium-High', 'active'),
      ('Steel Tariff Escalation', 'Tariff/Trade', 'Multiple Asian Suppliers', 'China', 'United States', 'Medium', 6.5, 'Potential for additional steel tariffs impacting costs', 'Lock in domestic supplier contracts; hedge with futures', 'Cost', 'Medium', 'monitoring'),
      ('Labor Shortage in Manufacturing', 'Workforce', 'N/A', 'United States', 'United States', 'High', 7.8, 'Critical shortage of skilled manufacturing workers', 'Invest in training programs; partner with trade schools', 'Operations', 'High', 'active'),
      ('Port Congestion West Coast', 'Logistics', 'Various', 'Multiple', 'United States', 'Medium', 6.2, 'Recurring port congestion at LA/Long Beach', 'Diversify entry ports; increase safety stock', 'Logistics', 'Medium', 'monitoring'),
      ('Pharmaceutical API Dependency', 'Regulatory', 'Indian Pharma Group', 'India', 'United States', 'Critical', 9.0, 'Critical drug ingredients sourced overseas', 'Build domestic API production; FDA fast-track approvals', 'Healthcare', 'Medium-High', 'active'),
      ('Natural Disaster Vulnerability', 'Environmental', 'Southeast Asia Suppliers', 'Vietnam', 'United States', 'High', 7.5, 'Suppliers in typhoon and flood-prone regions', 'Geographic diversification; business continuity plans', 'Supply Chain', 'Medium', 'active'),
      ('Currency Exchange Volatility', 'Financial', 'Multiple', 'Multiple', 'United States', 'Medium', 5.8, 'Fluctuating exchange rates affecting import costs', 'Increase domestic sourcing; currency hedging strategies', 'Financial', 'High', 'monitoring'),
      ('Cybersecurity Supply Chain Attack', 'Technology', 'Global Tech Suppliers', 'Multiple', 'United States', 'High', 8.2, 'Risk of compromised components or software', 'Vendor security audits; domestic secure manufacturing', 'Security', 'Medium', 'active'),
      ('Regulatory Compliance Changes', 'Regulatory', 'N/A', 'United States', 'United States', 'Medium', 6.0, 'Evolving EPA and OSHA regulations', 'Proactive compliance monitoring; dedicated compliance team', 'Legal', 'Medium', 'monitoring'),
      ('Energy Cost Volatility', 'Financial', 'N/A', 'United States', 'United States', 'Medium', 5.5, 'Rising energy costs affecting manufacturing', 'Renewable energy investments; energy efficiency programs', 'Operations', 'Medium-High', 'active'),
      ('Intellectual Property Theft', 'Geopolitical', 'Various Chinese Partners', 'China', 'United States', 'High', 8.5, 'Risk of IP theft through overseas manufacturing', 'Reshore sensitive production; legal protections', 'Competitive', 'High', 'active'),
      ('Single Source Dependency - EV Batteries', 'Supply Disruption', 'Korean Battery Corp', 'South Korea', 'United States', 'Critical', 9.2, 'Single supplier for critical EV battery cells', 'Develop secondary US-based suppliers; joint ventures', 'Production', 'Medium', 'active'),
      ('Trade War Escalation', 'Geopolitical', 'Multiple Chinese Suppliers', 'China', 'United States', 'High', 8.0, 'Escalating trade tensions with major trading partners', 'Accelerate reshoring timeline; nearshoring alternatives', 'Strategic', 'Medium-High', 'active'),
      ('Transportation Infrastructure Gaps', 'Infrastructure', 'N/A', 'United States', 'United States', 'Medium', 6.8, 'Aging domestic transportation infrastructure', 'Multi-modal transport strategy; regional distribution centers', 'Logistics', 'Medium', 'monitoring'),
      ('Pandemic Supply Chain Disruption', 'Operational', 'Global Suppliers', 'Multiple', 'United States', 'High', 7.0, 'Future pandemic risk to global supply chains', 'Domestic safety stock; reshored critical components', 'Operations', 'Low-Medium', 'active')
    `);

    // Seed cost analyses (15+ items)
    await client.query(`
      INSERT INTO cost_analyses (title, product_category, current_location, target_location, current_annual_cost, projected_annual_cost, savings_percentage, labor_cost_diff, logistics_cost_diff, tariff_impact, roi_months, recommendation, status) VALUES
      ('Electronics Assembly Reshoring', 'Electronics', 'Shenzhen, China', 'Austin, TX', 12500000, 14200000, -13.6, 3200000, -1800000, 300000, 24, 'Proceed with incentives', 'completed'),
      ('Steel Fabrication Nearshoring', 'Steel', 'Wuhan, China', 'Gary, IN', 8750000, 9100000, -4.0, 1500000, -850000, 200000, 18, 'Favorable - proceed', 'completed'),
      ('Textile Production Reshoring', 'Textiles', 'Dhaka, Bangladesh', 'Greenville, SC', 5200000, 7800000, -50.0, 3500000, -600000, 100000, 48, 'Consider automation', 'in_progress'),
      ('Auto Parts Manufacturing', 'Automotive', 'Monterrey, Mexico', 'Detroit, MI', 15000000, 16500000, -10.0, 2800000, -1200000, 0, 20, 'Partial reshoring', 'completed'),
      ('Pharmaceutical API Production', 'Pharmaceutical', 'Mumbai, India', 'Research Triangle, NC', 22000000, 28000000, -27.3, 4500000, -800000, 1200000, 36, 'Strategic necessity', 'in_progress'),
      ('Solar Panel Assembly', 'Renewable Energy', 'Shanghai, China', 'Phoenix, AZ', 18000000, 19500000, -8.3, 2200000, -1500000, 800000, 15, 'Proceed - IRA incentives', 'completed'),
      ('Plastic Injection Molding', 'Plastics', 'Ho Chi Minh, Vietnam', 'Cleveland, OH', 4500000, 5100000, -13.3, 1200000, -400000, 100000, 22, 'Favorable with automation', 'completed'),
      ('Furniture Manufacturing', 'Furniture', 'Dongguan, China', 'High Point, NC', 3800000, 4200000, -10.5, 800000, -350000, 150000, 16, 'Proceed', 'completed'),
      ('Medical Device Assembly', 'Medical Devices', 'Tijuana, Mexico', 'Minneapolis, MN', 9500000, 11200000, -17.9, 2500000, -600000, 0, 28, 'Quality-driven decision', 'in_progress'),
      ('Semiconductor Packaging', 'Semiconductors', 'Penang, Malaysia', 'Portland, OR', 35000000, 42000000, -20.0, 5500000, -1200000, 1500000, 42, 'Strategic investment', 'draft'),
      ('Chemical Processing Reshoring', 'Chemicals', 'Rotterdam, Netherlands', 'Houston, TX', 28000000, 26500000, 5.4, -500000, -1500000, 0, 8, 'Highly favorable', 'completed'),
      ('Aerospace Components', 'Aerospace', 'Suzhou, China', 'Wichita, KS', 45000000, 48000000, -6.7, 4000000, -2000000, 1500000, 30, 'Security necessity', 'in_progress'),
      ('Consumer Electronics PCB', 'Electronics', 'Taipei, Taiwan', 'San Jose, CA', 16000000, 19000000, -18.8, 4200000, -1000000, 500000, 36, 'Partial reshoring', 'draft'),
      ('Food Processing Equipment', 'Food & Beverage', 'Guangzhou, China', 'Chicago, IL', 7200000, 7800000, -8.3, 1200000, -700000, 200000, 14, 'Proceed', 'completed'),
      ('Battery Cell Manufacturing', 'Energy Storage', 'Seoul, South Korea', 'Reno, NV', 55000000, 52000000, 5.5, -1000000, -3000000, 0, 12, 'Highly favorable - IRA', 'completed'),
      ('Packaging Materials', 'Packaging', 'Multiple Asian', 'Multiple US', 6500000, 6800000, -4.6, 800000, -500000, 100000, 10, 'Proceed', 'completed')
    `);

    // Seed tariff calculations (15+ items)
    await client.query(`
      INSERT INTO tariff_calculations (product_name, hs_code, origin_country, destination_country, product_value, tariff_rate, tariff_amount, trade_agreement, effective_date, exemptions, total_landed_cost, status) VALUES
      ('Steel Coils', '7208.51', 'China', 'United States', 2500000, 25.00, 625000, 'Section 232', '2024-01-01', 'None', 3250000, 'calculated'),
      ('Aluminum Ingots', '7601.10', 'Canada', 'United States', 1800000, 0.00, 0, 'USMCA', '2024-01-01', 'USMCA Origin', 1890000, 'calculated'),
      ('Semiconductor Chips', '8542.31', 'Taiwan', 'United States', 15000000, 0.00, 0, 'ITA', '2024-01-01', 'ITA Agreement', 15750000, 'calculated'),
      ('Auto Parts - Engines', '8407.34', 'Mexico', 'United States', 8500000, 0.00, 0, 'USMCA', '2024-01-01', 'USMCA 75% RVC', 8925000, 'calculated'),
      ('Solar Panels', '8541.40', 'China', 'United States', 12000000, 14.75, 1770000, 'AD/CVD', '2024-01-01', 'Bifacial exemption', 14370000, 'calculated'),
      ('Lithium Batteries', '8507.60', 'South Korea', 'United States', 25000000, 3.40, 850000, 'KORUS FTA', '2024-01-01', 'Partial FTA reduction', 27100000, 'calculated'),
      ('Cotton Textiles', '5208.12', 'Bangladesh', 'United States', 3200000, 7.90, 252800, 'GSP expired', '2024-01-01', 'None current', 3612800, 'calculated'),
      ('Pharmaceutical APIs', '2941.10', 'India', 'United States', 9500000, 0.00, 0, 'Duty-free API', '2024-01-01', 'Pharmaceutical exemption', 9975000, 'calculated'),
      ('Rare Earth Oxides', '2846.90', 'China', 'United States', 5000000, 25.00, 1250000, 'Section 301', '2024-01-01', 'None', 6500000, 'calculated'),
      ('Plastic Resins', '3901.10', 'Saudi Arabia', 'United States', 4200000, 6.50, 273000, 'None', '2024-01-01', 'None', 4683000, 'calculated'),
      ('Machine Tools', '8458.11', 'Germany', 'United States', 7800000, 4.40, 343200, 'None', '2024-01-01', 'None', 8523200, 'calculated'),
      ('Electronic Components', '8532.24', 'Japan', 'United States', 6100000, 0.00, 0, 'ITA', '2024-01-01', 'ITA Agreement', 6405000, 'calculated'),
      ('Rubber Tires', '4011.10', 'Vietnam', 'United States', 3800000, 4.00, 152000, 'None', '2024-01-01', 'None', 4142000, 'calculated'),
      ('Medical Instruments', '9018.19', 'Ireland', 'United States', 11000000, 0.00, 0, 'Duty-free medical', '2024-01-01', 'Medical device exemption', 11550000, 'calculated'),
      ('Wood Products', '4407.11', 'Canada', 'United States', 2800000, 8.99, 251720, 'Softwood Lumber', '2024-01-01', 'Limited USMCA benefit', 3181720, 'calculated'),
      ('Ceramic Components', '6909.19', 'China', 'United States', 1500000, 25.00, 375000, 'Section 301', '2024-01-01', 'Exclusion requested', 1968750, 'calculated')
    `);

    // Seed supply chain maps (15+ items)
    await client.query(`
      INSERT INTO supply_chain_maps (name, product_line, tier, node_type, location, country, supplier_name, lead_time_days, risk_level, dependencies, alternatives, status) VALUES
      ('EV Battery Raw Material', 'Electric Vehicles', 'Tier 3', 'Raw Material', 'Perth, Australia', 'Australia', 'Lithium Australia Ltd', 60, 'Medium', 'Mining permits, Shipping', 'Mountain West Mining', 'mapped'),
      ('EV Battery Cell Production', 'Electric Vehicles', 'Tier 2', 'Manufacturing', 'Seoul, South Korea', 'South Korea', 'Korean Battery Corp', 30, 'High', 'Raw materials, Energy', 'Reno Gigafactory', 'mapped'),
      ('EV Battery Pack Assembly', 'Electric Vehicles', 'Tier 1', 'Assembly', 'Fremont, CA', 'United States', 'Pacific Assembly Inc', 7, 'Low', 'Battery cells, BMS', 'None current', 'mapped'),
      ('Semiconductor Wafer Fabrication', 'Electronics', 'Tier 2', 'Manufacturing', 'Hsinchu, Taiwan', 'Taiwan', 'Taiwan Semiconductor', 45, 'Critical', 'Silicon wafers, Chemicals', 'Intel Foundry, Samsung', 'mapped'),
      ('PCB Manufacturing', 'Electronics', 'Tier 2', 'Manufacturing', 'Shenzhen, China', 'China', 'Shenzhen PCB Group', 21, 'High', 'Copper, Laminates', 'Pacific Rim Electronics', 'mapped'),
      ('Steel Raw Material Mining', 'Automotive', 'Tier 3', 'Raw Material', 'Pilbara, Australia', 'Australia', 'Iron Ore Australia', 45, 'Medium', 'Mining operations', 'US Iron Range', 'mapped'),
      ('Steel Processing', 'Automotive', 'Tier 2', 'Processing', 'Wuhan, China', 'China', 'China Steel Corp', 30, 'High', 'Iron ore, Coal', 'American Steel Works', 'mapped'),
      ('Auto Body Stamping', 'Automotive', 'Tier 1', 'Manufacturing', 'Detroit, MI', 'United States', 'Detroit Stamping Co', 5, 'Low', 'Steel sheets', 'Heartland Auto Parts', 'mapped'),
      ('Pharmaceutical API Synthesis', 'Pharmaceutical', 'Tier 2', 'Manufacturing', 'Hyderabad, India', 'India', 'Hyderabad Pharma Ltd', 45, 'High', 'Chemical intermediates', 'New England Pharma', 'mapped'),
      ('Drug Formulation', 'Pharmaceutical', 'Tier 1', 'Manufacturing', 'Research Triangle, NC', 'United States', 'Triangle Pharma Inc', 14, 'Low', 'APIs, Excipients', 'None', 'mapped'),
      ('Textile Spinning', 'Apparel', 'Tier 2', 'Manufacturing', 'Dhaka, Bangladesh', 'Bangladesh', 'Bangladesh Textiles', 30, 'High', 'Cotton, Dyes', 'Southern Textiles Corp', 'mapped'),
      ('Solar Cell Production', 'Renewable Energy', 'Tier 2', 'Manufacturing', 'Xian, China', 'China', 'China Solar Group', 35, 'High', 'Silicon, Silver paste', 'Desert Sun Solar', 'mapped'),
      ('Aerospace Composite Layup', 'Aerospace', 'Tier 1', 'Manufacturing', 'Seattle, WA', 'United States', 'Pacific Aerospace', 21, 'Medium', 'Carbon fiber, Resin', 'Maple Leaf Components', 'mapped'),
      ('Chemical Intermediate', 'Chemicals', 'Tier 2', 'Processing', 'Shanghai, China', 'China', 'Shanghai Chemical', 25, 'Medium', 'Feedstock chemicals', 'Texas Chemical Solutions', 'mapped'),
      ('Food Ingredient Processing', 'Food & Beverage', 'Tier 2', 'Processing', 'Sao Paulo, Brazil', 'Brazil', 'Brazil Ingredients', 35, 'Medium', 'Agricultural products', 'Midwest Grain Processing', 'mapped'),
      ('Medical Device Assembly', 'Medical Devices', 'Tier 1', 'Assembly', 'Galway, Ireland', 'Ireland', 'Ireland MedTech', 14, 'Low', 'Components, Packaging', 'Atlantic Medical Devices', 'mapped')
    `);

    // Seed compliance checks (15+ items)
    await client.query(`
      INSERT INTO compliance_checks (title, regulation_type, jurisdiction, product_category, compliance_status, requirements, gaps, deadline, responsible_party, documentation_status, penalty_risk, status) VALUES
      ('FDA Medical Device Registration', 'FDA 21 CFR Part 820', 'United States', 'Medical Devices', 'Compliant', 'Quality management system, Design controls', 'None identified', '2025-12-31', 'Quality Team', 'Complete', 0, 'approved'),
      ('EPA Emissions Standards', 'Clean Air Act', 'United States', 'Manufacturing', 'Partially Compliant', 'Emissions monitoring, Reporting', 'Stack testing overdue for Line 3', '2025-06-30', 'Environmental Team', 'In Progress', 250000, 'in_review'),
      ('OSHA Workplace Safety', 'OSHA 29 CFR 1910', 'United States', 'All Manufacturing', 'Compliant', 'Safety training, PPE, Machine guarding', 'None identified', '2025-12-31', 'Safety Manager', 'Complete', 0, 'approved'),
      ('USMCA Rules of Origin', 'USMCA Chapter 4', 'North America', 'Automotive', 'Under Review', '75% Regional Value Content', 'RVC documentation gaps for 3 parts', '2025-03-31', 'Trade Compliance', 'In Progress', 500000, 'in_review'),
      ('REACH Chemical Registration', 'EU REACH', 'European Union', 'Chemicals', 'Non-Compliant', 'Chemical registration, Safety data sheets', 'Missing registrations for 5 substances', '2025-09-30', 'Regulatory Affairs', 'Incomplete', 750000, 'action_required'),
      ('Section 301 Tariff Compliance', 'Trade Act of 1974', 'United States', 'Electronics', 'Compliant', 'Country of origin documentation', 'None identified', '2025-12-31', 'Import Team', 'Complete', 0, 'approved'),
      ('CPSC Product Safety', 'Consumer Product Safety Act', 'United States', 'Consumer Goods', 'Compliant', 'Product testing, Labeling', 'None identified', '2025-12-31', 'Product Safety', 'Complete', 0, 'approved'),
      ('ITAR Export Controls', 'ITAR 22 CFR 120-130', 'United States', 'Aerospace', 'Under Review', 'Export licenses, Technology controls', 'Pending license for 2 components', '2025-04-30', 'Export Compliance', 'In Progress', 1000000, 'in_review'),
      ('Buy American Act Compliance', 'FAR 25.1', 'United States', 'Government Contracts', 'Partially Compliant', '55% domestic content', 'Content calculation pending for new line', '2025-06-30', 'Government Sales', 'In Progress', 300000, 'in_review'),
      ('ISO 14001 Environmental', 'ISO 14001:2015', 'International', 'All Operations', 'Compliant', 'EMS documentation, Audits', 'None identified', '2026-03-31', 'Environmental Team', 'Complete', 0, 'approved'),
      ('Conflict Minerals Reporting', 'Dodd-Frank Section 1502', 'United States', 'Electronics', 'Under Review', 'Supply chain due diligence', 'Incomplete smelter identification', '2025-05-31', 'Procurement', 'In Progress', 200000, 'in_review'),
      ('California Prop 65', 'Proposition 65', 'California', 'Consumer Products', 'Partially Compliant', 'Warning labels, Chemical testing', 'Missing labels on 8 SKUs', '2025-03-31', 'Regulatory Affairs', 'In Progress', 150000, 'action_required'),
      ('TSCA Chemical Inventory', 'Toxic Substances Control Act', 'United States', 'Chemicals', 'Compliant', 'Chemical inventory reporting', 'None identified', '2025-12-31', 'EHS Team', 'Complete', 0, 'approved'),
      ('Customs Trade Partnership', 'C-TPAT', 'United States', 'All Imports', 'Compliant', 'Security profile, Supply chain security', 'None identified', '2026-06-30', 'Trade Compliance', 'Complete', 0, 'approved'),
      ('Forced Labor Prevention', 'UFLPA', 'United States', 'All Imports', 'Under Review', 'Supply chain mapping, Due diligence', 'Traceability gaps in 4 suppliers', '2025-06-30', 'Compliance Team', 'In Progress', 800000, 'action_required'),
      ('RoHS Compliance', 'EU RoHS Directive', 'European Union', 'Electronics', 'Compliant', 'Restricted substances testing', 'None identified', '2025-12-31', 'Quality Team', 'Complete', 0, 'approved')
    `);

    // Seed transport routes (15+ items)
    await client.query(`
      INSERT INTO transport_routes (name, origin, destination, transport_mode, distance_km, transit_time_days, cost_per_unit, carbon_footprint, reliability_score, carrier, frequency, status) VALUES
      ('Shanghai-LA Ocean Route', 'Shanghai, China', 'Los Angeles, CA', 'Ocean', 10500, 18, 2450, 850, 7.5, 'Maersk Line', 'Weekly', 'active'),
      ('Detroit-Chicago Rail', 'Detroit, MI', 'Chicago, IL', 'Rail', 450, 1, 180, 25, 9.2, 'CSX Transportation', 'Daily', 'active'),
      ('Houston-Atlanta Truck', 'Houston, TX', 'Atlanta, GA', 'Truck', 1280, 2, 320, 95, 8.8, 'Werner Enterprises', 'Daily', 'active'),
      ('Monterrey-Dallas Truck', 'Monterrey, Mexico', 'Dallas, TX', 'Truck', 850, 2, 280, 70, 8.5, 'XPO Logistics', 'Daily', 'active'),
      ('Busan-Seattle Ocean', 'Busan, South Korea', 'Seattle, WA', 'Ocean', 8500, 14, 2100, 720, 8.0, 'Hyundai Merchant', 'Weekly', 'active'),
      ('Frankfurt-New York Air', 'Frankfurt, Germany', 'New York, NY', 'Air', 6200, 1, 8500, 450, 9.5, 'Lufthansa Cargo', 'Daily', 'active'),
      ('Mumbai-Houston Ocean', 'Mumbai, India', 'Houston, TX', 'Ocean', 15200, 28, 1950, 1100, 7.0, 'MSC', 'Bi-weekly', 'active'),
      ('Toronto-Detroit Truck', 'Toronto, Canada', 'Detroit, MI', 'Truck', 380, 1, 150, 30, 9.0, 'Schneider National', 'Daily', 'active'),
      ('Shenzhen-Chicago Intermodal', 'Shenzhen, China', 'Chicago, IL', 'Intermodal', 12800, 25, 2800, 920, 7.2, 'OOCL/BNSF', 'Weekly', 'active'),
      ('Sao Paulo-Miami Ocean', 'Sao Paulo, Brazil', 'Miami, FL', 'Ocean', 7400, 12, 1650, 580, 7.8, 'Hamburg Sud', 'Weekly', 'active'),
      ('Gary-Detroit Rail', 'Gary, IN', 'Detroit, MI', 'Rail', 400, 1, 120, 18, 9.4, 'Norfolk Southern', 'Daily', 'active'),
      ('Austin-San Jose Air', 'Austin, TX', 'San Jose, CA', 'Air', 2100, 1, 5200, 280, 9.6, 'FedEx', 'Daily', 'active'),
      ('Reno-Fremont Truck', 'Reno, NV', 'Fremont, CA', 'Truck', 350, 1, 180, 28, 9.1, 'JB Hunt', 'Daily', 'active'),
      ('Cleveland-Pittsburgh Truck', 'Cleveland, OH', 'Pittsburgh, PA', 'Truck', 210, 1, 120, 18, 9.3, 'Old Dominion', 'Daily', 'active'),
      ('Phoenix-LA Rail', 'Phoenix, AZ', 'Los Angeles, CA', 'Rail', 600, 2, 160, 22, 8.9, 'Union Pacific', 'Daily', 'active'),
      ('Ho Chi Minh-Oakland Ocean', 'Ho Chi Minh, Vietnam', 'Oakland, CA', 'Ocean', 11800, 20, 2200, 890, 7.4, 'Evergreen', 'Weekly', 'active')
    `);

    // Seed workforce plans (15+ items)
    await client.query(`
      INSERT INTO workforce_plans (title, facility_location, department, current_headcount, required_headcount, skill_requirements, training_needs, hiring_timeline, estimated_cost, labor_market_score, retention_risk, status) VALUES
      ('Austin Electronics Assembly Ramp-Up', 'Austin, TX', 'Production', 120, 350, 'SMT operation, Quality inspection, Soldering', '6-month technical training program', 'Q1-Q3 2025', 4500000, 7.8, 'Medium', 'active'),
      ('Detroit Auto Parts Expansion', 'Detroit, MI', 'Manufacturing', 200, 280, 'CNC operation, Welding, Robotics', '3-month certification program', 'Q2-Q4 2025', 2800000, 8.2, 'Low', 'active'),
      ('Research Triangle Pharma Facility', 'Durham, NC', 'R&D/Production', 50, 180, 'Chemistry, cGMP, Bioprocessing', '12-month specialized training', 'Q1 2025-Q2 2026', 8500000, 8.5, 'Medium-High', 'planning'),
      ('Phoenix Solar Manufacturing', 'Phoenix, AZ', 'Production', 80, 220, 'Solar cell assembly, Equipment maintenance', '4-month technical training', 'Q2-Q4 2025', 3200000, 7.5, 'Medium', 'active'),
      ('Gary Steel Plant Modernization', 'Gary, IN', 'Operations', 180, 160, 'Advanced metallurgy, Automation, Safety', '8-month retraining program', 'Q1-Q4 2025', 2200000, 7.0, 'High', 'active'),
      ('Portland Semiconductor Fab', 'Portland, OR', 'Fabrication', 30, 500, 'Cleanroom operation, Lithography, Metrology', '18-month phased training', 'Q1 2025-Q4 2026', 25000000, 6.5, 'Low', 'planning'),
      ('Greenville Textile Operations', 'Greenville, SC', 'Production', 90, 150, 'Weaving, Dyeing, Quality control', '3-month skills training', 'Q3-Q4 2025', 1800000, 7.2, 'Medium-High', 'active'),
      ('Wichita Aerospace Assembly', 'Wichita, KS', 'Assembly', 250, 320, 'Composite layup, NDT, Precision assembly', '6-month certification training', 'Q2-Q4 2025', 3800000, 8.0, 'Low', 'active'),
      ('Reno Battery Gigafactory', 'Reno, NV', 'Production', 150, 800, 'Battery cell production, Electrode coating', '12-month ramp-up training', 'Q1 2025-Q1 2027', 18000000, 6.8, 'Medium', 'planning'),
      ('Cleveland Plastics Plant', 'Cleveland, OH', 'Production', 60, 110, 'Injection molding, Tool setting, QC', '3-month operator training', 'Q3-Q4 2025', 1500000, 7.5, 'Medium', 'active'),
      ('Chicago Food Processing', 'Chicago, IL', 'Processing', 140, 180, 'Food safety, Equipment operation, HACCP', '2-month certification program', 'Q2-Q3 2025', 1200000, 7.8, 'Medium', 'active'),
      ('Minneapolis Medical Device', 'Minneapolis, MN', 'Assembly/QC', 100, 165, 'Cleanroom assembly, ISO 13485, Testing', '6-month quality training', 'Q2-Q4 2025', 3500000, 8.3, 'Low', 'active'),
      ('Houston Chemical Plant', 'Houston, TX', 'Operations', 95, 130, 'Chemical processing, HAZWOPER, DCS operation', '4-month safety-focused training', 'Q3-Q4 2025', 2100000, 7.6, 'Medium', 'active'),
      ('High Point Furniture Workshop', 'High Point, NC', 'Crafts/Production', 70, 120, 'CNC woodworking, Upholstery, Finishing', '4-month apprenticeship program', 'Q2-Q4 2025', 1600000, 7.0, 'Medium-High', 'active'),
      ('San Jose Tech Assembly', 'San Jose, CA', 'Production', 40, 95, 'IoT assembly, Testing, Firmware loading', '3-month technical training', 'Q3-Q4 2025', 2800000, 6.2, 'High', 'planning'),
      ('Gulf Coast Packaging Facility', 'New Orleans, LA', 'Production', 55, 85, 'Packaging equipment, Quality checks, Safety', '2-month operator training', 'Q3-Q4 2025', 900000, 7.4, 'Medium', 'active')
    `);

    // Seed site selections (15+ items)
    await client.query(`
      INSERT INTO site_selections (site_name, city, state, country, site_type, area_sqft, monthly_cost, labor_availability_score, infrastructure_score, proximity_to_market, tax_incentives, utilities_cost, overall_score, status) VALUES
      ('Lone Star Tech Park', 'Austin', 'Texas', 'United States', 'Electronics Manufacturing', 250000, 375000, 7.8, 9.0, 8.5, '10-year property tax abatement, Chapter 313 incentives', 45000, 8.4, 'shortlisted'),
      ('Motor City Industrial Complex', 'Detroit', 'Michigan', 'United States', 'Automotive Manufacturing', 400000, 320000, 8.5, 8.2, 9.0, 'Michigan MEGA tax credits, Renaissance Zone', 52000, 8.2, 'shortlisted'),
      ('Triangle Research Campus', 'Durham', 'North Carolina', 'United States', 'Pharmaceutical Production', 180000, 290000, 8.8, 8.5, 7.5, 'NC Job Development Investment Grant, OneNC Fund', 35000, 8.5, 'evaluating'),
      ('Desert Innovation Center', 'Phoenix', 'Arizona', 'United States', 'Solar Manufacturing', 300000, 285000, 7.5, 8.8, 8.0, 'Arizona Quality Jobs Tax Credit, GPEC incentives', 48000, 8.1, 'shortlisted'),
      ('Great Lakes Processing Hub', 'Gary', 'Indiana', 'United States', 'Steel Processing', 500000, 250000, 7.2, 7.8, 8.5, 'Indiana EDGE tax credits, TIF district', 65000, 7.5, 'evaluating'),
      ('Rose City Fab Center', 'Portland', 'Oregon', 'United States', 'Semiconductor Fabrication', 150000, 425000, 6.8, 9.2, 7.0, 'Oregon CHIPS Act incentives, Enterprise Zone', 55000, 7.8, 'evaluating'),
      ('Palmetto Textile Mill', 'Greenville', 'South Carolina', 'United States', 'Textile Manufacturing', 200000, 180000, 7.5, 7.5, 7.8, 'SC Job Tax Credit, readySC training', 28000, 7.6, 'evaluating'),
      ('Air Capital Aerospace Park', 'Wichita', 'Kansas', 'United States', 'Aerospace Assembly', 350000, 280000, 8.2, 8.0, 7.5, 'Kansas PEAK program, HPIP credits', 42000, 8.0, 'shortlisted'),
      ('Silver State Gigasite', 'Reno', 'Nevada', 'United States', 'Battery Manufacturing', 1000000, 850000, 6.5, 8.5, 7.8, 'Nevada GOED incentives, no state income tax', 110000, 7.9, 'shortlisted'),
      ('Forest City Polymer Park', 'Cleveland', 'Ohio', 'United States', 'Plastics Manufacturing', 175000, 165000, 7.8, 7.5, 8.2, 'Ohio Job Creation Tax Credit, JobsOhio', 30000, 7.7, 'evaluating'),
      ('Windy City Food Campus', 'Chicago', 'Illinois', 'United States', 'Food Processing', 220000, 310000, 8.0, 8.8, 9.5, 'Illinois EDGE program, Enterprise Zone', 48000, 8.4, 'shortlisted'),
      ('North Star Medical Park', 'Minneapolis', 'Minnesota', 'United States', 'Medical Device Assembly', 160000, 275000, 8.5, 8.5, 8.0, 'MN Job Opportunity Building Zone, DEED grants', 38000, 8.3, 'shortlisted'),
      ('Energy Corridor Complex', 'Houston', 'Texas', 'United States', 'Chemical Processing', 450000, 420000, 7.8, 9.5, 9.0, 'Texas Enterprise Zone, Chapter 313', 85000, 8.6, 'shortlisted'),
      ('Furniture Capital Works', 'High Point', 'North Carolina', 'United States', 'Furniture Manufacturing', 130000, 125000, 7.2, 7.0, 8.5, 'NC OneNC Fund, Building Reuse credits', 22000, 7.4, 'evaluating'),
      ('Silicon Valley Innovation Lab', 'San Jose', 'California', 'United States', 'Tech Assembly', 80000, 520000, 6.0, 9.5, 9.5, 'CA CDBG, New Market Tax Credits', 65000, 7.2, 'evaluating'),
      ('Bayou Packaging Center', 'New Orleans', 'Louisiana', 'United States', 'Packaging', 185000, 155000, 7.5, 7.2, 7.8, 'Louisiana LED FastStart, Enterprise Zone', 25000, 7.3, 'evaluating')
    `);

    // Seed inventory items (15+ items)
    await client.query(`
      INSERT INTO inventory_items (item_name, sku, category, current_stock, reorder_point, optimal_stock, lead_time_days, unit_cost, holding_cost_pct, stockout_risk, supplier_name, warehouse_location, status) VALUES
      ('Steel Coils Grade 304', 'STL-304-001', 'Raw Materials', 5000, 2000, 8000, 14, 450.00, 2.5, 'Low', 'American Steel Works', 'Gary, IN Warehouse', 'in_stock'),
      ('Semiconductor Chips A7X', 'SEM-A7X-001', 'Components', 12000, 8000, 25000, 45, 12.50, 3.0, 'High', 'Taiwan Semiconductor Co', 'Portland, OR Hub', 'low_stock'),
      ('Lithium Battery Cells', 'BAT-LI-001', 'Components', 25000, 15000, 40000, 30, 8.75, 2.8, 'Medium', 'Korean Battery Corp', 'Reno, NV Facility', 'in_stock'),
      ('Carbon Fiber Sheets', 'CFS-001', 'Raw Materials', 800, 500, 1500, 28, 125.00, 3.5, 'Medium', 'Maple Leaf Components', 'Seattle, WA Hub', 'in_stock'),
      ('Injection Mold Resin P200', 'PLR-P200-001', 'Raw Materials', 15000, 5000, 20000, 10, 3.25, 2.0, 'Low', 'Great Lakes Plastics', 'Cleveland, OH Warehouse', 'in_stock'),
      ('Pharmaceutical Excipients', 'PHX-EXC-001', 'Raw Materials', 3000, 2500, 6000, 30, 85.00, 4.0, 'High', 'New England Pharma Supply', 'Durham, NC Facility', 'low_stock'),
      ('Solar Panel Glass', 'SOL-GL-001', 'Components', 8000, 3000, 12000, 25, 22.50, 2.2, 'Low', 'Desert Sun Solar Components', 'Phoenix, AZ Hub', 'in_stock'),
      ('CNC Cutting Tools', 'CNC-CT-001', 'Tooling', 500, 200, 800, 20, 275.00, 3.0, 'Medium', 'Northeast Precision Tools', 'Detroit, MI Warehouse', 'in_stock'),
      ('Cotton Fabric Rolls', 'TXT-COT-001', 'Raw Materials', 2000, 1500, 4000, 18, 18.50, 2.0, 'Medium', 'Southern Textiles Corp', 'Greenville, SC Warehouse', 'in_stock'),
      ('Aluminum Alloy Ingots', 'ALU-ING-001', 'Raw Materials', 3500, 1500, 5000, 12, 320.00, 2.5, 'Low', 'Canadian Aluminum Corp', 'Gary, IN Warehouse', 'in_stock'),
      ('Medical Grade Silicone', 'MED-SIL-001', 'Raw Materials', 1200, 800, 2000, 35, 155.00, 4.5, 'High', 'Atlantic Medical Devices', 'Minneapolis, MN Facility', 'in_stock'),
      ('Printed Circuit Boards', 'PCB-STD-001', 'Components', 20000, 10000, 35000, 21, 6.75, 2.8, 'Medium', 'Pacific Rim Electronics', 'Austin, TX Hub', 'in_stock'),
      ('Food Grade Packaging', 'PKG-FG-001', 'Packaging', 50000, 20000, 75000, 5, 0.85, 1.5, 'Low', 'Gulf Coast Packaging', 'Chicago, IL Warehouse', 'in_stock'),
      ('Rare Earth Magnets', 'REM-001', 'Components', 2000, 3000, 8000, 45, 45.00, 3.5, 'Critical', 'Mountain West Mining Co', 'Multiple Locations', 'critical'),
      ('Specialty Chemicals Batch', 'CHM-SP-001', 'Raw Materials', 4000, 2000, 6000, 7, 95.00, 3.0, 'Low', 'Texas Chemical Solutions', 'Houston, TX Facility', 'in_stock'),
      ('IoT Sensor Modules', 'IOT-SEN-001', 'Components', 6000, 4000, 10000, 15, 15.50, 2.5, 'Medium', 'Silicon Prairie Tech', 'Austin, TX Hub', 'in_stock')
    `);

    // Seed demand forecasts (15+ items)
    await client.query(`
      INSERT INTO demand_forecasts (product_name, category, region, forecast_period, current_demand, forecasted_demand, growth_rate, confidence_level, seasonal_factor, market_trend, external_factors, status) VALUES
      ('EV Battery Packs', 'Automotive', 'North America', 'Q1-Q4 2025', 150000, 225000, 50.0, 82.5, 1.15, 'Strong Growth', 'IRA incentives, EV mandates, consumer demand', 'active'),
      ('Semiconductor Chips', 'Electronics', 'Global', 'Q1-Q4 2025', 2000000, 2400000, 20.0, 75.0, 1.05, 'Recovery Growth', 'CHIPS Act investment, AI demand surge', 'active'),
      ('Solar Panels', 'Renewable Energy', 'United States', 'Q1-Q4 2025', 85000, 127500, 50.0, 80.0, 1.25, 'Rapid Growth', 'IRA tax credits, state mandates, grid modernization', 'active'),
      ('Steel Products', 'Industrial', 'North America', 'Q1-Q4 2025', 500000, 525000, 5.0, 88.0, 0.95, 'Stable', 'Infrastructure bill spending, reshoring demand', 'active'),
      ('Pharmaceutical APIs', 'Healthcare', 'United States', 'Q1-Q4 2025', 120000, 138000, 15.0, 85.0, 1.02, 'Steady Growth', 'Aging population, biosimilar growth, reshoring push', 'active'),
      ('Auto Parts - Domestic', 'Automotive', 'United States', 'Q1-Q4 2025', 800000, 880000, 10.0, 78.0, 1.08, 'Moderate Growth', 'USMCA requirements, EV transition', 'active'),
      ('Medical Devices', 'Healthcare', 'North America', 'Q1-Q4 2025', 200000, 240000, 20.0, 82.0, 1.03, 'Strong Growth', 'Aging population, technology advancement', 'active'),
      ('Aerospace Components', 'Aerospace', 'Global', 'Q1-Q4 2025', 75000, 86250, 15.0, 79.0, 0.98, 'Recovery', 'Commercial aviation recovery, defense spending', 'active'),
      ('Textile Products', 'Consumer', 'United States', 'Q1-Q4 2025', 350000, 357000, 2.0, 72.0, 1.20, 'Flat', 'Nearshoring trend, sustainability demand', 'active'),
      ('Chemical Products', 'Industrial', 'North America', 'Q1-Q4 2025', 420000, 445200, 6.0, 84.0, 1.00, 'Moderate Growth', 'Manufacturing expansion, new applications', 'active'),
      ('Food Processing Equip', 'Food & Beverage', 'United States', 'Q1-Q4 2025', 45000, 49500, 10.0, 80.0, 0.92, 'Steady Growth', 'Automation trend, food safety requirements', 'active'),
      ('Packaging Materials', 'Packaging', 'North America', 'Q1-Q4 2025', 900000, 945000, 5.0, 90.0, 1.12, 'Stable Growth', 'E-commerce growth, sustainability shift', 'active'),
      ('Rare Earth Elements', 'Mining', 'United States', 'Q1-Q4 2025', 25000, 37500, 50.0, 70.0, 1.00, 'Explosive Growth', 'Defense needs, EV magnets, strategic stockpiling', 'active'),
      ('IoT/Sensor Devices', 'Technology', 'Global', 'Q1-Q4 2025', 500000, 650000, 30.0, 76.0, 1.05, 'Strong Growth', 'Industry 4.0, smart manufacturing, 5G rollout', 'active'),
      ('Furniture - Domestic', 'Consumer', 'United States', 'Q1-Q4 2025', 180000, 189000, 5.0, 82.0, 1.18, 'Stable', 'Housing market, remote work continuation', 'active'),
      ('Plastic Components', 'Industrial', 'North America', 'Q1-Q4 2025', 650000, 695500, 7.0, 83.0, 1.02, 'Moderate Growth', 'Reshoring demand, automotive lightweighting', 'active')
    `);

    // Seed quality assessments (15+ items)
    await client.query(`
      INSERT INTO quality_assessments (product_name, supplier_name, assessment_type, quality_score, defect_rate, inspection_date, standards_met, issues_found, corrective_actions, auditor, next_review_date, status) VALUES
      ('Steel Coils Batch 2024-Q4', 'American Steel Works', 'Incoming Inspection', 9.4, 0.3, '2024-12-15', 'ASTM A240, ISO 9001', 'Minor surface finish variation', 'Adjusted rolling parameters', 'John Smith, QC Lead', '2025-03-15', 'passed'),
      ('PCB Assembly Lot A', 'Pacific Rim Electronics', 'Process Audit', 8.8, 1.2, '2024-11-20', 'IPC-A-610 Class 2', 'Solder bridging on 3 boards', 'Stencil alignment recalibrated', 'Sarah Johnson, QE', '2025-02-20', 'passed'),
      ('Injection Mold Parts Run 47', 'Great Lakes Plastics', 'First Article', 9.1, 0.5, '2024-12-01', 'ISO 9001, PPAP Level 3', 'None significant', 'N/A', 'Mike Chen, SQE', '2025-06-01', 'passed'),
      ('Cotton Fabric Lot F2024', 'Southern Textiles Corp', 'Material Testing', 7.5, 2.8, '2024-10-30', 'AATCC, ASTM D5034', 'Color fastness below spec on 2 rolls', 'Dye process review initiated', 'Lisa Park, Quality', '2025-01-30', 'conditional'),
      ('Precision Machined Parts', 'Heartland Auto Parts', 'Dimensional Audit', 9.6, 0.2, '2024-12-10', 'IATF 16949, GD&T per ASME Y14.5', 'None', 'N/A', 'Robert Kim, CMM Tech', '2025-06-10', 'passed'),
      ('Pharmaceutical API Batch P78', 'New England Pharma Supply', 'Stability Testing', 9.8, 0.1, '2024-11-15', 'USP, FDA cGMP', 'None', 'N/A', 'Dr. Amy Walsh, QA Dir', '2025-05-15', 'passed'),
      ('Specialty Chemical Batch C12', 'Texas Chemical Solutions', 'Certificate of Analysis', 8.5, 1.5, '2024-12-05', 'ISO 9001, ACS Grade', 'Purity 99.2% vs 99.5% spec', 'Distillation process adjusted', 'Tom Baker, Chemist', '2025-03-05', 'conditional'),
      ('Rare Earth Oxide RE-23', 'Mountain West Mining Co', 'Assay Report', 7.8, 2.2, '2024-11-25', 'ASTM C1336', 'Higher than expected thorium content', 'Additional separation step added', 'James Lee, Geochemist', '2025-02-25', 'conditional'),
      ('Wood Components WC-401', 'Carolina Furniture Craft', 'Visual/Physical', 9.0, 0.8, '2024-12-08', 'ANSI/BIFMA, FSC', 'Minor grain inconsistency', 'Source log sorting improved', 'Maria Garcia, QC', '2025-06-08', 'passed'),
      ('Aerospace Composite Part AP-7', 'Maple Leaf Components', 'NDT Inspection', 9.7, 0.1, '2024-12-12', 'AS9100, NADCAP', 'None', 'N/A', 'David Brown, NDT Level 3', '2025-06-12', 'passed'),
      ('IoT Sensor Module SM-100', 'Silicon Prairie Tech', 'Functional Test', 8.6, 1.4, '2024-11-28', 'ISO 9001, UL 61010', 'Calibration drift in 2% of units', 'Burn-in testing extended', 'Kevin White, Test Eng', '2025-02-28', 'passed'),
      ('Packaging Materials PM-55', 'Gulf Coast Packaging', 'Compression Test', 8.2, 1.8, '2024-12-03', 'ISTA 2A, ASTM D642', 'Edge crush below spec on humid days', 'Moisture barrier coating added', 'Nancy Lee, Pkg Eng', '2025-03-03', 'conditional'),
      ('Precision Cutting Tools CT-88', 'Northeast Precision Tools', 'Hardness/Wear Test', 9.5, 0.3, '2024-12-18', 'ISO 9001, DIN standards', 'None', 'N/A', 'Chris Martin, Tool Eng', '2025-06-18', 'passed'),
      ('Solar Panel Module SP-300', 'Desert Sun Solar Components', 'EL Imaging Test', 8.9, 0.9, '2024-11-22', 'IEC 61215, UL 1703', 'Micro-crack in 1 cell per 50 panels', 'Cell sorting criteria tightened', 'Pat Anderson, PV Eng', '2025-05-22', 'passed'),
      ('Medical Implant MI-12', 'Atlantic Medical Devices', 'Biocompatibility', 9.9, 0.05, '2024-12-20', 'ISO 13485, ISO 10993', 'None', 'N/A', 'Dr. Helen Ross, RA/QA', '2025-06-20', 'passed'),
      ('Grain Products GP-44', 'Midwest Grain Processing', 'Food Safety Audit', 8.0, 2.0, '2024-12-02', 'SQF Level 3, FDA FSMA', 'Minor allergen control gap', 'Allergen management plan updated', 'Steve Wright, SQF Pract', '2025-03-02', 'conditional')
    `);

    // Seed environmental impacts (15+ items)
    await client.query(`
      INSERT INTO environmental_impacts (title, category, scope, current_emissions, projected_emissions, reduction_target, carbon_offset_cost, water_usage, waste_generated, sustainability_score, initiatives, status) VALUES
      ('Electronics Manufacturing Carbon', 'Carbon Emissions', 'Scope 1+2', 45000, 32000, 30.0, 180000, 25000, 1200, 7.2, 'Solar installation, LED lighting, HVAC optimization', 'assessed'),
      ('Steel Production Emissions', 'Carbon Emissions', 'Scope 1', 120000, 96000, 20.0, 480000, 85000, 8500, 5.8, 'Electric arc furnace transition, scrap recycling increase', 'assessed'),
      ('Automotive Supply Chain', 'Carbon Emissions', 'Scope 3', 280000, 196000, 30.0, 840000, 45000, 3200, 6.5, 'Supplier emissions reduction program, EV transition', 'in_progress'),
      ('Pharmaceutical Water Usage', 'Water', 'Operations', 15000, 10500, 30.0, 45000, 180000, 450, 7.8, 'Water recycling system, process optimization', 'assessed'),
      ('Solar Panel Manufacturing', 'Carbon Emissions', 'Scope 1+2', 22000, 11000, 50.0, 44000, 15000, 800, 8.5, 'Net-zero facility, solar-powered production', 'assessed'),
      ('Chemical Processing Waste', 'Waste', 'Operations', 8000, 4800, 40.0, 32000, 55000, 12000, 6.0, 'Waste-to-energy, solvent recovery, closed-loop processing', 'in_progress'),
      ('Logistics Carbon Footprint', 'Carbon Emissions', 'Scope 3', 65000, 48750, 25.0, 195000, 5000, 500, 7.0, 'Route optimization, EV fleet transition, rail shifting', 'assessed'),
      ('Textile Dyeing Water Impact', 'Water', 'Operations', 5000, 3000, 40.0, 15000, 220000, 2500, 5.5, 'Waterless dyeing tech, treatment plant upgrade', 'in_progress'),
      ('Mining Environmental Impact', 'Land/Ecosystem', 'Scope 1+2', 35000, 28000, 20.0, 140000, 120000, 15000, 4.8, 'Land rehabilitation, dust suppression, water treatment', 'assessed'),
      ('Packaging Sustainability', 'Waste', 'Scope 3', 12000, 6000, 50.0, 24000, 8000, 25000, 7.5, 'Recyclable materials, reduced packaging, bio-materials', 'assessed'),
      ('Aerospace Composite Waste', 'Waste', 'Operations', 3500, 2450, 30.0, 10500, 12000, 1800, 6.8, 'Composite recycling program, thermoplastic transition', 'assessed'),
      ('Food Processing Emissions', 'Carbon Emissions', 'Scope 1+2', 18000, 12600, 30.0, 54000, 95000, 4500, 6.5, 'Biogas generation, heat recovery, efficient refrigeration', 'in_progress'),
      ('Battery Production Impact', 'Multiple', 'Scope 1+2+3', 55000, 33000, 40.0, 165000, 35000, 2000, 7.0, 'Closed-loop recycling, renewable energy, water recycling', 'assessed'),
      ('Medical Device Sterilization', 'Carbon Emissions', 'Scope 1', 8500, 5950, 30.0, 25500, 18000, 600, 7.5, 'E-beam sterilization, energy-efficient autoclaves', 'assessed'),
      ('Plastics Circular Economy', 'Waste', 'Scope 1+3', 25000, 15000, 40.0, 75000, 20000, 18000, 6.2, 'PCR content increase, chemical recycling, design for recyclability', 'in_progress'),
      ('Semiconductor Fab Footprint', 'Multiple', 'Scope 1+2', 75000, 52500, 30.0, 225000, 250000, 3500, 6.0, 'PFC abatement, UPW recycling, renewable PPAs', 'assessed')
    `);

    // Seed trade agreements (15+ items)
    await client.query(`
      INSERT INTO trade_agreements (agreement_name, countries, agreement_type, effective_date, expiry_date, tariff_reduction, key_provisions, affected_industries, rules_of_origin, benefits, limitations, status) VALUES
      ('USMCA', 'United States, Mexico, Canada', 'Free Trade Agreement', '2020-07-01', '2036-07-01', 95.0, 'Auto rules of origin, Digital trade, IP protection', 'Automotive, Agriculture, Manufacturing', '75% Regional Value Content for autos', 'Tariff-free trade for qualifying goods', 'Sunset clause, Labor requirements', 'active'),
      ('KORUS FTA', 'United States, South Korea', 'Free Trade Agreement', '2012-03-15', NULL, 82.0, 'Goods, Services, Investment, IP', 'Automotive, Electronics, Textiles', 'Specific product rules per chapter', 'Duty elimination on most goods', 'Auto trade imbalance concerns', 'active'),
      ('US-Japan Trade Agreement', 'United States, Japan', 'Limited Trade Agreement', '2020-01-01', NULL, 40.0, 'Agricultural market access, Digital trade', 'Agriculture, Digital Services', 'Standard preferential rules', 'Agricultural tariff reductions', 'Limited scope, no auto provisions', 'active'),
      ('US-Australia FTA', 'United States, Australia', 'Free Trade Agreement', '2005-01-01', NULL, 97.0, 'Goods, Services, Investment, Government Procurement', 'Mining, Agriculture, Services', 'Substantial transformation', 'Nearly full tariff elimination', 'Sugar excluded, Investor disputes', 'active'),
      ('CHIPS Act Incentives', 'United States (Domestic)', 'Industrial Policy', '2022-08-09', '2032-08-09', 0, '$52.7B for semiconductor manufacturing', 'Semiconductors, Electronics', 'Domestic production requirement', 'Tax credits, Direct subsidies', 'Guardrails on China investment', 'active'),
      ('Inflation Reduction Act', 'United States (Domestic)', 'Industrial Policy', '2022-08-16', '2032-12-31', 0, 'Clean energy tax credits, EV incentives', 'Renewable Energy, Automotive, Batteries', 'Domestic content requirements', 'Production/Investment tax credits', 'Complex compliance, Phase-in schedule', 'active'),
      ('Section 232 Steel/Aluminum', 'United States vs Multiple', 'National Security Tariff', '2018-03-23', NULL, 0, '25% steel, 10% aluminum tariffs', 'Steel, Aluminum, Manufacturing', 'Country of melt/pour', 'Protects domestic producers', 'Increases input costs, Retaliation', 'active'),
      ('Section 301 China Tariffs', 'United States vs China', 'Trade Remedies', '2018-07-06', NULL, 0, '7.5-25% on $370B of Chinese goods', 'Electronics, Machinery, Consumer Goods', 'Country of origin', 'Encourages reshoring', 'Higher consumer costs, Complexity', 'active'),
      ('US-UK FTA Negotiations', 'United States, United Kingdom', 'Negotiations', '2024-01-01', NULL, 0, 'Comprehensive trade deal under negotiation', 'All sectors', 'TBD', 'Potential tariff elimination', 'Stalled negotiations', 'negotiating'),
      ('GSP Program', 'United States + 119 countries', 'Preferential Trade', '1976-01-01', '2024-12-31', 60.0, 'Duty-free treatment for developing countries', 'All eligible goods', 'Substantial transformation, 35% VA', 'Zero duty on eligible goods', 'Expired/Pending renewal, Exclusions', 'expired'),
      ('US-Israel FTA', 'United States, Israel', 'Free Trade Agreement', '1985-09-01', NULL, 98.0, 'Nearly complete duty elimination', 'All goods', 'Substantial transformation', 'Duty-free on virtually all goods', 'Agricultural limitations', 'active'),
      ('CAFTA-DR', 'US, Costa Rica, El Salvador, Guatemala, Honduras, Nicaragua, DR', 'Free Trade Agreement', '2006-03-01', NULL, 80.0, 'Goods, Services, Investment, Labor', 'Textiles, Agriculture, Manufacturing', 'Yarn-forward rule for textiles', 'Nearshoring opportunity', 'Limited industrial base in some countries', 'active'),
      ('US-Colombia TPA', 'United States, Colombia', 'Free Trade Agreement', '2012-05-15', NULL, 80.0, 'Goods, Services, IP, Labor', 'Agriculture, Manufacturing, Mining', 'Standard preferential rules', 'Growing nearshore alternative', 'Security concerns, Limited capacity', 'active'),
      ('Indo-Pacific Economic Framework', 'US + 13 Indo-Pacific nations', 'Economic Framework', '2022-05-23', NULL, 0, 'Supply chains, Digital economy, Clean energy', 'All sectors', 'No tariff provisions', 'Supply chain resilience', 'Not a traditional FTA, No market access', 'active'),
      ('Buy American Executive Order', 'United States (Domestic)', 'Procurement Policy', '2021-01-25', NULL, 0, 'Federal procurement domestic preference', 'Government suppliers', '60% increasing to 75% domestic content', 'Guaranteed government demand', 'Higher procurement costs, Waivers available', 'active'),
      ('Defense Production Act', 'United States (Domestic)', 'Industrial Policy', '1950-09-08', NULL, 0, 'Priority orders, Financial incentives for defense production', 'Defense, Critical minerals, Healthcare', 'Domestic production priority', 'Funding for critical supply chains', 'Limited to national security items', 'active')
    `);

    // Seed budget plans (15+ items)
    await client.query(`
      INSERT INTO budget_plans (title, category, fiscal_year, allocated_budget, spent_to_date, projected_total, variance, priority, department, description, milestones, roi_expected, status) VALUES
      ('Electronics Reshoring Initiative', 'Capital Investment', 'FY2025', 15000000, 4200000, 14500000, 500000, 'High', 'Operations', 'Build domestic electronics assembly facility', 'Site selection Q1, Construction Q2-Q3, Equipment Q4', 18.5, 'active'),
      ('Semiconductor Supply Security', 'Strategic Investment', 'FY2025', 42000000, 8500000, 43500000, -1500000, 'Critical', 'Supply Chain', 'Invest in domestic semiconductor capacity', 'Partnership Q1, Facility prep Q2, Production Q4', 22.0, 'active'),
      ('Workforce Development Program', 'Operating', 'FY2025', 5500000, 1800000, 5200000, 300000, 'High', 'Human Resources', 'Training and recruitment for reshored operations', 'Curriculum Q1, Hiring Q2-Q3, Training Q3-Q4', 15.0, 'active'),
      ('Supply Chain Mapping Technology', 'Technology', 'FY2025', 3200000, 1100000, 3000000, 200000, 'Medium', 'IT', 'Implement digital supply chain visibility', 'Vendor selection Q1, Implementation Q2-Q3, Go-live Q4', 25.0, 'active'),
      ('Tariff Mitigation Fund', 'Contingency', 'FY2025', 8000000, 3200000, 7500000, 500000, 'High', 'Finance', 'Buffer for tariff cost impacts during transition', 'Quarterly reviews, Adjustment as needed', 8.0, 'active'),
      ('Battery Manufacturing Facility', 'Capital Investment', 'FY2025', 55000000, 12000000, 52000000, 3000000, 'Critical', 'Operations', 'Build domestic EV battery production', 'Groundbreaking Q1, Construction Q1-Q4, Equipment Q4', 28.0, 'active'),
      ('Compliance & Regulatory', 'Operating', 'FY2025', 2800000, 950000, 2750000, 50000, 'Medium', 'Legal', 'Ensure compliance across all reshored operations', 'Audit Q1, Gap remediation Q2-Q3, Certification Q4', 0, 'active'),
      ('Solar Panel Assembly Line', 'Capital Investment', 'FY2025', 19500000, 5800000, 19000000, 500000, 'High', 'Operations', 'Domestic solar panel manufacturing with IRA credits', 'Line design Q1, Installation Q2-Q3, Ramp-up Q4', 32.0, 'active'),
      ('Logistics Network Optimization', 'Operating', 'FY2025', 4500000, 1500000, 4200000, 300000, 'Medium', 'Logistics', 'Redesign domestic distribution network', 'Analysis Q1, Route optimization Q2, Implementation Q3-Q4', 20.0, 'active'),
      ('Pharmaceutical API Facility', 'Capital Investment', 'FY2025', 28000000, 6500000, 29000000, -1000000, 'Critical', 'Operations', 'Domestic active pharmaceutical ingredient production', 'FDA pre-approval Q1, Construction Q2-Q4', 15.0, 'active'),
      ('Quality Systems Upgrade', 'Technology', 'FY2025', 2200000, 800000, 2100000, 100000, 'Medium', 'Quality', 'Implement AI-driven quality management', 'Requirements Q1, Development Q2-Q3, Deploy Q4', 18.0, 'active'),
      ('Environmental Sustainability', 'Operating', 'FY2025', 6000000, 2100000, 5800000, 200000, 'Medium', 'ESG', 'Green manufacturing and carbon reduction', 'Baseline Q1, Initiatives Q2-Q3, Measurement Q4', 12.0, 'active'),
      ('Aerospace Components Line', 'Capital Investment', 'FY2025', 48000000, 9500000, 47000000, 1000000, 'High', 'Operations', 'Domestic aerospace component manufacturing', 'Certification Q1, Setup Q2-Q3, Production Q4', 16.0, 'active'),
      ('Trade Intelligence Platform', 'Technology', 'FY2025', 1800000, 600000, 1750000, 50000, 'Low', 'Strategy', 'AI-powered trade policy monitoring', 'Design Q1, Build Q2-Q3, Launch Q4', 30.0, 'active'),
      ('Rare Earth Processing', 'Strategic Investment', 'FY2025', 12000000, 2800000, 11500000, 500000, 'Critical', 'Supply Chain', 'Domestic rare earth element processing', 'Permitting Q1-Q2, Construction Q3-Q4', 20.0, 'active'),
      ('Automation & Robotics', 'Capital Investment', 'FY2025', 8500000, 2800000, 8200000, 300000, 'High', 'Operations', 'Robotic automation for reshored facilities', 'Assessment Q1, Procurement Q2, Install Q3-Q4', 35.0, 'active')
    `);

    console.log('All seed data inserted successfully!');
  } catch (error) {
    console.error('Seed error:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

seed().then(() => {
  console.log('Seeding complete!');
  process.exit(0);
}).catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
