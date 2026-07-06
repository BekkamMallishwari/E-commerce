-- Crawler Verification Logs
CREATE TABLE IF NOT EXISTS crawler_verification_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    ip_address VARCHAR(45) NOT NULL,
    user_agent VARCHAR(255),
    crawler_type VARCHAR(50),
    is_verified BOOLEAN DEFAULT FALSE,
    confidence INT DEFAULT 0,
    flags JSON,
    details JSON,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_ip (ip_address),
    INDEX idx_crawler (crawler_type),
    INDEX idx_verified (is_verified),
    INDEX idx_timestamp (timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Blocked IPs
CREATE TABLE IF NOT EXISTS blocked_ips (
    id INT PRIMARY KEY AUTO_INCREMENT,
    ip_address VARCHAR(45) UNIQUE NOT NULL,
    reason TEXT,
    blocked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    unblocked_at DATETIME,
    unblock_reason TEXT,
    INDEX idx_ip (ip_address),
    INDEX idx_blocked (blocked_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Crawler Verification Dashboard View
CREATE VIEW crawler_verification_dashboard AS
SELECT 
    DATE(timestamp) as date,
    COUNT(*) as total_requests,
    SUM(CASE WHEN is_verified = 1 THEN 1 ELSE 0 END) as verified_requests,
    SUM(CASE WHEN is_verified = 0 THEN 1 ELSE 0 END) as suspicious_requests,
    AVG(confidence) as avg_confidence,
    COUNT(DISTINCT ip_address) as unique_ips,
    COUNT(DISTINCT crawler_type) as unique_crawlers,
    (SUM(CASE WHEN is_verified = 1 THEN 1 ELSE 0 END) / COUNT(*)) * 100 as verification_rate
FROM crawler_verification_logs
GROUP BY DATE(timestamp)
ORDER BY date DESC;