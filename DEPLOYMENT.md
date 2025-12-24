# CSIR-SERC Recruitment Portal - Comprehensive Deployment Guide

This documentation provides a complete guide for deploying the CSIR-SERC Recruitment Portal. The application is designed to be OS-agnostic and supports major Linux distributions including **Rocky Linux 9**, **AlmaLinux 10**, **Oracle Linux 9**, **Red Hat Enterprise Linux (RHEL) 9**, and **Ubuntu 24.04 LTS**.

---

## 🏗️ System Architecture

*   **Frontend**: React 19, TypeScript, Vite, Tailwind CSS.
*   **Runtime**: Node.js v20 (LTS) for building.
*   **Database**: MariaDB 11.8 LTS (Schema provided in `DATABASE.md`).
*   **Web Server**: Nginx (Reverse Proxy & Static Serving).
*   **Security**: GIGW 3.0 Compliant headers, Role-Based Access Control (RBAC).

---

## 🔑 Default Credentials (First Login)

> **⚠️ IMPORTANT**: Change these passwords immediately via the Admin Dashboard > User Management.

| Role | Login ID (Email) | Default Password |
|------|------------------|------------------|
| **System Admin** | `ict.serc@csir.res.in` | `SercAdmin@2024!#Strong` |
| **Supervisor** | `admoff.serc@csir.res.in` | `SercSuper@2024!#Secure` |
| **Applicant** | *Uses Aadhaar Number* | *No Password Required* |

---

## ☁️ Google Drive Backup Setup (New)

The system includes a script (`drive_backup.py`) to push the full stack code to Google Drive automatically.

