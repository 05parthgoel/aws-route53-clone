from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    aws_account_id = Column(String, default="1234-5678-9012")
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

class HostedZone(Base):
    __tablename__ = "hosted_zones"

    id = Column(String, primary_key=True, index=True) # AWS style ID like Z019283748392
    name = Column(String, index=True, nullable=False)
    type = Column(String, default="Public") # Public or Private
    comment = Column(Text, nullable=True)
    vpc_id = Column(String, nullable=True)
    vpc_region = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationship to DNS records
    records = relationship("DNSRecord", back_populates="hosted_zone", cascade="all, delete-orphan")

    @property
    def record_count(self):
        return len(self.records)

class DNSRecord(Base):
    __tablename__ = "dns_records"

    id = Column(String, primary_key=True, index=True) # e.g. R019283748392
    hosted_zone_id = Column(String, ForeignKey("hosted_zones.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, index=True, nullable=False)
    type = Column(String, nullable=False) # A, AAAA, CNAME, TXT, MX, NS, PTR, SRV, CAA
    ttl = Column(Integer, default=300)
    records = Column(Text, nullable=False) # Store target values (new line separated or JSON string)
    routing_policy = Column(String, default="Simple") # Simple, Weighted, Latency, Failover, Geolocation, Multi-value
    weight = Column(Integer, nullable=True)
    set_identifier = Column(String, nullable=True)
    health_check_id = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    hosted_zone = relationship("HostedZone", back_populates="records")
