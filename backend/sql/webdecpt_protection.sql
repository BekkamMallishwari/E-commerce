-- WebDecept Validation Logs
CREATE TABLE IF NOT EXISTS webdecept_validation_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    url VARCHAR(2000) NOT NULL,
    trust_score INT DEFAULT 0,
    flags JSON,
    warnings JSON,
    context JSON,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_url (url(255)),
    INDEX idx_trust (trust_score),
    INDEX idx_timestamp (timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Domain Reputation
CREATE TABLE IF NOT EXISTS domain_reputation (
    id INT PRIMARY KEY AUTO_INCREMENT,
    domain VARCHAR(255) UNIQUE NOT NULL,
    trust_score INT DEFAULT 100,
    violation_count INT DEFAULT 0,
    penalty INT DEFAULT 0,
    last_checked DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_domain (domain),
    INDEX idx_trust (trust_score)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Suspicious Redirects
CREATE TABLE IF NOT EXISTS suspicious_redirects (
    id INT PRIMARY KEY AUTO_INCREMENT,
    from_url VARCHAR(2000),
    to_url VARCHAR(2000),
    reason TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_from (from_url(255)),
    INDEX idx_timestamp (timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;