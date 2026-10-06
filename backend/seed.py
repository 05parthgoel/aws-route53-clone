import json
import uuid
from database import SessionLocal, engine, Base
import models

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Check if user exists
    user = db.query(models.User).first()
    if not user:
        user = models.User(
            username="aws-admin",
            aws_account_id="1234-5678-9012",
            hashed_password="password123"
        )
        db.add(user)
        db.commit()

    # Check if hosted zones exist
    if db.query(models.HostedZone).count() == 0:
        # Zone 1: example.com
        zone1_id = "Z0" + uuid.uuid4().hex[:11].upper()
        zone1 = models.HostedZone(
            id=zone1_id,
            name="example.com",
            type="Public",
            comment="Primary production domain for Example Corp"
        )
        db.add(zone1)
        db.commit()

        # Records for example.com
        records1 = [
            models.DNSRecord(
                id="R0" + uuid.uuid4().hex[:11].upper(),
                hosted_zone_id=zone1_id,
                name="example.com",
                type="NS",
                ttl=172800,
                records=json.dumps([
                    "ns-1024.awsdns-00.org.",
                    "ns-512.awsdns-00.com.",
                    "ns-1536.awsdns-00.co.uk.",
                    "ns-0.awsdns-00.net."
                ]),
                routing_policy="Simple"
            ),
            models.DNSRecord(
                id="R0" + uuid.uuid4().hex[:11].upper(),
                hosted_zone_id=zone1_id,
                name="example.com",
                type="SOA",
                ttl=900,
                records=json.dumps(["ns-1024.awsdns-00.org. awsdns-hostmaster.amazon.com. 1 7200 900 1209600 86400"]),
                routing_policy="Simple"
            ),
            models.DNSRecord(
                id="R0" + uuid.uuid4().hex[:11].upper(),
                hosted_zone_id=zone1_id,
                name="example.com",
                type="A",
                ttl=300,
                records=json.dumps(["198.51.100.1", "198.51.100.2"]),
                routing_policy="Simple"
            ),
            models.DNSRecord(
                id="R0" + uuid.uuid4().hex[:11].upper(),
                hosted_zone_id=zone1_id,
                name="api.example.com",
                type="A",
                ttl=60,
                records=json.dumps(["203.0.113.50"]),
                routing_policy="Weighted",
                weight=100,
                set_identifier="US-East-Primary"
            ),
            models.DNSRecord(
                id="R0" + uuid.uuid4().hex[:11].upper(),
                hosted_zone_id=zone1_id,
                name="www.example.com",
                type="CNAME",
                ttl=300,
                records=json.dumps(["example.com"]),
                routing_policy="Simple"
            ),
            models.DNSRecord(
                id="R0" + uuid.uuid4().hex[:11].upper(),
                hosted_zone_id=zone1_id,
                name="example.com",
                type="MX",
                ttl=3600,
                records=json.dumps(["10 mail.example.com.", "20 backupmail.example.com."]),
                routing_policy="Simple"
            ),
            models.DNSRecord(
                id="R0" + uuid.uuid4().hex[:11].upper(),
                hosted_zone_id=zone1_id,
                name="example.com",
                type="TXT",
                ttl=300,
                records=json.dumps(["\"v=spf1 include:_spf.google.com ~all\""]),
                routing_policy="Simple"
            ),
            models.DNSRecord(
                id="R0" + uuid.uuid4().hex[:11].upper(),
                hosted_zone_id=zone1_id,
                name="example.com",
                type="CAA",
                ttl=3600,
                records=json.dumps(["0 issue \"amazon.com\""]),
                routing_policy="Simple"
            )
        ]
        for r in records1:
            db.add(r)

        # Zone 2: internal.corp.aws (Private Zone)
        zone2_id = "Z0" + uuid.uuid4().hex[:11].upper()
        zone2 = models.HostedZone(
            id=zone2_id,
            name="internal.corp.aws",
            type="Private",
            comment="Internal VPC private hosted zone",
            vpc_id="vpc-0a1b2c3d4e5f67890",
            vpc_region="us-east-1"
        )
        db.add(zone2)
        db.commit()

        records2 = [
            models.DNSRecord(
                id="R0" + uuid.uuid4().hex[:11].upper(),
                hosted_zone_id=zone2_id,
                name="db.internal.corp.aws",
                type="A",
                ttl=300,
                records=json.dumps(["10.0.1.45"]),
                routing_policy="Simple"
            ),
            models.DNSRecord(
                id="R0" + uuid.uuid4().hex[:11].upper(),
                hosted_zone_id=zone2_id,
                name="redis.internal.corp.aws",
                type="CNAME",
                ttl=60,
                records=json.dumps(["cache.internal.corp.aws"]),
                routing_policy="Simple"
            )
        ]
        for r in records2:
            db.add(r)

        db.commit()

    db.close()

if __name__ == "__main__":
    seed_database()
    print("Database seeded successfully!")
