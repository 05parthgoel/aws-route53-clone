from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from datetime import datetime

# --- Auth Schemas ---
class UserLogin(BaseModel):
    username: str
    password: str
    aws_account_id: Optional[str] = "1234-5678-9012"

class UserResponse(BaseModel):
    id: int
    aws_account_id: str
    username: str

    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

# --- DNS Record Schemas ---
class DNSRecordBase(BaseModel):
    name: str
    type: str
    ttl: int = 300
    records: List[str] # List of record values, e.g. ["192.168.1.1"]
    routing_policy: str = "Simple"
    weight: Optional[int] = None
    set_identifier: Optional[str] = None
    health_check_id: Optional[str] = None

class DNSRecordCreate(DNSRecordBase):
    pass

class DNSRecordUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    ttl: Optional[int] = None
    records: Optional[List[str]] = None
    routing_policy: Optional[str] = None
    weight: Optional[int] = None
    set_identifier: Optional[str] = None
    health_check_id: Optional[str] = None

class DNSRecordResponse(BaseModel):
    id: str
    hosted_zone_id: str
    name: str
    type: str
    ttl: int
    records: List[str]
    routing_policy: str
    weight: Optional[int] = None
    set_identifier: Optional[str] = None
    health_check_id: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class BulkDeleteRecords(BaseModel):
    record_ids: List[str]

# --- Hosted Zone Schemas ---
class HostedZoneCreate(BaseModel):
    name: str
    type: str = "Public" # Public or Private
    comment: Optional[str] = ""
    vpc_id: Optional[str] = None
    vpc_region: Optional[str] = None

class HostedZoneUpdate(BaseModel):
    comment: Optional[str] = None

class HostedZoneResponse(BaseModel):
    id: str
    name: str
    type: str
    comment: Optional[str] = None
    vpc_id: Optional[str] = None
    vpc_region: Optional[str] = None
    record_count: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class HostedZoneDetailResponse(HostedZoneResponse):
    records: List[DNSRecordResponse] = []

# --- BIND Import / Export Schemas ---
class BINDImportRequest(BaseModel):
    zone_content: str

class ExportFormatResponse(BaseModel):
    format: str
    content: str