### Prerequisites
1.  **Google Cloud Project**: Create a project in [Google Cloud Console](https://console.cloud.google.com/).
2.  **Enable Drive API**: Enable the "Google Drive API" for your project.
3.  **Service Account**:
    *   Go to **IAM & Admin > Service Accounts**.
    *   Create a service account and download the **JSON Key**.
    *   Rename the file to `service_account.json` and place it in the project root.
4.  **Install Python Dependencies**:
    ```bash
    pip install -r requirements.txt
    ```

### Usage
Run the script to zip the application and upload it to the folder **"Recruitment portal Ai studio"** on Drive.
```bash
python3 drive_backup.py
```

*Note: The script creates the folder if it doesn't exist. If you want the folder inside a specific Shared Drive or personal folder, create the folder manually on Drive, share it with the `client_email` found inside `service_account.json`, and the script will find it.*

---

## 🗄️ Database Setup

The application requires a MariaDB/MySQL database.

1.  **Install MariaDB**:
    *   Rocky/Alma: `sudo dnf install mariadb-server && sudo systemctl enable --now mariadb`
    *   Ubuntu: `sudo apt install mariadb-server && sudo systemctl enable --now mariadb`
2.  **Secure Installation**:
    ```bash
    sudo mysql_secure_installation
    ```
3.  **Create Database & User**:
    ```bash
    mysql -u root -p
    ```
    ```sql
    CREATE DATABASE csir_recruitment_db;
    CREATE USER 'csir_admin'@'localhost' IDENTIFIED BY 'StrongPassword123!';
    GRANT ALL PRIVILEGES ON csir_recruitment_db.* TO 'csir_admin'@'localhost';
    FLUSH PRIVILEGES;
    EXIT;
    ```
4.  **Initialize Schema**:
    Use the schema defined in `DATABASE.md` to create the tables.

---

## 💾 Automated Local Database Backups

A script `backup_db.sh` is provided to automate database backups locally.

1.  **Configure Script**:
    Edit `backup_db.sh` and update `DB_PASS` with your database password.
    ```bash
    chmod +x backup_db.sh
    ```
2.  **Test Script**:
    ```bash
    ./backup_db.sh
    ```
    Check the output. A new file should appear in `~/csir_backups/YYYY-MM/`.
3.  **Schedule via Cron (Daily at 2 AM)**:
    Open crontab:
    ```bash
    crontab -e
    ```
    Add the following line:
    ```bash
    0 2 * * * /path/to/csir-serc-portal/backup_db.sh >> /path/to/csir-serc-portal/backup.log 2>&1
    ```

---

## 🛠️ Application Installation Procedure

We provide a universal `deploy.sh` script that handles dependency installation, building, and configuration automatically.

### Option 1: Automated Installation (Recommended)

1.  **Transfer Files**: Upload the project directory to your server (e.g., via SCP or Git).
    ```bash
    scp -r csir-serc-portal user@your-server-ip:/home/user/
    ```
2.  **Run Script**:
    ```bash
    cd csir-serc-portal
    chmod +x deploy.sh
    ./deploy.sh
    ```
    *The script will detect your OS (Rocky/Alma/Ubuntu) and install the appropriate packages (Nginx, Node.js), build the React app, and configure Nginx automatically.*

---

### Option 2: Manual Installation

If you prefer granular control, follow the specific instructions for your Operating System.

#### A. Rocky Linux 9 / AlmaLinux 10 / Oracle Linux 9 / RHEL 9

1.  **Update System**:
    ```bash
    sudo dnf update -y
    ```
2.  **Install Dependencies**:
    ```bash
    sudo dnf install -y curl git nginx tar policycoreutils-python-utils
    ```
3.  **Install Node.js v20**:
    ```bash
    curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
    sudo dnf install -y nodejs
    ```
4.  **Firewall Configuration**:
    ```bash
    sudo firewall-cmd --permanent --add-service=http
    sudo firewall-cmd --permanent --add-service=https
    sudo firewall-cmd --reload
    ```

#### B. Ubuntu 24.04 LTS

1.  **Update System**:
    ```bash
    sudo apt update && sudo apt upgrade -y
    ```
2.  **Install Dependencies**:
    ```bash
    sudo apt install -y curl git nginx tar
    ```
3.  **Install Node.js v20**:
    ```bash
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
    ```
4.  **Firewall Configuration (UFW)**:
    ```bash
    sudo ufw allow 'Nginx Full'
    ```

---

### 📦 Build & Deploy (Common Steps)

After installing dependencies (Manual Method), proceed with the build:

1.  **Install NPM Packages**:
    ```bash
    cd /path/to/csir-serc-portal
    npm ci
    ```
2.  **Build Production Artifacts**:
    ```bash
    npm run build
    ```
    *This creates a `dist` folder.*
3.  **Deploy to Web Root**:
    ```bash
    sudo mkdir -p /var/www/csir-portal
    sudo cp -r dist/* /var/www/csir-portal/
    ```
4.  **Set Permissions**:
    *   **RHEL/Rocky**: `sudo chown -R nginx:nginx /var/www/csir-portal`
    *   **Ubuntu**: `sudo chown -R www-data:www-data /var/www/csir-portal`
    
    ```bash
    sudo chmod -R 755 /var/www/csir-portal
    ```
5.  **SELinux Contexts (RHEL/Rocky/Alma)**:
    ```bash
    sudo chcon -R -t httpd_sys_content_t /var/www/csir-portal
    ```

---

### 🌐 Nginx Configuration

Create `/etc/nginx/conf.d/csir-portal.conf`:

```nginx
server {
    listen 80;
    server_name _; # Replace with domain name

    root /var/www/csir-portal;
    index index.html;

    # GIGW 3.0 Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Content-Security-Policy "default-src 'self' https: data: 'unsafe-inline';" always;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Optimization
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;
}
```

Restart Nginx:
```bash
sudo systemctl enable nginx
sudo systemctl restart nginx
```

---

## 📁 Project Structure

*   `src/` - Source code
    *   `components/` - Reusable UI components
    *   `context/` - State management (Posts, Config)
    *   `pages/` - Application Views
    *   `types.ts` - TypeScript Interfaces
*   `deploy.sh` - Automated Deployment Script
*   `backup_db.sh` - Database Backup Script
*   `drive_backup.py` - Google Drive Code Backup Script
*   `DATABASE.md` - Database Schema
*   `vite.config.ts` - Build configuration
*   `metadata.json` - App metadata and permissions

---

## ❓ Troubleshooting

1.  **403 Forbidden**: Check file permissions (`chmod 755`) and SELinux context (`chcon`).
2.  **404 on Refresh**: Ensure `try_files $uri $uri/ /index.html;` exists in Nginx config.
3.  **Build Fails**: Ensure Node.js version is >= 18 (`node -v`).

## 📧 Support
For installation support, contact the ICT Division at `ict.serc@csir.res.in`.