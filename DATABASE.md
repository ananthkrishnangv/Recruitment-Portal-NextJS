# CSIR-SERC Recruitment Portal - Database Documentation

This document outlines the database schema design for the CSIR-SERC Recruitment Portal. The system uses **MariaDB 11.8 LTS** (or compatible MySQL 8.0+) to store user data, job postings, dynamic form configurations, and application entries.

## 🗄️ Database Connection
*   **Database Name**: `csir_recruitment_db`
*   **CharSet**: `utf8mb4`
*   **Collation**: `utf8mb4_unicode_ci`

---

## 📋 Entity Relationship Schema

### 1. User Management
Stores authentication details for Applicants, Admins, and Supervisors.

```sql
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY, -- UUID
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100), -- Nullable for applicants using only Aadhaar
    mobile VARCHAR(15) NOT NULL,
    aadhaar VARCHAR(12) UNIQUE, -- Main identifier for Applicants
    password_hash VARCHAR(255), -- Bcrypt hash (Nullable for Applicants)
    role ENUM('GUEST', 'APPLICANT', 'ADMIN', 'SUPERVISOR') DEFAULT 'APPLICANT',
    avatar_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_aadhaar (aadhaar)
);
```

### 2. Job Postings
Stores vacancy details.

```sql
CREATE TABLE job_posts (
    id VARCHAR(36) PRIMARY KEY, -- UUID
    code VARCHAR(50) UNIQUE NOT NULL, -- e.g., SCI-01-2024
    title VARCHAR(100) NOT NULL,
    post_type ENUM('Scientist', 'Technical Officer', 'Technician', 'Technical Assistant') NOT NULL,
    department VARCHAR(100) NOT NULL,
    vacancies INT DEFAULT 0,
    last_date DATE NOT NULL,
    description TEXT,
    status ENUM('OPEN', 'CLOSED') DEFAULT 'OPEN',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3. Dynamic Form Builder
Stores the configuration for custom fields added by Admins for specific posts.

```sql
CREATE TABLE post_custom_fields (
    id VARCHAR(36) PRIMARY KEY,
    post_id VARCHAR(36) NOT NULL,
    label VARCHAR(255) NOT NULL,
    field_type ENUM('text', 'number', 'date', 'dropdown', 'textarea', 'checkbox', 'radio', 'file') NOT NULL,
    is_required BOOLEAN DEFAULT FALSE,
    placeholder VARCHAR(255),
    options_json JSON, -- Array of strings for Dropdown/Radio
    validation_json JSON, -- { "pattern": "regex", "minLength": 10, "errorMessage": "..." }
    logic_json JSON, -- { "dependsOnFieldId": "...", "condition": "EQUALS", "value": "..." }
    sort_order INT DEFAULT 0,
    FOREIGN KEY (post_id) REFERENCES job_posts(id) ON DELETE CASCADE
);
```

### 4. Applications
The core table linking Users to Job Posts.

```sql
CREATE TABLE applications (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    post_id VARCHAR(36) NOT NULL,
    status ENUM('Draft', 'Submitted', 'Under Scrutiny', 'Eligible', 'Not Eligible', 'Interview Scheduled', 'Selected', 'Rejected') DEFAULT 'Draft',
    statement_of_purpose TEXT,
    submitted_at TIMESTAMP NULL,
    scrutiny_remarks TEXT, -- Admin remarks
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (post_id) REFERENCES job_posts(id),
    UNIQUE KEY unique_application (user_id, post_id) -- One application per post per user
);
```

### 5. Application Details
Normalized tables to store the multi-step form data.

#### Personal Details
```sql
CREATE TABLE application_personal_details (
    application_id VARCHAR(36) PRIMARY KEY,
    full_name VARCHAR(100),
    dob DATE,
    gender ENUM('Male', 'Female', 'Other'),
    category ENUM('GEN', 'OBC', 'SC', 'ST', 'EWS', 'PWD'),
    father_name VARCHAR(100),
    address TEXT,
    nationality VARCHAR(50) DEFAULT 'Indian',
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
);
```

#### Education History
```sql
CREATE TABLE application_education (
    id VARCHAR(36) PRIMARY KEY,
    application_id VARCHAR(36) NOT NULL,
    level VARCHAR(50), -- 10th, 12th, B.Tech
    institution VARCHAR(255),
    board_university VARCHAR(100),
    year_passing INT,
    percentage DECIMAL(5,2),
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
);
```

#### Experience History
```sql
CREATE TABLE application_experience (
    id VARCHAR(36) PRIMARY KEY,
    application_id VARCHAR(36) NOT NULL,
    organization VARCHAR(255),
    designation VARCHAR(100),
    from_date DATE,
    to_date DATE,
    responsibilities TEXT,
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
);
```

#### Documents
```sql
CREATE TABLE application_documents (
    id VARCHAR(36) PRIMARY KEY,
    application_id VARCHAR(36) NOT NULL,
    doc_type ENUM('PHOTO', 'SIGNATURE', 'RESUME', 'CASTE_CERT', 'OTHER'),
    file_path VARCHAR(512) NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
);
```

### 6. Custom Field Responses
Stores answers to the dynamic questions defined in `post_custom_fields`.

```sql
CREATE TABLE application_custom_values (
    id VARCHAR(36) PRIMARY KEY,
    application_id VARCHAR(36) NOT NULL,
    field_id VARCHAR(36) NOT NULL, -- Links to post_custom_fields.id
    field_value TEXT, -- Stores text, number, or file path
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
    FOREIGN KEY (field_id) REFERENCES post_custom_fields(id) ON DELETE NO ACTION
);
```

---

## 🔒 Security & Performance
1.  **Indexes**: Added on `email`, `aadhaar`, `post_id`, and `user_id` for fast lookups.
2.  **Constraints**: Foreign keys ensure referential integrity (e.g., deleting an application deletes its details).
3.  **JSON Columns**: Used for flexible schema in the Form Builder (Options, Validation Logic).
