# Backup & Disaster Recovery Architecture (DRP)

**Document Version:** 1.0.0  
**Status:** Authoritative Operational Runbook  
**Target Environment:** BDT ~40,000 MVP $\rightarrow$ BDT 600,000+ Production Scale  

---

## 1. Backup Strategy Overview

This e-commerce platform utilizes two stateful components that require coordinated backup and recovery:
1. **MySQL 8.0 Database (`ecommerce_db`)**: Stores all authoritative financial records, orders, inventory stock logs, catalog items, and customer orders.
2. **Local Media Storage (`uploads/`)**: Stores immutable product images uploaded by administrators.

---

## 2. Database Backup Procedures

### 2.1 Daily Logical Dump (`mysqldump`)
A daily full logical backup must be executed during low-traffic hours (e.g. 03:00 UTC+6):

```bash
#!/usr/bin/env bash
set -euo pipefail

BACKUP_DIR="/var/backups/mysql"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/ecommerce_db_${TIMESTAMP}.sql.gz"

mkdir -p "${BACKUP_DIR}"

# Single-transaction ensures consistent snapshot without locking tables in InnoDB
mysqldump \
  --host="${DB_HOST:-localhost}" \
  --port="${DB_PORT:-3306}" \
  --user="${DB_USER}" \
  --password="${DB_PASSWORD}" \
  --single-transaction \
  --quick \
  --routines \
  --triggers \
  --default-character-set=utf8mb4 \
  ecommerce_db | gzip -9 > "${BACKUP_FILE}"

echo "Backup created successfully: ${BACKUP_FILE}"
```

### 2.2 Point-In-Time Recovery (PITR) via Binary Logs
MySQL binary logging (`binlog`) must be enabled in `my.cnf`:
```ini
[mysqld]
log-bin = mysql-bin
binlog_format = ROW
binlog_expire_logs_seconds = 604800 # 7 days retention
```
Binary logs allow rolling forward from any daily full dump to the exact second before an incident.

---

## 3. Media Storage Backup

The `uploads/` directory contains generated UUID filenames (`{Guid:N}.{ext}`) which are immutable once written.

### Incremental Synchronization
```bash
rsync -avz --delete \
  /app/uploads/ \
  /var/backups/media/uploads/
```

---

## 4. Disaster Recovery & Restoration Runbook

### 4.1 Restoring Full Database
1. Stop the application backend to prevent partial writes:
   ```bash
   systemctl stop ecommerce-api
   ```
2. Unpack and restore the database dump:
   ```bash
   gunzip < /var/backups/mysql/ecommerce_db_YYYYMMDD_HHMMSS.sql.gz | mysql -u "${DB_USER}" -p ecommerce_db
   ```
3. If point-in-time replay is necessary, apply binary logs:
   ```bash
   mysqlbinlog --start-datetime="2026-09-26 03:00:00" --stop-datetime="2026-09-26 14:15:00" \
     /var/log/mysql/mysql-bin.00000* | mysql -u "${DB_USER}" -p ecommerce_db
   ```
4. Verify table integrity:
   ```sql
   CHECK TABLE cat_products, inv_stock_items, ord_orders, pay_payments;
   ```
5. Restart application backend:
   ```bash
   systemctl start ecommerce-api
   ```

### 4.2 Recovery Time Objective (RTO) & Recovery Point Objective (RPO)
* **RTO (Time to restore service):** $< 30$ minutes.
* **RPO (Maximum data loss window):** $< 5$ minutes with active binary logging.
