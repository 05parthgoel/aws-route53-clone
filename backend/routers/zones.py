from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid
import json
import database
import models
import schemas
from bind_parser import export_bind_zone

router = APIRouter(prefix="/api/zones", tags=["Hosted Zones"])

def generate_zone_id() -> str:
    # AWS Route 53 format: Z + 12 alphanumeric upper-case chars
    return "Z" + uuid.uuid4().hex[:12].upper()

def generate_record_id() -> str:
    return "R" + uuid.uuid4().hex[:12].upper()

@router.get("", response_model=List[schemas.HostedZoneResponse])
def get_hosted_zones(
    search: Optional[str] = None,
    zone_type: Optional[str] = None,
    db: Session = Depends(database.get_db)
):
    query = db.query(models.HostedZone)
    if search:
        query = query.filter(models.HostedZone.name.ilike(f"%{search}%"))
    if zone_type and zone_type != "All":
        query = query.filter(models.HostedZone.type == zone_type)

    zones = query.order_by(models.HostedZone.created_at.desc()).all()
    return zones

@router.post("", response_model=schemas.HostedZoneResponse, status_code=status.HTTP_201_CREATED)
def create_hosted_zone(
    zone_in: schemas.HostedZoneCreate,
    db: Session = Depends(database.get_db)
):
    # Normalize zone name
    zone_name = zone_in.name.strip().lower()
    
    # Check if zone name already exists
    existing = db.query(models.HostedZone).filter(models.HostedZone.name == zone_name).first()
    if existing:
        raise HTTPException(
            status_code=400,
            detail=f"Hosted zone '{zone_name}' already exists with ID {existing.id}."
        )

    zone_id = generate_zone_id()
    new_zone = models.HostedZone(
        id=zone_id,
        name=zone_name,
        type=zone_in.type,
        comment=zone_in.comment,
        vpc_id=zone_in.vpc_id,
        vpc_region=zone_in.vpc_region
    )
    db.add(new_zone)
    db.commit()

    # Automatically add standard Route 53 default NS and SOA records
    ns_servers = [
        f"ns-1024.awsdns-00.org.",
        f"ns-512.awsdns-00.com.",
        f"ns-1536.awsdns-00.co.uk.",
        f"ns-0.awsdns-00.net."
    ]
    ns_record = models.DNSRecord(
        id=generate_record_id(),
        hosted_zone_id=zone_id,
        name=zone_name,
        type="NS",
        ttl=172800,
        records=json.dumps(ns_servers),
        routing_policy="Simple"
    )
    
    soa_val = [f"ns-1024.awsdns-00.org. awsdns-hostmaster.amazon.com. 1 7200 900 1209600 86400"]
    soa_record = models.DNSRecord(
        id=generate_record_id(),
        hosted_zone_id=zone_id,
        name=zone_name,
        type="SOA",
        ttl=900,
        records=json.dumps(soa_val),
        routing_policy="Simple"
    )

    db.add(ns_record)
    db.add(soa_record)
    db.commit()
    db.refresh(new_zone)

    return new_zone

@router.get("/{zone_id}", response_model=schemas.HostedZoneDetailResponse)
def get_hosted_zone_detail(zone_id: str, db: Session = Depends(database.get_db)):
    zone = db.query(models.HostedZone).filter(models.HostedZone.id == zone_id).first()
    if not zone:
        raise HTTPException(status_code=404, detail="Hosted zone not found")

    # Format DNS record JSON string into array for response
    records_res = []
    for r in zone.records:
        try:
            val_list = json.loads(r.records)
        except Exception:
            val_list = [v.strip() for v in r.records.split("\n") if v.strip()]
        
        records_res.append(schemas.DNSRecordResponse(
            id=r.id,
            hosted_zone_id=r.hosted_zone_id,
            name=r.name,
            type=r.type,
            ttl=r.ttl,
            records=val_list,
            routing_policy=r.routing_policy,
            weight=r.weight,
            set_identifier=r.set_identifier,
            health_check_id=r.health_check_id,
            created_at=r.created_at
        ))

    return schemas.HostedZoneDetailResponse(
        id=zone.id,
        name=zone.name,
        type=zone.type,
        comment=zone.comment,
        vpc_id=zone.vpc_id,
        vpc_region=zone.vpc_region,
        record_count=len(zone.records),
        created_at=zone.created_at,
        records=records_res
    )

@router.put("/{zone_id}", response_model=schemas.HostedZoneResponse)
def update_hosted_zone(
    zone_id: str,
    zone_update: schemas.HostedZoneUpdate,
    db: Session = Depends(database.get_db)
):
    zone = db.query(models.HostedZone).filter(models.HostedZone.id == zone_id).first()
    if not zone:
        raise HTTPException(status_code=404, detail="Hosted zone not found")

    if zone_update.comment is not None:
        zone.comment = zone_update.comment

    db.commit()
    db.refresh(zone)
    return zone

@router.delete("/{zone_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_hosted_zone(zone_id: str, db: Session = Depends(database.get_db)):
    zone = db.query(models.HostedZone).filter(models.HostedZone.id == zone_id).first()
    if not zone:
        raise HTTPException(status_code=404, detail="Hosted zone not found")

    db.delete(zone)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)

@router.get("/{zone_id}/export/bind")
def export_zone_bind(zone_id: str, db: Session = Depends(database.get_db)):
    zone = db.query(models.HostedZone).filter(models.HostedZone.id == zone_id).first()
    if not zone:
        raise HTTPException(status_code=404, detail="Hosted zone not found")

    bind_text = export_bind_zone(zone.name, zone.records)
    return Response(content=bind_text, media_type="text/plain")

@router.get("/{zone_id}/export/json")
def export_zone_json(zone_id: str, db: Session = Depends(database.get_db)):
    zone = db.query(models.HostedZone).filter(models.HostedZone.id == zone_id).first()
    if not zone:
        raise HTTPException(status_code=404, detail="Hosted zone not found")

    records_data = []
    for r in zone.records:
        try:
            val_list = json.loads(r.records)
        except Exception:
            val_list = [r.records]
        records_data.append({
            "name": r.name,
            "type": r.type,
            "ttl": r.ttl,
            "records": val_list,
            "routing_policy": r.routing_policy
        })

    return {
        "hosted_zone_id": zone.id,
        "name": zone.name,
        "type": zone.type,
        "records": records_data
    }
