from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid
import json
import database
import models
import schemas
from bind_parser import parse_bind_zone

router = APIRouter(prefix="/api", tags=["DNS Records"])

def generate_record_id() -> str:
    return "R" + uuid.uuid4().hex[:12].upper()

@router.get("/zones/{zone_id}/records", response_model=List[schemas.DNSRecordResponse])
def get_zone_records(
    zone_id: str,
    search: Optional[str] = None,
    record_type: Optional[str] = None,
    db: Session = Depends(database.get_db)
):
    zone = db.query(models.HostedZone).filter(models.HostedZone.id == zone_id).first()
    if not zone:
        raise HTTPException(status_code=404, detail="Hosted zone not found")

    query = db.query(models.DNSRecord).filter(models.DNSRecord.hosted_zone_id == zone_id)

    if search:
        query = query.filter(models.DNSRecord.name.ilike(f"%{search}%"))
    if record_type and record_type != "All":
        query = query.filter(models.DNSRecord.type == record_type)

    records = query.order_by(models.DNSRecord.name.asc()).all()

    res = []
    for r in records:
        try:
            val_list = json.loads(r.records)
        except Exception:
            val_list = [v.strip() for v in r.records.split("\n") if v.strip()]

        res.append(schemas.DNSRecordResponse(
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
    return res

@router.post("/zones/{zone_id}/records", response_model=schemas.DNSRecordResponse, status_code=status.HTTP_201_CREATED)
def create_dns_record(
    zone_id: str,
    rec_in: schemas.DNSRecordCreate,
    db: Session = Depends(database.get_db)
):
    zone = db.query(models.HostedZone).filter(models.HostedZone.id == zone_id).first()
    if not zone:
        raise HTTPException(status_code=404, detail="Hosted zone not found")

    # Ensure record name includes domain suffix if relative
    rec_name = rec_in.name.strip()
    if not rec_name.endswith(zone.name):
        if rec_name == "" or rec_name == "@":
            rec_name = zone.name
        else:
            rec_name = f"{rec_name}.{zone.name}"

    rec_id = generate_record_id()
    new_record = models.DNSRecord(
        id=rec_id,
        hosted_zone_id=zone_id,
        name=rec_name,
        type=rec_in.type.upper(),
        ttl=rec_in.ttl,
        records=json.dumps(rec_in.records),
        routing_policy=rec_in.routing_policy,
        weight=rec_in.weight,
        set_identifier=rec_in.set_identifier,
        health_check_id=rec_in.health_check_id
    )

    db.add(new_record)
    db.commit()
    db.refresh(new_record)

    return schemas.DNSRecordResponse(
        id=new_record.id,
        hosted_zone_id=new_record.hosted_zone_id,
        name=new_record.name,
        type=new_record.type,
        ttl=new_record.ttl,
        records=rec_in.records,
        routing_policy=new_record.routing_policy,
        weight=new_record.weight,
        set_identifier=new_record.set_identifier,
        health_check_id=new_record.health_check_id,
        created_at=new_record.created_at
    )

@router.get("/records/{record_id}", response_model=schemas.DNSRecordResponse)
def get_dns_record(record_id: str, db: Session = Depends(database.get_db)):
    r = db.query(models.DNSRecord).filter(models.DNSRecord.id == record_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="DNS Record not found")

    try:
        val_list = json.loads(r.records)
    except Exception:
        val_list = [v.strip() for v in r.records.split("\n") if v.strip()]

    return schemas.DNSRecordResponse(
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
    )

@router.put("/records/{record_id}", response_model=schemas.DNSRecordResponse)
def update_dns_record(
    record_id: str,
    rec_update: schemas.DNSRecordUpdate,
    db: Session = Depends(database.get_db)
):
    r = db.query(models.DNSRecord).filter(models.DNSRecord.id == record_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="DNS Record not found")

    if rec_update.name is not None:
        r.name = rec_update.name
    if rec_update.type is not None:
        r.type = rec_update.type.upper()
    if rec_update.ttl is not None:
        r.ttl = rec_update.ttl
    if rec_update.records is not None:
        r.records = json.dumps(rec_update.records)
    if rec_update.routing_policy is not None:
        r.routing_policy = rec_update.routing_policy
    if rec_update.weight is not None:
        r.weight = rec_update.weight
    if rec_update.set_identifier is not None:
        r.set_identifier = rec_update.set_identifier
    if rec_update.health_check_id is not None:
        r.health_check_id = rec_update.health_check_id

    db.commit()
    db.refresh(r)

    val_list = json.loads(r.records) if r.records else []
    return schemas.DNSRecordResponse(
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
    )

@router.delete("/records/{record_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_dns_record(record_id: str, db: Session = Depends(database.get_db)):
    r = db.query(models.DNSRecord).filter(models.DNSRecord.id == record_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="DNS Record not found")

    db.delete(r)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)

@router.post("/records/bulk-delete", status_code=status.HTTP_200_OK)
def bulk_delete_records(req: schemas.BulkDeleteRecords, db: Session = Depends(database.get_db)):
    db.query(models.DNSRecord).filter(models.DNSRecord.id.in_(req.record_ids)).delete(synchronize_session=False)
    db.commit()
    return {"message": f"Successfully deleted {len(req.record_ids)} DNS records."}

@router.post("/zones/{zone_id}/import/bind")
def import_bind_records(
    zone_id: str,
    req: schemas.BINDImportRequest,
    db: Session = Depends(database.get_db)
):
    zone = db.query(models.HostedZone).filter(models.HostedZone.id == zone_id).first()
    if not zone:
        raise HTTPException(status_code=404, detail="Hosted zone not found")

    parsed_records = parse_bind_zone(req.zone_content, zone.name)
    created_count = 0

    for rec in parsed_records:
        rec_id = generate_record_id()
        new_rec = models.DNSRecord(
            id=rec_id,
            hosted_zone_id=zone_id,
            name=rec["name"],
            type=rec["type"],
            ttl=rec["ttl"],
            records=json.dumps(rec["records"]),
            routing_policy=rec.get("routing_policy", "Simple")
        )
        db.add(new_rec)
        created_count += 1

    db.commit()
    return {"message": f"Successfully imported {created_count} DNS records from BIND zone file."}
