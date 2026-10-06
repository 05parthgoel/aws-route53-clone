import pytest
from fastapi.testclient import TestClient
from main import app
import bind_parser

client = TestClient(app)

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_auth_login():
    response = client.post("/api/auth/login", json={
        "username": "testuser",
        "password": "password123",
        "aws_account_id": "1111-2222-3333"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["username"] == "testuser"

def test_get_hosted_zones():
    response = client.get("/api/zones")
    assert response.status_code == 200
    zones = response.json()
    assert isinstance(zones, list)
    assert len(zones) >= 1

def test_create_and_delete_hosted_zone():
    # Create zone
    create_res = client.post("/api/zones", json={
        "name": "testzone-pytest.com",
        "type": "Public",
        "comment": "Created during pytest execution"
    })
    assert create_res.status_code == 201
    zone = create_res.json()
    zone_id = zone["id"]
    assert zone["name"] == "testzone-pytest.com"

    # Get detail
    detail_res = client.get(f"/api/zones/{zone_id}")
    assert detail_res.status_code == 200
    detail = detail_res.json()
    assert len(detail["records"]) == 2 # NS and SOA auto-created!

    # Create DNS Record
    rec_res = client.post(f"/api/zones/{zone_id}/records", json={
        "name": "app.testzone-pytest.com",
        "type": "A",
        "ttl": 300,
        "records": ["1.2.3.4"],
        "routing_policy": "Simple"
    })
    assert rec_res.status_code == 201
    rec = rec_res.json()
    rec_id = rec["id"]

    # Delete DNS Record
    del_rec = client.delete(f"/api/records/{rec_id}")
    assert del_rec.status_code == 204

    # Delete Zone
    del_zone = client.delete(f"/api/zones/{zone_id}")
    assert del_zone.status_code == 204

def test_bind_parser_and_export():
    sample_bind = """
$ORIGIN example.org.
$TTL 3600
@ IN A 192.0.2.1
www IN CNAME example.org.
mail 1800 IN A 192.0.2.2
"""
    records = bind_parser.parse_bind_zone(sample_bind, "example.org")
    assert len(records) >= 2
    types = [r["type"] for r in records]
    assert "A" in types
    assert "CNAME" in types
